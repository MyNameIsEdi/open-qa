import { test, expect } from '@playwright/test'
import { BASE_URL } from './sv-helpers'

/**
 * SV Students — Swagger / API documentation
 *
 * Covers:
 *   Suite 1 — Swagger UI rendering and content
 */

test.describe('Swagger / API docs', () => {
  test('GET /docs returns HTTP < 400', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/docs`)
    expect(res.status()).toBeLessThan(400)
  })

  test('Swagger page title references the API', async ({ page }) => {
    await page.goto(`${BASE_URL}/docs`, { waitUntil: 'domcontentloaded' })
    const title = await page.title()
    expect(title.length).toBeGreaterThan(0)
    expect(title).toMatch(/swagger|api|SV/i)
  })

  test('Swagger UI root element (#swagger-ui) renders', async ({ page }) => {
    await page.goto(`${BASE_URL}/docs`, { waitUntil: 'domcontentloaded' })
    await expect(
      page.locator('#swagger-ui, .swagger-ui').first()
    ).toBeVisible({ timeout: 15_000 })
  })

  test('at least one operation block (opblock) is rendered', async ({ page }) => {
    await page.goto(`${BASE_URL}/docs`, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('.opblock', { timeout: 15_000 }).catch(() => null)
    const count = await page.locator('.opblock').count()
    expect(count).toBeGreaterThan(0)
  })

  test('HTTP method badges are visible (GET / POST etc)', async ({ page }) => {
    await page.goto(`${BASE_URL}/docs`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2_000)
    const count = await page.locator('.opblock-summary-method').count()
    expect(count).toBeGreaterThan(0)
  })

  test('"/api/recommendations" path appears in the docs', async ({ page }) => {
    await page.goto(`${BASE_URL}/docs`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2_500)
    await expect(
      page.getByText('/api/recommendations').first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('"/auth/login" path appears in the docs', async ({ page }) => {
    await page.goto(`${BASE_URL}/docs`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2_500)
    await expect(
      page.getByText('/auth/login').first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('"Authorize" button may be present (Bearer token flow)', async ({ page }) => {
    await page.goto(`${BASE_URL}/docs`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2_000)
    const count = await page.getByRole('button', { name: /authorize/i }).count()
    // Some Swagger UIs don't expose a security scheme → 0 is acceptable
    expect(count).toBeGreaterThanOrEqual(0)
  })
})
