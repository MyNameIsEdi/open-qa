import { test, expect } from '@playwright/test'
import { BASE_URL } from './sv-helpers'

/**
 * SV Students — Registration page
 *
 * Covers:
 *   Suite 1 — Register page structure
 */

test.describe('Register page — structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/register.html`, { waitUntil: 'domcontentloaded' })
    await expect(
      page.getByRole('heading', { name: /create account/i })
    ).toBeVisible({ timeout: 15_000 })
  })

  test('"Create Account" heading is visible', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /create account/i })
    ).toBeVisible()
  })

  test('"SV Students Recommend" branding is visible', async ({ page }) => {
    await expect(page.getByText(/SV Students Recommend/i).first()).toBeVisible()
  })

  test('Student Name field is present and required', async ({ page }) => {
    const field = page.getByLabel(/student name/i)
      .or(page.getByPlaceholder(/name/i))
    await expect(field.first()).toBeVisible()
    const req = await field.first().getAttribute('required')
    expect(req).not.toBeNull()
  })

  test('Email field is present and required', async ({ page }) => {
    const field = page.getByLabel(/email/i)
    await expect(field).toBeVisible()
    await expect(field).toHaveAttribute('required')
  })

  test('Password field is present and required', async ({ page }) => {
    const field = page.locator('input[type="password"]').first()
    await expect(field).toBeVisible()
    const req = await field.getAttribute('required')
    expect(req).not.toBeNull()
  })

  test('"Continue with Google" button is visible', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /continue with google/i })
    ).toBeVisible()
  })

  test('"Sign in" link is visible', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: /sign in/i })
    ).toBeVisible()
  })

  test('"Sign in" href points back to login.html', async ({ page }) => {
    const href = await page.getByRole('link', { name: /sign in/i })
      .getAttribute('href')
    expect(href).toMatch(/login/)
  })
})
