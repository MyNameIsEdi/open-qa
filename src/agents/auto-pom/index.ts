import * as fs from 'fs';
import * as path from 'path';
import { askClaude, USE_MOCK, warnMockMode } from '../../core/llm-client';

export interface POMBuilderInput {
  domHtml: string;
  pageName: string;
  outputPath?: string;
}

const SYSTEM_PROMPT = `You are a senior Playwright architect.
Given a simplified HTML DOM, generate a complete TypeScript Page Object Model class.
Rules:
- Use getByRole, getByLabel, getByText, getByTestId (in that priority order) — no CSS or XPath
- Declare each interactive element as a readonly Locator property
- Add async action methods (e.g. login(), submitForm(), clickNav()) that combine the locators
- Include a goto(path: string) method
- Add JSDoc only for non-obvious methods
- Export the class as the default export
Return ONLY valid TypeScript. No markdown fences. No commentary.`;

function stripDomForTokens(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 10_000);
}

export function createMockPOM(input: POMBuilderInput): string {
  const { pageName, domHtml } = input;

  const testIdMatches = [...domHtml.matchAll(/data-testid=["']([^"']+)["']/gi)];
  const buttonMatches = [...domHtml.matchAll(/<button[^>]*>([^<]+)<\/button>/gi)];
  const inputMatches = [
    ...domHtml.matchAll(/<input[^>]+(?:placeholder|aria-label)=["']([^"']+)["'][^>]*>/gi),
  ];

  const locators: string[] = [];
  const methods: string[] = [];

  for (const m of testIdMatches.slice(0, 4)) {
    const id = m[1];
    const propName = id.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()).replace(/-/g, '');
    locators.push(`  readonly ${propName}: Locator`);
  }

  for (const m of buttonMatches.slice(0, 3)) {
    const label = m[1].trim();
    const propName =
      label
        .toLowerCase()
        .replace(/\s+([a-z])/g, (_, c: string) => c.toUpperCase())
        .replace(/[^a-zA-Z]/g, '') + 'Btn';
    locators.push(`  readonly ${propName}: Locator`);
    const methodName =
      'click' +
      label
        .replace(/\s+([a-z])/g, (_, c: string) => c.toUpperCase())
        .replace(/^[a-z]/, (c) => c.toUpperCase())
        .replace(/[^a-zA-Z]/g, '');
    methods.push(`  async ${methodName}() {\n    await this.${propName}.click()\n  }`);
  }

  if (inputMatches.length > 0) {
    locators.push(`  readonly searchInput: Locator`);
    methods.push(
      `  async fillSearch(value: string) {\n    await this.searchInput.fill(value)\n  }`,
    );
  }

  if (locators.length === 0) {
    locators.push(`  readonly heading: Locator`);
  }

  return `import { Page, Locator } from '@playwright/test'

export class ${pageName} {
  readonly page: Page
${locators.join('\n')}

  constructor(page: Page) {
    this.page = page
${testIdMatches
  .slice(0, 4)
  .map((m) => {
    const id = m[1];
    const propName = id.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()).replace(/-/g, '');
    return `    this.${propName} = page.getByTestId('${id}')`;
  })
  .join('\n')}
${buttonMatches
  .slice(0, 3)
  .map((m) => {
    const label = m[1].trim();
    const propName =
      label
        .toLowerCase()
        .replace(/\s+([a-z])/g, (_, c: string) => c.toUpperCase())
        .replace(/[^a-zA-Z]/g, '') + 'Btn';
    return `    this.${propName} = page.getByRole('button', { name: '${label}' })`;
  })
  .join('\n')}
${inputMatches.length > 0 ? `    this.searchInput = page.getByPlaceholder('${inputMatches[0][1]}')` : ''}
${locators.length === 1 && testIdMatches.length === 0 ? `    this.heading = page.getByRole('heading')` : ''}
  }

  async goto(path = '/') {
    await this.page.goto(path)
  }

${methods.join('\n\n')}
}

export default ${pageName}
`;
}

export async function buildPageObject(input: POMBuilderInput): Promise<string> {
  warnMockMode('Auto-POM Builder');
  const { domHtml, pageName, outputPath } = input;
  const strippedHtml = stripDomForTokens(domHtml);

  console.log(`🏗️  Building Page Object Model for: ${pageName}`);

  let pomCode: string;

  if (USE_MOCK) {
    pomCode = createMockPOM(input);
    console.log(`✨ [MOCK] Generated POM heuristically`);
  } else {
    const prompt = `Page name: "${pageName}"

DOM snapshot:
${strippedHtml}

Generate the TypeScript POM class.`;

    pomCode = await askClaude({ system: SYSTEM_PROMPT, prompt, maxTokens: 2000, temperature: 0.1 });
    console.log(`✅ Claude generated POM for ${pageName}`);
  }

  const outputDir = outputPath ?? path.join(process.cwd(), 'output', 'auto-pom');
  fs.mkdirSync(outputDir, { recursive: true });
  const filePath = path.join(outputDir, `${pageName}.ts`);
  fs.writeFileSync(filePath, pomCode);
  console.log(`📄 POM saved to: ${filePath}`);

  return pomCode;
}

export async function runDemoTest(): Promise<void> {
  const demoHtml = `
    <html><body>
      <h1>Login</h1>
      <form>
        <input type="email" placeholder="Email address" aria-label="Email" />
        <input type="password" placeholder="Password" aria-label="Password" />
        <button type="submit" data-testid="login-submit-btn">Sign In</button>
      </form>
      <a href="/forgot-password">Forgot password?</a>
    </body></html>
  `;

  await buildPageObject({ domHtml: demoHtml, pageName: 'LoginPage' });
}

const isMain = process.argv[1]?.includes('auto-pom');

if (isMain) {
  runDemoTest().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
