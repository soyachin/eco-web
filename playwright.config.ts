import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    webServer: {
        command: 'pnpm run build && pnpm run preview',
        port: 4173
    },
    testDir: 'tests/e2e',
    testMatch: /(.+\.)?(test|spec)\.[jt]s/,
    use: {
        baseURL: 'http://localhost:4173'
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] }
        }
    ]
});
