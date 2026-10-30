import { defineConfig } from "@playwright/test";

/**
 * A frontend smoke test, not an integration test: the backend is mocked
 * (see e2e/guestFlow.spec.ts), so this needs no API server, no real
 * Token Factory/USDA calls, and no deployed infrastructure - just the
 * dev server rendering the actual app.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://localhost:5173",
  },
  webServer: {
    command: "pnpm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
