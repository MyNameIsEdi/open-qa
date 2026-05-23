import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  Play, Square, RotateCcw, Download, Bug, Eye, Camera,
  ChevronDown, ChevronUp, CheckCircle2, XCircle, MinusCircle,
  Circle, AlertTriangle, X, Settings, LayoutDashboard,
  Globe, Monitor, Film, FileText, Code2, Copy, Check,
  Search, Clock, TrendingUp, Zap, FolderOpen, Save,
  BookOpen, Terminal, MousePointer2, FlaskConical, Layers,
  ExternalLink, Hash, Grid3x3, List, Tag,
  PenLine, Plus, Trash2, RefreshCw, CheckSquare,
  Send, Paperclip,
} from 'lucide-react'
import { OfficeCanvas }                        from '../office/components/OfficeCanvas'
import { OfficeState }                         from '../office/engine/officeState'
import { loadDefaultLayout, loadOfficeAssets } from '../office/assetLoader'
import { useSettings, TEAM_MANAGER_ID }        from '../context/SettingsContext'
import type { AgentConfig, Attachment, Message, SpriteType, QASummaryData } from '../context/SettingsContext'
import type { OfficeLayout }                   from '../office/types'

// ─── Types ───────────────────────────────────────────────────────────────────

type Status       = 'passed' | 'failed' | 'skipped' | 'pending' | 'running'
type FilterKey    = 'all' | 'active' | 'passed' | 'failed' | 'skipped'
type ViewKey      = 'dashboard' | 'docs'
type DashboardMode = 'list' | 'matrix'
type BrowserKey   = 'chromium' | 'firefox' | 'webkit'
type ErrorType    = 'Timeout' | 'Assertion' | 'Locator' | 'Network' | 'Error'

interface BrowserResult {
  browser: BrowserKey
  status: Status
  duration: number
}

interface TestStep {
  title: string
  duration: number
  status: 'passed' | 'failed'
}

interface TestCase {
  id: string
  title: string
  status: Status
  duration: number
  browser: BrowserKey
  error?: string
  retries?: number
  tags?: string[]
  browserResults?: BrowserResult[]
  steps?: TestStep[]
}

interface TestSuite {
  id: string
  file: string
  title: string
  tests: TestCase[]
}

interface ArtifactModalState {
  testId: string
  testTitle: string
}

/** A single archived run returned by GET /api/playwright/history */
interface RunRecord {
  id: string
  runAt: string
  total: number
  passed: number
  failed: number
  skipped: number
  flaky: number
  duration: number
  spec?: string | null
}


// ─── Playwright Config Type ───────────────────────────────────────────────────

interface PlaywrightConfig {
  baseUrl: string
  testDir: string
  outputDir: string
  timeout: number
  retries: number
  workers: number
  browsers: { chromium: boolean; firefox: boolean; webkit: boolean }
  screenshot: 'on' | 'off' | 'only-on-failure'
  video: 'on' | 'off' | 'retain-on-failure'
  trace: 'on' | 'off' | 'retain-on-failure' | 'on-first-retry'
  reporter: 'html' | 'json' | 'junit' | 'line' | 'dot'
  headed: boolean
  forbidOnly: boolean
  fullyParallel: boolean
  // Test-run filters
  grep: string
  grepInvert: string
}

const DEFAULT_CONFIG: PlaywrightConfig = {
  baseUrl: 'http://localhost:3000',
  testDir: './tests',
  outputDir: 'test-results',
  timeout: 30000,
  retries: 1,
  workers: 4,
  browsers: { chromium: true, firefox: false, webkit: false },
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'on-first-retry',
  reporter: 'html',
  headed: false,
  forbidOnly: true,
  fullyParallel: true,
  grep: '',
  grepInvert: '',
}

const STORAGE_KEY     = 'pw_dashboard_config_v1'
const RUN_HISTORY_KEY = 'pw_run_history_v1'
const API_BASE        = 'http://localhost:3001'

const PW_TEXT_EXTENSIONS = new Set([
  'ts', 'tsx', 'js', 'jsx', 'json', 'log', 'txt', 'md',
  'css', 'html', 'xml', 'yaml', 'yml', 'sh', 'py', 'java', 'cs',
])

/** Per-sprite accent palette for PW panel agent cards */
const PW_SPRITE_ACCENT: Record<SpriteType, { bg: string; ring: string; text: string; bar: string }> = {
  tester:  { bg: '#0d2a1a', ring: '#166534', text: '#4ade80', bar: '#22c55e' },
  dev:     { bg: '#0f1f3d', ring: '#1d4ed8', text: '#60a5fa', bar: '#3b82f6' },
  analyst: { bg: '#1e0a40', ring: '#7c3aed', text: '#c084fc', bar: '#a855f7' },
  devops:  { bg: '#2a0e02', ring: '#c2410c', text: '#fb923c', bar: '#f97316' },
  manager: { bg: '#2a1200', ring: '#d97706', text: '#fbbf24', bar: '#f59e0b' },
}

// ─── PW-Dashboard OfficeState singleton ──────────────────────────────────────
// Separate from OfficePage's _officeState — same cached assets, different instance.
let _pwOfficeState: OfficeState | null = null
function pwAgentNumId(idx: number) { return idx + 1 }

// ─── Run History ──────────────────────────────────────────────────────────────

const CHART_H = 32

/** Format a runAt ISO string into a short label */
function fmtRunLabel(runAt: string): string {
  try {
    const d   = new Date(runAt)
    const now = new Date()
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  } catch { return '?' }
}

function HistoryChart({
  runs,
  selectedId,
  onSelect,
}: {
  runs: RunRecord[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const displayed  = runs.slice().reverse()   // oldest → newest left → right
  const maxTotal   = Math.max(...displayed.map(r => r.total), 1)

  if (runs.length === 0) {
    return (
      <div className="rounded-2xl overflow-hidden mb-6"
        style={{ backgroundColor: 'var(--bg-card)', boxShadow: '0 2px 8px -2px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-2 px-4 py-2.5 border-b"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}>
          <TrendingUp size={13} style={{ color: '#3b82f6' }} />
          <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Run History</span>
        </div>
        <div className="px-4 py-4 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          No run history yet — click <strong>Run Tests</strong> to record your first run.
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden mb-6"
      style={{ backgroundColor: 'var(--bg-card)', boxShadow: '0 2px 8px -2px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}>
        <div className="flex items-center gap-2">
          <TrendingUp size={13} style={{ color: '#3b82f6' }} />
          <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Run History</span>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            · {runs.length} run{runs.length !== 1 ? 's' : ''} · click a bar to view
          </span>
        </div>
        <div className="flex items-center gap-4">
          {([['#10b981', 'Passed'], ['#ef4444', 'Failed'], ['#fbbf24', 'Skipped']] as const).map(([color, label]) => (
            <span key={label} className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <span className="w-2 h-2 rounded-sm inline-block shrink-0" style={{ backgroundColor: color }} />
              {label}
            </span>
          ))}
        </div>
      </div>
      <div className="px-5 py-3">
        <div className="flex gap-2" style={{ height: CHART_H + 20 }}>
          {displayed.map(run => {
            const passH      = Math.round((run.passed  / maxTotal) * CHART_H)
            const failH      = Math.round((run.failed  / maxTotal) * CHART_H)
            const skipH      = Math.round((run.skipped / maxTotal) * CHART_H)
            const isSelected = run.id === selectedId
            return (
              <div
                key={run.id}
                onClick={() => onSelect(run.id)}
                title={`${new Date(run.runAt).toLocaleString()}\n${run.passed}✓  ${run.failed}✗  ${run.skipped}–\n${formatMs(run.duration)}`}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 5, cursor: 'pointer',
                  opacity: selectedId === null || isSelected ? 1 : 0.55,
                  transition: 'opacity 150ms',
                }}
              >
                <div style={{
                  flex: 1, width: '100%', position: 'relative',
                  outline: isSelected ? '2px solid #3b82f6' : undefined,
                  borderRadius: 3,
                }}>
                  {passH > 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: passH, backgroundColor: '#10b981', borderRadius: failH === 0 && skipH === 0 ? '3px 3px 0 0' : '0' }} />}
                  {failH > 0 && <div style={{ position: 'absolute', bottom: passH, left: 0, right: 0, height: failH, backgroundColor: '#ef4444', borderRadius: skipH === 0 ? '3px 3px 0 0' : '0' }} />}
                  {skipH > 0 && <div style={{ position: 'absolute', bottom: passH + failH, left: 0, right: 0, height: skipH, backgroundColor: '#fbbf24', borderRadius: '3px 3px 0 0' }} />}
                </div>
                <span style={{
                  fontSize: 9, flexShrink: 0, lineHeight: 1,
                  color: isSelected ? '#3b82f6' : '#94a3b8',
                  fontWeight: isSelected ? 700 : 400,
                }}>
                  {fmtRunLabel(run.runAt)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Runs Panel (collapsible table of all recorded runs) ──────────────────────

function RunsPanel({
  runs,
  selectedId,
  onSelect,
  onLoadLatest,
  onClearHistory,
  isDemo,
}: {
  runs: RunRecord[]
  selectedId: string | null
  onSelect: (id: string) => void
  onLoadLatest: () => void
  onClearHistory: () => void
  isDemo: boolean
}) {
  // Open by default when there is real data
  const [open, setOpen] = useState(!isDemo && runs.length > 0)
  const [confirmClear, setConfirmClear] = useState(false)

  // Keep open state in sync when runs first arrive
  React.useEffect(() => {
    if (!isDemo && runs.length > 0) setOpen(true)
  }, [isDemo, runs.length])

  if (runs.length === 0) return null

  const total = runs.length  // used for #N numbering (newest = #total)

  return (
    <div className="rounded-2xl overflow-hidden mb-8"
      style={{ backgroundColor: 'var(--bg-card)', boxShadow: '0 2px 8px -2px rgba(0,0,0,0.06)' }}>

      {/* ── header ── */}
      <button
        className="w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors"
        onClick={() => setOpen(o => !o)}
        style={{ backgroundColor: 'var(--bg-body)' }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        <Clock size={13} style={{ color: '#6366f1' }} />
        <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Run History</span>
        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>· {runs.length} run{runs.length !== 1 ? 's' : ''} recorded</span>
        {isDemo && (
          <span className="text-[10px] px-2 py-px rounded-full bg-amber-50 text-amber-600 border border-amber-200">demo</span>
        )}
        {selectedId && !isDemo && (
          <span className="text-[10px] font-bold px-2 py-px rounded-full bg-blue-50 text-blue-600 border border-blue-200">
            viewing #{total - runs.findIndex(r => r.id === selectedId)}
          </span>
        )}
        <div className="ml-auto flex items-center gap-3">
          {selectedId && !isDemo && (
            <button
              onClick={e => { e.stopPropagation(); onLoadLatest() }}
              className="text-[11px] font-semibold text-blue-600 hover:underline"
            >
              ← Latest
            </button>
          )}
          {!isDemo && !confirmClear && (
            <button
              onClick={e => { e.stopPropagation(); setConfirmClear(true) }}
              className="text-[11px] font-semibold hover:underline"
              style={{ color: 'var(--text-muted)' }}
            >
              Clear history
            </button>
          )}
          {!isDemo && confirmClear && (
            <span className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Are you sure?</span>
              <button
                onClick={() => { setConfirmClear(false); onClearHistory() }}
                className="text-[11px] font-bold text-red-500 hover:underline"
              >Yes, clear</button>
              <button
                onClick={() => setConfirmClear(false)}
                className="text-[11px] font-semibold hover:underline"
                style={{ color: 'var(--text-muted)' }}
              >Cancel</button>
            </span>
          )}
          {open
            ? <ChevronUp  size={13} style={{ color: 'var(--text-muted)' }} />
            : <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />}
        </div>
      </button>

      {/* ── table ── */}
      {open && (
        <div className="overflow-x-auto border-t" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-body)' }}>
                <th className="text-left px-4 py-2 font-semibold w-8"  style={{ color: 'var(--text-muted)' }}>#</th>
                <th className="text-left px-2 py-2 font-semibold"       style={{ color: 'var(--text-muted)' }}>Date</th>
                <th className="text-left px-2 py-2 font-semibold"       style={{ color: 'var(--text-muted)' }}>Spec</th>
                <th className="text-right px-3 py-2 font-semibold"      style={{ color: 'var(--text-muted)' }}>Total</th>
                <th className="text-right px-3 py-2 font-semibold text-emerald-600">✓</th>
                <th className="text-right px-3 py-2 font-semibold text-red-500">✗</th>
                <th className="text-right px-3 py-2 font-semibold text-amber-500">–</th>
                <th className="text-right px-3 py-2 font-semibold"      style={{ color: 'var(--text-muted)' }}>Duration</th>
                <th className="text-right px-4 py-2 font-semibold"      style={{ color: 'var(--text-muted)' }}>Pass %</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run, i) => {
                const isSelected = run.id === selectedId
                const prevRun    = runs[i + 1]   // runs[0] = newest
                const dFail      = prevRun != null ? run.failed - prevRun.failed : 0
                const hasDelta   = prevRun != null && dFail !== 0
                const rate       = run.total > 0 ? Math.round((run.passed / run.total) * 100) : 0
                const runNum     = total - i

                return (
                  <tr
                    key={run.id}
                    onClick={() => !isDemo && onSelect(run.id)}
                    className={`transition-colors ${isDemo ? '' : 'cursor-pointer'}`}
                    style={{
                      borderBottom: i < runs.length - 1 ? '1px solid var(--border)' : undefined,
                      backgroundColor: isSelected ? 'rgba(59,130,246,0.06)' : 'var(--bg-card)',
                    }}
                    onMouseEnter={e => { if (!isSelected && !isDemo) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-body)' }}
                    onMouseLeave={e => {  (e.currentTarget as HTMLElement).style.backgroundColor = isSelected ? 'rgba(59,130,246,0.06)' : 'var(--bg-card)' }}
                  >
                    {/* # */}
                    <td className="px-4 py-2.5 font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {isSelected
                        ? <span className="font-bold text-blue-600">#{runNum}</span>
                        : `#${runNum}`}
                    </td>
                    {/* Date + latest badge */}
                    <td className="px-2 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium" style={{ color: 'var(--text-main)' }}>
                          {new Date(run.runAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {i === 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-px rounded-full bg-blue-50 text-blue-600 border border-blue-200 shrink-0">latest</span>
                        )}
                        {hasDelta && (
                          <span className={`text-[10px] font-bold px-1.5 py-px rounded-full shrink-0 ${dFail > 0 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                            {dFail > 0 ? `+${dFail}✗` : `${dFail}✗`}
                          </span>
                        )}
                      </div>
                    </td>
                    {/* Spec */}
                    <td className="px-2 py-2.5 max-w-[160px]">
                      {run.spec
                        ? <span className="font-mono text-[10px] truncate block" style={{ color: 'var(--text-muted)' }}>
                            {run.spec
                              .replace(/^tests[\\/]/g, '')          // strip leading tests/
                              .replace(/,tests[\\/]/g, ', ')        // strip tests/ after comma
                              .replace(/\.spec\.(ts|js)/g, '')      // strip .spec.ts extension
                            }
                          </span>
                        : <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>all</span>}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono"                                                         style={{ color: 'var(--text-muted)' }}>{run.total}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold text-emerald-600">{run.passed}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold"                  style={{ color: run.failed > 0 ? '#ef4444' : 'var(--text-muted)' }}>{run.failed}</td>
                    <td className="px-3 py-2.5 text-right font-mono"                                style={{ color: run.skipped > 0 ? '#d97706' : 'var(--text-muted)' }}>{run.skipped}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-[11px]"                   style={{ color: 'var(--text-muted)' }}>{formatMs(run.duration)}</td>
                    <td className="px-4 py-2.5 text-right font-bold"                                style={{ color: rate >= 80 ? '#059669' : '#ef4444' }}>{rate}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Config Generator ─────────────────────────────────────────────────────────

function generateConfig(c: PlaywrightConfig): string {
  const DEVICE_MAP: Record<string, string> = {
    chromium: 'Desktop Chrome',
    firefox:  'Desktop Firefox',
    webkit:   'Desktop Safari',
  }
  const browsers = (Object.keys(c.browsers) as Array<keyof typeof c.browsers>)
    .filter(k => c.browsers[k])
    .map(k => `    { name: '${k}', use: { ...devices['${DEVICE_MAP[k]}'] } },`)
    .join('\n')

  return `import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: '${c.testDir}',
  outputDir: '${c.outputDir}',
  fullyParallel: ${c.fullyParallel},
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : ${c.retries},
  workers: process.env.CI ? 1 : ${c.workers},
  timeout: ${c.timeout},
  reporter: '${c.reporter}',

  use: {
    baseURL: '${c.baseUrl}',
    headless: ${!c.headed},
    screenshot: '${c.screenshot}',
    video: '${c.video}',
    trace: '${c.trace}',
  },

  projects: [
${browsers || '    // No browsers selected'}
  ],
})`
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMs(ms: number) {
  if (ms === 0) return '—'
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`
}

function StatusIcon({ status, size = 15 }: { status: Status; size?: number }) {
  const s = size
  if (status === 'passed')  return <CheckCircle2 size={s} className="text-emerald-500 shrink-0" />
  if (status === 'failed')  return <XCircle      size={s} className="text-red-500 shrink-0" />
  if (status === 'skipped') return <MinusCircle  size={s} className="text-amber-400 shrink-0" />
  if (status === 'running') return (
    <span className="inline-block shrink-0" style={{ width: s, height: s }}>
      <span className="block w-full h-full rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
    </span>
  )
  return <Circle size={s} className="shrink-0" style={{ color: 'var(--text-muted)' }} />
}

function StatusBadge({ status }: { status: Status }) {
  const base = 'text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase'
  if (status === 'passed')  return <span className={`${base}`} style={{ background: 'rgba(16,185,129,0.12)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)' }}>pass</span>
  if (status === 'failed')  return <span className={`${base}`} style={{ background: 'rgba(239,68,68,0.12)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}>fail</span>
  if (status === 'skipped') return <span className={`${base}`} style={{ background: 'rgba(251,191,36,0.12)', color: '#d97706', border: '1px solid rgba(251,191,36,0.2)' }}>skip</span>
  if (status === 'running') return <span className={`${base}`} style={{ background: 'rgba(59,130,246,0.12)', color: '#2563eb', border: '1px solid rgba(59,130,246,0.2)' }}>running…</span>
  return <span className={`${base}`} style={{ background: 'rgba(148,163,184,0.1)', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.15)' }}>pending</span>
}

// ─── Settings Sub-components ──────────────────────────────────────────────────

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      style={{ backgroundColor: checked ? '#2563eb' : '#d1d5db' }}
    >
      <span
        className="inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)' }}
      />
    </button>
  )
}

function SelectControl({
  value, onChange, options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="px-3 py-1.5 rounded-lg border text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)', color: 'var(--text-main)' }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function TextInput({ value, onChange, mono = true, width = 'w-48', placeholder }: {
  value: string; onChange: (v: string) => void; mono?: boolean; width?: string; placeholder?: string
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className={`px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 ${mono ? 'font-mono' : ''} ${width}`}
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)', color: 'var(--text-main)' }}
    />
  )
}

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 py-3 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
      <div className="min-w-0">
        <p className="text-xs font-semibold" style={{ color: 'var(--text-main)' }}>{label}</p>
        {desc && <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function SettingCard({ icon, title, subtitle, children, warning }: {
  icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode; warning?: string
}) {
  return (
    <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: warning ? '#fca5a5' : 'var(--border)' }}>
      <div className="flex items-center gap-2.5 px-4 py-3 border-b"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}>
        <span style={{ color: warning ? '#ef4444' : '#3b82f6' }}>{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>{title}</p>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
        </div>
        {warning && (
          <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0"
            style={{ background: '#fee2e2', color: '#b91c1c' }}>
            <AlertTriangle size={10} /> {warning}
          </span>
        )}
      </div>
      <div className="px-4" style={{ backgroundColor: 'var(--bg-card)' }}>
        {children}
      </div>
    </div>
  )
}

// ─── Presets ──────────────────────────────────────────────────────────────────

interface Preset {
  label: string
  icon: React.ReactNode
  description: string
  color: string
  config: Partial<PlaywrightConfig>
  /** If set, auto-selects these spec files when the preset is applied */
  specs?: string[]
}

/** Shared Playwright config for all SV Students suites (Render free-tier) */
const SV_CONFIG: Partial<PlaywrightConfig> = {
  baseUrl:       'https://sv-students-recommend.onrender.com',
  testDir:       './tests',
  timeout:       60000,
  retries:       1,
  workers:       1,
  headed:        false,
  fullyParallel: false,
  browsers:      { chromium: true, firefox: false, webkit: false },
  screenshot:    'only-on-failure',
  video:         'retain-on-failure',
  trace:         'on-first-retry',
  reporter:      'html',
}

// Bare filenames — no path prefix — matching what /api/playwright/specs returns.
// The server prepends 'tests/' when building the Playwright CLI args.
const SV_ALL_SPECS = [
  'sv-login.spec.ts',
  'sv-register.spec.ts',
  'sv-home.spec.ts',
  'sv-api.spec.ts',
  'sv-docs.spec.ts',
  'sv-a11y.spec.ts',
  'sv-navigation.spec.ts',
]

const PRESETS: Preset[] = [
  {
    label: 'Local Dev',
    icon: <Monitor size={13} />,
    description: 'Headed, all artifacts on, fast feedback loop',
    color: '#059669',
    config: {
      headed: true, retries: 0, workers: 2, timeout: 30000,
      trace: 'on', screenshot: 'on', video: 'on', reporter: 'html',
    },
  },
  {
    label: 'CI / CD',
    icon: <Zap size={13} />,
    description: 'Headless, JUnit reporter, 2 retries, 1 worker',
    color: '#2563eb',
    config: {
      headed: false, timeout: 60000, retries: 2, workers: 1,
      forbidOnly: true, fullyParallel: true,
      trace: 'on-first-retry', screenshot: 'only-on-failure',
      video: 'retain-on-failure', reporter: 'junit',
    },
  },
  {
    label: 'SV: All',
    icon: <FlaskConical size={13} />,
    description: 'Full SV Students suite — all 7 spec files',
    color: '#0891b2',
    specs: SV_ALL_SPECS,
    config: SV_CONFIG,
  },
  {
    label: 'SV: Login',
    icon: <Hash size={13} />,
    description: 'Login structure, validation, forgot-password & register',
    color: '#7c3aed',
    specs: ['sv-login.spec.ts', 'sv-register.spec.ts'],
    config: SV_CONFIG,
  },
  {
    label: 'SV: Home',
    icon: <Layers size={13} />,
    description: 'Home feed — auth redirect, structure, filters, modals',
    color: '#d97706',
    specs: ['sv-home.spec.ts'],
    config: SV_CONFIG,
  },
  {
    label: 'SV: API',
    icon: <Globe size={13} />,
    description: 'Public & authenticated REST API endpoints',
    color: '#059669',
    specs: ['sv-api.spec.ts'],
    config: SV_CONFIG,
  },
  {
    label: 'SV: Docs & A11y',
    icon: <BookOpen size={13} />,
    description: 'Swagger UI rendering + Hebrew accessibility page',
    color: '#e11d48',
    specs: ['sv-docs.spec.ts', 'sv-a11y.spec.ts'],
    config: SV_CONFIG,
  },
]

// ─── Settings View ────────────────────────────────────────────────────────────

const REPORTER_DESCRIPTIONS: Record<PlaywrightConfig['reporter'], string> = {
  html:   'Interactive HTML report — best for local debugging and sharing results',
  json:   'Raw JSON output — ideal for CI pipelines and custom tooling',
  junit:  'JUnit XML — compatible with Jenkins, GitLab CI, and most CI/CD tools',
  line:   'Single-line per test — minimal and fast output in terminal',
  dot:    'One dot per test — ultra-compact, ideal for large suites in CI',
}

function SettingsView({ config, onChange, noPresets = false }: { config: PlaywrightConfig; onChange: (c: PlaywrightConfig) => void; noPresets?: boolean }) {
  const [copied, setCopied]     = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const configCode = useMemo(() => generateConfig(config), [config])
  const noBrowsers = !Object.values(config.browsers).some(Boolean)

  const set = <K extends keyof PlaywrightConfig>(key: K, value: PlaywrightConfig[K]) =>
    onChange({ ...config, [key]: value })

  const copyConfig = async () => {
    await navigator.clipboard.writeText(configCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadConfig = () => {
    const blob = new Blob([configCode], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'playwright.config.ts'; a.click()
    URL.revokeObjectURL(url)
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 2000)
  }

  const applyPreset = (preset: Preset) => onChange({ ...config, ...preset.config })

  return (
    <div className="flex flex-col gap-5">

      {/* ── Quick Presets ── */}
      {!noPresets && (
      <div className="rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 8px -2px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-2 px-4 py-2.5 border-b"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}>
          <Zap size={13} style={{ color: '#8b5cf6' }} />
          <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Quick Presets</span>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>— one click to apply a battle-tested configuration</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
          {PRESETS.map(preset => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              className="flex flex-col items-start gap-2 p-3 rounded-xl border text-left transition-all duration-150"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = preset.color
                e.currentTarget.style.backgroundColor = 'var(--bg-card)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.backgroundColor = 'var(--bg-body)'
              }}
            >
              <div className="flex items-center gap-1.5">
                <span style={{ color: preset.color }}>{preset.icon}</span>
                <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>{preset.label}</span>
              </div>
              <span className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{preset.description}</span>
            </button>
          ))}
        </div>
      </div>
      )}

      {/* ── Main grid: left settings + right preview ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Left: Setting groups */}
        <div className="lg:col-span-3 flex flex-col gap-4">

          {/* General */}
          <SettingCard icon={<Globe size={14} />} title="General" subtitle="Base URL, timeouts, parallelism and CI options">
            <SettingRow label="Base URL" desc="Root URL used in page.goto('/path') calls">
              <TextInput value={config.baseUrl} onChange={v => set('baseUrl', v)} width="w-52" />
            </SettingRow>
            <SettingRow label="Timeout" desc="Default assertion + action timeout per test">
              <SelectControl
                value={String(config.timeout)}
                onChange={v => set('timeout', Number(v))}
                options={[
                  { value: '10000', label: '10 s' },
                  { value: '20000', label: '20 s' },
                  { value: '30000', label: '30 s' },
                  { value: '60000', label: '60 s' },
                  { value: '120000', label: '120 s' },
                ]}
              />
            </SettingRow>
            <SettingRow label="Retries" desc="Automatically retry failing tests">
              <SelectControl
                value={String(config.retries)}
                onChange={v => set('retries', Number(v))}
                options={[
                  { value: '0', label: '0 — disabled' },
                  { value: '1', label: '1 retry' },
                  { value: '2', label: '2 retries' },
                  { value: '3', label: '3 retries' },
                ]}
              />
            </SettingRow>
            <SettingRow label="Workers" desc="Parallel worker processes for test execution">
              <SelectControl
                value={String(config.workers)}
                onChange={v => set('workers', Number(v))}
                options={[
                  { value: '1', label: '1 (serial)' },
                  { value: '2', label: '2 workers' },
                  { value: '4', label: '4 workers' },
                  { value: '8', label: '8 workers' },
                ]}
              />
            </SettingRow>
            <SettingRow label="Fully Parallel" desc="Each test file runs in its own worker process">
              <ToggleSwitch checked={config.fullyParallel} onChange={v => set('fullyParallel', v)} />
            </SettingRow>
            <SettingRow label="Forbid .only" desc="Fail the run if test.only is accidentally committed">
              <ToggleSwitch checked={config.forbidOnly} onChange={v => set('forbidOnly', v)} />
            </SettingRow>
            <SettingRow label="Headed mode" desc="Run tests with a visible browser window">
              <ToggleSwitch checked={config.headed} onChange={v => set('headed', v)} />
            </SettingRow>
          </SettingCard>

          {/* Test Paths */}
          <SettingCard icon={<FolderOpen size={14} />} title="Test Paths" subtitle="Directories for specs and output artifacts">
            <SettingRow label="Test directory" desc="Root folder Playwright scans for spec files">
              <TextInput value={config.testDir} onChange={v => set('testDir', v)} width="w-44" />
            </SettingRow>
            <SettingRow label="Output directory" desc="Where screenshots, videos, and traces are saved">
              <TextInput value={config.outputDir} onChange={v => set('outputDir', v)} width="w-44" />
            </SettingRow>
          </SettingCard>

          {/* Browsers */}
          <SettingCard
            icon={<Monitor size={14} />}
            title="Browsers"
            subtitle="Select which browser engines to run tests against"
            warning={noBrowsers ? 'None selected' : undefined}
          >
            {([
              { key: 'chromium', label: 'Chromium', desc: 'Chrome & Edge — fastest, widest coverage' },
              { key: 'firefox',  label: 'Firefox',  desc: 'Gecko engine — catches Firefox-specific bugs' },
              { key: 'webkit',   label: 'WebKit',   desc: 'Safari engine — essential for macOS & iOS' },
            ] as const).map(({ key, label, desc }) => (
              <SettingRow key={key} label={label} desc={desc}>
                <ToggleSwitch
                  checked={config.browsers[key]}
                  onChange={v => set('browsers', { ...config.browsers, [key]: v })}
                />
              </SettingRow>
            ))}
            {noBrowsers && (
              <div className="flex items-center gap-2 py-2.5 text-[11px]" style={{ color: '#b91c1c' }}>
                <AlertTriangle size={12} className="shrink-0" />
                At least one browser must be enabled to run tests.
              </div>
            )}
          </SettingCard>

          {/* Artifacts */}
          <SettingCard icon={<Film size={14} />} title="Artifacts" subtitle="Control when screenshots, videos and traces are saved">
            <SettingRow label="Screenshots" desc="Capture a PNG snapshot of the page">
              <SelectControl
                value={config.screenshot}
                onChange={v => set('screenshot', v as PlaywrightConfig['screenshot'])}
                options={[
                  { value: 'off',              label: 'Off' },
                  { value: 'only-on-failure',  label: 'On failure only' },
                  { value: 'on',               label: 'Always' },
                ]}
              />
            </SettingRow>
            <SettingRow label="Video" desc="Record a video of each test run">
              <SelectControl
                value={config.video}
                onChange={v => set('video', v as PlaywrightConfig['video'])}
                options={[
                  { value: 'off',                label: 'Off' },
                  { value: 'retain-on-failure',  label: 'Keep on failure' },
                  { value: 'on',                 label: 'Always' },
                ]}
              />
            </SettingRow>
            <SettingRow label="Trace" desc="Playwright trace for time-travel debugging">
              <SelectControl
                value={config.trace}
                onChange={v => set('trace', v as PlaywrightConfig['trace'])}
                options={[
                  { value: 'off',                label: 'Off' },
                  { value: 'on-first-retry',     label: 'On first retry' },
                  { value: 'retain-on-failure',  label: 'Keep on failure' },
                  { value: 'on',                 label: 'Always' },
                ]}
              />
            </SettingRow>
          </SettingCard>

          {/* Test Filtering */}
          <SettingCard icon={<Search size={14} />} title="Test Filtering" subtitle="Narrow which tests run by title or pattern">
            <SettingRow label="Grep (include)" desc="Only run tests whose title matches this pattern (regex or plain string)">
              <TextInput
                value={config.grep}
                onChange={v => set('grep', v)}
                width="w-52"
                placeholder="e.g. @smoke or Login"
              />
            </SettingRow>
            <SettingRow label="Grep invert (exclude)" desc="Skip tests whose title matches this pattern">
              <TextInput
                value={config.grepInvert}
                onChange={v => set('grepInvert', v)}
                width="w-52"
                placeholder="e.g. @slow or flaky"
              />
            </SettingRow>
          </SettingCard>

          {/* Reporter */}
          <SettingCard icon={<FileText size={14} />} title="Reporter" subtitle="How test results are formatted and output">
            <div className="pt-3 pb-2">
              <div className="grid grid-cols-5 gap-2 mb-3">
                {(['html', 'json', 'junit', 'line', 'dot'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => set('reporter', r)}
                    className="py-2 rounded-xl border text-xs font-bold transition-all"
                    style={config.reporter === r
                      ? { background: '#2563eb', color: '#fff', borderColor: '#2563eb' }
                      : { background: 'var(--bg-body)', color: 'var(--text-muted)', borderColor: 'var(--border)' }
                    }
                  >
                    {r}
                  </button>
                ))}
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {REPORTER_DESCRIPTIONS[config.reporter]}
              </p>
            </div>
          </SettingCard>

        </div>

        {/* Right: Generated playwright.config.ts */}
        <div className="lg:col-span-2">
          <div className="sticky top-4 rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: 'var(--border)' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
              <div className="flex items-center gap-2">
                <Code2 size={13} style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-main)' }}>playwright.config.ts</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                  style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                  Live
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={copyConfig}
                  className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg transition-colors hover:opacity-70"
                  style={{ color: 'var(--text-muted)' }}
                  title="Copy to clipboard"
                >
                  {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={downloadConfig}
                  className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg transition-colors hover:opacity-70"
                  style={{ color: 'var(--text-muted)' }}
                  title="Download as playwright.config.ts"
                >
                  {downloaded ? <Check size={12} className="text-emerald-500" /> : <Download size={12} />}
                  {downloaded ? 'Saved!' : '.ts'}
                </button>
              </div>
            </div>

            {/* Validation banner */}
            {noBrowsers && (
              <div className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-medium border-b"
                style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }}>
                <AlertTriangle size={12} className="shrink-0" />
                No browsers selected — the generated config will skip all projects.
              </div>
            )}

            {/* Code */}
            <pre
              className="text-[11px] font-mono p-4 overflow-auto leading-relaxed"
              style={{ backgroundColor: '#1e1e2e', color: '#cdd6f4', maxHeight: '68vh' }}
            >
              {configCode}
            </pre>
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Playwright-specific helpers ─────────────────────────────────────────────

/** Parse a Playwright error string and return a human-readable category */
function parseErrorType(error: string): ErrorType {
  if (/timeout/i.test(error))               return 'Timeout'
  if (/toHave|toBe|toContain|expect/i.test(error)) return 'Assertion'
  if (/locator|strict mode|resolved to/i.test(error)) return 'Locator'
  if (/net::|ERR_|fetch|request/i.test(error)) return 'Network'
  return 'Error'
}

const ERROR_TYPE_STYLES: Record<ErrorType, { bg: string; color: string; border: string }> = {
  Timeout:   { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  Assertion: { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' },
  Locator:   { bg: '#ede9fe', color: '#5b21b6', border: '#ddd6fe' },
  Network:   { bg: '#e0f2fe', color: '#0c4a6e', border: '#bae6fd' },
  Error:     { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
}

const BROWSER_META: Record<BrowserKey, { label: string; color: string; emoji: string }> = {
  chromium: { label: 'Chromium', color: '#4285f4', emoji: '🔵' },
  firefox:  { label: 'Firefox',  color: '#ff6611', emoji: '🦊' },
  webkit:   { label: 'WebKit',   color: '#999999', emoji: '🧡' },
}

// ─── Browser Matrix View ──────────────────────────────────────────────────────

function BrowserMatrixView({ suites }: { suites: TestSuite[] }) {
  const testsWithCross = suites.flatMap(s => s.tests).filter(t => t.browserResults && t.browserResults.length > 0)
  const browsers: BrowserKey[] = ['chromium', 'firefox', 'webkit']

  if (testsWithCross.length === 0) {
    return (
      <div className="text-center py-16 rounded-2xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No cross-browser data — add <code className="font-mono text-xs">browserResults</code> to your tests.</p>
      </div>
    )
  }

  function cellStatus(test: TestCase, browser: BrowserKey): Status | null {
    if (!test.browserResults) return null
    return test.browserResults.find(r => r.browser === browser)?.status ?? null
  }

  const StatusCell = ({ status }: { status: Status | null }) => {
    if (!status) return <td className="px-3 py-2 text-center text-xs" style={{ color: 'var(--text-muted)' }}>—</td>
    const bgMap: Record<Status, string> = {
      passed:  'rgba(16,185,129,0.1)',
      failed:  'rgba(239,68,68,0.1)',
      skipped: 'rgba(251,191,36,0.1)',
      pending: 'rgba(148,163,184,0.08)',
      running: 'rgba(59,130,246,0.1)',
    }
    return (
      <td className="px-3 py-2 text-center" style={{ backgroundColor: bgMap[status] }}>
        <div className="flex justify-center"><StatusIcon status={status} size={13} /></div>
      </td>
    )
  }

  // Group tests by suite
  const bysuite = suites.map(s => ({
    ...s,
    tests: s.tests.filter(t => t.browserResults && t.browserResults.length > 0),
  })).filter(s => s.tests.length > 0)

  return (
    <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: 'var(--border)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}>
        <Globe size={13} style={{ color: '#7c3aed' }} />
        <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Browser Matrix</span>
        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>— test results per browser project</span>
        <div className="ml-auto flex items-center gap-3">
          {browsers.map(b => (
            <span key={b} className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <span>{BROWSER_META[b].emoji}</span> {BROWSER_META[b].label}
            </span>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-body)' }}>
              <th className="text-left px-4 py-2 font-semibold w-full" style={{ color: 'var(--text-muted)' }}>Test</th>
              {browsers.map(b => (
                <th key={b} className="px-4 py-2 font-bold text-center whitespace-nowrap" style={{ color: BROWSER_META[b].color }}>
                  {BROWSER_META[b].emoji} {BROWSER_META[b].label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bysuite.map(suite => (
              <React.Fragment key={suite.id}>
                <tr>
                  <td colSpan={4} className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-body)', borderBottom: '1px solid var(--border)' }}>
                    {suite.title}
                  </td>
                </tr>
                {suite.tests.map((test, i) => (
                  <tr key={test.id}
                    style={{ borderBottom: i < suite.tests.length - 1 ? '1px solid var(--border)' : undefined, backgroundColor: 'var(--bg-card)' }}>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <StatusIcon status={test.status} size={13} />
                        <span className="truncate max-w-xs" style={{ color: 'var(--text-main)' }}>{test.title}</span>
                        {test.retries && test.status === 'passed' && (
                          <span className="text-[9px] font-bold px-1.5 py-px rounded-full bg-amber-100 text-amber-700 shrink-0">FLAKY</span>
                        )}
                        {(test.tags ?? []).map(tag => (
                          <span key={tag} className="text-[9px] font-mono px-1.5 py-px rounded border shrink-0"
                            style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>{tag}</span>
                        ))}
                      </div>
                    </td>
                    {browsers.map(b => <StatusCell key={b} status={cellStatus(test, b)} />)}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Flaky Test Panel ─────────────────────────────────────────────────────────

function FlakyPanel({ suites }: { suites: TestSuite[] }) {
  const flakyTests = suites.flatMap(s =>
    s.tests
      .filter(t => (t.retries ?? 0) > 0 && t.status === 'passed')
      .map(t => ({ ...t, suiteFile: s.file, suiteTitle: s.title }))
  )

  if (flakyTests.length === 0) return null

  return (
    <div className="mt-4 rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#fbbf24', backgroundColor: 'var(--bg-card)' }}>
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: '#fde68a', backgroundColor: '#fffbeb' }}>
        <AlertTriangle size={13} style={{ color: '#d97706' }} />
        <span className="text-xs font-bold" style={{ color: '#92400e' }}>Flaky Tests</span>
        <span className="text-[11px]" style={{ color: '#b45309' }}>— passed only after retrying</span>
        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
          {flakyTests.length} test{flakyTests.length > 1 ? 's' : ''}
        </span>
      </div>
      <div>
        {flakyTests.map((test, i) => (
          <div key={test.id} className={`flex items-center gap-3 px-4 py-2.5 ${i > 0 ? 'border-t' : ''}`}
            style={{ borderColor: 'var(--border)' }}>
            <AlertTriangle size={13} style={{ color: '#f59e0b' }} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs truncate" style={{ color: 'var(--text-main)' }}>{test.title}</p>
              <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{test.suiteFile}</p>
            </div>
            {(test.tags ?? []).map(tag => (
              <span key={tag} className="text-[9px] font-mono px-1.5 py-px rounded border shrink-0"
                style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>{tag}</span>
            ))}
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
              {test.retries} retry
            </span>
            <span className="text-xs font-mono shrink-0" style={{ color: 'var(--text-muted)' }}>{formatMs(test.duration)}</span>
          </div>
        ))}
      </div>
      <div className="px-4 py-2.5 border-t text-[11px]" style={{ borderColor: '#fde68a', backgroundColor: '#fffbeb', color: '#b45309' }}>
        💡 Flaky tests destabilise CI. Investigate network dependencies, race conditions, or use <code className="font-mono">test.setTimeout()</code> to isolate the root cause.
      </div>
    </div>
  )
}

// ─── Test Step Timeline ───────────────────────────────────────────────────────

function StepTimeline({ steps }: { steps: TestStep[] }) {
  const maxDur = Math.max(...steps.map(s => s.duration), 1)
  return (
    <div className="mx-4 mb-3 rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
      <div className="px-3 py-1.5 border-b text-[10px] font-bold uppercase tracking-widest"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)', color: 'var(--text-muted)' }}>
        Steps
      </div>
      {steps.map((step, i) => (
        <div key={i} className={`flex items-center gap-3 px-3 py-2 ${i > 0 ? 'border-t' : ''}`}
          style={{ borderColor: 'var(--border)', backgroundColor: step.status === 'failed' ? 'rgba(239,68,68,0.05)' : undefined }}>
          <StatusIcon status={step.status} size={11} />
          <span className="flex-1 text-[11px] font-mono truncate"
            style={{ color: step.status === 'failed' ? '#dc2626' : 'var(--text-main)' }}>{step.title}</span>
          <div className="w-24 h-1 rounded-full overflow-hidden shrink-0" style={{ backgroundColor: 'var(--border)' }}>
            <div className="h-full rounded-full" style={{
              width: `${(step.duration / maxDur) * 100}%`,
              backgroundColor: step.status === 'failed' ? '#ef4444' : '#10b981',
            }} />
          </div>
          <span className="text-[10px] font-mono w-14 text-right shrink-0" style={{ color: 'var(--text-muted)' }}>{formatMs(step.duration)}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Docs View ────────────────────────────────────────────────────────────────

/** Syntax-highlighted code block (Catppuccin-dark theme matching the config preview) */
function CodeBlock({ code, lang = 'ts' }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(code.trim())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="relative rounded-xl overflow-hidden border my-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
      <div className="flex items-center justify-between px-3 py-1.5"
        style={{ backgroundColor: '#181825' }}>
        <span className="text-[10px] font-mono font-semibold" style={{ color: '#6c7086' }}>{lang}</span>
        <button onClick={copy} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded transition-opacity hover:opacity-70"
          style={{ color: copied ? '#a6e3a1' : '#6c7086' }}>
          {copied ? <Check size={10} /> : <Copy size={10} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="text-[11.5px] font-mono px-4 py-3 overflow-x-auto leading-relaxed"
        style={{ backgroundColor: '#1e1e2e', color: '#cdd6f4', margin: 0 }}>
        {code.trim()}
      </pre>
    </div>
  )
}

/** Section heading with icon and anchor */
function DocSection({ id, icon, title, children }: {
  id: string; icon: React.ReactNode; title: string; children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-4">
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color: '#3b82f6' }}>{icon}</span>
        <h2 className="text-sm font-black tracking-tight" style={{ color: 'var(--text-main)' }}>{title}</h2>
        <a href={`#${id}`} className="opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity ml-auto">
          <Hash size={12} style={{ color: 'var(--text-muted)' }} />
        </a>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  )
}

/** Pill table row for locator/assertion reference */
function RefRow({ label, desc, badge, badgeColor = '#2563eb' }: {
  label: string; desc: string; badge?: string; badgeColor?: string
}) {
  return (
    <div className="flex items-start gap-3 px-3 py-2.5 rounded-xl border"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}>
      <code className="text-[11px] font-mono font-semibold shrink-0 mt-px" style={{ color: '#89b4fa' }}>{label}</code>
      <span className="flex-1 text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</span>
      {badge && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 leading-none self-center"
          style={{ backgroundColor: `${badgeColor}20`, color: badgeColor, border: `1px solid ${badgeColor}40` }}>
          {badge}
        </span>
      )}
    </div>
  )
}

/** External docs link chip */
function DocsLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-opacity hover:opacity-70"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)', color: '#3b82f6' }}>
      {label} <ExternalLink size={10} />
    </a>
  )
}

function DocsView() {
  const tocItems = [
    { id: 'quickstart',  label: 'Quick Start',          icon: <Terminal size={12} /> },
    { id: 'locators',    label: 'Locator Strategies',    icon: <MousePointer2 size={12} /> },
    { id: 'assertions',  label: 'Core Assertions',       icon: <FlaskConical size={12} /> },
    { id: 'patterns',    label: 'Common Patterns',       icon: <Layers size={12} /> },
    { id: 'cli',         label: 'CLI Reference',         icon: <Terminal size={12} /> },
  ]

  return (
    <div className="flex gap-6 items-start">

      {/* ── Sticky TOC sidebar ── */}
      <aside className="hidden lg:flex flex-col gap-1 shrink-0 sticky top-4 w-44">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>On this page</p>
        {tocItems.map(({ id, label, icon }) => (
          <a key={id} href={`#${id}`}
            className="flex items-center gap-2 text-[11px] px-2.5 py-1.5 rounded-lg transition-colors hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
            {icon} {label}
          </a>
        ))}

        <div className="mt-4 pt-4 border-t flex flex-col gap-2" style={{ borderColor: 'var(--border)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Official Docs</p>
          <DocsLink href="https://playwright.dev/docs/intro" label="Playwright" />
          <DocsLink href="https://playwright.dev/docs/locators" label="Locators" />
          <DocsLink href="https://playwright.dev/docs/test-assertions" label="Assertions" />
          <DocsLink href="https://playwright.dev/docs/api/class-page" label="Page API" />
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-8">

        {/* ── Quick Start ─────────────────────────────────── */}
        <DocSection id="quickstart" icon={<Terminal size={14} />} title="Quick Start">
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Install Playwright, generate your config, and run your first test in under 2 minutes.
          </p>

          <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: 'var(--border)' }}>
            <div className="px-4 py-2.5 border-b flex items-center gap-2"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}>
              <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>1 — Install</span>
            </div>
            <div className="p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
              <CodeBlock lang="bash" code={`npm init playwright@latest`} />
              <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
                The wizard creates <code className="font-mono">playwright.config.ts</code>, a <code className="font-mono">tests/</code> directory, and installs browser binaries.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: 'var(--border)' }}>
            <div className="px-4 py-2.5 border-b flex items-center gap-2"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}>
              <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>2 — Write your first test</span>
            </div>
            <div className="p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
              <CodeBlock lang="typescript" code={`import { test, expect } from '@playwright/test'

test('home page has correct title', async ({ page }) => {
  await page.goto('https://example.com')

  await expect(page).toHaveTitle(/Example Domain/)
})`} />
            </div>
          </div>

          <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: 'var(--border)' }}>
            <div className="px-4 py-2.5 border-b flex items-center gap-2"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}>
              <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>3 — Run</span>
            </div>
            <div className="p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
              <CodeBlock lang="bash" code={`npx playwright test              # headless, all browsers
npx playwright test --headed    # see the browser
npx playwright test --ui        # interactive UI mode
npx playwright show-report      # open HTML report`} />
            </div>
          </div>
        </DocSection>

        {/* ── Locator Strategies ──────────────────────────── */}
        <DocSection id="locators" icon={<MousePointer2 size={14} />} title="Locator Strategies">
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Playwright recommends locators in this priority order — higher is more resilient to UI changes.
          </p>

          <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
            <div className="px-4 py-2 border-b flex items-center gap-2"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}>
              <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Priority order</span>
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>— prefer top entries first</span>
            </div>
            <div className="p-3 flex flex-col gap-2">
              <RefRow label="getByRole()" desc="Find by ARIA role + accessible name. Survives redesigns and works with screen readers." badge="★ Best" badgeColor="#059669" />
              <RefRow label="getByLabel()" desc="Find form input by its associated <label> text. Ideal for all form controls." badge="★ Best" badgeColor="#059669" />
              <RefRow label="getByPlaceholder()" desc="Find input by placeholder text. Use when no label is present." badge="Good" badgeColor="#2563eb" />
              <RefRow label="getByText()" desc="Find any element by its visible text content. Use .exact for precision." badge="Good" badgeColor="#2563eb" />
              <RefRow label="getByAltText()" desc="Find images by alt attribute. Essential for image-heavy UIs." badge="Good" badgeColor="#2563eb" />
              <RefRow label="getByTestId()" desc='Find by data-testid attribute. Requires adding attrs to source code — but very stable.' badge="OK" badgeColor="#d97706" />
              <RefRow label="locator('css')" desc="CSS selector fallback. Use only when semantic locators don't work." badge="Last resort" badgeColor="#ef4444" />
              <RefRow label="locator('xpath')" desc="XPath selector. Brittle — avoid unless absolutely necessary." badge="Avoid" badgeColor="#ef4444" />
            </div>
          </div>

          <CodeBlock lang="typescript" code={`// ✅ Preferred — role + name survives UI redesigns
page.getByRole('button', { name: 'Submit' })
page.getByRole('link', { name: /sign in/i })
page.getByRole('heading', { level: 1 })

// ✅ Form controls by label
page.getByLabel('Email address')
page.getByLabel(/password/i)

// ✅ Text content
page.getByText('Forgot password?')
page.getByText('Confirm', { exact: true })

// ⚠️ CSS — use as a fallback
page.locator('[data-testid="submit-btn"]')
page.locator('form.login-form input[type="email"]')

// ❌ Avoid — breaks on any DOM restructure
page.locator('div > div:nth-child(3) > span')`} />
        </DocSection>

        {/* ── Core Assertions ─────────────────────────────── */}
        <DocSection id="assertions" icon={<FlaskConical size={14} />} title="Core Assertions">
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            All Playwright assertions are <strong>auto-retrying</strong> — they keep checking until the condition is met or the timeout expires.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Visibility */}
            <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: 'var(--border)' }}>
              <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}>
                <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Visibility</p>
              </div>
              <div className="p-3 flex flex-col gap-1.5" style={{ backgroundColor: 'var(--bg-card)' }}>
                <RefRow label="toBeVisible()" desc="Element is in DOM and not hidden." />
                <RefRow label="toBeHidden()" desc="Element is absent or display:none." />
                <RefRow label="toBeInViewport()" desc="Element is within the visible viewport." />
              </div>
            </div>

            {/* State */}
            <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: 'var(--border)' }}>
              <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}>
                <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Element State</p>
              </div>
              <div className="p-3 flex flex-col gap-1.5" style={{ backgroundColor: 'var(--bg-card)' }}>
                <RefRow label="toBeEnabled()" desc="Form control is not disabled." />
                <RefRow label="toBeChecked()" desc="Checkbox or radio is checked." />
                <RefRow label="toBeFocused()" desc="Element has keyboard focus." />
              </div>
            </div>

            {/* Content */}
            <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: 'var(--border)' }}>
              <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}>
                <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Content</p>
              </div>
              <div className="p-3 flex flex-col gap-1.5" style={{ backgroundColor: 'var(--bg-card)' }}>
                <RefRow label="toHaveText()" desc="Element's text content matches (string or regex)." />
                <RefRow label="toContainText()" desc="Element's text contains the substring." />
                <RefRow label="toHaveValue()" desc="Input / select has the expected value." />
                <RefRow label="toHaveAttribute()" desc="Element has a specific attribute value." />
              </div>
            </div>

            {/* Page */}
            <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: 'var(--border)' }}>
              <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}>
                <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Page-level</p>
              </div>
              <div className="p-3 flex flex-col gap-1.5" style={{ backgroundColor: 'var(--bg-card)' }}>
                <RefRow label="toHaveTitle()" desc="Page <title> matches string or regex." />
                <RefRow label="toHaveURL()" desc="Current URL matches string or regex." />
                <RefRow label="toHaveScreenshot()" desc="Visual snapshot matches baseline PNG." />
              </div>
            </div>
          </div>

          <CodeBlock lang="typescript" code={`// Visibility
await expect(page.getByRole('dialog')).toBeVisible()
await expect(page.getByText('Loading…')).toBeHidden()

// Content
await expect(page.getByRole('heading')).toHaveText('Welcome back')
await expect(page.getByLabel('Email')).toHaveValue('user@example.com')

// Page
await expect(page).toHaveTitle(/Dashboard/)
await expect(page).toHaveURL('/dashboard')

// Custom timeout (default 5 s)
await expect(locator).toBeVisible({ timeout: 15_000 })

// Soft assertions — continue on failure, report at end
await expect.soft(page.getByTestId('badge')).toHaveText('Pro')`} />
        </DocSection>

        {/* ── Common Patterns ─────────────────────────────── */}
        <DocSection id="patterns" icon={<Layers size={14} />} title="Common Patterns">

          <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: 'var(--border)' }}>
            <div className="px-4 py-2.5 border-b flex items-center gap-2"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}>
              <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Page Object Model (POM)</span>
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>— one class per page, reusable across tests</span>
            </div>
            <div className="p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
              <CodeBlock lang="typescript" code={`// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email)
    await this.page.getByLabel('Password').fill(password)
    await this.page.getByRole('button', { name: 'Sign In' }).click()
  }

  get errorMessage() {
    return this.page.getByRole('alert')
  }
}

// tests/login.spec.ts
test('successful login', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.goto()
  await loginPage.login('user@example.com', 'secret')
  await expect(page).toHaveURL('/dashboard')
})`} />
            </div>
          </div>

          <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: 'var(--border)' }}>
            <div className="px-4 py-2.5 border-b flex items-center gap-2"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}>
              <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Fixtures — shared setup across tests</span>
            </div>
            <div className="p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
              <CodeBlock lang="typescript" code={`// fixtures.ts
import { test as base } from '@playwright/test'
import { LoginPage } from './pages/LoginPage'

type MyFixtures = { loginPage: LoginPage; loggedIn: void }

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page))
  },
  loggedIn: async ({ loginPage }, use) => {
    await loginPage.goto()
    await loginPage.login(process.env.TEST_EMAIL!, process.env.TEST_PASS!)
    await use()
  },
})

// tests/dashboard.spec.ts
test('dashboard loads', async ({ page, loggedIn }) => {
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
})`} />
            </div>
          </div>

          <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: 'var(--border)' }}>
            <div className="px-4 py-2.5 border-b flex items-center gap-2"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}>
              <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>API request interception</span>
            </div>
            <div className="p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
              <CodeBlock lang="typescript" code={`// Mock an API response to control test data
await page.route('**/api/users', route =>
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([{ id: 1, name: 'Alice' }]),
  })
)

// Assert the API call was made
const [request] = await Promise.all([
  page.waitForRequest('**/api/checkout'),
  page.getByRole('button', { name: 'Buy Now' }).click(),
])
expect(request.method()).toBe('POST')`} />
            </div>
          </div>

          <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: 'var(--border)' }}>
            <div className="px-4 py-2.5 border-b flex items-center gap-2"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}>
              <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Hooks — before / after</span>
            </div>
            <div className="p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
              <CodeBlock lang="typescript" code={`test.describe('Cart', () => {
  // Runs once before all tests in this describe
  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext()
    await ctx.storageState({ path: 'auth.json' })
  })

  // Runs before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/cart')
  })

  // Runs after each test — cleanup
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== 'passed') {
      await page.screenshot({ path: \`screenshots/\${testInfo.title}.png\` })
    }
  })
})`} />
            </div>
          </div>
        </DocSection>

        {/* ── CLI Reference ───────────────────────────────── */}
        <DocSection id="cli" icon={<Terminal size={14} />} title="CLI Reference">
          <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
            <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}>
              <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>npx playwright test [options]</p>
            </div>
            <div className="p-3 flex flex-col gap-1.5">
              {[
                { flag: '--headed',               desc: 'Run with a visible browser window' },
                { flag: '--ui',                   desc: 'Open the interactive Playwright UI mode' },
                { flag: '--debug',                desc: 'Run in debug mode — pauses before each action' },
                { flag: '--project=chromium',     desc: 'Run only in the specified project/browser' },
                { flag: '--grep "login"',         desc: 'Run only tests whose title matches the pattern' },
                { flag: '--workers=4',            desc: 'Override number of parallel workers' },
                { flag: '--retries=2',            desc: 'Override retry count' },
                { flag: '--reporter=json',        desc: 'Override reporter (html | json | junit | line | dot)' },
                { flag: '--timeout=60000',        desc: 'Override per-test timeout in ms' },
                { flag: '--last-failed',          desc: 'Re-run only the tests that failed last time' },
                { flag: '--config=pw.config.ts',  desc: 'Use a custom config file' },
              ].map(({ flag, desc }) => (
                <RefRow key={flag} label={`--${flag.replace(/^--/, '')}`} desc={desc} />
              ))}
            </div>
          </div>

          <CodeBlock lang="bash" code={`# Run a single spec file
npx playwright test tests/login.spec.ts

# Run only tests tagged @smoke
npx playwright test --grep @smoke

# Run on Firefox + WebKit only
npx playwright test --project=firefox --project=webkit

# Open the trace viewer for a recorded trace
npx playwright show-trace test-results/trace.zip

# Generate code by recording your actions in a browser
npx playwright codegen https://example.com

# Install / update browser binaries
npx playwright install
npx playwright install chromium`} />
        </DocSection>

      </div>
    </div>
  )
}

// ─── Artifact Modal ───────────────────────────────────────────────────────────

interface ArtifactFile {
  name: string
  path: string
  size: number
}

function formatBytes(bytes: number): string {
  if (bytes < 1024)         return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function ArtifactModal({ state, onClose }: { state: ArtifactModalState; onClose: () => void }) {
  const [artifacts, setArtifacts] = useState<ArtifactFile[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`${API_BASE}/api/playwright/artifacts`)
      .then(r => r.json() as Promise<{ artifacts: ArtifactFile[] }>)
      .then(data => { setArtifacts(data.artifacts); setLoading(false) })
      .catch(() => { setArtifacts([]); setLoading(false) })
  }, [state.testId])

  const extType = (name: string) => {
    const ext = name.split('.').pop()?.toUpperCase() ?? '?'
    return ext
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative rounded-2xl border shadow-2xl p-6 w-full max-w-md"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>Test Artifacts</h3>
          <button onClick={onClose} className="hover:opacity-70 transition-opacity">
            <X size={16} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
        <p className="text-xs mb-4 font-mono truncate" style={{ color: 'var(--text-muted)' }}>{state.testTitle}</p>

        {loading ? (
          <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>Loading artifacts…</p>
        ) : artifacts.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
            No artifacts found. Run tests with <code className="font-mono">screenshot: &apos;on&apos;</code> or <code className="font-mono">trace: &apos;on&apos;</code> to generate files.
          </p>
        ) : (
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
            {artifacts.map(file => (
              <a
                key={file.path}
                href={`${API_BASE}/test-results/${file.path}`}
                download={file.name}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs hover:opacity-80 transition-opacity no-underline"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}
              >
                <span className="font-mono truncate flex-1 mr-2" style={{ color: 'var(--text-main)' }}>{file.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span style={{ color: 'var(--text-muted)' }}>{formatBytes(file.size)}</span>
                  <span className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 font-semibold text-[10px]">{extType(file.name)}</span>
                  <Download size={11} style={{ color: 'var(--text-muted)' }} />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Failed Test Action Bar ───────────────────────────────────────────────────

function FailedActions({
  test, suiteFile, onViewArtifacts,
}: {
  test: TestCase
  suiteFile: string
  onViewArtifacts: (state: ArtifactModalState) => void
}) {
  const [jiraCopied, setJiraCopied] = useState(false)

  const exportJira = () => {
    const payload = {
      summary: `[QA] Test failure: ${test.title}`,
      description: `**File:** \`${suiteFile}\`\n**Error:**\n\`\`\`\n${test.error}\n\`\`\``,
      labels: ['automated-test', 'playwright'],
      priority: 'High',
    }
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2)).then(() => {
      setJiraCopied(true)
      setTimeout(() => setJiraCopied(false), 2000)
    }).catch(() => {
      // Fallback: show the JSON in a small alert for browsers that block clipboard
      prompt('Copy this Jira payload:', JSON.stringify(payload, null, 2))
    })
  }

  const viewTrace = () => {
    window.open('http://localhost:3001/playwright-report/index.html', '_blank')
  }

  return (
    <div className="flex items-center gap-1.5 px-5 py-2 border-t"
      style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(239,68,68,0.04)' }}>
      <span className="text-[11px] font-medium mr-1" style={{ color: 'var(--text-muted)' }}>Actions:</span>
      <button onClick={exportJira} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-100">
        {jiraCopied ? <><Check size={11} /> Copied!</> : <><Bug size={11} /> Copy Jira JSON</>}
      </button>
      <button onClick={viewTrace} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors border border-violet-100">
        <Eye size={11} /> View Report
      </button>
      <button onClick={() => onViewArtifacts({ testId: test.id, testTitle: test.title })} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-neutral-50 text-neutral-600 hover:bg-neutral-100 transition-colors border border-neutral-200">
        <Camera size={11} /> View Artifacts
      </button>
    </div>
  )
}

// ─── Editor View ─────────────────────────────────────────────────────────────

const NEW_SPEC_STUB = `import { test, expect } from '@playwright/test'

test.describe('My test suite', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/.*/)
  })
})
`

function EditorView({
  specs,
  onReloadSpecs,
  onRunSpec,
}: {
  specs: string[]
  onReloadSpecs: () => void
  onRunSpec: (spec: string) => void
}) {
  const [activeFile, setActiveFile]     = useState<string | null>(specs[0] ?? null)
  const [content, setContent]           = useState('')
  const [savedContent, setSavedContent] = useState('')
  const [loading, setLoading]           = useState(false)
  const [saving, setSaving]             = useState(false)
  const [saveMsg, setSaveMsg]           = useState<string | null>(null)
  const [newName, setNewName]           = useState('')
  const [showNew, setShowNew]           = useState(false)
  const [delConfirm, setDelConfirm]     = useState<string | null>(null)
  const [error, setError]               = useState<string | null>(null)
  const textareaRef                     = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef                  = useRef<HTMLDivElement>(null)

  const isDirty = content !== savedContent
  const [loadKey, setLoadKey] = useState(0)

  // Auto-select first spec when the list arrives (handles async fetchSpecs timing)
  useEffect(() => {
    if (!activeFile && specs.length > 0) setActiveFile(specs[0])
  }, [specs, activeFile])

  // Load file content — re-runs when activeFile or loadKey changes (loadKey = manual retry)
  useEffect(() => {
    if (!activeFile) return
    setLoading(true)
    setError(null)
    fetch(`${API_BASE}/api/playwright/file?name=${encodeURIComponent(activeFile)}`)
      .then(async r => {
        const text = await r.text()
        try {
          const d = JSON.parse(text) as { content?: string; error?: string }
          if (d.content !== undefined) {
            setContent(d.content)
            setSavedContent(d.content)
          } else {
            setError(d.error ?? 'Failed to load file')
          }
        } catch {
          setError(`Server returned an unexpected response (HTTP ${r.status}) — check your server console`)
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err)
        setError(msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')
          ? 'Cannot connect to localhost:3001 — make sure the server is running (npm run dev)'
          : msg)
      })
      .finally(() => setLoading(false))
  }, [activeFile, loadKey])

  const saveFile = useCallback(async () => {
    if (!activeFile) return
    setSaving(true)
    setError(null)
    try {
      const r = await fetch(`${API_BASE}/api/playwright/file`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: activeFile, content }),
      })
      const d = await r.json()
      if (d.ok) { setSavedContent(content); setSaveMsg('Saved!'); setTimeout(() => setSaveMsg(null), 2000) }
      else setError(d.error ?? 'Save failed')
    } catch { setError('Save failed — server not reachable') }
    finally { setSaving(false) }
  }, [activeFile, content])

  const createFile = useCallback(async () => {
    const name = newName.trim().replace(/\.spec\.(ts|js)$/, '') + '.spec.ts'
    setError(null)
    try {
      const r = await fetch(`${API_BASE}/api/playwright/file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, content: NEW_SPEC_STUB }),
      })
      const d = await r.json()
      if (d.ok) {
        setShowNew(false); setNewName('')
        onReloadSpecs()
        // Small delay so specs list refreshes before we select
        setTimeout(() => setActiveFile(name), 200)
      } else setError(d.error ?? 'Create failed')
    } catch { setError('Create failed — server not reachable') }
  }, [newName, onReloadSpecs])

  const deleteFile = useCallback(async (name: string) => {
    setError(null)
    try {
      const r = await fetch(`${API_BASE}/api/playwright/file?name=${encodeURIComponent(name)}`, { method: 'DELETE' })
      const d = await r.json()
      if (d.ok) {
        setDelConfirm(null)
        if (activeFile === name) { setActiveFile(null); setContent(''); setSavedContent('') }
        onReloadSpecs()
      } else setError(d.error ?? 'Delete failed')
    } catch { setError('Delete failed — server not reachable') }
  }, [activeFile, onReloadSpecs])

  // Tab → insert 2 spaces
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const el  = e.currentTarget
      const s   = el.selectionStart
      const end = el.selectionEnd
      const next = content.slice(0, s) + '  ' + content.slice(end)
      setContent(next)
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + 2 })
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      saveFile()
    }
  }

  const lineCount = content.split('\n').length

  return (
    <div className="flex gap-0 rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: 'var(--border)', minHeight: '72vh' }}>

      {/* ── Left sidebar: file list ── */}
      <div className="w-52 shrink-0 flex flex-col border-r" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
        <div className="flex items-center justify-between px-3 py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
          <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Tests</span>
          <div className="flex items-center gap-1">
            <button onClick={onReloadSpecs} title="Refresh" className="p-1 rounded hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
              <RefreshCw size={11} />
            </button>
            <button onClick={() => setShowNew(v => !v)} title="New spec file"
              className="p-1 rounded transition-colors"
              style={showNew ? { color: '#2563eb' } : { color: 'var(--text-muted)' }}>
              <Plus size={13} />
            </button>
          </div>
        </div>

        {/* New file input */}
        {showNew && (
          <div className="px-2 py-2 border-b flex flex-col gap-1.5" style={{ borderColor: 'var(--border)' }}>
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') createFile(); if (e.key === 'Escape') { setShowNew(false); setNewName('') } }}
              placeholder="my-test"
              className="w-full px-2 py-1 rounded-lg border text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-400"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)', color: 'var(--text-main)' }}
            />
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>.spec.ts will be appended</p>
            <button onClick={createFile} disabled={!newName.trim()}
              className="w-full py-1 rounded-lg text-xs font-semibold disabled:opacity-40"
              style={{ backgroundColor: '#2563eb', color: '#fff' }}>
              Create
            </button>
          </div>
        )}

        {/* File list */}
        <div className="flex-1 overflow-y-auto py-1">
          {specs.length === 0 && (
            <p className="px-3 py-4 text-[11px] text-center" style={{ color: 'var(--text-muted)' }}>No spec files found</p>
          )}
          {specs.map(s => (
            <div
              key={s}
              className="group flex items-center justify-between px-3 py-2 cursor-pointer transition-colors"
              style={activeFile === s
                ? { backgroundColor: 'rgba(37,99,235,0.08)', borderLeft: '2px solid #2563eb' }
                : { borderLeft: '2px solid transparent' }}
              onClick={() => setActiveFile(s)}
              onMouseEnter={e => { if (activeFile !== s) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-body)' }}
              onMouseLeave={e => { if (activeFile !== s) (e.currentTarget as HTMLElement).style.backgroundColor = '' }}
            >
              <span className="text-[11px] font-mono truncate" style={{ color: activeFile === s ? '#2563eb' : 'var(--text-main)' }}>
                {s.replace(/\.spec\.(ts|js)$/, '')}
                <span className="opacity-40">.spec.ts</span>
              </span>
              {delConfirm === s ? (
                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  <button onClick={() => deleteFile(s)} className="text-[10px] font-bold text-red-500 hover:underline">del</button>
                  <button onClick={() => setDelConfirm(null)} className="text-[10px]" style={{ color: 'var(--text-muted)' }}>✕</button>
                </div>
              ) : (
                <button
                  onClick={e => { e.stopPropagation(); setDelConfirm(s) }}
                  className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity p-0.5 rounded"
                  style={{ color: '#ef4444' }}
                  title="Delete file"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: editor ── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b shrink-0"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
          <div className="flex items-center gap-2">
            <FileText size={12} style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs font-mono font-semibold" style={{ color: 'var(--text-main)' }}>
              {activeFile ?? '—'}
            </span>
            {isDirty && <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Unsaved changes" />}
            {saveMsg && <span className="text-[11px] font-semibold text-emerald-500">{saveMsg}</span>}
          </div>
          <div className="flex items-center gap-2">
            {error && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-red-400 max-w-xs truncate" title={error}>{error}</span>
                {activeFile && (
                  <button
                    onClick={() => setLoadKey(k => k + 1)}
                    className="text-[10px] px-1.5 py-0.5 rounded border font-medium shrink-0"
                    style={{ borderColor: '#ef4444', color: '#ef4444' }}
                    title="Retry loading file"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{lineCount} lines</span>
            <button
              onClick={saveFile}
              disabled={!activeFile || saving || !isDirty}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-40"
              style={isDirty && !saving
                ? { backgroundColor: '#2563eb', borderColor: '#2563eb', color: '#fff' }
                : { borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }
              }
              title="Save (Ctrl+S)"
            >
              {saving ? <RotateCcw size={11} className="animate-spin" /> : <Save size={11} />}
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => activeFile && onRunSpec(activeFile)}
              disabled={!activeFile || isDirty}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-40"
              style={{ backgroundColor: '#059669', borderColor: '#059669', color: '#fff' }}
              title={isDirty ? 'Save before running' : 'Run this spec'}
            >
              <Play size={11} /> Run
            </button>
          </div>
        </div>

        {/* Editor body */}
        {!activeFile ? (
          <div className="flex-1 flex items-center justify-center flex-col gap-3" style={{ backgroundColor: '#1e1e2e' }}>
            <PenLine size={32} style={{ color: '#4c4f69' }} />
            <p className="text-sm" style={{ color: '#6c7086' }}>Select a spec file to edit</p>
            <button onClick={() => setShowNew(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ backgroundColor: '#2563eb', color: '#fff' }}>
              <Plus size={12} /> New spec file
            </button>
          </div>
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#1e1e2e' }}>
            <RotateCcw size={18} className="animate-spin" style={{ color: '#6c7086' }} />
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden" style={{ backgroundColor: '#1e1e2e' }}>
            {/* Line numbers */}
            <div
              ref={lineNumbersRef}
              className="select-none text-right pr-3 pl-3 py-3 text-[12px] font-mono leading-[1.6] shrink-0 overflow-hidden pointer-events-none"
              style={{ color: '#4c4f69', minWidth: '3rem', userSelect: 'none' }}>
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i + 1}>{i + 1}</div>
              ))}
            </div>
            {/* Code textarea */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              onScroll={e => {
                if (lineNumbersRef.current)
                  lineNumbersRef.current.scrollTop = (e.target as HTMLTextAreaElement).scrollTop
              }}
              spellCheck={false}
              className="flex-1 resize-none focus:outline-none py-3 pr-4 text-[12.5px] font-mono leading-[1.6]"
              style={{
                backgroundColor: '#1e1e2e',
                color: '#cdd6f4',
                caretColor: '#cdd6f4',
                tabSize: 2,
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── PW Office Panel — helper components ─────────────────────────────────────

function PwMarkdownContent({ text, onRunCode, agentName }: {
  text: string
  onRunCode?: (code: string, agentName?: string) => void
  agentName?: string
}) {
  const [copied,  setCopied]  = useState<number | null>(null)
  const [running, setRunning] = useState<number | null>(null)
  const copyCode = useCallback((code: string, idx: number) => {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(idx); setTimeout(() => setCopied(null), 2000)
    })
  }, [])
  const parts = text.split(/(```[\w]*\n[\s\S]*?```)/g)
  return (
    <div className="text-[11px] leading-relaxed">
      {parts.map((part, i) => {
        const fm = /^```([\w]*)\n([\s\S]*?)```$/.exec(part)
        if (fm) {
          const lang = fm[1] || 'text'; const code = fm[2].trimEnd()
          const isRunnable = !!onRunCode && /^(typescript|javascript|ts|js)$/i.test(lang)
          return (
            <div key={i} className="relative my-1.5 rounded-lg overflow-hidden"
              style={{ background: '#0d1117', border: '1px solid #30363d' }}>
              <div className="flex items-center justify-between px-2 py-1"
                style={{ background: '#161b22', borderBottom: '1px solid #30363d' }}>
                <span className="text-[9px] font-mono uppercase" style={{ color: '#8b949e' }}>{lang}</span>
                <div className="flex items-center gap-1">
                  {isRunnable && (
                    <button
                      onClick={() => {
                        setRunning(i)
                        onRunCode!(code, agentName)
                        setTimeout(() => setRunning(null), 3000)
                      }}
                      disabled={running === i}
                      className="text-[9px] px-1.5 py-0.5 rounded transition-colors flex items-center gap-0.5"
                      style={{
                        color:      running === i ? '#58a6ff' : '#3fb950',
                        background: running === i ? 'rgba(88,166,255,0.1)' : 'rgba(63,185,80,0.08)',
                        border:     `1px solid ${running === i ? 'rgba(88,166,255,0.3)' : 'rgba(63,185,80,0.25)'}`,
                        opacity: running !== null && running !== i ? 0.5 : 1,
                      }}>
                      {running === i ? '⟳ Queued' : '▶ Run in Dashboard'}
                    </button>
                  )}
                  <button onClick={() => copyCode(code, i)} className="text-[9px] px-1.5 py-0.5 rounded transition-colors"
                    style={{ color: copied === i ? '#3fb950' : '#8b949e', background: copied === i ? 'rgba(63,185,80,0.1)' : 'transparent' }}>
                    {copied === i ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <pre className="px-3 py-2 overflow-x-auto font-mono text-[10px]" style={{ color: '#e6edf3', margin: 0 }}>
                <code>{code}</code>
              </pre>
            </div>
          )
        }
        const lines = part.split('\n')
        return (
          <span key={i}>
            {lines.map((line, li) => {
              const segs = line.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g)
              return (
                <span key={li}>
                  {segs.map((seg, si) => {
                    if (/^`[^`]+`$/.test(seg)) return <code key={si} className="px-0.5 rounded text-[10px] font-mono" style={{ background: 'rgba(110,118,129,0.2)', color: '#f0883e' }}>{seg.slice(1,-1)}</code>
                    if (/^\*\*[^*]+\*\*$/.test(seg)) return <strong key={si} style={{ color: '#e6edf3' }}>{seg.slice(2,-2)}</strong>
                    if (/^\*[^*]+\*$/.test(seg)) return <em key={si}>{seg.slice(1,-1)}</em>
                    return <span key={si}>{seg}</span>
                  })}
                  {li < lines.length - 1 && <br />}
                </span>
              )
            })}
          </span>
        )
      })}
    </div>
  )
}

function PwMessageBubble({ msg, isStreaming, agents, onRunCode }: {
  msg: Message; isStreaming: boolean; agents: AgentConfig[]
  onRunCode?: (code: string, agentName?: string) => void
}) {
  const isUser  = msg.role === 'user'
  const agent   = msg.agentId ? agents.find(a => a.id === msg.agentId) : null
  const accent  = agent ? PW_SPRITE_ACCENT[agent.characterSprite] : null
  const avatarBg   = isUser ? '#1e3a5f' : (accent?.bg   ?? '#0f2a1a')
  const avatarRing = isUser ? '#1d4ed8' : (accent?.ring ?? '#166534')
  const avatarText = isUser ? '#93c5fd' : (accent?.text ?? '#4ade80')
  const initials   = isUser ? 'U'       : (msg.senderName?.slice(0,2).toUpperCase() ?? 'AI')
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end`}>
      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold"
        style={{ background: avatarBg, color: avatarText, border: `1.5px solid ${avatarRing}` }}>
        {initials}
      </div>
      <div className={`flex flex-col gap-0.5 max-w-[88%] ${isUser ? 'items-end' : 'items-start'}`}>
        <span className="text-[9px] font-medium px-0.5" style={{ color: 'var(--text-muted)' }}>
          {msg.senderName}
          <span className="ml-1 font-normal opacity-60">
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </span>
        <div className="rounded-xl px-2.5 py-2"
          style={{
            background: isUser ? 'linear-gradient(135deg,#1e3a5f,#1a3050)' : 'var(--bg-card)',
            border: `1px solid ${isUser ? '#1e4080' : 'var(--border)'}`,
            color: 'var(--text-main)', wordBreak: 'break-word',
          }}>
          {msg.attachments?.filter(a => !a.type.startsWith('image/')).map((att, i) => (
            <span key={i} className="inline-flex items-center gap-1 mr-1 mb-1.5 px-1.5 py-0.5 rounded text-[9px]"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              <FileText size={8} />{att.name}
            </span>
          ))}
          {msg.attachments?.filter(a => a.type.startsWith('image/')).map((att, i) => (
            <img key={i} src={att.content} alt={att.name} className="max-w-full rounded-lg mb-1.5 block"
              style={{ border: '1px solid var(--border)', maxHeight: 150, objectFit: 'cover' }} />
          ))}
          {isUser
            ? <span className="text-[11px] leading-relaxed whitespace-pre-wrap">{msg.content}</span>
            : (msg.content
                ? <PwMarkdownContent text={msg.content} onRunCode={onRunCode} agentName={agent?.name} />
                : <span className="flex gap-0.5 items-center py-0.5">
                    {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                  </span>
              )
          }
          {isStreaming && msg.content && (
            <span className="inline-block w-1.5 h-3 ml-0.5 animate-pulse rounded-sm align-middle"
              style={{ background: accent?.bar ?? '#4ade80', verticalAlign: 'middle' }} />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── PW Office Panel ─────────────────────────────────────────────────────────

interface PwOfficePanelProps {
  running:      boolean
  suites:       TestSuite[]
  onRunCode?:   (code: string, agentName?: string) => void
  onRunAll?:    () => void
}

function PwOfficePanel({ running, suites, onRunCode, onRunAll }: PwOfficePanelProps) {
  const {
    agents, settings, updateSettings,
    messages, appendMessage, appendChunk, clearHistory,
    activeTypingAgents,
    setAgentStatus, setActiveTyping, removeActiveTyping,
  } = useSettings()

  const panRef       = useRef({ x: 0, y: 0 })
  const chatEndRef   = useRef<HTMLDivElement>(null)
  const textareaRef  = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const abortRef     = useRef<AbortController | null>(null)

  const [assetsReady,    setAssetsReady]    = useState(false)
  const [inputText,      setInputText]      = useState('')
  const [pendingFiles,   setPendingFiles]   = useState<Attachment[]>([])
  const [mentionQuery,   setMentionQuery]   = useState<string | null>(null)
  const [mentionIndex,   setMentionIndex]   = useState(0)
  const [streamingMsgId, setStreamingMsgId] = useState<string | null>(null)
  const [errorBanner,    setErrorBanner]    = useState<string | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState<string>('')

  // Default selected agent to first available
  useEffect(() => {
    if (!selectedAgentId && agents.length > 0) setSelectedAgentId(agents[0].id)
  }, [agents, selectedAgentId])

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingMsgId])

  // ── Mount: init singleton + load assets ──────────────────────────────────
  useEffect(() => {
    if (!_pwOfficeState) _pwOfficeState = new OfficeState()
    const os = _pwOfficeState
    Promise.all([loadOfficeAssets(), loadDefaultLayout()])
      .then(([, rawLayout]) => {
        if (rawLayout) os.rebuildFromLayout(rawLayout as OfficeLayout)
        agents.forEach((_agent, idx) => {
          const numId = pwAgentNumId(idx)
          if (!os.characters.has(numId)) {
            os.addAgent(numId, undefined, undefined, undefined, true)
          }
          const active =
            running ||
            (hasFailures && (_agent.id === 'agent-triage' || _agent.id === 'agent-healer'))
          os.setAgentActive(numId, active)
        })
        setAssetsReady(true)
      })
      .catch(() => setAssetsReady(true))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Derive failure flag ───────────────────────────────────────────────────
  const hasFailures = suites.some(s => s.tests.some(t => t.status === 'failed'))

  // ── Sync: drive animations from test state ────────────────────────────────
  useEffect(() => {
    if (!_pwOfficeState) return
    agents.forEach((agent, idx) => {
      const numId  = pwAgentNumId(idx)
      const active =
        running ||
        (hasFailures && (agent.id === 'agent-triage' || agent.id === 'agent-healer'))
      _pwOfficeState!.setAgentActive(numId, active)
    })
  }, [agents, running, hasFailures])

  const handleAgentClick = (charId: number) => {
    const agent = agents[charId - 1]
    if (!agent) return
    setSelectedAgentId(agent.id)
  }

  // ── @-mention autocomplete ────────────────────────────────────────────────

  const mentionMatches = mentionQuery !== null
    ? agents.filter(a =>
        a.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
        a.role.toLowerCase().includes(mentionQuery.toLowerCase()),
      )
    : []

  const insertMention = useCallback((agentName: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const pos   = textarea.selectionStart
    const text  = inputText
    const atIdx = text.lastIndexOf('@', pos - 1)
    if (atIdx === -1) return
    const next = `${text.slice(0, atIdx)}@${agentName} ${text.slice(pos)}`
    setInputText(next)
    setMentionQuery(null)
    requestAnimationFrame(() => {
      const newPos = atIdx + agentName.length + 2
      textarea.setSelectionRange(newPos, newPos)
      textarea.focus()
    })
  }, [inputText])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setInputText(val)
    const atMatch = /@([\w ]*)$/.exec(val.slice(0, e.target.selectionStart))
    if (atMatch) { setMentionQuery(atMatch[1]); setMentionIndex(0) }
    else setMentionQuery(null)
  }

  const handleKeyDownChat = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionQuery !== null && mentionMatches.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIndex(i => (i+1) % mentionMatches.length); return }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setMentionIndex(i => (i-1+mentionMatches.length) % mentionMatches.length); return }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); insertMention(mentionMatches[mentionIndex].name); return }
      if (e.key === 'Escape')    { setMentionQuery(null); return }
    }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend() }
  }

  // ── File attachment ───────────────────────────────────────────────────────

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    files.forEach(file => {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = () => setPendingFiles(prev => [...prev, { name: file.name, type: file.type, content: reader.result as string }])
        reader.readAsDataURL(file)
      } else if (PW_TEXT_EXTENSIONS.has(ext)) {
        const reader = new FileReader()
        reader.onload = () => {
          const text    = reader.result as string
          const inlined = `[File: ${file.name}]\n\`\`\`\n${text}\n\`\`\``
          setInputText(prev => prev ? `${prev}\n\n${inlined}` : inlined)
          setPendingFiles(prev => [...prev, { name: file.name, type: 'text/plain', content: text }])
        }
        reader.readAsText(file)
      }
    })
    e.target.value = ''
  }

  // ── Parse @-mentions ──────────────────────────────────────────────────────

  const parseTaggedAgents = useCallback((text: string) => {
    const names   = [...text.matchAll(/@([\w]+(?:\s[\w]+)*)/g)].map(m => m[1].trim())
    const matched = names
      .map(name => agents.find(a => a.name.toLowerCase() === name.toLowerCase()))
      .filter((a): a is AgentConfig => a !== undefined)
    return [...new Map(matched.map(a => [a.id, a])).values()]
  }, [agents])

  // ── Send message ──────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    const text = inputText.trim()
    if (!text && pendingFiles.length === 0) return
    if (streamingMsgId) return

    setMentionQuery(null)
    setErrorBanner(null)

    const imageAtts = pendingFiles.filter(f => f.type.startsWith('image/'))
    const allAtts   = pendingFiles

    const userMsg: Message = {
      id: crypto.randomUUID(), role: 'user', content: text,
      senderName: 'User', timestamp: Date.now(),
      attachments: allAtts.length > 0 ? allAtts : undefined,
    }
    appendMessage(userMsg)
    setInputText('')
    setPendingFiles([])

    // ── Slash-command interception: @AgentName /command ────────────────────
    const slashMatch = /^@([\w][\w ]*?)\s+\/([\w-]+)/i.exec(text.trim())
    if (slashMatch) {
      const [, mentionedName, command] = slashMatch
      const cmdAgent = agents.find(a =>
        a.name.toLowerCase() === mentionedName.toLowerCase().trim(),
      )
      if (cmdAgent && ['run', 'run-all', 'fix-failures'].includes(command.toLowerCase())) {
        setAgentStatus(cmdAgent.id, 'working')
        const cmdMsg: Message = {
          id: crypto.randomUUID(), role: 'model',
          content: `▶ Command \`/${command}\` received — triggering automation suite…`,
          senderName: cmdAgent.name, agentId: cmdAgent.id, timestamp: Date.now(),
        }
        appendMessage(cmdMsg)
        // Kick off test run and restore idle state when done
        onRunAll?.()
        setTimeout(() => setAgentStatus(cmdAgent.id, 'idle'), 5000)
        setStreamingMsgId(null)
        return
      }
    }

    const tagged  = parseTaggedAgents(text)
    const targets = tagged.length > 0
      ? tagged
      : (selectedAgentId
          ? agents.filter(a => a.id === selectedAgentId)
          : agents.length > 0 ? [agents[0]] : [])
    if (targets.length === 0) return

    setActiveTyping(targets.map(a => a.id))
    targets.forEach(a => setAgentStatus(a.id, 'working'))

    const modelMsgId     = crypto.randomUUID()
    const respondentName = targets.length === 1 ? targets[0].name : targets.map(a => a.name).join(' + ')

    const modelMsg: Message = {
      id: modelMsgId, role: 'model', content: '',
      senderName: respondentName,
      agentId:    targets.length === 1 ? targets[0].id : undefined,
      timestamp:  Date.now(),
    }
    appendMessage(modelMsg)
    setStreamingMsgId(modelMsgId)

    const priorMessages = messages.map(m => ({ role: m.role, content: m.content }))

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const isOllama = settings.provider === 'ollama'
      const resp = await fetch(`${API_BASE}/api/qa-agent`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${settings.geminiApiKey}`,
        },
        body: JSON.stringify({
          message:          text,
          history:          priorMessages,
          agentIds:         targets.map(a => a.id),
          agents:           agents.map(a => ({ id: a.id, name: a.name, systemPrompt: a.systemPrompt })),
          imageAttachments: isOllama ? [] : imageAtts.map(att => ({ name: att.name, type: att.type, content: att.content })),
          model:            isOllama ? settings.ollamaModel : settings.defaultModel,
          provider:         settings.provider,
          ollamaBaseUrl:    settings.ollamaBaseUrl,
        }),
        signal: controller.signal,
      })

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({ error: `HTTP ${resp.status}` })) as { error?: string }
        appendChunk(modelMsgId, `\n\n[Error: ${errData.error ?? 'Unknown error'}]`)
        targets.forEach(a => setAgentStatus(a.id, 'error'))
        setActiveTyping([]); setStreamingMsgId(null); return
      }

      const reader  = resp.body.getReader()
      const decoder = new TextDecoder()
      let buffer    = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw) continue
          try {
            const payload = JSON.parse(raw) as { chunk?: string; done?: boolean; error?: string }
            if (payload.error) {
              appendChunk(modelMsgId, `\n\n[Error: ${payload.error}]`)
              targets.forEach(a => setAgentStatus(a.id, 'error'))
              setActiveTyping([]); setStreamingMsgId(null); return
            }
            if (payload.chunk) appendChunk(modelMsgId, payload.chunk)
            if (payload.done) {
              targets.forEach(a => { setAgentStatus(a.id, 'idle'); removeActiveTyping(a.id) })
              setStreamingMsgId(null); return
            }
          } catch { /* malformed line */ }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      const errMsg = err instanceof Error ? err.message : 'Network error'
      appendChunk(modelMsgId, `\n\n[Error: ${errMsg}]`)
      targets.forEach(a => setAgentStatus(a.id, 'error'))
      setActiveTyping([]); setStreamingMsgId(null)
    }
  }, [
    inputText, pendingFiles, streamingMsgId, settings, agents, messages, selectedAgentId,
    appendMessage, appendChunk, parseTaggedAgents,
    setActiveTyping, setAgentStatus, removeActiveTyping,
    onRunAll,
  ])

  const handleStop = () => {
    abortRef.current?.abort()
    setStreamingMsgId(null)
    setActiveTyping([])
    agents.forEach(a => { if (activeTypingAgents.includes(a.id)) setAgentStatus(a.id, 'idle') })
  }

  const anyTyping = activeTypingAgents.length > 0

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between px-3"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-body)', height: 34 }}>
        <div className="flex items-center gap-1.5">
          <span className="text-sm leading-none">🏢</span>
          <span className="text-[11px] font-bold" style={{ color: 'var(--text-main)' }}>QA Office</span>
          <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>· {agents.length} agents</span>
        </div>
        <div className="flex items-center gap-2">
          {running && (
            <span className="flex items-center gap-1 text-[9px] font-semibold" style={{ color: '#60a5fa' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block" /> Running
            </span>
          )}
          {!running && hasFailures && (
            <span className="flex items-center gap-1 text-[9px] font-semibold" style={{ color: '#f87171' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" /> Failures
            </span>
          )}
          {!running && !hasFailures && agents.length > 0 && (
            <span className="flex items-center gap-1 text-[9px] font-semibold" style={{ color: '#34d399' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> All idle
            </span>
          )}
          {/* Provider toggle */}
          <div className="flex items-center rounded overflow-hidden"
            style={{ border: '1px solid var(--border)', fontSize: 8 }}>
            {(['gemini', 'ollama'] as const).map(p => (
              <button key={p} onClick={() => updateSettings({ provider: p })}
                className="px-1.5 py-0.5 font-bold transition-colors"
                style={{
                  background: settings.provider === p ? (p === 'gemini' ? '#1d4ed8' : '#065f46') : 'transparent',
                  color: settings.provider === p ? '#fff' : 'var(--text-muted)',
                }}>
                {p === 'gemini' ? '✨' : '🦙'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Canvas (fixed height) ─────────────────────────────────────────── */}
      <div className="shrink-0 relative" style={{ height: 155, background: '#1a1a2e' }}>
        {assetsReady && _pwOfficeState ? (
          <OfficeCanvas officeState={_pwOfficeState} onAgentClick={handleAgentClick}
            zoom={1} onZoomChange={() => {}} panRef={panRef} locked />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* ── Compact agent strip ───────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-1 px-2 py-1.5 overflow-x-auto"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-body)', scrollbarWidth: 'none' }}>
        {agents.map(agent => {
          const accent     = PW_SPRITE_ACCENT[agent.characterSprite]
          const active     = running || (hasFailures && (agent.id === 'agent-triage' || agent.id === 'agent-healer'))
          const isTyping   = activeTypingAgents.includes(agent.id)
          const isSelected = agent.id === selectedAgentId
          return (
            <button key={agent.id} onClick={() => setSelectedAgentId(agent.id)}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium shrink-0 transition-all"
              style={{
                background:  isSelected ? accent.bg    : 'transparent',
                border:      `1px solid ${isSelected ? accent.ring : 'var(--border)'}`,
                color:       isSelected ? accent.text  : 'var(--text-muted)',
                boxShadow:   isSelected ? `0 0 0 1px ${accent.ring}40` : undefined,
              }}
              title={agent.role}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active || isTyping ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: active || isTyping ? '#60a5fa' : accent.bar }} />
              {agent.name.split(' ')[0]}
            </button>
          )
        })}
      </div>

      {/* ── Chat toolbar ─────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-1.5 px-2 py-1 border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-body)' }}>
        {/* Full agent selector (synced with strip above) */}
        <select value={selectedAgentId} onChange={e => setSelectedAgentId(e.target.value)}
          className="flex-1 min-w-0 rounded px-1.5 py-0.5 text-[9px] font-medium"
          style={{ background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border)', outline: 'none' }}>
          {agents.map(a => <option key={a.id} value={a.id}>{a.name} — {a.role}</option>)}
        </select>
        <button onClick={clearHistory}
          className="shrink-0 p-1 rounded hover:text-red-400 transition-colors"
          style={{ color: 'var(--text-muted)' }} title="Clear history">
          <Trash2 size={10} />
        </button>
      </div>

      {/* ── Hints / banners ──────────────────────────────────────────────── */}
      {settings.provider === 'ollama' && settings.ollamaModel && (
        <div className="shrink-0 px-2 py-0.5 text-[9px]" style={{ background: '#052e16', color: '#4ade80' }}>
          🦙 {settings.ollamaModel} · local
        </div>
      )}
      {settings.provider === 'ollama' && !settings.ollamaModel.trim() && (
        <div className="shrink-0 px-2 py-0.5 text-[9px]" style={{ background: '#451a03', color: '#fbbf24' }}>
          ⚠ No Ollama model — configure in Settings
        </div>
      )}
      {settings.provider === 'gemini' && !settings.geminiApiKey.trim() && (
        <div className="shrink-0 px-2 py-0.5 text-[9px]" style={{ background: '#451a03', color: '#fbbf24' }}>
          ⚠ No Gemini API key — configure in Settings
        </div>
      )}
      {errorBanner && (
        <div className="shrink-0 flex items-center gap-1 px-2 py-0.5 text-[9px]" style={{ background: '#2d0a0a', color: '#fca5a5' }}>
          <span className="flex-1">{errorBanner}</span>
          <button onClick={() => setErrorBanner(null)}><X size={9} /></button>
        </div>
      )}

      {/* ── Pending file chips ────────────────────────────────────────────── */}
      {pendingFiles.length > 0 && (
        <div className="shrink-0 flex flex-wrap gap-1 px-2 py-1 border-b" style={{ borderColor: 'var(--border)' }}>
          {pendingFiles.map((f, i) => (
            <span key={i} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px]"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              <FileText size={8} />{f.name}
              <button onClick={() => setPendingFiles(prev => prev.filter((_,j) => j !== i))} className="hover:text-red-400">
                <X size={8} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* ── Messages (scrollable, fills remaining height) ─────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2 flex flex-col gap-2"
        style={{ background: 'var(--bg-body)' }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center select-none">
            <p className="text-xs font-semibold" style={{ color: 'var(--text-main)' }}>Chat with your team</p>
            <p className="text-[10px] max-w-[240px]" style={{ color: 'var(--text-muted)' }}>
              Select an agent above or type <code style={{ fontFamily: 'monospace', background: 'var(--bg-muted)', padding: '0 3px', borderRadius: 3 }}>@Name</code> to target them
            </p>
            <div className="flex flex-wrap gap-1 justify-center max-w-[280px]">
              {agents.map(a => {
                const ac = PW_SPRITE_ACCENT[a.characterSprite]
                return (
                  <button key={a.id} onClick={() => setSelectedAgentId(a.id)}
                    className="px-1.5 py-0.5 rounded-full text-[9px] font-medium transition-opacity hover:opacity-80"
                    style={{ background: ac.bg, color: ac.text, border: `1px solid ${ac.ring}` }}>
                    @{a.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}
        {messages.map(msg => (
          <PwMessageBubble key={msg.id} msg={msg} isStreaming={msg.id === streamingMsgId} agents={agents} onRunCode={onRunCode} />
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* ── @mention autocomplete ─────────────────────────────────────────── */}
      {mentionQuery !== null && mentionMatches.length > 0 && (
        <div className="mx-2 mb-1 rounded-lg overflow-hidden border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          {mentionMatches.map((a, i) => {
            const ac = PW_SPRITE_ACCENT[a.characterSprite]
            return (
              <button key={a.id} onClick={() => insertMention(a.name)}
                className="w-full flex items-center gap-2 px-2 py-1 text-left transition-colors"
                style={{
                  background: i === mentionIndex ? 'var(--bg-body)' : 'transparent',
                  borderBottom: i < mentionMatches.length - 1 ? '1px solid var(--border)' : undefined,
                }}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
                  style={{ background: ac.bg, color: ac.text }}>{a.name.slice(0,2).toUpperCase()}</span>
                <span className="text-[10px] font-semibold" style={{ color: 'var(--text-main)' }}>{a.name}</span>
                <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{a.role}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* ── Input ────────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex flex-col gap-1 px-2 py-2 border-t"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        <div className="flex items-end gap-1.5">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDownChat}
            placeholder={`Ask ${agents.find(a => a.id === selectedAgentId)?.name ?? 'agent'} or @mention…`}
            rows={2}
            className="flex-1 resize-none rounded-lg px-2 py-1.5 text-[11px] leading-relaxed outline-none"
            style={{ background: 'var(--bg-body)', color: 'var(--text-main)', border: '1px solid var(--border)' }}
          />
          <input ref={fileInputRef} type="file" multiple className="hidden"
            accept=".ts,.tsx,.js,.jsx,.json,.log,.txt,.md,.css,.html,.yaml,.yml,.py,.png,.jpg,.jpeg,.gif,.webp"
            onChange={handleFileSelect} />
          <button onClick={() => fileInputRef.current?.click()}
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
            style={{ background: 'var(--bg-body)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            title="Attach file">
            <Paperclip size={11} />
          </button>
          {streamingMsgId ? (
            <button onClick={handleStop}
              className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: '#374151', color: '#fff' }} title="Stop">
              <Square size={10} />
            </button>
          ) : (
            <button onClick={() => void handleSend()}
              disabled={!inputText.trim() && pendingFiles.length === 0}
              className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-40 transition-opacity"
              style={{ background: '#2563eb', color: '#fff' }} title="Send (Enter)">
              <Send size={11} />
            </button>
          )}
        </div>
        <p className="text-[8px] text-center" style={{ color: 'var(--text-muted)' }}>
          {anyTyping
            ? `${activeTypingAgents.map(id => agents.find(a => a.id === id)?.name ?? id).join(', ')} typing…`
            : 'Enter · Shift+Enter for newline · @ to mention'}
        </p>
      </div>

    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PlaywrightDashboard() {
  // ── Global settings + chat context ─────────────────────────────────────────
  const {
    settings,
    appendMessage,
    appendChunk,
    updateMessage,
    agents: allAgents,
  } = useSettings()

  const [suites, setSuites]               = useState<TestSuite[]>([])
  const [running, setRunning]             = useState(false)
  const [activeTab, setActiveTab]         = useState<FilterKey>('active')
  const [activeView, setActiveView]       = useState<ViewKey>('dashboard')
  const [config, setConfig]               = useState<PlaywrightConfig>(DEFAULT_CONFIG)
  const [savedConfig, setSavedConfig]     = useState<PlaywrightConfig | null>(null)
  const [lastSavedAt, setLastSavedAt]     = useState<string | null>(null)
  const [justSaved, setJustSaved]         = useState(false)
  const [settingsOpen, setSettingsOpen]   = useState(false)
  const [configTab, setConfigTab]         = useState<'config' | 'editor'>('config')
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>('list')
  const [searchQuery, setSearchQuery]     = useState('')
  const [expandedSuites, setExpandedSuites] = useState<Record<string, boolean>>({})
  const [expandedErrors, setExpandedErrors] = useState<Record<string, boolean>>({})
  const [hoveredTest, setHoveredTest]     = useState<string | null>(null)
  const [artifactModal, setArtifactModal] = useState<ArtifactModalState | null>(null)
  // ── Real-data states ────────────────────────────────────────────────────────
  const [serverOnline, setServerOnline]     = useState<boolean | null>(null)
  const [isLoading, setIsLoading]           = useState(false)
  const [demoMode, setDemoMode]             = useState(true)
  const [lastRunAt, setLastRunAt]           = useState<string | null>(null)
  const [runLog, setRunLog]                 = useState<string[]>([])
  const [showLog, setShowLog]               = useState(false)
  const [availableSpecs, setAvailableSpecs]   = useState<string[]>([])
  const [selectedSpecs, setSelectedSpecs]     = useState<Set<string>>(new Set())
  const [specPickerOpen, setSpecPickerOpen]   = useState(false)
  const specPickerRef                         = useRef<HTMLDivElement>(null)

  // Close spec picker when clicking outside
  useEffect(() => {
    if (!specPickerOpen) return
    const handler = (e: MouseEvent) => {
      if (specPickerRef.current && !specPickerRef.current.contains(e.target as Node))
        setSpecPickerOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [specPickerOpen])
  // ── Multi-run history ────────────────────────────────────────────────────────
  const [runHistory, setRunHistory]         = useState<RunRecord[]>(() => {
    try {
      const raw = localStorage.getItem(RUN_HISTORY_KEY)
      return raw ? (JSON.parse(raw) as RunRecord[]) : []
    } catch { return [] }
  })
  const [selectedRunId, setSelectedRunId]   = useState<string | null>(null)
  const [browsersOk, setBrowsersOk]         = useState<boolean | null>(null)
  const [bannerDismissed, setBannerDismissed] = useState(
    () => localStorage.getItem('pw_setup_banner_dismissed') === '1'
  )

  // ── Derived counts ──────────────────────────────────────────────────────────
  const allTests = useMemo(() => suites.flatMap(s => s.tests), [suites])
  const counts   = useMemo(() => ({
    total:   allTests.length,
    passed:  allTests.filter(t => t.status === 'passed').length,
    failed:  allTests.filter(t => t.status === 'failed').length,
    skipped: allTests.filter(t => t.status === 'skipped').length,
    pending: allTests.filter(t => t.status === 'pending').length,
  }), [allTests])
  const totalDuration = useMemo(() => allTests.reduce((a, t) => a + t.duration, 0), [allTests])
  const passRate = useMemo(() => {
    const denominator = counts.total - counts.skipped - counts.pending
    return denominator > 0 ? Math.round((counts.passed / denominator) * 100) : 0
  }, [counts])

  // ── Changed settings count (vs defaults) ───────────────────────────────────
  const changedCount = useMemo(() => {
    const d = DEFAULT_CONFIG
    let n = 0
    if (config.baseUrl       !== d.baseUrl)                    n++
    if (config.testDir       !== d.testDir)                    n++
    if (config.outputDir     !== d.outputDir)                  n++
    if (config.timeout       !== d.timeout)                    n++
    if (config.retries       !== d.retries)                    n++
    if (config.workers       !== d.workers)                    n++
    if (config.fullyParallel !== d.fullyParallel)              n++
    if (config.forbidOnly    !== d.forbidOnly)                 n++
    if (config.headed        !== d.headed)                     n++
    if (config.browsers.chromium !== d.browsers.chromium)      n++
    if (config.browsers.firefox  !== d.browsers.firefox)       n++
    if (config.browsers.webkit   !== d.browsers.webkit)        n++
    if (config.screenshot    !== d.screenshot)                 n++
    if (config.video         !== d.video)                      n++
    if (config.trace         !== d.trace)                      n++
    if (config.reporter      !== d.reporter)                   n++
    return n
  }, [config])

  // ── localStorage: load on mount ────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as { config: PlaywrightConfig; savedAt: string }
        setConfig(parsed.config)
        setSavedConfig(parsed.config)
        setLastSavedAt(parsed.savedAt)
      }
    } catch {
      // ignore corrupt storage
    }
  }, [])

  // ── Persist runHistory to localStorage so it survives page refresh ──────────
  useEffect(() => {
    try {
      localStorage.setItem(RUN_HISTORY_KEY, JSON.stringify(runHistory.slice(0, 30)))
    } catch { /* quota */ }
  }, [runHistory])

  // ── isSaved: true when current config matches what's persisted ──────────────
  const isSaved = useMemo(() =>
    savedConfig !== null && JSON.stringify(config) === JSON.stringify(savedConfig),
    [config, savedConfig]
  )

  // ── saveConfig ──────────────────────────────────────────────────────────────
  const saveConfig = useCallback(() => {
    const savedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ config, savedAt }))
    setSavedConfig(config)
    setLastSavedAt(savedAt)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
  }, [config])

  // ── Fetch results from server (latest or a specific archived run) ───────────
  const fetchResults = useCallback(async (runId?: string) => {
    setIsLoading(true)
    try {
      const url = runId
        ? `${API_BASE}/api/playwright/results/${runId}`
        : `${API_BASE}/api/playwright/results`
      const res = await fetch(url)
      if (res.status === 404) {
        setServerOnline(true)
        if (!runId) setDemoMode(true)
        return
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as { suites: TestSuite[]; runAt: string }
      setSuites(data.suites)
      setDemoMode(false)
      setServerOnline(true)
      setLastRunAt(data.runAt ?? null)
      setSelectedRunId(runId ?? null)
      setExpandedSuites(Object.fromEntries(data.suites.map(s => [s.id, true])))
    } catch {
      setServerOnline(false)
      setDemoMode(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchSpecs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/playwright/specs`)
      if (!res.ok) return
      const data = await res.json() as { specs: string[] }
      setAvailableSpecs(data.specs)
    } catch {
      // ignore — server may be offline
    }
  }, [])

  const clearHistory = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/api/playwright/history`, { method: 'DELETE' })
      setRunHistory([])
      setSelectedRunId(null)
      // Reload the latest pw-results.json (not a specific archived run)
      fetchResults()
    } catch { /* ignore network errors */ }
  }, [fetchResults])

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/playwright/history`)
      if (!res.ok) return
      const data = await res.json() as { runs: RunRecord[] }
      setRunHistory(data.runs)
    } catch {
      // ignore — server may be offline
    }
  }, [])

  // ── Fetch on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchResults()
    fetchSpecs()
    fetchHistory()
  }, [fetchResults, fetchSpecs, fetchHistory])

  // ── Auto-poll when server is offline — reconnects every 5 s ────────────────
  useEffect(() => {
    if (serverOnline !== false) return
    const id = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/playwright/specs`)
        if (res.ok) {
          setServerOnline(true)
          fetchResults()
          fetchSpecs()
          fetchHistory()
        }
      } catch { /* still offline */ }
    }, 5_000)
    return () => clearInterval(id)
  }, [serverOnline, fetchResults, fetchSpecs, fetchHistory])

  // ── Browser-binary check ────────────────────────────────────────────────────
  useEffect(() => {
    if (!serverOnline || demoMode) return
    fetch(`${API_BASE}/api/playwright/browser-check`)
      .then(r => r.json())
      .then((d: { ok: boolean }) => setBrowsersOk(d.ok))
      .catch(() => setBrowsersOk(null))
  }, [serverOnline, demoMode])

  // ── Slowest tests (top 3) ───────────────────────────────────────────────────
  const slowestTests = useMemo(() =>
    [...allTests].filter(t => t.duration > 0).sort((a, b) => b.duration - a.duration).slice(0, 3),
    [allTests]
  )

  // ── Filtered suites ─────────────────────────────────────────────────────────
  const filteredSuites = useMemo(() =>
    suites
      .map(s => ({
        ...s,
        tests: s.tests.filter(t => {
          const matchesTab    =
            activeTab === 'all'    ? true :
            activeTab === 'active' ? (t.status === 'passed' || t.status === 'failed') :
            t.status === activeTab
          const matchesSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase())
          return matchesTab && matchesSearch
        }),
      }))
      .filter(s => s.tests.length > 0),
    [suites, activeTab, searchQuery]
  )

  // ── Core SSE runner (shared by runTests + runSingleSpec) ───────────────────
  const runWithSSE = useCallback(async (body: Record<string, unknown>) => {
    const controller = new AbortController()
    const timeoutId  = setTimeout(() => controller.abort(), 10 * 60 * 1000) // 10-minute hard limit
    setRunning(true)
    setShowLog(true)
    setRunLog([])
    setExpandedErrors({})
    setSearchQuery('')
    setActiveView('dashboard')
    setSuites(prev => prev.map(s => ({ ...s, tests: s.tests.map(t => ({ ...t, status: 'pending' as Status, duration: 0 })) })))
    setExpandedSuites(prev => Object.fromEntries(Object.keys(prev).map(k => [k, true])))
    try {
      const response = await fetch(`${API_BASE}/api/playwright/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
      if (!response.ok || !response.body) throw new Error(`Server ${response.status}`)
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      outer: while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n')
        buffer = parts.pop() ?? ''
        for (const line of parts) {
          if (!line.startsWith('data: ')) continue
          let msg: string
          try { msg = JSON.parse(line.slice(6)) as string } catch { msg = line.slice(6) }
          if (msg.startsWith('[DONE]')) { break outer }
          setRunLog(prev => [...prev.slice(-999), msg])
        }
      }
      await fetchResults()
      // Small delay to allow Windows NTFS to flush the archive file before readdir
      await new Promise(r => setTimeout(r, 120))
      await fetchHistory()
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setRunLog(prev => [...prev, '[TIMEOUT] Test run exceeded 10 minutes and was cancelled.'])
      } else {
        setRunLog(prev => [...prev, `[ERROR] ${err instanceof Error ? err.message : String(err)}`])
      }
    } finally {
      clearTimeout(timeoutId)
      setRunning(false)
    }
  }, [fetchResults, fetchHistory])  // eslint-disable-line

  // ── Run a single spec from editor ─────────────────────────────────────────
  const runSingleSpec = useCallback((spec: string) => {
    runWithSSE({ spec, config })
  }, [runWithSSE, config])

  // ── Run an agent-generated code block via dynamic test endpoint ────────────
  const runDynamicTest = useCallback(async (code: string, agentName?: string) => {
    if (!serverOnline) {
      setShowLog(true)
      setRunLog([`[OFFLINE] Server not running — cannot execute dynamic test from ${agentName ?? 'agent'}`])
      return
    }
    const controller = new AbortController()
    const timeoutId  = setTimeout(() => controller.abort(), 10 * 60 * 1000)
    setRunning(true)
    setShowLog(true)
    setRunLog([`[INFO] Dynamic test from ${agentName ?? 'agent'} — executing…`])
    setExpandedErrors({})
    setSearchQuery('')
    setActiveView('dashboard')

    // Phase 2 tracking — AI summary streamed into chat
    let summaryMsgId: string | null = null
    let inSummaryPhase = false

    try {
      const response = await fetch(`${API_BASE}/api/run-dynamic-test`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          code,
          agentName,
          // AI credentials for post-run summarization
          apiKey:        settings.geminiApiKey,
          model:         settings.defaultModel,
          provider:      settings.provider,
          ollamaBaseUrl: settings.ollamaBaseUrl,
          ollamaModel:   settings.ollamaModel,
        }),
        signal:  controller.signal,
      })
      if (!response.ok || !response.body) throw new Error(`Server ${response.status}`)
      const reader  = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      outer: while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n')
        buffer = parts.pop() ?? ''
        for (const line of parts) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6)

          // Try parsing as a structured event object first
          let evt: Record<string, unknown> | null = null
          try {
            const parsed = JSON.parse(raw)
            if (parsed && typeof parsed === 'object' && 'evt' in parsed) {
              evt = parsed as Record<string, unknown>
            }
          } catch { /* not JSON — plain string */ }

          if (evt) {
            // ── Phase 2: structured summary events ──────────────────────────
            if (evt.evt === 'summary_start') {
              inSummaryPhase = true
              setRunning(false)   // stop spinner — tests are done

              // Find Edi M agent config for display name / agentId
              const mgrAgent = allAgents.find(a => a.id === TEAM_MANAGER_ID)
              const mgrName  = mgrAgent?.name ?? 'Edi M'
              const newMsgId = `dyn-summary-${Date.now()}`
              summaryMsgId   = newMsgId

              appendMessage({
                id:         newMsgId,
                role:       'model',
                content:    '',
                senderName: mgrName,
                agentId:    TEAM_MANAGER_ID,
                timestamp:  Date.now(),
                type:       'qa_summary',
              })
            } else if (evt.evt === 'summary_chunk' && summaryMsgId) {
              const chunk = typeof evt.text === 'string' ? evt.text : ''
              if (chunk) appendChunk(summaryMsgId, chunk)
            } else if (evt.evt === 'summary_done') {
              // Attach structured failure data if provided
              if (summaryMsgId && evt.failures) {
                updateMessage(summaryMsgId, {
                  summaryData: {
                    total:    typeof evt.total    === 'number' ? evt.total    : 0,
                    passed:   typeof evt.passed   === 'number' ? evt.passed   : 0,
                    failed:   typeof evt.failed   === 'number' ? evt.failed   : 0,
                    duration: typeof evt.duration === 'number' ? evt.duration : 0,
                    failures: evt.failures as QASummaryData['failures'],
                  },
                })
              }
              break outer
            }
            // skip other evt types
            continue
          }

          // ── Phase 1: plain string log lines ─────────────────────────────
          if (inSummaryPhase) continue   // ignore stray strings after phase 2 starts
          let msg: string
          try { msg = JSON.parse(raw) as string } catch { msg = raw }
          if (msg.startsWith('[DONE]')) {
            // [DONE] signals end of Phase 1 — wait for summary events unless none coming
            // (If AI credentials missing the server may skip summary phase entirely)
            if (!settings.geminiApiKey && settings.provider === 'gemini') break outer
            // else keep reading for summary_start
            continue
          }
          setRunLog(prev => [...prev.slice(-999), msg])
        }
      }

      await fetchResults()
      await new Promise(r => setTimeout(r, 120))
      await fetchHistory()
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setRunLog(prev => [...prev, '[TIMEOUT] Dynamic test exceeded 10 minutes and was cancelled.'])
      } else {
        setRunLog(prev => [...prev, `[ERROR] ${err instanceof Error ? err.message : String(err)}`])
      }
    } finally {
      clearTimeout(timeoutId)
      setRunning(false)
    }
  }, [serverOnline, fetchResults, fetchHistory, settings, appendMessage, appendChunk, updateMessage, allAgents])  // eslint-disable-line

  // ── Run tests (real SSE when server online, show offline message otherwise) ─
  const runTests = useCallback(async () => {
    if (!serverOnline) {
      setShowLog(true)
      setRunLog(['[OFFLINE] Server is not running. Start it with: npm run dev', '[OFFLINE] Waiting for server to come online…'])
      return
    }

    // ── Real run — delegate to runWithSSE ────────────────────────────────────
    const specList = selectedSpecs.size > 0 ? Array.from(selectedSpecs) : []
    const body: Record<string, unknown> = { config }
    if (specList.length === 1)     body.spec  = specList[0]
    else if (specList.length > 1)  body.specs = specList
    await runWithSSE(body)
  }, [serverOnline, selectedSpecs, config, runWithSSE])

  const reset = () => { setSuites([]); setActiveTab('all'); setExpandedErrors({}); setSearchQuery(''); setDemoMode(true); setLastRunAt(null); setSelectedRunId(null) }

  const exportReport = () => {
    const report = {
      generated: new Date().toISOString(),
      summary: { ...counts, passRate: `${passRate}%`, totalDuration: formatMs(totalDuration) },
      suites: suites.map(s => ({ title: s.title, file: s.file, tests: s.tests.map(t => ({ title: t.title, status: t.status, duration: formatMs(t.duration), retries: t.retries ?? 0 })) })),
    }
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'playwright-report.json'; a.click()
    URL.revokeObjectURL(url)
  }

  const toggleSuite = (id: string) => setExpandedSuites(p => ({ ...p, [id]: !p[id] }))
  const toggleError = (id: string) => setExpandedErrors(p => ({ ...p, [id]: !p[id] }))

  function suiteStatus(suite: TestSuite): Status {
    if (suite.tests.some(t => t.status === 'running')) return 'running'
    if (suite.tests.some(t => t.status === 'failed'))  return 'failed'
    if (suite.tests.every(t => t.status === 'passed')) return 'passed'
    if (suite.tests.every(t => t.status === 'skipped' || t.status === 'pending')) return 'skipped'
    return 'pending'
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-body)' }}>

      {/* ── Left: pixel-agents canvas sidebar (lg+) ──────────────────────── */}
      <aside
        className="hidden lg:flex flex-col shrink-0 sticky top-14 overflow-hidden"
        style={{ width: 360, height: 'calc(100vh - 3.5rem)', borderRight: '1px solid var(--border)' }}
      >
        <PwOfficePanel
          running={running}
          suites={suites}
          onRunCode={runDynamicTest}
          onRunAll={() => { void runTests() }}
        />
      </aside>

      {/* ── Right: existing scrollable dashboard content ──────────────────── */}
      <div className="flex-1 min-w-0 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-up">

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight"
              style={{ background: 'linear-gradient(135deg, var(--text-main) 0%, #3b82f6 60%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Playwright Dashboard
            </h1>
              {serverOnline === true && !demoMode && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  Live
                </span>
              )}
              {demoMode && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#fefce8', color: '#92400e', border: '1px solid #fde68a' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                  Demo
                </span>
              )}
              {serverOnline === false && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                  Offline
                </span>
              )}
            </div>
            <p className="text-xs mt-1.5 flex items-center gap-2 flex-wrap" style={{ color: 'var(--text-muted)' }}>
              <span>{suites.length} suites</span>
              <span style={{ color: 'var(--border)' }}>·</span>
              <span>{counts.total} tests</span>
              {totalDuration > 0 && <>
                <span style={{ color: 'var(--border)' }}>·</span>
                <span>{formatMs(totalDuration)}</span>
              </>}
              {lastRunAt && <>
                <span style={{ color: 'var(--border)' }}>·</span>
                <span>last run {new Date(lastRunAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </>}
              {isLoading && <span className="text-blue-400 flex items-center gap-1"><RotateCcw size={10} className="animate-spin" /> loading…</span>}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View switcher */}
            <div className="flex items-center gap-0.5 p-1 rounded-xl border"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
              {([
                { key: 'dashboard' as const, label: 'Dashboard', icon: <LayoutDashboard size={12} /> },
                { key: 'docs'      as const, label: 'Docs',      icon: <BookOpen size={12} /> },
              ]).map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveView(key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={activeView === key
                    ? { backgroundColor: 'var(--bg-body)', color: '#2563eb', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }
                    : { color: 'var(--text-muted)' }
                  }
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>

            {/* Dashboard actions */}
            {activeView === 'dashboard' && (
              <>
                {/* Multi-spec picker */}
                {availableSpecs.length > 0 && (
                  <div className="relative" ref={specPickerRef}>
                    <button
                      onClick={() => setSpecPickerOpen(v => !v)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors"
                      style={specPickerOpen || selectedSpecs.size > 0
                        ? { borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.07)', color: '#2563eb' }
                        : { borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }
                      }
                    >
                      <CheckSquare size={12} />
                      {selectedSpecs.size === 0
                        ? 'All specs'
                        : `${selectedSpecs.size} spec${selectedSpecs.size > 1 ? 's' : ''}`}
                      <ChevronDown size={11} />
                    </button>
                    {specPickerOpen && (
                      <div className="absolute top-full left-0 mt-1 z-50 rounded-xl border shadow-lg overflow-hidden min-w-[220px]"
                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                        <div className="flex items-center justify-between px-3 py-2 border-b text-[11px]"
                          style={{ borderColor: 'var(--border)' }}>
                          <span className="font-bold" style={{ color: 'var(--text-main)' }}>Select specs to run</span>
                          <button
                            onClick={() => setSelectedSpecs(selectedSpecs.size === availableSpecs.length ? new Set() : new Set(availableSpecs))}
                            className="font-semibold hover:underline"
                            style={{ color: '#2563eb' }}>
                            {selectedSpecs.size === availableSpecs.length ? 'None' : 'All'}
                          </button>
                        </div>
                        {availableSpecs.map(s => (
                          <label key={s} className="flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors hover:bg-opacity-50"
                            style={{ backgroundColor: selectedSpecs.has(s) ? 'rgba(37,99,235,0.06)' : undefined }}>
                            <input
                              type="checkbox"
                              checked={selectedSpecs.has(s)}
                              onChange={() => setSelectedSpecs(prev => {
                                const next = new Set(prev)
                                next.has(s) ? next.delete(s) : next.add(s)
                                return next
                              })}
                              className="rounded accent-blue-600"
                            />
                            <span className="text-[11px] font-mono" style={{ color: 'var(--text-main)' }}>
                              {s.replace(/\.spec\.(ts|js)$/, '')}<span className="opacity-40">.spec.ts</span>
                            </span>
                          </label>
                        ))}
                        <div className="px-3 py-2 border-t" style={{ borderColor: 'var(--border)' }}>
                          <button onClick={() => setSpecPickerOpen(false)}
                            className="w-full py-1.5 rounded-lg text-xs font-semibold"
                            style={{ backgroundColor: '#2563eb', color: '#fff' }}>
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {/* Quick grep filter */}
                <div className="relative flex items-center">
                  <Search size={11} className="absolute left-2.5 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={config.grep}
                    onChange={e => setConfig(c => ({ ...c, grep: e.target.value }))}
                    placeholder="grep filter…"
                    className="pl-7 pr-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 w-36"
                    style={{ borderColor: config.grep ? '#2563eb' : 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
                    title="Filter tests by title (--grep)"
                  />
                  {config.grep && (
                    <button onClick={() => setConfig(c => ({ ...c, grep: '' }))} className="absolute right-2 opacity-50 hover:opacity-100">
                      <X size={10} />
                    </button>
                  )}
                </div>
                <button onClick={exportReport}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{ color: 'var(--text-muted)', background: 'transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.background = 'var(--bg-card)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}>
                  <Download size={13} /> Export
                </button>
                <button onClick={() => fetchResults()} disabled={running || isLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
                  style={{ color: 'var(--text-muted)', background: 'transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.background = 'var(--bg-card)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
                  title="Reload results from server">
                  <RotateCcw size={13} className={isLoading ? 'animate-spin' : ''} /> Refresh
                </button>
                <button onClick={reset} disabled={running}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
                  style={{ color: 'var(--text-muted)', background: 'transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.background = 'var(--bg-card)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
                  title="Reset to demo data">
                  Demo
                </button>
                <button
                  onClick={() => setSettingsOpen(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={settingsOpen
                    ? { background: 'rgba(37,99,235,0.08)', color: '#2563eb' }
                    : { background: 'transparent', color: 'var(--text-muted)' }
                  }
                  onMouseEnter={e => { if (!settingsOpen) { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.background = 'var(--bg-card)' } }}
                  onMouseLeave={e => { if (!settingsOpen) { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' } }}
                  title="Toggle config panel">
                  <Settings size={13} />
                  Config
                  {changedCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-px rounded-full bg-blue-600 text-white leading-none">{changedCount}</span>
                  )}
                  {settingsOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                </button>
                <button
                  onClick={running ? () => setRunning(false) : runTests}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-95 ${running ? 'text-white' : 'text-white'}`}
                  style={running
                    ? { background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 0 0 3px rgba(239,68,68,0.25), 0 2px 8px rgba(239,68,68,0.3)' }
                    : { background: 'linear-gradient(135deg,#3b82f6,#6366f1)', boxShadow: '0 0 0 3px rgba(59,130,246,0.2), 0 2px 8px rgba(99,102,241,0.3)' }
                  }>
                  {running ? <><Square size={14} /> Stop</> : <><Play size={14} /> Run Tests</>}
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Dashboard view ───────────────────────────────────────────────────── */}
        {activeView === 'dashboard' && (
          <>
            {/* Demo-mode banner */}
            {demoMode && (
              <div className="flex items-center gap-2 px-4 py-2.5 mb-4 rounded-xl border text-[11px]"
                style={{ background: '#fffbeb', borderColor: '#fde68a', color: '#92400e' }}>
                <AlertTriangle size={12} className="shrink-0" />
                <span>
                  <strong>Demo mode</strong> — showing sample data.
                  {serverOnline === false
                    ? ' Start the Express server (npm run dev) then click Refresh.'
                    : serverOnline === true
                      ? ' No results file found yet — click Run Tests to generate real data.'
                      : ' Connecting to server…'}
                </span>
                <button
                  onClick={() => fetchResults()}
                  className="ml-auto shrink-0 font-semibold underline hover:no-underline"
                  style={{ color: '#92400e' }}>
                  Retry
                </button>
              </div>
            )}

            {/* Browser-not-installed banner */}
            {browsersOk === false && !bannerDismissed && !demoMode && (
              <div className="flex items-start gap-3 px-4 py-3 mb-4 rounded-xl border text-xs"
                style={{ backgroundColor: '#451a03', borderColor: '#92400e', color: '#fde68a' }}>
                <AlertTriangle size={15} className="mt-0.5 shrink-0" style={{ color: '#fbbf24' }} />
                <div className="flex-1">
                  <p className="font-semibold mb-1">Playwright browsers not installed</p>
                  <p className="mb-1.5" style={{ color: '#fcd34d' }}>Run this once in your terminal, then refresh the page:</p>
                  <code className="block rounded px-2 py-1 font-mono select-all text-[11px]"
                    style={{ backgroundColor: 'rgba(0,0,0,0.35)', color: '#a5f3fc' }}>
                    npx playwright install chromium
                  </code>
                </div>
                <button
                  onClick={() => {
                    localStorage.setItem('pw_setup_banner_dismissed', '1')
                    setBannerDismissed(true)
                  }}
                  className="shrink-0 hover:opacity-70 transition-opacity"
                  style={{ color: '#fde68a' }}
                  title="Dismiss">
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Historical-run banner */}
            {selectedRunId && !demoMode && (
              <div className="flex items-center gap-2 px-4 py-2.5 mb-4 rounded-xl border text-[11px]"
                style={{ background: 'rgba(59,130,246,0.05)', borderColor: '#93c5fd', color: '#1d4ed8' }}>
                <Clock size={12} className="shrink-0" />
                <span>
                  <strong>Historical run</strong> — viewing results from{' '}
                  {lastRunAt
                    ? new Date(lastRunAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : 'a past run'}.
                </span>
                <button
                  onClick={() => { fetchResults(); }}
                  className="ml-auto shrink-0 font-semibold underline hover:no-underline"
                  style={{ color: '#1d4ed8' }}>
                  Return to latest →
                </button>
              </div>
            )}

            {/* ── Presets bar (always visible) ────────────────────────── */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={11} style={{ color: '#8b5cf6' }} />
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Quick Presets</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map(preset => {
                  const isActive = preset.specs
                    ? preset.specs.every(s => selectedSpecs.has(s)) && selectedSpecs.size === preset.specs.length
                    : false
                  return (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setConfig(c => ({ ...c, ...preset.config }))
                        if (preset.specs) setSelectedSpecs(new Set(preset.specs))
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150"
                      style={{
                        backgroundColor: isActive ? `${preset.color}18` : 'var(--bg-card)',
                        color: isActive ? preset.color : 'var(--text-muted)',
                        boxShadow: isActive
                          ? `0 0 0 1.5px ${preset.color}60`
                          : '0 1px 3px rgba(0,0,0,0.06)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = `${preset.color}14`
                        e.currentTarget.style.color = preset.color
                        e.currentTarget.style.boxShadow = `0 0 0 1.5px ${preset.color}50`
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = isActive ? `${preset.color}18` : 'var(--bg-card)'
                        e.currentTarget.style.color = isActive ? preset.color : 'var(--text-muted)'
                        e.currentTarget.style.boxShadow = isActive ? `0 0 0 1.5px ${preset.color}60` : '0 1px 3px rgba(0,0,0,0.06)'
                      }}
                    >
                      <span>{preset.icon}</span>
                      {preset.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Collapsible config + editor panel ───────────────────── */}
            {settingsOpen && (
              <div className="rounded-2xl overflow-hidden mb-8" style={{ boxShadow: '0 2px 12px -4px rgba(37,99,235,0.18), 0 0 0 1px rgba(37,99,235,0.1)' }}>
                {/* Panel header with Config | Editor tabs */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b"
                  style={{ borderColor: '#bfdbfe', backgroundColor: 'rgba(37,99,235,0.04)' }}>
                  <div className="flex items-center gap-1">
                    {([
                      { id: 'config' as const, icon: <Settings size={12} />, label: 'Config' },
                      { id: 'editor' as const, icon: <PenLine size={12} />, label: 'Editor' },
                    ]).map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setConfigTab(tab.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={configTab === tab.id
                          ? { backgroundColor: 'var(--bg-card)', color: '#2563eb', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }
                          : { color: 'var(--text-muted)' }
                        }
                      >
                        {tab.icon} {tab.label}
                      </button>
                    ))}
                    {configTab === 'config' && changedCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-px rounded-full bg-blue-600 text-white leading-none ml-1">{changedCount} changed</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {configTab === 'config' && (
                      <>
                        <button onClick={() => setConfig(DEFAULT_CONFIG)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                          <RotateCcw size={11} /> Reset
                        </button>
                        <button
                          onClick={saveConfig}
                          disabled={isSaved}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-60"
                          style={justSaved
                            ? { backgroundColor: '#10b981', borderColor: '#10b981', color: '#fff' }
                            : isSaved
                              ? { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }
                              : { backgroundColor: '#2563eb', borderColor: '#2563eb', color: '#fff' }
                          }
                        >
                          {justSaved ? <><Check size={11} /> Saved!</> : isSaved ? <><Check size={11} /> Saved{lastSavedAt ? ` · ${lastSavedAt}` : ''}</> : <><Save size={11} /> Save</>}
                        </button>
                      </>
                    )}
                    <button onClick={() => setSettingsOpen(false)}
                      className="p-1.5 rounded-lg border transition-colors"
                      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                      <X size={12} />
                    </button>
                  </div>
                </div>
                {/* Panel body */}
                {configTab === 'config' ? (
                  <div className="p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
                    <SettingsView config={config} onChange={setConfig} noPresets />
                  </div>
                ) : serverOnline === false ? (
                  /* Server offline — don't attempt fetch, show clear instructions */
                  <div className="flex flex-col items-center justify-center gap-3 py-16 px-6" style={{ backgroundColor: 'var(--bg-card)' }}>
                    <Terminal size={28} className="opacity-30" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Server is offline</p>
                    <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                      The test editor reads and saves files through your local Express server.<br />
                      Start it with <code className="font-mono px-1 py-0.5 rounded text-[11px]" style={{ backgroundColor: 'var(--bg-body)' }}>npm run dev</code> then click Retry.
                    </p>
                    <button
                      onClick={() => { fetchSpecs(); fetchResults() }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors"
                      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)', color: 'var(--text-main)' }}>
                      <RefreshCw size={12} /> Retry connection
                    </button>
                  </div>
                ) : serverOnline === null ? (
                  /* Still connecting */
                  <div className="flex items-center justify-center gap-2 py-16" style={{ backgroundColor: 'var(--bg-card)' }}>
                    <RefreshCw size={14} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Connecting to local server…</span>
                  </div>
                ) : (
                  <EditorView
                    specs={availableSpecs}
                    onReloadSpecs={fetchSpecs}
                    onRunSpec={runSingleSpec}
                  />
                )}
              </div>
            )}

            {/* Metric cards */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-8">
              {([
                { label: 'Total',     value: counts.total,            color: '#6366f1', accent: '#6366f1', icon: <Hash size={13} /> },
                { label: 'Passed',    value: counts.passed,           color: '#059669', accent: '#10b981', icon: <CheckCircle2 size={13} /> },
                { label: 'Failed',    value: counts.failed,           color: '#ef4444', accent: '#ef4444', icon: <XCircle size={13} /> },
                { label: 'Skipped',   value: counts.skipped,          color: '#d97706', accent: '#fbbf24', icon: <MinusCircle size={13} /> },
                { label: 'Pass Rate', value: `${passRate}%`,          color: passRate >= 80 ? '#059669' : '#ef4444', accent: passRate >= 80 ? '#10b981' : '#ef4444', icon: <TrendingUp size={13} /> },
                { label: 'Duration',  value: formatMs(totalDuration), color: '#8b5cf6', accent: '#8b5cf6', icon: <Clock size={13} /> },
              ]).map(({ label, value, color, accent, icon }) => (
                <div key={label} className="pt-4 pb-5 px-4 rounded-2xl text-center relative overflow-hidden"
                  style={{ backgroundColor: 'var(--bg-card)', boxShadow: '0 2px 8px -2px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}>
                  {/* Accent top bar */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ backgroundColor: accent }} />
                  <div className="flex justify-center mb-2" style={{ color: accent }}>{icon}</div>
                  <p className="text-2xl font-black leading-none" style={{ color }}>{value}</p>
                  <p className="text-[11px] mt-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="h-2.5 rounded-full overflow-hidden flex gap-px" style={{ backgroundColor: 'var(--border)' }}>
                {counts.passed  > 0 && <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${(counts.passed  / counts.total) * 100}%` }} />}
                {counts.failed  > 0 && <div className="h-full bg-red-500   transition-all duration-700" style={{ width: `${(counts.failed  / counts.total) * 100}%` }} />}
                {counts.skipped > 0 && <div className="h-full bg-amber-400 transition-all duration-700" style={{ width: `${(counts.skipped / counts.total) * 100}%` }} />}
                {counts.pending > 0 && <div className="h-full bg-neutral-300 transition-all duration-700" style={{ width: `${(counts.pending / counts.total) * 100}%` }} />}
              </div>
              {counts.total > 0 && (
                <div className="flex justify-between mt-1.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  <span className="text-emerald-600 font-semibold">{counts.passed} passed</span>
                  {counts.failed > 0  && <span className="text-red-500 font-semibold">{counts.failed} failed</span>}
                  {counts.skipped > 0 && <span className="text-amber-500">{counts.skipped} skipped</span>}
                  <span className="font-semibold" style={{ color: passRate >= 80 ? '#059669' : '#ef4444' }}>{passRate}%</span>
                </div>
              )}
            </div>

            {/* History chart — real run records only */}
            <HistoryChart
              runs={runHistory}
              selectedId={selectedRunId}
              onSelect={id => fetchResults(id)}
            />

            {/* Runs panel */}
            <RunsPanel
              runs={runHistory}
              selectedId={selectedRunId}
              onSelect={id => fetchResults(id)}
              onLoadLatest={() => fetchResults()}
              onClearHistory={clearHistory}
              isDemo={false}
            />

            {/* Search + Filter + Mode toggle */}
            <div className="flex items-center gap-3 mb-8 flex-wrap">
              <div className="relative flex-1 min-w-44">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search tests…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                  style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', boxShadow: '0 1px 4px -1px rgba(0,0,0,0.06)' }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity">
                    <X size={12} style={{ color: 'var(--text-muted)' }} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {([
                  { key: 'active' as const,  label: `Active (${counts.passed + counts.failed})`, activeColor: '#2563eb', activeBg: '#2563eb' },
                  { key: 'all' as const,     label: `All (${counts.total})`,                     activeColor: '#6366f1', activeBg: '#6366f1' },
                  { key: 'passed' as const,  label: `Passed (${counts.passed})`,                 activeColor: '#059669', activeBg: '#10b981' },
                  { key: 'failed' as const,  label: `Failed (${counts.failed})`,                 activeColor: '#dc2626', activeBg: '#ef4444' },
                  { key: 'skipped' as const, label: `Skipped (${counts.skipped})`,               activeColor: '#d97706', activeBg: '#fbbf24' },
                ]).map(({ key, label, activeBg }) => (
                  <button key={key} onClick={() => setActiveTab(key)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150"
                    style={activeTab === key
                      ? { background: activeBg, color: '#fff' }
                      : { color: 'var(--text-muted)' }
                    }>
                    {label}
                  </button>
                ))}
              </div>

              {/* List / Matrix toggle */}
              <div className="flex items-center gap-0.5 p-0.5 rounded-lg border ml-auto"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                {([
                  { mode: 'list'   as const, icon: <List size={12} />,    label: 'List' },
                  { mode: 'matrix' as const, icon: <Grid3x3 size={12} />, label: 'Matrix' },
                ]).map(({ mode, icon, label }) => (
                  <button key={mode} onClick={() => setDashboardMode(mode)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all"
                    style={dashboardMode === mode
                      ? { backgroundColor: 'var(--bg-body)', color: '#2563eb', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }
                      : { color: 'var(--text-muted)' }
                    }>
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Matrix view */}
            {dashboardMode === 'matrix' && <BrowserMatrixView suites={filteredSuites} />}

            {/* List view — Test suite accordion */}
            {dashboardMode === 'list' && <div className="flex flex-col gap-3">
              {filteredSuites.map(suite => {
                const passed        = suite.tests.filter(t => t.status === 'passed').length
                const status        = suiteStatus(suite)
                const isOpen        = expandedSuites[suite.id]
                const suiteDuration = suite.tests.reduce((a, t) => a + t.duration, 0)
                const maxDuration   = Math.max(...suite.tests.map(t => t.duration), 1)
                const statusAccent  = status === 'passed' ? '#10b981' : status === 'failed' ? '#ef4444' : status === 'running' ? '#3b82f6' : status === 'skipped' ? '#fbbf24' : 'var(--border)'

                return (
                  <div key={suite.id} className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: 'var(--bg-card)', borderLeft: `3px solid ${statusAccent}`, boxShadow: '0 2px 8px -2px rgba(0,0,0,0.06)' }}>
                    <button
                      onClick={() => toggleSuite(suite.id)}
                      className="w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors"
                      style={{ backgroundColor: 'var(--bg-card)' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-body)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}>
                      <StatusIcon status={status} size={16} />
                      <span className="flex-1 min-w-0">
                        <span className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>{suite.title}</span>
                        <span className="ml-2 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{suite.file}</span>
                      </span>
                      {suiteDuration > 0 && <span className="text-xs font-mono shrink-0 hidden sm:inline" style={{ color: 'var(--text-muted)' }}>{formatMs(suiteDuration)}</span>}
                      {/* Mini pass rate pill */}
                      <span className="text-[10px] shrink-0 font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: passed === suite.tests.length ? 'rgba(16,185,129,0.1)' : passed === 0 ? 'rgba(239,68,68,0.1)' : 'rgba(251,191,36,0.1)',
                          color: passed === suite.tests.length ? '#059669' : passed === 0 ? '#dc2626' : '#d97706',
                        }}>
                        {passed}/{suite.tests.length}
                      </span>
                      {isOpen ? <ChevronUp size={15} style={{ color: 'var(--text-muted)' }} className="shrink-0" /> : <ChevronDown size={15} style={{ color: 'var(--text-muted)' }} className="shrink-0" />}
                    </button>

                    {isOpen && (
                      <div className="border-t" style={{ borderColor: 'var(--border)' }}>
                        {suite.tests.map((test, i) => {
                          const isFailed    = test.status === 'failed'
                          const isFlaky     = (test.retries ?? 0) > 0 && test.status === 'passed'
                          const showActions = isFailed && (hoveredTest === test.id || expandedErrors[test.id])
                          const errorOpen   = expandedErrors[test.id]
                          const errType     = isFailed && test.error ? parseErrorType(test.error) : null
                          const errStyle    = errType ? ERROR_TYPE_STYLES[errType] : null
                          return (
                            <div key={test.id} className={i > 0 ? 'border-t' : ''} style={{ borderColor: 'var(--border)' }}>
                              <div
                                className={`flex items-center gap-3 px-6 py-3 transition-colors ${isFailed ? 'cursor-pointer' : ''}`}
                                style={{ backgroundColor: isFailed && hoveredTest === test.id ? 'rgba(239,68,68,0.05)' : undefined }}
                                onMouseEnter={() => isFailed && setHoveredTest(test.id)}
                                onMouseLeave={() => setHoveredTest(null)}
                                onClick={() => isFailed && toggleError(test.id)}
                              >
                                <StatusIcon status={test.status} />
                                <span className="flex-1 min-w-0">
                                  <span className="text-xs block truncate" style={{ color: 'var(--text-main)' }}>{test.title}</span>
                                  {/* Tags */}
                                  {(test.tags ?? []).length > 0 && (
                                    <span className="flex items-center gap-1 mt-0.5 flex-wrap">
                                      {(test.tags ?? []).map(tag => (
                                        <span key={tag} className="inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-px rounded border"
                                          style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                                          <Tag size={8} />{tag}
                                        </span>
                                      ))}
                                    </span>
                                  )}
                                </span>
                                {/* Error type badge */}
                                {errType && errStyle && (
                                  <span className="text-[10px] font-bold px-1.5 py-px rounded shrink-0"
                                    style={{ background: errStyle.bg, color: errStyle.color, border: `1px solid ${errStyle.border}` }}>
                                    {errType}
                                  </span>
                                )}
                                {/* Flaky badge */}
                                {isFlaky && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-px rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                                    <AlertTriangle size={9} /> FLAKY
                                  </span>
                                )}
                                {/* Retry badge (for still-failed tests) */}
                                {!isFlaky && (test.retries ?? 0) > 0 && (
                                  <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
                                    <AlertTriangle size={10} /> {test.retries} retry
                                  </span>
                                )}
                                {test.duration > 0 && (
                                  <div className="w-14 h-1 rounded-full overflow-hidden shrink-0 hidden sm:block" style={{ backgroundColor: 'var(--border)' }}>
                                    <div className="h-full rounded-full transition-all duration-300"
                                      style={{ width: `${(test.duration / maxDuration) * 100}%`, backgroundColor: test.status === 'failed' ? '#ef4444' : test.status === 'passed' ? '#10b981' : '#fbbf24' }} />
                                  </div>
                                )}
                                <span className="text-xs font-mono shrink-0" style={{ color: 'var(--text-muted)' }}>{formatMs(test.duration)}</span>
                                {/* Browser status dots — only visible when multiple browsers ran */}
                                {test.browserResults && test.browserResults.length > 1 && (
                                  <span className="flex items-center gap-0.5 shrink-0" title={test.browserResults.map(r => `${r.browser}: ${r.status}`).join(' · ')}>
                                    {test.browserResults.map(r => (
                                      <span key={r.browser}
                                        style={{
                                          width: 7, height: 7, borderRadius: '50%', display: 'inline-block',
                                          backgroundColor: r.status === 'passed' ? '#10b981' : r.status === 'failed' ? '#ef4444' : '#fbbf24',
                                          opacity: r.status === 'skipped' ? 0.6 : 1,
                                        }}
                                      />
                                    ))}
                                  </span>
                                )}
                                <StatusBadge status={test.status} />
                                {isFailed && (errorOpen ? <ChevronUp size={13} style={{ color: 'var(--text-muted)' }} className="shrink-0" /> : <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} className="shrink-0" />)}
                              </div>
                              {showActions && <FailedActions test={test} suiteFile={suite.file} onViewArtifacts={setArtifactModal} />}
                              {isFailed && errorOpen && test.steps && test.steps.length > 0 && (
                                <StepTimeline steps={test.steps} />
                              )}
                              {isFailed && errorOpen && (
                                <div className="mx-4 mb-3 p-3 rounded-xl text-[11px] font-mono leading-relaxed whitespace-pre-wrap border-l-2 border-red-400"
                                  style={{ backgroundColor: 'rgba(239,68,68,0.06)', color: '#dc2626' }}>
                                  {test.error}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}

              {filteredSuites.length === 0 && (
                <div className="text-center py-16 rounded-2xl"
                  style={{ backgroundColor: 'var(--bg-card)',
                    background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.04) 0%, transparent 70%)',
                    boxShadow: '0 2px 8px -2px rgba(0,0,0,0.06)' }}>
                  {suites.length === 0 ? (
                    <>
                      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                        style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
                        <Play size={24} style={{ color: '#3b82f6', opacity: 0.6 }} />
                      </div>
                      <p className="text-sm font-semibold mb-1.5" style={{ color: 'var(--text-main)' }}>No test results yet</p>
                      <p className="text-xs max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>
                        {serverOnline === false
                          ? 'Server is offline — start it with: npm run dev'
                          : 'Click Run Tests to execute your Playwright specs.'}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                        style={{ background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.15)' }}>
                        <Search size={22} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                      </div>
                      <p className="text-sm font-semibold mb-1.5" style={{ color: 'var(--text-main)' }}>
                        {searchQuery ? `No tests match "${searchQuery}"` : 'No tests match this filter'}
                      </p>
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')}
                          className="mt-1 text-xs font-semibold px-3 py-1.5 rounded-full"
                          style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                          Clear search
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>}

            {/* Slowest tests */}
            {slowestTests.length > 0 && !searchQuery && (
              <div className="mt-4 rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', boxShadow: '0 2px 8px -2px rgba(0,0,0,0.06)' }}>
                <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}>
                  <Clock size={13} style={{ color: '#f59e0b' }} />
                  <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Slowest Tests</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>top 3</span>
                </div>
                <div>
                  {slowestTests.map((test, i) => (
                    <div key={test.id} className={`flex items-center gap-3 px-4 py-2.5 ${i > 0 ? 'border-t' : ''}`} style={{ borderColor: 'var(--border)' }}>
                      <span className="text-xs font-bold w-5 shrink-0 text-center" style={{ color: 'var(--text-muted)' }}>#{i + 1}</span>
                      <StatusIcon status={test.status} size={13} />
                      <span className="flex-1 text-xs truncate" style={{ color: 'var(--text-main)' }}>{test.title}</span>
                      <div className="flex-1 h-2 rounded-full overflow-hidden shrink-0 hidden sm:block max-w-[160px]" style={{ backgroundColor: 'var(--border)' }}>
                        <div className="h-full rounded-full bg-amber-400 transition-all duration-500"
                          style={{ width: `${(test.duration / slowestTests[0].duration) * 100}%`,
                            background: 'linear-gradient(90deg, #fbbf24, #f59e0b)' }} />
                      </div>
                      <span className="text-xs font-mono font-bold shrink-0" style={{ color: '#d97706' }}>{formatMs(test.duration)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Run log terminal */}
            {showLog && runLog.length > 0 && (
              <div className="mt-4 rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 8px -2px rgba(0,0,0,0.06)' }}>
                <div className="flex items-center justify-between px-4 py-2.5 border-b"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}>
                  <div className="flex items-center gap-2">
                    <Terminal size={13} style={{ color: '#10b981' }} />
                    <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Run Output</span>
                    {running && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                    <span className="text-[10px]" style={{ color: '#6c7086' }}>{runLog.length} lines</span>
                  </div>
                  <button onClick={() => setShowLog(false)} className="hover:opacity-70 transition-opacity">
                    <X size={13} style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
                <div className="overflow-auto font-mono text-[10.5px] leading-relaxed px-4 py-3"
                  style={{ backgroundColor: '#1e1e2e', maxHeight: '280px' }}>
                  {runLog.map((line, i) => {
                    const color =
                      /✓|passed|\[PASS\]/i.test(line) ? '#a6e3a1' :
                      /✗|failed|\[FAIL\]|\[ERROR\]/i.test(line) ? '#f38ba8' :
                      /\[FILTER\]|\[INFO\]/i.test(line) ? '#89b4fa' :
                      /\[TIMEOUT\]|\[OFFLINE\]/i.test(line) ? '#fab387' :
                      /skipped|pending/i.test(line) ? '#f9e2af' :
                      '#cdd6f4'
                    return (
                      <div key={i} style={{ color, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{line}</div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Flaky test panel */}
            <FlakyPanel suites={suites} />
          </>
        )}

        {/* ── Docs view ────────────────────────────────────────────────────────── */}
        {activeView === 'docs' && <DocsView />}

      </div>

      {artifactModal && <ArtifactModal state={artifactModal} onClose={() => setArtifactModal(null)} />}
      </div>
    </div>
  )
}
