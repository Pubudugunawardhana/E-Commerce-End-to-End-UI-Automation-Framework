// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const env = require('./utils/env');
const { AUTH_FILE } = require('./utils/constants');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  /* Max time per test. Firefox is slower when all browsers run in parallel, so allow 60s instead of the default 30s. */
  timeout: 60_000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL comes from the .env file (or CI environment variables) */
    baseURL: env.baseURL,
    headless: true,
    screenshot: 'only-on-failure', // Capture a screenshot only when a test fails
    video: 'retain-on-failure',    // Keep the video only when a test fails
    trace: 'retain-on-failure',    // Keep the trace file only when a test fails
  },

  projects: [
    /* Logs in once and saves the session to AUTH_FILE before any browser project runs */
    {
      name: 'setup',
      testMatch: /.*\.setup\.js/,
    },

    /* Every browser project starts already logged in, using the saved session */
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
  ],
});
