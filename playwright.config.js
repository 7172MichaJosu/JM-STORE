import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://localhost:4175', locale: 'es-PE', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: { command: 'node tests/fixtures/servidor-web.mjs', url: 'http://localhost:4175', reuseExistingServer: false },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', testMatch: /basico.spec.js/, use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', testMatch: /basico.spec.js/, use: { ...devices['Desktop Safari'] } },
  ],
});
