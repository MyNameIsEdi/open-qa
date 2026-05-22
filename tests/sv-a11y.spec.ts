import { test, expect } from '@playwright/test'
import { BASE_URL } from './sv-helpers'

/**
 * SV Students — Accessibility statement page (Hebrew)
 *
 * Covers:
 *   Suite 1 — Page structure, Hebrew content, contact links
 */

test.describe('Accessibility statement', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/accessibility.html`, { waitUntil: 'domcontentloaded' })
  })

  test('GET /accessibility.html returns HTTP 200', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/accessibility.html`)
    expect(res.status()).toBe(200)
  })

  test('page has a non-empty <title>', async ({ page }) => {
    expect((await page.title()).length).toBeGreaterThan(0)
  })

  test('H1 heading ("הצהרת נגישות") is visible', async ({ page }) => {
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('page body contains Hebrew text', async ({ page }) => {
    const text      = await page.locator('body').innerText()
    const hasHebrew = /[֐-׿]/.test(text)
    expect(hasHebrew).toBe(true)
  })

  test('coordinator email link (mailto:) is present', async ({ page }) => {
    await expect(
      page.locator('a[href^="mailto:"]').first()
    ).toBeVisible()
  })

  test('WhatsApp contact link (wa.me) is present', async ({ page }) => {
    await expect(
      page.locator('a[href*="wa.me"]').first()
    ).toBeVisible()
  })

  test('"Return to homepage" link points to home.html', async ({ page }) => {
    const link = page.locator('a[href*="home.html"]')
    await expect(link.first()).toBeVisible()
    const href = await link.first().getAttribute('href')
    expect(href).toMatch(/home\.html/)
  })

  test('all images have alt attributes', async ({ page }) => {
    const images = page.locator('img')
    const count  = await images.count()
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt')
      expect(alt, `img[${i}] is missing alt`).not.toBeNull()
    }
  })

  test('page has no broken images', async ({ page }) => {
    const broken = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLImageElement>('img'))
        .filter(img => !img.complete || img.naturalWidth === 0)
        .map(img => img.src)
    )
    expect(broken).toHaveLength(0)
  })
})
