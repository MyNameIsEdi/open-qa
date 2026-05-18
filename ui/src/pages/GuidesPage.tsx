import { useState, useEffect } from 'react'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import CodeSnippet from '../components/CodeSnippet'

interface GuideSnippet { label: string; code: string; language: string }
interface Guide {
  id: string
  title: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  minutes: number
  summary: string
  body: string
  concepts: string[]
  snippets: GuideSnippet[]
}

const GUIDES: Guide[] = [
  {
    id: 'intro',
    title: 'Intro to QA Automation',
    level: 'Beginner',
    minutes: 5,
    summary: 'Understand what QA automation is, why it matters, and where it fits in the testing pyramid.',
    body: 'QA automation is the practice of using software tools to execute tests automatically, rather than running them manually every time. It saves time, catches regressions early, and allows your team to ship with confidence.\n\nThe testing pyramid describes three layers: unit tests at the base (fast, cheap), integration tests in the middle, and end-to-end (E2E) tests at the top (slower, but highest confidence). A healthy test suite has many unit tests, some integration tests, and fewer E2E tests.\n\nPlaywright is a modern E2E testing framework by Microsoft that supports Chromium, Firefox, and WebKit with a single API.',
    concepts: [
      'Manual vs automated testing: manual is exploratory, automation is regression coverage',
      'Testing pyramid: unit → integration → E2E',
      'Playwright runs real browsers — no mocking the DOM',
      'Tests run in parallel by default for speed',
      'MOCK mode in this toolkit lets you try agents without an API key',
    ],
    snippets: [
      {
        label: 'Install Playwright',
        language: 'bash',
        code: `npm init playwright@latest
# Select: TypeScript, tests/ folder, GitHub Actions CI`,
      },
    ],
  },
  {
    id: 'setup',
    title: 'Setting Up Playwright',
    level: 'Beginner',
    minutes: 10,
    summary: 'Install Playwright, configure browsers, and run your first test suite.',
    body: 'After running the init command, Playwright creates a playwright.config.ts file. This file controls which browsers run, base URLs, timeouts, and retries. Understanding this file is key to a maintainable test suite.\n\nThe most important setting is baseURL — set this to your app\'s local dev URL so you can use relative paths like page.goto(\'/login\') instead of full URLs.',
    concepts: [
      'playwright.config.ts controls browsers, timeouts, retries, baseURL',
      'Use projects to run against multiple browsers in parallel',
      'storageState lets you reuse auth sessions across tests',
      'workers: process.env.CI ? 1 : undefined — fewer workers on CI to avoid flakiness',
    ],
    snippets: [
      {
        label: 'playwright.config.ts',
        language: 'typescript',
        code: `import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  ],
})`,
      },
      {
        label: 'Run tests',
        language: 'bash',
        code: `npx playwright test              # run all tests
npx playwright test --ui         # open interactive UI mode
npx playwright test login.spec   # run single file
npx playwright show-report       # view HTML report`,
      },
    ],
  },
  {
    id: 'first-test',
    title: 'Writing Your First Test',
    level: 'Beginner',
    minutes: 10,
    summary: 'Write a complete E2E test: navigate, interact, assert, and understand the test lifecycle.',
    body: 'A Playwright test file exports test blocks using the test() function. Each test receives a page fixture — a browser tab — and uses it to navigate, click, fill forms, and assert results.\n\nThe expect() function wraps any locator and chains assertion methods. Playwright auto-waits for elements to be ready before interacting, so you rarely need explicit waits.',
    concepts: [
      'test() wraps each test case; describe() groups related tests',
      'page.goto() navigates; page.click() / page.fill() interact',
      'expect(locator).toBeVisible() / toHaveText() assert state',
      'Playwright auto-waits — avoid manual sleep() calls',
      'beforeEach() runs setup before every test in a describe block',
    ],
    snippets: [
      {
        label: 'tests/login.spec.ts',
        language: 'typescript',
        code: `import { test, expect } from '@playwright/test'

test.describe('Login flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('successful login redirects to dashboard', async ({ page }) => {
    await page.getByLabel('Email').fill('user@example.com')
    await page.getByLabel('Password').fill('secret123')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible()
  })

  test('wrong password shows error', async ({ page }) => {
    await page.getByLabel('Email').fill('user@example.com')
    await page.getByLabel('Password').fill('wrong')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByText('Invalid credentials')).toBeVisible()
  })
})`,
      },
    ],
  },
  {
    id: 'locators',
    title: 'Locator Strategies',
    level: 'Beginner',
    minutes: 15,
    summary: 'Learn how to find elements reliably using role, label, text, and test-id strategies.',
    body: 'The golden rule of locators: prefer user-visible attributes (role, label, text) over implementation details (CSS classes, XPath). User-visible locators survive redesigns; CSS class selectors break when a developer renames a class.\n\ngetByRole() is the most resilient: it queries the accessibility tree the same way a screen reader does. getByLabel() is great for form fields. getByTestId() is a fallback for elements that lack semantic meaning — add data-testid attributes specifically for testing.',
    concepts: [
      'getByRole() — queries the a11y tree; most resilient to UI changes',
      'getByLabel() — best for form inputs paired with <label>',
      'getByText() — for buttons, links, and static text',
      'getByTestId() — fallback; requires data-testid on element',
      'getByPlaceholder() — useful when no label is present',
      'Avoid CSS selectors and XPath in new tests',
      'locator.filter() narrows down a list of matching elements',
    ],
    snippets: [
      {
        label: 'Locator examples',
        language: 'typescript',
        code: `// ✅ Preferred: semantic locators
page.getByRole('button', { name: 'Submit' })
page.getByRole('textbox', { name: 'Email' })
page.getByLabel('Password')
page.getByText('Forgot password?')
page.getByPlaceholder('Search...')

// ✅ Test-id: explicit QA hook
page.getByTestId('submit-btn')

// ❌ Avoid: brittle CSS / XPath
page.locator('.btn-primary')
page.locator('//button[@class="submit"]')

// Chaining & filtering
const rows = page.getByRole('row')
const activeRow = rows.filter({ hasText: 'Active' })
await expect(activeRow).toHaveCount(3)`,
      },
    ],
  },
  {
    id: 'assertions',
    title: 'Assertions & Expect API',
    level: 'Intermediate',
    minutes: 10,
    summary: 'Master the expect() API: visibility, text, value, URL, count, and soft assertions.',
    body: 'Every assertion in Playwright starts with expect() and returns a matcher. The most important thing to remember: Playwright assertions are async — always await them, or they won\'t actually run.\n\nSoft assertions don\'t stop the test on failure. They collect all failures and report them together at the end, which is useful for form validation tests where you want to check every field error.',
    concepts: [
      'Always await expect() — it\'s async and polls until timeout',
      'toBeVisible() vs toBeAttached() — visible checks CSS; attached checks DOM',
      'toHaveText() accepts strings and regex',
      'expect.soft() collects failures without stopping the test',
      'expect.poll() for custom async conditions',
      'Default assertion timeout is 5000ms (configurable)',
    ],
    snippets: [
      {
        label: 'Common assertions',
        language: 'typescript',
        code: `// Visibility
await expect(page.getByRole('dialog')).toBeVisible()
await expect(page.getByText('Loading...')).toBeHidden()

// Text & value
await expect(page.getByRole('heading')).toHaveText('Dashboard')
await expect(page.getByRole('textbox')).toHaveValue('john@example.com')

// URL & title
await expect(page).toHaveURL('/dashboard')
await expect(page).toHaveTitle(/Dashboard/)

// Count
await expect(page.getByRole('listitem')).toHaveCount(5)

// State
await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled()
await expect(page.getByRole('checkbox')).toBeChecked()

// Soft assertions — collect all, report at end
await expect.soft(page.getByTestId('name-error')).toBeVisible()
await expect.soft(page.getByTestId('email-error')).toBeVisible()`,
      },
    ],
  },
  {
    id: 'pom',
    title: 'Page Object Model (POM)',
    level: 'Intermediate',
    minutes: 15,
    summary: 'Structure your tests using the POM pattern for maintainable, reusable page interactions.',
    body: 'The Page Object Model wraps each page of your app in a class. The class holds all locators and actions for that page. Tests use these classes instead of raw page API calls.\n\nWhy POM? When the UI changes, you update one class — not every test. Tests become readable: loginPage.login(email, password) is more expressive than three raw Playwright calls.',
    concepts: [
      'Each page = one class; keep locators as class properties',
      'Action methods (login, addToCart) return void or the next Page Object',
      'Assertion methods (expectWelcomeMessage) belong in the POM too',
      'Use fixtures to inject POM instances into tests automatically',
      'Don\'t add logic to POMs — keep them as thin wrappers',
    ],
    snippets: [
      {
        label: 'pages/LoginPage.ts',
        language: 'typescript',
        code: `import { type Page, type Locator } from '@playwright/test'

export class LoginPage {
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator

  constructor(private page: Page) {
    this.emailInput    = page.getByLabel('Email')
    this.passwordInput = page.getByLabel('Password')
    this.submitButton  = page.getByRole('button', { name: 'Sign in' })
    this.errorMessage  = page.getByRole('alert')
  }

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }
}`,
      },
      {
        label: 'Using POM in a test',
        language: 'typescript',
        code: `import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'

test('login with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.goto()
  await loginPage.login('user@example.com', 'password123')

  await expect(page).toHaveURL('/dashboard')
})`,
      },
    ],
  },
  {
    id: 'api-playwright',
    title: 'API Testing with Playwright',
    level: 'Intermediate',
    minutes: 15,
    summary: 'Test REST APIs directly using Playwright\'s APIRequestContext — no browser needed.',
    body: 'Playwright includes a built-in HTTP client via the request fixture. You can test API endpoints directly without spinning up a browser. This is faster than E2E tests and great for contract testing.\n\nCombining API and UI: use API calls to seed data before a UI test, then verify via the browser. This is much faster than creating test data through the UI.',
    concepts: [
      'request fixture — Playwright\'s built-in HTTP client',
      'request.get/post/put/delete return APIResponse objects',
      'response.json() parses the body; response.status() returns HTTP code',
      'Set default headers (auth tokens) in playwright.config.ts extraHTTPHeaders',
      'Use API to seed data before UI tests for speed',
    ],
    snippets: [
      {
        label: 'API test with request fixture',
        language: 'typescript',
        code: `import { test, expect } from '@playwright/test'

test('GET /users returns 200 with array', async ({ request }) => {
  const response = await request.get('/api/users')
  expect(response.status()).toBe(200)

  const body = await response.json()
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBeGreaterThan(0)
})

test('POST /users creates a user', async ({ request }) => {
  const response = await request.post('/api/users', {
    data: { name: 'Alice', email: 'alice@test.com' },
    headers: { Authorization: 'Bearer test-token' },
  })

  expect(response.status()).toBe(201)
  const user = await response.json()
  expect(user.email).toBe('alice@test.com')
})`,
      },
      {
        label: 'Seed data via API before UI test',
        language: 'typescript',
        code: `test('shows created product in list', async ({ page, request }) => {
  // Seed via API (fast)
  await request.post('/api/products', {
    data: { name: 'Test Widget', price: 9.99 },
  })

  // Assert in UI
  await page.goto('/products')
  await expect(page.getByText('Test Widget')).toBeVisible()
})`,
      },
    ],
  },
  {
    id: 'api-postman',
    title: 'API Testing with Postman',
    level: 'Intermediate',
    minutes: 10,
    summary: 'Use Postman collections for manual API exploration and Newman CLI for automated runs.',
    body: 'Postman is a GUI tool for building and testing API requests. Collections group related requests; environments hold variables like base URLs and auth tokens. The Tests tab lets you write JavaScript assertions that run after each request.\n\nNewman is the CLI runner for Postman collections — it lets you run the same collections in CI without the GUI.',
    concepts: [
      'Collections = organized groups of requests (like test suites)',
      'Environments store variables: {{baseUrl}}, {{authToken}}',
      'pm.test() defines a test assertion in the Tests tab',
      'pm.response.json() parses the response body',
      'Newman CLI runs collections headlessly in CI',
      'Export collection as JSON and commit to source control',
    ],
    snippets: [
      {
        label: 'Postman test script (Tests tab)',
        language: 'javascript',
        code: `// Run after the request executes
pm.test('Status is 200', () => {
  pm.response.to.have.status(200)
})

pm.test('Response has users array', () => {
  const body = pm.response.json()
  pm.expect(body).to.be.an('array')
  pm.expect(body.length).to.be.above(0)
})

pm.test('Each user has email', () => {
  const body = pm.response.json()
  body.forEach(user => {
    pm.expect(user).to.have.property('email')
  })
})

// Save value for next request
pm.environment.set('userId', pm.response.json()[0].id)`,
      },
      {
        label: 'Run collection via Newman CLI',
        language: 'bash',
        code: `# Install Newman
npm install -g newman

# Run a collection
newman run collection.json -e environment.json

# With HTML report
npm install -g newman-reporter-htmlextra
newman run collection.json \
  -e environment.json \
  -r htmlextra \
  --reporter-htmlextra-export report.html`,
      },
    ],
  },
  {
    id: 'sql',
    title: 'SQL & Database Testing',
    level: 'Intermediate',
    minutes: 15,
    summary: 'Verify application state by querying the database directly in your test setup and assertions.',
    body: 'Database testing completes the verification picture: UI tests confirm what the user sees, but DB tests confirm what was actually persisted. Use a direct DB connection in your test setup to seed data, then assert the expected DB state after UI actions.\n\nAlways clean up test data after each test to keep tests isolated. Use transactions that roll back, or explicit DELETE queries in afterEach().',
    concepts: [
      'Connect to DB in global setup; disconnect in teardown',
      'Seed: INSERT known data before the test so assertions are predictable',
      'Assert: query DB after UI action to verify persistence',
      'Cleanup: DELETE test rows in afterEach() or use a transaction rollback',
      'Use a separate test database — never run tests against production',
      'Parameterized queries prevent SQL injection in test code too',
    ],
    snippets: [
      {
        label: 'Postgres connection setup',
        language: 'typescript',
        code: `// tests/fixtures/db.ts
import { Pool } from 'pg'

export const pool = new Pool({
  connectionString: process.env.TEST_DATABASE_URL,
})

// Call in global teardown
export async function closeDb() {
  await pool.end()
}`,
      },
      {
        label: 'Seed + assert + cleanup pattern',
        language: 'typescript',
        code: `import { test, expect } from '@playwright/test'
import { pool } from './fixtures/db'

test.afterEach(async () => {
  await pool.query("DELETE FROM users WHERE email LIKE '%@test.com'")
})

test('user profile page shows correct data', async ({ page }) => {
  // Seed known data
  await pool.query(
    'INSERT INTO users(name, email, status) VALUES($1, $2, $3)',
    ['Alice', 'alice@test.com', 'active']
  )

  await page.goto('/users/alice@test.com')
  await expect(page.getByRole('heading')).toHaveText('Alice')

  // Assert DB state after a UI action
  await page.getByRole('button', { name: 'Deactivate' }).click()
  const { rows } = await pool.query(
    'SELECT status FROM users WHERE email = $1',
    ['alice@test.com']
  )
  expect(rows[0].status).toBe('inactive')
})`,
      },
    ],
  },
  {
    id: 'visual-a11y',
    title: 'Visual & Accessibility Testing',
    level: 'Intermediate',
    minutes: 10,
    summary: 'Catch visual regressions with screenshots and WCAG violations with axe-core.',
    body: 'Visual regression testing captures screenshots and compares them to stored baselines. Any pixel difference is flagged. This catches unexpected layout shifts, color changes, and broken components that functional tests miss.\n\nAccessibility testing with axe-core automatically checks WCAG 2.1 rules: missing alt text, poor color contrast, unlabeled buttons, and more. Running axe on every page takes seconds and prevents shipping accessibility bugs.',
    concepts: [
      'toHaveScreenshot() compares against stored .png baselines',
      'Run with --update-snapshots to accept new baselines',
      'Mask dynamic content (timestamps, avatars) before screenshot',
      '@axe-core/playwright injects axe into the page and reports violations',
      'checkA11y() throws if any violation exceeds the configured impact level',
      'Target specific components: checkA11y(page.getByRole("dialog"))',
    ],
    snippets: [
      {
        label: 'Visual regression test',
        language: 'typescript',
        code: `import { test, expect } from '@playwright/test'

test('dashboard looks correct', async ({ page }) => {
  await page.goto('/dashboard')

  // Mask dynamic content before snapshot
  await expect(page).toHaveScreenshot('dashboard.png', {
    mask: [page.getByTestId('user-avatar'), page.getByTestId('timestamp')],
    maxDiffPixelRatio: 0.02, // allow 2% difference
  })
})`,
      },
      {
        label: 'Accessibility test with axe-core',
        language: 'typescript',
        code: `import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('login page has no WCAG violations', async ({ page }) => {
  await page.goto('/login')

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze()

  expect(results.violations).toEqual([])
})

// Check a specific component only
test('modal is accessible', async ({ page }) => {
  await page.getByRole('button', { name: 'Open modal' }).click()
  const results = await new AxeBuilder({ page })
    .include('[role="dialog"]')
    .analyze()
  expect(results.violations).toEqual([])
})`,
      },
    ],
  },
  {
    id: 'ci-cd',
    title: 'CI/CD with GitHub Actions',
    level: 'Advanced',
    minutes: 15,
    summary: 'Run Playwright tests automatically on every PR using GitHub Actions with parallel sharding.',
    body: 'Running tests in CI ensures nothing ships without tests passing. GitHub Actions provides free CI for public repos and reasonable free minutes for private ones.\n\nSharding splits your test suite across multiple parallel workers. 4 shards run your 400 tests in 25% of the time. The merge-reports job combines all shard results into a single HTML report.',
    concepts: [
      'actions/checkout + setup-node are the standard CI boilerplate',
      'cache: npm reduces install time on every run',
      'npx playwright install --with-deps installs browsers + OS dependencies',
      'Sharding: --shard=1/4 runs 25% of tests; merge them after',
      'Upload test results as artifacts for debugging failures',
      'Set PLAYWRIGHT_BASE_URL env var to point at a deployed preview',
    ],
    snippets: [
      {
        label: '.github/workflows/playwright.yml',
        language: 'yaml',
        code: `name: Playwright Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test --shard=\${{ matrix.shard }}/4
        env:
          PLAYWRIGHT_BASE_URL: http://localhost:3000
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: blob-report-\${{ matrix.shard }}
          path: blob-report/
          retention-days: 7

  merge-reports:
    needs: test
    runs-on: ubuntu-latest
    if: always()
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          path: all-blob-reports
          pattern: blob-report-*
          merge-multiple: true
      - run: npx playwright merge-reports --reporter html ./all-blob-reports
      - uses: actions/upload-artifact@v4
        with:
          name: html-report
          path: playwright-report/`,
      },
    ],
  },
  {
    id: 'ai-claude',
    title: 'AI-Powered QA with Claude',
    level: 'Advanced',
    minutes: 10,
    summary: 'Use the open-qa agents to self-heal broken locators, auto-triage bugs, and generate tests with Claude.',
    body: 'This toolkit brings Claude AI into your QA workflow. Instead of manually fixing broken selectors after a UI change, the Self-Healing Locator agent suggests a new getByRole locator from a DOM snapshot. Instead of writing bug reports from scratch, the Auto Bug Triage agent reads your error logs and produces a Jira-ready report.\n\nThe Test Generator on the /generate page takes a user story and returns a complete Playwright .spec.ts file — a solid starting point that you refine rather than write from scratch.',
    concepts: [
      'Self-Healing Locator: paste failed locator + DOM → get replacement locator',
      'Auto Bug Triage: paste error log → get structured Jira-ready bug report',
      'Test Generator: paste user story → get .spec.ts file scaffold',
      'Auto-POM Builder: paste HTML → get TypeScript Page Object class',
      'MOCK mode: all agents work without an API key for demos',
      'Set ANTHROPIC_API_KEY in .env for live Claude calls',
    ],
    snippets: [
      {
        label: 'Use Self-Healing Locator agent',
        language: 'typescript',
        code: `// When a locator breaks, the agent suggests a fix.
// Input: failed locator + stripped DOM context
const response = await fetch('/api/run/healing', {
  method: 'POST',
  body: JSON.stringify({
    failed_locator: 'page.locator(".submit-btn")',
    dom_snapshot: '<button data-testid="submit" aria-label="Submit form">Submit</button>',
  }),
})
const { output } = await response.json()
// output: 'page.getByRole("button", { name: "Submit form" })'`,
      },
      {
        label: '.env configuration',
        language: 'bash',
        code: `# .env (never commit this file)
ANTHROPIC_API_KEY=sk-ant-...   # Required for live Claude calls
MOCK_MODE=false                 # Set to true to use mock responses

# Then start the server
npm run dev    # starts UI on :5173 + API server on :3001`,
      },
    ],
  },
]

const STORAGE_KEY = 'guides_completed'

const levelColors: Record<Guide['level'], string> = {
  Beginner:     'bg-sage-100 text-sage-700',
  Intermediate: 'bg-amber-50 text-amber-600',
  Advanced:     'bg-primary-50 text-primary-700',
}

function GuideChapter({
  guide,
  index,
  completed,
  onToggleComplete,
}: {
  guide: Guide
  index: number
  completed: boolean
  onToggleComplete: (id: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="rounded-2xl border overflow-hidden transition-all duration-200"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
    >
      {/* Header row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-sand-400 transition-colors"
      >
        <span className="text-xs font-mono shrink-0 w-6 text-center" style={{ color: 'var(--text-muted)' }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="flex-1 font-semibold text-sm" style={{ color: 'var(--text-main)' }}>
          {guide.title}
        </span>
        <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${levelColors[guide.level]}`}>
          {guide.level}
        </span>
        <span className="shrink-0 text-xs" style={{ color: 'var(--text-muted)' }}>
          {guide.minutes} min
        </span>
        <span style={{ color: 'var(--text-muted)' }}>
          {open ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
        </span>
      </button>

      {/* Summary — always visible */}
      {!open && (
        <p className="px-5 pb-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          {guide.summary}
        </p>
      )}

      {/* Expanded body */}
      {open && (
        <div className="px-5 pb-5 flex flex-col gap-5 border-t" style={{ borderColor: 'var(--border)' }}>
          {/* Body paragraphs */}
          <div className="pt-4 flex flex-col gap-3">
            {guide.body.split('\n\n').map((para, i) => (
              <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {para}
              </p>
            ))}
          </div>

          {/* Key concepts */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-main)' }}>
              Key Concepts
            </p>
            <ul className="flex flex-col gap-1.5">
              {guide.concepts.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary-600 shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </div>

          {/* Code snippets */}
          {guide.snippets.map((s, i) => (
            <div key={i}>
              <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                {s.label}
              </p>
              <CodeSnippet code={s.code} language={s.language} />
            </div>
          ))}

          {/* Mark complete */}
          <button
            onClick={() => onToggleComplete(guide.id)}
            className={`self-start flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-95 ${
              completed
                ? 'bg-sage-100 text-sage-700 hover:bg-sage-200'
                : 'bg-sand-400 hover:bg-sand-500'
            }`}
            style={completed ? {} : { color: 'var(--text-main)' }}
          >
            {completed
              ? <><CheckCircleIcon sx={{ fontSize: 14 }} /> Completed</>
              : <><RadioButtonUncheckedIcon sx={{ fontSize: 14 }} /> Mark as complete</>
            }
          </button>
        </div>
      )}
    </div>
  )
}

export default function GuidesPage() {
  const [completed, setCompleted] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed))
  }, [completed])

  const toggleComplete = (id: string) => {
    setCompleted(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const total = GUIDES.length
  const done = completed.length
  const pct = Math.round((done / total) * 100)

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-up">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <MenuBookOutlinedIcon sx={{ fontSize: 20 }} className="text-primary-600" />
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-main)' }}>
            QA Automation Guides
          </h1>
        </div>
        <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
          12 hands-on chapters — from zero to AI-powered test automation. Each chapter includes narrative explanation, key concepts, and copy-ready code.
        </p>

        {/* Progress bar */}
        <div
          className="p-4 rounded-2xl border"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-main)' }}>
              Progress
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {done} / {total} completed
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-body)' }}>
            <div
              className="h-full rounded-full bg-primary-600 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
            {pct}% — {done === total ? '🎉 Course complete!' : `${total - done} chapters remaining`}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-5">
        {(['Beginner', 'Intermediate', 'Advanced'] as const).map(l => (
          <span key={l} className={`text-xs font-medium px-2 py-0.5 rounded-full ${levelColors[l]}`}>
            {l}
          </span>
        ))}
      </div>

      {/* Chapters */}
      <div className="flex flex-col gap-3">
        {GUIDES.map((guide, i) => (
          <GuideChapter
            key={guide.id}
            guide={guide}
            index={i}
            completed={completed.includes(guide.id)}
            onToggleComplete={toggleComplete}
          />
        ))}
      </div>
    </div>
  )
}
