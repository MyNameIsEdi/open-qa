import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config dedicated to sv-students-recommend.onrender.com tests.
 * Run with: npx playwright test --config=playwright.sv-students.config.ts
 */
export default defineConfig({
  testDir: './tests',
  testMatch: '**/sv-students.spec.ts',
  fullyParallel: false,          // Render free tier is slow — run serially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  timeout: 20000,                // 20 s per test (Render cold-start can be slow)
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report/sv-students' }]],

  use: {
    baseURL: 'https://sv-students-recommend.onrender.com',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
