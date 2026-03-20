import { test, expect } from '@playwright/test';

test.describe('Theme Switching', () => {
  test('Should switch between Light and Dark mode', async ({ page }) => {
    await page.goto('/');
    
    // Initial theme (system)
    const html = page.locator('html');

    // Click dark mode button
    await page.click('button[aria-label="Dark"], button[aria-label="深色"]');
    await expect(html).toHaveClass(/dark/);
    
    // Click light mode button
    await page.click('button[aria-label="Light"], button[aria-label="浅色"]');
    await expect(html).not.toHaveClass(/dark/);
  });
});