export interface Question {
  id: string
  text: string
  textHe: string
  options: string[]
  optionsHe: string[]
  correct: number
  explanation: string
  explanationHe: string
}

export interface GuideSection {
  id: string
  type: 'lesson' | 'quiz' | 'practice' | 'exam' | 'tips' | 'summary'
  title: string
  titleHe: string
  level?: 'Beginner' | 'Intermediate' | 'Advanced'
  minutes?: number
  summary?: string
  summaryHe?: string
  body?: string
  bodyHe?: string
  concepts?: string[]
  conceptsHe?: string[]
  snippets?: { label: string; labelHe: string; code: string; language: string }[]
  questions?: Question[]
  practiceDesc?: string
  practiceDescHe?: string
  practiceItems?: string[]
  practiceItemsHe?: string[]
}

export interface GuideModule {
  id: string
  title: string
  titleHe: string
  icon: string
  sections: GuideSection[]
}

export const MODULES: GuideModule[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    titleHe: 'ברוכים הבאים',
    icon: '🎓',
    sections: [
      {
        id: 'welcome-lesson',
        type: 'lesson',
        title: 'Welcome to QA Automation',
        titleHe: 'ברוכים הבאים לאוטומציית QA',
        level: 'Beginner',
        minutes: 5,
        summary: 'Understand what QA is, what an SQA engineer does, and what you will learn in this course.',
        summaryHe: 'הבן מהו QA, מה עושה מהנדס SQA ומה תלמד בקורס זה.',
        body: 'Software Quality Assurance (SQA) is the discipline of systematically monitoring and improving the processes used to develop software. An SQA engineer does not just find bugs — they build confidence that the product meets requirements and works for real users.\n\nIn this course you will learn automation testing with Playwright, load testing, SQL for data validation, hardware-integrated systems testing, and how to use AI tools to accelerate your QA work.\n\nQA is one of the most in-demand roles in tech. Every software product needs people who think critically about quality, edge cases, and user experience.',
        bodyHe: 'הבטחת איכות תוכנה (SQA) היא דיסציפלינה של ניטור ושיפור שיטתי של תהליכי פיתוח התוכנה. מהנדס SQA לא רק מוצא באגים — הוא בונה ביטחון שהמוצר עומד בדרישות ועובד עבור משתמשים אמיתיים.\n\nבקורס זה תלמד אוטומציית בדיקות עם Playwright, בדיקות עומסים, SQL לאימות נתונים, בדיקות מערכות משולבות חומרה, וכיצד להשתמש בכלי AI להאצת עבודת ה-QA שלך.\n\nQA הוא אחד מהתפקידים המבוקשים ביותר בתעשיית הטכנולוגיה. כל מוצר תוכנה זקוק לאנשים שחושבים בביקורתיות על איכות, מקרי קצה וחוויית משתמש.',
        concepts: [
          'QA = building confidence in product quality, not just finding bugs',
          'SQA engineer writes test plans, test cases, and automates repetitive checks',
          'Testing pyramid: unit (base) → integration → E2E (top)',
          'Manual testing is best for exploratory and UX testing',
          'Automation handles regression, smoke, and repetitive checks',
          'Bug lifecycle: New → Assigned → Fixed → Retest → Closed',
        ],
        conceptsHe: [
          'QA = בניית ביטחון באיכות המוצר, לא רק מציאת באגים',
          'מהנדס SQA כותב תוכניות בדיקה, תרחישי בדיקה ומבצע אוטומציה של בדיקות חוזרות',
          'פירמידת הבדיקות: יחידה (בסיס) → אינטגרציה → E2E (קודקוד)',
          'בדיקה ידנית מתאימה למיון אקספלורטיבי ובדיקות UX',
          'אוטומציה מטפלת בבדיקות רגרסיה, עשן ובדיקות חוזרות',
          'מחזור חיי באג: חדש → הוקצה → תוקן → נבדק שוב → נסגר',
        ],
        snippets: [],
      },
      {
        id: 'welcome-quiz',
        type: 'quiz',
        title: 'Self-Test — QA Fundamentals',
        titleHe: 'בחן את עצמך — יסודות QA',
        questions: [
          {
            id: 'wq1', text: 'What does SQA stand for?', textHe: 'מה הפירוש של SQA?',
            options: ['Software Quality Assurance', 'System Quality Analysis', 'Software Quantity Assessment', 'Standard Quality Automation'],
            optionsHe: ['הבטחת איכות תוכנה', 'ניתוח איכות מערכות', 'הערכת כמות תוכנה', 'אוטומציה איכות סטנדרטית'],
            correct: 0,
            explanation: 'SQA = Software Quality Assurance — the practice of systematic monitoring to ensure software quality.',
            explanationHe: 'SQA = Software Quality Assurance — תחום הניטור השיטתי להבטחת איכות התוכנה.',
          },
          {
            id: 'wq2', text: 'Which layer is at the BASE of the testing pyramid?', textHe: 'איזו שכבה נמצאת בבסיס פירמידת הבדיקות?',
            options: ['E2E tests', 'Integration tests', 'Unit tests', 'Manual tests'],
            optionsHe: ['בדיקות E2E', 'בדיקות אינטגרציה', 'בדיקות יחידה', 'בדיקות ידניות'],
            correct: 2,
            explanation: 'Unit tests form the pyramid base — they are fastest, cheapest, and most numerous.',
            explanationHe: 'בדיקות יחידה מרכיבות את בסיס הפירמידה — הן המהירות, הזולות והרבות ביותר.',
          },
          {
            id: 'wq3', text: 'What is a regression test?', textHe: 'מהי בדיקת רגרסיה?',
            options: ['A test that checks new features', 'A test that ensures existing features still work after a change', 'A test for database performance', 'A test for UI responsiveness'],
            optionsHe: ['בדיקה שבודקת תכונות חדשות', 'בדיקה שמוודאת שתכונות קיימות עדיין עובדות לאחר שינוי', 'בדיקה לביצועי מסד נתונים', 'בדיקה לרספונסיביות UI'],
            correct: 1,
            explanation: 'Regression testing verifies that new changes didn\'t break existing functionality.',
            explanationHe: 'בדיקת רגרסיה מאמתת שינויים חדשים לא שברו פונקציונליות קיימת.',
          },
          {
            id: 'wq4', text: 'What is the difference between severity and priority?', textHe: 'מה ההבדל בין חומרה לעדיפות?',
            options: ['They are the same thing', 'Severity = impact on system; Priority = urgency to fix', 'Priority = impact on system; Severity = urgency to fix', 'Severity is set by developers; Priority by testers'],
            optionsHe: ['הם אותו דבר', 'חומרה = השפעה על המערכת; עדיפות = דחיפות לתיקון', 'עדיפות = השפעה על המערכת; חומרה = דחיפות לתיקון', 'חומרה נקבעת על ידי מפתחים; עדיפות על ידי בודקים'],
            correct: 1,
            explanation: 'Severity describes the technical impact; Priority describes how urgently it needs to be fixed from a business perspective.',
            explanationHe: 'חומרה מתארת את ההשפעה הטכנית; עדיפות מתארת כמה דחוף לתקן מנקודת מבט עסקית.',
          },
          {
            id: 'wq5', text: 'Black-box testing means:', textHe: 'בדיקת קופסה שחורה משמעותה:',
            options: ['Testing with knowledge of internal code', 'Testing without knowledge of internal implementation', 'Testing only the database', 'Testing only the UI layer'],
            optionsHe: ['בדיקה עם ידע על הקוד הפנימי', 'בדיקה ללא ידע על המימוש הפנימי', 'בדיקת מסד הנתונים בלבד', 'בדיקת שכבת ה-UI בלבד'],
            correct: 1,
            explanation: 'Black-box testing treats the system as a black box — you test inputs and outputs without knowing the implementation.',
            explanationHe: 'בדיקת קופסה שחורה מתייחסת למערכת כקופסה שחורה — בודקים קלטים ופלטים ללא ידע על המימוש.',
          },
          {
            id: 'wq6', text: 'What is a test case?', textHe: 'מהו תרחיש בדיקה?',
            options: ['A bug report', 'A documented set of inputs, steps, and expected results for a specific scenario', 'A CI/CD pipeline configuration', 'A type of automated script'],
            optionsHe: ['דוח באג', 'מסמך של קלטים, שלבים ותוצאות צפויות עבור תרחיש ספציפי', 'הגדרת pipeline CI/CD', 'סוג של סקריפט אוטומטי'],
            correct: 1,
            explanation: 'A test case documents the exact steps, input data, and expected outcome for verifying a specific behavior.',
            explanationHe: 'תרחיש בדיקה מתעד את השלבים המדויקים, נתוני הקלט והתוצאה הצפויה לאימות התנהגות ספציפית.',
          },
          {
            id: 'wq7', text: 'What is exploratory testing?', textHe: 'מהי בדיקה אקספלורטיבית?',
            options: ['Running automated scripts', 'Testing without a predefined test plan, relying on tester intuition', 'Testing only edge cases', 'Performance testing of APIs'],
            optionsHe: ['הרצת סקריפטים אוטומטיים', 'בדיקה ללא תוכנית בדיקה מוגדרת מראש, תוך הסתמכות על אינטואיציית הבודק', 'בדיקת מקרי קצה בלבד', 'בדיקות ביצועים של APIs'],
            correct: 1,
            explanation: 'Exploratory testing is simultaneous learning, test design, and execution — ideal for UX and discovering unexpected bugs.',
            explanationHe: 'בדיקה אקספלורטיבית היא למידה, עיצוב בדיקות וביצוע בו-זמנית — אידיאלית ל-UX וגילוי באגים בלתי צפויים.',
          },
          {
            id: 'wq8', text: 'A smoke test is:', textHe: 'בדיקת עשן היא:',
            options: ['A detailed test of all features', 'A quick sanity check to confirm basic functionality works before deeper testing', 'A security vulnerability scan', 'A load test simulating many users'],
            optionsHe: ['בדיקה מפורטת של כל התכונות', 'בדיקת שפיות מהירה לאישור שהפונקציונליות הבסיסית עובדת לפני בדיקה מעמיקה', 'סריקת פגיעויות אבטחה', 'בדיקת עומסים המדמה משתמשים רבים'],
            correct: 1,
            explanation: 'Smoke tests quickly verify that the most critical paths work — if smoke tests fail, deeper testing is pointless.',
            explanationHe: 'בדיקות עשן מאמתות במהירות שהנתיבים הקריטיים ביותר עובדים — אם בדיקות עשן נכשלות, בדיקה מעמיקה חסרת טעם.',
          },
          {
            id: 'wq9', text: 'What is the purpose of a test plan?', textHe: 'מה מטרת תוכנית הבדיקה?',
            options: ['To write automated scripts', 'To document the scope, approach, resources, and schedule for testing activities', 'To report bugs to developers', 'To configure CI/CD pipelines'],
            optionsHe: ['לכתוב סקריפטים אוטומטיים', 'לתעד את ההיקף, הגישה, המשאבים והלוח הזמנים לפעילויות הבדיקה', 'לדווח על באגים למפתחים', 'להגדיר pipelines CI/CD'],
            correct: 1,
            explanation: 'A test plan is the master document that describes what will be tested, how, by whom, and when.',
            explanationHe: 'תוכנית בדיקה היא המסמך הראשי המתאר מה יבדק, איך, על ידי מי ומתי.',
          },
          {
            id: 'wq10', text: 'Which type of testing verifies the system meets business requirements from the user\'s perspective?', textHe: 'איזה סוג בדיקה מאמת שהמערכת עומדת בדרישות העסקיות מנקודת המבט של המשתמש?',
            options: ['Unit testing', 'Integration testing', 'User Acceptance Testing (UAT)', 'Performance testing'],
            optionsHe: ['בדיקות יחידה', 'בדיקות אינטגרציה', 'בדיקות קבלת משתמש (UAT)', 'בדיקות ביצועים'],
            correct: 2,
            explanation: 'UAT is performed by end users or clients to verify the system meets their requirements before go-live.',
            explanationHe: 'UAT מבוצעת על ידי משתמשי קצה או לקוחות לאימות שהמערכת עומדת בדרישותיהם לפני עלייה לאוויר.',
          },
        ],
      },
    ],
  },
  {
    id: 'systems',
    title: 'Systems in SQA Life',
    titleHe: 'מערכות משולבות בחיי ה-SQA',
    icon: '⚙️',
    sections: [
      {
        id: 'automation-lesson',
        type: 'lesson',
        title: 'Using Automation',
        titleHe: 'שימוש באוטומציה',
        level: 'Intermediate',
        minutes: 15,
        summary: 'When to automate, which tests must be automated, tools comparison, and limits of automation.',
        summaryHe: 'מתי לאוטומט, אילו בדיקות חייבות אוטומציה, השוואת כלים ומגבלות האוטומציה.',
        body: 'Test automation is the practice of using software to execute tests automatically. Not every test should be automated — the key is choosing the right candidates.\n\nThe best candidates for automation are: regression tests that run on every code change, smoke tests that verify basic functionality, data-driven tests with many input combinations, and tests that must run across multiple browsers or devices.\n\nPlaywright (Microsoft), Selenium (open source), and Cypress (JavaScript-only) are the dominant E2E frameworks. Playwright is the modern choice: it supports TypeScript natively, has auto-wait built in, and can test Chromium, Firefox, and WebKit with one API.\n\nAutomation has real limits: exploratory testing cannot be automated, one-time tests don\'t justify the investment, and highly dynamic UIs (frequent redesigns) create maintenance burden. A brittle test suite that constantly breaks is worse than no automation.',
        bodyHe: 'אוטומציית בדיקות היא שימוש בתוכנה להרצת בדיקות אוטומטית. לא כל בדיקה צריכה להיות מאוטמטת — המפתח הוא בחירת המועמדים הנכונים.\n\nהמועמדים הטובים ביותר לאוטומציה הם: בדיקות רגרסיה שרצות על כל שינוי קוד, בדיקות עשן שמאמתות פונקציונליות בסיסית, בדיקות מונעות-נתונים עם קלטים רבים, ובדיקות שחייבות לרוץ על דפדפנים או מכשירים מרובים.\n\nPlaywright (מיקרוסופט), Selenium (קוד פתוח) ו-Cypress (JavaScript בלבד) הם מסגרות ה-E2E הדומיננטיות. Playwright הוא הבחירה המודרנית: הוא תומך ב-TypeScript באופן מובנה, מכיל המתנה אוטומטית ויכול לבדוק Chromium, Firefox ו-WebKit עם API אחד.\n\nלאוטומציה יש מגבלות אמיתיות: בדיקות אקספלורטיביות לא ניתנות לאוטומציה, בדיקות חד-פעמיות לא מצדיקות את ההשקעה, ו-UI דינמי מאוד (עיצובים מחדש תכופים) יוצר עול תחזוקה. חבילת בדיקות שבירה שמתקלקלת ללא הרף גרועה מחוסר אוטומציה.',
        concepts: [
          'Automate: regression, smoke, repetitive, multi-browser tests',
          'Don\'t automate: exploratory, one-time, or frequently-changing UI tests',
          'Playwright advantages: TypeScript, auto-wait, cross-browser with one API',
          'Page Object Model (POM) reduces maintenance by centralizing locators',
          'CI integration means tests run on every pull request automatically',
          'A flaky test (passes sometimes, fails sometimes) must be fixed or deleted — never ignored',
          'Test data should be independent per test to avoid state bleed',
        ],
        conceptsHe: [
          'אוטומט: בדיקות רגרסיה, עשן, חוזרות, רב-דפדפן',
          'אל תאוטמט: בדיקות אקספלורטיביות, חד-פעמיות, או UI שמשתנה תכופות',
          'יתרונות Playwright: TypeScript, המתנה אוטומטית, רב-דפדפן עם API אחד',
          'Page Object Model (POM) מפחית תחזוקה על ידי ריכוז locators',
          'אינטגרציית CI אומרת שבדיקות רצות על כל pull request אוטומטית',
          'בדיקה נדנדתית (עוברת לפעמים, נכשלת לפעמים) חייבת לתוקן או למחוק — לעולם לא להתעלם',
          'נתוני בדיקה צריכים להיות עצמאיים לכל בדיקה למניעת דלף מצב',
        ],
        snippets: [
          {
            label: 'When to automate — decision checklist', labelHe: 'מתי לאוטמט — רשימת תיוג', language: 'markdown',
            code: '✅ Automate if:\n- Test runs on every PR / daily\n- Same steps, different data (data-driven)\n- Multi-browser / multi-device coverage needed\n- Test takes > 5 min manually\n\n❌ Don\'t automate if:\n- Test runs once for a specific investigation\n- UI redesign happens every sprint\n- Test requires human judgment (visual design, UX feel)\n- Setup cost > 10x the time saved',
          },
          {
            label: 'Playwright quick start', labelHe: 'התחלה מהירה עם Playwright', language: 'bash',
            code: 'npm init playwright@latest\nnpx playwright test\nnpx playwright test --ui\nnpx playwright test --headed',
          },
        ],
      },
      {
        id: 'automation-quiz',
        type: 'quiz',
        title: 'Automation Quiz',
        titleHe: 'שאלון אוטומציה',
        questions: [
          {
            id: 'aq1', text: 'Which test type is MOST suitable for automation?', textHe: 'איזה סוג בדיקה מתאים ביותר לאוטומציה?',
            options: ['Exploratory testing', 'Regression testing', 'Ad-hoc testing', 'Usability testing'],
            optionsHe: ['בדיקה אקספלורטיבית', 'בדיקת רגרסיה', 'בדיקה אד-הוק', 'בדיקת שימושיות'],
            correct: 1,
            explanation: 'Regression tests run repeatedly on every code change — perfect for automation.',
            explanationHe: 'בדיקות רגרסיה רצות שוב ושוב על כל שינוי קוד — מושלמות לאוטומציה.',
          },
          {
            id: 'aq2', text: 'What is a brittle test?', textHe: 'מהי בדיקה שברירית?',
            options: ['A test that runs slowly', 'A test that fails due to minor, unrelated UI changes', 'A test with no assertions', 'A test that only runs on one browser'],
            optionsHe: ['בדיקה שרצה לאט', 'בדיקה שנכשלת בגלל שינויים קטנים ולא קשורים ב-UI', 'בדיקה ללא אסרציות', 'בדיקה שרצה רק על דפדפן אחד'],
            correct: 1,
            explanation: 'Brittle tests break when CSS classes or element positions change, even if functionality is correct. Use semantic locators to avoid this.',
            explanationHe: 'בדיקות שבריריות נשברות כשמחלקות CSS או מיקומי אלמנטים משתנים, גם אם הפונקציונליות נכונה. השתמש ב-locators סמנטיים למניעת זה.',
          },
          {
            id: 'aq3', text: 'What is the main advantage of Playwright over Selenium?', textHe: 'מה היתרון המרכזי של Playwright על פני Selenium?',
            options: ['Playwright supports more programming languages', 'Playwright has auto-wait and native TypeScript support', 'Playwright is older and more battle-tested', 'Playwright only supports Chrome'],
            optionsHe: ['Playwright תומך בשפות תכנות רבות יותר', 'ל-Playwright יש המתנה אוטומטית ותמיכה ב-TypeScript מובנה', 'Playwright ישן יותר ומוכח יותר בשדה', 'Playwright תומך רק ב-Chrome'],
            correct: 1,
            explanation: 'Playwright\'s auto-wait eliminates manual sleep() calls and flakiness. It also has first-class TypeScript support and tests Chromium/Firefox/WebKit.',
            explanationHe: 'ה-auto-wait של Playwright מבטל קריאות sleep() ידניות ונדנדתיות. יש לו גם תמיכה מעולה ב-TypeScript ובדיקת Chromium/Firefox/WebKit.',
          },
          {
            id: 'aq4', text: 'What is the Page Object Model (POM)?', textHe: 'מהו Page Object Model (POM)?',
            options: ['A database design pattern', 'A pattern that wraps each page in a class with its locators and actions', 'A way to mock API responses', 'A CI/CD configuration pattern'],
            optionsHe: ['תבנית עיצוב מסד נתונים', 'תבנית שעוטפת כל דף במחלקה עם ה-locators והפעולות שלה', 'דרך ל-mock תגובות API', 'תבנית הגדרת CI/CD'],
            correct: 1,
            explanation: 'POM centralizes all page interactions in a class. When the UI changes, you update one class instead of every test.',
            explanationHe: 'POM מרכז את כל אינטראקציות הדף במחלקה. כשה-UI משתנה, מעדכנים מחלקה אחת במקום כל בדיקה.',
          },
          {
            id: 'aq5', text: 'A flaky test should be:', textHe: 'בדיקה נדנדתית צריכה להיות:',
            options: ['Kept as-is because it sometimes passes', 'Fixed immediately or deleted — never left in the suite', 'Converted to a manual test', 'Run only in development environments'],
            optionsHe: ['נשמר כך — לפעמים הוא עובר', 'מתוקן מיד או נמחק — לעולם לא נשאר בחבילה', 'הופך לבדיקה ידנית', 'מורץ רק בסביבות פיתוח'],
            correct: 1,
            explanation: 'Flaky tests erode trust in the entire test suite. If it can\'t be fixed, delete it.',
            explanationHe: 'בדיקות נדנדתיות שוחקות את האמון בחבילת הבדיקות כולה. אם לא ניתן לתקן — מוחקים.',
          },
          {
            id: 'aq6', text: 'Which locator is MOST resilient to UI changes?', textHe: 'איזה locator הוא העמיד ביותר לשינויי UI?',
            options: ['CSS class selector (.btn-primary)', 'XPath by position (//div[3]/button)', 'getByRole(\'button\', {name: \'Submit\'})', 'getElementById(\'submit-123\')'],
            optionsHe: ['בחירת CSS class (.btn-primary)', 'XPath לפי מיקום (//div[3]/button)', 'getByRole(\'button\', {name: \'Submit\'})', 'getElementById(\'submit-123\')'],
            correct: 2,
            explanation: 'Role-based locators query the accessibility tree — they survive CSS refactors and HTML restructuring.',
            explanationHe: 'Locators מבוססי role שואלים את עץ הנגישות — הם שורדים refactors של CSS ושינויים ב-HTML.',
          },
          {
            id: 'aq7', text: 'When should you NOT automate a test?', textHe: 'מתי לא כדאי לאוטמט בדיקה?',
            options: ['When it runs every day', 'When it tests the same functionality across many data combinations', 'When the UI changes every sprint and the test breaks constantly', 'When it takes 10 minutes manually'],
            optionsHe: ['כשהוא רץ כל יום', 'כשהוא בודק את אותה פונקציונליות על פני שילובי נתונים רבים', 'כשה-UI משתנה כל ספרינט והבדיקה נשברת ללא הרף', 'כשלוקח 10 דקות ידנית'],
            correct: 2,
            explanation: 'If the UI changes so frequently that maintaining the test costs more than it saves, don\'t automate it.',
            explanationHe: 'אם ה-UI משתנה כל כך תכופות שתחזוקת הבדיקה עולה יותר ממה שהיא חוסכת, לא לאוטמט.',
          },
          {
            id: 'aq8', text: 'What does \'headless\' browser mean in testing?', textHe: 'מה משמעות דפדפן \'headless\' בבדיקות?',
            options: ['A browser without JavaScript support', 'A browser that runs without a visible UI — faster for CI', 'A browser that blocks all network requests', 'A browser that only renders text'],
            optionsHe: ['דפדפן ללא תמיכת JavaScript', 'דפדפן שרץ ללא UI גלוי — מהיר יותר ל-CI', 'דפדפן שחוסם את כל בקשות הרשת', 'דפדפן שמרנדר טקסט בלבד'],
            correct: 1,
            explanation: 'Headless mode skips rendering the visible browser window, making tests faster — ideal for CI environments.',
            explanationHe: 'מצב headless מדלג על רינדור חלון הדפדפן הגלוי, מה שמאיץ בדיקות — אידיאלי לסביבות CI.',
          },
          {
            id: 'aq9', text: 'What is a test fixture?', textHe: 'מהו test fixture?',
            options: ['A hardware component for testing', 'A setup/teardown mechanism that provides consistent test context', 'A mock API server', 'A visual regression baseline'],
            optionsHe: ['רכיב חומרה לבדיקות', 'מנגנון setup/teardown שמספק הקשר בדיקה עקבי', 'שרת API מדומה', 'בסיס ביחס לרגרסיה ויזואלית'],
            correct: 1,
            explanation: 'Fixtures handle setup (creating test data, logging in) and teardown (cleanup) so each test starts in a known state.',
            explanationHe: 'Fixtures מטפלים ב-setup (יצירת נתוני בדיקה, כניסה) וב-teardown (ניקוי) כך שכל בדיקה מתחילה במצב ידוע.',
          },
          {
            id: 'aq10', text: 'CI/CD stands for:', textHe: 'CI/CD הוא קיצור של:',
            options: ['Code Integration / Code Deployment', 'Continuous Integration / Continuous Delivery', 'Continuous Inspection / Continuous Design', 'Code Intelligence / Code Delivery'],
            optionsHe: ['אינטגרציית קוד / פריסת קוד', 'אינטגרציה רציפה / מסירה רציפה', 'בדיקה רציפה / עיצוב רציף', 'בינה קוד / מסירת קוד'],
            correct: 1,
            explanation: 'CI = merging code frequently and running automated tests. CD = automatically deploying passing builds.',
            explanationHe: 'CI = מיזוג קוד תכוף והרצת בדיקות אוטומטיות. CD = פריסה אוטומטית של builds שעברו בדיקות.',
          },
          {
            id: 'aq11', text: 'What is test isolation?', textHe: 'מהו בידוד בדיקות?',
            options: ['Running tests in a separate building', 'Each test is independent and doesn\'t depend on other tests\' state', 'Tests that only run in isolated networks', 'Testing in production with no users'],
            optionsHe: ['הרצת בדיקות בבניין נפרד', 'כל בדיקה עצמאית ולא תלויה במצב בדיקות אחרות', 'בדיקות שרצות רק ברשתות מבודדות', 'בדיקה בייצור ללא משתמשים'],
            correct: 1,
            explanation: 'Isolated tests can run in any order and in parallel without interfering with each other.',
            explanationHe: 'בדיקות מבודדות יכולות לרוץ בכל סדר ובמקביל מבלי להפריע זו לזו.',
          },
          {
            id: 'aq12', text: 'What is data-driven testing?', textHe: 'מהי בדיקה מונעת-נתונים?',
            options: ['Testing databases only', 'Running the same test logic with multiple sets of input data', 'Testing with production data only', 'Generating test code from requirements'],
            optionsHe: ['בדיקת מסדי נתונים בלבד', 'הרצת אותה לוגיקת בדיקה עם מספר ערכות נתוני קלט', 'בדיקה עם נתוני ייצור בלבד', 'יצירת קוד בדיקה מדרישות'],
            correct: 1,
            explanation: 'Data-driven testing separates test logic from test data, allowing many scenarios with one test function.',
            explanationHe: 'בדיקה מונעת-נתונים מפרידה לוגיקת בדיקה מנתוני בדיקה, מאפשרת תרחישים רבים עם פונקציית בדיקה אחת.',
          },
          {
            id: 'aq13', text: 'What should you do when a test fails in CI?', textHe: 'מה עליך לעשות כשבדיקה נכשלת ב-CI?',
            options: ['Ignore it and merge anyway', 'Delete the test', 'Investigate the failure before merging', 'Disable the test temporarily and merge'],
            optionsHe: ['התעלם ומזג בכל מקרה', 'מחק את הבדיקה', 'חקור את הכשל לפני המיזוג', 'השבת זמנית את הבדיקה ומזג'],
            correct: 2,
            explanation: 'A failing test in CI is a signal — investigate it. Merging over failures defeats the purpose of CI.',
            explanationHe: 'בדיקה נכשלת ב-CI היא אות — חוקרים אותה. מיזוג על כשלים מסכל את מטרת ה-CI.',
          },
          {
            id: 'aq14', text: 'Test parallelization means:', textHe: 'מקביול בדיקות משמעותו:',
            options: ['Running tests one after another', 'Running multiple tests simultaneously to reduce total execution time', 'Writing tests in parallel with development', 'Sharing test results across teams'],
            optionsHe: ['הרצת בדיקות אחת אחרי השנייה', 'הרצת בדיקות מרובות בו-זמנית להפחתת זמן הביצוע הכולל', 'כתיבת בדיקות במקביל לפיתוח', 'שיתוף תוצאות בדיקות בין צוותים'],
            correct: 1,
            explanation: 'Parallel execution splits the test suite across multiple workers/machines, reducing wall-clock time significantly.',
            explanationHe: 'ביצוע מקבילי מפצל את חבילת הבדיקות בין workers/מכונות מרובות, מפחית משמעותית את זמן ריצת השעון.',
          },
          {
            id: 'aq15', text: 'What is the ROI consideration for test automation?', textHe: 'מהו שיקול ה-ROI לאוטומציית בדיקות?',
            options: ['Automation always has positive ROI', 'ROI depends on test frequency — high-frequency tests justify automation investment', 'Automation is only worth it for large companies', 'Manual testing always has better ROI'],
            optionsHe: ['לאוטומציה תמיד יש ROI חיובי', 'ROI תלוי בתדירות בדיקות — בדיקות בתדירות גבוהה מצדיקות השקעה באוטומציה', 'אוטומציה כדאית רק לחברות גדולות', 'לבדיקה ידנית תמיד יש ROI טוב יותר'],
            correct: 1,
            explanation: 'Automation investment pays off when a test runs frequently enough that the time saved exceeds the time to build and maintain it.',
            explanationHe: 'השקעה באוטומציה משתלמת כשבדיקה רצה מספיק פעמים שהזמן שנחסך עולה על הזמן לבנות ולתחזק אותה.',
          },
          {
            id: 'aq16', text: 'Which statement about exploratory testing is TRUE?', textHe: 'איזו אמירה לגבי בדיקה אקספלורטיבית נכונה?',
            options: ['It can be fully automated', 'It relies on tester intuition and cannot follow a strict script', 'It is less valuable than automated testing', 'It is only done by junior testers'],
            optionsHe: ['ניתן לאוטמט אותה לחלוטין', 'היא מסתמכת על אינטואיציית הבודק ולא יכולה לעקוב אחר סקריפט קפדני', 'היא פחות בעלת ערך מבדיקות אוטומטיות', 'היא מבוצעת רק על ידי בודקים זוטרים'],
            correct: 1,
            explanation: 'Exploratory testing uses human judgment to discover unexpected issues — it complements automation but cannot be replaced by it.',
            explanationHe: 'בדיקה אקספלורטיבית משתמשת בשיפוט אנושי לגילוי בעיות בלתי צפויות — היא משלימה אוטומציה אך לא ניתן להחליפה.',
          },
        ],
      },
      {
        id: 'automation-practice',
        type: 'practice',
        title: 'Practice: Automation Planning',
        titleHe: 'תרגול: תכנון אוטומציה',
        practiceDesc: 'Plan an automation strategy for a login feature. Decide which scenarios to automate, choose locators, and write one basic test.',
        practiceDescHe: 'תכנן אסטרטגיית אוטומציה לתכונת כניסה. החלט אילו תרחישים לאוטמט, בחר locators, וכתוב בדיקה בסיסית אחת.',
        practiceItems: [
          'List 3 scenarios to automate for a login form',
          'List 1 scenario you would NOT automate and explain why',
          'Write the locators for: email field, password field, submit button',
          'Write a basic Playwright test for successful login',
          'Add a negative test case for invalid credentials',
        ],
        practiceItemsHe: [
          'רשום 3 תרחישים לאוטומציה עבור טופס כניסה',
          'רשום תרחיש 1 שלא תאוטמט והסבר מדוע',
          'כתוב locators עבור: שדה אימייל, שדה סיסמה, כפתור שליחה',
          'כתוב בדיקת Playwright בסיסית לכניסה מוצלחת',
          'הוסף תרחיש בדיקה שלילי לאישורים לא חוקיים',
        ],
      },
      {
        id: 'api-lesson',
        type: 'lesson',
        title: 'API Testing',
        titleHe: 'בדיקות API',
        level: 'Intermediate',
        minutes: 15,
        summary: 'Understand REST APIs, HTTP methods, status codes, and how to test APIs with Playwright and Postman.',
        summaryHe: 'הבן REST APIs, שיטות HTTP, קודי סטטוס, וכיצד לבדוק APIs עם Playwright ו-Postman.',
        body: 'An API (Application Programming Interface) is a contract between a client and a server. REST APIs use HTTP methods to perform operations on resources. Testing APIs directly is faster than UI tests and catches integration bugs early.\n\nHTTP status codes tell you the outcome: 2xx = success (200 OK, 201 Created), 4xx = client error (400 Bad Request, 401 Unauthorized, 404 Not Found), 5xx = server error (500 Internal Server Error).\n\nPlaywright\'s request fixture lets you make HTTP calls directly in tests. Postman provides a GUI for manual API exploration; Newman runs Postman collections in CI. A good API test checks: correct status code, correct response body structure, correct error messages, and response time.',
        bodyHe: 'API (ממשק תכנות יישומים) הוא חוזה בין לקוח לשרת. REST APIs משתמשים בשיטות HTTP לביצוע פעולות על משאבים. בדיקת APIs ישירות מהירה יותר מבדיקות UI ותופסת באגי אינטגרציה מוקדם.\n\nקודי סטטוס HTTP מספרים לך את התוצאה: 2xx = הצלחה (200 OK, 201 Created), 4xx = שגיאת לקוח (400 Bad Request, 401 Unauthorized, 404 Not Found), 5xx = שגיאת שרת (500 Internal Server Error).\n\nה-request fixture של Playwright מאפשר לבצע קריאות HTTP ישירות בבדיקות. Postman מספק GUI לחקר API ידני; Newman מריץ אוספי Postman ב-CI. בדיקת API טובה בודקת: קוד סטטוס נכון, מבנה גוף תגובה נכון, הודעות שגיאה נכונות, וזמן תגובה.',
        concepts: [
          'REST = REpresentational State Transfer — uses HTTP verbs on resource URLs',
          'GET retrieves data (idempotent); POST creates; PUT replaces; PATCH partially updates; DELETE removes',
          'Status 200 = OK; 201 = Created; 400 = Bad input; 401 = Unauthorized; 403 = Forbidden; 404 = Not Found; 500 = Server error',
          'Test API contract: schema, required fields, data types — not just happy path',
          'Authorization: Bearer token is the most common auth header pattern',
          'Mock servers simulate real APIs during development — useful for testing error scenarios',
          'Response time matters: a correct but slow API is still a bug',
        ],
        conceptsHe: [
          'REST = העברת מצב ייצוגי — משתמש בפעלי HTTP על URLs של משאבים',
          'GET מאחזר נתונים (אידמפוטנטי); POST יוצר; PUT מחליף; PATCH מעדכן חלקית; DELETE מסיר',
          'סטטוס 200 = OK; 201 = נוצר; 400 = קלט גרוע; 401 = לא מאושר; 403 = אסור; 404 = לא נמצא; 500 = שגיאת שרת',
          'בדוק חוזה API: סכמה, שדות נדרשים, סוגי נתונים — לא רק המסלול המאושר',
          'Authorization: Bearer token הוא תבנית כותרת Auth הנפוצה ביותר',
          'שרתי mock מדמים APIs אמיתיים בזמן פיתוח — שימושי לבדיקת תרחישי שגיאה',
          'זמן תגובה חשוב: API נכון אך איטי עדיין הוא באג',
        ],
        snippets: [
          {
            label: 'Playwright API test', labelHe: 'בדיקת API עם Playwright', language: 'typescript',
            code: `import { test, expect } from '@playwright/test'

test('GET /users returns list', async ({ request }) => {
  const res = await request.get('/api/users')
  expect(res.status()).toBe(200)
  const body = await res.json()
  expect(Array.isArray(body)).toBe(true)
})

test('POST /users creates user', async ({ request }) => {
  const res = await request.post('/api/users', {
    data: { name: 'Alice', email: 'alice@test.com' },
    headers: { Authorization: 'Bearer test-token' },
  })
  expect(res.status()).toBe(201)
  const user = await res.json()
  expect(user.email).toBe('alice@test.com')
})`,
          },
          {
            label: 'Postman test script', labelHe: 'סקריפט בדיקה Postman', language: 'javascript',
            code: `pm.test('Status is 200', () => {
  pm.response.to.have.status(200)
})

pm.test('Has users array', () => {
  const body = pm.response.json()
  pm.expect(body).to.be.an('array')
  pm.expect(body.length).to.be.above(0)
})

// Save for next request
pm.environment.set('userId', pm.response.json()[0].id)`,
          },
        ],
      },
      {
        id: 'api-quiz',
        type: 'quiz',
        title: 'API Testing Quiz',
        titleHe: 'שאלון בדיקות API',
        questions: [
          {
            id: 'api1', text: 'What does HTTP status code 404 mean?', textHe: 'מה משמעות קוד סטטוס HTTP 404?',
            options: ['Server error', 'Not found — the requested resource doesn\'t exist', 'Unauthorized — missing authentication', 'Bad request — invalid input'],
            optionsHe: ['שגיאת שרת', 'לא נמצא — המשאב המבוקש לא קיים', 'לא מאושר — חסר אימות', 'בקשה שגויה — קלט לא חוקי'],
            correct: 1,
            explanation: '404 Not Found means the server cannot find the requested resource at the specified URL.',
            explanationHe: '404 Not Found אומר שהשרת לא יכול למצוא את המשאב המבוקש ב-URL שצוין.',
          },
          {
            id: 'api2', text: 'Which HTTP method is used to CREATE a new resource?', textHe: 'באיזו שיטת HTTP משתמשים ליצירת משאב חדש?',
            options: ['GET', 'PUT', 'POST', 'DELETE'],
            optionsHe: ['GET', 'PUT', 'POST', 'DELETE'],
            correct: 2,
            explanation: 'POST creates a new resource. The server typically returns 201 Created on success.',
            explanationHe: 'POST יוצר משאב חדש. השרת בדרך כלל מחזיר 201 Created בהצלחה.',
          },
          {
            id: 'api3', text: 'What does \'idempotent\' mean for HTTP GET?', textHe: 'מה משמעות \'אידמפוטנטי\' עבור HTTP GET?',
            options: ['The request modifies server state', 'Calling it multiple times gives the same result without side effects', 'The request requires authentication', 'The request returns binary data'],
            optionsHe: ['הבקשה משנה את מצב השרת', 'קריאה מרובות פעמים מניבה את אותה תוצאה ללא תופעות לוואי', 'הבקשה דורשת אימות', 'הבקשה מחזירה נתונים בינאריים'],
            correct: 1,
            explanation: 'GET, PUT, and DELETE are idempotent — repeating them doesn\'t change the outcome. POST is not idempotent.',
            explanationHe: 'GET, PUT ו-DELETE הם אידמפוטנטיים — חזרה עליהם לא משנה את התוצאה. POST אינו אידמפוטנטי.',
          },
          {
            id: 'api4', text: 'What is an API contract?', textHe: 'מהו חוזה API?',
            options: ['A legal agreement between companies', 'The agreed-upon specification of request/response format, status codes, and behavior', 'A database schema definition', 'A CI/CD pipeline configuration'],
            optionsHe: ['הסכם משפטי בין חברות', 'המפרט המוסכם של פורמט בקשה/תגובה, קודי סטטוס והתנהגות', 'הגדרת סכמת מסד נתונים', 'הגדרת pipeline CI/CD'],
            correct: 1,
            explanation: 'API contract testing verifies the API behaves exactly as documented — catching breaking changes before they reach production.',
            explanationHe: 'בדיקת חוזה API מאמתת שה-API מתנהג בדיוק כמתועד — תופסת שינויים שוברים לפני שהם מגיעים לייצור.',
          },
          {
            id: 'api5', text: 'Status code 401 means:', textHe: 'קוד סטטוס 401 משמעותו:',
            options: ['Server crashed', 'Resource not found', 'Authentication required or failed', 'Request was malformed'],
            optionsHe: ['השרת קרס', 'משאב לא נמצא', 'נדרש אימות או האימות נכשל', 'הבקשה הייתה בפורמט שגוי'],
            correct: 2,
            explanation: '401 Unauthorized means the request lacks valid authentication credentials.',
            explanationHe: '401 Unauthorized אומר שלבקשה חסרים אישורי אימות חוקיים.',
          },
          {
            id: 'api6', text: 'What is the Authorization: Bearer header used for?', textHe: 'למה משמשת כותרת Authorization: Bearer?',
            options: ['Setting content type', 'Passing an authentication token to identify the caller', 'Specifying the response language', 'Controlling cache behavior'],
            optionsHe: ['הגדרת סוג תוכן', 'העברת טוקן אימות לזיהוי המבצע', 'ציון שפת התגובה', 'שליטה בהתנהגות cache'],
            correct: 1,
            explanation: 'Bearer tokens (commonly JWTs) are passed in the Authorization header to authenticate API requests.',
            explanationHe: 'טוקני Bearer (בדרך כלל JWTs) מועברים בכותרת Authorization לאימות בקשות API.',
          },
          {
            id: 'api7', text: 'What should an API test verify?', textHe: 'מה צריכה בדיקת API לאמת?',
            options: ['Only the status code', 'Status code, response body structure, and error messages', 'Only that the response is not empty', 'Only performance metrics'],
            optionsHe: ['רק קוד הסטטוס', 'קוד סטטוס, מבנה גוף התגובה והודעות שגיאה', 'רק שהתגובה אינה ריקה', 'רק מדדי ביצועים'],
            correct: 1,
            explanation: 'Comprehensive API tests check status code, response structure/schema, field values, and meaningful error messages.',
            explanationHe: 'בדיקות API מקיפות בודקות קוד סטטוס, מבנה/סכמת תגובה, ערכי שדות והודעות שגיאה משמעותיות.',
          },
          {
            id: 'api8', text: 'What is a mock server?', textHe: 'מהו שרת mock?',
            options: ['A server that slows down responses deliberately', 'A simulated server that returns predefined responses — useful for testing without the real backend', 'A security proxy for APIs', 'A load balancer for test environments'],
            optionsHe: ['שרת שמאט תגובות בכוונה', 'שרת מדומה שמחזיר תגובות מוגדרות מראש — שימושי לבדיקה ללא ה-backend האמיתי', 'פרוקסי אבטחה ל-APIs', 'מאזן עומסים לסביבות בדיקה'],
            correct: 1,
            explanation: 'Mock servers let you test your client code against predictable responses, including error conditions, without a real backend.',
            explanationHe: 'שרתי mock מאפשרים לבדוק קוד לקוח מול תגובות צפויות, כולל תנאי שגיאה, ללא backend אמיתי.',
          },
          {
            id: 'api9', text: 'REST stands for:', textHe: 'REST עומד על:',
            options: ['Rapid Endpoint Security Testing', 'REpresentational State Transfer', 'Remote Execution Service Technology', 'Reliable Endpoint Service Transmission'],
            optionsHe: ['בדיקת אבטחת נקודות קצה מהירה', 'העברת מצב ייצוגי', 'טכנולוגיית שירות ביצוע מרחוק', 'שידור שירות נקודת קצה אמין'],
            correct: 1,
            explanation: 'REST = REpresentational State Transfer. It\'s an architectural style using HTTP verbs on resource URLs.',
            explanationHe: 'REST = REpresentational State Transfer. זהו סגנון ארכיטקטוני המשתמש בפעלי HTTP על URLs של משאבים.',
          },
          {
            id: 'api10', text: 'What HTTP method should be used to partially update a resource?', textHe: 'באיזו שיטת HTTP יש להשתמש כדי לעדכן חלקית משאב?',
            options: ['POST', 'PUT', 'PATCH', 'GET'],
            optionsHe: ['POST', 'PUT', 'PATCH', 'GET'],
            correct: 2,
            explanation: 'PATCH partially updates a resource (only the fields you send). PUT replaces the entire resource.',
            explanationHe: 'PATCH מעדכן משאב חלקית (רק השדות שאתה שולח). PUT מחליף את המשאב כולו.',
          },
          {
            id: 'api11', text: 'In Postman, what is an environment used for?', textHe: 'ב-Postman, למה משמשת סביבה?',
            options: ['Storing test scripts', 'Storing variables like base URLs and tokens that change between environments', 'Running tests in parallel', 'Generating API documentation'],
            optionsHe: ['אחסון סקריפטי בדיקה', 'אחסון משתנים כמו URLs בסיס וטוקנים שמשתנים בין סביבות', 'הרצת בדיקות במקביל', 'יצירת תיעוד API'],
            correct: 1,
            explanation: 'Postman environments store {{variables}} so you can switch between dev/staging/prod without changing each request.',
            explanationHe: 'סביבות Postman מאחסנות {{משתנים}} כך שתוכל לעבור בין dev/staging/prod ללא שינוי כל בקשה.',
          },
          {
            id: 'api12', text: 'What does Newman do?', textHe: 'מה עושה Newman?',
            options: ['It is a GUI for designing APIs', 'It runs Postman collections from the command line, enabling CI integration', 'It generates API documentation automatically', 'It monitors API uptime in production'],
            optionsHe: ['זהו GUI לעיצוב APIs', 'הוא מריץ אוספי Postman משורת הפקודה, מאפשר אינטגרציית CI', 'הוא יוצר תיעוד API אוטומטית', 'הוא מנטר זמינות API בייצור'],
            correct: 1,
            explanation: 'Newman is the CLI runner for Postman collections — run newman run collection.json in any CI pipeline.',
            explanationHe: 'Newman הוא מרוץ CLI לאוספי Postman — הרץ newman run collection.json בכל pipeline CI.',
          },
          {
            id: 'api13', text: 'Status code 500 means:', textHe: 'קוד סטטוס 500 משמעותו:',
            options: ['Request succeeded', 'Client sent an invalid request', 'An unexpected error occurred on the server', 'Resource was successfully created'],
            optionsHe: ['הבקשה הצליחה', 'הלקוח שלח בקשה לא חוקית', 'אירעה שגיאה בלתי צפויה בשרת', 'המשאב נוצר בהצלחה'],
            correct: 2,
            explanation: '500 Internal Server Error means the server encountered an unexpected condition. It\'s a server-side bug.',
            explanationHe: '500 Internal Server Error אומר שהשרת נתקל בתנאי בלתי צפוי. זהו באג בצד השרת.',
          },
          {
            id: 'api14', text: 'What is the Content-Type header used for?', textHe: 'למה משמשת כותרת Content-Type?',
            options: ['Authentication', 'Specifying the format of the request body (e.g. application/json)', 'Setting the response language', 'Controlling caching'],
            optionsHe: ['אימות', 'ציון פורמט גוף הבקשה (למשל application/json)', 'הגדרת שפת התגובה', 'שליטה ב-caching'],
            correct: 1,
            explanation: 'Content-Type tells the server what format the request body is in. For JSON APIs, use \'application/json\'.',
            explanationHe: 'Content-Type מספר לשרת באיזה פורמט גוף הבקשה. עבור APIs של JSON, השתמש ב-\'application/json\'.',
          },
          {
            id: 'api15', text: 'API contract testing ensures:', textHe: 'בדיקת חוזה API מבטיחה:',
            options: ['APIs run fast enough', 'The API response matches the agreed-upon schema and prevents breaking changes', 'APIs are secure', 'APIs handle high traffic'],
            optionsHe: ['APIs רצים מהר מספיק', 'תגובת ה-API תואמת את הסכמה המוסכמת ומונעת שינויים שוברים', 'APIs מאובטחים', 'APIs מטפלים בתנועה גבוהה'],
            correct: 1,
            explanation: 'Contract tests catch when a producer API changes in a way that breaks consumer expectations — before it reaches production.',
            explanationHe: 'בדיקות חוזה תופסות כשה-API של הספק משתנה באופן שמשבר ציפיות הצרכן — לפני שזה מגיע לייצור.',
          },
          {
            id: 'api16', text: 'When testing a DELETE endpoint, what should you verify?', textHe: 'כשבודקים נקודת קצה DELETE, מה יש לאמת?',
            options: ['Only that status is 200', 'Status code (204 No Content or 200), that the resource is gone (GET returns 404), and repeated DELETE handles gracefully', 'That the database is empty', 'Only that the response is JSON'],
            optionsHe: ['רק שהסטטוס הוא 200', 'קוד סטטוס (204 No Content או 200), שהמשאב נמחק (GET מחזיר 404), וש-DELETE חוזר מטופל בחן', 'שמסד הנתונים ריק', 'רק שהתגובה היא בפורמט JSON'],
            correct: 1,
            explanation: 'A complete DELETE test checks: correct status, resource is actually deleted, and idempotency (deleting again returns 404, not 500).',
            explanationHe: 'בדיקת DELETE מלאה בודקת: סטטוס נכון, המשאב אכן נמחק, ואידמפוטנטיות (מחיקה שוב מחזירה 404, לא 500).',
          },
          {
            id: 'api17', text: 'Rate limiting in APIs means:', textHe: 'הגבלת קצב ב-APIs משמעותה:',
            options: ['The API only works in certain geographic regions', 'The server limits how many requests a client can make in a given time window', 'The API only accepts certain data formats', 'The server prioritizes certain users'],
            optionsHe: ['ה-API עובד רק באזורים גיאוגרפיים מסוימים', 'השרת מגביל כמה בקשות לקוח יכול לבצע בחלון זמן נתון', 'ה-API מקבל רק פורמטי נתונים מסוימים', 'השרת מעדיף משתמשים מסוימים'],
            correct: 1,
            explanation: 'Rate limiting protects the server from abuse. Status 429 Too Many Requests is returned when the limit is exceeded.',
            explanationHe: 'הגבלת קצב מגנה על השרת מניצול לרעה. סטטוס 429 Too Many Requests מוחזר כשהמגבלה חרגת.',
          },
          {
            id: 'api18', text: 'What is the benefit of testing APIs separately from the UI?', textHe: 'מה היתרון בבדיקת APIs בנפרד מה-UI?',
            options: ['API tests are prettier', 'API tests are faster, more stable, and catch backend bugs without browser overhead', 'API tests require no coding skills', 'API tests replace all UI tests'],
            optionsHe: ['בדיקות API יפות יותר', 'בדיקות API מהירות יותר, יציבות יותר ותופסות באגי backend ללא עומס הדפדפן', 'בדיקות API לא דורשות כישורי תכנות', 'בדיקות API מחליפות את כל בדיקות ה-UI'],
            correct: 1,
            explanation: 'API tests run in milliseconds vs. seconds for UI tests, have less flakiness, and test the actual business logic layer.',
            explanationHe: 'בדיקות API רצות במילישניות לעומת שניות לבדיקות UI, פחות נדנדתיות ובודקות את שכבת הלוגיקה העסקית האמיתית.',
          },
        ],
      },
      {
        id: 'api-practice',
        type: 'practice',
        title: 'Practice: API Testing',
        titleHe: 'תרגול: בדיקות API',
        practiceDesc: 'Write API tests for a simple user management API.',
        practiceDescHe: 'כתוב בדיקות API עבור API פשוט לניהול משתמשים.',
        practiceItems: [
          'Write a GET test that verifies the response is 200 and returns an array',
          'Write a POST test that creates a user and checks 201 status',
          'Write a test for 404 when requesting a non-existent user',
          'Write a test that verifies the Authorization header is required (returns 401 without it)',
          'Set up a Postman environment with {{baseUrl}} and {{token}} variables',
        ],
        practiceItemsHe: [
          'כתוב בדיקת GET שמאמתת שהתגובה היא 200 ומחזירה מערך',
          'כתוב בדיקת POST שיוצרת משתמש ובודקת סטטוס 201',
          'כתוב בדיקה ל-404 כשמבקשים משתמש שאינו קיים',
          'כתוב בדיקה שמאמתת שכותרת Authorization נדרשת (מחזירה 401 ללא)',
          'הגדר סביבת Postman עם משתני {{baseUrl}} ו-{{token}}',
        ],
      },
    ],
  },
]
