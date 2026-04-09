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

  const required = ["DATABASE_URL", "JWT_ACCESS_SECRET", "CORS_ORIGIN"];
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

  ok("Environment variables look ready.");
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
  checkMigrations();
  checkBuilds();
  console.log("\n🎉 Pre-deploy checks completed successfully.");
}

main();
