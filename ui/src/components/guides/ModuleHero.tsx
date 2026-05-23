import type { GuideModule } from '../../data/guidesData';

interface ModuleHeroProps {
  module: GuideModule;
  totalSections: number;
  isHe: boolean;
  onStart: () => void;
}

const MODULE_META: Record<
  string,
  {
    subtitle: string;
    subtitleHe: string;
    desc: string;
    descHe: string;
    objectives: string[];
    objectivesHe: string[];
    duration: string;
  }
> = {
  welcome: {
    subtitle: 'Module 1 — Foundations',
    subtitleHe: 'מודול 1 — יסודות',
    desc: 'Learn QA Automation from the ground up — from the testing pyramid to writing your first Playwright test, with real-world analogies.',
    descHe:
      'למד QA אוטומציה מהבסיס — מפירמידת הבדיקות ועד לכתיבת הבדיקה הראשונה שלך עם Playwright, עם דוגמאות מהחיים האמיתיים.',
    objectives: [
      'Understand what QA Automation is and why it matters',
      'Identify the 3 testing pyramid layers',
      'Decide when to automate — and when not to',
      'Install Playwright and run your first test',
      'Understand the bug lifecycle: New → Closed',
    ],
    objectivesHe: [
      'הבן מהי QA אוטומציה ולמה היא קריטית',
      'זהה את שלושת שכבות פירמידת הבדיקות',
      'החלט מתי לאוטמט — ומתי לא',
      'התקן Playwright והרץ את הבדיקה הראשונה',
      'הבן את מחזור חיי הבאג: New → Closed',
    ],
    duration: '18 min',
  },
  automation: {
    subtitle: 'Module 2 — Automation',
    subtitleHe: 'מודול 2 — אוטומציה',
    desc: 'Master Playwright locators, Page Object Model, and writing resilient tests that survive UI changes.',
    descHe:
      'שלוט ב-locators של Playwright, Page Object Model, וכתיבת בדיקות עמידות שממשיכות לעבוד אחרי שינויי UI.',
    objectives: [
      'Use all 5 Playwright locator types correctly',
      'Build a Page Object Model from scratch',
      'Write your first real login test',
      'Use the Playwright trace viewer for debugging',
    ],
    objectivesHe: [
      'השתמש בכל 5 סוגי ה-locators של Playwright',
      'בנה Page Object Model מאפס',
      'כתוב את בדיקת הלוגין הראשונה שלך',
      'השתמש ב-trace viewer לניפוי שגיאות',
    ],
    duration: '72 min',
  },
  api: {
    subtitle: 'Module 3 — API Testing',
    subtitleHe: 'מודול 3 — בדיקות API',
    desc: 'Test REST APIs directly with Playwright request fixture and Postman — 10× faster than UI tests.',
    descHe: 'בדוק REST APIs ישירות עם Playwright request ו-Postman — פי 10 מהיר מבדיקות UI.',
    objectives: [
      'Test GET, POST, PUT, DELETE endpoints',
      'Use Playwright request fixture without a browser',
      'Write Postman test scripts and run via Newman',
    ],
    objectivesHe: [
      'בדוק endpoints מסוג GET, POST, PUT, DELETE',
      'השתמש ב-Playwright request ללא דפדפן',
      'כתוב סקריפטי Postman והרץ דרך Newman',
    ],
    duration: '45 min',
  },
  load: {
    subtitle: 'Module 4 — Load Testing',
    subtitleHe: 'מודול 4 — בדיקות עומס',
    desc: 'Understand load, stress, and soak testing. Write k6 scripts and read P95/P99 metrics.',
    descHe: 'הבן בדיקות עומס, לחץ ו-soak. כתוב סקריפטי k6 וקרא מדדי P95/P99.',
    objectives: [
      'Distinguish load vs stress vs soak vs performance',
      'Write a k6 script with virtual users',
      'Read and interpret test results',
    ],
    objectivesHe: [
      'הבדל בין load, stress, soak ו-performance',
      'כתוב סקריפט k6 עם משתמשים וירטואליים',
      'קרא ופרש תוצאות בדיקות',
    ],
    duration: '27 min',
  },
  iot: {
    subtitle: 'Module 5 — IoT & Hardware',
    subtitleHe: 'מודול 5 — IoT וחומרה',
    desc: 'QA for embedded systems — testing firmware, hardware-in-the-loop, and safety-critical requirements.',
    descHe: 'QA למערכות משובצות — בדיקת firmware, hardware-in-the-loop ודרישות safety-critical.',
    objectives: [
      'Understand IoT testing challenges',
      'Define test cases for a smart device',
      'Know when to simulate vs use real hardware',
    ],
    objectivesHe: [
      'הבן אתגרי בדיקת IoT',
      'הגדר test cases למכשיר חכם',
      'דע מתי לסמלץ לעומת חומרה אמיתית',
    ],
    duration: '27 min',
  },
  sql: {
    subtitle: 'Module 6 — SQL & Databases',
    subtitleHe: 'מודול 6 — SQL ומסדי נתונים',
    desc: 'Write real-world QA SQL queries — find bugs in data, validate migrations, detect duplicates.',
    descHe: 'כתוב שאילתות SQL לצרכי QA — מצא באגים בנתונים, אמת migrations, גלה כפילויות.',
    objectives: [
      'Write SELECT / WHERE / JOIN queries',
      'Use GROUP BY and HAVING for aggregations',
      'Run QA-specific queries: NULL hunting, duplicate detection',
    ],
    objectivesHe: [
      'כתוב שאילתות SELECT / WHERE / JOIN',
      'השתמש ב-GROUP BY ו-HAVING לאגרגציות',
      'הרץ שאילתות QA: ציד NULL, גילוי כפילויות',
    ],
    duration: '102 min',
  },
  enrichment: {
    subtitle: 'Module 7 — AI, DevOps & Security',
    subtitleHe: 'מודול 7 — AI, DevOps ואבטחה',
    desc: 'Use Claude to generate tests, wire Playwright into GitHub Actions CI, and find OWASP security bugs.',
    descHe:
      'השתמש ב-Claude ליצירת בדיקות, חבר Playwright ל-GitHub Actions CI, ומצא באגי אבטחה לפי OWASP.',
    objectives: [
      'Prompt Claude to write Playwright tests',
      'Add a GitHub Actions workflow for CI',
      'Identify the OWASP Top 10 vulnerabilities',
    ],
    objectivesHe: [
      'הנחה את Claude לכתוב בדיקות Playwright',
      'הוסף GitHub Actions workflow ל-CI',
      'זהה את OWASP Top 10 חולשות',
    ],
    duration: '42 min',
  },
  summary: {
    subtitle: 'Module 8 — Summary & Next Steps',
    subtitleHe: 'מודול 8 — סיכום וצעדים הבאים',
    desc: 'Interview tips, portfolio building, and your 30-day action plan to land your first QA role.',
    descHe: 'טיפים לראיון עבודה, בניית portfolio, ותוכנית פעולה ל-30 יום לתפקיד QA הראשון שלך.',
    objectives: [
      'Answer the 3 most common QA interview questions',
      'Build a portfolio with Playwright tests on GitHub',
      'Follow a 30-day post-course action plan',
    ],
    objectivesHe: [
      'ענה על 3 השאלות הנפוצות ביותר בראיון QA',
      'בנה portfolio עם בדיקות Playwright ב-GitHub',
      'עקוב אחר תוכנית פעולה של 30 יום לאחר הקורס',
    ],
    duration: '20 min',
  },
};

export default function ModuleHero({ module, totalSections, isHe, onStart }: ModuleHeroProps) {
  const meta = MODULE_META[module.id];
  if (!meta) return null;

  const objectives = isHe ? meta.objectivesHe : meta.objectives;
  const subtitle = isHe ? meta.subtitleHe : meta.subtitle;
  const desc = isHe ? meta.descHe : meta.desc;

  return (
    <div
      className="mb-8 rounded-2xl overflow-hidden border"
      style={{ borderColor: 'var(--border)' }}
    >
      {/* Gradient header */}
      <div
        className="relative px-6 py-8 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d1f5c 0%, #1a3a8f 50%, #2d5fcc 100%)' }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '-30%',
            insetInlineEnd: '-5%',
            width: '50%',
            height: '160%',
            background: 'radial-gradient(ellipse, rgba(79,114,212,.3) 0%, transparent 65%)',
          }}
        />

        <div className="relative z-10">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{
              background: 'rgba(255,255,255,.12)',
              border: '1px solid rgba(255,255,255,.22)',
              color: '#fff',
            }}
          >
            <span className="text-base">{module.icon}</span>
            {subtitle}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-black text-white mb-2 leading-tight">
            {isHe ? module.titleHe : module.title}
          </h2>
          <p
            className="text-sm leading-relaxed mb-5"
            style={{ color: 'rgba(255,255,255,.75)', maxWidth: 520 }}
          >
            {desc}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap gap-4 mb-5">
            {[
              ['⏱', `${meta.duration}`],
              ['📚', `${totalSections} ${isHe ? 'סעיפים' : 'sections'}`],
              ['🎯', isHe ? 'מתחיל' : 'Beginner'],
            ].map(([icon, label]) => (
              <span
                key={label}
                className="flex items-center gap-1.5 text-xs"
                style={{ color: 'rgba(255,255,255,.7)' }}
              >
                <span>{icon}</span>
                {label}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onStart}
              className="px-5 py-2 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5"
              style={{
                background: '#fff',
                color: '#1a3a8f',
                boxShadow: '0 4px 16px rgba(0,0,0,.18)',
              }}
            >
              {isHe ? '▶ התחל ללמוד' : '▶ Start Learning'}
            </button>
          </div>
        </div>
      </div>

      {/* Learning objectives */}
      <div className="px-6 py-5" style={{ backgroundColor: 'var(--bg-card)' }}>
        <p
          className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          {isHe ? '🎯 מה תלמד במודול זה?' : '🎯 What you will learn'}
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {objectives.map((obj, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-xs leading-relaxed"
              style={{ color: 'var(--text-main)' }}
            >
              <span
                className="shrink-0 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center mt-0.5"
                style={{ background: 'var(--primary, #1a3a8f)', color: '#fff' }}
              >
                {i + 1}
              </span>
              {obj}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
