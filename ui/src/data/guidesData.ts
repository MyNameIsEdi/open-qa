export interface Question {
  id: string;
  text: string;
  textHe: string;
  options: string[];
  optionsHe: string[];
  correct: number;
  explanation: string;
  explanationHe: string;
}

export interface GuideSection {
  id: string;
  type: 'lesson' | 'quiz' | 'practice' | 'exam' | 'tips' | 'summary';
  title: string;
  titleHe: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  minutes?: number;
  summary?: string;
  summaryHe?: string;
  body?: string;
  bodyHe?: string;
  concepts?: string[];
  conceptsHe?: string[];
  snippets?: { label: string; labelHe: string; code: string; language: string }[];
  questions?: Question[];
  practiceDesc?: string;
  practiceDescHe?: string;
  practiceItems?: string[];
  practiceItemsHe?: string[];
}

export interface GuideModule {
  id: string;
  title: string;
  titleHe: string;
  icon: string;
  sections: GuideSection[];
}

export const MODULES: GuideModule[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    titleHe: 'ברוכים הבאים',
    icon: '🎓',
    sections: [
      {
        id: 'intro-qa',
        type: 'lesson',
        title: 'What is QA Automation?',
        titleHe: 'מהי אוטומציית QA?',
        level: 'Beginner',
        minutes: 5,
        summary: 'Understand what QA is, what an SQA engineer does, and why automation matters.',
        summaryHe: 'הבן מהו QA, מה עושה מהנדס SQA ומדוע אוטומציה חשובה.',
        body: 'Imagine a car factory. At the end of the assembly line there is a quality inspector — someone who checks every car before it leaves the factory. They verify the doors close properly, the engine starts, and the lights work. Software QA engineers play the same role, but for software products. Instead of checking cars, they check web applications, mobile apps, and APIs.\n\nQA stands for Quality Assurance. An SQA (Software Quality Assurance) engineer does not just find bugs — they build systems that prevent bugs from reaching users. They write test plans, design test cases, and build automation that runs 24/7 checking that nothing is broken.\n\nThe testing pyramid explains how to balance test types. At the base are unit tests — fast, cheap, and thousands of them. In the middle are integration tests — checking that components talk to each other correctly. At the top are E2E (end-to-end) tests — simulating a real user clicking through the app. Automation is essential for the bottom two layers; the top layer uses tools like Playwright.\n\nWhen a bug is found it goes through a lifecycle: New → Assigned (to a developer) → Fixed → Retest (by QA) → Closed. Understanding this flow helps you communicate clearly with your team and track quality over time.',
        bodyHe:
          'דמיין מפעל מכוניות. בסוף פס הייצור יש בודק איכות — מישהו שבודק כל מכונית לפני שהיא עוזבת את המפעל. הוא מאמת שהדלתות נסגרות כראוי, המנוע מתניע והאורות עובדים. מהנדסי QA תוכנה ממלאים את אותו תפקיד, אבל עבור מוצרי תוכנה. במקום לבדוק מכוניות, הם בודקים אפליקציות ווב, אפליקציות מובייל ו-APIs.\n\nQA הוא קיצור של Quality Assurance — הבטחת איכות. מהנדס SQA (הבטחת איכות תוכנה) לא רק מוצא באגים — הוא בונה מערכות שמונעות מבאגים להגיע למשתמשים. הוא כותב תוכניות בדיקה, מעצב תרחישי בדיקה ובונה אוטומציה שרצה 24/7 ובודקת שכלום לא שבור.\n\nפירמידת הבדיקות מסבירה כיצד לאזן בין סוגי בדיקות. בבסיס נמצאות בדיקות יחידה — מהירות, זולות, ואלפים מהן. באמצע בדיקות אינטגרציה — בודקות שרכיבים מדברים זה עם זה נכון. בראש בדיקות E2E — מדמות משתמש אמיתי שלוחץ בתוך האפליקציה. אוטומציה חיונית לשתי שכבות התחתונות; השכבה העליונה משתמשת בכלים כמו Playwright.\n\nכשבאג נמצא הוא עובר מחזור חיים: חדש → הוקצה (למפתח) → תוקן → נבדק שוב (על ידי QA) → נסגר. הבנת הזרימה הזו עוזרת לך לתקשר בבהירות עם הצוות ולעקוב אחר האיכות לאורך זמן.',
        concepts: [
          'QA = building confidence in product quality, not just finding bugs',
          'Testing pyramid: unit (base, fastest) → integration → E2E (top, slowest)',
          'Automation handles regression and smoke tests; manual handles exploratory and UX',
          'Bug lifecycle: New → Assigned → Fixed → Retest → Closed',
          'SQA engineer writes test plans, test cases, and automates repetitive checks',
          'Every software product ships faster and safer with a good QA process',
        ],
        conceptsHe: [
          'QA = בניית ביטחון באיכות המוצר, לא רק מציאת באגים',
          'פירמידת בדיקות: יחידה (בסיס, מהיר) → אינטגרציה → E2E (ראש, איטי)',
          'אוטומציה מטפלת ברגרסיה ועשן; ידנית מטפלת באקספלורטיבי ו-UX',
          'מחזור חיי באג: חדש → הוקצה → תוקן → נבדק שוב → נסגר',
          'מהנדס SQA כותב תוכניות בדיקה, תרחישים ומבצע אוטומציה',
          'כל מוצר תוכנה משתחרר מהר יותר ובטוח יותר עם תהליך QA טוב',
        ],
        snippets: [],
      },
      {
        id: 'course-overview',
        type: 'lesson',
        title: 'Course Overview — What Will We Learn?',
        titleHe: 'סקירת הקורס — מה נלמד?',
        level: 'Beginner',
        minutes: 3,
        summary:
          'A roadmap of the full course: 8 modules covering automation, API, load, IoT, SQL, AI, DevOps and security testing.',
        summaryHe:
          'מפת דרכים של הקורס המלא: 8 מודולים המכסים אוטומציה, API, עומסים, IoT, SQL, AI, DevOps ובדיקות אבטחה.',
        body: "This course is designed for students and career changers who want to enter the world of software quality assurance. No prior QA experience is required — just curiosity and willingness to practice. By the end you will have real, hands-on skills that employers look for.\n\nHere is what each module covers: We start with automation testing using Playwright — the most in-demand E2E tool today. Then we move to API testing (both with Playwright and Postman). After that, load and performance testing with k6. Then hardware-integrated and IoT systems testing. The largest module is SQL — essential for every QA engineer who wants to validate data. Finally, enrichment topics: using AI to speed up your work, understanding DevOps pipelines, and cybersecurity basics for testers.\n\nThe best way to use this course: read the lesson, study the key concepts, run the code snippets yourself, then do the practice tasks before taking the quiz. Learning QA is like learning to drive — reading about it is not enough. You need to sit in the driver's seat.",
        bodyHe:
          'קורס זה מיועד לסטודנטים ומחליפי קריירה שרוצים להיכנס לעולם הבטחת איכות תוכנה. אין צורך בניסיון QA מוקדם — רק סקרנות ורצון להתאמן. בסוף יהיו לך מיומנויות מעשיות אמיתיות שמעסיקים מחפשים.\n\nהנה מה שכל מודול מכסה: אנו מתחילים עם אוטומציית בדיקות באמצעות Playwright — הכלי E2E המבוקש ביותר כיום. לאחר מכן עוברים לבדיקות API (גם עם Playwright וגם עם Postman). אחרי זה, בדיקות עומסים וביצועים עם k6. לאחר מכן בדיקות מערכות משולבות חומרה ו-IoT. המודול הגדול ביותר הוא SQL — חיוני לכל מהנדס QA שרוצה לאמת נתונים. לבסוף, נושאי העשרה: שימוש ב-AI להאצת עבודתך, הבנת pipelines DevOps ויסודות אבטחת סייבר לבודקים.\n\nהדרך הטובה ביותר להשתמש בקורס: קרא את השיעור, למד את המושגים המרכזיים, הרץ את קטעי הקוד בעצמך, ואז בצע את משימות התרגול לפני הבחינה. לימוד QA הוא כמו לימוד נהיגה — קריאה עליו אינה מספיקה. אתה צריך לשבת במושב הנהג.',
        concepts: [
          'Module 1: QA foundations and course roadmap',
          'Module 2: Automation testing with Playwright (POM, locators, CI)',
          'Module 3: API testing with Playwright request fixture and Postman/Newman',
          'Module 4: Load, performance, stress and soak testing with k6',
          'Module 5: Hardware-integrated and IoT systems testing',
          'Module 6: SQL for QA — SELECT, JOINs, GROUP BY, real-world queries',
          'Module 7: AI for testing, DevOps pipelines, and cybersecurity basics',
          'Module 8: Interview preparation and learning summary',
        ],
        conceptsHe: [
          'מודול 1: יסודות QA ומפת דרכים של הקורס',
          'מודול 2: אוטומציית בדיקות עם Playwright (POM, locators, CI)',
          'מודול 3: בדיקות API עם Playwright request fixture ו-Postman/Newman',
          'מודול 4: בדיקות עומסים, ביצועים, לחץ וסבולת עם k6',
          'מודול 5: בדיקות מערכות משולבות חומרה ו-IoT',
          'מודול 6: SQL ל-QA — SELECT, JOINs, GROUP BY, שאילתות מהחיים האמיתיים',
          'מודול 7: AI לבדיקות, pipelines DevOps, ויסודות אבטחת סייבר',
          'מודול 8: הכנה לראיון ותקציר לימוד',
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
            id: 'wq1',
            text: 'What does SQA stand for?',
            textHe: 'מה הפירוש של SQA?',
            options: [
              'Software Quality Assurance',
              'System Quality Analysis',
              'Software Quantity Assessment',
              'Standard Quality Automation',
            ],
            optionsHe: [
              'הבטחת איכות תוכנה',
              'ניתוח איכות מערכות',
              'הערכת כמות תוכנה',
              'אוטומציה איכות סטנדרטית',
            ],
            correct: 0,
            explanation:
              'SQA = Software Quality Assurance — the practice of systematic monitoring to ensure software quality.',
            explanationHe:
              'SQA = Software Quality Assurance — תחום הניטור השיטתי להבטחת איכות התוכנה.',
          },
          {
            id: 'wq2',
            text: 'Which layer is at the BASE of the testing pyramid?',
            textHe: 'איזו שכבה נמצאת בבסיס פירמידת הבדיקות?',
            options: ['E2E tests', 'Integration tests', 'Unit tests', 'Manual tests'],
            optionsHe: ['בדיקות E2E', 'בדיקות אינטגרציה', 'בדיקות יחידה', 'בדיקות ידניות'],
            correct: 2,
            explanation:
              'Unit tests form the pyramid base — they are fastest, cheapest, and most numerous.',
            explanationHe:
              'בדיקות יחידה מרכיבות את בסיס הפירמידה — הן המהירות, הזולות והרבות ביותר.',
          },
          {
            id: 'wq3',
            text: 'What is a regression test?',
            textHe: 'מהי בדיקת רגרסיה?',
            options: [
              'A test that checks new features',
              'A test that ensures existing features still work after a change',
              'A test for database performance',
              'A test for UI responsiveness',
            ],
            optionsHe: [
              'בדיקה שבודקת תכונות חדשות',
              'בדיקה שמוודאת שתכונות קיימות עדיין עובדות לאחר שינוי',
              'בדיקה לביצועי מסד נתונים',
              'בדיקה לרספונסיביות UI',
            ],
            correct: 1,
            explanation:
              "Regression testing verifies that new changes didn't break existing functionality.",
            explanationHe: 'בדיקת רגרסיה מאמתת שינויים חדשים לא שברו פונקציונליות קיימת.',
          },
          {
            id: 'wq4',
            text: 'What is the difference between severity and priority?',
            textHe: 'מה ההבדל בין חומרה לעדיפות?',
            options: [
              'They are the same thing',
              'Severity = impact on system; Priority = urgency to fix',
              'Priority = impact on system; Severity = urgency to fix',
              'Severity is set by developers; Priority by testers',
            ],
            optionsHe: [
              'הם אותו דבר',
              'חומרה = השפעה על המערכת; עדיפות = דחיפות לתיקון',
              'עדיפות = השפעה על המערכת; חומרה = דחיפות לתיקון',
              'חומרה נקבעת על ידי מפתחים; עדיפות על ידי בודקים',
            ],
            correct: 1,
            explanation:
              'Severity describes the technical impact; Priority describes how urgently it needs to be fixed from a business perspective.',
            explanationHe:
              'חומרה מתארת את ההשפעה הטכנית; עדיפות מתארת כמה דחוף לתקן מנקודת מבט עסקית.',
          },
          {
            id: 'wq5',
            text: 'Black-box testing means:',
            textHe: 'בדיקת קופסה שחורה משמעותה:',
            options: [
              'Testing with knowledge of internal code',
              'Testing without knowledge of internal implementation',
              'Testing only the database',
              'Testing only the UI layer',
            ],
            optionsHe: [
              'בדיקה עם ידע על הקוד הפנימי',
              'בדיקה ללא ידע על המימוש הפנימי',
              'בדיקת מסד הנתונים בלבד',
              'בדיקת שכבת ה-UI בלבד',
            ],
            correct: 1,
            explanation:
              'Black-box testing treats the system as a black box — you test inputs and outputs without knowing the implementation.',
            explanationHe:
              'בדיקת קופסה שחורה מתייחסת למערכת כקופסה שחורה — בודקים קלטים ופלטים ללא ידע על המימוש.',
          },
          {
            id: 'wq6',
            text: 'What is a test case?',
            textHe: 'מהו תרחיש בדיקה?',
            options: [
              'A bug report',
              'A documented set of inputs, steps, and expected results for a specific scenario',
              'A CI/CD pipeline configuration',
              'A type of automated script',
            ],
            optionsHe: [
              'דוח באג',
              'מסמך של קלטים, שלבים ותוצאות צפויות עבור תרחיש ספציפי',
              'הגדרת pipeline CI/CD',
              'סוג של סקריפט אוטומטי',
            ],
            correct: 1,
            explanation:
              'A test case documents the exact steps, input data, and expected outcome for verifying a specific behavior.',
            explanationHe:
              'תרחיש בדיקה מתעד את השלבים המדויקים, נתוני הקלט והתוצאה הצפויה לאימות התנהגות ספציפית.',
          },
          {
            id: 'wq7',
            text: 'What is exploratory testing?',
            textHe: 'מהי בדיקה אקספלורטיבית?',
            options: [
              'Running automated scripts',
              'Testing without a predefined test plan, relying on tester intuition',
              'Testing only edge cases',
              'Performance testing of APIs',
            ],
            optionsHe: [
              'הרצת סקריפטים אוטומטיים',
              'בדיקה ללא תוכנית בדיקה מוגדרת מראש, תוך הסתמכות על אינטואיציית הבודק',
              'בדיקת מקרי קצה בלבד',
              'בדיקות ביצועים של APIs',
            ],
            correct: 1,
            explanation:
              'Exploratory testing is simultaneous learning, test design, and execution — ideal for UX and discovering unexpected bugs.',
            explanationHe:
              'בדיקה אקספלורטיבית היא למידה, עיצוב בדיקות וביצוע בו-זמנית — אידיאלית ל-UX וגילוי באגים בלתי צפויים.',
          },
          {
            id: 'wq8',
            text: 'A smoke test is:',
            textHe: 'בדיקת עשן היא:',
            options: [
              'A detailed test of all features',
              'A quick sanity check to confirm basic functionality works before deeper testing',
              'A security vulnerability scan',
              'A load test simulating many users',
            ],
            optionsHe: [
              'בדיקה מפורטת של כל התכונות',
              'בדיקת שפיות מהירה לאישור שהפונקציונליות הבסיסית עובדת לפני בדיקה מעמיקה',
              'סריקת פגיעויות אבטחה',
              'בדיקת עומסים המדמה משתמשים רבים',
            ],
            correct: 1,
            explanation:
              'Smoke tests quickly verify that the most critical paths work — if smoke tests fail, deeper testing is pointless.',
            explanationHe:
              'בדיקות עשן מאמתות במהירות שהנתיבים הקריטיים ביותר עובדים — אם בדיקות עשן נכשלות, בדיקה מעמיקה חסרת טעם.',
          },
          {
            id: 'wq9',
            text: 'What is the purpose of a test plan?',
            textHe: 'מה מטרת תוכנית הבדיקה?',
            options: [
              'To write automated scripts',
              'To document the scope, approach, resources, and schedule for testing activities',
              'To report bugs to developers',
              'To configure CI/CD pipelines',
            ],
            optionsHe: [
              'לכתוב סקריפטים אוטומטיים',
              'לתעד את ההיקף, הגישה, המשאבים והלוח הזמנים לפעילויות הבדיקה',
              'לדווח על באגים למפתחים',
              'להגדיר pipelines CI/CD',
            ],
            correct: 1,
            explanation:
              'A test plan is the master document that describes what will be tested, how, by whom, and when.',
            explanationHe: 'תוכנית בדיקה היא המסמך הראשי המתאר מה יבדק, איך, על ידי מי ומתי.',
          },
          {
            id: 'wq10',
            text: "Which type of testing verifies the system meets business requirements from the user's perspective?",
            textHe: 'איזה סוג בדיקה מאמת שהמערכת עומדת בדרישות העסקיות מנקודת המבט של המשתמש?',
            options: [
              'Unit testing',
              'Integration testing',
              'User Acceptance Testing (UAT)',
              'Performance testing',
            ],
            optionsHe: [
              'בדיקות יחידה',
              'בדיקות אינטגרציה',
              'בדיקות קבלת משתמש (UAT)',
              'בדיקות ביצועים',
            ],
            correct: 2,
            explanation:
              'UAT is performed by end users or clients to verify the system meets their requirements before go-live.',
            explanationHe:
              'UAT מבוצעת על ידי משתמשי קצה או לקוחות לאימות שהמערכת עומדת בדרישותיהם לפני עלייה לאוויר.',
          },
        ],
      },
    ],
  },
  {
    id: 'automation',
    title: 'Automation Testing',
    titleHe: 'בדיקות אוטומציה',
    icon: '🤖',
    sections: [
      {
        id: 'when-to-automate',
        type: 'lesson',
        title: 'When to Automate — and When Not To',
        titleHe: 'מתי לאוטמט — ומתי לא',
        level: 'Beginner',
        minutes: 12,
        summary:
          'Learn the ROI logic behind test automation decisions using a practical decision matrix.',
        summaryHe: 'למד את לוגיקת ה-ROI מאחורי החלטות אוטומציית בדיקות באמצעות מטריצת החלטה מעשית.',
        body: 'Think about a dishwasher. If you eat alone and use one plate a day, hand-washing makes sense. But if you run a restaurant serving 200 meals a day, the dishwasher pays for itself in the first week. Test automation works the same way — the value comes from repetition.\n\nThe golden rule: automate a test if it will run many times. Regression tests run on every code push, sometimes dozens of times a day — automating them is an obvious win. Smoke tests run before every deployment. Data-driven tests (same logic, many data combinations) are perfect for automation. Multi-browser tests that would take a human hours to run manually are another clear candidate.\n\nOn the flip side, some tests should stay manual. If a test only runs once for a specific investigation, the time to write the automation exceeds the time saved. Exploratory testing relies on human intuition — a script cannot "notice" that something feels wrong. Highly unstable UIs that redesign every sprint create brittle tests that cost more to maintain than they save.\n\nA quick ROI formula: if a manual test takes 10 minutes and runs 3 times a day, it costs 30 minutes daily. If writing the automation takes 2 hours, it pays back in 4 days. After that, every run is free. But if writing it takes 20 hours for a test that runs once a month, you need 40 months to break even — don\'t automate it.',
        bodyHe:
          'חשוב על מדיח כלים. אם אתה אוכל לבד ומשתמש בצלחת אחת ביום, שטיפת ידיים הגיונית. אבל אם אתה מנהל מסעדה שמגישה 200 ארוחות ביום, המדיח מחזיר את עצמו בשבוע הראשון. אוטומציית בדיקות פועלת באותו אופן — הערך מגיע מהחזרתיות.\n\nהכלל הזהוב: אוטמט בדיקה אם היא תרוץ פעמים רבות. בדיקות רגרסיה רצות על כל push קוד, לפעמים עשרות פעמים ביום — אוטומציה שלהן היא ניצחון ברור. בדיקות עשן רצות לפני כל deployment. בדיקות מונעות-נתונים (אותה לוגיקה, שילובי נתונים רבים) מושלמות לאוטומציה. בדיקות רב-דפדפן שיקח לאדם שעות לבצע ידנית הן מועמד ברור נוסף.\n\nמצד שני, חלק מהבדיקות צריכות להישאר ידניות. אם בדיקה רצה רק פעם אחת לחקירה ספציפית, הזמן לכתוב האוטומציה עולה על הזמן שנחסך. בדיקות אקספלורטיביות מסתמכות על אינטואיציה אנושית — סקריפט לא יכול "להבחין" שמשהו מרגיש לא בסדר. UI לא יציב מאוד שמשתנה כל ספרינט יוצר בדיקות שבריריות שעולות לתחזוקה יותר ממה שהן חוסכות.\n\nנוסחת ROI מהירה: אם בדיקה ידנית לוקחת 10 דקות ורצה 3 פעמים ביום, היא עולה 30 דקות יומי. אם כתיבת האוטומציה לוקחת שעתיים, היא מחזירה את עצמה תוך 4 ימים. לאחר מכן, כל ריצה היא חינמית. אבל אם כתיבתה לוקחת 20 שעות עבור בדיקה שרצה פעם בחודש, תצטרך 40 חודשים לנקודת איזון — אל תאוטמט אותה.',
        concepts: [
          'Automate: regression, smoke, data-driven, multi-browser tests',
          "Don't automate: one-time, exploratory, or frequently-redesigned UI tests",
          'ROI formula: (manual time × frequency) vs. (automation build + maintenance time)',
          'Brittle tests that break on CSS changes cost more than they save',
          'A flaky test (sometimes passes, sometimes fails) must be fixed or deleted',
          'Automation frees humans for exploratory and judgment-based testing',
        ],
        conceptsHe: [
          'אוטמט: בדיקות רגרסיה, עשן, מונעות-נתונים, רב-דפדפן',
          'אל תאוטמט: חד-פעמיות, אקספלורטיביות, או UI שמשתנה תכופות',
          'נוסחת ROI: (זמן ידני × תדירות) מול (זמן בניית אוטומציה + תחזוקה)',
          'בדיקות שבריריות שנשברות על שינויי CSS עולות יותר ממה שהן חוסכות',
          'בדיקה נדנדתית (לפעמים עוברת, לפעמים נכשלת) חייבת לתוקן או למחוק',
          'אוטומציה משחררת בני אדם לבדיקות אקספלורטיביות ומבוססות שיפוט',
        ],
        snippets: [
          {
            label: 'Automation decision checklist',
            labelHe: 'רשימת תיוג להחלטת אוטומציה',
            language: 'markdown',
            code: `✅ Automate if:
- Test runs on every PR / daily
- Same steps, different data (data-driven)
- Multi-browser / multi-device coverage needed
- Test takes > 5 min manually and runs often

❌ Don't automate if:
- Test runs once for a specific investigation
- UI redesign happens every sprint
- Test requires human judgment (visual design, UX feel)
- Setup cost > 10× the time saved`,
          },
        ],
      },
      {
        id: 'setup-playwright',
        type: 'lesson',
        title: 'Setting Up Playwright',
        titleHe: 'הגדרת Playwright',
        level: 'Beginner',
        minutes: 10,
        summary:
          'Install Playwright, understand the project structure, and run your first test from the command line.',
        summaryHe:
          'התקן את Playwright, הבן את מבנה הפרויקט, והרץ את הבדיקה הראשונה שלך משורת הפקודה.',
        body: "Playwright is Microsoft's open-source E2E testing framework. It can automate Chromium (Chrome/Edge), Firefox, and WebKit (Safari) all with one API, one test codebase, and one report. This makes it the strongest choice for cross-browser testing today.\n\nSetting up Playwright takes less than 5 minutes. Run `npm init playwright@latest` in your project folder. The wizard asks whether you want TypeScript or JavaScript (choose TypeScript — it catches typos before you run), which browsers to install, and whether to add a GitHub Actions workflow. After setup you get a `tests/` folder with a sample test and a `playwright.config.ts` configuration file.\n\nThe config file is where you define: which browsers to test on, the base URL of your app, screenshot and video settings, and retry logic. The `baseURL` setting is especially useful — once set, you can write `page.goto('/login')` instead of the full URL everywhere.\n\nRunning tests: `npx playwright test` runs all tests headless. `npx playwright test --ui` opens the beautiful interactive UI mode where you can watch tests run step by step, inspect locators, and time-travel through traces. `npx playwright test --headed` runs with the visible browser so you can see what is happening. For debugging a single test, use `npx playwright test mytest.spec.ts --debug`.",
        bodyHe:
          "Playwright הוא מסגרת בדיקות E2E של Microsoft בקוד פתוח. הוא יכול לאוטמט Chromium (Chrome/Edge), Firefox ו-WebKit (Safari) כולם עם API אחד, בסיס קוד בדיקות אחד ודוח אחד. זה הופך אותו לבחירה החזקה ביותר לבדיקות רב-דפדפן כיום.\n\nהגדרת Playwright לוקחת פחות מ-5 דקות. הרץ `npm init playwright@latest` בתיקיית הפרויקט שלך. האשף שואל אם ברצונך TypeScript או JavaScript (בחר TypeScript — הוא תופס שגיאות הקלדה לפני שאתה מריץ), אילו דפדפנים להתקין, ואם להוסיף workflow של GitHub Actions. לאחר ההגדרה תקבל תיקיית `tests/` עם בדיקת דוגמה וקובץ הגדרות `playwright.config.ts`.\n\nקובץ ה-config הוא המקום שבו מגדירים: על אילו דפדפנים לבדוק, ה-URL הבסיסי של האפליקציה שלך, הגדרות צילום מסך ווידאו, ולוגיקת ניסיון חוזר. הגדרת `baseURL` שימושית במיוחד — לאחר הגדרתה תוכל לכתוב `page.goto('/login')` במקום ה-URL המלא בכל מקום.\n\nהרצת בדיקות: `npx playwright test` מריץ את כל הבדיקות ב-headless. `npx playwright test --ui` פותח את מצב ה-UI האינטראקטיבי היפה שבו תוכל לצפות בבדיקות שרצות צעד אחרי צעד, לבדוק locators ולנסוע בזמן דרך עקבות. `npx playwright test --headed` מריץ עם הדפדפן הגלוי כדי שתוכל לראות מה קורה.",
        concepts: [
          'Playwright supports Chromium, Firefox, and WebKit with one codebase',
          '`npm init playwright@latest` sets up the full project in under 5 minutes',
          'playwright.config.ts controls browsers, baseURL, retries, and timeouts',
          '`npx playwright test` = headless (fast); `--ui` = interactive mode; `--headed` = visible browser',
          'Tests live in the `tests/` folder with `.spec.ts` extension',
          'The trace viewer records every action — invaluable for debugging CI failures',
          'Playwright auto-waits for elements — no more manual sleep() calls',
        ],
        conceptsHe: [
          'Playwright תומך ב-Chromium, Firefox ו-WebKit עם בסיס קוד אחד',
          '`npm init playwright@latest` מגדיר את הפרויקט המלא תוך פחות מ-5 דקות',
          'playwright.config.ts שולט בדפדפנים, baseURL, ניסיונות חוזרים ו-timeouts',
          '`npx playwright test` = headless (מהיר); `--ui` = מצב אינטראקטיבי; `--headed` = דפדפן גלוי',
          'בדיקות נמצאות בתיקיית `tests/` עם סיומת `.spec.ts`',
          'מציג העקבות מתעד כל פעולה — שימושי מאוד לניפוי שגיאות ב-CI',
          'Playwright ממתין אוטומטית לאלמנטים — לא עוד קריאות sleep() ידניות',
        ],
        snippets: [
          {
            label: 'Install and run Playwright',
            labelHe: 'התקנה והרצת Playwright',
            language: 'bash',
            code: `# Install
npm init playwright@latest

# Run all tests (headless)
npx playwright test

# Open interactive UI mode
npx playwright test --ui

# Run with visible browser
npx playwright test --headed

# Debug a specific test
npx playwright test login.spec.ts --debug`,
          },
          {
            label: 'playwright.config.ts example',
            labelHe: 'דוגמת playwright.config.ts',
            language: 'typescript',
            code: `import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  ],
})`,
          },
        ],
      },
      {
        id: 'first-test',
        type: 'lesson',
        title: 'Writing Your First Test',
        titleHe: 'כתיבת הבדיקה הראשונה שלך',
        level: 'Beginner',
        minutes: 10,
        summary:
          'Understand the anatomy of a Playwright test and write a complete working test from scratch.',
        summaryHe: 'הבן את מבנה בדיקת Playwright וכתוב בדיקה עובדת מלאה מאפס.',
        body: 'Writing a test is like writing a recipe. A recipe has a title ("Chocolate Cake"), ingredients (inputs), steps (actions), and an expected result ("should rise and be moist"). A Playwright test has the same structure: a description, setup, actions, and assertions.\n\nEvery Playwright test starts with `test(\'description\', async ({ page }) => { ... })`. The `page` object is your browser tab — it has methods for navigating, clicking, typing, and reading content. `expect()` is how you make assertions — you tell Playwright what you expect to be true, and it tells you if you\'re wrong.\n\nWhen a test fails, Playwright captures a screenshot, a video of the run, and a trace file. The trace viewer (`npx playwright show-report`) lets you click through every action like a time machine — you see exactly what the browser was showing when the failure happened. This makes debugging much faster than reading logs.\n\nA good test follows the AAA pattern: Arrange (set up state), Act (perform the action you are testing), Assert (verify the result). Keep each test focused on one thing. A test called "user can log in" should only test login — not also check the dashboard contents. This makes failures easy to diagnose.',
        bodyHe:
          'כתיבת בדיקה היא כמו כתיבת מתכון. למתכון יש כותרת ("עוגת שוקולד"), מרכיבים (קלטים), שלבים (פעולות) ותוצאה צפויה ("צריכה לתפוח ולהיות לחה"). לבדיקת Playwright אותו מבנה: תיאור, הגדרה, פעולות ואסרציות.\n\nכל בדיקת Playwright מתחילה עם `test(\'תיאור\', async ({ page }) => { ... })`. האובייקט `page` הוא לשונית הדפדפן שלך — יש לו מתודות לניווט, לחיצה, הקלדה וקריאת תוכן. `expect()` הוא האופן שבו מבצעים אסרציות — אתה מספר ל-Playwright מה אתה מצפה שיהיה נכון, והוא מספר לך אם אתה טועה.\n\nכאשר בדיקה נכשלת, Playwright לוכד צילום מסך, וידאו של הריצה וקובץ עקבות. מציג העקבות (`npx playwright show-report`) מאפשר לך לעבור דרך כל פעולה כמו מכונת זמן — אתה רואה בדיוק מה הדפדפן הציג כאשר הכשל התרחש. זה מאיץ את ניפוי השגיאות הרבה יותר מקריאת לוגים.\n\nבדיקה טובה עוקבת אחר תבנית AAA: Arrange (הגדר מצב), Act (בצע את הפעולה שאתה בודק), Assert (אמת את התוצאה). שמור כל בדיקה ממוקדת בדבר אחד. בדיקה שנקראת "משתמש יכול להתחבר" צריכה לבדוק רק כניסה — לא גם לבדוק את תוכן לוח הבקרה.',
        concepts: [
          'test(description, async ({ page }) => {}) is the basic test structure',
          'page.goto(url), page.click(locator), page.fill(locator, value) are the core actions',
          'expect(page).toHaveTitle(), expect(locator).toBeVisible() are common assertions',
          'AAA pattern: Arrange → Act → Assert keeps tests readable and focused',
          'On failure: Playwright captures screenshot + video + trace automatically',
          'npx playwright show-report opens the HTML report with trace viewer',
          'Keep each test focused on one scenario — easier to diagnose failures',
        ],
        conceptsHe: [
          'test(תיאור, async ({ page }) => {}) הוא מבנה הבדיקה הבסיסי',
          'page.goto(url), page.click(locator), page.fill(locator, value) הן הפעולות המרכזיות',
          'expect(page).toHaveTitle(), expect(locator).toBeVisible() הן אסרציות נפוצות',
          'תבנית AAA: Arrange → Act → Assert שומרת בדיקות קריאות וממוקדות',
          'בכשל: Playwright לוכד צילום מסך + וידאו + עקבות אוטומטית',
          'npx playwright show-report פותח את דוח ה-HTML עם מציג העקבות',
          'שמור כל בדיקה ממוקדת בתרחיש אחד — קל יותר לאבחן כשלים',
        ],
        snippets: [
          {
            label: 'Complete first Playwright test',
            labelHe: 'בדיקת Playwright ראשונה מלאה',
            language: 'typescript',
            code: `import { test, expect } from '@playwright/test'

// Arrange: navigate to the page
test('homepage has correct title', async ({ page }) => {
  await page.goto('/')

  // Assert
  await expect(page).toHaveTitle(/My App/)
})

test('user can search for products', async ({ page }) => {
  // Arrange
  await page.goto('/shop')

  // Act
  await page.fill('[placeholder="Search..."]', 'shoes')
  await page.click('button[type="submit"]')

  // Assert
  await expect(page.locator('.results-count')).toContainText('results')
})`,
          },
        ],
      },
      {
        id: 'locators',
        type: 'lesson',
        title: 'Locator Strategies',
        titleHe: 'אסטרטגיות Locator',
        level: 'Intermediate',
        minutes: 15,
        summary:
          'Learn the 5 locator types in Playwright and choose the most resilient one for each element.',
        summaryHe: 'למד את 5 סוגי ה-locator ב-Playwright ובחר את העמיד ביותר לכל אלמנט.',
        body: "A locator is how your test finds an element on the page. Think of it like a street address — if the street name changes, the address breaks. CSS class selectors like `.btn-primary` break when a designer renames the class. XPath like `//div[3]/button` breaks when someone adds a new section. Good locators survive UI changes because they query meaning, not implementation.\n\nPlaywright's priority order for locators: first try `getByRole` — it queries the accessibility tree and survives CSS and HTML restructuring. If the element has a visible label, use `getByLabel`. If there is stable text, use `getByText`. For elements you control in the codebase, add a `data-testid` attribute and use `getByTestId` — this is the most explicit and maintenance-friendly. Only fall back to CSS `locator()` when nothing else works, and never use XPath by position.\n\nThe `data-testid` approach is powerful because it creates a contract between developers and testers. Developers add `data-testid=\"submit-button\"` and promise not to rename it. Testers use `page.getByTestId('submit-button')` knowing it will be stable. This separation of concerns makes your test suite resilient to redesigns.\n\nChaining locators lets you scope a search: `page.locator('.modal').getByRole('button', { name: 'Save' })` finds the Save button inside the modal specifically. This avoids ambiguity when the same button text appears in multiple places on the page.",
        bodyHe:
          'Locator הוא האופן שבו הבדיקה שלך מוצאת אלמנט בדף. חשוב על זה כמו כתובת רחוב — אם שם הרחוב משתנה, הכתובת נשברת. בחירות CSS class כמו `.btn-primary` נשברות כאשר מעצב משנה את שם ה-class. XPath כמו `//div[3]/button` נשבר כאשר מישהו מוסיף קטע חדש. Locators טובים שורדים שינויי UI כי הם שואלים משמעות, לא מימוש.\n\nסדר העדיפויות של Playwright ל-locators: נסה קודם `getByRole` — הוא שואל את עץ הנגישות ושורד שינויי CSS ו-HTML. אם לאלמנט יש תווית גלויה, השתמש ב-`getByLabel`. אם יש טקסט יציב, השתמש ב-`getByText`. עבור אלמנטים שאתה שולט בהם בקוד, הוסף תכונת `data-testid` והשתמש ב-`getByTestId` — זה המפורש והידידותי לתחזוקה ביותר. חזור ל-CSS `locator()` רק כאשר שום דבר אחר לא עובד, ואל תשתמש לעולם ב-XPath לפי מיקום.\n\nגישת `data-testid` חזקה כי היא יוצרת חוזה בין מפתחים ובודקים. מפתחים מוסיפים `data-testid="submit-button"` ומבטיחים לא לשנות את שמו. בודקים משתמשים ב-`page.getByTestId(\'submit-button\')` בידיעה שהוא יהיה יציב.',
        concepts: [
          'getByRole: queries accessibility tree — most resilient to UI changes',
          'getByLabel: finds form fields by their visible label text',
          'getByText: finds elements by visible text content',
          'getByTestId: uses data-testid attribute — explicit developer-tester contract',
          'locator(css): CSS selector fallback — avoid position-based XPath',
          'Priority: role > label > testid > text > css > xpath',
          "Chaining: page.locator('.modal').getByRole('button') scopes the search",
        ],
        conceptsHe: [
          'getByRole: שואל עץ נגישות — עמיד ביותר לשינויי UI',
          'getByLabel: מוצא שדות טופס לפי טקסט התווית הגלויה שלהם',
          'getByText: מוצא אלמנטים לפי תוכן טקסט גלוי',
          'getByTestId: משתמש בתכונת data-testid — חוזה מפורש בין מפתח לבודק',
          'locator(css): חלופת בחירת CSS — הימנע מ-XPath מבוסס מיקום',
          'עדיפות: role > label > testid > text > css > xpath',
          "שרשור: page.locator('.modal').getByRole('button') מצמצם את החיפוש",
        ],
        snippets: [
          {
            label: 'All 5 locator types with examples',
            labelHe: '5 סוגי locator עם דוגמאות',
            language: 'typescript',
            code: `import { test, expect } from '@playwright/test'

test('locator examples', async ({ page }) => {
  await page.goto('/login')

  // 1. getByRole — best for buttons, links, headings
  await page.getByRole('button', { name: 'Sign in' }).click()

  // 2. getByLabel — best for form inputs
  await page.getByLabel('Email address').fill('user@test.com')

  // 3. getByText — best for links and static text
  await page.getByText('Forgot password?').click()

  // 4. getByTestId — explicit contract (add data-testid in HTML)
  await page.getByTestId('submit-btn').click()

  // 5. locator(css) — fallback only
  await page.locator('.error-message').isVisible()

  // Chaining — scoped search
  const modal = page.locator('[role="dialog"]')
  await modal.getByRole('button', { name: 'Confirm' }).click()
})`,
          },
        ],
      },
      {
        id: 'pom',
        type: 'lesson',
        title: 'Page Object Model (POM)',
        titleHe: 'מודל אובייקט עמוד (POM)',
        level: 'Intermediate',
        minutes: 15,
        summary:
          'Eliminate duplicated locators by wrapping each page in a class — the standard for maintainable test suites.',
        summaryHe:
          'בטל locators כפולים על ידי עטיפת כל דף במחלקה — הסטנדרט לחבילות בדיקות שניתנות לתחזוקה.',
        body: "Imagine your TV remote. Every button has one job and lives in one place. You do not need to know how the remote is built — you just press \"Volume Up\" and it works. If Samsung redesigns the remote, only the remote changes; you still press the same button. The Page Object Model gives your test suite the same property.\n\nWithout POM, every test file contains its own locators: `page.fill('[name=\"email\"]', ...)` appears in 20 test files. When the email field's name attribute changes, you must update 20 files. With POM, a `LoginPage` class holds all the locators and actions for the login page. Tests call `loginPage.login(email, password)` and never care about the locator internals. When the UI changes, you update one class.\n\nA POM class has a constructor that takes the `page` object, properties for each locator, and methods for each user action. The methods return `this` or another page object, enabling fluent chaining: `await loginPage.login('admin', 'pass').then(() => dashboardPage.verify())`.\n\nWhen should you create a new page object? One per distinct page or major component (modal, header, sidebar). Keep each page object focused — a `LoginPage` should not contain dashboard assertions. This separation makes your test code read like a user story: \"User goes to login, enters credentials, clicks submit, expects to see dashboard.\" That clarity is the true value of POM.",
        bodyHe:
          'דמיין את שלט הטלוויזיה שלך. לכל כפתור יש תפקיד אחד ומקום אחד. אינך צריך לדעת איך השלט בנוי — פשוט לוחץ "הגבר קול" וזה עובד. אם סמסונג מעצבת מחדש את השלט, רק השלט משתנה; אתה עדיין לוחץ על אותו כפתור. מודל אובייקט העמוד נותן לחבילת הבדיקות שלך את אותה תכונה.\n\nבלי POM, כל קובץ בדיקה מכיל את ה-locators שלו: `page.fill(\'[name="email"]\', ...)` מופיע ב-20 קבצי בדיקה. כאשר תכונת השם של שדה האימייל משתנה, עליך לעדכן 20 קבצים. עם POM, מחלקת `LoginPage` מחזיקה את כל ה-locators והפעולות עבור עמוד הכניסה. בדיקות קוראות ל-`loginPage.login(email, password)` ולא אכפת להן מה-locators הפנימיים. כאשר ה-UI משתנה, מעדכנים מחלקה אחת.\n\nמחלקת POM יש לה constructor שמקבל את האובייקט `page`, מאפיינים לכל locator ומתודות לכל פעולת משתמש. כאשר תיצור אובייקט עמוד חדש? אחד לכל עמוד נפרד או רכיב עיקרי (modal, header, sidebar). שמור כל אובייקט עמוד ממוקד — `LoginPage` לא צריך להכיל אסרציות של לוח בקרה.',
        concepts: [
          'POM wraps each page in a class with its locators and action methods',
          'Tests call page methods (loginPage.login()) not raw locators',
          'When UI changes, update one class — not every test file',
          'POM constructor takes `page: Page` from Playwright',
          'Methods return void or another Page Object for chaining',
          'One page object per distinct page or major component (modal, nav)',
          'Test code reads like a user story — improves readability and collaboration',
        ],
        conceptsHe: [
          'POM עוטף כל עמוד במחלקה עם ה-locators ומתודות הפעולה שלו',
          'בדיקות קוראות למתודות עמוד (loginPage.login()) לא locators גולמיים',
          'כאשר ה-UI משתנה, מעדכנים מחלקה אחת — לא כל קובץ בדיקה',
          'constructor של POM מקבל `page: Page` מ-Playwright',
          'מתודות מחזירות void או אובייקט עמוד אחר לשרשור',
          'אובייקט עמוד אחד לכל עמוד נפרד או רכיב עיקרי (modal, nav)',
          'קוד הבדיקה נקרא כמו סיפור משתמש — משפר קריאות ושיתוף פעולה',
        ],
        snippets: [
          {
            label: 'LoginPage POM class',
            labelHe: 'מחלקת POM של LoginPage',
            language: 'typescript',
            code: `// pages/LoginPage.ts
import { Page, expect } from '@playwright/test'

export class LoginPage {
  constructor(private page: Page) {}

  // Locators as getters
  get emailInput() { return this.page.getByLabel('Email') }
  get passwordInput() { return this.page.getByLabel('Password') }
  get submitButton() { return this.page.getByRole('button', { name: 'Sign in' }) }
  get errorMessage() { return this.page.getByTestId('error-msg') }

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
            label: 'Test using POM',
            labelHe: 'בדיקה עם POM',
            language: 'typescript',
            code: `// tests/login.spec.ts
import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'

test('successful login', async ({ page }) => {
  const login = new LoginPage(page)
  await login.goto()
  await login.login('user@test.com', 'correctpass')
  await expect(page).toHaveURL('/dashboard')
})

test('invalid credentials shows error', async ({ page }) => {
  const login = new LoginPage(page)
  await login.goto()
  await login.login('user@test.com', 'wrongpass')
  await expect(login.errorMessage).toContainText('Invalid credentials')
})`,
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
            id: 'aq1',
            text: 'Which test type is MOST suitable for automation?',
            textHe: 'איזה סוג בדיקה מתאים ביותר לאוטומציה?',
            options: [
              'Exploratory testing',
              'Regression testing',
              'Ad-hoc testing',
              'Usability testing',
            ],
            optionsHe: ['בדיקה אקספלורטיבית', 'בדיקת רגרסיה', 'בדיקה אד-הוק', 'בדיקת שימושיות'],
            correct: 1,
            explanation:
              'Regression tests run repeatedly on every code change — perfect for automation.',
            explanationHe: 'בדיקות רגרסיה רצות שוב ושוב על כל שינוי קוד — מושלמות לאוטומציה.',
          },
          {
            id: 'aq2',
            text: 'What is a brittle test?',
            textHe: 'מהי בדיקה שברירית?',
            options: [
              'A test that runs slowly',
              'A test that fails due to minor, unrelated UI changes',
              'A test with no assertions',
              'A test that only runs on one browser',
            ],
            optionsHe: [
              'בדיקה שרצה לאט',
              'בדיקה שנכשלת בגלל שינויים קטנים ולא קשורים ב-UI',
              'בדיקה ללא אסרציות',
              'בדיקה שרצה רק על דפדפן אחד',
            ],
            correct: 1,
            explanation:
              'Brittle tests break when CSS classes or element positions change, even if functionality is correct. Use semantic locators to avoid this.',
            explanationHe:
              'בדיקות שבריריות נשברות כשמחלקות CSS או מיקומי אלמנטים משתנים, גם אם הפונקציונליות נכונה. השתמש ב-locators סמנטיים למניעת זה.',
          },
          {
            id: 'aq3',
            text: 'What is the main advantage of Playwright over Selenium?',
            textHe: 'מה היתרון המרכזי של Playwright על פני Selenium?',
            options: [
              'Playwright supports more programming languages',
              'Playwright has auto-wait and native TypeScript support',
              'Playwright is older and more battle-tested',
              'Playwright only supports Chrome',
            ],
            optionsHe: [
              'Playwright תומך בשפות תכנות רבות יותר',
              'ל-Playwright יש המתנה אוטומטית ותמיכה ב-TypeScript מובנה',
              'Playwright ישן יותר ומוכח יותר בשדה',
              'Playwright תומך רק ב-Chrome',
            ],
            correct: 1,
            explanation:
              "Playwright's auto-wait eliminates manual sleep() calls and flakiness. It also has first-class TypeScript support and tests Chromium/Firefox/WebKit.",
            explanationHe:
              'ה-auto-wait של Playwright מבטל קריאות sleep() ידניות ונדנדתיות. יש לו גם תמיכה מעולה ב-TypeScript ובדיקת Chromium/Firefox/WebKit.',
          },
          {
            id: 'aq4',
            text: 'What is the Page Object Model (POM)?',
            textHe: 'מהו Page Object Model (POM)?',
            options: [
              'A database design pattern',
              'A pattern that wraps each page in a class with its locators and actions',
              'A way to mock API responses',
              'A CI/CD configuration pattern',
            ],
            optionsHe: [
              'תבנית עיצוב מסד נתונים',
              'תבנית שעוטפת כל דף במחלקה עם ה-locators והפעולות שלה',
              'דרך ל-mock תגובות API',
              'תבנית הגדרת CI/CD',
            ],
            correct: 1,
            explanation:
              'POM centralizes all page interactions in a class. When the UI changes, you update one class instead of every test.',
            explanationHe:
              'POM מרכז את כל אינטראקציות הדף במחלקה. כשה-UI משתנה, מעדכנים מחלקה אחת במקום כל בדיקה.',
          },
          {
            id: 'aq5',
            text: 'A flaky test should be:',
            textHe: 'בדיקה נדנדתית צריכה להיות:',
            options: [
              'Kept as-is because it sometimes passes',
              'Fixed immediately or deleted — never left in the suite',
              'Converted to a manual test',
              'Run only in development environments',
            ],
            optionsHe: [
              'נשמר כך — לפעמים הוא עובר',
              'מתוקן מיד או נמחק — לעולם לא נשאר בחבילה',
              'הופך לבדיקה ידנית',
              'מורץ רק בסביבות פיתוח',
            ],
            correct: 1,
            explanation:
              "Flaky tests erode trust in the entire test suite. If it can't be fixed, delete it.",
            explanationHe:
              'בדיקות נדנדתיות שוחקות את האמון בחבילת הבדיקות כולה. אם לא ניתן לתקן — מוחקים.',
          },
          {
            id: 'aq6',
            text: 'Which locator is MOST resilient to UI changes?',
            textHe: 'איזה locator הוא העמיד ביותר לשינויי UI?',
            options: [
              'CSS class selector (.btn-primary)',
              'XPath by position (//div[3]/button)',
              "getByRole('button', {name: 'Submit'})",
              "getElementById('submit-123')",
            ],
            optionsHe: [
              'בחירת CSS class (.btn-primary)',
              'XPath לפי מיקום (//div[3]/button)',
              "getByRole('button', {name: 'Submit'})",
              "getElementById('submit-123')",
            ],
            correct: 2,
            explanation:
              'Role-based locators query the accessibility tree — they survive CSS refactors and HTML restructuring.',
            explanationHe:
              'Locators מבוססי role שואלים את עץ הנגישות — הם שורדים refactors של CSS ושינויים ב-HTML.',
          },
          {
            id: 'aq7',
            text: 'When should you NOT automate a test?',
            textHe: 'מתי לא כדאי לאוטמט בדיקה?',
            options: [
              'When it runs every day',
              'When it tests the same functionality across many data combinations',
              'When the UI changes every sprint and the test breaks constantly',
              'When it takes 10 minutes manually',
            ],
            optionsHe: [
              'כשהוא רץ כל יום',
              'כשהוא בודק את אותה פונקציונליות על פני שילובי נתונים רבים',
              'כשה-UI משתנה כל ספרינט והבדיקה נשברת ללא הרף',
              'כשלוקח 10 דקות ידנית',
            ],
            correct: 2,
            explanation:
              "If the UI changes so frequently that maintaining the test costs more than it saves, don't automate it.",
            explanationHe:
              'אם ה-UI משתנה כל כך תכופות שתחזוקת הבדיקה עולה יותר ממה שהיא חוסכת, לא לאוטמט.',
          },
          {
            id: 'aq8',
            text: "What does 'headless' browser mean in testing?",
            textHe: "מה משמעות דפדפן 'headless' בבדיקות?",
            options: [
              'A browser without JavaScript support',
              'A browser that runs without a visible UI — faster for CI',
              'A browser that blocks all network requests',
              'A browser that only renders text',
            ],
            optionsHe: [
              'דפדפן ללא תמיכת JavaScript',
              'דפדפן שרץ ללא UI גלוי — מהיר יותר ל-CI',
              'דפדפן שחוסם את כל בקשות הרשת',
              'דפדפן שמרנדר טקסט בלבד',
            ],
            correct: 1,
            explanation:
              'Headless mode skips rendering the visible browser window, making tests faster — ideal for CI environments.',
            explanationHe:
              'מצב headless מדלג על רינדור חלון הדפדפן הגלוי, מה שמאיץ בדיקות — אידיאלי לסביבות CI.',
          },
          {
            id: 'aq9',
            text: 'What is a test fixture?',
            textHe: 'מהו test fixture?',
            options: [
              'A hardware component for testing',
              'A setup/teardown mechanism that provides consistent test context',
              'A mock API server',
              'A visual regression baseline',
            ],
            optionsHe: [
              'רכיב חומרה לבדיקות',
              'מנגנון setup/teardown שמספק הקשר בדיקה עקבי',
              'שרת API מדומה',
              'בסיס ביחס לרגרסיה ויזואלית',
            ],
            correct: 1,
            explanation:
              'Fixtures handle setup (creating test data, logging in) and teardown (cleanup) so each test starts in a known state.',
            explanationHe:
              'Fixtures מטפלים ב-setup (יצירת נתוני בדיקה, כניסה) וב-teardown (ניקוי) כך שכל בדיקה מתחילה במצב ידוע.',
          },
          {
            id: 'aq10',
            text: 'CI/CD stands for:',
            textHe: 'CI/CD הוא קיצור של:',
            options: [
              'Code Integration / Code Deployment',
              'Continuous Integration / Continuous Delivery',
              'Continuous Inspection / Continuous Design',
              'Code Intelligence / Code Delivery',
            ],
            optionsHe: [
              'אינטגרציית קוד / פריסת קוד',
              'אינטגרציה רציפה / מסירה רציפה',
              'בדיקה רציפה / עיצוב רציף',
              'בינה קוד / מסירת קוד',
            ],
            correct: 1,
            explanation:
              'CI = merging code frequently and running automated tests. CD = automatically deploying passing builds.',
            explanationHe:
              'CI = מיזוג קוד תכוף והרצת בדיקות אוטומטיות. CD = פריסה אוטומטית של builds שעברו בדיקות.',
          },
          {
            id: 'aq11',
            text: 'What is test isolation?',
            textHe: 'מהו בידוד בדיקות?',
            options: [
              'Running tests in a separate building',
              "Each test is independent and doesn't depend on other tests' state",
              'Tests that only run in isolated networks',
              'Testing in production with no users',
            ],
            optionsHe: [
              'הרצת בדיקות בבניין נפרד',
              'כל בדיקה עצמאית ולא תלויה במצב בדיקות אחרות',
              'בדיקות שרצות רק ברשתות מבודדות',
              'בדיקה בייצור ללא משתמשים',
            ],
            correct: 1,
            explanation:
              'Isolated tests can run in any order and in parallel without interfering with each other.',
            explanationHe: 'בדיקות מבודדות יכולות לרוץ בכל סדר ובמקביל מבלי להפריע זו לזו.',
          },
          {
            id: 'aq12',
            text: 'What is data-driven testing?',
            textHe: 'מהי בדיקה מונעת-נתונים?',
            options: [
              'Testing databases only',
              'Running the same test logic with multiple sets of input data',
              'Testing with production data only',
              'Generating test code from requirements',
            ],
            optionsHe: [
              'בדיקת מסדי נתונים בלבד',
              'הרצת אותה לוגיקת בדיקה עם מספר ערכות נתוני קלט',
              'בדיקה עם נתוני ייצור בלבד',
              'יצירת קוד בדיקה מדרישות',
            ],
            correct: 1,
            explanation:
              'Data-driven testing separates test logic from test data, allowing many scenarios with one test function.',
            explanationHe:
              'בדיקה מונעת-נתונים מפרידה לוגיקת בדיקה מנתוני בדיקה, מאפשרת תרחישים רבים עם פונקציית בדיקה אחת.',
          },
          {
            id: 'aq13',
            text: 'What should you do when a test fails in CI?',
            textHe: 'מה עליך לעשות כשבדיקה נכשלת ב-CI?',
            options: [
              'Ignore it and merge anyway',
              'Delete the test',
              'Investigate the failure before merging',
              'Disable the test temporarily and merge',
            ],
            optionsHe: [
              'התעלם ומזג בכל מקרה',
              'מחק את הבדיקה',
              'חקור את הכשל לפני המיזוג',
              'השבת זמנית את הבדיקה ומזג',
            ],
            correct: 2,
            explanation:
              'A failing test in CI is a signal — investigate it. Merging over failures defeats the purpose of CI.',
            explanationHe:
              'בדיקה נכשלת ב-CI היא אות — חוקרים אותה. מיזוג על כשלים מסכל את מטרת ה-CI.',
          },
          {
            id: 'aq14',
            text: 'Test parallelization means:',
            textHe: 'מקביול בדיקות משמעותו:',
            options: [
              'Running tests one after another',
              'Running multiple tests simultaneously to reduce total execution time',
              'Writing tests in parallel with development',
              'Sharing test results across teams',
            ],
            optionsHe: [
              'הרצת בדיקות אחת אחרי השנייה',
              'הרצת בדיקות מרובות בו-זמנית להפחתת זמן הביצוע הכולל',
              'כתיבת בדיקות במקביל לפיתוח',
              'שיתוף תוצאות בדיקות בין צוותים',
            ],
            correct: 1,
            explanation:
              'Parallel execution splits the test suite across multiple workers/machines, reducing wall-clock time significantly.',
            explanationHe:
              'ביצוע מקבילי מפצל את חבילת הבדיקות בין workers/מכונות מרובות, מפחית משמעותית את זמן ריצת השעון.',
          },
          {
            id: 'aq15',
            text: 'What is the ROI consideration for test automation?',
            textHe: 'מהו שיקול ה-ROI לאוטומציית בדיקות?',
            options: [
              'Automation always has positive ROI',
              'ROI depends on test frequency — high-frequency tests justify automation investment',
              'Automation is only worth it for large companies',
              'Manual testing always has better ROI',
            ],
            optionsHe: [
              'לאוטומציה תמיד יש ROI חיובי',
              'ROI תלוי בתדירות בדיקות — בדיקות בתדירות גבוהה מצדיקות השקעה באוטומציה',
              'אוטומציה כדאית רק לחברות גדולות',
              'לבדיקה ידנית תמיד יש ROI טוב יותר',
            ],
            correct: 1,
            explanation:
              'Automation investment pays off when a test runs frequently enough that the time saved exceeds the time to build and maintain it.',
            explanationHe:
              'השקעה באוטומציה משתלמת כשבדיקה רצה מספיק פעמים שהזמן שנחסך עולה על הזמן לבנות ולתחזק אותה.',
          },
          {
            id: 'aq16',
            text: 'Which statement about exploratory testing is TRUE?',
            textHe: 'איזו אמירה לגבי בדיקה אקספלורטיבית נכונה?',
            options: [
              'It can be fully automated',
              'It relies on tester intuition and cannot follow a strict script',
              'It is less valuable than automated testing',
              'It is only done by junior testers',
            ],
            optionsHe: [
              'ניתן לאוטמט אותה לחלוטין',
              'היא מסתמכת על אינטואיציית הבודק ולא יכולה לעקוב אחר סקריפט קפדני',
              'היא פחות בעלת ערך מבדיקות אוטומטיות',
              'היא מבוצעת רק על ידי בודקים זוטרים',
            ],
            correct: 1,
            explanation:
              'Exploratory testing uses human judgment to discover unexpected issues — it complements automation but cannot be replaced by it.',
            explanationHe:
              'בדיקה אקספלורטיבית משתמשת בשיפוט אנושי לגילוי בעיות בלתי צפויות — היא משלימה אוטומציה אך לא ניתן להחליפה.',
          },
        ],
      },
      {
        id: 'automation-practice',
        type: 'practice',
        title: 'Practice: Automation Planning',
        titleHe: 'תרגול: תכנון אוטומציה',
        practiceDesc:
          'Plan an automation strategy for a login feature. Decide which scenarios to automate, choose locators, and write one basic test.',
        practiceDescHe:
          'תכנן אסטרטגיית אוטומציה לתכונת כניסה. החלט אילו תרחישים לאוטמט, בחר locators, וכתוב בדיקה בסיסית אחת.',
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
    ],
  },
  {
    id: 'api',
    title: 'API Testing',
    titleHe: 'בדיקות API',
    icon: '🌐',
    sections: [
      {
        id: 'api-playwright',
        type: 'lesson',
        title: 'API Testing with Playwright',
        titleHe: 'בדיקות API עם Playwright',
        level: 'Intermediate',
        minutes: 15,
        summary:
          "Use Playwright's request fixture to test REST APIs without a browser — 10× faster than UI tests.",
        summaryHe:
          'השתמש ב-request fixture של Playwright לבדיקת REST APIs ללא דפדפן — מהיר פי 10 מבדיקות UI.',
        body: 'An API (Application Programming Interface) is the contract between a client and a server. When you click "Add to Cart" on a shopping website, your browser sends a POST request to an API endpoint. The API processes it, updates the database, and returns a response. Testing the API directly — without going through the browser — is faster, more reliable, and catches backend bugs before the UI is even built.\n\nREST APIs use HTTP verbs to express intent: GET retrieves data (like reading a file), POST creates new data (like submitting a form), PUT replaces an entire resource, PATCH updates specific fields, and DELETE removes a resource. HTTP status codes tell you the result: 2xx means success (200 OK, 201 Created, 204 No Content), 4xx means the client did something wrong (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found), and 5xx means the server crashed or errored.\n\nPlaywright\'s `request` fixture lets you make HTTP calls directly in your test without launching a browser. This makes API tests 10 to 100 times faster than UI tests. You get the full power of Playwright assertions on the response — status code, JSON body, headers — with the same familiar syntax. A good API test checks: correct status code, correct response body structure (schema), correct field values, and meaningful error messages when given bad input.\n\nChaining requests is a key pattern: POST to create a resource, capture the returned ID, GET that ID to verify it exists, then DELETE it and verify GET returns 404. This sequence validates the full resource lifecycle in a few seconds.',
        bodyHe:
          'API (ממשק תכנות יישומים) הוא החוזה בין לקוח לשרת. כאשר אתה לוחץ "הוסף לסל" באתר קניות, הדפדפן שלך שולח בקשת POST לנקודת קצה של API. ה-API מעבד אותה, מעדכן את מסד הנתונים ומחזיר תגובה. בדיקת ה-API ישירות — ללא מעבר דרך הדפדפן — מהירה יותר, אמינה יותר ותופסת באגי backend לפני שה-UI בנוי בכלל.\n\nREST APIs משתמשים בפעלי HTTP לביטוי כוונה: GET מאחזר נתונים (כמו קריאת קובץ), POST יוצר נתונים חדשים (כמו שליחת טופס), PUT מחליף משאב שלם, PATCH מעדכן שדות ספציפיים ו-DELETE מסיר משאב. קודי סטטוס HTTP מספרים לך את התוצאה: 2xx אומר הצלחה (200 OK, 201 Created, 204 No Content), 4xx אומר שהלקוח עשה משהו לא נכון (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found), ו-5xx אומר שהשרת קרס או שגה.\n\nה-`request` fixture של Playwright מאפשר לבצע קריאות HTTP ישירות בבדיקה שלך מבלי להפעיל דפדפן. זה הופך בדיקות API למהירות פי 10 עד 100 מבדיקות UI. אתה מקבל את מלוא עוצמת אסרציות Playwright על התגובה — קוד סטטוס, גוף JSON, כותרות — עם אותה תחביר מוכר.\n\nשרשור בקשות הוא תבנית מפתח: POST ליצירת משאב, לכידת ה-ID שהוחזר, GET של אותו ID לאימות קיומו, ואז DELETE ואימות שGET מחזיר 404. רצף זה מאמת את מחזור החיים המלא של המשאב תוך כמה שניות.',
        concepts: [
          'API tests skip the browser — 10-100× faster than E2E UI tests',
          'HTTP verbs: GET (read), POST (create), PUT (replace), PATCH (update), DELETE (remove)',
          'Status 2xx = success; 4xx = client error; 5xx = server error',
          'Playwright `request` fixture makes HTTP calls without a browser window',
          'Test the API contract: schema, required fields, types — not just happy path',
          'Chain requests to test full resource lifecycle: create → read → delete → verify 404',
          'Authorization: most APIs require Bearer token in Authorization header',
        ],
        conceptsHe: [
          'בדיקות API מדלגות על הדפדפן — מהירות פי 10-100 מבדיקות E2E UI',
          'פעלי HTTP: GET (קרא), POST (צור), PUT (החלף), PATCH (עדכן), DELETE (מחק)',
          'סטטוס 2xx = הצלחה; 4xx = שגיאת לקוח; 5xx = שגיאת שרת',
          'ה-`request` fixture של Playwright מבצע קריאות HTTP ללא חלון דפדפן',
          'בדוק את חוזה ה-API: סכמה, שדות נדרשים, סוגים — לא רק המסלול המאושר',
          'שרשר בקשות לבדיקת מחזור חיים מלא: צור → קרא → מחק → אמת 404',
          'Authorization: רוב ה-APIs דורשים Bearer token בכותרת Authorization',
        ],
        snippets: [
          {
            label: 'Playwright API tests (GET, POST, DELETE)',
            labelHe: 'בדיקות API עם Playwright (GET, POST, DELETE)',
            language: 'typescript',
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

  // Cleanup: delete and verify gone
  const del = await request.delete(\`/api/users/\${user.id}\`, {
    headers: { Authorization: 'Bearer test-token' },
  })
  expect(del.status()).toBe(204)
})

test('401 without token', async ({ request }) => {
  const res = await request.get('/api/users/me')
  expect(res.status()).toBe(401)
})`,
          },
        ],
      },
      {
        id: 'api-postman',
        type: 'lesson',
        title: 'API Testing with Postman',
        titleHe: 'בדיקות API עם Postman',
        level: 'Beginner',
        minutes: 10,
        summary:
          "Explore APIs with Postman's GUI, write test scripts, and run them in CI with Newman.",
        summaryHe: 'חקור APIs עם ה-GUI של Postman, כתוב סקריפטי בדיקה, והרץ אותם ב-CI עם Newman.',
        body: 'Postman is the most popular GUI tool for working with APIs. Think of it like a universal remote control for APIs — you can send any HTTP request to any server, inspect the response, and save everything into organized Collections. It is the go-to tool for manual API exploration and documentation.\n\nA Postman Collection is a folder of saved requests. You organize them by feature or service: "User Management", "Orders", "Auth". Within each request you can set headers, body, authorization, and query parameters. The real power comes from Environments — a set of variables like `{{baseUrl}}` and `{{token}}` that swap out depending on whether you are testing dev, staging, or production. You write the request once and switch environments with one click.\n\nPostman has a built-in scripting engine (JavaScript). In the "Tests" tab of each request you write assertions: check the status code, check the response body, extract values and save them to environment variables for the next request. This lets you chain requests: POST login (saves token), GET user (uses token), etc.\n\nNewman is the command-line runner for Postman Collections. It lets you run your entire Collection in CI pipelines with `newman run collection.json`. The result is the same tests that your team runs manually in Postman, now automated in GitHub Actions or Jenkins. This is the bridge between manual API exploration and CI-integrated testing.',
        bodyHe:
          'Postman הוא כלי ה-GUI הפופולרי ביותר לעבודה עם APIs. חשוב עליו כמו שלט-רחוק אוניברסלי ל-APIs — תוכל לשלוח כל בקשת HTTP לכל שרת, לבדוק את התגובה ולשמור הכל ל-Collections מאורגנות. זהו הכלי המועדף לחקר API ידני ותיעוד.\n\nPostman Collection היא תיקיית בקשות שמורות. מארגנים אותן לפי תכונה או שירות: "ניהול משתמשים", "הזמנות", "Auth". בכל בקשה ניתן להגדיר כותרות, גוף, הרשאה ופרמטרי שאילתה. הכוח האמיתי מגיע מ-Environments — קבוצת משתנים כמו `{{baseUrl}}` ו-`{{token}}` שמתחלפים בהתאם לאם אתה בודק dev, staging או production.\n\nPostman כולל מנוע סקריפטים מובנה (JavaScript). בלשונית "Tests" של כל בקשה כותבים אסרציות: בדוק קוד סטטוס, בדוק גוף התגובה, חלץ ערכים ושמור אותם במשתני סביבה לבקשה הבאה. זה מאפשר שרשור בקשות: POST התחברות (שומר טוקן), GET משתמש (משתמש בטוקן), וכו\'.\n\nNewman הוא מרוץ שורת הפקודה ל-Collections של Postman. הוא מאפשר להריץ את ה-Collection כולה ב-pipelines CI עם `newman run collection.json`. התוצאה היא אותן בדיקות שהצוות שלך מריץ ידנית ב-Postman, כעת אוטומטיות ב-GitHub Actions או Jenkins.',
        concepts: [
          'Postman GUI: create, send, and inspect HTTP requests without code',
          'Collections: organized folders of saved requests, shareable with the team',
          'Environments: {{variables}} for baseUrl and tokens — switch dev/staging/prod easily',
          'Tests tab: JavaScript assertions run after each request (pm.test, pm.expect)',
          'Chain requests: extract response values → set as environment variable → use in next request',
          'Newman: runs Postman Collections from CLI — integrates with any CI system',
          'newman run collection.json --environment env.json outputs pass/fail to CI',
        ],
        conceptsHe: [
          'Postman GUI: צור, שלח ובדוק בקשות HTTP ללא קוד',
          'Collections: תיקיות מאורגנות של בקשות שמורות, ניתנות לשיתוף עם הצוות',
          'Environments: {{משתנים}} ל-baseUrl וטוקנים — עבור בין dev/staging/prod בקלות',
          'לשונית Tests: אסרציות JavaScript שרצות לאחר כל בקשה (pm.test, pm.expect)',
          'שרשר בקשות: חלץ ערכי תגובה → הגדר כמשתנה סביבה → השתמש בבקשה הבאה',
          'Newman: מריץ Collections של Postman מ-CLI — משתלב עם כל מערכת CI',
          'newman run collection.json --environment env.json מוציא pass/fail ל-CI',
        ],
        snippets: [
          {
            label: 'Postman test script (Tests tab)',
            labelHe: 'סקריפט בדיקה Postman (לשונית Tests)',
            language: 'javascript',
            code: `// Runs after the request in the "Tests" tab
pm.test('Status is 200', () => {
  pm.response.to.have.status(200)
})

pm.test('Response has users array', () => {
  const body = pm.response.json()
  pm.expect(body).to.be.an('array')
  pm.expect(body.length).to.be.above(0)
})

// Save first user ID for next request
const firstId = pm.response.json()[0].id
pm.environment.set('userId', firstId)`,
          },
          {
            label: 'Run with Newman in CI',
            labelHe: 'הרצה עם Newman ב-CI',
            language: 'bash',
            code: `# Install Newman
npm install -g newman

# Run collection with environment
newman run collection.json --environment staging.env.json

# Output JUnit XML for CI reporting
newman run collection.json -r junit --reporter-junit-export results.xml`,
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
            id: 'api1',
            text: 'What does HTTP status code 404 mean?',
            textHe: 'מה משמעות קוד סטטוס HTTP 404?',
            options: [
              'Server error',
              "Not found — the requested resource doesn't exist",
              'Unauthorized — missing authentication',
              'Bad request — invalid input',
            ],
            optionsHe: [
              'שגיאת שרת',
              'לא נמצא — המשאב המבוקש לא קיים',
              'לא מאושר — חסר אימות',
              'בקשה שגויה — קלט לא חוקי',
            ],
            correct: 1,
            explanation:
              '404 Not Found means the server cannot find the requested resource at the specified URL.',
            explanationHe: '404 Not Found אומר שהשרת לא יכול למצוא את המשאב המבוקש ב-URL שצוין.',
          },
          {
            id: 'api2',
            text: 'Which HTTP method is used to CREATE a new resource?',
            textHe: 'באיזו שיטת HTTP משתמשים ליצירת משאב חדש?',
            options: ['GET', 'PUT', 'POST', 'DELETE'],
            optionsHe: ['GET', 'PUT', 'POST', 'DELETE'],
            correct: 2,
            explanation:
              'POST creates a new resource. The server typically returns 201 Created on success.',
            explanationHe: 'POST יוצר משאב חדש. השרת בדרך כלל מחזיר 201 Created בהצלחה.',
          },
          {
            id: 'api3',
            text: "What does 'idempotent' mean for HTTP GET?",
            textHe: "מה משמעות 'אידמפוטנטי' עבור HTTP GET?",
            options: [
              'The request modifies server state',
              'Calling it multiple times gives the same result without side effects',
              'The request requires authentication',
              'The request returns binary data',
            ],
            optionsHe: [
              'הבקשה משנה את מצב השרת',
              'קריאה מרובות פעמים מניבה את אותה תוצאה ללא תופעות לוואי',
              'הבקשה דורשת אימות',
              'הבקשה מחזירה נתונים בינאריים',
            ],
            correct: 1,
            explanation:
              "GET, PUT, and DELETE are idempotent — repeating them doesn't change the outcome. POST is not idempotent.",
            explanationHe:
              'GET, PUT ו-DELETE הם אידמפוטנטיים — חזרה עליהם לא משנה את התוצאה. POST אינו אידמפוטנטי.',
          },
          {
            id: 'api4',
            text: 'What is an API contract?',
            textHe: 'מהו חוזה API?',
            options: [
              'A legal agreement between companies',
              'The agreed-upon specification of request/response format, status codes, and behavior',
              'A database schema definition',
              'A CI/CD pipeline configuration',
            ],
            optionsHe: [
              'הסכם משפטי בין חברות',
              'המפרט המוסכם של פורמט בקשה/תגובה, קודי סטטוס והתנהגות',
              'הגדרת סכמת מסד נתונים',
              'הגדרת pipeline CI/CD',
            ],
            correct: 1,
            explanation:
              'API contract testing verifies the API behaves exactly as documented — catching breaking changes before they reach production.',
            explanationHe:
              'בדיקת חוזה API מאמתת שה-API מתנהג בדיוק כמתועד — תופסת שינויים שוברים לפני שהם מגיעים לייצור.',
          },
          {
            id: 'api5',
            text: 'Status code 401 means:',
            textHe: 'קוד סטטוס 401 משמעותו:',
            options: [
              'Server crashed',
              'Resource not found',
              'Authentication required or failed',
              'Request was malformed',
            ],
            optionsHe: [
              'השרת קרס',
              'משאב לא נמצא',
              'נדרש אימות או האימות נכשל',
              'הבקשה הייתה בפורמט שגוי',
            ],
            correct: 2,
            explanation:
              '401 Unauthorized means the request lacks valid authentication credentials.',
            explanationHe: '401 Unauthorized אומר שלבקשה חסרים אישורי אימות חוקיים.',
          },
          {
            id: 'api6',
            text: 'What is the Authorization: Bearer header used for?',
            textHe: 'למה משמשת כותרת Authorization: Bearer?',
            options: [
              'Setting content type',
              'Passing an authentication token to identify the caller',
              'Specifying the response language',
              'Controlling cache behavior',
            ],
            optionsHe: [
              'הגדרת סוג תוכן',
              'העברת טוקן אימות לזיהוי המבצע',
              'ציון שפת התגובה',
              'שליטה בהתנהגות cache',
            ],
            correct: 1,
            explanation:
              'Bearer tokens (commonly JWTs) are passed in the Authorization header to authenticate API requests.',
            explanationHe:
              'טוקני Bearer (בדרך כלל JWTs) מועברים בכותרת Authorization לאימות בקשות API.',
          },
          {
            id: 'api7',
            text: 'What should an API test verify?',
            textHe: 'מה צריכה בדיקת API לאמת?',
            options: [
              'Only the status code',
              'Status code, response body structure, and error messages',
              'Only that the response is not empty',
              'Only performance metrics',
            ],
            optionsHe: [
              'רק קוד הסטטוס',
              'קוד סטטוס, מבנה גוף התגובה והודעות שגיאה',
              'רק שהתגובה אינה ריקה',
              'רק מדדי ביצועים',
            ],
            correct: 1,
            explanation:
              'Comprehensive API tests check status code, response structure/schema, field values, and meaningful error messages.',
            explanationHe:
              'בדיקות API מקיפות בודקות קוד סטטוס, מבנה/סכמת תגובה, ערכי שדות והודעות שגיאה משמעותיות.',
          },
          {
            id: 'api8',
            text: 'What is a mock server?',
            textHe: 'מהו שרת mock?',
            options: [
              'A server that slows down responses deliberately',
              'A simulated server that returns predefined responses — useful for testing without the real backend',
              'A security proxy for APIs',
              'A load balancer for test environments',
            ],
            optionsHe: [
              'שרת שמאט תגובות בכוונה',
              'שרת מדומה שמחזיר תגובות מוגדרות מראש — שימושי לבדיקה ללא ה-backend האמיתי',
              'פרוקסי אבטחה ל-APIs',
              'מאזן עומסים לסביבות בדיקה',
            ],
            correct: 1,
            explanation:
              'Mock servers let you test your client code against predictable responses, including error conditions, without a real backend.',
            explanationHe:
              'שרתי mock מאפשרים לבדוק קוד לקוח מול תגובות צפויות, כולל תנאי שגיאה, ללא backend אמיתי.',
          },
          {
            id: 'api9',
            text: 'REST stands for:',
            textHe: 'REST עומד על:',
            options: [
              'Rapid Endpoint Security Testing',
              'REpresentational State Transfer',
              'Remote Execution Service Technology',
              'Reliable Endpoint Service Transmission',
            ],
            optionsHe: [
              'בדיקת אבטחת נקודות קצה מהירה',
              'העברת מצב ייצוגי',
              'טכנולוגיית שירות ביצוע מרחוק',
              'שידור שירות נקודת קצה אמין',
            ],
            correct: 1,
            explanation:
              "REST = REpresentational State Transfer. It's an architectural style using HTTP verbs on resource URLs.",
            explanationHe:
              'REST = REpresentational State Transfer. זהו סגנון ארכיטקטוני המשתמש בפעלי HTTP על URLs של משאבים.',
          },
          {
            id: 'api10',
            text: 'What HTTP method should be used to partially update a resource?',
            textHe: 'באיזו שיטת HTTP יש להשתמש כדי לעדכן חלקית משאב?',
            options: ['POST', 'PUT', 'PATCH', 'GET'],
            optionsHe: ['POST', 'PUT', 'PATCH', 'GET'],
            correct: 2,
            explanation:
              'PATCH partially updates a resource (only the fields you send). PUT replaces the entire resource.',
            explanationHe: 'PATCH מעדכן משאב חלקית (רק השדות שאתה שולח). PUT מחליף את המשאב כולו.',
          },
          {
            id: 'api11',
            text: 'In Postman, what is an environment used for?',
            textHe: 'ב-Postman, למה משמשת סביבה?',
            options: [
              'Storing test scripts',
              'Storing variables like base URLs and tokens that change between environments',
              'Running tests in parallel',
              'Generating API documentation',
            ],
            optionsHe: [
              'אחסון סקריפטי בדיקה',
              'אחסון משתנים כמו URLs בסיס וטוקנים שמשתנים בין סביבות',
              'הרצת בדיקות במקביל',
              'יצירת תיעוד API',
            ],
            correct: 1,
            explanation:
              'Postman environments store {{variables}} so you can switch between dev/staging/prod without changing each request.',
            explanationHe:
              'סביבות Postman מאחסנות {{משתנים}} כך שתוכל לעבור בין dev/staging/prod ללא שינוי כל בקשה.',
          },
          {
            id: 'api12',
            text: 'What does Newman do?',
            textHe: 'מה עושה Newman?',
            options: [
              'It is a GUI for designing APIs',
              'It runs Postman collections from the command line, enabling CI integration',
              'It generates API documentation automatically',
              'It monitors API uptime in production',
            ],
            optionsHe: [
              'זהו GUI לעיצוב APIs',
              'הוא מריץ אוספי Postman משורת הפקודה, מאפשר אינטגרציית CI',
              'הוא יוצר תיעוד API אוטומטית',
              'הוא מנטר זמינות API בייצור',
            ],
            correct: 1,
            explanation:
              'Newman is the CLI runner for Postman collections — run newman run collection.json in any CI pipeline.',
            explanationHe:
              'Newman הוא מרוץ CLI לאוספי Postman — הרץ newman run collection.json בכל pipeline CI.',
          },
          {
            id: 'api13',
            text: 'Status code 500 means:',
            textHe: 'קוד סטטוס 500 משמעותו:',
            options: [
              'Request succeeded',
              'Client sent an invalid request',
              'An unexpected error occurred on the server',
              'Resource was successfully created',
            ],
            optionsHe: [
              'הבקשה הצליחה',
              'הלקוח שלח בקשה לא חוקית',
              'אירעה שגיאה בלתי צפויה בשרת',
              'המשאב נוצר בהצלחה',
            ],
            correct: 2,
            explanation:
              "500 Internal Server Error means the server encountered an unexpected condition. It's a server-side bug.",
            explanationHe:
              '500 Internal Server Error אומר שהשרת נתקל בתנאי בלתי צפוי. זהו באג בצד השרת.',
          },
          {
            id: 'api14',
            text: 'What is the Content-Type header used for?',
            textHe: 'למה משמשת כותרת Content-Type?',
            options: [
              'Authentication',
              'Specifying the format of the request body (e.g. application/json)',
              'Setting the response language',
              'Controlling caching',
            ],
            optionsHe: [
              'אימות',
              'ציון פורמט גוף הבקשה (למשל application/json)',
              'הגדרת שפת התגובה',
              'שליטה ב-caching',
            ],
            correct: 1,
            explanation:
              "Content-Type tells the server what format the request body is in. For JSON APIs, use 'application/json'.",
            explanationHe:
              "Content-Type מספר לשרת באיזה פורמט גוף הבקשה. עבור APIs של JSON, השתמש ב-'application/json'.",
          },
          {
            id: 'api15',
            text: 'API contract testing ensures:',
            textHe: 'בדיקת חוזה API מבטיחה:',
            options: [
              'APIs run fast enough',
              'The API response matches the agreed-upon schema and prevents breaking changes',
              'APIs are secure',
              'APIs handle high traffic',
            ],
            optionsHe: [
              'APIs רצים מהר מספיק',
              'תגובת ה-API תואמת את הסכמה המוסכמת ומונעת שינויים שוברים',
              'APIs מאובטחים',
              'APIs מטפלים בתנועה גבוהה',
            ],
            correct: 1,
            explanation:
              'Contract tests catch when a producer API changes in a way that breaks consumer expectations — before it reaches production.',
            explanationHe:
              'בדיקות חוזה תופסות כשה-API של הספק משתנה באופן שמשבר ציפיות הצרכן — לפני שזה מגיע לייצור.',
          },
          {
            id: 'api16',
            text: 'When testing a DELETE endpoint, what should you verify?',
            textHe: 'כשבודקים נקודת קצה DELETE, מה יש לאמת?',
            options: [
              'Only that status is 200',
              'Status code (204 No Content or 200), that the resource is gone (GET returns 404), and repeated DELETE handles gracefully',
              'That the database is empty',
              'Only that the response is JSON',
            ],
            optionsHe: [
              'רק שהסטטוס הוא 200',
              'קוד סטטוס (204 No Content או 200), שהמשאב נמחק (GET מחזיר 404), וש-DELETE חוזר מטופל בחן',
              'שמסד הנתונים ריק',
              'רק שהתגובה היא בפורמט JSON',
            ],
            correct: 1,
            explanation:
              'A complete DELETE test checks: correct status, resource is actually deleted, and idempotency (deleting again returns 404, not 500).',
            explanationHe:
              'בדיקת DELETE מלאה בודקת: סטטוס נכון, המשאב אכן נמחק, ואידמפוטנטיות (מחיקה שוב מחזירה 404, לא 500).',
          },
          {
            id: 'api17',
            text: 'Rate limiting in APIs means:',
            textHe: 'הגבלת קצב ב-APIs משמעותה:',
            options: [
              'The API only works in certain geographic regions',
              'The server limits how many requests a client can make in a given time window',
              'The API only accepts certain data formats',
              'The server prioritizes certain users',
            ],
            optionsHe: [
              'ה-API עובד רק באזורים גיאוגרפיים מסוימים',
              'השרת מגביל כמה בקשות לקוח יכול לבצע בחלון זמן נתון',
              'ה-API מקבל רק פורמטי נתונים מסוימים',
              'השרת מעדיף משתמשים מסוימים',
            ],
            correct: 1,
            explanation:
              'Rate limiting protects the server from abuse. Status 429 Too Many Requests is returned when the limit is exceeded.',
            explanationHe:
              'הגבלת קצב מגנה על השרת מניצול לרעה. סטטוס 429 Too Many Requests מוחזר כשהמגבלה חרגת.',
          },
          {
            id: 'api18',
            text: 'What is the benefit of testing APIs separately from the UI?',
            textHe: 'מה היתרון בבדיקת APIs בנפרד מה-UI?',
            options: [
              'API tests are prettier',
              'API tests are faster, more stable, and catch backend bugs without browser overhead',
              'API tests require no coding skills',
              'API tests replace all UI tests',
            ],
            optionsHe: [
              'בדיקות API יפות יותר',
              'בדיקות API מהירות יותר, יציבות יותר ותופסות באגי backend ללא עומס הדפדפן',
              'בדיקות API לא דורשות כישורי תכנות',
              'בדיקות API מחליפות את כל בדיקות ה-UI',
            ],
            correct: 1,
            explanation:
              'API tests run in milliseconds vs. seconds for UI tests, have less flakiness, and test the actual business logic layer.',
            explanationHe:
              'בדיקות API רצות במילישניות לעומת שניות לבדיקות UI, פחות נדנדתיות ובודקות את שכבת הלוגיקה העסקית האמיתית.',
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
  {
    id: 'load',
    title: 'Load & Performance Testing',
    titleHe: 'בדיקות עומסים וביצועים',
    icon: '⚡',
    sections: [
      {
        id: 'load-types',
        type: 'lesson',
        title: 'Load vs Performance vs Stress vs Soak',
        titleHe: 'עומסים מול ביצועים מול לחץ מול סבולת',
        level: 'Intermediate',
        minutes: 12,
        summary: 'Learn the four types of non-functional tests and when to run each one using k6.',
        summaryHe: 'למד את ארבעת סוגי הבדיקות הלא-פונקציונליות ומתי להריץ כל אחת עם k6.',
        body: 'Think about different road scenarios. Normal traffic on a Tuesday morning is "load testing" — does the system handle expected volume? Rush-hour traffic is a "performance test" — how does response time degrade under higher load? A major accident that causes gridlock is "stress testing" — at what point does the system break completely? A marathon that uses the same roads for 6 hours is "soak testing" — does the system have memory leaks or degrade over time?\n\nLoad testing simulates the expected number of concurrent users and verifies the system handles them without exceeding response-time thresholds. If your app normally has 500 simultaneous users, your load test should simulate 500 users and verify P95 response time stays under 2 seconds. Performance testing focuses specifically on response times — it answers "is the system fast enough for users?"\n\nStress testing pushes beyond normal capacity to find the breaking point. You ramp up users until the system starts returning errors or times out. This tells you the maximum capacity and helps you plan infrastructure scaling. Soak testing runs a moderate load for an extended period (hours) to detect memory leaks — a bug that only appears after thousands of requests can hide from short tests.\n\nk6 is the modern tool of choice: tests are written in JavaScript, it runs from the CLI or CI, and produces detailed metrics. Key metrics to watch: response time (P95, P99 — not just average), requests per second (throughput), error rate (should be 0% under normal load), and virtual user concurrency.',
        bodyHe:
          'חשוב על תרחישי דרך שונים. תנועה רגילה בבוקר יום שלישי היא "בדיקת עומסים" — האם המערכת מטפלת בנפח הצפוי? תנועת שעת שיא היא "בדיקת ביצועים" — כיצד זמן התגובה מידרדר תחת עומס גבוה יותר? תאונה גדולה שגורמת לפקק היא "בדיקת לחץ" — באיזו נקודה המערכת נשברת לחלוטין? מרתון שמשתמש באותן דרכים במשך 6 שעות הוא "בדיקת סבולת" — האם למערכת יש דליפות זיכרון או האם היא מידרדרת עם הזמן?\n\nבדיקת עומסים מדמה את מספר המשתמשים המקבילים הצפוי ומאמתת שהמערכת מטפלת בהם מבלי לחרוג מסף זמן התגובה. אם לאפליקציה שלך יש בדרך כלל 500 משתמשים בו-זמניים, בדיקת העומסים שלך צריכה לדמות 500 משתמשים ולאמת שזמן התגובה P95 נשאר מתחת ל-2 שניות.\n\nבדיקת לחץ דוחפת מעבר לקיבולת הרגילה כדי למצוא את נקודת השבירה. מגדילים משתמשים עד שהמערכת מתחילה להחזיר שגיאות או לפגר. בדיקת סבולת מריצה עומס מתון לתקופה ממושכת (שעות) לגילוי דליפות זיכרון.\n\nk6 הוא כלי הבחירה המודרני: בדיקות כתובות ב-JavaScript, רץ מ-CLI או CI ומייצר מדדים מפורטים. מדדים מרכזיים לצפייה: זמן תגובה (P95, P99 — לא רק ממוצע), בקשות לשנייה (throughput), שיעור שגיאות (צריך להיות 0% תחת עומס רגיל).',
        concepts: [
          'Load test: simulate expected users → verify response time stays within SLA',
          'Performance test: measure response times and throughput under various loads',
          'Stress test: ramp beyond capacity → find breaking point and max throughput',
          'Soak test: moderate load for hours → detect memory leaks and resource exhaustion',
          'P95/P99: 95th/99th percentile — the experience of your slowest users',
          'k6: JavaScript-based load testing tool, runs in CLI and CI',
          'Error rate should be 0% under normal load — any errors are bugs',
        ],
        conceptsHe: [
          'בדיקת עומסים: דמה משתמשים צפויים → אמת שזמן התגובה נשאר ב-SLA',
          'בדיקת ביצועים: מדוד זמני תגובה ו-throughput תחת עומסים שונים',
          'בדיקת לחץ: עלה מעבר לקיבולת → מצא נקודת שבירה ו-throughput מקסימלי',
          'בדיקת סבולת: עומס מתון שעות → גלה דליפות זיכרון ומיצוי משאבים',
          'P95/P99: אחוזון 95/99 — חוויית המשתמשים האיטיים שלך',
          'k6: כלי בדיקות עומסים מבוסס JavaScript, רץ ב-CLI וב-CI',
          'שיעור שגיאות צריך להיות 0% תחת עומס רגיל — כל שגיאה היא באג',
        ],
        snippets: [
          {
            label: 'Basic k6 load test script',
            labelHe: 'סקריפט בדיקת עומסים בסיסי עם k6',
            language: 'javascript',
            code: `import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  vus: 50,          // 50 virtual users
  duration: '1m',   // run for 1 minute
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    http_req_failed: ['rate<0.01'],    // error rate under 1%
  },
}

export default function () {
  const res = http.get('https://your-api.com/api/products')
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  })
  sleep(1)
}`,
          },
          {
            label: 'Run k6 from CLI',
            labelHe: 'הרצת k6 מ-CLI',
            language: 'bash',
            code: `# Install k6 (Mac)
brew install k6

# Run the test
k6 run load-test.js

# Run with more VUs and longer duration
k6 run --vus 100 --duration 5m load-test.js

# Output results to JSON for CI
k6 run --out json=results.json load-test.js`,
          },
        ],
      },
      {
        id: 'load-practice',
        type: 'practice',
        title: 'Practice: Load Testing',
        titleHe: 'תרגול: בדיקות עומסים',
        minutes: 15,
        practiceDesc: 'Write and analyze a k6 load test for a simple REST API.',
        practiceDescHe: 'כתוב ונתח בדיקת עומסים k6 עבור REST API פשוט.',
        practiceItems: [
          'Write a k6 script that sends GET requests to a public API (e.g., jsonplaceholder.typicode.com)',
          'Configure it to run with 50 VUs for 1 minute',
          'Add a threshold: P95 response time < 1500ms and error rate < 1%',
          'Run the test and identify what the P95 and P99 values mean in the results',
          'Explain: what would you change if the P99 was 8 seconds?',
        ],
        practiceItemsHe: [
          'כתוב סקריפט k6 ששולח בקשות GET ל-API ציבורי (למשל jsonplaceholder.typicode.com)',
          'הגדר אותו לרוץ עם 50 VUs למשך דקה אחת',
          'הוסף threshold: זמן תגובה P95 < 1500ms ושיעור שגיאות < 1%',
          'הרץ את הבדיקה וזהה מה אומרים ערכי P95 ו-P99 בתוצאות',
          'הסבר: מה היית משנה אם P99 היה 8 שניות?',
        ],
      },
    ],
  },
  {
    id: 'iot',
    title: 'Hardware-Integrated Systems & IoT',
    titleHe: 'מערכות משולבות חומרה ו-IoT',
    icon: '🔧',
    sections: [
      {
        id: 'iot-intro',
        type: 'lesson',
        title: 'What Are Embedded & IoT Systems?',
        titleHe: 'מהן מערכות משובצות ו-IoT?',
        level: 'Intermediate',
        minutes: 12,
        summary:
          'Learn how QA engineers test software that runs on hardware — from ATMs to smart fridges.',
        summaryHe: 'למד כיצד מהנדסי QA בודקים תוכנה שרצה על חומרה — מ-ATMs למקררים חכמים.',
        body: 'ATMs dispense cash. Traffic lights manage intersections. Smart thermostats learn your schedule. Pacemakers regulate heartbeats. All of these run software on dedicated hardware — they are embedded systems. Testing them requires a completely different mindset than testing a web app because you cannot just "refresh the page" when something goes wrong.\n\nThe key challenges of IoT and embedded testing: you cannot always access the system through a browser or API. Communication happens over serial ports (UART), wireless protocols (MQTT, Bluetooth, Zigbee), or proprietary interfaces. The system may have no display at all. You need hardware-in-the-loop (HIL) simulators or real hardware rigs to reproduce conditions. A bug in an ATM firmware that goes undetected can cost a bank millions — or worse, in medical devices, cost lives.\n\nQA strategies for embedded systems: firmware validation (does the new firmware version behave correctly?), boundary testing (what happens at minimum/maximum sensor readings?), safety-critical requirements (the system must fail gracefully — a watchdog timer should restart the device if software hangs, not leave it in an unsafe state), and regression testing after every firmware update.\n\nSimulation is a core tool. You cannot always have real hardware in your test environment, especially in CI. Hardware simulators, MQTT brokers with test topics, and virtual serial ports let you test most of the software logic. Real hardware testing happens at specific milestones — hardware-in-the-loop gives the best coverage but is slower and more expensive.',
        bodyHe:
          'ATMs מספקים מזומן. רמזורים מנהלים צמתים. תרמוסטטים חכמים לומדים את לוח הזמנים שלך. קוצבי לב מסדירים פעימות לב. כולם מריצים תוכנה על חומרה ייעודית — הם מערכות משובצות. בדיקתן דורשת חשיבה שונה לגמרי מבדיקת אפליקציית ווב כי לא תוכל פשוט "לרענן את הדף" כאשר משהו משתבש.\n\nאתגרי המפתח של בדיקות IoT ומשובצות: לא תמיד ניתן לגשת למערכת דרך דפדפן או API. התקשורת מתרחשת על פורטים סדרתיים (UART), פרוטוקולים אלחוטיים (MQTT, Bluetooth, Zigbee), או ממשקים קנייניים. למערכת עשוי להיות ללא תצוגה כלל. נדרשים סימולטורי hardware-in-the-loop (HIL) או ריגים של חומרה אמיתית לשכפול תנאים.\n\nאסטרטגיות QA למערכות משובצות: אימות firmware (האם גרסת ה-firmware החדשה מתנהגת נכון?), בדיקת גבולות (מה קורה בקריאות חיישן מינימליות/מקסימליות?), דרישות קריטיות לבטיחות (המערכת חייבת להיכשל בחן — טיימר watchdog צריך להפעיל מחדש את המכשיר אם התוכנה תקועה), ובדיקות רגרסיה לאחר כל עדכון firmware.\n\nסימולציה היא כלי מרכזי. לא תמיד ניתן לקבל חומרה אמיתית בסביבת הבדיקה שלך, במיוחד ב-CI. סימולטורי חומרה, ברוקרי MQTT עם נושאי בדיקה ופורטים סדרתיים וירטואליים מאפשרים לבדוק את רוב לוגיקת התוכנה.',
        concepts: [
          'Embedded systems run software on dedicated hardware (ATM, pacemaker, traffic light)',
          'Communication protocols: UART (serial), MQTT (IoT messaging), Bluetooth, Zigbee',
          'Hardware-in-the-loop (HIL): simulate sensors/actuators to test firmware in CI',
          'Watchdog timer: hardware mechanism that restarts a device if software hangs',
          'Graceful degradation: system must fail safely, not in an undefined state',
          'Firmware validation: every firmware version update needs a regression test suite',
          'Boundary testing: test at min/max sensor values — edge cases break embedded systems',
        ],
        conceptsHe: [
          'מערכות משובצות מריצות תוכנה על חומרה ייעודית (ATM, קוצב לב, רמזור)',
          'פרוטוקולי תקשורת: UART (סדרתי), MQTT (הודעות IoT), Bluetooth, Zigbee',
          'Hardware-in-the-loop (HIL): דמה חיישנים/מפעילים לבדיקת firmware ב-CI',
          'טיימר Watchdog: מנגנון חומרה שמפעיל מחדש מכשיר אם התוכנה תקועה',
          'Graceful degradation: המערכת חייבת להיכשל בבטחה, לא במצב לא מוגדר',
          'אימות Firmware: כל עדכון גרסת firmware דורש חבילת בדיקות רגרסיה',
          'בדיקת גבולות: בדוק בערכי חיישן מינימליים/מקסימליים — מקרי קצה שוברים מערכות משובצות',
        ],
        snippets: [],
      },
      {
        id: 'iot-practice',
        type: 'practice',
        title: 'Practice: Hardware Systems in SQA Life',
        titleHe: 'תרגול: מערכות חומרה בחיי ה-SQA',
        minutes: 15,
        practiceDesc:
          'Design test cases for a smart door lock system — an IoT device controlled by a mobile app.',
        practiceDescHe:
          'עצב תרחישי בדיקה למערכת מנעול דלת חכמה — מכשיר IoT הנשלט על ידי אפליקציית מובייל.',
        practiceItems: [
          'List 5 functional test cases for a smart lock (e.g., unlock via app, PIN entry, auto-lock)',
          'Identify 3 things you would simulate vs. test on real hardware, and explain why',
          'Write 3 edge case scenarios (e.g., what if the battery dies mid-unlock?)',
          'Define a regression suite for a firmware update — what must be tested before releasing?',
        ],
        practiceItemsHe: [
          'רשום 5 תרחישי בדיקה פונקציונליים למנעול חכם (למשל פתיחה דרך אפליקציה, כניסת PIN, נעילה אוטומטית)',
          'זהה 3 דברים שהיית מדמה לעומת בודק על חומרה אמיתית, והסבר מדוע',
          'כתוב 3 תרחישי מקרי קצה (למשל מה אם הסוללה מתה באמצע פתיחה?)',
          'הגדר חבילת רגרסיה לעדכון firmware — מה חייב להיבדק לפני שחרור?',
        ],
      },
    ],
  },
  // MODULE_4_PLACEHOLDER
  // MODULE_5_PLACEHOLDER
  {
    id: 'sql',
    title: 'SQL & Databases',
    titleHe: 'SQL ומסדי נתונים',
    icon: '🗄️',
    sections: [
      {
        id: 'sql-intro',
        type: 'lesson',
        title: 'SQL — Introduction',
        titleHe: 'SQL — מבוא',
        level: 'Beginner',
        minutes: 10,
        summary:
          'Learn what SQL is, why every QA engineer needs it, and how to write your first query.',
        summaryHe: 'למד מהו SQL, מדוע כל מהנדס QA צריך אותו, וכיצד לכתוב את השאילתה הראשונה שלך.',
        body: 'Imagine a very organized filing cabinet. Each drawer is a "table" (Users, Orders, Products). Each folder inside is a "row" (one user, one order). Each label on the folder is a "column" (name, email, created_at). SQL is the language you use to ask this filing cabinet questions: "Give me all users whose email ends in @gmail.com" or "Count how many orders were placed today".\n\nSQL stands for Structured Query Language. It is the universal language for relational databases — PostgreSQL, MySQL, SQLite, SQL Server all speak SQL. As a QA engineer you need SQL because: the UI can lie (a bug might show the wrong data), the API can cache stale results, but the database is the source of truth. When you write a SQL query and check the database directly, you are validating what the system actually stored.\n\nSQL\'s four core operations are called CRUD: Create (INSERT), Read (SELECT), Update (UPDATE), Delete (DELETE). As a QA engineer you will mostly use SELECT — you read data to verify it is correct. INSERT helps you set up test data. Understanding UPDATE and DELETE helps you clean up after tests.\n\nA primary key (PK) is the unique identifier for every row — like a social security number for each record. Every table should have one. A foreign key (FK) links one table to another — for example, the `orders` table has a `user_id` column that points to the `id` in the `users` table. Understanding PKs and FKs helps you write JOIN queries and spot data integrity bugs.',
        bodyHe:
          'דמיין ארון תיוק מאורגן מאוד. כל מגירה היא "טבלה" (משתמשים, הזמנות, מוצרים). כל תיקייה בפנים היא "שורה" (משתמש אחד, הזמנה אחת). כל תווית על התיקייה היא "עמודה" (שם, אימייל, created_at). SQL היא השפה שאתה משתמש בה לשאול את ארון התיוק הזה שאלות: "תן לי את כל המשתמשים שהאימייל שלהם מסתיים ב-@gmail.com" או "ספור כמה הזמנות בוצעו היום".\n\nSQL מייצג Structured Query Language — שפת שאילתות מובנית. זוהי השפה האוניברסלית למסדי נתונים יחסיים — PostgreSQL, MySQL, SQLite, SQL Server כולם מדברים SQL. כמהנדס QA אתה צריך SQL כי: ה-UI יכול לשקר (באג עשוי להציג נתונים שגויים), ה-API יכול לשמור תוצאות ישנות ב-cache, אבל מסד הנתונים הוא מקור האמת.\n\nארבע הפעולות המרכזיות של SQL נקראות CRUD: Create (INSERT), Read (SELECT), Update (UPDATE), Delete (DELETE). כמהנדס QA תשתמש בעיקר ב-SELECT — קורא נתונים לאימות שהם נכונים. INSERT עוזר לך להגדיר נתוני בדיקה. הבנת UPDATE ו-DELETE עוזרת לך לנקות אחרי בדיקות.\n\nמפתח ראשי (PK) הוא המזהה הייחודי של כל שורה — כמו מספר תעודת זהות לכל רשומה. לכל טבלה צריך להיות אחד. מפתח זר (FK) מקשר טבלה אחת לאחרת — לדוגמה, טבלת `orders` יש עמודת `user_id` שמצביעה ל-`id` בטבלת `users`.',
        concepts: [
          'Database = organized collection of data in tables (rows + columns)',
          'SQL = the query language for relational databases (PostgreSQL, MySQL, SQLite)',
          'CRUD: CREATE (INSERT), READ (SELECT), UPDATE, DELETE',
          'Primary key (PK): unique ID for each row — must be unique and non-null',
          'Foreign key (FK): links rows across tables (e.g. orders.user_id → users.id)',
          'QA uses SQL to verify what the system actually stored in the database',
          'The database is the source of truth — more reliable than UI or cached API responses',
        ],
        conceptsHe: [
          'מסד נתונים = אוסף מאורגן של נתונים בטבלאות (שורות + עמודות)',
          'SQL = שפת השאילתות למסדי נתונים יחסיים (PostgreSQL, MySQL, SQLite)',
          'CRUD: CREATE (INSERT), READ (SELECT), UPDATE, DELETE',
          'מפתח ראשי (PK): מזהה ייחודי לכל שורה — חייב להיות ייחודי וללא NULL',
          'מפתח זר (FK): מקשר שורות בין טבלאות (למשל orders.user_id → users.id)',
          'QA משתמש ב-SQL לאימות מה המערכת אכן שמרה במסד הנתונים',
          'מסד הנתונים הוא מקור האמת — אמין יותר מה-UI או תגובות API שמור ב-cache',
        ],
        snippets: [
          {
            label: 'Your first SQL queries',
            labelHe: 'השאילתות הראשונות שלך ב-SQL',
            language: 'sql',
            code: `-- Read all rows from users table
SELECT * FROM users;

-- Read specific columns only
SELECT id, email, created_at FROM users;

-- Create a test user
INSERT INTO users (name, email) VALUES ('Test User', 'test@example.com');

-- Update a user
UPDATE users SET email = 'new@example.com' WHERE id = 42;

-- Delete test data (careful!)
DELETE FROM users WHERE email LIKE '%@test.com';`,
          },
        ],
      },
      {
        id: 'db-fundamentals',
        type: 'lesson',
        title: 'Database Fundamentals',
        titleHe: 'יסודות מסד הנתונים',
        level: 'Beginner',
        minutes: 15,
        summary:
          'Understand relational vs NoSQL databases, ERD basics, and why indexes matter for QA.',
        summaryHe: 'הבן מסדי נתונים יחסיים לעומת NoSQL, יסודות ERD, ומדוע indexes חשובים ל-QA.',
        body: 'Relational databases store data in tables with strict schemas — every row in the `users` table has the same columns. Tables are linked through foreign keys. This structure makes data consistent and queryable with SQL. Examples: PostgreSQL, MySQL, SQL Server. NoSQL databases store data as documents (JSON-like objects), key-value pairs, or graphs — they are more flexible but harder to query with complex joins. Examples: MongoDB (documents), Redis (key-value), DynamoDB.\n\nAn Entity Relationship Diagram (ERD) is a visual map of your database. Each rectangle is a table (entity), each line is a relationship. A "one-to-many" relationship means one user can have many orders (1:N). A "many-to-many" relationship means one order can have many products, and one product can be in many orders (M:N) — this requires a join table. Reading an ERD helps you understand which tables to JOIN in your queries.\n\nAn index is like the index at the back of a textbook — instead of reading every page to find "foreign key", you jump directly to the right page. A database index lets the engine find rows by a column value without scanning the entire table. For a QA engineer, indexes matter because a missing index on a frequently queried column is a performance bug. A query that takes 2ms with an index might take 10 seconds without one on a large table.\n\nNULL in SQL means "unknown" or "missing value" — it is not zero, not an empty string. NULL is special: `WHERE email = NULL` will never match anything — you must use `WHERE email IS NULL`. Finding unexpected NULLs in required fields is a common QA data validation task.',
        bodyHe:
          'מסדי נתונים יחסיים מאחסנים נתונים בטבלאות עם סכמות קפדניות — לכל שורה בטבלת `users` יש את אותן העמודות. טבלאות מקושרות דרך מפתחות זרים. מסדי נתונים NoSQL מאחסנים נתונים כמסמכים (אובייקטים דמויי JSON), זוגות מפתח-ערך, או גרפים — הם גמישים יותר אך קשים יותר לשאילתה עם joins מורכבים.\n\nתרשים ישויות-קשרים (ERD) הוא מפה ויזואלית של מסד הנתונים שלך. כל מלבן הוא טבלה (ישות), כל קו הוא קשר. קשר "אחד לרבים" אומר שמשתמש אחד יכול לקבל הזמנות רבות (1:N). קשר "רבים לרבים" אומר שהזמנה אחת יכולה לכלול מוצרים רבים, ומוצר אחד יכול להיות בהזמנות רבות (M:N) — זה דורש טבלת join.\n\nIndex הוא כמו האינדקס בגב ספר לימוד — במקום לקרוא כל עמוד כדי למצוא "מפתח זר", אתה קופץ ישירות לעמוד הנכון. עבור מהנדס QA, indexes חשובים כי index חסר על עמודה שנשאלת תכופות הוא באג ביצועים. שאילתה שלוקחת 2ms עם index עשויה לקחת 10 שניות בלעדיו בטבלה גדולה.\n\nNULL ב-SQL אומר "לא ידוע" או "ערך חסר" — הוא לא אפס, לא מחרוזת ריקה. `WHERE email = NULL` לא תתאים לדבר — חייבים להשתמש ב-`WHERE email IS NULL`. מציאת NULLs בלתי צפויים בשדות נדרשים היא משימת אימות נתוני QA נפוצה.',
        concepts: [
          'Relational DB: tables with fixed schema, linked by foreign keys (PostgreSQL, MySQL)',
          'NoSQL: flexible documents/key-value, no fixed schema (MongoDB, Redis)',
          'ERD: visual map of tables and their relationships (1:N, M:N)',
          'One-to-many (1:N): one user has many orders — most common relationship',
          'Many-to-many (M:N): orders ↔ products — requires a join table',
          'Index: speeds up queries on specific columns — missing index = performance bug',
          'NULL means unknown/missing — use IS NULL, not = NULL in queries',
        ],
        conceptsHe: [
          'מסד נתונים יחסי: טבלאות עם סכמה קבועה, מקושרות במפתחות זרים (PostgreSQL, MySQL)',
          'NoSQL: מסמכים/מפתח-ערך גמישים, ללא סכמה קבועה (MongoDB, Redis)',
          'ERD: מפה ויזואלית של טבלאות וקשריהן (1:N, M:N)',
          'אחד לרבים (1:N): משתמש אחד יש לו הזמנות רבות — הקשר הנפוץ ביותר',
          'רבים לרבים (M:N): הזמנות ↔ מוצרים — דורש טבלת join',
          'Index: מאיץ שאילתות על עמודות ספציפיות — index חסר = באג ביצועים',
          'NULL אומר לא ידוע/חסר — השתמש ב-IS NULL, לא = NULL בשאילתות',
        ],
        snippets: [
          {
            label: 'CREATE TABLE with PK and FK',
            labelHe: 'CREATE TABLE עם PK ו-FK',
            language: 'sql',
            code: `-- Users table with primary key
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table with foreign key to users
CREATE TABLE orders (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  total      DECIMAL(10,2) NOT NULL,
  status     VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index on frequently queried column
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status  ON orders(status);`,
          },
        ],
      },
      {
        id: 'select-where',
        type: 'lesson',
        title: 'SELECT / FROM / WHERE',
        titleHe: 'SELECT / FROM / WHERE',
        level: 'Beginner',
        minutes: 15,
        summary:
          'Master the most-used SQL shape: filter rows with WHERE and common comparison operators.',
        summaryHe: 'שלוט בצורת ה-SQL הנפוצה ביותר: סנן שורות עם WHERE ואופרטורי השוואה נפוצים.',
        body: 'The `SELECT ... FROM ... WHERE` pattern is the bread and butter of SQL. You will use it dozens of times a day as a QA engineer. SELECT tells SQL which columns you want. FROM tells it which table. WHERE filters which rows to include. Think of it as asking a question: "From the users table, show me the email and name of anyone who signed up after January 1st."\n\nThe WHERE clause supports many operators: `=` (exact match), `!=` or `<>` (not equal), `>` / `<` / `>=` / `<=` (numeric comparisons), `LIKE` (pattern matching — `%` is wildcard), `IN` (matches any value in a list), `BETWEEN` (range), and `IS NULL` / `IS NOT NULL` (checking for missing values). Combining them correctly is the skill.\n\nAs a QA engineer your most common SQL tasks are: find all records with a certain status (find failed orders), find records with missing required fields (find users with no email), count records to verify a migration (row count before vs. after), find duplicates (two users with the same email), and find stale data (records that haven\'t been updated in 30 days).\n\nLIMIT restricts how many rows you get back — always use it when exploring an unknown table. `SELECT * FROM users LIMIT 10` is safe. `SELECT * FROM users` on a 10-million-row table will either crash your tool or take minutes. Always add LIMIT when you do not need every row.',
        bodyHe:
          'התבנית `SELECT ... FROM ... WHERE` היא לחם והחמאה של SQL. תשתמש בה עשרות פעמים ביום כמהנדס QA. SELECT מספר ל-SQL אילו עמודות אתה רוצה. FROM מספר לו איזו טבלה. WHERE מסנן אילו שורות לכלול. חשוב על זה כשאלה: "מטבלת המשתמשים, הראה לי את האימייל והשם של כל מי שנרשם אחרי ה-1 בינואר."\n\nסעיף ה-WHERE תומך באופרטורים רבים: `=` (התאמה מדויקת), `!=` או `<>` (לא שווה), `>` / `<` / `>=` / `<=` (השוואות מספריות), `LIKE` (התאמת תבנית — `%` הוא wildcard), `IN` (מתאים לכל ערך ברשימה), `BETWEEN` (טווח), ו-`IS NULL` / `IS NOT NULL` (בדיקת ערכים חסרים).\n\nכמהנדס QA המשימות הנפוצות שלך ב-SQL הן: מצא את כל הרשומות עם סטטוס מסוים (מצא הזמנות שנכשלו), מצא רשומות עם שדות נדרשים חסרים (מצא משתמשים ללא אימייל), ספור רשומות לאימות migration, מצא כפילויות ומצא נתונים ישנים.\n\nLIMIT מגביל כמה שורות אתה מקבל בחזרה — תמיד השתמש בו כשאתה חוקר טבלה לא מוכרת. `SELECT * FROM users LIMIT 10` בטוח. `SELECT * FROM users` על טבלה בת 10 מיליון שורות תקרוס את הכלי שלך.',
        concepts: [
          'SELECT cols FROM table WHERE condition — the most used SQL pattern',
          '= exact match; != not equal; > < >= <= for numbers and dates',
          "LIKE '%word%' — pattern matching (% = any characters)",
          'IN (val1, val2) — matches any value in the list',
          'IS NULL / IS NOT NULL — NULL requires special syntax, not = NULL',
          'LIMIT n — always add when exploring; prevents accidental full-table scans',
          'ORDER BY col ASC/DESC — sort results (default is unordered)',
        ],
        conceptsHe: [
          'SELECT עמודות FROM טבלה WHERE תנאי — תבנית ה-SQL הנפוצה ביותר',
          '= התאמה מדויקת; != לא שווה; > < >= <= למספרים ותאריכים',
          "LIKE '%מילה%' — התאמת תבנית (% = כל תווים)",
          'IN (ערך1, ערך2) — מתאים לכל ערך ברשימה',
          'IS NULL / IS NOT NULL — NULL דורש תחביר מיוחד, לא = NULL',
          'LIMIT n — תמיד הוסף כשחוקר; מונע סריקות טבלה מלאה מקריות',
          'ORDER BY עמודה ASC/DESC — מיין תוצאות (ברירת מחדל היא ללא סדר)',
        ],
        snippets: [
          {
            label: 'Real QA queries using WHERE',
            labelHe: 'שאילתות QA אמיתיות עם WHERE',
            language: 'sql',
            code: `-- Find all failed orders
SELECT id, user_id, total, created_at
FROM orders
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 50;

-- Find users with no email (data integrity bug)
SELECT id, name, created_at
FROM users
WHERE email IS NULL;

-- Find orders in a price range
SELECT * FROM orders
WHERE total BETWEEN 100 AND 500;

-- Find users with gmail or yahoo
SELECT id, email FROM users
WHERE email LIKE '%@gmail.com'
   OR email LIKE '%@yahoo.com';

-- Find specific user IDs
SELECT * FROM users
WHERE id IN (101, 202, 303);`,
          },
        ],
      },
      {
        id: 'and-or-order',
        type: 'lesson',
        title: 'AND / OR · ORDER BY · CASE',
        titleHe: 'AND / OR · ORDER BY · CASE',
        level: 'Beginner',
        minutes: 15,
        summary: 'Combine multiple conditions, sort results, and map values with CASE expressions.',
        summaryHe: 'שלב תנאים מרובים, מיין תוצאות, ומפה ערכים עם ביטויי CASE.',
        body: "AND narrows results — both conditions must be true. OR broadens results — either condition can be true. Think of it like a search filter on a job site: \"I want jobs that are (remote AND senior-level)\" is AND. \"I want jobs that are (in Tel Aviv OR remote)\" is OR. When you mix both in one query, use parentheses to be explicit about the grouping — otherwise SQL's operator precedence can surprise you (AND binds tighter than OR).\n\nORDER BY sorts your results. `ORDER BY created_at DESC` gives you the newest records first — essential for QA debugging: \"show me the last 20 orders sorted by date\". You can sort by multiple columns: `ORDER BY status, created_at DESC` groups by status first, then sorts within each group by date. Without ORDER BY, the database may return rows in any order — never assume a specific order.\n\nCASE is SQL's if-then-else. It lets you create a computed column in your query output. For example, you can turn a numeric status code into a human-readable label: `CASE WHEN status = 0 THEN 'pending' WHEN status = 1 THEN 'active' ELSE 'unknown' END`. This is extremely useful in QA reports where you want readable data without changing the database.\n\nA common QA pattern: find high-priority open bugs sorted by age. This combines AND (status = open AND priority = high), ORDER BY (created_at ASC — oldest first, to find forgotten bugs), and sometimes CASE to label severity levels.",
        bodyHe:
          'AND מצמצם תוצאות — שני התנאים חייבים להיות נכונים. OR מרחיב תוצאות — כל אחד מהתנאים יכול להיות נכון. חשוב על זה כמו פילטר חיפוש באתר עבודה: "אני רוצה משרות שהן (מרחוק AND רמה בכירה)" הוא AND. "אני רוצה משרות שהן (בתל אביב OR מרחוק)" הוא OR. כאשר מערבבים את שניהם בשאילתה אחת, השתמש בסוגריים כדי להיות מפורש לגבי הקיבוץ.\n\nORDER BY ממיין את התוצאות שלך. `ORDER BY created_at DESC` נותן לך את הרשומות החדשות ביותר קודם — חיוני לניפוי שגיאות QA: "הראה לי 20 ההזמנות האחרונות ממוינות לפי תאריך". ניתן למיין לפי עמודות מרובות. ללא ORDER BY, מסד הנתונים עשוי להחזיר שורות בכל סדר — לעולם אל תניח סדר ספציפי.\n\nCASE הוא if-then-else של SQL. הוא מאפשר ליצור עמודה מחושבת בפלט השאילתה שלך. לדוגמה, ניתן להפוך קוד סטטוס מספרי לתווית קריאה לאדם. זה שימושי מאוד בדוחות QA שבהם אתה רוצה נתונים קריאים מבלי לשנות את מסד הנתונים.\n\nתבנית QA נפוצה: מצא באגים פתוחים בעדיפות גבוהה ממוינים לפי גיל. זה משלב AND (status = open AND priority = high), ORDER BY (created_at ASC — הישנים ביותר קודם, כדי למצוא באגים שנשכחו), ולפעמים CASE לתיוג רמות חומרה.',
        concepts: [
          'AND: both conditions must be true (narrows results)',
          'OR: either condition is true (broadens results)',
          'Parentheses: use () when mixing AND and OR to control grouping',
          'AND binds tighter than OR — (a OR b AND c) = (a OR (b AND c))',
          'ORDER BY col DESC: newest/largest first; ASC: oldest/smallest first',
          'Multiple ORDER BY: ORDER BY status, created_at DESC sorts within groups',
          'CASE WHEN ... THEN ... ELSE ... END: conditional computed column',
        ],
        conceptsHe: [
          'AND: שני התנאים חייבים להיות נכונים (מצמצם תוצאות)',
          'OR: כל אחד מהתנאים נכון (מרחיב תוצאות)',
          'סוגריים: השתמש ב-() כשמערבבים AND ו-OR לשליטה בקיבוץ',
          'AND קושר חזק יותר מ-OR — (a OR b AND c) = (a OR (b AND c))',
          'ORDER BY עמודה DESC: החדש/גדול ביותר קודם; ASC: הישן/קטן ביותר קודם',
          'ORDER BY מרובים: ORDER BY status, created_at DESC ממיין בתוך קבוצות',
          'CASE WHEN ... THEN ... ELSE ... END: עמודה מחושבת מותנית',
        ],
        snippets: [
          {
            label: 'AND / OR / ORDER BY / CASE examples',
            labelHe: 'דוגמאות AND / OR / ORDER BY / CASE',
            language: 'sql',
            code: `-- AND: failed orders with high value
SELECT id, total, status, created_at
FROM orders
WHERE status = 'failed'
  AND total > 1000
ORDER BY created_at DESC;

-- OR with parentheses: urgent or recent
SELECT * FROM orders
WHERE (status = 'failed' AND total > 500)
   OR created_at > NOW() - INTERVAL '1 hour';

-- CASE: readable status labels
SELECT
  id,
  total,
  CASE
    WHEN status = 'pending'   THEN '⏳ Pending'
    WHEN status = 'completed' THEN '✅ Done'
    WHEN status = 'failed'    THEN '❌ Failed'
    ELSE '❓ Unknown'
  END AS status_label
FROM orders
ORDER BY created_at DESC
LIMIT 20;`,
          },
        ],
      },
      {
        id: 'group-having',
        type: 'lesson',
        title: 'GROUP BY + HAVING',
        titleHe: 'GROUP BY + HAVING',
        level: 'Intermediate',
        minutes: 12,
        summary:
          'Aggregate rows into groups and filter groups with HAVING — essential for QA data analysis.',
        summaryHe: 'צבור שורות לקבוצות וסנן קבוצות עם HAVING — חיוני לניתוח נתוני QA.',
        body: 'GROUP BY is like sorting mail into piles — one pile per sender. Instead of looking at each letter individually, you count how many letters came from each person. In SQL: instead of looking at each order row, you count how many orders each user placed. Aggregate functions like COUNT(), SUM(), AVG(), MAX(), MIN() work on each group.\n\nThe key difference between WHERE and HAVING: WHERE filters individual rows before grouping, HAVING filters groups after grouping. Think of it as a two-stage filter. WHERE removes individual items before you sort them into piles. HAVING removes entire piles that don\'t meet your criteria.\n\nA powerful QA use case: find users who have more than 5 failed login attempts in the last hour. This is a data-level security validation — you GROUP BY user_id, COUNT the attempts, and HAVING COUNT > 5. You cannot do this with just WHERE because WHERE operates on individual rows, not groups.\n\nCommon aggregate functions for QA: `COUNT(*)` counts all rows in a group, `COUNT(DISTINCT col)` counts unique values, `SUM(col)` adds up a numeric column (total revenue per user), `AVG(col)` calculates average, `MAX(col)` and `MIN(col)` find extremes. All of these are useful for data validation: "does the sum of line items equal the order total?" is a real QA check.',
        bodyHe:
          'GROUP BY הוא כמו מיון דואר לערמות — ערמה אחת לכל שולח. במקום להסתכל על כל מכתב בנפרד, אתה סופר כמה מכתבים הגיעו מכל אדם. ב-SQL: במקום להסתכל על כל שורת הזמנה, אתה סופר כמה הזמנות כל משתמש ביצע. פונקציות צבירה כמו COUNT(), SUM(), AVG(), MAX(), MIN() פועלות על כל קבוצה.\n\nההבדל המרכזי בין WHERE ל-HAVING: WHERE מסנן שורות בודדות לפני הקיבוץ, HAVING מסנן קבוצות אחרי הקיבוץ. חשוב על זה כמסנן דו-שלבי. WHERE מסיר פריטים בודדים לפני שאתה ממיין אותם לערמות. HAVING מסיר ערמות שלמות שאינן עומדות בקריטריונים שלך.\n\nמקרה שימוש עוצמתי ל-QA: מצא משתמשים שיש להם יותר מ-5 ניסיונות כניסה כושלים בשעה האחרונה. אי אפשר לעשות זאת רק עם WHERE כי WHERE פועל על שורות בודדות, לא על קבוצות.\n\nפונקציות צבירה נפוצות ל-QA: `COUNT(*)` סופר את כל השורות בקבוצה, `COUNT(DISTINCT עמודה)` סופר ערכים ייחודיים, `SUM(עמודה)` מסכם עמודה מספרית, `AVG(עמודה)` מחשב ממוצע, `MAX(עמודה)` ו-`MIN(עמודה)` מוצאים קצוות.',
        concepts: [
          'GROUP BY: collapses rows into groups — one row per unique value in the grouped column',
          'COUNT(*): counts rows; COUNT(DISTINCT col): counts unique values',
          'SUM() / AVG() / MAX() / MIN(): aggregate functions on each group',
          'WHERE filters rows BEFORE grouping; HAVING filters groups AFTER grouping',
          'HAVING can use aggregate functions; WHERE cannot',
          'QA use: GROUP BY user_id HAVING COUNT(*) > 5 to find power users or spammers',
          'Always pair GROUP BY with an aggregate — otherwise result is undefined',
        ],
        conceptsHe: [
          'GROUP BY: מכווץ שורות לקבוצות — שורה אחת לכל ערך ייחודי בעמודה המקובצת',
          'COUNT(*): סופר שורות; COUNT(DISTINCT עמודה): סופר ערכים ייחודיים',
          'SUM() / AVG() / MAX() / MIN(): פונקציות צבירה על כל קבוצה',
          'WHERE מסנן שורות לפני הקיבוץ; HAVING מסנן קבוצות אחרי הקיבוץ',
          'HAVING יכול להשתמש בפונקציות צבירה; WHERE לא יכול',
          'שימוש ב-QA: GROUP BY user_id HAVING COUNT(*) > 5 למציאת משתמשים כבדים',
          'תמיד שלב GROUP BY עם צבירה — אחרת התוצאה לא מוגדרת',
        ],
        snippets: [
          {
            label: 'GROUP BY + HAVING examples',
            labelHe: 'דוגמאות GROUP BY + HAVING',
            language: 'sql',
            code: `-- Count orders per user
SELECT user_id, COUNT(*) AS order_count, SUM(total) AS total_spent
FROM orders
GROUP BY user_id
ORDER BY order_count DESC;

-- Users with more than 5 orders (power users)
SELECT user_id, COUNT(*) AS order_count
FROM orders
GROUP BY user_id
HAVING COUNT(*) > 5;

-- Detect brute-force: users with > 5 failed logins in last hour
SELECT user_id, COUNT(*) AS failed_attempts
FROM login_events
WHERE status = 'failed'
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY user_id
HAVING COUNT(*) > 5
ORDER BY failed_attempts DESC;`,
          },
        ],
      },
      {
        id: 'joins',
        type: 'lesson',
        title: 'JOINs + EXISTS',
        titleHe: 'JOINs + EXISTS',
        level: 'Intermediate',
        minutes: 15,
        summary:
          'Combine data from multiple tables with JOINs and find or exclude rows with EXISTS.',
        summaryHe: 'שלב נתונים מטבלאות מרובות עם JOINs ומצא או אל תכלול שורות עם EXISTS.',
        body: 'Most real-world data lives across multiple tables. An order has a user_id — to see the user\'s email alongside the order, you need a JOIN. Think of JOIN as a zipper — it connects rows from two tables based on a matching column (usually a foreign key). Without JOIN, you would need to run two separate queries and manually match the results.\n\nINNER JOIN returns only rows that have a match in both tables. If an order has a user_id that does not exist in the users table, that order is excluded. This is the most common JOIN. LEFT JOIN returns all rows from the left table, and matching rows from the right table. If there is no match, the right side columns are NULL. This is useful for finding "orphaned" records — orders that have no corresponding user (data integrity bug).\n\nRIGHT JOIN is the mirror of LEFT JOIN (all rows from right, matching from left) — rarely used; most developers rewrite it as a LEFT JOIN. FULL OUTER JOIN returns all rows from both tables, with NULL where there is no match — useful for comparing two datasets to find what exists in one but not the other.\n\nEXISTS is a subquery-based check: "does any row in this subquery match?" It is often faster than JOIN when you only need to know if a match exists (not what the matched row contains). `WHERE EXISTS (SELECT 1 FROM orders WHERE orders.user_id = users.id)` finds all users who have at least one order. `WHERE NOT EXISTS` finds all users who have never placed an order.',
        bodyHe:
          'רוב הנתונים האמיתיים חיים על פני טבלאות מרובות. להזמנה יש user_id — כדי לראות את האימייל של המשתמש לצד ההזמנה, אתה צריך JOIN. חשוב על JOIN כמו רוכסן — הוא מחבר שורות משתי טבלאות על בסיס עמודה מתאימה (בדרך כלל מפתח זר). ללא JOIN, היית צריך להריץ שתי שאילתות נפרדות ולהתאים את התוצאות ידנית.\n\nINNER JOIN מחזיר רק שורות שיש להן התאמה בשתי הטבלאות. LEFT JOIN מחזיר את כל השורות מהטבלה השמאלית, ושורות מתאימות מהטבלה הימנית. אם אין התאמה, עמודות הצד הימני הן NULL. זה שימושי לאיתור רשומות "יתומות" — הזמנות שאין להן משתמש מתאים (באג שלמות נתונים).\n\nEXISTS היא בדיקה מבוססת שאילתת משנה: "האם שורה כלשהי בשאילתת המשנה הזו תואמת?" `WHERE EXISTS (SELECT 1 FROM orders WHERE orders.user_id = users.id)` מוצא את כל המשתמשים שיש להם לפחות הזמנה אחת. `WHERE NOT EXISTS` מוצא את כל המשתמשים שלעולם לא ביצעו הזמנה.',
        concepts: [
          'INNER JOIN: returns only rows with a match in BOTH tables',
          'LEFT JOIN: all rows from left + matching from right (NULL if no match)',
          'Use LEFT JOIN to find orphaned records (data integrity bugs)',
          'RIGHT JOIN / FULL OUTER JOIN: mirror or full combination of both sides',
          'JOIN ON: the condition that matches rows (usually FK = PK)',
          'EXISTS: true if subquery returns at least one row — often faster than JOIN',
          'NOT EXISTS: find rows with no matching record in another table',
        ],
        conceptsHe: [
          'INNER JOIN: מחזיר רק שורות עם התאמה בשתי הטבלאות',
          'LEFT JOIN: כל השורות משמאל + מתאימות מימין (NULL אם אין התאמה)',
          'השתמש ב-LEFT JOIN למציאת רשומות יתומות (באגי שלמות נתונים)',
          'RIGHT JOIN / FULL OUTER JOIN: מראה או שילוב מלא של שני הצדדים',
          'JOIN ON: התנאי שמתאים שורות (בדרך כלל FK = PK)',
          'EXISTS: נכון אם שאילתת המשנה מחזירה לפחות שורה אחת — לרוב מהיר יותר מ-JOIN',
          'NOT EXISTS: מצא שורות ללא רשומה מתאימה בטבלה אחרת',
        ],
        snippets: [
          {
            label: 'INNER JOIN, LEFT JOIN, and EXISTS',
            labelHe: 'INNER JOIN, LEFT JOIN ו-EXISTS',
            language: 'sql',
            code: `-- INNER JOIN: orders with user details
SELECT o.id AS order_id, u.email, o.total, o.status
FROM orders o
INNER JOIN users u ON o.user_id = u.id
WHERE o.status = 'failed'
ORDER BY o.created_at DESC;

-- LEFT JOIN: find orders with no matching user (data integrity bug!)
SELECT o.id, o.user_id, o.total
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
WHERE u.id IS NULL;

-- EXISTS: users who have placed at least one order
SELECT id, email
FROM users u
WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id
);

-- NOT EXISTS: users who have NEVER ordered
SELECT id, email, created_at
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id
)
ORDER BY created_at DESC;`,
          },
        ],
      },
      {
        id: 'sql-qa-queries',
        type: 'lesson',
        title: 'Real-World QA SQL Queries',
        titleHe: 'שאילתות SQL QA מהחיים האמיתיים',
        level: 'Intermediate',
        minutes: 15,
        summary:
          'A collection of battle-tested SQL patterns every QA engineer uses in their daily work.',
        summaryHe: 'אוסף תבניות SQL מוכחות שכל מהנדס QA משתמש בהן בעבודה היומיומית שלו.',
        body: "After learning the building blocks, it is time to see real-world patterns that QA engineers use every day. These are the queries you reach for when you suspect a data bug, after running a migration, or when investigating a production incident.\n\nDuplicate detection is one of the most common QA queries. Users should have unique emails — but did a race condition create two accounts with the same email? `GROUP BY email HAVING COUNT(*) > 1` finds them instantly. Row count validation is essential for migrations: count rows before, run the migration, count after. A migration that was supposed to be idempotent should show the same count. Any discrepancy is a bug.\n\nStale data hunting: `WHERE updated_at < NOW() - INTERVAL '30 days'` finds records that have not been touched in a month — useful for detecting records stuck in a processing state. NULL hunting in required fields is another constant task: `WHERE phone IS NULL AND subscription = 'premium'` finds premium users who somehow have no phone number — that should be impossible per business rules.\n\nBefore-after comparison is critical for any database migration or ETL job. Take a snapshot of key metrics (row counts, sums) before, run the job, and compare after. Any unexpected difference is an immediate red flag. Building these QA queries into a pre/post-migration checklist is professional practice.",
        bodyHe:
          "לאחר לימוד אבני הבניין, הגיע הזמן לראות תבניות מהחיים האמיתיים שמהנדסי QA משתמשים בהן כל יום. אלה השאילתות שאתה מגיע אליהן כשאתה חושד בבאג נתונים, לאחר הרצת migration, או בעת חקירת תקרית ייצור.\n\nזיהוי כפילויות היא אחת משאילתות ה-QA הנפוצות ביותר. למשתמשים צריכים להיות אימיילים ייחודיים — אבל האם מצב תחרות יצר שני חשבונות עם אותו אימייל? `GROUP BY email HAVING COUNT(*) > 1` מוצא אותם מיידית. אימות מספר שורות חיוני עבור migrations: ספור שורות לפני, הרץ את ה-migration, ספור אחרי.\n\nציד נתונים ישנים: `WHERE updated_at < NOW() - INTERVAL '30 days'` מוצא רשומות שלא נגעו בהן במשך חודש — שימושי לגילוי רשומות תקועות במצב עיבוד. ציד NULL בשדות נדרשים הוא משימה קבועה נוספת: `WHERE phone IS NULL AND subscription = 'premium'` מוצא משתמשים פרימיום שאין להם מספר טלפון — זה אמור להיות בלתי אפשרי על פי כללי העסק.",
        concepts: [
          'Duplicate detection: GROUP BY col HAVING COUNT(*) > 1',
          'Row count validation: count before and after migration — any delta is a bug',
          "Stale data: WHERE updated_at < NOW() - INTERVAL '30 days'",
          'NULL in required fields: WHERE required_col IS NULL — data integrity violation',
          'Orphaned records: LEFT JOIN + WHERE right.id IS NULL',
          'Before/after migration: snapshot key metrics before → compare after',
          "These patterns belong in every QA engineer's personal SQL library",
        ],
        conceptsHe: [
          'זיהוי כפילויות: GROUP BY עמודה HAVING COUNT(*) > 1',
          'אימות מספר שורות: ספור לפני ואחרי migration — כל הפרש הוא באג',
          "נתונים ישנים: WHERE updated_at < NOW() - INTERVAL '30 days'",
          'NULL בשדות נדרשים: WHERE עמודה_נדרשת IS NULL — הפרת שלמות נתונים',
          'רשומות יתומות: LEFT JOIN + WHERE right.id IS NULL',
          'לפני/אחרי migration: צלם מדדים מרכזיים לפני → השווה אחרי',
          'תבניות אלה שייכות לספריית ה-SQL האישית של כל מהנדס QA',
        ],
        snippets: [
          {
            label: '6 battle-tested QA SQL queries',
            labelHe: '6 שאילתות SQL QA מוכחות',
            language: 'sql',
            code: `-- 1. Find duplicate emails
SELECT email, COUNT(*) AS cnt
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- 2. Row count before/after migration
SELECT COUNT(*) AS total_orders FROM orders;  -- run before
-- ... run migration ...
SELECT COUNT(*) AS total_orders FROM orders;  -- run after, compare

-- 3. Stale pending orders (stuck > 2 days)
SELECT id, user_id, total, created_at
FROM orders
WHERE status = 'pending'
  AND created_at < NOW() - INTERVAL '2 days';

-- 4. Premium users missing phone number
SELECT id, email, subscription
FROM users
WHERE subscription = 'premium'
  AND phone IS NULL;

-- 5. Orders with no product lines (ghost orders)
SELECT o.id, o.total, o.created_at
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE oi.id IS NULL;

-- 6. Sum validation: total should match sum of items
SELECT
  o.id,
  o.total AS order_total,
  SUM(oi.price * oi.qty) AS calculated_total,
  o.total - SUM(oi.price * oi.qty) AS discrepancy
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, o.total
HAVING ABS(o.total - SUM(oi.price * oi.qty)) > 0.01;`,
          },
        ],
      },
      {
        id: 'sql-practice',
        type: 'practice',
        title: 'Practice: SQL Queries',
        titleHe: 'תרגול: שאילתות SQL',
        minutes: 25,
        practiceDesc: 'Write real QA queries against a sample users / orders / products schema.',
        practiceDescHe: 'כתוב שאילתות QA אמיתיות על סכמת דוגמה של users / orders / products.',
        practiceItems: [
          'Write a query to find all users who registered in the last 7 days',
          'Write a query to find orders with status "failed" and total > $500, sorted newest first',
          'Write a query to find all users with a NULL email address',
          'Write a query to count orders per user and find users with more than 10 orders',
          "Write a JOIN query to show each order with the user's email",
          'Write a query to detect duplicate emails in the users table',
        ],
        practiceItemsHe: [
          'כתוב שאילתה למציאת כל המשתמשים שנרשמו ב-7 הימים האחרונים',
          'כתוב שאילתה למציאת הזמנות עם סטטוס "failed" וסכום > $500, ממוין החדש ביותר קודם',
          'כתוב שאילתה למציאת כל המשתמשים עם כתובת אימייל NULL',
          'כתוב שאילתה לספירת הזמנות לכל משתמש ומציאת משתמשים עם יותר מ-10 הזמנות',
          'כתוב שאילתת JOIN להצגת כל הזמנה עם האימייל של המשתמש',
          'כתוב שאילתה לגילוי אימיילים כפולים בטבלת users',
        ],
      },
    ],
  },
  {
    id: 'enrichment',
    title: 'Enrichment — AI, DevOps & Security',
    titleHe: 'העשרה — AI, DevOps ואבטחה',
    icon: '🧠',
    sections: [
      {
        id: 'ai-testing',
        type: 'lesson',
        title: 'AI for Testing with Claude',
        titleHe: 'AI לבדיקות עם Claude',
        level: 'Advanced',
        minutes: 10,
        summary:
          'Use AI as a force multiplier for QA work — generating test cases, writing SQL, and explaining code.',
        summaryHe: 'השתמש ב-AI כמכפיל כוח לעבודת QA — יצירת תרחישי בדיקה, כתיבת SQL והסברת קוד.',
        body: 'Think of Claude as a junior QA teammate who never gets tired, knows every testing framework, and can draft a test plan in 30 seconds. The key difference from a human: Claude can be wrong. It "hallucinates" — generates plausible-sounding but incorrect content. Your job is to use AI to go 5× faster, then verify the output before trusting it.\n\nThe most powerful QA use cases for AI: generating test cases from requirements ("given this user story, list 10 edge cases"), writing Playwright selectors for a pasted HTML snippet, explaining a confusing SQL query, translating manual test steps into Playwright code, writing k6 load test scripts, and generating test data. For any of these, the AI draft saves 80% of the time; your review catches errors.\n\nPrompt engineering matters. A vague prompt gives a vague answer. A specific, context-rich prompt gives a specific, useful answer. For QA, always include: the system under test (what it does), the testing framework you are using, and what output format you want. Ask for edge cases explicitly — AI defaults to happy-path examples.\n\nImportant limits: never paste production data (PII, tokens, passwords) into an AI tool. Always run generated tests — a test that looks correct but has the wrong assertion will pass and give you false confidence. Treat AI output as a first draft, not a final answer.',
        bodyHe:
          'חשוב על Claude כעמית QA זוטר שלעולם לא עייף, יודע כל מסגרת בדיקות, ויכול לנסח תוכנית בדיקה תוך 30 שניות. ההבדל המרכזי מאדם: Claude יכול לטעות. הוא "מהזה" — מייצר תוכן הנשמע סביר אך שגוי. עבודתך היא להשתמש ב-AI כדי לנוע מהר פי 5, ואז לאמת את הפלט לפני שאתה סומך עליו.\n\nמקרי השימוש החזקים ביותר של QA ל-AI: יצירת תרחישי בדיקה מדרישות ("בהינתן סיפור משתמש זה, רשום 10 מקרי קצה"), כתיבת selectors של Playwright לקטע HTML מודבק, הסברת שאילתת SQL מבלבלת, תרגום שלבי בדיקה ידניים לקוד Playwright, כתיבת סקריפטי בדיקות עומסים k6, ויצירת נתוני בדיקה.\n\nהנדסת prompt חשובה. prompt מעורפל נותן תשובה מעורפלת. prompt ספציפי ועשיר בהקשר נותן תשובה ספציפית ושימושית. ל-QA, תמיד כלול: המערכת הנבדקת (מה היא עושה), מסגרת הבדיקות שאתה משתמש בה, ואיזה פורמט פלט אתה רוצה. בקש מקרי קצה במפורש — AI עובר כברירת מחדל לדוגמאות של המסלול המאושר.\n\nמגבלות חשובות: לעולם אל תדביק נתוני ייצור (PII, טוקנים, סיסמאות) לכלי AI. תמיד הרץ בדיקות שנוצרו — בדיקה שנראית נכונה אך יש לה אסרציה שגויה תעבור ותיתן לך ביטחון כוזב.',
        concepts: [
          'AI = force multiplier, not replacement — you verify everything it generates',
          'Hallucination: AI generates plausible but wrong content — always run the tests',
          'Use cases: generate test cases, write selectors, explain SQL, draft test data',
          'Prompt engineering: be specific — include system, framework, and output format',
          'Always ask for edge cases explicitly — AI defaults to happy-path examples',
          'Never paste PII, tokens, or passwords into AI tools',
          'Treat AI output as a first draft — 80% time saved + your review = final quality',
        ],
        conceptsHe: [
          'AI = מכפיל כוח, לא החלפה — אתה מאמת הכל שהוא מייצר',
          'הזיה: AI מייצר תוכן סביר אך שגוי — תמיד הרץ את הבדיקות',
          'מקרי שימוש: יצר תרחישי בדיקה, כתוב selectors, הסבר SQL, נסח נתוני בדיקה',
          'הנדסת prompt: היה ספציפי — כלול מערכת, מסגרת ופורמט פלט',
          'תמיד בקש מקרי קצה במפורש — AI עובר לדוגמאות מסלול מאושר',
          'לעולם אל תדביק PII, טוקנים או סיסמאות לכלי AI',
          'התייחס לפלט AI כטיוטה ראשונה — 80% זמן שנחסך + הבדיקה שלך = איכות סופית',
        ],
        snippets: [
          {
            label: 'Effective QA prompts for Claude',
            labelHe: 'prompts יעילים ל-QA עם Claude',
            language: 'markdown',
            code: `## Generate test cases
"I am testing a user registration form. Fields: email, password (min 8 chars),
confirm password. Using Playwright + TypeScript. List 10 edge case test scenarios,
include both positive and negative cases."

## Write a Playwright test
"Write a Playwright TypeScript test for this HTML button:
<button data-testid='submit-order'>Place Order</button>
Test: click the button, wait for the success message '.order-confirmed' to appear."

## Explain a SQL query
"Explain this SQL query in simple terms:
SELECT user_id, COUNT(*) FROM orders GROUP BY user_id HAVING COUNT(*) > 5;"

## Generate test data
"Generate 5 realistic fake user records as SQL INSERT statements
for a table with columns: id, name, email, phone, created_at"`,
          },
        ],
      },
      {
        id: 'devops-qa',
        type: 'lesson',
        title: 'DevOps for QA Engineers',
        titleHe: 'DevOps למהנדסי QA',
        level: 'Intermediate',
        minutes: 12,
        summary: 'Understand CI/CD pipelines and learn how to plug your tests into GitHub Actions.',
        summaryHe: 'הבן pipelines CI/CD ולמד כיצד לחבר את הבדיקות שלך ל-GitHub Actions.',
        body: 'DevOps is the practice of combining software development and IT operations to deliver software faster and more reliably. As a QA engineer, you are a key part of this pipeline — your tests are the quality gate between code and production. Understanding how CI/CD works makes you a better team member and lets you build more effective automation.\n\nA CI/CD pipeline works like an assembly line. A developer pushes code → CI (Continuous Integration) triggers automatically: it installs dependencies, builds the app, runs unit tests, runs integration tests, runs E2E tests. If any step fails, the pipeline stops and the developer is notified — the code does not proceed. CD (Continuous Delivery/Deployment) takes the passing build and deploys it to staging automatically, then optionally to production.\n\nQA engineers plug into this pipeline at two points: smoke tests run on every pull request (fast, 2-5 minutes — blocks bad code from merging), and full regression runs on merge to main (longer, 15-30 minutes — validates the complete feature set before deployment). Playwright generates HTML reports and trace files that are uploaded as CI artifacts — the team can download and inspect failures without re-running.\n\nGitHub Actions is the most popular CI system today. You define workflows in YAML files inside `.github/workflows/`. A workflow has triggers (when to run), jobs (what machine to use), and steps (the actual commands). The key for QA: the `actions/upload-artifact` step saves your Playwright report so you can view it even when the CI run is gone.',
        bodyHe:
          'DevOps הוא הפרקטיקה של שילוב פיתוח תוכנה ותפעול IT לאספקת תוכנה מהר יותר ובאופן אמין יותר. כמהנדס QA, אתה חלק מרכזי מה-pipeline הזה — הבדיקות שלך הן שער האיכות בין הקוד לייצור.\n\npipeline CI/CD עובד כמו פס ייצור. מפתח דוחף קוד → CI (אינטגרציה רציפה) מופעל אוטומטית: מתקין תלויות, בונה את האפליקציה, מריץ בדיקות יחידה, בדיקות אינטגרציה, בדיקות E2E. אם איזה שלב נכשל, ה-pipeline עוצר והמפתח מקבל הודעה — הקוד לא מתקדם. CD (מסירה/פריסה רציפה) לוקח את ה-build שעבר ופורס אותו ל-staging אוטומטית.\n\nמהנדסי QA מתחברים ל-pipeline הזה בשתי נקודות: בדיקות עשן רצות על כל pull request (מהירות, 2-5 דקות — חוסמות קוד גרוע ממיזוג), ורגרסיה מלאה רצה על מיזוג ל-main (ארוכה יותר, 15-30 דקות — מאמתת את ערכת התכונות המלאה לפני deployment).\n\nGitHub Actions הוא מערכת ה-CI הפופולרית ביותר כיום. מגדירים workflows בקבצי YAML בתוך `.github/workflows/`. ל-workflow יש triggers (מתי לרוץ), jobs (איזה מכונה להשתמש), וsteps (הפקודות בפועל).',
        concepts: [
          'CI: runs tests automatically on every push/PR — catches bugs before merge',
          'CD: automatically deploys passing builds to staging (and optionally production)',
          'QA smoke tests on PR: fast (2-5 min), blocks broken code from merging',
          'QA regression on main merge: full suite before deployment',
          'GitHub Actions: YAML workflows in .github/workflows/ define the pipeline',
          'upload-artifact: save Playwright report so failures are inspectable after the run',
          'Failed CI is a blocker — investigate before merging, never skip',
        ],
        conceptsHe: [
          'CI: מריץ בדיקות אוטומטית על כל push/PR — תופס באגים לפני מיזוג',
          'CD: פורס אוטומטית builds שעברו ל-staging (ואופציונלית לייצור)',
          'בדיקות עשן QA על PR: מהיר (2-5 דקות), חוסם קוד שבור ממיזוג',
          'רגרסיה של QA על מיזוג ל-main: חבילה מלאה לפני deployment',
          'GitHub Actions: workflows של YAML ב-.github/workflows/ מגדירים את ה-pipeline',
          'upload-artifact: שמור דוח Playwright כך שכשלים ניתנים לבדיקה לאחר הריצה',
          'CI נכשל הוא חוסם — חקור לפני מיזוג, לעולם אל תדלג',
        ],
        snippets: [
          {
            label: 'GitHub Actions workflow for Playwright',
            labelHe: 'GitHub Actions workflow ל-Playwright',
            language: 'yaml',
            code: `name: Playwright Tests

on:
  push:
    branches: [main]
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

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npx playwright test

      - name: Upload report
        if: always()   # upload even on failure
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7`,
          },
        ],
      },
      {
        id: 'security-testing',
        type: 'lesson',
        title: 'Cybersecurity Basics for Testers',
        titleHe: 'יסודות אבטחת סייבר לבודקים',
        level: 'Intermediate',
        minutes: 10,
        summary:
          'Learn OWASP Top 10 vulnerabilities and the basic security checks every QA engineer should perform.',
        summaryHe:
          'למד את 10 הפגיעויות המובילות של OWASP ובדיקות האבטחה הבסיסיות שכל מהנדס QA צריך לבצע.',
        body: "Security bugs are the most expensive bugs. A vulnerability found by your QA team costs an hour to fix. The same vulnerability found by a hacker can cost millions in fines, lawsuits, and reputation damage. QA engineers are the last line of defense before production — adding basic security checks to your test suite is professional practice.\n\nThe OWASP Top 10 is the authoritative list of the most critical web security risks. The ones most relevant to QA testers: Injection (SQL injection — does the app properly validate user input? Try `' OR 1=1 --` in a login form), Broken Authentication (can you access protected endpoints without a token? Can you reuse expired tokens?), Cross-Site Scripting/XSS (does the app execute JavaScript from user input? Try `<script>alert(1)</script>` in a search field), and Insecure Direct Object Reference/IDOR (can user A access user B's data by changing an ID in the URL?).\n\nBasic security checks every QA engineer should do: verify that error messages do not expose stack traces or internal paths (error pages should say \"something went wrong\", not dump the full Java exception), verify that the app returns 401/403 for protected endpoints when called without authentication, verify that input validation rejects obviously malicious input, and verify that user-uploaded files are restricted to expected types.\n\nTools: OWASP ZAP (free, open source) is an intercepting proxy that automatically scans your web app for common vulnerabilities. Burp Suite (commercial) is the industry standard for professional penetration testers. For QA, ZAP's automated scan is a good starting point — it finds low-hanging fruit in minutes.",
        bodyHe:
          'באגי אבטחה הם הבאגים היקרים ביותר. פגיעות שנמצאת על ידי צוות ה-QA שלך עולה שעה לתיקון. אותה פגיעות שנמצאת על ידי האקר יכולה לעלות מיליונים בקנסות, תביעות ונזק למוניטין. מהנדסי QA הם קו ההגנה האחרון לפני הייצור — הוספת בדיקות אבטחה בסיסיות לחבילת הבדיקות שלך היא פרקטיקה מקצועית.\n\nOWASP Top 10 הוא הרשימה הסמכותית של סיכוני אבטחת הווב הקריטיים ביותר. אלה הרלוונטיים ביותר לבודקי QA: Injection (SQL injection — האם האפליקציה מאמתת כראוי קלט משתמש?), Broken Authentication (האם ניתן לגשת לנקודות קצה מוגנות ללא טוקן? האם ניתן לעשות שימוש חוזר בטוקנים שפגו?), Cross-Site Scripting/XSS (האם האפליקציה מבצעת JavaScript מקלט משתמש?), ו-Insecure Direct Object Reference/IDOR (האם משתמש A יכול לגשת לנתוני משתמש B על ידי שינוי ID ב-URL?).\n\nבדיקות אבטחה בסיסיות שכל מהנדס QA צריך לבצע: אמת שהודעות שגיאה לא חושפות stack traces או נתיבים פנימיים, אמת שהאפליקציה מחזירה 401/403 לנקודות קצה מוגנות כשנקראות ללא אימות, אמת שאימות קלט דוחה קלט מזיק ברור, ואמת שקבצים שהועלו על ידי משתמשים מוגבלים לסוגים הצפויים.',
        concepts: [
          'OWASP Top 10: the 10 most critical web security vulnerabilities',
          "SQL Injection: unsanitized input executes SQL — try ' OR 1=1 -- in login",
          'XSS: app executes user-supplied JavaScript — try <script>alert(1)</script>',
          "IDOR: user changes ID in URL to access another user's data",
          'Broken Auth: protected endpoints reachable without token, or with expired token',
          'Error messages should never expose stack traces, file paths, or DB errors',
          'Tools: OWASP ZAP (free automated scan), Burp Suite (professional proxy)',
        ],
        conceptsHe: [
          'OWASP Top 10: 10 פגיעויות אבטחת הווב הקריטיות ביותר',
          "SQL Injection: קלט לא מטוהר מבצע SQL — נסה ' OR 1=1 -- בטופס כניסה",
          'XSS: אפליקציה מבצעת JavaScript מסופק משתמש — נסה <script>alert(1)</script>',
          'IDOR: משתמש משנה ID ב-URL כדי לגשת לנתוני משתמש אחר',
          'Broken Auth: נקודות קצה מוגנות נגישות ללא טוקן, או עם טוקן שפג',
          'הודעות שגיאה לעולם לא צריכות לחשוף stack traces, נתיבי קבצים, או שגיאות DB',
          'כלים: OWASP ZAP (סריקה אוטומטית חינמית), Burp Suite (proxy מקצועי)',
        ],
        snippets: [],
      },
      {
        id: 'enrichment-practice',
        type: 'practice',
        title: 'Practice: AI, DevOps & Security',
        titleHe: 'תרגול: AI, DevOps ואבטחה',
        minutes: 20,
        practiceDesc: 'Apply AI, CI/CD, and security concepts in hands-on tasks.',
        practiceDescHe: 'יישם מושגי AI, CI/CD ואבטחה במשימות מעשיות.',
        practiceItems: [
          'Write a Claude prompt to generate 10 edge case test scenarios for a password reset flow',
          'Write a GitHub Actions YAML step that runs "npx playwright test" and uploads the report as an artifact',
          'List 3 inputs you would try to test for SQL injection in a search field, and explain why each one is a test',
          'Describe what an IDOR vulnerability looks like in a URL and how you would test for it',
          'Write a Playwright test that verifies a protected endpoint returns 401 when called without an Authorization header',
        ],
        practiceItemsHe: [
          'כתוב prompt ל-Claude ליצירת 10 תרחישי בדיקה קצה לזרימת איפוס סיסמה',
          'כתוב שלב YAML של GitHub Actions שמריץ "npx playwright test" ומעלה את הדוח כ-artifact',
          'רשום 3 קלטים שהיית מנסה לבדוק עבור SQL injection בשדה חיפוש, והסבר מדוע כל אחד הוא בדיקה',
          'תאר כיצד נראית פגיעות IDOR ב-URL וכיצד היית בודק אותה',
          'כתוב בדיקת Playwright שמאמתת שנקודת קצה מוגנת מחזירה 401 כשנקראת ללא כותרת Authorization',
        ],
      },
    ],
  },
  {
    id: 'summary',
    title: 'Summary & Next Steps',
    titleHe: 'סיכום וצעדים הבאים',
    icon: '🏁',
    sections: [
      {
        id: 'interview-tips',
        type: 'tips',
        title: 'Tips for a Successful Interview',
        titleHe: 'טיפים לראיון מוצלח',
        minutes: 10,
        summary:
          'Prepare for QA job interviews with real questions, model answers, and portfolio advice.',
        summaryHe: 'התכונן לראיונות עבודה QA עם שאלות אמיתיות, תשובות לדוגמה וייעוץ לתיק עבודות.',
        body: 'Most QA interviews follow a predictable pattern. Prepare answers for these three questions and you will handle 80% of interviews: "Tell me about a bug you found that had real business impact" (have a specific story ready — not "I found a login bug" but "I found that the checkout flow allowed negative quantities, which would have cost us $X per occurrence"), "How do you decide what to automate?" (answer with the ROI framework and decision matrix from this course), and "Walk me through how you would test this feature" (structure your answer: positive cases → negative cases → edge cases → non-functional like performance and security).\n\nWhat interviewers actually evaluate beyond technical skills: curiosity (do you ask questions, or do you just follow instructions?), attention to detail (did you spot the inconsistency in the requirements?), and communication (can you explain a technical bug to a non-technical product manager?). These soft skills differentiate candidates with identical technical ability.\n\nYour portfolio is your strongest proof. Put a real Playwright test suite on GitHub — even if it only tests a public website. Write a README that explains what the tests cover and how to run them. Add a SQL file with some of your QA queries. A candidate who shows code beats a candidate who only talks about code every time.\n\nSalary negotiation: research the market range before the interview (LinkedIn Salary, Glassdoor, job postings). When asked about salary expectations, give a range based on your research. Do not accept the first offer without negotiating — a polite counter-offer is expected and respected in tech.',
        bodyHe:
          'רוב ראיונות ה-QA עוקבים אחר דפוס צפוי. הכן תשובות לשלוש שאלות אלה ותטפל ב-80% מהראיונות: "ספר לי על באג שמצאת שהיה לו השפעה עסקית אמיתית" (הכן סיפור ספציפי — לא "מצאתי באג כניסה" אלא "מצאתי שזרימת ה-checkout אפשרה כמויות שליליות"), "איך אתה מחליט מה לאוטמט?" (ענה עם מסגרת ה-ROI ומטריצת ההחלטה מהקורס הזה), ו"הדרך אותי דרך איך היית בודק תכונה זו" (בנה את תשובתך: מקרים חיוביים → שליליים → קצה → לא-פונקציונלי).\n\nמה מראיינים מעריכים בפועל: סקרנות, קשב לפרטים ותקשורת. מיומנויות אלה מבדילות מועמדים עם יכולת טכנית זהה.\n\nתיק העבודות שלך הוא ההוכחה החזקה ביותר שלך. שים חבילת בדיקות Playwright אמיתית ב-GitHub — גם אם היא רק בודקת אתר ציבורי. כתוב README שמסביר מה הבדיקות מכסות וכיצד להריץ אותן. הוסף קובץ SQL עם כמה מהשאילתות שלך. מועמד שמציג קוד מנצח מועמד שרק מדבר על קוד בכל פעם.',
        concepts: [
          'Prepare 3 answers: bug with business impact, what to automate, how to test a feature',
          'Structure feature test answer: positive → negative → edge → non-functional',
          'Interviewers assess: curiosity, attention to detail, communication',
          'Portfolio: Playwright test suite on GitHub + README + SQL query examples',
          'A working code example beats "I have experience with Playwright" every time',
          'Research salary range before the interview; politely counter-offer',
          'Red flags in companies: no QA process, no test environment, "we test in production"',
        ],
        conceptsHe: [
          'הכן 3 תשובות: באג עם השפעה עסקית, מה לאוטמט, כיצד לבדוק תכונה',
          'בנה תשובת בדיקת תכונה: חיובי → שלילי → קצה → לא-פונקציונלי',
          'מראיינים מעריכים: סקרנות, קשב לפרטים, תקשורת',
          'תיק עבודות: חבילת בדיקות Playwright ב-GitHub + README + דוגמאות שאילתות SQL',
          'דוגמת קוד עובדת מנצחת "יש לי ניסיון עם Playwright" בכל פעם',
          'חקור טווח שכר לפני הראיון; הצע נגד בנימוס',
          'דגלים אדומים בחברות: אין תהליך QA, אין סביבת בדיקות, "אנו בודקים בייצור"',
        ],
        snippets: [],
      },
      {
        id: 'learning-summary',
        type: 'summary',
        title: 'Learning Summary',
        titleHe: 'סיכום הלמידה',
        summary: 'What you learned, what to build next, and your 30-day action plan.',
        summaryHe: 'מה למדת, מה לבנות הלאה, ותוכנית הפעולה ל-30 יום שלך.',
        body: "You have completed the full SQA course. Let's recap what you now know: the testing pyramid and when to use each layer; automation testing with Playwright — locators, POM, fixtures, CI integration; API testing with Playwright's request fixture and Postman/Newman; load and performance testing concepts with k6; hardware and IoT testing strategies; SQL from the first SELECT all the way to complex JOINs, GROUP BY, and real QA query patterns; AI-assisted testing with Claude; DevOps pipeline integration with GitHub Actions; and cybersecurity basics from the OWASP Top 10.\n\nWhat to build next: pick a real public website and write a Playwright test suite for it. Choose something you use daily — a to-do app, a weather site, a public API like JSONPlaceholder. Write at least 10 tests covering different scenarios. Organize them with POM. Add them to GitHub with a README. Then run them in GitHub Actions on every push. This single project will stand out in your portfolio more than any certificate.\n\nYour 30-day action plan: Days 1-7: review the Playwright lessons and set up your first project locally. Days 8-14: write 10 tests using POM and run them in CI. Days 15-21: add API tests and SQL queries to the same project. Days 22-28: add a k6 load test and a security check. Day 29-30: write the README, push to GitHub, and send the link to 3 potential employers or mentors for feedback.\n\nRecommended resources to continue: the official Playwright documentation (playwright.dev) is excellent. OWASP's free learning resources for security. k6's documentation for load testing. testautomationu.com for free video courses. And always: practice more than you read.",
        bodyHe:
          'סיימת את קורס ה-SQA המלא. בוא נסכם מה אתה יודע עכשיו: פירמידת הבדיקות ומתי להשתמש בכל שכבה; אוטומציית בדיקות עם Playwright — locators, POM, fixtures, אינטגרציית CI; בדיקות API עם ה-request fixture של Playwright ו-Postman/Newman; מושגי בדיקות עומסים וביצועים עם k6; אסטרטגיות בדיקת חומרה ו-IoT; SQL מה-SELECT הראשון ועד JOINs מורכבים, GROUP BY ותבניות שאילתות QA אמיתיות; בדיקות בסיוע AI עם Claude; אינטגרציית pipeline DevOps עם GitHub Actions; ויסודות אבטחת סייבר מ-OWASP Top 10.\n\nמה לבנות הלאה: בחר אתר ציבורי אמיתי וכתוב עבורו חבילת בדיקות Playwright. בחר משהו שאתה משתמש בו מדי יום. כתוב לפחות 10 בדיקות המכסות תרחישים שונים. ארגן אותן עם POM. הוסף אותן ל-GitHub עם README. אז הרץ אותן ב-GitHub Actions על כל push. פרויקט בודד זה יבלוט בתיק העבודות שלך יותר מכל תעודה.\n\nתוכנית הפעולה ל-30 יום: ימים 1-7: עבור על שיעורי Playwright והגדר את הפרויקט הראשון שלך מקומית. ימים 8-14: כתוב 10 בדיקות עם POM והרץ אותן ב-CI. ימים 15-21: הוסף בדיקות API ושאילתות SQL. ימים 22-28: הוסף בדיקת עומסים k6 ובדיקת אבטחה. ימים 29-30: כתוב את ה-README, דחוף ל-GitHub, ושלח את הקישור ל-3 מעסיקים פוטנציאליים או מנטורים.',
        concepts: [
          'Completed: testing pyramid, Playwright E2E, API testing, load testing, IoT, SQL, AI, DevOps, security',
          'Next step: build a real test suite for a public website — 10+ tests, POM, CI',
          'Days 1-7: set up Playwright project locally, write first tests',
          'Days 8-14: full POM structure, 10 tests in CI via GitHub Actions',
          'Days 15-21: add API tests + SQL query examples to the same project',
          'Days 22-28: add k6 load test + one security check test',
          'Days 29-30: write README, push to GitHub, share with 3 people for feedback',
        ],
        conceptsHe: [
          'הושלם: פירמידת בדיקות, Playwright E2E, בדיקות API, בדיקות עומסים, IoT, SQL, AI, DevOps, אבטחה',
          'הצעד הבא: בנה חבילת בדיקות אמיתית לאתר ציבורי — 10+ בדיקות, POM, CI',
          'ימים 1-7: הגדר פרויקט Playwright מקומית, כתוב בדיקות ראשונות',
          'ימים 8-14: מבנה POM מלא, 10 בדיקות ב-CI דרך GitHub Actions',
          'ימים 15-21: הוסף בדיקות API + דוגמאות שאילתות SQL לאותו פרויקט',
          'ימים 22-28: הוסף בדיקת עומסים k6 + בדיקת אבטחה אחת',
          'ימים 29-30: כתוב README, דחוף ל-GitHub, שתף עם 3 אנשים למשוב',
        ],
        snippets: [],
      },
    ],
  },
];
