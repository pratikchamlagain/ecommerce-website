import { defineConfig, devices } from "@playwright/test";
import os from "node:os";
import path from "node:path";

const playwrightOutputDir = path.join(os.tmpdir(), "watchmatrix-playwright-results");

export default defineConfig({
  testDir: "./e2e",
  outputDir: playwrightOutputDir,
  timeout: 45_000,
  expect: {
    timeout: 10_000
  },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry"
  },
  webServer: {
    command: "npm run build && npm run preview -- --host 127.0.0.1 --port 5173",
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
