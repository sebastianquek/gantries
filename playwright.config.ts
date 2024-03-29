import type { PlaywrightTestConfig } from "@playwright/test";

import "dotenv/config";
import { devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir: "./src/tests",
  /* Maximum time one test can run for. */
  timeout: 50 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 10000,

    /**
     * https://playwright.dev/docs/test-assertions#locator-assertions-to-have-screenshot-1-option-threshold
     * Increased it to be more lax.
     */
    toHaveScreenshot: {
      threshold: 0.3,
      maxDiffPixelRatio: 0.02,
    },
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",

    /* See https://playwright.dev/docs/trace-viewer */
    trace: "retain-on-failure",

    timezoneId: "Asia/Singapore",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
      testIgnore: /.*.mobile.e2e.test.ts/,
    },

    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
      },
      testIgnore: /.*.mobile.e2e.test.ts/,
    },

    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
      },
      testIgnore: /.*.mobile.e2e.test.ts/,
    },

    /* Test against mobile viewports. */
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 5"],
      },
      testIgnore: /.*.desktop.e2e.test.ts/,
    },
    {
      name: "mobile-safari",
      use: {
        ...devices["iPhone 12"],
      },
      testIgnore: /.*.desktop.e2e.test.ts/,
    },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: {
    //     channel: 'msedge',
    //   },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: {
    //     channel: 'chrome',
    //   },
    // },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: "test-results/",

  /* Run your local dev server before starting the tests */
  // webServer: process.env.PLAYWRIGHT_BASE_URL
  //   ? undefined
  //   : {
  //       command: "npm start",
  //       port: 3000,
  //     },
};

export default config;
