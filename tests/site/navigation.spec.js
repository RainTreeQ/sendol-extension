import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  const pages = [
    { path: '/', title: 'Sendol — Broadcast to All AI at Once' },
    { path: '/privacy', title: 'Privacy Policy' },
    { path: '/terms', title: 'Terms of Service' },
    { path: '/install', title: 'Installation Guide' },
    { path: '/faq', title: 'Frequently Asked Questions' },
    { path: '/changelog', title: 'Changelog' },
    { path: '/contact', title: 'Contact Us' },
  ];

  for (const p of pages) {
    test(`Should navigate to ${p.path} and check title`, async ({ page }) => {
      await page.goto(`${p.path === '/' ? '/' : `/#${p.path.slice(1)}`}`);
      await expect(page.locator('h1').first()).toBeVisible();
      if (p.path !== '/') {
        await expect(page).toHaveTitle(new RegExp(p.title));
      }
    });
  }

  test('Should navigate using Header links', async ({ page }) => {
    await page.goto('/');
    await page.click('text=FAQ');
    await expect(page).toHaveURL(/.*#\/faq/);
    await expect(page.locator('h1').first()).toContainText('Frequently');
  });

  test('Should navigate using Footer links', async ({ page }) => {
    await page.goto('/');
    // Scroll to bottom to ensure footer is visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Click Privacy link
    await page.click('footer >> text=Privacy');
    await expect(page).toHaveURL(/.*#\/privacy/);
    await expect(page.locator('h1').first()).toContainText('Privacy');
  });
});