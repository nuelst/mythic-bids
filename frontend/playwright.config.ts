import { defineConfig } from '@playwright/test'

const PORT = 4173
const API_PORT = 3999

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  retries: 0,
  timeout: 60_000,
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    locale: 'pt-PT',
  },
  webServer: [
    {
      command: `E2E_API_PORT=${API_PORT} node e2e/mock-api.mjs`,
      url: `http://127.0.0.1:${API_PORT}/health`,
      reuseExistingServer: false,
    },
    {
      command: `VITE_API_URL=http://127.0.0.1:${API_PORT} pnpm dev --port ${PORT} --strictPort`,
      url: `http://127.0.0.1:${PORT}`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
})
