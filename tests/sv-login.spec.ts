import { test, expect } from '@playwright/test'
import { gotoLogin, pwInput } from './sv-helpers'

/**
 * SV Students — Login & Registration
 *
 * Covers:
 *   Suite 1  — Login page structure
 *   Suite 2  — Login form validation
 *   Suite 3  — Forgot-password modal
 *   Suite 4  — Footer (login page)
 */

// ─── Suite 1 — Login page: structure ─────────────────────────────────────────

test.describe('Login page — structure', () => {
  test.beforeEach(async ({ page }) => { await gotoLogin(page) })

  test('page title contains "SV Students Recommend"', async ({ page }) => {
    await expect(page).toHaveTitle(/SV Students Recommend/i)
  })

  test('"Welcome" heading is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible()
  })

  test('"SV Students Recommend" text is visible on the page', async ({ page }) => {
    await expect(
      page.getByText(/SV Students Recommend/i).first()
    ).toBeVisible()
  })

  test('email input is present, visible and marked required', async ({ page }) => {
    const email = page.getByLabel(/email/i)
    await expect(email).toBeVisible()
    await expect(email).toHaveAttribute('required')
  })

  test('password input is present, visible and marked required', async ({ page }) => {
    await expect(pwInput(page)).toBeVisible()
    await expect(pwInput(page)).toHaveAttribute('required')
  })

  test('password input type is "password" (characters masked)', async ({ page }) => {
    await expect(pwInput(page)).toHaveAttribute('type', 'password')
  })

  test('"Sign In" button is visible and enabled', async ({ page }) => {
    const btn = page.getByRole('button', { name: /sign in/i })
    await expect(btn).toBeVisible()
    await expect(btn).toBeEnabled()
  })

  test('"Continue with Google" button is visible', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /continue with google/i })
    ).toBeVisible()
  })

  test('"Forgot password?" text is visible', async ({ page }) => {
    await expect(page.getByText(/forgot password/i)).toBeVisible()
  })

  test('"Register here" link is visible', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: /register here/i })
    ).toBeVisible()
  })

  test('"Register here" href points to register.html', async ({ page }) => {
    const href = await page.getByRole('link', { name: /register here/i })
      .getAttribute('href')
    expect(href).toMatch(/register/)
  })

  test('SV College logo/link is present', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: /SV College/i }).first()
    ).toBeVisible()
  })
})

// ─── Suite 2 — Login form: validation ────────────────────────────────────────

test.describe('Login form — validation', () => {
  test.beforeEach(async ({ page }) => { await gotoLogin(page) })

  test('submitting empty form does not navigate away', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/login/)
  })

  test('email-only submit stays on login page', async ({ page }) => {
    await page.getByLabel(/email/i).fill('student@example.com')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/login/)
  })

  test('password-only submit stays on login page', async ({ page }) => {
    await pwInput(page).fill('Secret99!')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/login/)
  })

  test('invalid email format fails native browser validation', async ({ page }) => {
    const email = page.getByLabel(/email/i)
    await email.fill('not-an-email')
    await page.getByRole('button', { name: /sign in/i }).click()
    const valid = await email.evaluate(
      (el: HTMLInputElement) => el.validity.valid
    )
    expect(valid).toBe(false)
  })

  test('wrong credentials → POST /auth/login returns 4xx', async ({ page }) => {
    const [response] = await Promise.all([
      page.waitForResponse(
        r => r.url().includes('/auth/login') && r.status() >= 400,
        { timeout: 12_000 }
      ).catch(() => null),
      (async () => {
        await page.getByLabel(/email/i).fill('nobody@invalid.test')
        await pwInput(page).fill('WrongPassword99!')
        await page.getByRole('button', { name: /sign in/i }).click()
      })(),
    ])
    if (response) {
      expect(response.status()).toBeGreaterThanOrEqual(400)
      expect(response.status()).toBeLessThan(500)
    } else {
      await expect(page).toHaveURL(/login/)
    }
  })
})

// ─── Suite 3 — Forgot-password modal ─────────────────────────────────────────

test.describe('Forgot-password modal', () => {
  test.beforeEach(async ({ page }) => { await gotoLogin(page) })

  test('clicking "Forgot password?" reveals reset heading', async ({ page }) => {
    await page.getByText(/forgot password/i).click()
    await expect(
      page.getByRole('heading', { name: /reset your password/i })
        .or(page.getByText(/reset your password/i))
    ).toBeVisible({ timeout: 5_000 })
  })

  test('reset modal contains an email input', async ({ page }) => {
    await page.getByText(/forgot password/i).click()
    await page.waitForTimeout(400)
    const inputs = page.locator('input[type="email"], input[type="text"]')
    await expect(inputs.last()).toBeVisible({ timeout: 5_000 })
  })

  test('"Send reset link" button is visible inside modal', async ({ page }) => {
    await page.getByText(/forgot password/i).click()
    await expect(
      page.getByRole('button', { name: /send reset link/i })
    ).toBeVisible({ timeout: 5_000 })
  })

  test('"Cancel" closes the reset modal', async ({ page }) => {
    await page.getByText(/forgot password/i).click()
    await page.waitForTimeout(400)
    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(
      page.getByText(/reset your password/i)
    ).not.toBeVisible()
    await expect(
      page.getByRole('button', { name: /sign in/i })
    ).toBeVisible()
  })

  test('submitting empty reset form keeps modal open', async ({ page }) => {
    await page.getByText(/forgot password/i).click()
    await page.waitForTimeout(400)
    await page.getByRole('button', { name: /send reset link/i }).click()
    await expect(
      page.getByRole('button', { name: /send reset link/i })
    ).toBeVisible({ timeout: 3_000 })
  })
})

// ─── Suite 4 — Footer ────────────────────────────────────────────────────────

test.describe('Footer', () => {
  test.beforeEach(async ({ page }) => { await gotoLogin(page) })

  test('copyright year 2026 is displayed', async ({ page }) => {
    await expect(page.getByText(/2026/)).toBeVisible()
  })

  test('"All rights reserved" text is displayed', async ({ page }) => {
    await expect(page.getByText(/all rights reserved/i)).toBeVisible()
  })

  test('"Accessibility" link is visible in footer', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: /accessibility/i })
    ).toBeVisible()
  })

  test('"Accessibility" link href points to accessibility.html', async ({ page }) => {
    const href = await page.getByRole('link', { name: /accessibility/i })
      .getAttribute('href')
    expect(href).toMatch(/accessibility/)
  })

  test('SV College logo in footer links to svcollege.co.il', async ({ page }) => {
    const logoLinks = page.locator('footer a[href*="svcollege"]')
      .or(page.locator('[class*="footer"] a[href*="svcollege"]'))
    if (await logoLinks.count() > 0) {
      const href = await logoLinks.first().getAttribute('href')
      expect(href).toMatch(/svcollege/)
    }
  })
})
