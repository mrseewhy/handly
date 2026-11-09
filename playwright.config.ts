import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

/**
 * The test database URL is derived here, not in global-setup, because
 * Playwright builds `webServer.env` before global setup runs. If the app were
 * pointed at DATABASE_URL it would use the demo database and the two would
 * disagree about which rows exist.
 */
function e2eDatabaseUrl(): string {
  if (process.env.E2E_DATABASE_URL) return process.env.E2E_DATABASE_URL;
  const base = process.env.DATABASE_URL;
  if (!base) return base ?? "";
  const url = new URL(base);
  url.pathname = `${url.pathname.replace(/\/$/, "")}_e2e`;
  return url.toString();
}

/**
 * End-to-end tests.
 *
 * These drive the real app against the real database. They create and mutate
 * tickets, so they run against a dedicated `handly_e2e` database (derived from
 * DATABASE_URL) rather than the demo one — see global-setup.ts.
 *
 *   npm run test:e2e          # headless
 *   npm run test:e2e -- --ui  # interactive
 */
export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  // Seed once, then run serially: these tests share one database and each
  // asserts on list counts, which parallel workers would race on.
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: "http://localhost:3300",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    // Dedicated port and DB so a dev server on :3000 is never disturbed.
    command: "npm run dev -- --port 3300",
    url: "http://localhost:3300",
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      BETTER_AUTH_URL: "http://localhost:3300",
      DATABASE_URL: e2eDatabaseUrl(),
      // Tests sign in many times from one IP; the limiter is correct but would
      // make the suite fail for the wrong reason. See lib/rate-limit.ts.
      DISABLE_RATE_LIMIT: "1",
    },
  },
});
