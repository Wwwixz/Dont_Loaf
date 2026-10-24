import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  timeout: 90000,
  expect: { timeout: 10000 },
  workers: 1,
  reporter: 'list',
  use: { baseURL: process.env.DONTLOAF_TEST_URL || 'http://127.0.0.1:4173', viewport: { width: 1440, height: 1000 }, screenshot: 'only-on-failure', trace: 'retain-on-failure', launchOptions: { args: ['--enable-unsafe-swiftshader'] } },
});
