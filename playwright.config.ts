import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

/**
 * Dois projetos independentes:
 *  - web: roda no Chromium contra o TodoMVC
 *  - api: usa apenas o APIRequestContext (não abre navegador)
 *
 * Assim é possível rodar cada "mundo" isoladamente (npm run test:web / test:api).
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'web',
      testDir: './tests/web',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.WEB_BASE_URL ?? 'https://demo.playwright.dev/todomvc/',
      },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: process.env.API_BASE_URL ?? 'https://api.github.com',
        extraHTTPHeaders: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          // Token é OPCIONAL: só serve para fugir do rate limit (60 req/h sem auth).
          ...(process.env.GITHUB_TOKEN
            ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
            : {}),
        },
      },
    },
  ],
});
