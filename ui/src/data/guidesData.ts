export interface GuideLesson {
  id: string
  type: 'video' | 'article' | 'practice' | 'exam' | 'tips' | 'summary'
  title: string
  titleHe: string
  level?: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string        // e.g. "12 min"
  body: string            // English paragraphs separated by \n\n
  bodyHe: string
  concepts: string[]
  conceptsHe: string[]
  snippets: { label: string; labelHe: string; code: string; language: string }[]
  preview?: boolean       // free preview lesson
}

export interface GuideSection {
  id: string
  title: string
  titleHe: string
  lessons: GuideLesson[]
}

export interface GuideCourse {
  id: string
  title: string
  titleHe: string
  subtitle: string
  subtitleHe: string
  icon: string
  sections: GuideSection[]
}

// ─── Single unified course ────────────────────────────────────────────────────
export const COURSE: GuideCourse = {
  id: 'qa-automation',
  title: 'QA Automation — Full Course',
  titleHe: 'אוטומציית QA — קורס מלא',
  subtitle: 'From zero to AI-powered test automation',
  subtitleHe: 'מאפס לאוטומציית בדיקות מבוססת AI',
  icon: '🎓',

  sections: [
    // ─── 1. Welcome ──────────────────────────────────────────────────────────
    {
      id: 'welcome',
      title: 'Welcome',
      titleHe: 'ברוכים הבאים',
      lessons: [
        {
          id: 'intro-qa',
          type: 'article',
          title: 'What is QA Automation?',
          titleHe: 'מה זו אוטומציית QA?',
          duration: '5 min',
          preview: true,
          body: `Quality Assurance (QA) is the process of ensuring that software meets its intended requirements and behaves correctly. QA automation replaces repetitive manual checks with scripts that run automatically — saving time, catching regressions early, and giving your team confidence to ship.

The testing pyramid describes three layers of tests. Unit tests sit at the base — they are fast, cheap to write, and test individual functions. Integration tests in the middle verify that several components work together. End-to-end (E2E) tests at the top simulate a real user interacting with the whole system through a browser.

A good test suite has many unit tests, a moderate number of integration tests, and a focused set of E2E tests. Playwright is the modern tool of choice for E2E testing — it is built by Microsoft, supports all major browsers, and has first-class TypeScript support.`,
          bodyHe: `הבטחת איכות תוכנה (QA) היא תהליך שמוודא שהתוכנה עומדת בדרישות שלה ומתנהגת כצפוי. אוטומציית QA מחליפה בדיקות ידניות חוזרות בסקריפטים שרצים אוטומטית — חוסכת זמן, תופסת רגרסיות מוקדם ונותנת לצוות ביטחון לשחרר גרסאות.

פירמידת הבדיקות מתארת שלוש שכבות. בסיס הפירמידה הן בדיקות יחידה — מהירות, זולות לכתיבה, ובודקות פונקציות בודדות. באמצע נמצאות בדיקות אינטגרציה שמאמתות שמספר רכיבים עובדים יחד. בראש הפירמידה נמצאות בדיקות End-to-End שמדמות משתמש אמיתי המשתמש במערכת השלמה דרך הדפדפן.

חבילת בדיקות טובה כוללת הרבה בדיקות יחידה, כמות מתונה של בדיקות אינטגרציה, ומספר ממוקד של בדיקות E2E. Playwright הוא הכלי המוביל כיום לבדיקות E2E — פותח על ידי Microsoft, תומך בכל הדפדפנים המרכזיים, ויש לו תמיכה מלאה ב-TypeScript.`,
          concepts: [
            'QA = ensuring software meets requirements and works correctly',
            'Automation replaces repetitive manual checks with scripts',
            'Testing pyramid: unit (fast/many) → integration → E2E (slow/few)',
            'Playwright: Microsoft E2E framework, all browsers, TypeScript',
            'MOCK mode: try all agents in this toolkit without an API key',
          ],
          conceptsHe: [
            'QA = וידוא שהתוכנה עומדת בדרישות ועובדת כמצופה',
            'אוטומציה מחליפה בדיקות ידניות חוזרות בסקריפטים',
            'פירמידת בדיקות: יחידה (מהיר/רבות) → אינטגרציה → E2E (איטי/מעטות)',
            'Playwright: פריימוורק E2E של Microsoft, כל הדפדפנים, TypeScript',
            'מצב MOCK: נסה את כל הסוכנים בערכת כלים זו ללא מפתח API',
          ],
          snippets: [
            {
              label: 'Install Playwright',
              labelHe: 'התקנת Playwright',
              language: 'bash',
              code: `npm init playwright@latest
# Choose: TypeScript · tests/ folder · GitHub Actions CI`,
            },
          ],
        },
        {
          id: 'course-overview',
          type: 'article',
          title: 'Course Overview — What Will We Learn?',
          titleHe: 'סקירת הקורס — מה נלמד?',
          duration: '3 min',
          preview: true,
          body: `This course covers five major areas of modern QA engineering, taking you from foundational concepts all the way through advanced AI-assisted testing.\n\nAutomation — when to automate and which tests require it, major tools, and the real limits of automation.\n\nLoad Testing — what load, performance, stress, and soak tests are, when you need them, and how they differ.\n\nHardware-Integrated Systems — what embedded and IoT systems are, where we encounter them in daily life, and how they affect QA.\n\nSQL — the database world: reading and writing queries to analyze data precisely, from SELECT basics to complex JOINs.\n\nEnrichment — using AI for testing, the basics of DevOps in a QA context, and cybersecurity fundamentals every tester should know.`,
          bodyHe: `הקורס מכסה חמישה תחומים מרכזיים בהנדסת QA מודרנית, ומוביל אתכם מרעיונות יסודיים ועד לבדיקות מתקדמות מבוססות AI.\n\nאוטומציה — מתי לאוטומט ואילו בדיקות מחייבות זאת, כלים מרכזיים, ומגבלות האוטומציה.\n\nבדיקות עומסים — מהן בדיקות עומס, ביצועים, עקה וסיבולת, מתי צריך אותן ומה ההבדלים.\n\nמערכות משולבות חומרה — מהן מערכות משובצות ו-IoT, איפה פוגשים אותן בחיי היומיום, ואיך הן משפיעות על QA.\n\nSQL — עולם הדאטהבייס: קריאה וכתיבה של שאילתות לניתוח נתונים בדיוק מרבי, מ-SELECT בסיסי ועד JOINs מורכבים.\n\nהעשרה — שימוש ב-AI לבדיקות, יסודות DevOps בהקשר של QA, ויסודות אבטחת מידע שכל טסטר צריך לדעת.`,
          concepts: [
            '5 modules: Automation · Load Testing · Hardware · SQL · Enrichment',
            'Beginner-friendly — no prior programming needed for most modules',
            'Each lesson includes bilingual content (English + Hebrew)',
            'Code snippets are copy-ready for real projects',
          ],
          conceptsHe: [
            '5 מודולים: אוטומציה · עומסים · חומרה · SQL · העשרה',
            'מתאים למתחילים — לא נדרשת ידע תכנות מוקדם לרוב המודולים',
            'כל שיעור כולל תוכן דו-לשוני (אנגלית + עברית)',
            'קטעי קוד מוכנים להעתקה לפרויקטים אמיתיים',
          ],
          snippets: [],
        },
      ],
    },

    // ─── 2. Automation ────────────────────────────────────────────────────────
    {
      id: 'automation',
      title: 'Automation Testing',
      titleHe: 'שימוש באוטומציה',
      lessons: [
        {
          id: 'when-to-automate',
          type: 'article',
          title: 'When to Automate — and When Not To',
          titleHe: 'מתי לאוטומט — ומתי לא',
          duration: '12 min',
          body: `Not every test should be automated. The decision requires weighing the cost of writing and maintaining the automation against the benefit of repeated execution. The general rule: automate tests that run frequently, are stable, and would be tedious to run manually.\n\nTests that are strong candidates for automation: regression suites that must pass before every release, smoke tests that verify the system is up, data-driven tests with many parameter combinations, and API tests that are fast and deterministic.\n\nTests that resist automation: exploratory testing (a human probing for unknown bugs), usability testing (subjective human experience), one-off tests for a bug that will never recur, and tests on UIs so unstable that selectors break every sprint.\n\nThe testing pyramid guides the balance: invest most automation budget in fast unit tests, a moderate amount in integration tests, and keep E2E tests focused on the critical happy-paths only.`,
          bodyHe: `לא כל בדיקה צריכה להיות אוטומטית. ההחלטה דורשת שקילת עלות כתיבת האוטומציה ותחזוקתה מול תועלת הריצה החוזרת. הכלל הכללי: אוטומטו בדיקות שרצות לעתים קרובות, יציבות, ויהיה משעמם להריץ ידנית.\n\nבדיקות שמתאימות לאוטומציה: חבילות רגרסיה שחייבות לעבור לפני כל גרסה, בדיקות עשן שמאמתות שהמערכת פועלת, בדיקות מונעות-נתונים עם שילובי פרמטרים רבים, ובדיקות API שמהירות ודטרמיניסטיות.\n\nבדיקות שמתנגדות לאוטומציה: בדיקות אקספלורטוריות (אדם חוקר באגים לא ידועים), בדיקות שימושיות (חוויה סובייקטיבית), בדיקות חד-פעמיות לבאג שלא יחזור, ובדיקות על UI כל כך לא יציב שה-selectors מתוקנים כל ספרינט.\n\nפירמידת הבדיקות מנחה את האיזון: השקיעו את רוב תקציב האוטומציה בבדיקות יחידה מהירות, כמות מתונה בבדיקות אינטגרציה, ושמרו על בדיקות E2E ממוקדות בנתיבי ה-happy-path הקריטיים בלבד.`,
          concepts: [
            'Automate: regression, smoke, data-driven, API tests',
            'Don\'t automate: exploratory, usability, one-off, unstable UI tests',
            'Automation ROI = (manual time saved × runs) − (write + maintain cost)',
            'Flaky tests erode trust — fix or delete them immediately',
            'Test pyramid: unit (70%) · integration (20%) · E2E (10%)',
          ],
          conceptsHe: [
            'לאוטומט: בדיקות רגרסיה, עשן, מונעות-נתונים ו-API',
            'לא לאוטומט: אקספלורטורי, שימושיות, חד-פעמיות, UI לא יציב',
            'ROI אוטומציה = (זמן ידני שנחסך × ריצות) − (עלות כתיבה + תחזוקה)',
            'בדיקות flaky מחלישות את האמון — תקנו או מחקו אותן מיד',
            'פירמידת בדיקות: יחידה (70%) · אינטגרציה (20%) · E2E (10%)',
          ],
          snippets: [
            {
              label: 'Stable vs brittle locator',
              labelHe: 'Locator יציב מול שביר',
              language: 'typescript',
              code: `// ❌ Brittle — breaks when CSS class is renamed
page.locator('.btn-primary-v2')

// ✅ Stable — survives redesigns
page.getByRole('button', { name: 'Sign in' })
page.getByTestId('login-btn')`,
            },
          ],
        },
        {
          id: 'playwright-setup',
          type: 'article',
          title: 'Setting Up Playwright',
          titleHe: 'הגדרת Playwright',
          duration: '10 min',
          body: `After running the init command, Playwright creates a playwright.config.ts file. This file controls which browsers run, base URLs, timeouts, and retries. Understanding this file is key to a maintainable test suite.\n\nThe most important setting is baseURL — set this to your app's local dev URL so you can use relative paths like page.goto('/login') instead of full URLs. The retries setting is critical for CI: set it to 2 on CI and 0 locally so you get fast feedback during development but resilience against network flakiness in the pipeline.`,
          bodyHe: `לאחר הרצת פקודת האתחול, Playwright יוצר קובץ playwright.config.ts. קובץ זה שולט באילו דפדפנים רצים, בסיס URLs, timeouts ו-retries. הבנת קובץ זה היא המפתח לחבילת בדיקות הניתנת לתחזוקה.\n\nההגדרה החשובה ביותר היא baseURL — הגדירו אותה ל-URL פיתוח המקומי של האפליקציה שלכם כדי שתוכלו להשתמש בנתיבים יחסיים כמו page.goto('/login') במקום URLs מלאים. הגדרת retries קריטית ל-CI: הגדירו ל-2 ב-CI ו-0 מקומית כדי לקבל משוב מהיר בזמן פיתוח אבל עמידות בפני flakiness רשת בפייפליין.`,
          concepts: [
            'playwright.config.ts: browsers, timeouts, retries, baseURL',
            'projects: run against multiple browsers in parallel',
            'storageState: reuse auth sessions across tests',
            'trace: "on-first-retry" — captures full trace on test failure',
            'fullyParallel: true — each test file runs in its own worker',
          ],
          conceptsHe: [
            'playwright.config.ts: דפדפנים, timeouts, retries, baseURL',
            'projects: הרצה מול מספר דפדפנים במקביל',
            'storageState: שימוש חוזר בסשן אימות בין בדיקות',
            'trace: "on-first-retry" — תיעוד מלא בכישלון בדיקה',
            'fullyParallel: true — כל קובץ בדיקה רץ ב-worker משלו',
          ],
          snippets: [
            {
              label: 'playwright.config.ts',
              labelHe: 'playwright.config.ts',
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
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],
})`,
            },
          ],
        },
        {
          id: 'first-test',
          type: 'article',
          title: 'Writing Your First Test',
          titleHe: 'כתיבת הבדיקה הראשונה',
          duration: '10 min',
          body: `A Playwright test file exports test blocks using the test() function. Each test receives a page fixture — a browser tab — and uses it to navigate, click, fill forms, and assert results.\n\nThe expect() function wraps any locator and chains assertion methods. Playwright auto-waits for elements to be ready before interacting, so you rarely need explicit waits. This auto-waiting is one of Playwright's biggest advantages over older frameworks like Selenium.`,
          bodyHe: `קובץ בדיקת Playwright מייצא בלוקי test באמצעות הפונקציה test(). כל בדיקה מקבלת fixture של page — טאב בדפדפן — ומשתמשת בו לניווט, לחיצה, מילוי טפסים ואימות תוצאות.\n\nהפונקציה expect() עוטפת כל locator ומשרשרת מתודות assertion. Playwright ממתין אוטומטית שאלמנטים יהיו מוכנים לפני אינטראקציה, כך שכמעט ולא תצטרכו המתנות מפורשות. המתנה אוטומטית זו היא אחד היתרונות הגדולים של Playwright על פני פריימוורקים ישנים יותר כמו Selenium.`,
          concepts: [
            'test() wraps each case; describe() groups related tests',
            'page.goto() navigates; page.click() / page.fill() interact',
            'expect(locator).toBeVisible() / toHaveText() assert state',
            'Playwright auto-waits — never use manual sleep()',
            'beforeEach() runs setup before every test in a describe block',
          ],
          conceptsHe: [
            'test() עוטף כל מקרה; describe() מקבץ בדיקות קשורות',
            'page.goto() מנווט; page.click() / page.fill() מתקשרים',
            'expect(locator).toBeVisible() / toHaveText() מאמתים מצב',
            'Playwright ממתין אוטומטית — לעולם אל תשתמש ב-sleep() ידני',
            'beforeEach() מריץ הגדרה לפני כל בדיקה בבלוק describe',
          ],
          snippets: [
            {
              label: 'tests/login.spec.ts',
              labelHe: 'tests/login.spec.ts',
              language: 'typescript',
              code: `import { test, expect } from '@playwright/test'

test.describe('Login flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('valid credentials → dashboard', async ({ page }) => {
    await page.getByLabel('Email').fill('user@example.com')
    await page.getByLabel('Password').fill('secret123')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/dashboard')
  })

  test('wrong password → error message', async ({ page }) => {
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
          type: 'article',
          title: 'Locator Strategies',
          titleHe: 'אסטרטגיות Locator',
          duration: '15 min',
          body: `The golden rule of locators: prefer user-visible attributes (role, label, text) over implementation details (CSS classes, XPath). User-visible locators survive redesigns; CSS class selectors break when a developer renames a class.\n\ngetByRole() is the most resilient locator — it queries the accessibility tree the same way a screen reader does. getByLabel() is great for form fields. getByTestId() is a safe fallback for elements without semantic meaning — add data-testid attributes specifically for testing.`,
          bodyHe: `כלל הזהב של locators: העדיפו תכונות גלויות למשתמש (role, label, text) על פני פרטי מימוש (מחלקות CSS, XPath). Locators גלויים למשתמש שורדים עיצובים מחדש; selectors של מחלקות CSS נשברים כאשר מפתח משנה שם מחלקה.\n\ngetByRole() הוא ה-locator החסין ביותר — הוא מבצע שאילתא על עץ הנגישות בדיוק כמו שקורא מסך עושה. getByLabel() מצוין לשדות טופס. getByTestId() הוא fallback בטוח לאלמנטים ללא משמעות סמנטית — הוסיפו תכונות data-testid ספציפית לצורך בדיקות.`,
          concepts: [
            'getByRole() — queries a11y tree; most resilient to UI changes',
            'getByLabel() — best for form inputs paired with <label>',
            'getByText() — for buttons, links, static copy',
            'getByTestId() — fallback; requires data-testid attribute',
            'Avoid CSS selectors and XPath in new tests',
            'locator.filter() narrows down a list of matching elements',
          ],
          conceptsHe: [
            'getByRole() — שאילתא על עץ a11y; החסין ביותר לשינויי UI',
            'getByLabel() — הטוב ביותר לשדות קלט עם <label>',
            'getByText() — לכפתורים, קישורים, טקסט סטטי',
            'getByTestId() — fallback; דורש תכונת data-testid',
            'הימנעו מ-CSS selectors ו-XPath בבדיקות חדשות',
            'locator.filter() מצמצם רשימה של אלמנטים תואמים',
          ],
          snippets: [
            {
              label: 'Locator examples',
              labelHe: 'דוגמאות Locator',
              language: 'typescript',
              code: `// ✅ Preferred — semantic
page.getByRole('button', { name: 'Submit' })
page.getByLabel('Password')
page.getByText('Forgot password?')
page.getByPlaceholder('Search...')
page.getByTestId('submit-btn')

// ❌ Avoid — brittle
page.locator('.btn-primary')
page.locator('//button[@class="submit"]')

// Filtering a list
const activeRows = page.getByRole('row').filter({ hasText: 'Active' })
await expect(activeRows).toHaveCount(3)`,
            },
          ],
        },
        {
          id: 'pom',
          type: 'article',
          title: 'Page Object Model (POM)',
          titleHe: 'מודל אובייקט עמוד (POM)',
          duration: '15 min',
          body: `The Page Object Model wraps each page of your app in a class. The class holds all locators and actions for that page. Tests use these classes instead of raw Playwright API calls.\n\nWhy POM? When the UI changes, you update one class — not every test that touches that page. Tests become readable: loginPage.login(email, password) communicates intent far better than three consecutive raw Playwright calls.`,
          bodyHe: `מודל אובייקט העמוד עוטף כל עמוד באפליקציה שלכם במחלקה. המחלקה מחזיקה את כל ה-locators והפעולות עבור אותו עמוד. הבדיקות משתמשות במחלקות אלו במקום בקריאות API ישירות של Playwright.\n\nלמה POM? כשה-UI משתנה, מעדכנים מחלקה אחת — לא כל בדיקה שנוגעת בעמוד זה. הבדיקות הופכות קריאות: loginPage.login(email, password) מתקשר כוונה הרבה יותר טוב משלוש קריאות Playwright עוקבות.`,
          concepts: [
            'One class per page; keep locators as class properties',
            'Action methods (login, addToCart) return void or next Page Object',
            'Assertion methods (expectWelcomeVisible) belong in the POM too',
            'Use fixtures to inject POM instances into tests automatically',
            'Keep POMs thin — no business logic inside',
          ],
          conceptsHe: [
            'מחלקה אחת לכל עמוד; שמרו locators כמאפייני מחלקה',
            'מתודות פעולה (login, addToCart) מחזירות void או Page Object הבא',
            'מתודות assertion (expectWelcomeVisible) שייכות גם ב-POM',
            'השתמשו ב-fixtures להזרקת מופעי POM לבדיקות אוטומטית',
            'שמרו POM-ים דקים — אין לוגיקה עסקית בפנים',
          ],
          snippets: [
            {
              label: 'pages/LoginPage.ts',
              labelHe: 'pages/LoginPage.ts',
              language: 'typescript',
              code: `import { type Page, type Locator } from '@playwright/test'

export class LoginPage {
  readonly email: Locator
  readonly password: Locator
  readonly submit: Locator

  constructor(private page: Page) {
    this.email    = page.getByLabel('Email')
    this.password = page.getByLabel('Password')
    this.submit   = page.getByRole('button', { name: 'Sign in' })
  }

  async goto() { await this.page.goto('/login') }

  async login(email: string, password: string) {
    await this.email.fill(email)
    await this.password.fill(password)
    await this.submit.click()
  }
}`,
            },
          ],
        },
        {
          id: 'practice-automation',
          type: 'practice',
          title: 'Practice — Automation',
          titleHe: 'תרגול — אוטומציה',
          duration: '20 min',
          body: `Apply what you learned by building a small test suite for a login page.`,
          bodyHe: `יישמו את מה שלמדתם על ידי בניית חבילת בדיקות קטנה לדף כניסה.`,
          concepts: [],
          conceptsHe: [],
          snippets: [],
        },
      ],
    },

    // ─── 3. API Testing ───────────────────────────────────────────────────────
    {
      id: 'api',
      title: 'API Testing',
      titleHe: 'בדיקות API',
      lessons: [
        {
          id: 'api-playwright',
          type: 'article',
          title: 'API Testing with Playwright',
          titleHe: 'בדיקות API עם Playwright',
          duration: '15 min',
          body: `Playwright includes a built-in HTTP client via the request fixture. You can test API endpoints directly without spinning up a browser — this is much faster than E2E tests and ideal for contract testing.\n\nThe most powerful pattern is combining API + UI in a single test: use API calls to seed test data before a UI test, then assert through the browser. This avoids slow UI-based data creation while still verifying the end-to-end flow.`,
          bodyHe: `Playwright כולל לקוח HTTP מובנה דרך ה-fixture request. ניתן לבדוק endpoint-ים של API ישירות ללא פתיחת דפדפן — זה הרבה יותר מהיר מבדיקות E2E ואידיאלי לבדיקות חוזה.\n\nהתבנית החזקה ביותר היא שילוב API + UI בבדיקה אחת: השתמשו בקריאות API להזנת נתוני בדיקה לפני בדיקת UI, ואז אמתו דרך הדפדפן. זה נמנע מיצירת נתונים איטית מבוססת UI תוך שמירה על אימות הזרימה מקצה לקצה.`,
          concepts: [
            'request fixture — Playwright\'s built-in HTTP client, no browser needed',
            'response.status() returns HTTP code; response.json() parses body',
            'Set default headers (auth tokens) in playwright.config.ts extraHTTPHeaders',
            'Use API to seed/cleanup data — faster than doing it through the UI',
            'Contract testing: verify the API response shape matches your schema',
          ],
          conceptsHe: [
            'request fixture — לקוח HTTP מובנה של Playwright, ללא דפדפן',
            'response.status() מחזיר קוד HTTP; response.json() מפרש גוף',
            'הגדירו headers ברירת מחדל (tokens אימות) ב-extraHTTPHeaders',
            'השתמשו ב-API להזנה/ניקוי נתונים — מהיר יותר מעשייה דרך UI',
            'בדיקת חוזה: ודאו שצורת תגובת API תואמת לסכמה שלכם',
          ],
          snippets: [
            {
              label: 'API test with request fixture',
              labelHe: 'בדיקת API עם request fixture',
              language: 'typescript',
              code: `import { test, expect } from '@playwright/test'

test('GET /users returns 200 with array', async ({ request }) => {
  const res = await request.get('/api/users')
  expect(res.status()).toBe(200)
  const body = await res.json()
  expect(Array.isArray(body)).toBe(true)
})

test('seed via API, verify in UI', async ({ page, request }) => {
  // Seed fast via API
  await request.post('/api/products', {
    data: { name: 'Test Widget', price: 9.99 },
    headers: { Authorization: 'Bearer test-token' },
  })
  // Assert in browser
  await page.goto('/products')
  await expect(page.getByText('Test Widget')).toBeVisible()
})`,
            },
          ],
        },
        {
          id: 'api-postman',
          type: 'article',
          title: 'API Testing with Postman',
          titleHe: 'בדיקות API עם Postman',
          duration: '10 min',
          body: `Postman is a GUI tool for building and testing API requests. Collections group related requests; environments hold variables like base URLs and auth tokens. The Tests tab lets you write JavaScript assertions that run after each request.\n\nNewman is the CLI runner for Postman collections — it lets you run the same collections in CI without the GUI, integrating Postman tests into your automated pipeline.`,
          bodyHe: `Postman הוא כלי GUI לבניה ובדיקת בקשות API. Collections מקבצות בקשות קשורות; environments מחזיקות משתנים כמו base URL ו-tokens אימות. לשונית Tests מאפשרת לכם לכתוב assertions ב-JavaScript שרצים לאחר כל בקשה.\n\nNewman הוא ה-CLI runner של Postman collections — הוא מאפשר לכם להריץ את אותן collections ב-CI ללא ה-GUI, ומשלב בדיקות Postman לתוך הפייפליין האוטומטי שלכם.`,
          concepts: [
            'Collections = organized groups of requests (like test suites)',
            'Environments store variables: {{baseUrl}}, {{authToken}}',
            'pm.test() defines a test assertion; pm.response.json() parses body',
            'Pre-request scripts run before the request (e.g., generate tokens)',
            'Newman CLI: npx newman run collection.json -e env.json',
          ],
          conceptsHe: [
            'Collections = קבוצות בקשות מאורגנות (כמו test suites)',
            'Environments מאחסנות משתנים: {{baseUrl}}, {{authToken}}',
            'pm.test() מגדיר assertion; pm.response.json() מפרש גוף',
            'Pre-request scripts רצים לפני הבקשה (למשל, יצירת tokens)',
            'Newman CLI: npx newman run collection.json -e env.json',
          ],
          snippets: [
            {
              label: 'Postman test script (Tests tab)',
              labelHe: 'סקריפט בדיקה ב-Postman (לשונית Tests)',
              language: 'javascript',
              code: `pm.test('Status 200', () => {
  pm.response.to.have.status(200)
})

pm.test('Body has users array', () => {
  const body = pm.response.json()
  pm.expect(body).to.be.an('array')
  pm.expect(body.length).to.be.above(0)
})

// Save a value for use in next request
pm.environment.set('userId', pm.response.json()[0].id)`,
            },
            {
              label: 'Run collection via Newman',
              labelHe: 'הרצת collection דרך Newman',
              language: 'bash',
              code: `npm install -g newman newman-reporter-htmlextra

newman run collection.json \\
  -e environment.json \\
  -r htmlextra \\
  --reporter-htmlextra-export report.html`,
            },
          ],
        },
        {
          id: 'practice-api',
          type: 'practice',
          title: 'Practice — API Testing',
          titleHe: 'תרגול — בדיקות API',
          duration: '20 min',
          body: `Practice writing API tests against a public REST API.`,
          bodyHe: `תרגלו כתיבת בדיקות API מול REST API ציבורי.`,
          concepts: [],
          conceptsHe: [],
          snippets: [],
        },
      ],
    },

    // ─── 4. Load Testing ──────────────────────────────────────────────────────
    {
      id: 'load-testing',
      title: 'Load & Performance Testing',
      titleHe: 'בדיקות עומסים וביצועים',
      lessons: [
        {
          id: 'load-concepts',
          type: 'article',
          title: 'Load vs Performance vs Stress vs Soak',
          titleHe: 'עומס מול ביצועים מול עקה מול סיבולת',
          duration: '12 min',
          body: `These four test types are often confused. Each answers a different question about how your system behaves under pressure.\n\nPerformance testing is the umbrella term — it covers any test that measures how fast, stable, or scalable a system is. Load testing is a specific type: it simulates realistic expected traffic to verify the system meets its SLA under normal conditions.\n\nStress testing pushes beyond the expected limit to find the breaking point. Soak (endurance) testing runs a moderate load for hours or days to detect memory leaks, connection pool exhaustion, or gradual degradation. Spike testing sends a sudden surge of traffic to see if the system recovers.\n\nKey metrics: throughput (requests per second), latency (P50, P95, P99), error rate, and concurrent virtual users.`,
          bodyHe: `ארבעה סוגי בדיקות אלה מתבלבלים לעתים קרובות. כל אחד עונה על שאלה שונה לגבי איך המערכת שלכם מתנהגת תחת לחץ.\n\nבדיקות ביצועים הוא המונח הכולל — הוא מכסה כל בדיקה שמודדת כמה מהירה, יציבה או מדרגית מערכת. בדיקות עומס הן סוג ספציפי: הן מדמות תעבורה ריאליסטית צפויה כדי לאמת שהמערכת עומדת ב-SLA שלה בתנאים רגילים.\n\nבדיקות עקה (stress) דוחפות מעבר לגבול הצפוי כדי למצוא את נקודת השבירה. בדיקות סיבולת (soak) מריצות עומס מתון למשך שעות או ימים כדי לזהות דליפות זיכרון, מיצוי connection pool, או דעיכה הדרגתית. בדיקות spike שולחות גל פתאומי של תעבורה לראות אם המערכת מתאוששת.\n\nמדדים מרכזיים: throughput (בקשות לשנייה), latency (P50, P95, P99), שיעור שגיאות, ומשתמשים וירטואליים בו-זמניים.`,
          concepts: [
            'Load test: realistic expected traffic → verify SLA compliance',
            'Stress test: exceed expected limit → find breaking point',
            'Soak test: moderate load for hours → detect memory leaks',
            'Spike test: sudden traffic surge → verify recovery',
            'P95 latency: 95% of requests finish within this time',
            'Key tools: k6 (JS), JMeter (Java/GUI), Locust (Python)',
          ],
          conceptsHe: [
            'בדיקת עומס: תעבורה ריאליסטית צפויה → אימות עמידה ב-SLA',
            'בדיקת עקה: חריגה מהגבול הצפוי → מציאת נקודת שבירה',
            'בדיקת סיבולת: עומס מתון לשעות → זיהוי דליפות זיכרון',
            'בדיקת spike: גל תעבורה פתאומי → אימות התאוששות',
            'P95 latency: 95% מהבקשות מסתיימות בתוך זמן זה',
            'כלים מרכזיים: k6 (JS), JMeter (Java/GUI), Locust (Python)',
          ],
          snippets: [
            {
              label: 'k6 load test script',
              labelHe: 'סקריפט בדיקת עומס k6',
              language: 'javascript',
              code: `import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // ramp up to 50 VUs
    { duration: '3m', target: 50 },   // hold at 50 VUs
    { duration: '1m', target: 0  },   // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% under 500ms
    http_req_failed:   ['rate<0.01'],  // error rate < 1%
  },
}

export default function () {
  const res = http.get('https://api.example.com/users')
  check(res, {
    'status 200': r => r.status === 200,
    'fast':       r => r.timings.duration < 500,
  })
  sleep(1) // think time between iterations
}`,
            },
          ],
        },
        {
          id: 'practice-load',
          type: 'practice',
          title: 'Practice — Load Testing',
          titleHe: 'תרגול — בדיקות עומסים',
          duration: '15 min',
          body: `Write a k6 script that ramps from 0 to 100 VUs, holds for 2 minutes, then ramps back down. Add thresholds for P95 < 1s and error rate < 0.5%.`,
          bodyHe: `כתבו סקריפט k6 שעולה מ-0 ל-100 VUs, מחזיק 2 דקות, ואז יורד בחזרה. הוסיפו thresholds עבור P95 < 1s ושיעור שגיאות < 0.5%.`,
          concepts: [],
          conceptsHe: [],
          snippets: [],
        },
      ],
    },

    // ─── 5. Hardware & IoT ────────────────────────────────────────────────────
    {
      id: 'hardware-iot',
      title: 'Hardware-Integrated Systems & IoT',
      titleHe: 'מערכות משולבות חומרה ו-IoT',
      lessons: [
        {
          id: 'embedded-systems',
          type: 'article',
          title: 'What Are Embedded & IoT Systems?',
          titleHe: 'מהן מערכות משובצות ו-IoT?',
          duration: '12 min',
          body: `An embedded system is a computer built into a larger device to perform a dedicated function. Unlike a general-purpose PC, it runs firmware — software burned into the hardware — and often operates in real time. Examples: the microcontroller in a washing machine, the ECU in a car, a pacemaker, an ATM, a smart thermostat.\n\nIoT (Internet of Things) refers to embedded systems that are networked — they connect to the internet or to each other. A smart doorbell, a connected insulin pump, an industrial sensor on a factory floor, and a vehicle's telematics unit are all IoT devices.\n\nWhy does this matter for QA? These systems affect safety-critical domains: medical devices must meet IEC 62304, automotive systems must meet ISO 26262 (functional safety). A software bug in a pacemaker or ABS system can be life-threatening. Testing is harder because hardware may be scarce, tests must run in real time, and failures may be irreversible.`,
          bodyHe: `מערכת משובצת היא מחשב מובנה בתוך מכשיר גדול יותר כדי לבצע פונקציה ייעודית. בניגוד למחשב כללי, היא מריצה firmware — תוכנה שנצרבת לחומרה — ולעתים קרובות פועלת בזמן אמת. דוגמאות: המיקרו-בקר במכונת כביסה, ה-ECU ברכב, קוצב לב, כספומט, תרמוסטט חכם.\n\nIoT (האינטרנט של הדברים) מתייחס למערכות משובצות שהן ברשת — הן מתחברות לאינטרנט או אחת לשנייה. פעמון דלת חכם, משאבת אינסולין מחוברת, חיישן תעשייתי ברצפת מפעל, ויחידת הטלמטיקה ברכב הם כולם מכשירי IoT.\n\nלמה זה חשוב ל-QA? מערכות אלה משפיעות על תחומים קריטיים לבטיחות: מכשירים רפואיים חייבים לעמוד ב-IEC 62304, מערכות רכב חייבות לעמוד ב-ISO 26262 (בטיחות פונקציונלית). באג תוכנה בקוצב לב או במערכת ABS עלול לסכן חיים. הבדיקות קשות יותר כי החומרה עשויה להיות נדירה, הבדיקות חייבות לרוץ בזמן אמת, והכשלים עלולים להיות בלתי הפיכים.`,
          concepts: [
            'Embedded system: computer built into a device for a dedicated function',
            'Firmware: software burned into hardware (not installed on OS)',
            'RTOS: Real-Time Operating System — guarantees task timing',
            'IoT: embedded systems connected to the internet or each other',
            'HIL (Hardware-in-the-Loop): test firmware against real hardware in a lab rig',
            'Medical devices: IEC 62304 standard; Automotive: ISO 26262',
            'Testing challenges: hardware scarcity, timing sensitivity, irreversible failures',
          ],
          conceptsHe: [
            'מערכת משובצת: מחשב מובנה במכשיר לפונקציה ייעודית',
            'Firmware: תוכנה שנצרבת לחומרה (לא מותקנת על OS)',
            'RTOS: מערכת הפעלה בזמן אמת — מבטיחה תזמון משימות',
            'IoT: מערכות משובצות המחוברות לאינטרנט או אחת לשנייה',
            'HIL (Hardware-in-the-Loop): בדיקת firmware מול חומרה אמיתית ב-rig מעבדה',
            'מכשירים רפואיים: תקן IEC 62304; רכב: ISO 26262',
            'אתגרי בדיקה: נדירות חומרה, רגישות תזמון, כשלים בלתי הפיכים',
          ],
          snippets: [
            {
              label: 'Where embedded systems affect daily life',
              labelHe: 'איפה מערכות משובצות משפיעות על חיי היומיום',
              language: 'text',
              code: `Medical:     Pacemakers · Insulin pumps · MRI machines
Automotive:  Engine ECU · ABS · ADAS (lane-keep, cruise)
Home:        Smart thermostats · Washing machines · Routers
Banking:     ATMs · POS terminals · Card readers
Industrial:  Factory sensors · PLCs · SCADA systems
Consumer:    Smart TVs · Wearables · IP cameras`,
            },
          ],
        },
        {
          id: 'practice-hardware',
          type: 'practice',
          title: 'Practice — Hardware Systems in SQA Life',
          titleHe: 'תרגול — מערכות משולבות בחיי ה-SQA',
          duration: '15 min',
          body: `Research a real hardware-integrated product (medical device, car ECU, or smart home device) and identify: what safety standard applies, what the main testing challenges are, and what a simulator setup might look like.`,
          bodyHe: `חקרו מוצר משולב חומרה אמיתי (מכשיר רפואי, ECU ברכב, או מכשיר בית חכם) וזהו: איזה תקן בטיחות חל, מהם אתגרי הבדיקה העיקריים, ואיך עשוי להיראות הגדרת סימולטור.`,
          concepts: [],
          conceptsHe: [],
          snippets: [],
        },
      ],
    },

    // ─── 6. SQL ───────────────────────────────────────────────────────────────
    {
      id: 'sql',
      title: 'SQL & Databases',
      titleHe: 'SQL ובסיסי נתונים',
      lessons: [
        {
          id: 'sql-intro',
          type: 'article',
          title: 'SQL — Introduction',
          titleHe: 'SQL — מבוא',
          duration: '10 min',
          body: `SQL (Structured Query Language) is the standard language for communicating with relational databases. As a QA engineer, you use SQL to verify that the application stores data correctly, seed test data before running tests, and investigate production issues by querying live data.\n\nA relational database stores data in tables. Each table has rows (records) and columns (fields). Tables are related to each other via keys. The database management system (DBMS) — MySQL, PostgreSQL, SQL Server, Oracle — interprets your SQL and returns results.`,
          bodyHe: `SQL (שפת שאילתות מובנית) היא השפה הסטנדרטית לתקשורת עם בסיסי נתונים רלציוניים. כמהנדס QA, אתה משתמש ב-SQL כדי לאמת שהאפליקציה מאחסנת נתונים בצורה נכונה, להזין נתוני בדיקה לפני הרצת בדיקות, ולחקור בעיות ייצור על ידי שאילתא על נתונים חיים.\n\nבסיס נתונים רלציוני מאחסן נתונים בטבלאות. לכל טבלה יש שורות (רשומות) ועמודות (שדות). הטבלאות קשורות זו לזו דרך מפתחות. מערכת ניהול בסיס הנתונים (DBMS) — MySQL, PostgreSQL, SQL Server, Oracle — מפרשת את ה-SQL שלכם ומחזירה תוצאות.`,
          concepts: [
            'SQL = Structured Query Language — standard DB communication language',
            'QA uses SQL to: verify data persistence, seed test data, investigate bugs',
            'Table: rows (records) + columns (fields)',
            'Primary Key (PK): uniquely identifies each row',
            'Foreign Key (FK): references a PK in another table',
            'RDBMS options: PostgreSQL, MySQL, SQL Server, Oracle, SQLite',
          ],
          conceptsHe: [
            'SQL = שפת שאילתות מובנית — שפת תקשורת סטנדרטית עם DB',
            'QA משתמש ב-SQL: לאמת שמירת נתונים, הזנת נתוני בדיקה, חקירת באגים',
            'טבלה: שורות (רשומות) + עמודות (שדות)',
            'מפתח ראשי (PK): מזהה ייחודי לכל שורה',
            'מפתח זר (FK): מפנה ל-PK בטבלה אחרת',
            'אפשרויות RDBMS: PostgreSQL, MySQL, SQL Server, Oracle, SQLite',
          ],
          snippets: [
            {
              label: 'First SQL queries',
              labelHe: 'שאילתות SQL ראשונות',
              language: 'sql',
              code: `-- Select all rows from a table
SELECT * FROM users;

-- Select specific columns
SELECT id, email, created_at FROM users;

-- Count total rows
SELECT COUNT(*) FROM orders;`,
            },
          ],
        },
        {
          id: 'db-fundamentals',
          type: 'article',
          title: 'Database Fundamentals',
          titleHe: 'יסודות בסיסי נתונים',
          duration: '15 min',
          body: `Normalization is the process of structuring a database to reduce redundancy and improve data integrity. The three most common normal forms are 1NF (atomic values, no repeating groups), 2NF (1NF + no partial dependencies), and 3NF (2NF + no transitive dependencies).\n\nTransactions group multiple operations into an atomic unit. Either all operations succeed (COMMIT) or all are rolled back (ROLLBACK). The ACID properties guarantee reliable transactions: Atomicity, Consistency, Isolation, and Durability.`,
          bodyHe: `נרמול הוא תהליך מבנה בסיס נתונים להפחתת יתירות ושיפור שלמות הנתונים. שלוש הצורות הנורמליות הנפוצות ביותר הן 1NF (ערכים אטומיים, ללא קבוצות חוזרות), 2NF (1NF + ללא תלויות חלקיות), ו-3NF (2NF + ללא תלויות טרנזיטיביות).\n\nטרנזקציות מקבצות מספר פעולות ליחידה אטומית. או שכל הפעולות מצליחות (COMMIT) או שכולן מבוטלות (ROLLBACK). מאפייני ACID מבטיחים טרנזקציות אמינות: אטומיות, עקביות, בידוד, ועמידות.`,
          concepts: [
            '1NF: atomic values, no repeating groups in a column',
            '2NF: 1NF + every non-key column depends on the whole PK',
            '3NF: 2NF + no column depends on another non-key column',
            'Index: speeds up queries; trade-off is slower writes',
            'ACID: Atomicity · Consistency · Isolation · Durability',
            'NULL: unknown/missing value — not zero, not empty string',
          ],
          conceptsHe: [
            '1NF: ערכים אטומיים, אין קבוצות חוזרות בעמודה',
            '2NF: 1NF + כל עמודה שאינה מפתח תלויה ב-PK כולו',
            '3NF: 2NF + אין עמודה שתלויה בעמודה אחרת שאינה מפתח',
            'Index: מאיץ שאילתות; פשרה היא כתיבות איטיות יותר',
            'ACID: אטומיות · עקביות · בידוד · עמידות',
            'NULL: ערך לא ידוע/חסר — לא אפס, לא מחרוזת ריקה',
          ],
          snippets: [
            {
              label: 'Constraints & transactions',
              labelHe: 'אילוצים וטרנזקציות',
              language: 'sql',
              code: `-- Common constraints
CREATE TABLE users (
  id       SERIAL PRIMARY KEY,
  email    VARCHAR(255) UNIQUE NOT NULL,
  age      INT CHECK (age >= 0),
  role     VARCHAR(50) DEFAULT 'viewer',
  team_id  INT REFERENCES teams(id)
);

-- Transaction
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT; -- or ROLLBACK on error`,
            },
          ],
        },
        {
          id: 'select-where',
          type: 'article',
          title: 'SELECT / FROM / WHERE',
          titleHe: 'SELECT / FROM / WHERE',
          duration: '15 min',
          body: `The SELECT statement is the foundation of SQL querying. SELECT specifies which columns to return, FROM specifies which table, and WHERE filters which rows to include.\n\nThe WHERE clause supports comparison operators (=, !=, <, >, <=, >=), range checks (BETWEEN), list membership (IN), pattern matching (LIKE), and null checks (IS NULL / IS NOT NULL). You can combine conditions with AND and OR.`,
          bodyHe: `המשפט SELECT הוא הבסיס של שאילתות SQL. SELECT מציין אילו עמודות להחזיר, FROM מציין איזו טבלה, ו-WHERE מסנן אילו שורות לכלול.\n\nסעיף WHERE תומך באופרטורי השוואה (=, !=, <, >, <=, >=), בדיקות טווח (BETWEEN), חברות ברשימה (IN), התאמת תבנית (LIKE), ובדיקות null (IS NULL / IS NOT NULL). ניתן לשלב תנאים עם AND ו-OR.`,
          concepts: [
            'SELECT col1, col2 FROM table WHERE condition',
            'SELECT * returns all columns (avoid in production queries)',
            'LIKE \'%text%\' matches any string containing "text"',
            'BETWEEN x AND y includes both endpoints',
            'IN (v1, v2, v3) — shorthand for multiple OR equals',
            'IS NULL checks for missing values (= NULL does not work)',
            'AS keyword creates a column alias in the result set',
          ],
          conceptsHe: [
            'SELECT col1, col2 FROM table WHERE condition',
            'SELECT * מחזיר כל העמודות (הימנעו בשאילתות ייצור)',
            'LIKE \'%text%\' מתאים לכל מחרוזת המכילה "text"',
            'BETWEEN x AND y כולל שני הקצוות',
            'IN (v1, v2, v3) — קיצור לmultiple OR equals',
            'IS NULL בודק ערכים חסרים (= NULL לא עובד)',
            'מילת המפתח AS יוצרת כינוי עמודה בתוצאה',
          ],
          snippets: [
            {
              label: 'SELECT / WHERE examples',
              labelHe: 'דוגמאות SELECT / WHERE',
              language: 'sql',
              code: `-- Basic filter
SELECT name, email FROM users WHERE status = 'active';

-- Range
SELECT * FROM orders
WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31';

-- Pattern match
SELECT * FROM products WHERE name LIKE '%widget%';

-- List membership
SELECT * FROM users WHERE role IN ('admin', 'editor');

-- Null check
SELECT * FROM users WHERE last_login IS NULL;

-- Column alias
SELECT COUNT(*) AS total_users FROM users;`,
            },
          ],
        },
        {
          id: 'and-or-order-case',
          type: 'article',
          title: 'AND / OR · ORDER BY · CASE',
          titleHe: 'AND / OR · ORDER BY · CASE',
          duration: '15 min',
          body: `AND requires all conditions to be true; OR requires at least one. Use parentheses to control precedence when mixing them — AND has higher precedence than OR by default.\n\nORDER BY sorts the result set. ASC (ascending) is the default. You can sort by multiple columns: ORDER BY country ASC, name ASC.\n\nCASE WHEN is SQL's conditional expression — like an if/else in a query. It can appear in SELECT to derive a new column, or in ORDER BY to create custom sort order.`,
          bodyHe: `AND דורש שכל התנאים יהיו נכונים; OR דורש לפחות אחד. השתמשו בסוגריים לשליטה על קדימות כאשר מערבבים אותם — ל-AND יש קדימות גבוהה יותר מ-OR כברירת מחדל.\n\nORDER BY ממיין את קבוצת התוצאות. ASC (עולה) הוא ברירת המחדל. ניתן למיין לפי עמודות מרובות: ORDER BY country ASC, name ASC.\n\nCASE WHEN הוא הביטוי המותנה של SQL — כמו if/else בשאילתה. הוא יכול להופיע ב-SELECT להשגת עמודה חדשה, או ב-ORDER BY ליצירת סדר מיון מותאם אישית.`,
          concepts: [
            'AND: all conditions true; OR: at least one condition true',
            'Use parentheses to enforce precedence: (A OR B) AND C',
            'ORDER BY col ASC (default) or DESC',
            'ORDER BY multiple columns: primary sort, then secondary',
            'CASE WHEN cond THEN val ELSE default END',
            'CASE can appear in SELECT, WHERE, ORDER BY, GROUP BY',
          ],
          conceptsHe: [
            'AND: כל התנאים נכונים; OR: לפחות תנאי אחד נכון',
            'השתמשו בסוגריים לאכיפת קדימות: (A OR B) AND C',
            'ORDER BY col ASC (ברירת מחדל) או DESC',
            'ORDER BY עמודות מרובות: מיון ראשוני, ואחר כך משני',
            'CASE WHEN תנאי THEN ערך ELSE ברירת_מחדל END',
            'CASE יכול להופיע ב-SELECT, WHERE, ORDER BY, GROUP BY',
          ],
          snippets: [
            {
              label: 'AND / OR / ORDER BY / CASE',
              labelHe: 'AND / OR / ORDER BY / CASE',
              language: 'sql',
              code: `-- Compound filter with parentheses
SELECT * FROM users
WHERE (role = 'admin' OR role = 'editor')
  AND status = 'active'
ORDER BY created_at DESC;

-- CASE: derive a label column
SELECT
  name,
  score,
  CASE
    WHEN score >= 90 THEN 'A'
    WHEN score >= 75 THEN 'B'
    WHEN score >= 60 THEN 'C'
    ELSE 'F'
  END AS grade
FROM results
ORDER BY score DESC;`,
            },
          ],
        },
        {
          id: 'group-by-having',
          type: 'article',
          title: 'GROUP BY + HAVING',
          titleHe: 'GROUP BY + HAVING',
          duration: '12 min',
          body: `GROUP BY collapses all rows that share the same value in the specified column(s) into a single row. Aggregate functions then compute a value across each group: COUNT, SUM, AVG, MAX, MIN.\n\nHAVING filters groups — it is WHERE for aggregated results. The key difference: WHERE filters individual rows before grouping; HAVING filters groups after grouping. You cannot use aggregate functions in a WHERE clause.`,
          bodyHe: `GROUP BY מקפל את כל השורות שחולקות את אותו ערך בעמודה/ות שצוינה לשורה אחת. פונקציות אגרגט אז מחשבות ערך על כל קבוצה: COUNT, SUM, AVG, MAX, MIN.\n\nHAVING מסנן קבוצות — זהו WHERE עבור תוצאות מאוגדות. ההבדל המרכזי: WHERE מסנן שורות בודדות לפני קיבוץ; HAVING מסנן קבוצות לאחר קיבוץ. לא ניתן להשתמש בפונקציות אגרגט בסעיף WHERE.`,
          concepts: [
            'GROUP BY: collapse rows with same value into one row per group',
            'COUNT(*): count all rows; COUNT(col): count non-NULL values',
            'SUM / AVG / MAX / MIN: aggregate across the group',
            'HAVING: filter groups (like WHERE but for aggregates)',
            'WHERE filters rows before grouping; HAVING filters groups after',
            'Can GROUP BY multiple columns for composite grouping',
          ],
          conceptsHe: [
            'GROUP BY: מכפל שורות עם אותו ערך לשורה אחת לקבוצה',
            'COUNT(*): סופר כל השורות; COUNT(col): סופר ערכים לא-NULL',
            'SUM / AVG / MAX / MIN: אגרגציה על הקבוצה',
            'HAVING: מסנן קבוצות (כמו WHERE אך לאגרגטים)',
            'WHERE מסנן שורות לפני קיבוץ; HAVING מסנן קבוצות לאחר',
            'ניתן לקבץ לפי עמודות מרובות לקיבוץ מורכב',
          ],
          snippets: [
            {
              label: 'GROUP BY + HAVING',
              labelHe: 'GROUP BY + HAVING',
              language: 'sql',
              code: `-- Count orders per customer
SELECT customer_id, COUNT(*) AS order_count
FROM orders
GROUP BY customer_id;

-- Only customers with more than 5 orders
SELECT customer_id, COUNT(*) AS order_count
FROM orders
GROUP BY customer_id
HAVING COUNT(*) > 5
ORDER BY order_count DESC;

-- Revenue per product category, only high earners
SELECT category, SUM(price * quantity) AS revenue
FROM order_items
GROUP BY category
HAVING SUM(price * quantity) > 10000;`,
            },
          ],
        },
        {
          id: 'joins-exists',
          type: 'article',
          title: 'JOINs + EXISTS',
          titleHe: 'JOINs + EXISTS',
          duration: '15 min',
          body: `A JOIN combines rows from two tables based on a related column. INNER JOIN returns only rows that have a match in both tables. LEFT JOIN returns all rows from the left table and matching rows from the right (unmatched right-side columns are NULL). RIGHT JOIN is the mirror of LEFT JOIN. FULL OUTER JOIN returns all rows from both tables.\n\nEXISTS checks whether a subquery returns any rows. It is often more readable than IN when the subquery is complex, and can be more efficient because it stops scanning as soon as the first match is found.`,
          bodyHe: `JOIN משלב שורות משתי טבלאות על בסיס עמודה קשורה. INNER JOIN מחזיר רק שורות שיש להן התאמה בשתי הטבלאות. LEFT JOIN מחזיר את כל השורות מהטבלה השמאלית ושורות תואמות מהימנית (עמודות צד ימין ללא התאמה הן NULL). RIGHT JOIN הוא המראה של LEFT JOIN. FULL OUTER JOIN מחזיר את כל השורות משתי הטבלאות.\n\nEXISTS בודק אם תת-שאילתה מחזירה שורות כלשהן. לעתים קרובות הוא קריא יותר מ-IN כאשר תת-השאילתה מורכבת, ויכול להיות יעיל יותר כי הוא מפסיק לסרוק ברגע שנמצאת ההתאמה הראשונה.`,
          concepts: [
            'INNER JOIN: only rows matching in BOTH tables',
            'LEFT JOIN: all left rows + matching right rows (NULLs for no match)',
            'RIGHT JOIN: all right rows + matching left rows',
            'FULL OUTER JOIN: all rows from both sides',
            'JOIN ON: specify the matching condition',
            'EXISTS: returns true if subquery finds at least one row',
            'NOT EXISTS: find rows with no matching related record',
          ],
          conceptsHe: [
            'INNER JOIN: רק שורות שתואמות בשתי הטבלאות',
            'LEFT JOIN: כל שורות שמאל + שורות ימין תואמות (NULLs אם אין התאמה)',
            'RIGHT JOIN: כל שורות ימין + שורות שמאל תואמות',
            'FULL OUTER JOIN: כל השורות משני הצדדים',
            'JOIN ON: ציין את תנאי ההתאמה',
            'EXISTS: מחזיר true אם תת-שאילתה מוצאת לפחות שורה אחת',
            'NOT EXISTS: מצא שורות ללא רשומה קשורה תואמת',
          ],
          snippets: [
            {
              label: 'JOIN examples',
              labelHe: 'דוגמאות JOIN',
              language: 'sql',
              code: `-- INNER JOIN: orders with their customer name
SELECT o.id, o.total, c.name
FROM orders o
INNER JOIN customers c ON o.customer_id = c.id;

-- LEFT JOIN: all customers, including those with no orders
SELECT c.name, COUNT(o.id) AS order_count
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.name;

-- EXISTS: customers who placed at least one order
SELECT name FROM customers c
WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.customer_id = c.id
);

-- NOT EXISTS: customers with no orders
SELECT name FROM customers c
WHERE NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.customer_id = c.id
);`,
            },
          ],
        },
        {
          id: 'sql-qa-real-world',
          type: 'article',
          title: 'Real-World QA SQL Queries',
          titleHe: 'שאילתות SQL של QA מהעולם האמיתי',
          duration: '15 min',
          body: `As a QA engineer, you use SQL in three main contexts: verifying that a UI action persisted the correct data to the database, seeding known test data before running tests, and investigating production bugs by directly querying live data.\n\nThe patterns below cover the most common QA verification scenarios: checking that a record was created/updated/deleted, verifying counts, finding duplicate records, checking data integrity between related tables, and identifying stale or orphaned records.`,
          bodyHe: `כמהנדס QA, אתה משתמש ב-SQL בשלושה הקשרים עיקריים: אימות שפעולת UI שמרה את הנתונים הנכונים לבסיס הנתונים, הזנת נתוני בדיקה ידועים לפני הרצת בדיקות, וחקירת באגי ייצור על ידי שאילתא ישירה על נתונים חיים.\n\nהתבניות להלן מכסות את תרחישי אימות QA הנפוצים ביותר: בדיקה שרשומה נוצרה/עודכנה/נמחקה, אימות ספירות, מציאת רשומות כפולות, בדיקת שלמות נתונים בין טבלאות קשורות, וזיהוי רשומות ישנות או עזובות.`,
          concepts: [
            'Verify creation: SELECT + WHERE on the new record\'s unique fields',
            'Verify update: SELECT the updated column and compare to expected value',
            'Find duplicates: GROUP BY + HAVING COUNT(*) > 1',
            'Orphaned records: LEFT JOIN + WHERE right-side IS NULL',
            'Data integrity: CHECK FK references are valid with JOIN counts',
            'Seed & cleanup: INSERT in beforeEach, DELETE in afterEach',
          ],
          conceptsHe: [
            'אימות יצירה: SELECT + WHERE על השדות הייחודיים של הרשומה החדשה',
            'אימות עדכון: SELECT העמודה המעודכנת והשוואה לערך הצפוי',
            'מציאת כפילויות: GROUP BY + HAVING COUNT(*) > 1',
            'רשומות עזובות: LEFT JOIN + WHERE הצד הימני IS NULL',
            'שלמות נתונים: בדיקה שהפניות FK תקינות עם ספירות JOIN',
            'הזנה וניקוי: INSERT ב-beforeEach, DELETE ב-afterEach',
          ],
          snippets: [
            {
              label: 'QA verification patterns',
              labelHe: 'תבניות אימות QA',
              language: 'sql',
              code: `-- 1. Verify a record was created
SELECT * FROM users WHERE email = 'alice@test.com';

-- 2. Verify an update
SELECT status FROM orders WHERE id = 42;
-- expect: 'shipped'

-- 3. Find duplicate emails
SELECT email, COUNT(*) FROM users
GROUP BY email HAVING COUNT(*) > 1;

-- 4. Orphaned orders (no matching customer)
SELECT o.id FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
WHERE c.id IS NULL;

-- 5. Seed + cleanup in tests (node-postgres)
-- beforeEach:
INSERT INTO users(name,email,status) VALUES('Test','t@t.com','active');
-- afterEach:
DELETE FROM users WHERE email LIKE '%@test.com';`,
            },
          ],
        },
        {
          id: 'practice-sql',
          type: 'practice',
          title: 'Practice — SQL Queries',
          titleHe: 'תרגול — שאילתות SQL',
          duration: '25 min',
          body: `Write SQL queries to solve real QA verification scenarios on a sample e-commerce database.`,
          bodyHe: `כתבו שאילתות SQL לפתרון תרחישי אימות QA אמיתיים על בסיס נתונים לדוגמה של מסחר אלקטרוני.`,
          concepts: [],
          conceptsHe: [],
          snippets: [],
        },
      ],
    },

    // ─── 7. Enrichment ────────────────────────────────────────────────────────
    {
      id: 'enrichment',
      title: 'Enrichment — AI, DevOps & Security',
      titleHe: 'העשרה — AI, DevOps וסייבר',
      lessons: [
        {
          id: 'ai-testing',
          type: 'article',
          title: 'AI for Testing with Claude',
          titleHe: 'שימוש ב-AI לבדיקות עם Claude',
          duration: '10 min',
          body: `AI brings three major upgrades to a QA workflow: test generation, self-healing locators, and automated bug triage.\n\nTest generation: give Claude a user story or acceptance criteria and receive a complete Playwright .spec.ts file to review and refine — not to copy blindly, but as a solid starting scaffold. Self-healing locators: when a test breaks because a CSS class changed, Claude can inspect the new DOM snapshot and suggest a resilient getByRole replacement. Bug triage: paste a stack trace and error log into Claude and receive a structured Jira-ready bug report with root-cause analysis.`,
          bodyHe: `AI מביא שלושה שדרוגים מרכזיים לתהליך עבודה של QA: יצירת בדיקות, self-healing locators, וטריאז' באגים אוטומטי.\n\nיצירת בדיקות: תנו ל-Claude סיפור משתמש או קריטריוני קבלה וקבלו קובץ Playwright .spec.ts מלא לסקירה ועידון — לא להעתקה עיוורת, אלא כפיגום התחלתי מוצק. Self-healing locators: כאשר בדיקה נשברת כי מחלקת CSS השתנתה, Claude יכול לבחון את ה-snapshot החדש של ה-DOM ולהציע החלפת getByRole חסינה. טריאז' באגים: הדביקו stack trace ולוג שגיאות ל-Claude וקבלו דוח באג מובנה מוכן ל-Jira עם ניתוח שורש.`,
          concepts: [
            'Test generation: user story → .spec.ts scaffold (review, don\'t blindly copy)',
            'Self-healing: broken locator + DOM snapshot → Claude suggests fix',
            'Bug triage: error log → structured Jira-ready bug report',
            'Auto-POM builder: paste HTML component → get TypeScript Page Object',
            'MOCK mode: all agents in this toolkit work without an API key',
          ],
          conceptsHe: [
            'יצירת בדיקות: סיפור משתמש → פיגום .spec.ts (סקור, אל תעתיק עיוורת)',
            'Self-healing: locator שבור + DOM snapshot → Claude מציע תיקון',
            'טריאז\' באגים: לוג שגיאות → דוח באג מובנה מוכן ל-Jira',
            'בונה POM אוטומטי: הדבק רכיב HTML → קבל TypeScript Page Object',
            'מצב MOCK: כל הסוכנים בערכת כלים זו עובדים ללא מפתח API',
          ],
          snippets: [
            {
              label: 'Self-Healing Locator agent call',
              labelHe: 'קריאה לסוכן Self-Healing Locator',
              language: 'typescript',
              code: `const response = await fetch('/api/run/healing', {
  method: 'POST',
  body: JSON.stringify({
    failed_locator: 'page.locator(".submit-btn")',
    dom_snapshot: \`<button
      data-testid="submit"
      aria-label="Submit form">Submit</button>\`,
  }),
})
const { output } = await response.json()
// output: 'page.getByRole("button", { name: "Submit form" })'`,
            },
          ],
        },
        {
          id: 'devops-qa',
          type: 'article',
          title: 'DevOps for QA Engineers',
          titleHe: 'DevOps למהנדסי QA',
          duration: '12 min',
          body: `DevOps is a culture and set of practices that unify software development (Dev) and IT operations (Ops). For QA engineers, the most important part is CI/CD — Continuous Integration and Continuous Delivery.\n\nContinuous Integration means every code change triggers an automated pipeline: build the app, run unit tests, run integration tests, run E2E tests, report results. If any step fails, the pipeline stops and the developer gets immediate feedback. This prevents "it works on my machine" problems.\n\nDocker packages your app and its dependencies into a container — a reproducible, portable unit. Your tests can spin up a Docker container of the app and run against a known, clean state every time.`,
          bodyHe: `DevOps הוא תרבות וסט פרקטיקות שמאחדות פיתוח תוכנה (Dev) ותפעול IT (Ops). עבור מהנדסי QA, החלק החשוב ביותר הוא CI/CD — אינטגרציה רציפה ומסירה רציפה.\n\nאינטגרציה רציפה (CI) פירושה שכל שינוי קוד מפעיל פייפליין אוטומטי: בניית האפליקציה, הרצת בדיקות יחידה, הרצת בדיקות אינטגרציה, הרצת בדיקות E2E, דיווח תוצאות. אם שלב כלשהו נכשל, הפייפליין נעצר והמפתח מקבל משוב מיידי. זה מונע בעיות של "עובד על המחשב שלי".\n\nDocker אורז את האפליקציה שלכם ותלויותיה לתוך container — יחידה ניתנת לשחזור ולנייד. הבדיקות שלכם יכולות להפעיל Docker container של האפליקציה ולרוץ מול מצב נקי ומוכר בכל פעם.`,
          concepts: [
            'CI: every push triggers build + tests automatically',
            'CD: passing CI automatically deploys to staging/production',
            'Pipeline stages: install → lint → unit test → E2E test → deploy',
            'Docker: reproducible containerized app environment for tests',
            'Artifact: a build output stored for download (test report, binary)',
            'QA gate: a required CI check that must pass before merge',
          ],
          conceptsHe: [
            'CI: כל push מפעיל בנייה + בדיקות אוטומטית',
            'CD: CI שעבר מפרס אוטומטית לסטייג\'ינג/ייצור',
            'שלבי פייפליין: התקנה → lint → בדיקת יחידה → בדיקת E2E → פרסום',
            'Docker: סביבת אפליקציה מכולה הניתנת לשחזור לבדיקות',
            'Artifact: פלט בנייה שנשמר להורדה (דוח בדיקה, binary)',
            'QA gate: בדיקת CI נדרשת שחייבת לעבור לפני מיזוג',
          ],
          snippets: [
            {
              label: '.github/workflows/playwright.yml',
              labelHe: '.github/workflows/playwright.yml',
              language: 'yaml',
              code: `name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
        env:
          PLAYWRIGHT_BASE_URL: http://localhost:3000
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/`,
            },
          ],
        },
        {
          id: 'cybersecurity-qa',
          type: 'article',
          title: 'Cybersecurity Basics for Testers',
          titleHe: 'יסודות אבטחת מידע לטסטרים',
          duration: '10 min',
          body: `QA engineers are often the first line of defence against security vulnerabilities. You don\'t need to be a penetration tester, but you should recognize the most common attack patterns and know how to include basic security checks in your test suite.\n\nThe OWASP Top 10 is the globally recognised list of the ten most critical web application security risks. As a QA engineer, the most relevant to include in testing are: SQL Injection (A03), XSS — Cross-Site Scripting (A03), Broken Authentication (A07), and Security Misconfiguration (A05).\n\nSQL Injection tests try to alter a database query by injecting SQL syntax into input fields. XSS tests try to inject JavaScript that runs in another user\'s browser. Your test data generator in this toolkit already produces these payloads.`,
          bodyHe: `מהנדסי QA הם לעתים קרובות קו ההגנה הראשון נגד פגיעויות אבטחה. אינכם צריכים להיות בודקי חדירה, אבל עליכם לזהות את דפוסי ההתקפה הנפוצים ביותר ולדעת כיצד לכלול בדיקות אבטחה בסיסיות בחבילת הבדיקות שלכם.\n\nOWASP Top 10 הוא הרשימה המוכרת עולמית של עשרת סיכוני האבטחה הקריטיים ביותר ליישומי אינטרנט. כמהנדס QA, הרלוונטיים ביותר לכלול בבדיקות הם: SQL Injection (A03), XSS — Cross-Site Scripting (A03), Broken Authentication (A07), ו-Security Misconfiguration (A05).\n\nבדיקות SQL Injection מנסות לשנות שאילתת מסד נתונים על ידי הזרקת תחביר SQL לשדות קלט. בדיקות XSS מנסות להזריק JavaScript שרץ בדפדפן של משתמש אחר. מחולל נתוני הבדיקה בערכת כלים זו כבר מייצר עומסים אלה.`,
          concepts: [
            'OWASP Top 10: the 10 most critical web security risk categories',
            'SQL Injection: malicious SQL in input → query manipulation',
            'XSS (Cross-Site Scripting): injected JS runs in other users\' browsers',
            'Broken Auth: weak passwords, exposed tokens, missing session expiry',
            'Security Misconfiguration: debug mode on, default passwords, open S3 buckets',
            'Test with OWASP payloads: \' OR 1=1--, <script>alert(1)</script>',
          ],
          conceptsHe: [
            'OWASP Top 10: 10 קטגוריות הסיכונים הקריטיות ביותר לאבטחת אינטרנט',
            'SQL Injection: SQL זדוני בקלט → מניפולציה על שאילתה',
            'XSS (Cross-Site Scripting): JS מוזרק רץ בדפדפני משתמשים אחרים',
            'Broken Auth: סיסמאות חלשות, tokens חשופים, חוסר פקיעת session',
            'Security Misconfiguration: מצב debug פעיל, סיסמאות ברירת מחדל, S3 buckets פתוחים',
            'בדיקה עם עומסי OWASP: \' OR 1=1--, <script>alert(1)</script>',
          ],
          snippets: [
            {
              label: 'Security test examples',
              labelHe: 'דוגמאות בדיקות אבטחה',
              language: 'typescript',
              code: `// SQL Injection — should be rejected, not cause a 500
test('login rejects SQL injection', async ({ page }) => {
  await page.getByLabel('Email').fill("' OR 1=1--")
  await page.getByLabel('Password').fill('anything')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByText('Invalid credentials')).toBeVisible()
  await expect(page).not.toHaveURL('/dashboard')
})

// XSS — script should not execute
test('input sanitises XSS payload', async ({ page }) => {
  await page.getByLabel('Name').fill('<script>alert(1)</script>')
  await page.getByRole('button', { name: 'Save' }).click()
  // page.on('dialog') should NOT fire
  await expect(page.getByText('<script>')).not.toBeVisible()
})`,
            },
          ],
        },
        {
          id: 'practice-enrichment',
          type: 'practice',
          title: 'Practice — AI, DevOps & Security',
          titleHe: 'תרגול — AI, DevOps וסייבר',
          duration: '20 min',
          body: `Use the Test Generator on the /generate page to create a spec from a user story, then add a security assertion to the generated test.`,
          bodyHe: `השתמשו ב-Test Generator בדף /generate ליצירת spec מסיפור משתמש, ואז הוסיפו assertion אבטחה לבדיקה שנוצרה.`,
          concepts: [],
          conceptsHe: [],
          snippets: [],
        },
      ],
    },

    // ─── 8. Summary ───────────────────────────────────────────────────────────
    {
      id: 'summary',
      title: 'Summary & Next Steps',
      titleHe: 'סיכום וצעדים הבאים',
      lessons: [
        {
          id: 'interview-tips',
          type: 'tips',
          title: 'Tips for a Successful Interview',
          titleHe: 'טיפים לראיון מוצלח',
          duration: '10 min',
          body: `A QA interview tests both technical knowledge and your approach to problem-solving. Interviewers want to see that you think in terms of quality throughout the development lifecycle — not just running scripts at the end.\n\nBring examples. "I wrote a self-healing Playwright suite that caught a UI regression before release" is far more compelling than "I know Playwright". Mention specific metrics: "reduced manual regression time from 4 hours to 15 minutes".\n\nFor SQL questions, practice the patterns from this course: GROUP BY + HAVING for duplicates, LEFT JOIN for orphaned records, parameterized queries for injection safety. For automation questions, be ready to explain when NOT to automate — interviewers respect nuanced answers.`,
          bodyHe: `ראיון QA בודק הן ידע טכני והן גישתכם לפתרון בעיות. מראיינים רוצים לראות שאתם חושבים במונחי איכות לאורך מחזור חיי הפיתוח — לא רק הרצת סקריפטים בסוף.\n\nהביאו דוגמאות. "כתבתי חבילת Playwright self-healing שתפסה רגרסיה ב-UI לפני גרסה" הרבה יותר משכנע מ"אני יודע Playwright". ציינו מדדים ספציפיים: "הפחתתי זמן רגרסיה ידנית מ-4 שעות ל-15 דקות".\n\nלשאלות SQL, תרגלו את התבניות מהקורס הזה: GROUP BY + HAVING לכפילויות, LEFT JOIN לרשומות עזובות, שאילתות פרמטריות לבטיחות מפני injection. לשאלות אוטומציה, היו מוכנים להסביר מתי לא לאוטומט — מראיינים מכבדים תשובות מדורגות.`,
          concepts: [
            'Lead with impact: "I reduced regression time by 75%" not just "I know Playwright"',
            'Show testing mindset: boundary values, negative cases, edge cases',
            'SQL: be ready to write GROUP BY, JOIN, and subquery examples on a whiteboard',
            'When asked "how do you handle a flaky test?" — explain root-cause analysis',
            'Portfolio: a GitHub repo with a real Playwright suite is worth more than any cert',
            'Ask questions back: team size, test coverage %, CI setup, on-call rotation',
          ],
          conceptsHe: [
            'הובילו עם השפעה: "הפחתתי זמן רגרסיה ב-75%" לא רק "אני יודע Playwright"',
            'הראו חשיבה בדיקתית: ערכי גבול, מקרים שליליים, מקרי קצה',
            'SQL: היו מוכנים לכתוב דוגמאות GROUP BY, JOIN ותת-שאילתה על לוח',
            'כשנשאלים "איך מטפלים בבדיקה flaky?" — הסביר ניתוח שורש',
            'תיק עבודות: repo GitHub עם חבילת Playwright אמיתית שווה יותר מכל תעודה',
            'שאלו שאלות בחזרה: גודל צוות, % כיסוי בדיקות, הגדרת CI, תורנות on-call',
          ],
          snippets: [
            {
              label: 'Common interview questions',
              labelHe: 'שאלות ראיון נפוצות',
              language: 'text',
              code: `Q: What is the difference between load and stress testing?
A: Load = realistic expected traffic to verify SLA.
   Stress = push past limit to find breaking point.

Q: When would you NOT automate a test?
A: Exploratory, one-off, or on a UI changing every sprint.
   Automation ROI must justify maintenance cost.

Q: How do you find duplicate records in SQL?
A: SELECT col, COUNT(*) FROM t GROUP BY col HAVING COUNT(*) > 1

Q: What is a flaky test and how do you fix it?
A: Non-deterministic — passes and fails without code change.
   Fix: remove timing dependencies, isolate state, mock externals.`,
            },
          ],
        },
        {
          id: 'learning-summary',
          type: 'summary',
          title: 'Learning Summary',
          titleHe: 'סיכום הלמידה',
          duration: '5 min',
          body: `Congratulations on completing the QA Automation Course! Here is a summary of everything you covered.\n\nYou started with the fundamentals of QA automation, the testing pyramid, and Playwright setup. You learned how to write maintainable tests using the Page Object Model and resilient locators. You explored API testing with both Playwright's built-in request fixture and Postman/Newman.\n\nYou understood the critical differences between load, performance, stress, soak, and spike testing — and how to write k6 scripts with thresholds. You discovered the world of hardware-integrated and IoT systems, and why safety standards like IEC 62304 and ISO 26262 exist.\n\nYour SQL journey took you from basic SELECT queries through GROUP BY, HAVING, and complex JOINs — all with real QA verification patterns. Finally, you saw how AI (Claude), DevOps (CI/CD, Docker), and cybersecurity (OWASP, XSS, SQLi) fit into a modern QA engineering practice.\n\nThe next step is practice. Open this toolkit, run the agents, write real tests, and build your GitHub portfolio.`,
          bodyHe: `ברכות על השלמת קורס אוטומציית QA! הנה סיכום של כל מה שכיסיתם.\n\nהתחלתם עם יסודות אוטומציית QA, פירמידת הבדיקות, והגדרת Playwright. למדתם כיצד לכתוב בדיקות הניתנות לתחזוקה באמצעות מודל Page Object ו-locators חסינים. חקרתם בדיקות API הן עם fixture הבקשה המובנה של Playwright והן עם Postman/Newman.\n\nהבנתם את ההבדלים הקריטיים בין בדיקות עומס, ביצועים, עקה, סיבולת ו-spike — וכיצד לכתוב סקריפטי k6 עם thresholds. גיליתם את עולם מערכות משולבות חומרה ו-IoT, ומדוע קיימים תקני בטיחות כמו IEC 62304 ו-ISO 26262.\n\nמסע ה-SQL שלכם לקח אתכם משאילתות SELECT בסיסיות דרך GROUP BY, HAVING ו-JOINs מורכבים — הכל עם תבניות אימות QA אמיתיות. לבסוף, ראיתם כיצד AI (Claude), DevOps (CI/CD, Docker) ואבטחת מידע (OWASP, XSS, SQLi) משתלבים בפרקטיקה של הנדסת QA מודרנית.\n\nהצעד הבא הוא תרגול. פתחו את ערכת הכלים הזו, הריצו את הסוכנים, כתבו בדיקות אמיתיות, ובנו את תיק העבודות שלכם ב-GitHub.`,
          concepts: [
            '✅ Playwright: config, locators, assertions, POM, API testing',
            '✅ Automation strategy: when to automate, testing pyramid, flaky tests',
            '✅ Load testing: load vs stress vs soak, k6 scripts, key metrics',
            '✅ Hardware/IoT: embedded systems, RTOS, safety standards',
            '✅ SQL: SELECT/WHERE, GROUP BY/HAVING, JOINs, QA patterns',
            '✅ Enrichment: Claude agents, CI/CD, OWASP security testing',
          ],
          conceptsHe: [
            '✅ Playwright: קונפיגורציה, locators, assertions, POM, בדיקות API',
            '✅ אסטרטגיית אוטומציה: מתי לאוטומט, פירמידת בדיקות, בדיקות flaky',
            '✅ בדיקות עומסים: עומס מול עקה מול סיבולת, סקריפטי k6, מדדים מרכזיים',
            '✅ חומרה/IoT: מערכות משובצות, RTOS, תקני בטיחות',
            '✅ SQL: SELECT/WHERE, GROUP BY/HAVING, JOINs, תבניות QA',
            '✅ העשרה: סוכני Claude, CI/CD, בדיקות אבטחה OWASP',
          ],
          snippets: [],
        },
      ],
    },
  ],
}
