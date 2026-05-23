import { chromium } from 'playwright';
import { askClaude, USE_MOCK, warnMockMode } from '../../core/llm-client';

const SYSTEM_PROMPT = `You are a senior QA engineer performing an exploratory audit of a web page.
Given the page title, URL, visible text content, and any console errors, write a concise QA report that covers:
1. A one-sentence summary of what the page does.
2. Potential test areas (forms, navigation, dynamic content, auth gates).
3. Any obvious issues visible in the content or console errors.
4. Suggested Playwright locator strategies for the key interactive elements.
Keep it under 400 words. Be direct and actionable.`;

async function explore(url: string): Promise<void> {
  console.log(`\n🔍 open-qa explore: ${url}\n`);
  warnMockMode('explore agent');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });

  const title = await page.title();
  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 3000));
  const links = await page.$$eval('a[href]', (els) =>
    els.slice(0, 20).map((el) => (el as HTMLAnchorElement).href),
  );

  await browser.close();

  console.log(`📄 Title   : ${title}`);
  console.log(`🔗 Links   : ${links.length} found`);
  if (consoleErrors.length) {
    console.log(`⚠️  Console errors (${consoleErrors.length}):`);
    consoleErrors.forEach((e) => console.log(`   ${e}`));
  }
  console.log('');

  if (USE_MOCK) {
    console.log('[MOCK] QA Report\n');
    console.log(`Page: ${title} (${url})`);
    console.log('Add ANTHROPIC_API_KEY to .env for a real AI-generated report.\n');
    return;
  }

  const prompt = `URL: ${url}
Title: ${title}
Console errors: ${consoleErrors.length ? consoleErrors.join(' | ') : 'none'}
Visible text (first 3000 chars):
${bodyText}`;

  const report = await askClaude({ system: SYSTEM_PROMPT, prompt, maxTokens: 1024 });
  console.log('── QA Report ──────────────────────────────────────────\n');
  console.log(report);
  console.log('\n───────────────────────────────────────────────────────\n');
}

const url = process.argv[2];
if (!url) {
  console.error('Usage: npx tsx src/agents/explore/index.ts <url>');
  process.exit(1);
}

explore(url).catch((err) => {
  console.error('explore failed:', err.message);
  process.exit(1);
});
