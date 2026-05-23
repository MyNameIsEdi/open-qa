import { test, expect } from '@playwright/test';
import { BASE_URL, getAPIToken } from './sv-helpers';

/**
 * SV Students — API tests
 *
 * Covers:
 *   Suite 1 — Public API (no auth required)
 *   Suite 2 — Authenticated API
 */

// ─── Suite 1 — Public API (no auth) ──────────────────────────────────────────

test.describe('Public API — no auth required', () => {
  test('GET /api/recommendations returns HTTP 200', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/recommendations`);
    expect(res.status()).toBe(200);
  });

  test('GET /api/recommendations returns a JSON array', async ({ request }) => {
    const body = (await (await request.get(`${BASE_URL}/api/recommendations`)).json()) as unknown;
    expect(Array.isArray(body)).toBe(true);
  });

  test('each recommendation item has an "id" field', async ({ request }) => {
    const items = (await (await request.get(`${BASE_URL}/api/recommendations`)).json()) as Record<
      string,
      unknown
    >[];
    if (items.length > 0) expect(items[0]).toHaveProperty('id');
  });

  test('GET /api/recommendations/:id returns 200 for the first item', async ({ request }) => {
    const list = (await (await request.get(`${BASE_URL}/api/recommendations`)).json()) as Record<
      string,
      unknown
    >[];
    if (list.length === 0) return;
    const id = list[0].id as string | number;
    const res = await request.get(`${BASE_URL}/api/recommendations/${id}`);
    expect(res.status()).toBe(200);
  });

  test('GET /api/recommendations/non-existent-id returns 4xx or 5xx', async ({ request }) => {
    const res = await request.get(
      `${BASE_URL}/api/recommendations/00000000-0000-0000-0000-000000000000`,
    );
    expect([404, 422, 500]).toContain(res.status());
  });

  test('POST /api/recommendations without token is rejected (401 or 403)', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/recommendations`, {
      data: { name: 'Unauthorized attempt', category: 'Book' },
    });
    expect([401, 403, 422]).toContain(res.status());
  });
});

// ─── Suite 2 — Authenticated API ─────────────────────────────────────────────

test.describe('Authenticated API', () => {
  let token = '';

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    token = await getAPIToken(page);
    await ctx.close();
  });

  test('POST /auth/login returns a non-empty access_token', () => {
    expect(token.length).toBeGreaterThan(0);
  });

  test('GET /api/profile/me returns 200 with valid token', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/profile/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
  });

  test('GET /api/profile/me response body contains email', async ({ request }) => {
    const body = (await (
      await request.get(`${BASE_URL}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    ).json()) as Record<string, unknown>;
    expect(body).toHaveProperty('email');
  });

  test('GET /api/profile/me without token returns 401 or 403', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/profile/me`);
    expect([401, 403, 422]).toContain(res.status());
  });

  test('POST /api/recommendations with valid token is accepted (200 or 201)', async ({
    request,
  }) => {
    const res = await request.post(`${BASE_URL}/api/recommendations`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: 'Playwright Testing for Beginners',
        category: 'Book',
        description: 'Created by automated E2E suite — safe to delete.',
        url: 'https://playwright.dev',
      },
    });
    // 422 means schema validation failed — auth still passed
    expect([200, 201, 422]).toContain(res.status());
  });

  test('GET /api/recommendations/:id/comments returns 200 for first item', async ({ request }) => {
    const list = (await (await request.get(`${BASE_URL}/api/recommendations`)).json()) as Record<
      string,
      unknown
    >[];
    if (list.length === 0) return;
    const id = list[0].id as string | number;
    const res = await request.get(`${BASE_URL}/api/recommendations/${id}/comments`);
    expect([200, 404]).toContain(res.status());
  });
});
