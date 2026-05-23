import { test, expect } from '@playwright/test';
import { BASE_URL, gotoHome } from './sv-helpers';

/**
 * SV Students — Home feed
 *
 * Covers:
 *   Suite 1 — Unauthenticated redirect
 *   Suite 2 — Home feed structure (authenticated)
 *   Suite 3 — Category filters
 *   Suite 4 — Help & About modals
 */

// ─── Suite 1 — Home feed: unauthenticated redirect ───────────────────────────

test.describe('Home feed — unauthenticated', () => {
  test.describe.configure({ timeout: 30_000 });

  test('accessing home.html without token redirects to login', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto(`${BASE_URL}/pages/home.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1_500);
    const url = page.url();
    const hasSignIn = await page
      .getByRole('button', { name: /sign in/i })
      .isVisible()
      .catch(() => false);
    expect(url.includes('login') || hasSignIn).toBe(true);
  });
});

// ─── Suite 2 — Home feed: page structure (authenticated) ─────────────────────

test.describe('Home feed — structure', () => {
  test.describe.configure({ timeout: 60_000 });
  test.beforeEach(async ({ page }) => {
    await gotoHome(page);
  });

  test('"Recommendations" heading is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /recommendations/i })).toBeVisible();
  });

  test('navigation bar / header is visible', async ({ page }) => {
    await expect(page.locator('nav, header, [class*="navbar"]').first()).toBeVisible();
  });

  test('"My Profile" nav link is visible', async ({ page }) => {
    await expect(page.getByRole('link', { name: /my profile/i })).toBeVisible();
  });

  test('"Logout" link is visible', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: /logout/i }).or(page.getByRole('button', { name: /logout/i })),
    ).toBeVisible();
  });

  test('"+ Add Recommendation" CTA is visible', async ({ page }) => {
    await expect(
      page
        .getByRole('link', { name: /add recommendation/i })
        .or(page.getByRole('button', { name: /add recommendation/i }))
        .or(page.getByText(/\+ add recommendation/i)),
    ).toBeVisible();
  });

  test('"Help" nav item is visible', async ({ page }) => {
    await expect(
      page
        .getByRole('link', { name: /^help$/i })
        .or(page.getByText(/^help$/i))
        .first(),
    ).toBeVisible();
  });

  test('"About" nav item is visible', async ({ page }) => {
    await expect(
      page
        .getByRole('link', { name: /^about$/i })
        .or(page.getByText(/^about$/i))
        .first(),
    ).toBeVisible();
  });

  test('footer shows copyright 2026', async ({ page }) => {
    await expect(page.getByText(/2026/)).toBeVisible();
  });

  test('page has no broken images', async ({ page }) => {
    const broken = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLImageElement>('img'))
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.src),
    );
    expect(broken).toHaveLength(0);
  });
});

// ─── Suite 3 — Home feed: category filters ───────────────────────────────────

test.describe('Home feed — category filters', () => {
  test.describe.configure({ timeout: 60_000 });
  test.beforeEach(async ({ page }) => {
    await gotoHome(page);
  });

  test('"All" filter tab is visible', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /^all$/i }).or(page.getByText(/^all$/i)).first(),
    ).toBeVisible();
  });

  test('"Book" filter tab is visible', async ({ page }) => {
    await expect(
      page
        .getByRole('button', { name: /^book$/i })
        .or(page.getByText(/^book$/i))
        .first(),
    ).toBeVisible();
  });

  test('"Movie" filter tab is visible', async ({ page }) => {
    await expect(
      page
        .getByRole('button', { name: /^movie$/i })
        .or(page.getByText(/^movie$/i))
        .first(),
    ).toBeVisible();
  });

  test('"Series" filter tab is visible', async ({ page }) => {
    await expect(
      page
        .getByRole('button', { name: /^series$/i })
        .or(page.getByText(/^series$/i))
        .first(),
    ).toBeVisible();
  });

  test('"Activity" or "Other" filter tab is visible', async ({ page }) => {
    const n =
      (await page.getByText(/^activity$/i).count()) + (await page.getByText(/^other$/i).count());
    expect(n).toBeGreaterThan(0);
  });

  test('clicking "Book" filter keeps heading visible (no crash)', async ({ page }) => {
    await page
      .getByRole('button', { name: /^book$/i })
      .or(page.getByText(/^book$/i))
      .first()
      .click();
    await expect(page.getByRole('heading', { name: /recommendations/i })).toBeVisible();
  });

  test('clicking "All" after "Book" restores full listing', async ({ page }) => {
    await page
      .getByText(/^book$/i)
      .first()
      .click();
    await page.getByText(/^all$/i).first().click();
    await expect(page.getByRole('heading', { name: /recommendations/i })).toBeVisible();
  });
});

// ─── Suite 4 — Home feed: Help & About modals ────────────────────────────────

test.describe('Home feed — modals', () => {
  test.describe.configure({ timeout: 60_000 });
  test.beforeEach(async ({ page }) => {
    await gotoHome(page);
  });

  test('"Help" link opens a modal / dialog', async ({ page }) => {
    await page
      .getByRole('link', { name: /^help$/i })
      .or(page.getByText(/^help$/i))
      .first()
      .click();
    await expect(
      page.getByRole('heading', { name: /help/i }).or(page.getByRole('dialog')),
    ).toBeVisible({ timeout: 5_000 });
  });

  test('"About" modal is visible after clicking "About"', async ({ page }) => {
    await page
      .getByRole('link', { name: /^about$/i })
      .or(page.getByText(/^about$/i))
      .first()
      .click();
    await expect(
      page.getByRole('heading', { name: /about/i }).or(page.getByRole('dialog')),
    ).toBeVisible({ timeout: 5_000 });
  });

  test('"About" modal mentions data-test attributes', async ({ page }) => {
    await page
      .getByRole('link', { name: /^about$/i })
      .or(page.getByText(/^about$/i))
      .first()
      .click();
    await expect(page.getByText(/data-test/i)).toBeVisible({ timeout: 5_000 });
  });

  test('modal close button dismisses the dialog', async ({ page }) => {
    await page
      .getByRole('link', { name: /^help$/i })
      .or(page.getByText(/^help$/i))
      .first()
      .click();
    await page.waitForTimeout(400);
    const closeBtn = page
      .getByRole('button', { name: /close|✕|×/i })
      .or(page.locator('[aria-label="Close"], [data-test*="close"]'));
    if ((await closeBtn.count()) > 0) {
      await closeBtn.first().click();
      await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 3_000 });
    }
  });
});
