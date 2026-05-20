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
  const body     = isHe ? section.bodyHe     : section.body
  const summary  = isHe ? section.summaryHe  : section.summary
  const concepts = isHe ? section.conceptsHe : section.concepts
  const snippets = section.snippets ?? []
  const Animation = SECTION_ANIMATIONS[section.id]

  return (
    <div className="flex flex-col gap-5">
      {/* Level + duration badge */}
      {section.level && (
        <span className={`self-start text-xs font-medium px-2 py-0.5 rounded-full ${levelColors[section.level]}`}>
          {isHe
            ? section.level === 'Beginner' ? 'מתחיל' : section.level === 'Intermediate' ? 'בינוני' : 'מתקדם'
            : section.level}
          {section.minutes ? ` · ${section.minutes} min` : ''}
        </span>
      )}

      {/* Summary lead */}
      {summary && (
        <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-main)' }}>
          {summary}
        </p>
      )}

      {/* Section illustration / animation */}
      {Animation && <Animation />}

      {/* Body paragraphs */}
      {body && (
        <div className="flex flex-col gap-3">
          {body.split('\n\n').map((para, i) => (
            <p key={i} className="text-sm leading-7" style={{ color: 'var(--text-muted)' }}>{para}</p>
          ))}
        </div>
      )}

      {/* Key concepts */}
      {concepts && concepts.length > 0 && (
        <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-body)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-1.5"
            style={{ color: 'var(--text-main)' }}>
            <EmojiObjectsOutlinedIcon sx={{ fontSize: 13 }} />
            {isHe ? 'מושגי מפתח' : 'Key Concepts'}
          </p>
          <ul className="flex flex-col gap-2">
            {concepts.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary-600 shrink-0" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Code snippets */}
      {snippets.map((s, i) => (
        <div key={i}>
          <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
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
  const [sidebarOpen, setSidebarOpen] = useState(true)

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

      {/* ── Top progress bar ── */}
      <div className="border-b px-4 py-3 flex items-center gap-4 flex-wrap"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
        <div className="flex items-center gap-2 shrink-0">
          <MenuBookOutlinedIcon sx={{ fontSize: 18 }} className="text-primary-600" />
          <span className="font-black text-sm" style={{ color: 'var(--text-main)' }}>
            {isHe ? 'קורס QA אוטומציה' : 'QA Automation Course'}
          </span>
        </div>
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-body)' }}>
            <div className="h-full rounded-full bg-primary-600 transition-all duration-500"
              style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
            {done}/{total} {isHe ? 'הושלמו' : 'completed'} · {pct}%
          </span>
        </div>
        {done === total && total > 0 && (
          <span className="text-xs font-semibold text-sage-700 bg-sage-100 px-2 py-0.5 rounded-full shrink-0">
            🎉 {isHe ? 'קורס הושלם!' : 'Course complete!'}
          </span>
        )}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="shrink-0 text-xs px-3 py-1.5 rounded-lg border transition-colors hover:bg-sand-400 md:hidden"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          {isHe ? 'תוכן הקורס' : 'Course content'}
        </button>
      </div>

      {/* ── Body: sidebar + content ── */}
      <div className="flex flex-1">

        {/* Sidebar */}
        <aside
          className={`border-e overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-0'} shrink-0`}
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--bg-card)',
            maxHeight: 'calc(100vh - 112px)',
            position: 'sticky',
            top: '0',
          }}
        >
          {/* Sidebar meta */}
          <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-main)' }}>
              {isHe ? 'תוכן הקורס' : 'Course Content'}
            </p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {total} {isHe ? 'סעיפים' : 'sections'} · {MODULES.length} {isHe ? 'מודולים' : 'modules'}
            </p>
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
        <main className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 112px)' }}>
          {activeSection && (
            <div className="max-w-3xl mx-auto px-6 py-8">

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

              {/* Breadcrumb */}
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                {activeModule && (
                  <>{activeModule.icon} {isHe ? activeModule.titleHe : activeModule.title} · </>
                )}
                {typeLabel(activeSection.type, isHe)}
              </p>

              {/* Section title */}
              <h1 className="text-xl font-black mb-6" style={{ color: 'var(--text-main)' }}>
                {isHe ? activeSection.titleHe : activeSection.title}
              </h1>

              {/* Section content */}
              <SectionContent
                section={activeSection}
                completed={completed.includes(activeSection.id)}
                onToggle={() => toggle(activeSection.id)}
              />

              {/* Navigation */}
              <div className="flex items-center justify-between mt-10 pt-6 border-t"
                style={{ borderColor: 'var(--border)' }}>
                <button
                  onClick={goPrev}
                  disabled={activeIdx === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-sand-400 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ color: 'var(--text-main)', border: '1px solid var(--border)' }}
                >
                  {isHe ? '← הקודם' : '← Previous'}
                </button>

                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {activeIdx + 1} / {total}
                </span>

                <button
                  onClick={() => { if (!completed.includes(activeSection.id)) toggle(activeSection.id); goNext() }}
                  disabled={activeIdx === total - 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isHe ? 'הבא →' : 'Next →'}
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Sidebar toggle desktop */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="hidden md:flex items-center justify-center w-6 border-e self-stretch hover:bg-sand-400 transition-colors shrink-0"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          title={sidebarOpen ? (isHe ? 'סגור סרגל צד' : 'Collapse sidebar') : (isHe ? 'פתח סרגל צד' : 'Expand sidebar')}
        >
          {sidebarOpen
            ? <span className="text-[10px]">{isHe ? '▶' : '◀'}</span>
            : <span className="text-[10px]">{isHe ? '◀' : '▶'}</span>}
        </button>
      </div>
    </div>
  )
}
