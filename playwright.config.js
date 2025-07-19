// @ts-check
const { defineConfig } = require('@playwright/test');

/**
 * Playwright Test Configuration
 * For more information: https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  timeout: 30 * 1000, // 30 seconds
  retries: 1,
  reporter: 'html',
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 0,
    ignoreHTTPSErrors: true,
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    baseURL: 'https://www.ebay.com/',
  },
});
