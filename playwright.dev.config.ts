import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ path: ".env.e2e", override: true, quiet: true });

const devBaseURL = process.env.E2E_DEV_BASE_URL || process.env.E2E_BASE_URL || "http://127.0.0.1:3000";
const devURL = new URL(devBaseURL);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [["html"], ["list"]],
  use: {
    baseURL: devBaseURL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npm run dev -- --hostname ${devURL.hostname} --port ${devURL.port || "3000"}`,
    url: `${devBaseURL}/login`,
    reuseExistingServer: false,
    timeout: 120 * 1000,
  },
});
