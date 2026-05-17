import { test, expect } from '@playwright/test';
import {
  clickWithSelfHealing,
  createMockHealedLocator,
  suggestLocator,
} from '../src/agents/self-healing';

const MOCK_CHECKOUT_HTML = `
  <html>
    <body>
      <h1>Checkout</h1>
      <button data-testid="checkout-confirm-button" type="button">Complete Order</button>
    </body>
  </html>
`;

test.describe('Self-healing locator', () => {
  test('heals broken selector and completes click', async ({ page }) => {
    await page.setContent(MOCK_CHECKOUT_HTML);

    const brokenSelector = '#legacy-submit-btn';
    await clickWithSelfHealing(
      page,
      brokenSelector,
      'The primary button to complete checkout / place order',
    );

    await expect(page.getByRole('button', { name: 'Complete Order' })).toBeVisible();
  });

  test('mock locator suggestion prefers test id', async ({ page }) => {
    await page.setContent(MOCK_CHECKOUT_HTML);
    const html = await page.content();
    const spec = createMockHealedLocator(html, 'checkout confirm');
    expect(spec.strategy).toBe('getByTestId');
    expect(spec.target).toBe('checkout-confirm-button');
  });

  test('suggestLocator returns a locator spec (mock or live)', async ({ page }) => {
    await page.setContent(MOCK_CHECKOUT_HTML);
    const spec = await suggestLocator(page, 'Complete order button');
    expect(['getByRole', 'getByTestId', 'getByText', 'getByLabel', 'locator']).toContain(
      spec.strategy,
    );
    expect(spec.target.length).toBeGreaterThan(0);
  });
});
