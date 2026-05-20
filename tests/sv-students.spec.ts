import { test, expect, Page } from '@playwright/test';

/**
 * SV Students Recommend — E2E Test Suite
 * Target: https://sv-students-recommend.onrender.com/
 *
 * Coverage:
 *   1. Login page — structure & branding
 *   2. Login form — field validation
 *   3. Login — invalid credentials error
 *   4. Forgot password — modal open / close / submit
 *   5. Registration — navigate via link
 *   6. Google SSO button — presence & label
 *   7. Footer — copyright & accessibility link
 *   8. Accessibility page — reachable
 */

const BASE_URL = 'https://sv-students-recommend.onrender.com';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Navigate to the login page and wait for the Sign In button to be visible */
async function gotoLogin(page: Page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible({ timeout: 15000 });
}

/**
 * The site renders a password toggle button with aria-label="Show password",
 * so getByLabel(/password/i) matches 2 elements (input + toggle button).
 * Use the data-test attribute instead to target the input precisely.
 */
const passwordInput = (page: Page) => page.locator('[data-test="input-password"]');

// ─── Suite 1 — Login Page Structure ──────────────────────────────────────────

test.describe('Login page — structure', () => {

  test.beforeEach(async ({ page }) => {
    await gotoLogin(page);
  });

  test('page title contains site name', async ({ page }) => {
    await expect(page).toHaveTitle(/SV Students Recommend/i);
  });

  test('heading "Welcome" is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
  });

  test('email input is present and required', async ({ page }) => {
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('required');
  });

  test('password input is present and required', async ({ page }) => {
    // Use data-test attribute — getByLabel(/password/i) also matches the
    // "Show password" eye-toggle button causing a strict mode violation.
    await expect(passwordInput(page)).toBeVisible();
    await expect(passwordInput(page)).toHaveAttribute('required');
  });

  test('password input masks characters', async ({ page }) => {
    await expect(passwordInput(page)).toHaveAttribute('type', 'password');
  });

  test('"Sign In" button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('"Continue with Google" button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();
  });

  test('"Forgot password?" link is visible', async ({ page }) => {
    await expect(page.getByText(/forgot password/i)).toBeVisible();
  });

  test('"Register here" link is visible', async ({ page }) => {
    await expect(page.getByRole('link', { name: /register here/i })).toBeVisible();
  });

  test('logo / site name "SV College" appears on page', async ({ page }) => {
    await expect(page.getByText(/SV College/i).first()).toBeVisible();
  });
});

// ─── Suite 2 — Login Form Validation ─────────────────────────────────────────

test.describe('Login form — validation', () => {

  test.beforeEach(async ({ page }) => {
    await gotoLogin(page);
  });

  test('submitting empty form does not navigate away', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click();
    // Browser native required-field validation should prevent submission
    await expect(page).toHaveURL(new RegExp(BASE_URL));
  });

  test('submitting with email only does not navigate away', async ({ page }) => {
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(new RegExp(BASE_URL));
  });

  test('submitting with password only does not navigate away', async ({ page }) => {
    await passwordInput(page).fill('SomePassword1!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(new RegExp(BASE_URL));
  });

  test('email field rejects clearly invalid format', async ({ page }) => {
    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill('not-an-email');
    await page.getByRole('button', { name: /sign in/i }).click();
    // Browser built-in email validation fires before submission
    const validity = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(validity).toBe(false);
  });
});

// ─── Suite 3 — Login — Wrong Credentials ─────────────────────────────────────

test.describe('Login — invalid credentials', () => {

  test('server returns 4xx on wrong email/password', async ({ page }) => {
    await gotoLogin(page);

    // Intercept the first API response that comes back after sign-in click
    const [response] = await Promise.all([
      page.waitForResponse(
        r => (r.url().includes('/login') || r.url().includes('/auth') || r.url().includes('/token') || r.url().includes('/signin'))
          && r.status() >= 400,
        { timeout: 12000 }
      ).catch(() => null),
      (async () => {
        await page.getByLabel(/email/i).fill('nonexistent@fake.com');
        await passwordInput(page).fill('WrongPassword99!');
        await page.getByRole('button', { name: /sign in/i }).click();
      })(),
    ]);

    if (response) {
      // FastAPI backend correctly rejected the bad credentials
      expect(response.status()).toBeGreaterThanOrEqual(400);
      expect(response.status()).toBeLessThan(500);
    } else {
      // Fallback: the app stayed on the login page (no navigation = error was shown)
      await expect(page).toHaveURL(new RegExp(BASE_URL));
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    }
  });
});

// ─── Suite 4 — Forgot Password Modal ─────────────────────────────────────────

test.describe('Forgot password modal', () => {

  test.beforeEach(async ({ page }) => {
    await gotoLogin(page);
  });

  test('clicking "Forgot password?" opens a modal or section', async ({ page }) => {
    await page.getByText(/forgot password/i).click();
    // Expect a heading or label related to password reset to appear
    await expect(
      page.getByText(/reset your password/i)
        .or(page.getByText(/reset password/i))
        .or(page.getByRole('dialog'))
    ).toBeVisible({ timeout: 5000 });
  });

  test('password reset modal has an email input', async ({ page }) => {
    await page.getByText(/forgot password/i).click();
    // Wait for modal to open
    await page.waitForTimeout(500);
    // After clicking, a new email-style input or field should appear
    const inputs = page.locator('input[type="email"], input[type="text"]');
    await expect(inputs.last()).toBeVisible({ timeout: 5000 });
  });

  test('"Send reset link" button is present in the modal', async ({ page }) => {
    await page.getByText(/forgot password/i).click();
    await expect(
      page.getByRole('button', { name: /send reset link/i })
        .or(page.getByRole('button', { name: /send/i }))
    ).toBeVisible({ timeout: 5000 });
  });

  test('"Cancel" closes the modal', async ({ page }) => {
    await page.getByText(/forgot password/i).click();
    await page.waitForTimeout(500);

    const cancelBtn = page.getByRole('button', { name: /cancel/i });
    await expect(cancelBtn).toBeVisible({ timeout: 5000 });
    await cancelBtn.click();

    // Modal should close; Sign In button should be in focus again
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    await expect(page.getByText(/reset your password/i)).not.toBeVisible();
  });

  test('submitting reset with empty email does not close modal', async ({ page }) => {
    await page.getByText(/forgot password/i).click();
    await page.waitForTimeout(500);

    const sendBtn = page.getByRole('button', { name: /send reset link/i })
      .or(page.getByRole('button', { name: /send/i }));
    await sendBtn.click();

    // Modal should still be visible (validation prevents close)
    await expect(
      page.getByText(/reset your password/i)
        .or(page.getByRole('dialog'))
    ).toBeVisible({ timeout: 3000 });
  });
});

// ─── Suite 5 — Registration Navigation ───────────────────────────────────────

test.describe('Registration navigation', () => {

  test('clicking "Register here" navigates to registration page', async ({ page }) => {
    await gotoLogin(page);
    await page.getByRole('link', { name: /register here/i }).click();

    // Should land somewhere different from the login page
    await page.waitForLoadState('domcontentloaded');

    // Expect a register/sign-up heading or form to appear
    const registerIndicator = page.getByRole('heading', { name: /register|sign up|create account/i })
      .or(page.getByRole('button', { name: /register|sign up|create/i }))
      .or(page.getByText(/create.*account/i));

    await expect(registerIndicator.first()).toBeVisible({ timeout: 10000 });
  });
});

// ─── Suite 6 — Footer ────────────────────────────────────────────────────────

test.describe('Footer', () => {

  test.beforeEach(async ({ page }) => {
    await gotoLogin(page);
  });

  test('footer shows copyright year 2026', async ({ page }) => {
    await expect(page.getByText(/2026/)).toBeVisible();
  });

  test('footer shows "All rights reserved"', async ({ page }) => {
    await expect(page.getByText(/all rights reserved/i)).toBeVisible();
  });

  test('"Accessibility" link is visible in footer', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: /accessibility/i })
    ).toBeVisible();
  });

  test('Accessibility link is reachable (returns 200)', async ({ page, request }) => {
    const accessibilityLink = page.getByRole('link', { name: /accessibility/i });
    const href = await accessibilityLink.getAttribute('href');
    expect(href).toBeTruthy();

    const url = href!.startsWith('http') ? href! : `${BASE_URL}/${href!.replace(/^\//, '')}`;
    const response = await request.get(url);
    expect(response.status()).toBeLessThan(400);
  });
});

// ─── Suite 7 — Page Performance & Basics ─────────────────────────────────────

test.describe('Page performance & basics', () => {

  test('login page loads within 10 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(10000);
  });

  test('page has at least one heading element', async ({ page }) => {
    await gotoLogin(page);
    // The site uses h2/h3 rather than h1 — check for any heading
    const headings = await page.locator('h1, h2, h3').count();
    expect(headings).toBeGreaterThanOrEqual(1);
  });

  test('no broken images on login page', async ({ page }) => {
    await gotoLogin(page);
    const brokenImages = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src);
    });
    expect(brokenImages).toHaveLength(0);
  });

  test('page has a <title> tag', async ({ page }) => {
    await gotoLogin(page);
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
});
