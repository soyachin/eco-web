import { test, expect } from '@playwright/test';

test.describe('Core Components Verification', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('Search functionality works on build', async ({ page }) => {
        // Open search with Ctrl+K
        await page.keyboard.press('Control+KeyK');
        const modal = page.locator('.search-modal');
        await expect(modal).toBeVisible();

        // Type search term
        const input = page.locator('input[placeholder*="Busca notas"]');
        await input.fill('leyendecker');

        // Check for results
        const results = page.locator('.result-item');
        await expect(results.first()).toBeVisible();
        await expect(results.first()).toContainText(/leyendecker/i);

        // Navigate via search
        await results.first().click();
        await expect(page).toHaveURL(/\/leyendecker/);
    });

    test('Table of Contents works on note pages', async ({ page }) => {
        await page.goto('/leyendecker');

        // Verify ToC container exists
        const toc = page.locator('.toc-container');
        await expect(toc).toBeVisible();
        await expect(toc).toContainText(/En esta página/i);

        // Verify some links exist
        const links = page.locator('.toc-link');
        const count = await links.count();
        expect(count).toBeGreaterThan(0);

        // Verify title link is present
        await expect(links.first()).toBeVisible();

        // Click a link and check if hash updates (if applicable)
        // Note: checking hash update depends on implementation
    });

    test('Theme toggle works', async ({ page }) => {
        const themeBtn = page.locator('button[aria-label*="Tema"], .navbar button').last(); // Fallback selector
        const html = page.locator('html');

        const initialTheme = await html.getAttribute('data-theme');
        await themeBtn.click();

        const newTheme = await html.getAttribute('data-theme');
        expect(newTheme).not.toBe(initialTheme);
    });
});
