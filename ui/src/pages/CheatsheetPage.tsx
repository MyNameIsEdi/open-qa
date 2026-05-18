import { useState } from 'react'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import CodeSnippet from '../components/CodeSnippet'

interface Section {
  title: string
  snippets: { label: string; code: string; language: string }[]
}

const sections: Section[] = [
  {
    title: 'Playwright Locators',
    snippets: [
      {
        label: 'By role (preferred)',
        language: 'typescript',
        code: `// Semantic locators — most resilient to UI changes
await page.getByRole('button', { name: 'Submit' }).click()
await page.getByRole('textbox', { name: 'Email' }).fill('user@example.com')
await page.getByRole('heading', { name: 'Dashboard' }).isVisible()
await page.getByRole('link', { name: /sign in/i }).click()`,
      },
      {
        label: 'By label / placeholder / text',
        language: 'typescript',
        code: `await page.getByLabel('Password').fill('secret123')
await page.getByPlaceholder('Search...').fill('query')
await page.getByText('Welcome back').isVisible()
await page.getByAltText('Company logo').isVisible()`,
      },
      {
        label: 'By test ID (data-testid)',
        language: 'typescript',
        code: `// Set in playwright.config.ts: use: { testIdAttribute: 'data-testid' }
await page.getByTestId('submit-btn').click()
await page.getByTestId('user-avatar').isVisible()`,
      },
      {
        label: 'Chaining & filtering',
        language: 'typescript',
        code: `// Filter within a parent
const row = page.getByRole('row', { name: 'Alice' })
await row.getByRole('button', { name: 'Edit' }).click()

// nth element
await page.getByRole('listitem').nth(2).click()

// filter by has
await page.getByRole('listitem').filter({ hasText: 'Pro plan' }).click()`,
      },
    ],
  },
  {
    title: 'Common Assertions (expect)',
    snippets: [
      {
        label: 'Visibility & state',
        language: 'typescript',
        code: `await expect(page.getByRole('alert')).toBeVisible()
await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled()
await expect(page.getByRole('checkbox')).toBeChecked()
await expect(page.getByTestId('spinner')).toBeHidden()`,
      },
      {
        label: 'Text & value',
        language: 'typescript',
        code: `await expect(page.getByRole('heading')).toHaveText('Welcome')
await expect(page.getByRole('textbox')).toHaveValue('prefilled')
await expect(page.locator('[data-count]')).toHaveAttribute('data-count', '5')
await expect(page.getByRole('status')).toContainText('saved')`,
      },
      {
        label: 'URL & title',
        language: 'typescript',
        code: `await expect(page).toHaveURL('/dashboard')
await expect(page).toHaveURL(/.*checkout.*/)
await expect(page).toHaveTitle('My App — Dashboard')`,
      },
      {
        label: 'Count',
        language: 'typescript',
        code: `await expect(page.getByRole('listitem')).toHaveCount(3)
await expect(page.getByRole('row').filter({ hasText: 'active' })).toHaveCount(2)`,
      },
    ],
  },
  {
    title: 'Network Intercept Patterns',
    snippets: [
      {
        label: 'Mock API response',
        language: 'typescript',
        code: `await page.route('**/api/users', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([{ id: 1, name: 'Alice' }]),
  })
})`,
      },
      {
        label: 'Intercept & modify',
        language: 'typescript',
        code: `await page.route('**/api/products', async (route) => {
  const response = await route.fetch()
  const json = await response.json()
  json.push({ id: 999, name: 'Test Item' }) // inject
  await route.fulfill({ response, body: JSON.stringify(json) })
})`,
      },
      {
        label: 'Simulate error / 500',
        language: 'typescript',
        code: `await page.route('**/api/checkout', (route) =>
  route.fulfill({ status: 500, body: 'Internal Server Error' })
)`,
      },
      {
        label: 'Wait for specific request',
        language: 'typescript',
        code: `const [request] = await Promise.all([
  page.waitForRequest('**/api/submit'),
  page.getByRole('button', { name: 'Submit' }).click(),
])
expect(request.method()).toBe('POST')
expect(request.postDataJSON()).toMatchObject({ name: 'Alice' })`,
      },
    ],
  },
  {
    title: 'Page Object Model',
    snippets: [
      {
        label: 'POM class template',
        language: 'typescript',
        code: `import { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitBtn: Locator
  readonly errorMsg: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByRole('textbox', { name: 'Email' })
    this.passwordInput = page.getByLabel('Password')
    this.submitBtn = page.getByRole('button', { name: 'Sign in' })
    this.errorMsg = page.getByRole('alert')
  }

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitBtn.click()
  }
}`,
      },
      {
        label: 'Using POM in a test',
        language: 'typescript',
        code: `import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage'

test('successful login', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.goto()
  await loginPage.login('user@example.com', 'password123')
  await expect(page).toHaveURL('/dashboard')
})`,
      },
    ],
  },
  {
    title: 'playwright.config.ts Templates',
    snippets: [
      {
        label: 'Base config',
        language: 'typescript',
        code: `import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    testIdAttribute: 'data-testid',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})`,
      },
      {
        label: 'Auth setup project (storageState)',
        language: 'typescript',
        code: `// In playwright.config.ts projects array:
{
  name: 'setup',
  testMatch: /.*\\.setup\\.ts/,
},
{
  name: 'authenticated',
  use: { storageState: 'playwright/.auth/user.json' },
  dependencies: ['setup'],
},

// In auth.setup.ts:
import { test as setup } from '@playwright/test'
const authFile = 'playwright/.auth/user.json'

setup('authenticate', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('user@example.com')
  await page.getByLabel('Password').fill('password123')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('/dashboard')
  await page.context().storageState({ path: authFile })
})`,
      },
    ],
  },
  {
    title: 'GitHub Actions CI',
    snippets: [
      {
        label: 'Playwright CI workflow',
        language: 'yaml',
        code: `name: Playwright Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
        env:
          BASE_URL: http://localhost:3000
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7`,
      },
      {
        label: 'Sharded parallel runs',
        language: 'yaml',
        code: `jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test --shard=\${{ matrix.shard }}/4`,
      },
    ],
  },
]

function CheatSection({ section }: { section: Section }) {
  const [open, setOpen] = useState(true)

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-neutral-50 transition-colors text-left"
      >
        <h2 className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>
          {section.title}
          <span className="ml-2 text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
            {section.snippets.length} snippet{section.snippets.length !== 1 ? 's' : ''}
          </span>
        </h2>
        {open ? (
          <ExpandLessIcon sx={{ fontSize: 18 }} style={{ color: 'var(--text-muted)' }} />
        ) : (
          <ExpandMoreIcon sx={{ fontSize: 18 }} style={{ color: 'var(--text-muted)' }} />
        )}
      </button>

      {open && (
        <div className="px-5 pb-5 grid sm:grid-cols-2 gap-4">
          {section.snippets.map((s) => (
            <div key={s.label} className="flex flex-col gap-1.5">
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {s.label}
              </p>
              <CodeSnippet code={s.code} language={s.language} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CheatsheetPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
          <MenuBookOutlinedIcon className="text-primary-500" sx={{ fontSize: 24 }} />
          QA Cheatsheet
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Quick-copy Playwright patterns, assertions, and CI snippets. Click any code block to copy it.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {sections.map((section) => (
          <CheatSection key={section.title} section={section} />
        ))}
      </div>
    </div>
  )
}
