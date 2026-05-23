import { test, expect } from '@playwright/test';
import { BASE_URL, gotoLogin } from './sv-helpers';

/**
 * SV Students — Cross-page navigation & performance
 *
 * Covers:
 *   Suite 1 — Cross-page navigation flows
 *   Suite 2 — Performance & page basics
 */

// ─── Suite 1 — Cross-page navigation ─────────────────────────────────────────

test.describe('Cross-page navigation', () => {
  test('"Register here" navigates to Create Account page', async ({ page }) => {
    await gotoLogin(page);
    await page.getByRole('link', { name: /register here/i }).click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible({
      timeout: 10_000,
    });
  });

  test('"Sign in" on register page returns to login', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/register.html`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('link', { name: /sign in/i }).click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible({ timeout: 10_000 });
  });

  test('"Accessibility" footer link leads to accessibility page', async ({ page }) => {
    await gotoLogin(page);
    await page.getByRole('link', { name: /accessibility/i }).click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 8_000 });
  });

  test('"Return to homepage" on accessibility page href is home.html', async ({ page }) => {
    await page.goto(`${BASE_URL}/accessibility.html`, { waitUntil: 'domcontentloaded' });
    const href = await page.locator('a[href*="home.html"]').first().getAttribute('href');
    expect(href).toMatch(/home\.html/);
  });

  test('direct GET /pages/login.html returns < 400', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/pages/login.html`);
    expect(res.status()).toBeLessThan(400);
  });

  test('direct GET /pages/register.html returns < 400', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/pages/register.html`);
    expect(res.status()).toBeLessThan(400);
  });

  test('direct GET /accessibility.html returns < 400', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/accessibility.html`);
    expect(res.status()).toBeLessThan(400);
  });
});

// ─── Suite 2 — Performance & basics ──────────────────────────────────────────

test.describe('Performance & basics', () => {
  test('login page DOM-ready in under 10 s', async ({ page }) => {
    const t0 = Date.now();
    await page.goto(`${BASE_URL}/pages/login.html`, {
      waitUntil: 'domcontentloaded',
      timeout: 10_000,
    });
    expect(Date.now() - t0).toBeLessThan(10_000);
  });

  test('accessibility page DOM-ready in under 10 s', async ({ page }) => {
    const t0 = Date.now();
    await page.goto(`${BASE_URL}/accessibility.html`, {
      waitUntil: 'domcontentloaded',
      timeout: 10_000,
    });
    expect(Date.now() - t0).toBeLessThan(10_000);
  });

  test('Swagger page DOM-ready in under 15 s', async ({ page }) => {
    const t0 = Date.now();
    await page.goto(`${BASE_URL}/docs`, {
      waitUntil: 'domcontentloaded',
      timeout: 15_000,
    });
    expect(Date.now() - t0).toBeLessThan(15_000);
  });

  test('login page has at least one heading element', async ({ page }) => {
    await gotoLogin(page);
    const count = await page.locator('h1, h2, h3').count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('login page has no broken images', async ({ page }) => {
    await gotoLogin(page);
    const broken = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLImageElement>('img'))
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.src),
    );
    expect(broken).toHaveLength(0);
  });

  test('register page has no broken images', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/register.html`, { waitUntil: 'domcontentloaded' });
    const broken = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLImageElement>('img'))
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.src),
    );
    expect(broken).toHaveLength(0);
  });
});
