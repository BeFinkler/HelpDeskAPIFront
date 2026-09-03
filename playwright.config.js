import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const backend = process.env.HELPDESK_BACKEND_DIR || path.resolve('../HelpDeskAPIBack');
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  expect: { timeout: 10000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'node --env-file=.local/e2e-api.env src/server.js',
      cwd: backend,
      url: 'http://localhost:3001/health/ready',
      reuseExistingServer: false,
      timeout: 30000,
    },
    {
      command: 'npm run build && npm run preview -- --port 5174',
      url: 'http://localhost:5174',
      reuseExistingServer: false,
      timeout: 60000,
      env: { VITE_API_URL: 'http://localhost:3001/api/v1' },
    },
  ],
});
