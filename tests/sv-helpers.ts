import { expect, Page } from '@playwright/test';

export const BASE_URL = 'https://sv-students-recommend.onrender.com';
export const TEST_EMAIL = process.env.TEST_EMAIL ?? 'hagai@svcollege.co.il';
export const TEST_PASS = process.env.TEST_PASSWORD ?? 'test1234';

/** Navigate to the login page and wait until the Sign In button is ready. */
export async function gotoLogin(page: Page) {
  await page.goto(`${BASE_URL}/pages/login.html`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible({ timeout: 15_000 });
}

/**
 * Password input: target by data-test to avoid strict-mode violation.
 * The page also renders an eye-toggle with aria-label="Show password",
 * so getByLabel(/password/i) resolves two elements.
 */
export const pwInput = (page: Page) => page.locator('[data-test="input-password"]');

/**
 * POST /auth/login → obtain a Bearer token for direct API calls.
 * Does NOT inject into the browser — use gotoHome() for page-level auth.
 */
export async function getAPIToken(page: Page): Promise<string> {
  const res = await page.request.post(`${BASE_URL}/auth/login`, {
    data: { email: TEST_EMAIL, password: TEST_PASS },
  });
  expect(res.status(), `POST /auth/login returned ${res.status()}`).toBe(200);
  const body = (await res.json()) as Record<string, unknown>;
  const token = (body.access_token ?? body.token ?? '') as string;
  expect(token.length, 'Expected non-empty access_token').toBeGreaterThan(0);
  return token;
}

/**
 * Navigate to the home feed as an authenticated user via the real UI login
 * form — the most reliable way to establish a Supabase session in the browser.
 */
export async function gotoHome(page: Page) {
  await page.goto(`${BASE_URL}/pages/login.html`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible({ timeout: 15_000 });
  await page.getByLabel(/email/i).fill(TEST_EMAIL);
  await pwInput(page).fill(TEST_PASS);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page.getByRole('heading', { name: /recommendations/i })).toBeVisible({
    timeout: 20_000,
  });
}
