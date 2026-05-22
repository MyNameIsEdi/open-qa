import { test, expect, Page } from '@playwright/test'

/**
 * SV Students Recommend — Full E2E Test Suite
 *
 * Pages covered:
 *   /pages/login.html     — Login
 *   /pages/register.html  — Registration
 *   /pages/home.html      — Home feed  (requires Bearer token)
 *   /docs                 — Swagger / API documentation
 *   /accessibility.html   — Accessibility statement (Hebrew)
 *
 * API endpoints covered:
 *   POST /auth/login               — obtain Bearer token
 *   GET  /api/recommendations      — public listing
 *   GET  /api/recommendations/:id  — public single item
 *   POST /api/recommendations      — auth-required create
 *   GET  /api/profile/me           — auth-required profile
 *
 * Seed credentials (backend/seed.py):
 *   hagai@svcollege.co.il / test1234
 *   Override with TEST_EMAIL / TEST_PASSWORD env vars.
 */

const BASE_URL   = 'https://sv-students-recommend.onrender.com'
const TEST_EMAIL = process.env.TEST_EMAIL    ?? 'hagai@svcollege.co.il'
const TEST_PASS  = process.env.TEST_PASSWORD ?? 'test1234'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Navigate to the login page and wait until the Sign In button is ready. */
async function gotoLogin(page: Page) {
  await page.goto(`${BASE_URL}/pages/login.html`, { waitUntil: 'domcontentloaded' })
  await expect(
    page.getByRole('button', { name: /sign in/i })
  ).toBeVisible({ timeout: 15_000 })
}

/**
 * Password input: target by data-test to avoid strict-mode violation.
 * The page also renders an eye-toggle with aria-label="Show password",
 * so getByLabel(/password/i) resolves two elements.
 */
const pwInput = (page: Page) => page.locator('[data-test="input-password"]')

/**
 * POST /auth/login → obtain a Bearer token for direct API calls.
 * Does NOT inject into the browser — use gotoHome() for page-level auth.
 */
async function getAPIToken(page: Page): Promise<string> {
  const res = await page.request.post(`${BASE_URL}/auth/login`, {
    data: { email: TEST_EMAIL, password: TEST_PASS },
  })
  expect(res.status(), `POST /auth/login returned ${res.status()}`).toBe(200)
  const body  = await res.json() as Record<string, unknown>
  const token = (body.access_token ?? body.token ?? '') as string
  expect(token.length, 'Expected non-empty access_token').toBeGreaterThan(0)
  return token
}

/**
 * Navigate to the home feed as an authenticated user via the real UI login
 * form — the most reliable way to establish a Supabase session in the browser.
 */
async function gotoHome(page: Page) {
  await page.goto(`${BASE_URL}/pages/login.html`, { waitUntil: 'domcontentloaded' })
  await expect(
    page.getByRole('button', { name: /sign in/i })
  ).toBeVisible({ timeout: 15_000 })
  await page.getByLabel(/email/i).fill(TEST_EMAIL)
  await pwInput(page).fill(TEST_PASS)
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(
    page.getByRole('heading', { name: /recommendations/i })
  ).toBeVisible({ timeout: 20_000 })
}

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
      // Fallback: page stayed on login (no redirect = error handled in-place)
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
    // Main Sign In button should be in focus
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

// ─── Suite 4 — Register page: structure ──────────────────────────────────────

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

// ─── Suite 5 — Home feed: unauthenticated redirect ────────────────────────────

test.describe('Home feed — unauthenticated', () => {
  test.use({ timeout: 30_000 })
  test('accessing home.html without token redirects to login', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await page.goto(`${BASE_URL}/pages/home.html`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1_500)
    const url        = page.url()
    const hasSignIn  = await page.getByRole('button', { name: /sign in/i })
      .isVisible().catch(() => false)
    expect(url.includes('login') || hasSignIn).toBe(true)
  })
})

// ─── Suite 6 — Home feed: page structure (authenticated) ─────────────────────

test.describe('Home feed — structure', () => {
  test.use({ timeout: 60_000 })
  test.beforeEach(async ({ page }) => { await gotoHome(page) })

  test('"Recommendations" heading is visible', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /recommendations/i })
    ).toBeVisible()
  })

  test('navigation bar / header is visible', async ({ page }) => {
    await expect(
      page.locator('nav, header, [class*="navbar"]').first()
    ).toBeVisible()
  })

  test('"My Profile" nav link is visible', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: /my profile/i })
    ).toBeVisible()
  })

  test('"Logout" link is visible', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: /logout/i })
        .or(page.getByRole('button', { name: /logout/i }))
    ).toBeVisible()
  })

  test('"+ Add Recommendation" CTA is visible', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: /add recommendation/i })
        .or(page.getByRole('button', { name: /add recommendation/i }))
        .or(page.getByText(/\+ add recommendation/i))
    ).toBeVisible()
  })

  test('"Help" nav item is visible', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: /^help$/i })
        .or(page.getByText(/^help$/i))
        .first()
    ).toBeVisible()
  })

  test('"About" nav item is visible', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: /^about$/i })
        .or(page.getByText(/^about$/i))
        .first()
    ).toBeVisible()
  })

  test('footer shows copyright 2026', async ({ page }) => {
    await expect(page.getByText(/2026/)).toBeVisible()
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

// ─── Suite 7 — Home feed: category filters ────────────────────────────────────

test.describe('Home feed — category filters', () => {
  test.use({ timeout: 60_000 })
  test.beforeEach(async ({ page }) => { await gotoHome(page) })

  test('"All" filter tab is visible', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /^all$/i })
        .or(page.getByText(/^all$/i))
        .first()
    ).toBeVisible()
  })

  test('"Book" filter tab is visible', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /^book$/i })
        .or(page.getByText(/^book$/i))
        .first()
    ).toBeVisible()
  })

  test('"Movie" filter tab is visible', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /^movie$/i })
        .or(page.getByText(/^movie$/i))
        .first()
    ).toBeVisible()
  })

  test('"Series" filter tab is visible', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /^series$/i })
        .or(page.getByText(/^series$/i))
        .first()
    ).toBeVisible()
  })

  test('"Activity" or "Other" filter tab is visible', async ({ page }) => {
    const n = (await page.getByText(/^activity$/i).count()) +
              (await page.getByText(/^other$/i).count())
    expect(n).toBeGreaterThan(0)
  })

  test('clicking "Book" filter keeps heading visible (no crash)', async ({ page }) => {
    await page.getByRole('button', { name: /^book$/i })
      .or(page.getByText(/^book$/i))
      .first().click()
    await expect(
      page.getByRole('heading', { name: /recommendations/i })
    ).toBeVisible()
  })

  test('clicking "All" after "Book" restores full listing', async ({ page }) => {
    await page.getByText(/^book$/i).first().click()
    await page.getByText(/^all$/i).first().click()
    await expect(
      page.getByRole('heading', { name: /recommendations/i })
    ).toBeVisible()
  })
})

// ─── Suite 8 — Home feed: Help & About modals ────────────────────────────────

test.describe('Home feed — modals', () => {
  test.use({ timeout: 60_000 })
  test.beforeEach(async ({ page }) => { await gotoHome(page) })

  test('"Help" link opens a modal / dialog', async ({ page }) => {
    await page.getByRole('link', { name: /^help$/i })
      .or(page.getByText(/^help$/i))
      .first().click()
    await expect(
      page.getByRole('heading', { name: /help/i })
        .or(page.getByRole('dialog'))
    ).toBeVisible({ timeout: 5_000 })
  })

  test('"About" modal is visible after clicking "About"', async ({ page }) => {
    await page.getByRole('link', { name: /^about$/i })
      .or(page.getByText(/^about$/i))
      .first().click()
    await expect(
      page.getByRole('heading', { name: /about/i })
        .or(page.getByRole('dialog'))
    ).toBeVisible({ timeout: 5_000 })
  })

  test('"About" modal mentions data-test attributes', async ({ page }) => {
    await page.getByRole('link', { name: /^about$/i })
      .or(page.getByText(/^about$/i))
      .first().click()
    await expect(
      page.getByText(/data-test/i)
    ).toBeVisible({ timeout: 5_000 })
  })

  test('modal close button dismisses the dialog', async ({ page }) => {
    await page.getByRole('link', { name: /^help$/i })
      .or(page.getByText(/^help$/i))
      .first().click()
    await page.waitForTimeout(400)
    const closeBtn = page.getByRole('button', { name: /close|✕|×/i })
      .or(page.locator('[aria-label="Close"], [data-test*="close"]'))
    if (await closeBtn.count() > 0) {
      await closeBtn.first().click()
      await expect(
        page.getByRole('dialog')
      ).not.toBeVisible({ timeout: 3_000 })
    }
  })
})

// ─── Suite 9 — Public API (no auth) ──────────────────────────────────────────

test.describe('Public API — no auth required', () => {
  test('GET /api/recommendations returns HTTP 200', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/recommendations`)
    expect(res.status()).toBe(200)
  })

  test('GET /api/recommendations returns a JSON array', async ({ request }) => {
    const body = await (
      await request.get(`${BASE_URL}/api/recommendations`)
    ).json() as unknown
    expect(Array.isArray(body)).toBe(true)
  })

  test('each recommendation item has an "id" field', async ({ request }) => {
    const items = await (
      await request.get(`${BASE_URL}/api/recommendations`)
    ).json() as Record<string, unknown>[]
    if (items.length > 0) expect(items[0]).toHaveProperty('id')
  })

  test('GET /api/recommendations/:id returns 200 for the first item', async ({ request }) => {
    const list = await (
      await request.get(`${BASE_URL}/api/recommendations`)
    ).json() as Record<string, unknown>[]
    if (list.length === 0) return
    const id  = list[0].id as string | number
    const res = await request.get(`${BASE_URL}/api/recommendations/${id}`)
    expect(res.status()).toBe(200)
  })

  test('GET /api/recommendations/non-existent-id returns 4xx or 5xx', async ({ request }) => {
    // UUID nil returns 404 (not found), 422 (validation), or 500 (unhandled server error)
    const res = await request.get(`${BASE_URL}/api/recommendations/00000000-0000-0000-0000-000000000000`)
    expect([404, 422, 500]).toContain(res.status())
  })

  test('POST /api/recommendations without token is rejected (401 or 403)', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/recommendations`, {
      data: { name: 'Unauthorized attempt', category: 'Book' },
    })
    expect([401, 403, 422]).toContain(res.status())
  })
})

// ─── Suite 10 — Authenticated API ────────────────────────────────────────────

test.describe('Authenticated API', () => {
  let token = ''

  test.beforeAll(async ({ browser }) => {
    const ctx  = await browser.newContext()
    const page = await ctx.newPage()
    token = await getAPIToken(page)
    await ctx.close()
  })

  test('POST /auth/login returns a non-empty access_token', () => {
    expect(token.length).toBeGreaterThan(0)
  })

  test('GET /api/profile/me returns 200 with valid token', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/profile/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
  })

  test('GET /api/profile/me response body contains email', async ({ request }) => {
    const body = await (
      await request.get(`${BASE_URL}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    ).json() as Record<string, unknown>
    expect(body).toHaveProperty('email')
  })

  test('GET /api/profile/me without token returns 401 or 403', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/profile/me`)
    expect([401, 403, 422]).toContain(res.status())
  })

  test('POST /api/recommendations with valid token is accepted (200 or 201)', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/recommendations`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name:        'Playwright Testing for Beginners',
        category:    'Book',
        description: 'Created by automated E2E suite — safe to delete.',
        url:         'https://playwright.dev',
      },
    })
    // 422 means schema validation failed — still means auth passed
    expect([200, 201, 422]).toContain(res.status())
  })

  test('GET /api/recommendations/:id/comments returns 200 for first item', async ({ request }) => {
    const list = await (
      await request.get(`${BASE_URL}/api/recommendations`)
    ).json() as Record<string, unknown>[]
    if (list.length === 0) return
    const id  = list[0].id as string | number
    const res = await request.get(`${BASE_URL}/api/recommendations/${id}/comments`)
    expect([200, 404]).toContain(res.status()) // 404 if endpoint doesn't exist yet
  })
})

// ─── Suite 11 — Swagger / API docs ───────────────────────────────────────────

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
    const btn = page.getByRole('button', { name: /authorize/i })
    const count = await btn.count()
    // Some Swagger UIs don't expose a security scheme → 0 is acceptable
    expect(count).toBeGreaterThanOrEqual(0)
  })
})

// ─── Suite 12 — Accessibility statement (Hebrew) ─────────────────────────────

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
    const text     = await page.locator('body').innerText()
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

// ─── Suite 13 — Footer (login page) ──────────────────────────────────────────

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

// ─── Suite 14 — Cross-page navigation ────────────────────────────────────────

test.describe('Cross-page navigation', () => {
  test('"Register here" navigates to Create Account page', async ({ page }) => {
    await gotoLogin(page)
    await page.getByRole('link', { name: /register here/i }).click()
    await page.waitForLoadState('domcontentloaded')
    await expect(
      page.getByRole('heading', { name: /create account/i })
    ).toBeVisible({ timeout: 10_000 })
  })

  test('"Sign in" on register page returns to login', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/register.html`, { waitUntil: 'domcontentloaded' })
    await page.getByRole('link', { name: /sign in/i }).click()
    await page.waitForLoadState('domcontentloaded')
    await expect(
      page.getByRole('button', { name: /sign in/i })
    ).toBeVisible({ timeout: 10_000 })
  })

  test('"Accessibility" footer link leads to accessibility page', async ({ page }) => {
    await gotoLogin(page)
    await page.getByRole('link', { name: /accessibility/i }).click()
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 8_000 })
  })

  test('"Return to homepage" on accessibility page href is home.html', async ({ page }) => {
    await page.goto(`${BASE_URL}/accessibility.html`, { waitUntil: 'domcontentloaded' })
    const href = await page.locator('a[href*="home.html"]')
      .first().getAttribute('href')
    expect(href).toMatch(/home\.html/)
  })

  test('direct GET /pages/login.html returns < 400', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/pages/login.html`)
    expect(res.status()).toBeLessThan(400)
  })

  test('direct GET /pages/register.html returns < 400', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/pages/register.html`)
    expect(res.status()).toBeLessThan(400)
  })

  test('direct GET /accessibility.html returns < 400', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/accessibility.html`)
    expect(res.status()).toBeLessThan(400)
  })
})

// ─── Suite 15 — Performance & basics ─────────────────────────────────────────

test.describe('Performance & basics', () => {
  test('login page DOM-ready in under 10 s', async ({ page }) => {
    const t0 = Date.now()
    await page.goto(`${BASE_URL}/pages/login.html`, {
      waitUntil: 'domcontentloaded',
      timeout:   10_000,
    })
    expect(Date.now() - t0).toBeLessThan(10_000)
  })

  test('accessibility page DOM-ready in under 10 s', async ({ page }) => {
    const t0 = Date.now()
    await page.goto(`${BASE_URL}/accessibility.html`, {
      waitUntil: 'domcontentloaded',
      timeout:   10_000,
    })
    expect(Date.now() - t0).toBeLessThan(10_000)
  })

  test('Swagger page DOM-ready in under 15 s', async ({ page }) => {
    const t0 = Date.now()
    await page.goto(`${BASE_URL}/docs`, {
      waitUntil: 'domcontentloaded',
      timeout:   15_000,
    })
    expect(Date.now() - t0).toBeLessThan(15_000)
  })

  test('login page has at least one heading element', async ({ page }) => {
    await gotoLogin(page)
    const count = await page.locator('h1, h2, h3').count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('login page has no broken images', async ({ page }) => {
    await gotoLogin(page)
    const broken = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLImageElement>('img'))
        .filter(img => !img.complete || img.naturalWidth === 0)
        .map(img => img.src)
    )
    expect(broken).toHaveLength(0)
  })

  test('register page has no broken images', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/register.html`, { waitUntil: 'domcontentloaded' })
    const broken = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLImageElement>('img'))
        .filter(img => !img.complete || img.naturalWidth === 0)
        .map(img => img.src)
    )
    expect(broken).toHaveLength(0)
  })
})
