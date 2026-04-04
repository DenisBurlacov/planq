import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for PLANQ frontend E2E tests.
 *
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 0 : 1,
  workers: process.env.CI ? 1 : undefined,

  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : [['line']],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    // Webkit skipped for speed — enable when needed
  ],

  /* Start the frontend dev server before running tests */
  webServer: [
    {
      command: 'pnpm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],

  /* Wait for backend health before running tests */
  globalSetup: undefined, // Backend is started externally (docker-compose or CI service)
  expect: {
    timeout: 10_000,
  },
  timeout: 60_000,
});
