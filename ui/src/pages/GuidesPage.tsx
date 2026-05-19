import { useState, useEffect } from 'react'

import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'
import EmojiObjectsOutlinedIcon from '@mui/icons-material/EmojiObjectsOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined'
import i18n from '../i18n'
import CodeSnippet from '../components/CodeSnippet'
import { COURSE, type GuideLesson, type GuideSection } from '../data/guidesData'

const STORAGE_KEY = 'guides_completed_v2'

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

function typeIcon(type: GuideLesson['type'] | undefined) {
  switch (type) {
    case 'video':    return <PlayCircleOutlinedIcon sx={{ fontSize: 14 }} />
    case 'practice': return <BuildOutlinedIcon sx={{ fontSize: 14 }} />
    case 'tips':     return <LightbulbOutlinedIcon sx={{ fontSize: 14 }} />
    case 'summary':  return <MenuBookOutlinedIcon sx={{ fontSize: 14 }} />
    case 'summary':  return <MenuBookOutlinedIcon sx={{ fontSize: 14 }} />
    default:         return <ArticleOutlinedIcon sx={{ fontSize: 14 }} />
  }
}

function typeLabel(type: GuideLesson['type'], isHe: boolean): string {
  const map: Record<GuideLesson['type'], [string, string]> = {
    video:    ['Video',    'וידאו'],
    article:  ['Article',  'מאמר'],
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

// ─── Lesson content panel ─────────────────────────────────────────────────────
function LessonContent({ lesson, completed, onToggle }: {
  lesson: GuideLesson
  completed: boolean
  onToggle: () => void
}) {
  const isHe = i18n.language === 'he'
  const body     = isHe ? lesson.bodyHe     : lesson.body
  const concepts = isHe ? lesson.conceptsHe : lesson.concepts

  if (lesson.type === 'practice') {
    return (
      <div className="flex flex-col gap-4">
        <div className="p-4 rounded-xl border-2 border-dashed"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}>
          <p className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
            <BuildOutlinedIcon sx={{ fontSize: 16 }} />
            {isHe ? 'משימת תרגול' : 'Practice Task'}
          </p>
          {body.split('\n\n').map((p, i) => (
            <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{p}</p>
          ))}
        </div>
        <CompleteButton completed={completed} onToggle={onToggle} isHe={isHe} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Level badge */}
      {lesson.level && (
        <span className={`self-start text-xs font-medium px-2 py-0.5 rounded-full ${levelColors[lesson.level]}`}>
          {isHe
            ? lesson.level === 'Beginner' ? 'מתחיל' : lesson.level === 'Intermediate' ? 'בינוני' : 'מתקדם'
            : lesson.level}
          {' · '}{lesson.duration}
        </span>
      )}

      {/* Body */}
      <div className="flex flex-col gap-3">
        {body.split('\n\n').map((para, i) => (
          <p key={i} className="text-sm leading-7" style={{ color: 'var(--text-muted)' }}>{para}</p>
        ))}
      </div>

      {/* Key concepts */}
      {concepts.length > 0 && (
        <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-body)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-main)' }}>
            <EmojiObjectsOutlinedIcon sx={{ fontSize: 13, marginRight: '6px' }} />
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
      {lesson.snippets.map((s, i) => (
        <div key={i}>
          <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
            {isHe ? s.labelHe : s.label}
          </p>
          <CodeSnippet code={s.code} language={s.language} />
        </div>
      ))}

      <CompleteButton completed={completed} onToggle={onToggle} isHe={isHe} />
    </div>
  )
}

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

// ─── Lesson row in sidebar ────────────────────────────────────────────────────
function LessonRow({ lesson, completed, active, onClick }: {
  lesson: GuideLesson
  completed: boolean
  active: boolean
  onClick: () => void
}) {
  const isHe = i18n.language === 'he'
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
        active ? 'bg-primary-50' : 'hover:bg-sand-400'
      }`}
    >
      <span className={`mt-0.5 shrink-0 ${completed ? 'text-sage-600' : ''}`}
        style={{ color: completed ? undefined : 'var(--text-muted)' }}>
        {completed
          ? <CheckCircleIcon sx={{ fontSize: 16 }} />
          : <RadioButtonUncheckedIcon sx={{ fontSize: 16 }} />}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-xs leading-snug ${active ? 'font-semibold text-primary-700' : ''}`}
          style={{ color: active ? undefined : 'var(--text-main)' }}>
          {isHe ? lesson.titleHe : lesson.title}
        </p>
        <span className="flex items-center gap-1 text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {typeIcon(lesson.type)}
          {typeLabel(lesson.type, isHe)}
          {lesson.duration && <> · {lesson.duration}</>}
        </span>
      </div>
    </button>
  )
}

// ─── Section in sidebar ───────────────────────────────────────────────────────
function SidebarSection({ section, completed, activeId, onSelect }: {
  section: GuideSection
  completed: string[]
  activeId: string
  onSelect: (id: string) => void
}) {
  const isHe = i18n.language === 'he'
  const [open, setOpen] = useState(
    section.lessons.some(l => l.id === activeId || !completed.includes(l.id))
  )
  const doneCount = section.lessons.filter(l => completed.includes(l.id)).length

  return (
    <div className="border-b" style={{ borderColor: 'var(--border)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-sand-400 transition-colors"
      >
        <span className="flex-1">
          <p className="text-xs font-semibold" style={{ color: 'var(--text-main)' }}>
            {isHe ? section.titleHe : section.title}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {doneCount}/{section.lessons.length} {isHe ? 'הושלמו' : 'completed'}
          </p>
        </span>
        <span style={{ color: 'var(--text-muted)' }}>
          {open ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
        </span>
      </button>
      {open && section.lessons.map(lesson => (
        <LessonRow
          key={lesson.id}
          lesson={lesson}
          completed={completed.includes(lesson.id)}
          active={lesson.id === activeId}
          onClick={() => onSelect(lesson.id)}
        />
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function GuidesPage() {
  const isHe = i18n.language === 'he'
  const { completed, toggle } = useCompleted()

  const allLessons = COURSE.sections.flatMap(s => s.lessons)
  const total = allLessons.length
  const done = completed.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const [activeId, setActiveId] = useState(() => allLessons[0]?.id ?? '')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const activeLesson = allLessons.find(l => l.id === activeId) ?? allLessons[0]
  const activeSection = COURSE.sections.find(s => s.lessons.some(l => l.id === activeId))

  // Navigate to next lesson automatically
  const goNext = () => {
    const idx = allLessons.findIndex(l => l.id === activeId)
    if (idx < allLessons.length - 1) setActiveId(allLessons[idx + 1].id)
  }
  const goPrev = () => {
    const idx = allLessons.findIndex(l => l.id === activeId)
    if (idx > 0) setActiveId(allLessons[idx - 1].id)
  }
  const activeIdx = allLessons.findIndex(l => l.id === activeId)

  return (

    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 56px)' }}>

      {/* ── Top progress bar ── */}
      <div className="border-b px-4 py-3 flex items-center gap-4 flex-wrap"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
        <div className="flex items-center gap-2 shrink-0">
          <MenuBookOutlinedIcon sx={{ fontSize: 18 }} className="text-primary-600" />
          <span className="font-black text-sm" style={{ color: 'var(--text-main)' }}>
            {isHe ? COURSE.titleHe : COURSE.title}
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
        {/* Sidebar toggle (mobile) */}
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
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', maxHeight: 'calc(100vh - 112px)', position: 'sticky', top: '0' }}
        >
          {/* Course meta */}
          <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-main)' }}>
              {isHe ? COURSE.subtitleHe : COURSE.subtitle}
            </p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {total} {isHe ? 'שיעורים' : 'lessons'} · {COURSE.sections.length} {isHe ? 'מקטעים' : 'sections'}
            </p>
          </div>

          {/* Section list */}
          {COURSE.sections.map(section => (
            <SidebarSection
              key={section.id}
              section={section}
              completed={completed}
              activeId={activeId}
              onSelect={(id) => { setActiveId(id); if (window.innerWidth < 768) setSidebarOpen(false) }}
            />
          ))}
        </aside>

        {/* Main content */}

        <main className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 112px)' }}>
          {activeLesson && (
            <div className="max-w-3xl mx-auto px-6 py-8">

              {/* Breadcrumb */}
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                {isHe ? activeSection?.titleHe : activeSection?.title}
                {' · '}
                {typeLabel(activeLesson.type, isHe)}
              </p>

              {/* Lesson title */}
              <h1 className="text-xl font-black mb-6" style={{ color: 'var(--text-main)' }}>
                {isHe ? activeLesson.titleHe : activeLesson.title}
              </h1>

              {/* Lesson content */}
              <LessonContent
                lesson={activeLesson}
                completed={completed.includes(activeLesson.id)}
                onToggle={() => toggle(activeLesson.id)}
              />

              {/* Navigation buttons */}
              <div className="flex items-center justify-between mt-10 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                <button
                  onClick={goPrev}
                  disabled={activeIdx === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-sand-400 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ color: 'var(--text-main)', border: '1px solid var(--border)' }}
                >
                  {isHe ? '→ הקודם' : '← Previous'}
                </button>

                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {activeIdx + 1} / {total}
                </span>

                <button
                  onClick={() => { if (!completed.includes(activeLesson.id)) toggle(activeLesson.id); goNext() }}
                  disabled={activeIdx === total - 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isHe ? '← הבא' : 'Next →'}
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
