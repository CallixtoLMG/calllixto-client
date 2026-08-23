import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ path: ".env.e2e", override: true, quiet: true });

const e2eHost = "127.0.0.1";
const e2ePort = process.env.E2E_STABLE_PORT || "3100";
const baseURL = `http://${e2eHost}:${e2ePort}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [["html"], ["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npm run start:e2e -- --hostname ${e2eHost} --port ${e2ePort}`,
    url: `${baseURL}/login`,
    reuseExistingServer: false,
    timeout: 120 * 1000,
  },
});
