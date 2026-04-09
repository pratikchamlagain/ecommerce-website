import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import dotenv from "dotenv";

const rootDir = path.resolve(process.cwd(), "..");
const backendDir = process.cwd();
const frontendDir = path.resolve(rootDir, "frontend");
const envFile = path.resolve(backendDir, ".env");

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`⚠️  ${message}`);
}

function ok(message) {
  console.log(`✅ ${message}`);
}

function run(command, cwd) {
  execSync(command, {
    cwd,
    stdio: "inherit"
  });
}

function checkEnv() {
  if (!fs.existsSync(envFile)) {
    fail("backend/.env is missing.");
  }

  dotenv.config({ path: envFile });

  const required = ["DATABASE_URL", "JWT_ACCESS_SECRET", "JWT_ACCESS_EXPIRES_IN", "CORS_ORIGIN"];
  for (const key of required) {
    const value = process.env[key];
    if (!value || !value.trim()) {
      fail(`Missing required env var: ${key}`);
    }
  }

  if ((process.env.JWT_ACCESS_SECRET || "").trim().length < 16) {
    warn("JWT_ACCESS_SECRET is shorter than 16 characters. Use a stronger secret before deployment.");
  }

  if ((process.env.CORS_ORIGIN || "").trim() === "*") {
    warn("CORS_ORIGIN is '*'. Restrict it to your production frontend origin before deployment.");
  }

  const originList = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV === "production") {
    const hasInsecureOrigin = originList.some((origin) => origin.startsWith("http://"));
    const hasLocalhost = originList.some((origin) => origin.includes("localhost") || origin.includes("127.0.0.1"));

    if (hasInsecureOrigin || hasLocalhost) {
      warn("Production CORS_ORIGIN should use HTTPS public origins only.");
    }
  }

  const expires = (process.env.JWT_ACCESS_EXPIRES_IN || "").trim().toLowerCase();
  if (expires.endsWith("d")) {
    warn("JWT_ACCESS_EXPIRES_IN is in days; use shorter access token expiry (e.g., 15m or 1h).");
  }

  if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.trim().length < 16) {
    warn("JWT_REFRESH_SECRET is missing or weak. Configure a strong refresh secret before production.");
  }

  ok("Environment variables look ready.");
}

function parseEnvKeys(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  const keys = lines
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => line.split("=")[0].trim())
    .filter(Boolean);

  return new Set(keys);
}

function checkEnvParity() {
  const files = [
    path.resolve(backendDir, ".env.example"),
    path.resolve(backendDir, ".env.staging.example"),
    path.resolve(backendDir, ".env.production.example")
  ];

  const parsed = files.map((file) => ({ file, keys: parseEnvKeys(file) }));
  const missing = parsed.filter((entry) => !entry.keys);

  if (missing.length > 0) {
    fail(`Missing env parity files: ${missing.map((entry) => path.basename(entry.file)).join(", ")}`);
  }

  const [baseline, ...others] = parsed;
  for (const other of others) {
    const baselineOnly = [...baseline.keys].filter((key) => !other.keys.has(key));
    const otherOnly = [...other.keys].filter((key) => !baseline.keys.has(key));

    if (baselineOnly.length > 0 || otherOnly.length > 0) {
      fail(`Env parity mismatch between ${path.basename(baseline.file)} and ${path.basename(other.file)}.`);
    }
  }

  ok("Environment parity check passed (.env.example / staging / production).");
}

function checkMigrations() {
  const migrationDir = path.resolve(backendDir, "prisma", "migrations");
  if (!fs.existsSync(migrationDir)) {
    fail("Prisma migrations directory is missing.");
  }

  const entries = fs.readdirSync(migrationDir, { withFileTypes: true });
  const migrationCount = entries.filter((entry) => entry.isDirectory()).length;

  if (migrationCount === 0) {
    fail("No Prisma migrations found.");
  }

  ok(`Found ${migrationCount} migration folders.`);
}

function checkBuilds() {
  console.log("\nRunning backend Prisma generate...");
  try {
    run("npm run prisma:generate", backendDir);
  } catch (error) {
    const message = String(error?.message || "");
    if (message.includes("EPERM") && message.includes("query_engine-windows.dll.node")) {
      warn("Prisma generate was blocked by a file lock (likely running backend process). Stop API process and re-run for a strict check.");
    } else {
      throw error;
    }
  }

  console.log("\nRunning frontend production build...");
  run("npm run build", frontendDir);

  ok("Build checks passed.");
}

function main() {
  console.log("WatchMatrix pre-deploy check\n");
  checkEnv();
  checkEnvParity();
  checkMigrations();
  checkBuilds();
  console.log("\n🎉 Pre-deploy checks completed successfully.");
}

main();
