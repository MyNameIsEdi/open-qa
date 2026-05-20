import React, { useState, useEffect } from 'react'
import { useRtl } from '../hooks/useRtl'
import ModuleHero from '../components/guides/ModuleHero'

import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'
import EmojiObjectsOutlinedIcon from '@mui/icons-material/EmojiObjectsOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'
import i18n from '../i18n'
import CodeSnippet from '../components/CodeSnippet'
import { MODULES, type GuideSection, type GuideModule } from '../data/guidesData'
import { PyramidAnimation } from '../components/guides/PyramidAnimation'
import { ModuleMapAnimation } from '../components/guides/ModuleMapAnimation'
import { WhenToAutomateAnimation } from '../components/guides/WhenToAutomateAnimation'
import { SetupPlaywrightAnimation } from '../components/guides/SetupPlaywrightAnimation'
import { FirstTestAnimation } from '../components/guides/FirstTestAnimation'
import { LocatorsAnimation } from '../components/guides/LocatorsAnimation'
import { PomAnimation } from '../components/guides/PomAnimation'
import { ApiPlaywrightAnimation } from '../components/guides/ApiPlaywrightAnimation'
import { ApiPostmanAnimation } from '../components/guides/ApiPostmanAnimation'
import { LoadTypesAnimation } from '../components/guides/LoadTypesAnimation'
import { IotIntroAnimation } from '../components/guides/IotIntroAnimation'
import { SqlIntroAnimation } from '../components/guides/SqlIntroAnimation'
import { DbFundamentalsAnimation } from '../components/guides/DbFundamentalsAnimation'
import { SelectWhereAnimation } from '../components/guides/SelectWhereAnimation'
import { AndOrOrderAnimation } from '../components/guides/AndOrOrderAnimation'
import { GroupHavingAnimation } from '../components/guides/GroupHavingAnimation'
import { JoinsAnimation } from '../components/guides/JoinsAnimation'
import { SqlQaQueriesAnimation } from '../components/guides/SqlQaQueriesAnimation'
import { AiTestingAnimation } from '../components/guides/AiTestingAnimation'
import { DevOpsQaAnimation } from '../components/guides/DevOpsQaAnimation'
import { SecurityTestingAnimation } from '../components/guides/SecurityTestingAnimation'
import { InterviewTipsAnimation } from '../components/guides/InterviewTipsAnimation'
import { LearningSummaryAnimation } from '../components/guides/LearningSummaryAnimation'

const SECTION_ANIMATIONS: Record<string, React.ComponentType> = {
  'intro-qa':         PyramidAnimation,
  'course-overview':  ModuleMapAnimation,
  'when-to-automate': WhenToAutomateAnimation,
  'setup-playwright': SetupPlaywrightAnimation,
  'first-test':       FirstTestAnimation,
  'locators':         LocatorsAnimation,
  'pom':              PomAnimation,
  'api-playwright':   ApiPlaywrightAnimation,
  'api-postman':      ApiPostmanAnimation,
  'load-types':       LoadTypesAnimation,
  'iot-intro':        IotIntroAnimation,
  'sql-intro':        SqlIntroAnimation,
  'db-fundamentals':  DbFundamentalsAnimation,
  'select-where':     SelectWhereAnimation,
  'and-or-order':     AndOrOrderAnimation,
  'group-having':     GroupHavingAnimation,
  'joins':            JoinsAnimation,
  'sql-qa-queries':   SqlQaQueriesAnimation,
  'ai-testing':       AiTestingAnimation,
  'devops-qa':        DevOpsQaAnimation,
  'security-testing':  SecurityTestingAnimation,
  'interview-tips':    InterviewTipsAnimation,
  'learning-summary':  LearningSummaryAnimation,
}

const STORAGE_KEY = 'guides_completed_v3'

// ─── Download cards data ───────────────────────────────────────────────────────
type DownloadCard = { name: string; nameHe: string; desc: string; descHe: string; type: 'PDF' | 'XLSX' | 'MD'; size: string }
const SECTION_DOWNLOADS: Record<string, DownloadCard[]> = {
  'intro-qa': [
    { name: 'QA Fundamentals Checklist', nameHe: 'רשימת תיוג יסודות QA', desc: 'All core concepts — pyramid, bug lifecycle, test types', descHe: 'כל מושגי הבסיס — פירמידה, מחזור חיי באג, סוגי בדיקות', type: 'PDF', size: '1.2 MB' },
    { name: 'Testing Pyramid Cheat Sheet', nameHe: 'דף רמאות — פירמידת הבדיקות', desc: 'One-page Unit / Integration / E2E comparison table', descHe: 'טבלת השוואה חד-עמודית Unit / Integration / E2E', type: 'MD', size: '0.3 MB' },
  ],
  'when-to-automate': [
    { name: 'Automation ROI Calculator', nameHe: 'מחשבון ROI לאוטומציה', desc: 'Excel file — enter run frequency, get ROI decision', descHe: 'קובץ Excel — הכנס תדירות ריצה, קבל החלטת ROI', type: 'XLSX', size: '0.8 MB' },
    { name: 'Decision Matrix Template', nameHe: 'תבנית מטריצת החלטות', desc: 'Ready-to-fill template for planning sessions', descHe: 'תבנית מוכנה למילוי לפגישות תכנון', type: 'PDF', size: '0.5 MB' },
  ],
  'setup-playwright': [
    { name: 'Playwright Setup Guide', nameHe: 'מדריך הגדרת Playwright', desc: 'Windows, Mac & Linux setup with troubleshooting tips', descHe: 'מדריך התקנה ל-Windows, Mac ו-Linux עם פתרון בעיות', type: 'PDF', size: '2.1 MB' },
    { name: 'Playwright Commands Cheat Sheet', nameHe: 'דף רמאות — פקודות Playwright', desc: 'Most-used commands on a single A4 sheet', descHe: 'הפקודות הכי שימושיות בגיליון A4 אחד', type: 'PDF', size: '0.9 MB' },
  ],
  'locators': [
    { name: 'Locator Strategy Guide', nameHe: 'מדריך אסטרטגיית Locators', desc: 'Priority order and when to use each locator type', descHe: 'סדר עדיפויות ומתי להשתמש בכל סוג locator', type: 'PDF', size: '0.7 MB' },
  ],
  'pom': [
    { name: 'POM Starter Template', nameHe: 'תבנית התחלה לPOM', desc: 'Ready-to-use TypeScript POM with LoginPage example', descHe: 'תבנית TypeScript מוכנה לשימוש עם דוגמת LoginPage', type: 'MD', size: '0.2 MB' },
  ],
  'api-playwright': [
    { name: 'REST API Test Recipes', nameHe: 'מתכוני בדיקת REST API', desc: 'GET, POST, auth, error handling patterns', descHe: 'דפוסי GET, POST, auth וטיפול בשגיאות', type: 'PDF', size: '0.6 MB' },
  ],
  'api-postman': [
    { name: 'Postman Collection Template', nameHe: 'תבנית Collection לPostman', desc: 'Importable collection with env variables wired up', descHe: 'קולקשן מוכן לייבוא עם משתני סביבה מוגדרים', type: 'MD', size: '0.4 MB' },
  ],
  'load-types': [
    { name: 'k6 Starter Script', nameHe: 'סקריפט k6 להתחלה', desc: 'Ready-to-run k6 script with 50 VUs, 1 min ramp-up', descHe: 'סקריפט k6 מוכן להרצה עם 50 VUs ורמפ-אפ של דקה', type: 'MD', size: '0.2 MB' },
    { name: 'Load Test Results Template', nameHe: 'תבנית תוצאות בדיקת עומס', desc: 'P50/P95/P99 reporting template for stakeholders', descHe: 'תבנית דיווח P50/P95/P99 לבעלי עניין', type: 'XLSX', size: '0.5 MB' },
  ],
  'sql-qa-queries': [
    { name: 'QA SQL Query Library', nameHe: 'ספריית שאילתות SQL ל-QA', desc: '20 battle-tested queries for data validation', descHe: '20 שאילתות נבדקות בשדה לאימות נתונים', type: 'MD', size: '0.3 MB' },
  ],
  'security-testing': [
    { name: 'Security Test Checklist', nameHe: 'רשימת תיוג בדיקות אבטחה', desc: 'OWASP Top 10 checks every QA should run', descHe: 'בדיקות OWASP Top 10 שכל QA צריך להריץ', type: 'PDF', size: '0.8 MB' },
  ],
  'interview-tips': [
    { name: 'QA Interview Prep Sheet', nameHe: 'גיליון הכנה לראיון QA', desc: 'Top 15 questions with model answers', descHe: '15 השאלות הנפוצות עם תשובות מודל', type: 'PDF', size: '1.1 MB' },
  ],
}

const BADGE_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  PDF:  { bg: '#fef2f2', color: '#b91c1c', border: '#fca5a5' },
  XLSX: { bg: '#f0fdf4', color: '#166534', border: '#86efac' },
  MD:   { bg: '#eff6ff', color: '#1d4ed8', border: '#93c5fd' },
}

function DownloadCards({ sectionId, isHe }: { sectionId: string; isHe: boolean }) {
  const cards = SECTION_DOWNLOADS[sectionId]
  if (!cards?.length) return null

  return (
    <div className="rounded-xl p-4 mt-2"
      style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #faf7ff 100%)', border: '1px solid #c7d2fe' }}>
      <p className="text-xs font-bold mb-3 flex items-center gap-1.5" style={{ color: '#1a3a8f' }}>
        📥 {isHe ? 'משאבים להורדה' : 'Downloadable Resources'}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {cards.map((card, i) => {
          const badge = BADGE_STYLES[card.type]
          return (
            <div key={i} className="rounded-xl p-3.5 flex flex-col gap-2"
              style={{ background: '#fff', border: '1px solid #dde6ff', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold leading-tight" style={{ color: 'var(--text-main)' }}>
                  {isHe ? card.nameHe : card.name}
                </span>
                <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold"
                  style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                  {card.type}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {isHe ? card.descHe : card.desc}
              </p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{card.size}</span>
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white transition-all hover:-translate-y-0.5"
                  style={{ background: '#1a3a8f' }}>
                  ⬇ {isHe ? 'הורד' : 'Download'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Callout boxes ────────────────────────────────────────────────────────────
type CalloutType = 'info' | 'tip' | 'warning'
type Callout = { type: CalloutType; title: string; titleHe: string; body: string; bodyHe: string }

const CALLOUT_STYLES: Record<CalloutType, { bg: string; border: string; icon: string; titleColor: string }> = {
  info:    { bg: '#eff6ff', border: '#3b82f6', icon: '💡', titleColor: '#1d4ed8' },
  tip:     { bg: '#f0fdf4', border: '#22c55e', icon: '✨', titleColor: '#166534' },
  warning: { bg: '#fff7ed', border: '#f97316', icon: '⚠️', titleColor: '#9a3412' },
}

const SECTION_CALLOUTS: Record<string, Callout[]> = {
  'intro-qa': [
    { type: 'tip',
      title: 'Tip before you start', titleHe: 'טיפ לפני שמתחילים',
      body: 'Read → try it yourself → take the quiz → repeat. No need to memorize everything — understanding the concept is enough.',
      bodyHe: 'קרא → נסה בעצמך → עשה את החידון → חזור. לא חייבים לזכור הכל — מספיק להבין את הרעיון.' },
  ],
  'when-to-automate': [
    { type: 'warning',
      title: 'Brittle Tests — Beware', titleHe: 'בדיקות שבירות — הזהר',
      body: "A test that breaks on every small UI change costs more than it saves. If your test fails because you changed a button color — it's not a good test. We'll learn how to avoid this with strong locators in Module 2.",
      bodyHe: 'בדיקה שנשברת בכל שינוי UI קטן עולה יותר ממה שהיא שווה. אם הבדיקה שלך נכשלת כי שינית צבע כפתור — היא לא בדיקה טובה. נלמד איך להימנע מזה עם locators חזקים במודול 2.' },
  ],
  'setup-playwright': [
    { type: 'info',
      title: 'Why Playwright over Selenium?', titleHe: 'למה Playwright ולא Selenium?',
      body: 'Playwright has built-in auto-wait — it waits for elements to be ready before interacting. Fewer flaky tests, no sleep() calls, better reliability.',
      bodyHe: 'ל-Playwright יש auto-wait מובנה — הוא ממתין לאלמנטים לפני שהוא מקיים איתם אינטראקציה. פחות flaky tests, ללא קריאות sleep(), אמינות גבוהה יותר.' },
  ],
  'first-test': [
    { type: 'tip',
      title: 'When a test fails', titleHe: 'כשבדיקה נכשלת',
      body: 'Playwright automatically captures a screenshot and trace on failure. Run npx playwright show-report to view the full visual report.',
      bodyHe: 'Playwright מצלם screenshot ו-trace אוטומטית כשבדיקה נכשלת. הרץ npx playwright show-report כדי לראות את הדוח הויזואלי המלא.' },
  ],
  'locators': [
    { type: 'info',
      title: 'Locator Priority Order', titleHe: 'סדר עדיפויות locators',
      body: 'Use: getByRole → getByLabel → getByTestId → CSS → XPath (last resort). Role-based locators survive redesigns because they test intent, not implementation.',
      bodyHe: 'השתמש: getByRole → getByLabel → getByTestId → CSS → XPath (אחרון). locators מבוססי role שורדים עיצובים מחדש כי הם בודקים כוונה, לא מימוש.' },
  ],
  'pom': [
    { type: 'tip',
      title: 'POM = TV Remote Analogy', titleHe: 'POM = אנלוגיה לשלט טלוויזיה',
      body: "Think of a Page Object like a TV remote — one place for all button controls. When the TV UI changes, you update the remote, not every person who uses it.",
      bodyHe: 'חשוב על Page Object כמו שלט טלוויזיה — מקום אחד לכל פקדי הכפתורים. כשה-UI של הטלוויזיה משתנה, אתה מעדכן את השלט, לא כל אדם שמשתמש בו.' },
  ],
  'api-playwright': [
    { type: 'info',
      title: 'API tests are 10× faster', titleHe: 'בדיקות API מהירות פי 10',
      body: 'API tests skip the browser entirely — no rendering, no waiting for DOM. A full API test suite that takes 30 seconds would take 5 minutes as UI tests.',
      bodyHe: 'בדיקות API מדלגות על הדפדפן לחלוטין — אין rendering, אין המתנה ל-DOM. חבילת בדיקות API שלוקחת 30 שניות תיקח 5 דקות כבדיקות UI.' },
  ],
  'load-types': [
    { type: 'info',
      title: 'Road types analogy', titleHe: 'אנלוגיית סוגי הכבישים',
      body: 'Load = normal traffic | Performance = rush hour | Stress = accident blocking lanes | Soak = marathon runner — slow leak over hours.',
      bodyHe: 'עומס = תנועה רגילה | ביצועים = שעת עומס | לחץ = תאונה שחוסמת נתיבים | Soak = רץ מרתון — דליפה איטית לאורך שעות.' },
  ],
  'sql-intro': [
    { type: 'tip',
      title: 'Why QA engineers need SQL', titleHe: 'למה מהנדסי QA צריכים SQL',
      body: 'Backend bugs often hide in the data. SQL lets you verify the DB directly — find ghost records, validate migrations, catch duplicates the UI never shows.',
      bodyHe: 'באגים בצד השרת לעתים קרובות מתחבאים בנתונים. SQL מאפשר לך לאמת את ה-DB ישירות — למצוא רשומות רפאים, לאמת migrations, לתפוס כפילויות שה-UI לא מראה.' },
  ],
  'security-testing': [
    { type: 'warning',
      title: 'Real-world impact', titleHe: 'השפעה אמיתית',
      body: 'A QA engineer found a bug that could have exposed 50,000 user records — just by testing what happens when you modify a URL parameter. That\'s IDOR.',
      bodyHe: 'מהנדסת QA מצאה באג שיכול היה לחשוף 50,000 רשומות משתמשים — רק על ידי בדיקת מה קורה כשמשנים פרמטר URL. זה IDOR.' },
  ],
  'interview-tips': [
    { type: 'tip',
      title: 'What interviewers actually look for', titleHe: 'מה שמראיינים באמת מחפשים',
      body: 'Curiosity, attention to detail, and clear communication. A candidate who says "I found a bug that prevented checkout for 20% of users" beats one who memorized 100 testing definitions.',
      bodyHe: 'סקרנות, תשומת לב לפרטים ותקשורת ברורה. מועמד שאומר "מצאתי באג שמנע checkout ל-20% מהמשתמשים" מנצח את מי ששינן 100 הגדרות בדיקה.' },
  ],
}

function CalloutBox({ callout, isHe }: { callout: Callout; isHe: boolean }) {
  const s = CALLOUT_STYLES[callout.type]
  return (
    <div className="flex gap-3 px-4 py-3.5 rounded-xl text-xs leading-relaxed"
      style={{ background: s.bg, borderInlineStart: `4px solid ${s.border}` }}>
      <span className="text-base shrink-0 mt-0.5">{s.icon}</span>
      <div>
        <p className="font-bold mb-1" style={{ color: s.titleColor }}>
          {isHe ? callout.titleHe : callout.title}
        </p>
        <p style={{ color: 'var(--text-muted)' }}>
          {isHe ? callout.bodyHe : callout.body}
        </p>
      </div>
    </div>
  )
}

// ─── Animation placement labels ───────────────────────────────────────────────
const ANIMATION_LABELS: Record<string, [string, string]> = {
  'intro-qa':         ['Testing Pyramid — live animation', 'פירמידת הבדיקות — אנימציה חיה מוצגת כאן בדיוק כשהמושג מוזכר לראשונה'],
  'course-overview':  ['Course roadmap — all 8 modules at a glance', 'מפת הקורס — כל 8 המודולים במבט אחד'],
  'when-to-automate': ['Decision tree — automate or not?', 'עץ ההחלטות — לאוטמט או לא? מוצג לאחר שאלת מתי לאוטמט'],
  'setup-playwright': ['Terminal walkthrough — npm init playwright@latest', 'הדגמת טרמינל — ההתקנה מוצגת אחרי תיאור שלב-אחר-שלב'],
  'first-test':       ['Anatomy of a test — live code trace', 'אנטומיית בדיקה — ממחישה את מבנה הבדיקה שתואר בטקסט'],
  'locators':         ['Locator strategies — interactive demo', 'אסטרטגיות Locator — מוצגות אחרי הסבר חמשת הסוגים'],
  'pom':              ['Page Object Model — before vs after', 'Page Object Model — השוואת לפני/אחרי מיד לאחר האנלוגיה'],
  'api-playwright':   ['API request flow — Playwright fixture', 'זרימת בקשת API — מוצגת עם הסבר request fixture'],
  'api-postman':      ['Postman collection — GUI walkthrough', 'הדגמת Postman — ממחישה את ה-Collections שתוארו'],
  'load-types':       ['Load test metrics — P95 / P99 in real time', 'מדדי בדיקת עומס — P95/P99 בזמן אמת'],
  'iot-intro':        ['Embedded system signals — sensor simulation', 'אותות מערכת משובצת — סימולציית חיישן'],
  'sql-intro':        ['SQL filing cabinet — data retrieval analogy', 'ארון תיוק SQL — ממחיש את אנלוגיית אחזור נתונים'],
  'db-fundamentals':  ['ERD diagram — tables and relationships', 'דיאגרמת ERD — טבלאות וקשרים'],
  'select-where':     ['SELECT / WHERE — live query execution', 'SELECT / WHERE — הרצת שאילתה חיה'],
  'and-or-order':     ['AND / OR — filter logic visualized', 'AND / OR — לוגיקת סינון מוצגת'],
  'group-having':     ['GROUP BY + HAVING — aggregation demo', 'GROUP BY + HAVING — הדגמת אגרגציה'],
  'joins':            ['JOIN types — Venn diagram animation', 'סוגי JOIN — אנימציית דיאגרמת Venn'],
  'sql-qa-queries':   ['QA query patterns — real data output', 'דפוסי שאילתות QA — פלט נתונים אמיתי'],
  'ai-testing':       ['Claude prompt — generating a Playwright test', 'פרומפט ל-Claude — יצירת בדיקת Playwright'],
  'devops-qa':        ['CI/CD pipeline — tests running on PR', 'צינור CI/CD — בדיקות רצות על PR'],
  'security-testing': ['OWASP attack surface — request interception', 'משטח התקפה OWASP — יירוט בקשות'],
  'interview-tips':   ['Interview prep — question flow', 'הכנה לראיון — זרימת שאלות'],
  'learning-summary': ['Full course map — everything covered', 'מפת הקורס המלאה — כל מה שנלמד'],
}

function AnimationLabel({ sectionId, isHe }: { sectionId: string; isHe: boolean }) {
  const label = ANIMATION_LABELS[sectionId]
  if (!label) return null
  return (
    <div className="flex items-center gap-2 text-[11px] font-medium px-1 mb-1"
      style={{ color: 'var(--text-muted)' }}>
      <span className="w-2 h-2 rounded-full shrink-0 animate-pulse" style={{ background: '#22c55e' }} />
      {isHe ? label[1] : label[0]}
    </div>
  )
}

// ─── Bug lifecycle chips ──────────────────────────────────────────────────────
const BUG_STAGES = [
  { label: 'New', labelHe: 'חדש',           bg: '#fef2f2', color: '#b91c1c', border: '#fca5a5', icon: '🆕' },
  { label: 'Assigned', labelHe: 'הוקצה',    bg: '#eff6ff', color: '#1d4ed8', border: '#93c5fd', icon: '📋' },
  { label: 'In Progress', labelHe: 'בעבודה', bg: '#fefce8', color: '#854d0e', border: '#fde68a', icon: '🔧' },
  { label: 'Fixed', labelHe: 'תוקן',        bg: '#f0fdf4', color: '#166534', border: '#86efac', icon: '✅' },
  { label: 'Retest', labelHe: 'נבדק שוב',   bg: '#faf5ff', color: '#6b21a8', border: '#d8b4fe', icon: '🔁' },
  { label: 'Closed', labelHe: 'סגור',       bg: '#f1f5f9', color: '#334155', border: '#cbd5e1', icon: '🔒' },
]

function BugLifecycle({ isHe }: { isHe: boolean }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--bg-body)', border: '1px solid var(--border)' }}>
      <p className="text-xs font-bold mb-3" style={{ color: 'var(--text-main)' }}>
        🐛 {isHe ? 'מחזור חיי הבאג' : 'Bug Lifecycle'}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        {BUG_STAGES.map((s, i) => (
          <React.Fragment key={s.label}>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
              style={{ background: s.bg, color: s.color, border: `1.5px solid ${s.border}` }}>
              {s.icon} {isHe ? s.labelHe : s.label}
            </span>
            {i < BUG_STAGES.length - 1 && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>→</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

// ─── Decision matrix (when-to-automate) ──────────────────────────────────────
const AUTOMATE_YES = {
  en: ['Regression tests that run on every build', 'Multi-browser tests (Chrome, Firefox, WebKit)', 'Smoke tests on every PR', 'Tests with large data sets', 'Login / auth flows that run constantly'],
  he: ['בדיקות רגרסיה שרצות בכל build', 'בדיקות multi-browser (Chrome, Firefox, WebKit)', 'smoke tests על כל PR', 'בדיקות עם מערכי נתונים גדולים', 'זרימות login / auth שרצות תמיד'],
}
const AUTOMATE_NO = {
  en: ['Exploratory testing — finding unexpected issues', 'UX / subjective user experience checks', 'One-time test before a single release', 'Feature whose UI changes every week', 'When cost of automation > benefit'],
  he: ['Exploratory testing — גילוי בעיות לא צפויות', 'בדיקות UX / חווית משתמש סובייקטיבית', 'בדיקה one-time לפני release חד-פעמי', 'פיצ׳ר שה-UI שלו משתנה כל שבוע', 'כשעלות האוטומציה גבוהה מהתועלת'],
}

function DecisionMatrix({ isHe }: { isHe: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl overflow-hidden">
      <div className="p-4 rounded-xl" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderTop: '3px solid #22c55e' }}>
        <p className="text-xs font-bold mb-3" style={{ color: '#166534' }}>✅ {isHe ? 'כן — אוטמט' : 'Yes — Automate'}</p>
        <ul className="flex flex-col gap-1.5">
          {(isHe ? AUTOMATE_YES.he : AUTOMATE_YES.en).map((item, i) => (
            <li key={i} className="flex gap-2 text-[11px] leading-relaxed" style={{ color: '#166534' }}>
              <span className="shrink-0 mt-0.5">🔁</span>{item}
            </li>
          ))}
        </ul>
      </div>
      <div className="p-4 rounded-xl" style={{ background: '#fef2f2', border: '1px solid #fecaca', borderTop: '3px solid #ef4444' }}>
        <p className="text-xs font-bold mb-3" style={{ color: '#b91c1c' }}>❌ {isHe ? 'לא — ידני' : "Don't Automate"}</p>
        <ul className="flex flex-col gap-1.5">
          {(isHe ? AUTOMATE_NO.he : AUTOMATE_NO.en).map((item, i) => (
            <li key={i} className="flex gap-2 text-[11px] leading-relaxed" style={{ color: '#b91c1c' }}>
              <span className="shrink-0 mt-0.5">🔍</span>{item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ─── Concept tags (styled pill version) ──────────────────────────────────────
const TAG_COLORS = [
  { bg: '#eff6ff', color: '#1d4ed8', border: '#c7d2fe' },
  { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
  { bg: '#fff7ed', color: '#9a3412', border: '#fed7aa' },
  { bg: '#faf5ff', color: '#6b21a8', border: '#e9d5ff' },
  { bg: '#fef9c3', color: '#854d0e', border: '#fef08a' },
]

// ─── helpers ──────────────────────────────────────────────────────────────────
function useCompleted() {
  const [completed, setCompleted] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
  })
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(completed)) }, [completed])
  const toggle = (id: string) =>
    setCompleted(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  return { completed, toggle }
}

function typeIcon(type: GuideSection['type']) {
  switch (type) {
    case 'quiz':     return <QuizOutlinedIcon sx={{ fontSize: 14 }} />
    case 'practice': return <BuildOutlinedIcon sx={{ fontSize: 14 }} />
    case 'exam':     return <ScienceOutlinedIcon sx={{ fontSize: 14 }} />
    case 'tips':     return <LightbulbOutlinedIcon sx={{ fontSize: 14 }} />
    case 'summary':  return <MenuBookOutlinedIcon sx={{ fontSize: 14 }} />
    default:         return <ArticleOutlinedIcon sx={{ fontSize: 14 }} />
  }
}

function typeLabel(type: GuideSection['type'], isHe: boolean): string {
  const map: Record<GuideSection['type'], [string, string]> = {
    lesson:   ['Lesson',   'שיעור'],
    quiz:     ['Quiz',     'חידון'],
    practice: ['Practice', 'תרגול'],
    exam:     ['Exam',     'מבחן'],
    tips:     ['Tips',     'טיפים'],
    summary:  ['Summary',  'סיכום'],
  }
  return isHe ? map[type][1] : map[type][0]
}

const levelColors: Record<string, string> = {
  Beginner:     'bg-sage-100 text-sage-700',
  Intermediate: 'bg-amber-50 text-amber-600',
  Advanced:     'bg-primary-50 text-primary-700',
}

// ─── Complete button ───────────────────────────────────────────────────────────
function CompleteButton({ completed, onToggle, isHe }: {
  completed: boolean; onToggle: () => void; isHe: boolean
}) {
  return (
    <button
      onClick={onToggle}
      className={`self-start flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
        completed ? 'bg-sage-100 text-sage-700 hover:bg-sage-200' : 'hover:bg-sand-400'
      }`}
      style={completed ? {} : { backgroundColor: 'var(--bg-body)', color: 'var(--text-main)' }}
    >
      {completed
        ? <><CheckCircleIcon sx={{ fontSize: 14 }} /> {isHe ? 'הושלם' : 'Completed'}</>
        : <><RadioButtonUncheckedIcon sx={{ fontSize: 14 }} /> {isHe ? 'סמן כהושלם' : 'Mark as complete'}</>}
    </button>
  )
}

// ─── Quiz content ─────────────────────────────────────────────────────────────
function QuizContent({ section, onComplete, isHe }: {
  section: GuideSection
  onComplete: () => void
  isHe: boolean
}) {
  const questions = section.questions ?? []
  const [answers, setAnswers] = useState<Record<string, number>>({})

  const answered = Object.keys(answers).length
  const score = questions.filter(q => answers[q.id] === q.correct).length
  const allAnswered = answered === questions.length && questions.length > 0

  return (
    <div className="flex flex-col gap-6">
      {/* Score summary when done */}
      {allAnswered && (
        <div className="p-5 rounded-xl border text-center"
          style={{ backgroundColor: 'var(--bg-body)', borderColor: 'var(--border)' }}>
          <p className="text-3xl font-black mb-1" style={{ color: 'var(--text-main)' }}>
            {score}/{questions.length}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {isHe ? 'תוצאה' : 'Score'} · {Math.round((score / questions.length) * 100)}%{' '}
            {score === questions.length ? (isHe ? '🎉 מושלם!' : '🎉 Perfect!') :
             score >= questions.length * 0.8 ? (isHe ? '✅ כל הכבוד!' : '✅ Great job!') :
             (isHe ? '📖 המשך להתאמן' : '📖 Keep practicing')}
          </p>
        </div>
      )}

      {/* Questions */}
      {questions.map((q, qIdx) => {
        const selected = answers[q.id] ?? -1
        const isAnswered = selected >= 0
        const opts = isHe ? q.optionsHe : q.options

        return (
          <div key={q.id} className="flex flex-col gap-3">
            <p className="text-sm font-semibold leading-relaxed" style={{ color: 'var(--text-main)' }}>
              {qIdx + 1}. {isHe ? q.textHe : q.text}
            </p>

            <div className="flex flex-col gap-2">
              {opts.map((opt, i) => {
                const isCorrect = i === q.correct
                const isSelected = i === selected
                let cls = 'border hover:bg-sand-400 cursor-pointer'
                if (isAnswered) {
                  if (isSelected && isCorrect)  cls = 'border-2 border-sage-400 bg-sage-50 cursor-default'
                  else if (isSelected)           cls = 'border-2 border-red-300 bg-red-50 cursor-default'
                  else if (isCorrect)            cls = 'border border-sage-300 bg-sage-50 cursor-default'
                  else                           cls = 'border opacity-50 cursor-default'
                }
                return (
                  <button
                    key={i}
                    disabled={isAnswered}
                    onClick={() => setAnswers(a => ({ ...a, [q.id]: i }))}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs transition-all ${cls}`}
                    style={{ borderColor: isAnswered ? undefined : 'var(--border)', color: 'var(--text-main)' }}
                  >
                    <span className="font-semibold mr-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {String.fromCharCode(65 + i)}.
                    </span>
                    {opt}
                  </button>
                )
              })}
            </div>

            {/* Explanation */}
            {isAnswered && (
              <div className={`px-4 py-3 rounded-xl text-xs leading-relaxed ${
                selected === q.correct
                  ? 'bg-sage-50 text-sage-800 border border-sage-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <span className="font-bold mr-1">{selected === q.correct ? '✓' : '✗'}</span>
                {isHe ? q.explanationHe : q.explanation}
              </div>
            )}
          </div>
        )
      })}

      {/* Complete after answering all */}
      {allAnswered && (
        <CompleteButton completed={false} onToggle={onComplete} isHe={isHe} />
      )}
    </div>
  )
}

// ─── Practice content ─────────────────────────────────────────────────────────
function PracticeContent({ section, completed, onToggle, isHe }: {
  section: GuideSection; completed: boolean; onToggle: () => void; isHe: boolean
}) {
  const desc  = isHe ? section.practiceDescHe  : section.practiceDesc
  const items = isHe ? section.practiceItemsHe : section.practiceItems

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 rounded-xl border-2 border-dashed" style={{ borderColor: 'var(--border)' }}>
        <p className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
          <BuildOutlinedIcon sx={{ fontSize: 16 }} />
          {isHe ? 'משימת תרגול' : 'Practice Task'}
        </p>
        {desc && (
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>{desc}</p>
        )}
        {items && items.length > 0 && (
          <ol className="flex flex-col gap-2.5">
            {items.map((item, i) => (
              <li key={i} className="flex gap-3 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                <span className="shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-[10px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ol>
        )}
      </div>
      <CompleteButton completed={completed} onToggle={onToggle} isHe={isHe} />
    </div>
  )
}

// ─── Lesson content ───────────────────────────────────────────────────────────
function LessonContent({ section, completed, onToggle, isHe }: {
  section: GuideSection; completed: boolean; onToggle: () => void; isHe: boolean
}) {
  const body      = isHe ? section.bodyHe     : section.body
  const summary   = isHe ? section.summaryHe  : section.summary
  const concepts  = isHe ? section.conceptsHe : section.concepts
  const snippets  = section.snippets ?? []
  const Animation = SECTION_ANIMATIONS[section.id]
  const callouts  = SECTION_CALLOUTS[section.id] ?? []

  return (
    <div className="flex flex-col gap-5">

      {/* Level + duration badge */}
      {section.level && (
        <span className={`self-start text-xs font-medium px-2.5 py-1 rounded-full ${levelColors[section.level]}`}>
          {isHe
            ? section.level === 'Beginner' ? 'מתחיל' : section.level === 'Intermediate' ? 'בינוני' : 'מתקדם'
            : section.level}
          {section.minutes ? ` · ${section.minutes} min` : ''}
        </span>
      )}

      {/* Summary lead */}
      {summary && (
        <p className="text-sm font-semibold leading-relaxed" style={{ color: 'var(--text-main)' }}>
          {summary}
        </p>
      )}

      {/* Callout boxes — appear before animation, framing what the learner is about to see */}
      {callouts.map((c, i) => <CalloutBox key={i} callout={c} isHe={isHe} />)}

      {/* Animation — dir="ltr" prevents RTL mode from flipping terminal text / SVG annotations */}
      {Animation && (
        <div className="flex flex-col gap-1">
          <AnimationLabel sectionId={section.id} isHe={isHe} />
          <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }} dir="ltr">
            <Animation />
          </div>
        </div>
      )}

      {/* Bug lifecycle — only for intro-qa, placed after pyramid to complete the QA mental model */}
      {section.id === 'intro-qa' && <BugLifecycle isHe={isHe} />}

      {/* Decision matrix — only for when-to-automate, placed after analogy text */}
      {section.id === 'when-to-automate' && <DecisionMatrix isHe={isHe} />}

      {/* Body paragraphs */}
      {body && (
        <div className="flex flex-col gap-3.5 rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {body.split('\n\n').map((para, i) => (
            <p key={i} className="text-sm leading-7" style={{ color: 'var(--text-muted)' }}>{para}</p>
          ))}
        </div>
      )}

      {/* Key concepts — numbered list for scannability */}
      {concepts && concepts.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-body)', border: '1px solid var(--border)' }}>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5"
            style={{ color: 'var(--text-muted)' }}>
            <EmojiObjectsOutlinedIcon sx={{ fontSize: 13 }} />
            {isHe ? 'מושגי מפתח' : 'Key Concepts'}
          </p>
          <ul className="flex flex-col gap-2">
            {concepts.map((c, i) => {
              const t = TAG_COLORS[i % TAG_COLORS.length]
              return (
                <li key={i} className="flex items-start gap-2.5 text-xs leading-relaxed">
                  <span className="shrink-0 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center mt-0.5"
                    style={{ background: t.bg, color: t.color, border: `1px solid ${t.border}` }}>
                    {i + 1}
                  </span>
                  <span style={{ color: 'var(--text-main)' }}>{c}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Code snippets */}
      {snippets.map((s, i) => (
        <div key={i}>
          <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-main)' }}>
            {isHe ? s.labelHe : s.label}
          </p>
          <CodeSnippet code={s.code} language={s.language} />
        </div>
      ))}

      {/* Downloadable resources */}
      <DownloadCards sectionId={section.id} isHe={isHe} />

      <CompleteButton completed={completed} onToggle={onToggle} isHe={isHe} />
    </div>
  )
}

// ─── Section content dispatcher ───────────────────────────────────────────────
function SectionContent({ section, completed, onToggle }: {
  section: GuideSection; completed: boolean; onToggle: () => void
}) {
  const isHe = i18n.language === 'he'

  if (section.type === 'quiz') {
    return <QuizContent section={section} onComplete={onToggle} isHe={isHe} />
  }
  if (section.type === 'practice') {
    return <PracticeContent section={section} completed={completed} onToggle={onToggle} isHe={isHe} />
  }
  return <LessonContent section={section} completed={completed} onToggle={onToggle} isHe={isHe} />
}

// ─── Section row in sidebar ───────────────────────────────────────────────────
function SectionRow({ section, completed, active, onClick }: {
  section: GuideSection; completed: boolean; active: boolean; onClick: () => void
}) {
  const isHe = i18n.language === 'he'
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3 text-start transition-colors ${
        active ? 'bg-primary-50' : 'hover:bg-sand-400'
      }`}
    >
      <span className={`mt-0.5 shrink-0`}
        style={{ color: completed ? 'var(--sage-600, #4a7c59)' : 'var(--text-muted)' }}>
        {completed
          ? <CheckCircleIcon sx={{ fontSize: 16 }} />
          : <RadioButtonUncheckedIcon sx={{ fontSize: 16 }} />}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-xs leading-snug ${active ? 'font-semibold text-primary-700' : ''}`}
          style={{ color: active ? undefined : 'var(--text-main)' }}>
          {isHe ? section.titleHe : section.title}
        </p>
        <span className="flex items-center gap-1 text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {typeIcon(section.type)}
          {typeLabel(section.type, isHe)}
          {section.minutes ? <> · {section.minutes} min</> : null}
        </span>
      </div>
    </button>
  )
}

// ─── Module group in sidebar ──────────────────────────────────────────────────
function ModuleGroup({ module, completed, activeId, onSelect }: {
  module: GuideModule; completed: string[]; activeId: string; onSelect: (id: string) => void
}) {
  const isHe = i18n.language === 'he'
  const [open, setOpen] = useState(
    module.sections.some(s => s.id === activeId || !completed.includes(s.id))
  )
  const doneCount = module.sections.filter(s => completed.includes(s.id)).length

  return (
    <div className="border-b" style={{ borderColor: 'var(--border)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 text-start hover:bg-sand-400 transition-colors"
      >
        <span className="text-base shrink-0">{module.icon}</span>
        <span className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-main)' }}>
            {isHe ? module.titleHe : module.title}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {doneCount}/{module.sections.length} {isHe ? 'הושלמו' : 'completed'}
          </p>
        </span>
        <span style={{ color: 'var(--text-muted)' }}>
          {open ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
        </span>
      </button>
      {open && module.sections.map(section => (
        <SectionRow
          key={section.id}
          section={section}
          completed={completed.includes(section.id)}
          active={section.id === activeId}
          onClick={() => onSelect(section.id)}
        />
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function GuidesPage() {
  const isRtl = useRtl()
  const isHe = isRtl
  const { completed, toggle } = useCompleted()

  const allSections = MODULES.flatMap(m => m.sections)
  const total = allSections.length
  const done = completed.filter(id => allSections.some(s => s.id === id)).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const [activeId, setActiveId] = useState(() => allSections[0]?.id ?? '')
  // Default: open on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768)

  const activeSection = allSections.find(s => s.id === activeId) ?? allSections[0]
  const activeModule  = MODULES.find(m => m.sections.some(s => s.id === activeId))

  const activeIdx = allSections.findIndex(s => s.id === activeId)

  const goNext = () => {
    if (activeIdx < allSections.length - 1) setActiveId(allSections[activeIdx + 1].id)
  }
  const goPrev = () => {
    if (activeIdx > 0) setActiveId(allSections[activeIdx - 1].id)
  }

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 56px)' }}>

      {/* ── Top progress header ── */}
      <div className="border-b px-4 py-2.5 flex items-center gap-3"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg border transition-colors hover:bg-sand-400 md:hidden"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          aria-label={isHe ? 'תוכן הקורס' : 'Course content'}
        >
          <MenuBookOutlinedIcon sx={{ fontSize: 16 }} />
        </button>

        {/* Course label — hidden on very small screens to save space */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <MenuBookOutlinedIcon sx={{ fontSize: 16 }} style={{ color: 'var(--primary, #1a3a8f)' }} />
          <span className="font-bold text-xs" style={{ color: 'var(--text-main)' }}>
            {isHe ? 'קורס QA אוטומציה' : 'QA Automation Course'}
          </span>
        </div>

        {/* Progress bar — flex-1 fills remaining space */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-body)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #1a3a8f, #3b6fd4)' }}
            />
          </div>
          <span className="text-[11px] shrink-0 tabular-nums font-medium" style={{ color: 'var(--text-muted)' }}>
            {pct}%
          </span>
        </div>

        {/* Completion badge */}
        {done === total && total > 0 && (
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0"
            style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
            🎉 {isHe ? 'הושלם!' : 'Done!'}
          </span>
        )}

        {/* Desktop sidebar toggle — moved here, cleaner than a side strip */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="hidden md:flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-colors hover:bg-sand-400 shrink-0"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          {sidebarOpen
            ? <><span>{isHe ? '▶' : '◀'}</span> {isHe ? 'סגור' : 'Hide'}</>
            : <><span>{isHe ? '◀' : '▶'}</span> {isHe ? 'פתח' : 'Contents'}</>}
        </button>
      </div>

      {/* ── Body: sidebar + content ── */}
      <div className="flex flex-1 relative">

        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — on mobile: fixed overlay; on desktop: push layout */}
        <aside
          className={`
            border-e overflow-y-auto transition-all duration-300 shrink-0
            md:relative md:z-auto
            fixed inset-y-0 z-20 md:inset-auto
            ${isRtl ? 'right-0' : 'left-0'}
            ${sidebarOpen ? 'w-72' : 'w-0 md:w-0'}
          `}
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--bg-card)',
            top: 0,
            maxHeight: '100vh',
          }}
        >
          {/* Sidebar header */}
          <div className="px-4 pt-4 pb-3 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--border)' }}>
            <div>
              <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
                {isHe ? 'תוכן הקורס' : 'Course Content'}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {done}/{total} {isHe ? 'הושלמו' : 'completed'} · {MODULES.length} {isHe ? 'מודולים' : 'modules'}
              </p>
            </div>
            {/* Close button — visible on mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden flex items-center justify-center w-7 h-7 rounded-lg hover:bg-sand-400 transition-colors"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Module list */}
          {MODULES.map(module => (
            <ModuleGroup
              key={module.id}
              module={module}
              completed={completed}
              activeId={activeId}
              onSelect={(id) => { setActiveId(id); if (window.innerWidth < 768) setSidebarOpen(false) }}
            />
          ))}
        </aside>

        {/* Main content */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 98px)' }}
        >
          {activeSection && (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

              {/* Module hero — shown only on the first section of each module */}
              {activeModule && activeModule.sections[0]?.id === activeSection.id && (
                <ModuleHero
                  module={activeModule}
                  totalSections={activeModule.sections.length}
                  isHe={isHe}
                  onStart={() => {
                    const next = activeModule.sections[1]
                    if (next) setActiveId(next.id)
                  }}
                />
              )}

              {/* Breadcrumb — pill style, easier to scan */}
              <div className="flex items-center gap-1.5 flex-wrap mb-3">
                {activeModule && (
                  <>
                    <span className="text-[11px] px-2 py-0.5 rounded-md font-medium"
                      style={{ background: 'var(--bg-body)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                      {activeModule.icon} {isHe ? activeModule.titleHe : activeModule.title}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>›</span>
                  </>
                )}
                <span className="text-[11px] px-2 py-0.5 rounded-md font-medium"
                  style={{ background: 'var(--primary-50, #eff6ff)', color: 'var(--primary-700, #1d4ed8)', border: '1px solid var(--primary-200, #bfdbfe)' }}>
                  {typeLabel(activeSection.type, isHe)}
                </span>
                <span className="text-[11px] ms-auto tabular-nums" dir="ltr" style={{ color: 'var(--text-muted)' }}>
                  {activeIdx + 1} / {total}
                </span>
              </div>

              {/* Section title */}
              <h1 className="text-2xl font-black mb-6 leading-tight" style={{ color: 'var(--text-main)' }}>
                {isHe ? activeSection.titleHe : activeSection.title}
              </h1>

              {/* Section content */}
              <SectionContent
                section={activeSection}
                completed={completed.includes(activeSection.id)}
                onToggle={() => toggle(activeSection.id)}
              />

              {/* Navigation */}
              <div className="flex items-center justify-between mt-10 pt-6 border-t gap-3"
                style={{ borderColor: 'var(--border)' }}>
                <button
                  onClick={goPrev}
                  disabled={activeIdx === 0}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all hover:bg-sand-400 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ color: 'var(--text-main)', border: '1px solid var(--border)' }}
                >
                  {isHe ? '→ הקודם' : '← Previous'}
                </button>

                <button
                  onClick={() => { if (!completed.includes(activeSection.id)) toggle(activeSection.id); goNext() }}
                  disabled={activeIdx === total - 1}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  style={{ background: '#1a3a8f', color: '#fff', boxShadow: '0 2px 8px rgba(26,58,143,.25)' }}
                >
                  {isHe ? '← הבא' : 'Next →'}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
