import { defineConfig } from "@playwright/test";

/**
 * A frontend smoke test, not an integration test: the backend and Supabase
 * are mocked (see e2e/mainFlow.spec.ts), so this needs no API server, no
 * real Token Factory/USDA calls, no Google account, and no deployed
 * infrastructure - just the dev server rendering the actual app.
 *
 * Runs on its own port with a fake Supabase project so it never reuses a
 * local dev server that's pointed at the real one.
 */
const PORT = 5180;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: `http://localhost:${PORT}`,
  },
  webServer: {
    command: `pnpm exec vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    env: {
      VITE_API_BASE_URL: "http://localhost:3000",
      VITE_SUPABASE_URL: "https://e2e-fake.supabase.co",
      VITE_SUPABASE_ANON_KEY: "e2e-fake-anon-key",
    },
  },
});
