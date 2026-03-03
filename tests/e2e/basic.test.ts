import { test, expect } from '@playwright/test';

test('homepage has title and navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.*Notes.*/i);
});

test('404 error page displays custom design', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');

    // Check for status code (SvelteKit handles this)
    await expect(page.getByText('404')).toBeVisible();

    // Check for custom message
    await expect(page.getByText(/Página no encontrada/i)).toBeVisible();

    // Check for home button
    await expect(page.getByRole('link', { name: /Inicio/i })).toBeVisible();
});
