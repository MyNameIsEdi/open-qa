import { Page, Locator, errors } from 'playwright';
import { askClaude, USE_MOCK, warnMockMode } from '../../core/llm-client';

export type LocatorStrategy =
  | 'getByRole'
  | 'getByLabel'
  | 'getByText'
  | 'getByTestId'
  | 'getByPlaceholder'
  | 'locator';

export interface HealedLocatorSpec {
  strategy: LocatorStrategy;
  target: string;
  options?: Record<string, string | boolean | number>;
}

const SYSTEM_PROMPT = `You are an expert Playwright test engineer.
Given a simplified HTML DOM and a description of the intended user action, return a single robust Playwright locator specification.
Prefer accessibility-first locators: getByRole, getByLabel, getByText, then getByTestId. Avoid brittle CSS/XPath.
Return ONLY valid JSON with this shape (no markdown):
{"strategy":"getByRole","target":"button","options":{"name":"Complete Order"}}`;

function stripDomForTokens(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 12_000);
}

export function createMockHealedLocator(
  html: string,
  actionDescription: string,
): HealedLocatorSpec {
  const testIdMatch = html.match(/data-testid=["']([^"']+)["']/i)
    ?? html.match(/data-test-id=["']([^"']+)["']/i);
  if (testIdMatch) {
    return { strategy: 'getByTestId', target: testIdMatch[1] };
  }

  const buttonMatch = html.match(/<button[^>]*>([^<]+)<\/button>/i);
  if (buttonMatch) {
    return {
      strategy: 'getByRole',
      target: 'button',
      options: { name: buttonMatch[1].trim() },
    };
  }

  const roleMatch = html.match(/role=["']([^"']+)["']/i);
  if (roleMatch) {
    return { strategy: 'getByRole', target: roleMatch[1], options: { name: actionDescription } };
  }

  return { strategy: 'getByRole', target: 'button', options: { name: 'Complete Order' } };
}

function parseHealedLocator(raw: string): HealedLocatorSpec {
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleaned) as HealedLocatorSpec;
  if (!parsed.strategy || !parsed.target) {
    throw new Error(`Invalid locator spec from AI: ${cleaned}`);
  }
  return parsed;
}

export async function suggestLocator(
  page: Page,
  actionDescription: string,
): Promise<HealedLocatorSpec> {
  warnMockMode('Self-healing locator');
  const html = stripDomForTokens(await page.content());

  if (USE_MOCK) {
    const spec = createMockHealedLocator(html, actionDescription);
    console.log(`✨ [MOCK] Suggested locator: ${JSON.stringify(spec)}`);
    return spec;
  }

  const prompt = `Action the tester intended: "${actionDescription}"

Simplified DOM:
${html}

Return the best Playwright locator as JSON.`;

  try {
    const raw = await askClaude({ system: SYSTEM_PROMPT, prompt, maxTokens: 256, temperature: 0.1 });
    const spec = parseHealedLocator(raw);
    console.log(`✨ [Self-Healing] AI suggested locator: ${JSON.stringify(spec)}`);
    return spec;
  } catch (error) {
    if (error instanceof Error && error.message === 'MOCK_MODE') {
      return createMockHealedLocator(html, actionDescription);
    }
    console.error('❌ Failed to heal locator via Claude:', error);
    throw error;
  }
}

export function buildLocator(page: Page, spec: HealedLocatorSpec): Locator {
  switch (spec.strategy) {
    case 'getByRole':
      return page.getByRole(
        spec.target as Parameters<Page['getByRole']>[0],
        spec.options as Parameters<Page['getByRole']>[1],
      );
    case 'getByLabel':
      return page.getByLabel(spec.target, spec.options);
    case 'getByText':
      return page.getByText(spec.target, spec.options);
    case 'getByTestId':
      return page.getByTestId(spec.target);
    case 'getByPlaceholder':
      return page.getByPlaceholder(spec.target, spec.options);
    case 'locator':
      return page.locator(spec.target);
    default:
      throw new Error(`Unsupported locator strategy: ${(spec as HealedLocatorSpec).strategy}`);
  }
}

export async function runHealingDemo(): Promise<void> {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(`
    <html><body>
      <h1>Checkout</h1>
      <button data-testid="checkout-confirm-button">Complete Order</button>
    </body></html>
  `);
  await clickWithSelfHealing(
    page,
    '#old-submit-btn',
    'Button to complete checkout and place the order',
  );
  await browser.close();
}

export async function clickWithSelfHealing(
  page: Page,
  brokenSelector: string,
  actionDescription: string,
  timeoutMs = 1000,
): Promise<void> {
  try {
    await page.click(brokenSelector, { timeout: timeoutMs });
  } catch (error) {
    if (!(error instanceof errors.TimeoutError)) {
      throw error;
    }
    console.log(`\n🚑 Timeout on "${brokenSelector}" — invoking self-healing for: ${actionDescription}`);
    const spec = await suggestLocator(page, actionDescription);
    const healed = buildLocator(page, spec);
    await healed.click({ timeout: 5000 });
    console.log('🎉 Self-healing click succeeded.');
  }
}

const isMain = process.argv[1]?.includes('self-healing');

if (isMain) {
  runHealingDemo().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
