import React, { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Play, Square, RotateCcw, Download, Bug, Eye, Camera,
  ChevronDown, ChevronUp, CheckCircle2, XCircle, MinusCircle,
  Circle, AlertTriangle, X, Settings, LayoutDashboard,
  Globe, Monitor, Film, FileText, Code2, Copy, Check,
  Search, Clock, TrendingUp, Zap, Smartphone, FolderOpen, Save,
  BookOpen, Terminal, MousePointer2, FlaskConical, Layers,
  ExternalLink, ChevronRight, Hash, Grid3x3, List, Tag,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type Status       = 'passed' | 'failed' | 'skipped' | 'pending' | 'running'
type FilterKey    = 'all' | 'passed' | 'failed' | 'skipped'
type ViewKey      = 'dashboard' | 'settings' | 'docs'
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

interface RunHistory {
  label: string
  passed: number
  failed: number
  skipped: number
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
}

const STORAGE_KEY = 'pw_dashboard_config_v1'
const API_BASE    = 'http://localhost:3001'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_SUITES: TestSuite[] = [
  {
    id: 'login',
    file: 'tests/login.spec.ts',
    title: 'Login flow',
    tests: [
      {
        id: 'l1', title: 'successful login redirects to dashboard', status: 'passed', duration: 1240, browser: 'chromium',
        tags: ['@smoke'],
        browserResults: [
          { browser: 'chromium', status: 'passed', duration: 1240 },
          { browser: 'firefox',  status: 'passed', duration: 1480 },
          { browser: 'webkit',   status: 'passed', duration: 1190 },
        ],
        steps: [
          { title: 'page.goto("/login")',                    duration: 340, status: 'passed' },
          { title: 'getByLabel("Email").fill(…)',            duration: 85,  status: 'passed' },
          { title: 'getByLabel("Password").fill(…)',         duration: 70,  status: 'passed' },
          { title: 'getByRole("button", {name:"Sign In"}).click()', duration: 210, status: 'passed' },
          { title: 'expect(page).toHaveURL("/dashboard")',   duration: 535, status: 'passed' },
        ],
      },
      {
        id: 'l2', title: 'wrong password shows error message', status: 'passed', duration: 890, browser: 'chromium',
        tags: ['@smoke'],
        browserResults: [
          { browser: 'chromium', status: 'passed', duration: 890 },
          { browser: 'firefox',  status: 'passed', duration: 970 },
          { browser: 'webkit',   status: 'passed', duration: 850 },
        ],
      },
      {
        id: 'l3', title: 'empty fields show validation errors', status: 'failed', duration: 2100, browser: 'chromium', retries: 1,
        tags: ['@regression'],
        error: "Error: Timeout 5000ms exceeded.\nExpected element to be visible: getByTestId('email-error')\nReceived: hidden\n  at tests/login.spec.ts:42:18",
        browserResults: [
          { browser: 'chromium', status: 'failed', duration: 2100 },
          { browser: 'firefox',  status: 'failed', duration: 2340 },
          { browser: 'webkit',   status: 'passed', duration: 810 },
        ],
        steps: [
          { title: 'page.goto("/login")',                         duration: 290, status: 'passed' },
          { title: 'getByRole("button", {name:"Sign In"}).click()', duration: 105, status: 'passed' },
          { title: 'expect(getByTestId("email-error")).toBeVisible()', duration: 5005, status: 'failed' },
        ],
      },
      {
        id: 'l4', title: 'remember me checkbox persists session', status: 'passed', duration: 1560, browser: 'chromium',
        retries: 1,   // flaky — eventually passed
        tags: ['@regression'],
        browserResults: [
          { browser: 'chromium', status: 'passed', duration: 1560 },
          { browser: 'firefox',  status: 'passed', duration: 1740 },
          { browser: 'webkit',   status: 'skipped', duration: 0 },
        ],
      },
      {
        id: 'l5', title: 'logout clears session and redirects', status: 'passed', duration: 730, browser: 'chromium',
        tags: ['@smoke'],
        browserResults: [
          { browser: 'chromium', status: 'passed', duration: 730 },
          { browser: 'firefox',  status: 'passed', duration: 820 },
          { browser: 'webkit',   status: 'passed', duration: 700 },
        ],
      },
    ],
  },
  {
    id: 'nav',
    file: 'tests/navigation.spec.ts',
    title: 'Navigation',
    tests: [
      {
        id: 'n1', title: 'clicking logo navigates to home', status: 'passed', duration: 410, browser: 'chromium',
        tags: ['@smoke'],
        browserResults: [
          { browser: 'chromium', status: 'passed', duration: 410 },
          { browser: 'firefox',  status: 'passed', duration: 490 },
          { browser: 'webkit',   status: 'passed', duration: 380 },
        ],
      },
      {
        id: 'n2', title: 'all nav links are reachable', status: 'passed', duration: 1820, browser: 'chromium',
        retries: 1,   // flaky — passed on retry
        tags: ['@regression'],
        browserResults: [
          { browser: 'chromium', status: 'passed', duration: 1820 },
          { browser: 'firefox',  status: 'passed', duration: 2010 },
          { browser: 'webkit',   status: 'passed', duration: 1750 },
        ],
      },
      {
        id: 'n3', title: 'browser back / forward works correctly', status: 'passed', duration: 590, browser: 'chromium',
        browserResults: [
          { browser: 'chromium', status: 'passed', duration: 590 },
          { browser: 'firefox',  status: 'passed', duration: 640 },
          { browser: 'webkit',   status: 'passed', duration: 560 },
        ],
      },
      {
        id: 'n4', title: 'deep link to /agents renders agents page', status: 'skipped', duration: 0, browser: 'chromium',
        browserResults: [
          { browser: 'chromium', status: 'skipped', duration: 0 },
          { browser: 'firefox',  status: 'skipped', duration: 0 },
          { browser: 'webkit',   status: 'skipped', duration: 0 },
        ],
      },
    ],
  },
  {
    id: 'forms',
    file: 'tests/forms.spec.ts',
    title: 'Form validation',
    tests: [
      {
        id: 'f1', title: 'required fields marked on empty submit', status: 'passed', duration: 980, browser: 'chromium',
        tags: ['@smoke'],
        browserResults: [
          { browser: 'chromium', status: 'passed', duration: 980 },
          { browser: 'firefox',  status: 'passed', duration: 1050 },
          { browser: 'webkit',   status: 'passed', duration: 920 },
        ],
      },
      {
        id: 'f2', title: 'email format validated inline', status: 'passed', duration: 760, browser: 'chromium',
        browserResults: [
          { browser: 'chromium', status: 'passed', duration: 760 },
          { browser: 'firefox',  status: 'passed', duration: 800 },
          { browser: 'webkit',   status: 'passed', duration: 730 },
        ],
      },
      {
        id: 'f3', title: 'max-length enforced on text inputs', status: 'failed', duration: 1350, browser: 'firefox',
        tags: ['@regression'],
        error: "Error: expect(received).toHaveValue(expected)\nExpected: 'a'.repeat(255)\nReceived: 'a'.repeat(256)\n  at tests/forms.spec.ts:88:5",
        browserResults: [
          { browser: 'chromium', status: 'passed', duration: 890 },
          { browser: 'firefox',  status: 'failed', duration: 1350 },  // ← Firefox-only bug!
          { browser: 'webkit',   status: 'passed', duration: 870 },
        ],
        steps: [
          { title: 'page.goto("/signup")',                           duration: 310, status: 'passed' },
          { title: 'getByLabel("Username").fill("a".repeat(300))',   duration: 195, status: 'passed' },
          { title: 'expect(input).toHaveValue("a".repeat(255))',     duration: 845, status: 'failed' },
        ],
      },
      {
        id: 'f4', title: 'form submits with valid data', status: 'passed', duration: 1140, browser: 'chromium',
        tags: ['@smoke'],
        browserResults: [
          { browser: 'chromium', status: 'passed', duration: 1140 },
          { browser: 'firefox',  status: 'passed', duration: 1230 },
          { browser: 'webkit',   status: 'passed', duration: 1090 },
        ],
      },
    ],
  },
  {
    id: 'api',
    file: 'tests/api.spec.ts',
    title: 'API endpoints',
    tests: [
      { id: 'a1', title: 'GET /api/agents returns 200 with array',  status: 'passed', duration: 210,  browser: 'chromium', tags: ['@smoke'] },
      { id: 'a2', title: 'POST /api/run/:id executes agent',         status: 'passed', duration: 3400, browser: 'chromium', retries: 1, tags: ['@regression'] },
      { id: 'a3', title: 'GET /api/health returns ok status',        status: 'passed', duration: 95,   browser: 'chromium', tags: ['@smoke'] },
      { id: 'a4', title: 'unknown route returns 404',                status: 'passed', duration: 130,  browser: 'chromium' },
    ],
  },
  {
    id: 'a11y',
    file: 'tests/accessibility.spec.ts',
    title: 'Accessibility (axe-core)',
    tests: [
      {
        id: 'ax1', title: 'home page has no critical WCAG violations', status: 'passed', duration: 2200, browser: 'chromium',
        tags: ['@a11y'],
        browserResults: [
          { browser: 'chromium', status: 'passed', duration: 2200 },
          { browser: 'firefox',  status: 'passed', duration: 2450 },
          { browser: 'webkit',   status: 'passed', duration: 2100 },
        ],
      },
      {
        id: 'ax2', title: 'agents page passes WCAG AA', status: 'passed', duration: 1980, browser: 'chromium',
        tags: ['@a11y'],
        browserResults: [
          { browser: 'chromium', status: 'passed', duration: 1980 },
          { browser: 'firefox',  status: 'passed', duration: 2180 },
          { browser: 'webkit',   status: 'passed', duration: 1900 },
        ],
      },
      { id: 'ax3', title: 'modal dialogs trap focus correctly', status: 'skipped', duration: 0, browser: 'chromium', tags: ['@a11y'] },
    ],
  },
]

// ─── Run History ──────────────────────────────────────────────────────────────

const MOCK_HISTORY: RunHistory[] = [
  { label: 'May 14', passed: 17, failed: 4, skipped: 1 },
  { label: 'May 15', passed: 18, failed: 3, skipped: 1 },
  { label: 'May 16', passed: 19, failed: 2, skipped: 1 },
  { label: 'May 17', passed: 20, failed: 1, skipped: 1 },
  { label: 'May 18', passed: 18, failed: 3, skipped: 1 },
  { label: 'May 19', passed: 19, failed: 2, skipped: 1 },
  { label: 'May 20', passed: 16, failed: 2, skipped: 2 },
]

const CHART_H = 56

function HistoryChart({ history }: { history: RunHistory[] }) {
  const maxTotal = Math.max(...history.map(h => h.passed + h.failed + h.skipped), 1)

  return (
    <div className="rounded-2xl border shadow-sm overflow-hidden mb-5"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}>
        <div className="flex items-center gap-2">
          <TrendingUp size={13} style={{ color: '#3b82f6' }} />
          <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Run History</span>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>· last 7 runs</span>
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
        <div className="flex gap-1.5" style={{ height: CHART_H + 20 }}>
          {history.map((run, i) => {
            const passH  = Math.round((run.passed  / maxTotal) * CHART_H)
            const failH  = Math.round((run.failed  / maxTotal) * CHART_H)
            const skipH  = Math.round((run.skipped / maxTotal) * CHART_H)
            const isLast = i === history.length - 1
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{ flex: 1, width: '100%', position: 'relative' }}>
                  {passH > 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: passH, backgroundColor: isLast ? '#10b981' : '#6ee7b7', borderRadius: failH === 0 && skipH === 0 ? '3px 3px 0 0' : '0' }} />}
                  {failH > 0 && <div style={{ position: 'absolute', bottom: passH, left: 0, right: 0, height: failH, backgroundColor: isLast ? '#ef4444' : '#fca5a5', borderRadius: skipH === 0 ? '3px 3px 0 0' : '0' }} />}
                  {skipH > 0 && <div style={{ position: 'absolute', bottom: passH + failH, left: 0, right: 0, height: skipH, backgroundColor: isLast ? '#fbbf24' : '#fde68a', borderRadius: '3px 3px 0 0' }} />}
                </div>
                <span style={{ fontSize: 9, color: '#94a3b8', flexShrink: 0, lineHeight: 1, fontWeight: isLast ? 700 : 400 }}>{run.label}</span>
              </div>
            )
          })}
        </div>
      </div>
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
  const base = 'text-[11px] font-semibold px-2 py-0.5 rounded-full'
  if (status === 'passed')  return <span className={`${base} bg-emerald-50 text-emerald-700`}>passed</span>
  if (status === 'failed')  return <span className={`${base} bg-red-50 text-red-600`}>failed</span>
  if (status === 'skipped') return <span className={`${base} bg-amber-50 text-amber-600`}>skipped</span>
  if (status === 'running') return <span className={`${base} bg-blue-50 text-blue-600`}>running…</span>
  return <span className={`${base} bg-neutral-100 text-neutral-400`}>pending</span>
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

function TextInput({ value, onChange, mono = true, width = 'w-48' }: {
  value: string; onChange: (v: string) => void; mono?: boolean; width?: string
}) {
  return (
    <input
      type="text"
      value={value}
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
}

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
    label: 'Cross-Browser',
    icon: <Globe size={13} />,
    description: 'Chromium + Firefox + WebKit, 4 parallel workers',
    color: '#7c3aed',
    config: {
      browsers: { chromium: true, firefox: true, webkit: true },
      workers: 4, retries: 1, fullyParallel: true, reporter: 'html',
    },
  },
  {
    label: 'Mobile',
    icon: <Smartphone size={13} />,
    description: 'WebKit + Chromium for iOS & Android coverage',
    color: '#d97706',
    config: {
      browsers: { chromium: true, firefox: false, webkit: true },
      workers: 2, retries: 1, headed: false, reporter: 'html',
    },
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

function SettingsView({ config, onChange }: { config: PlaywrightConfig; onChange: (c: PlaywrightConfig) => void }) {
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
      <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 px-4 py-2.5 border-b"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}>
          <Zap size={13} style={{ color: '#8b5cf6' }} />
          <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Quick Presets</span>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>— one click to apply a battle-tested configuration</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
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

function BrowserChip({ browser, status, duration }: { browser: BrowserKey; status: Status; duration: number }) {
  const meta = BROWSER_META[browser]
  const color =
    status === 'passed'  ? '#10b981' :
    status === 'failed'  ? '#ef4444' :
    status === 'skipped' ? '#f59e0b' : 'var(--text-muted)'

  return (
    <div className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg border min-w-[60px]"
      style={{ borderColor: `${color}40`, backgroundColor: `${color}10` }}>
      <span className="text-[11px]">{meta.emoji}</span>
      <StatusIcon status={status} size={12} />
      {duration > 0 && <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>{formatMs(duration)}</span>}
    </div>
  )
}

// ─── Browser Matrix View ──────────────────────────────────────────────────────

function BrowserMatrixView({ suites }: { suites: TestSuite[] }) {
  const allTests = suites.flatMap(s => s.tests.map(t => ({ ...t, suiteTitle: s.title })))
  const testsWithCross = allTests.filter(t => t.browserResults && t.browserResults.length > 0)
  const browsers: BrowserKey[] = ['chromium', 'firefox', 'webkit']

  if (testsWithCross.length === 0) {
    return (
      <div className="text-center py-16 rounded-2xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No cross-browser data — add <code className="font-mono text-xs">browserResults</code> to your tests.</p>
      </div>
    )
  }

  function cellStatus(test: typeof testsWithCross[number], browser: BrowserKey): Status | null {
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

function ArtifactModal({ state, onClose }: { state: ArtifactModalState; onClose: () => void }) {
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
        <div className="flex flex-col gap-2">
          {[
            { label: 'screenshot-on-failure.png', size: '142 KB', type: 'PNG' },
            { label: 'video-recording.webm',      size: '1.8 MB', type: 'WEBM' },
            { label: 'trace.zip',                 size: '284 KB', type: 'ZIP' },
          ].map(({ label, size, type }) => (
            <div
              key={label}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs cursor-pointer hover:opacity-80 transition-opacity"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}
              onClick={() => alert(`[MOCK] Downloading ${label}`)}
            >
              <span className="font-mono" style={{ color: 'var(--text-main)' }}>{label}</span>
              <div className="flex items-center gap-2">
                <span style={{ color: 'var(--text-muted)' }}>{size}</span>
                <span className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 font-semibold text-[10px]">{type}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] mt-4 text-center" style={{ color: 'var(--text-muted)' }}>
          Artifacts are simulated — connect Playwright CI to serve real files.
        </p>
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
  const exportJira = () => {
    const payload = {
      summary: `[QA] Test failure: ${test.title}`,
      description: `**File:** \`${suiteFile}\`\n**Error:**\n\`\`\`\n${test.error}\n\`\`\``,
      labels: ['automated-test', 'playwright'],
      priority: 'High',
    }
    console.log('[Jira Export Payload]', payload)
    alert(`[MOCK] Jira issue payload logged to console.\n\nSummary: ${payload.summary}`)
  }

  const viewTrace = () => {
    alert(`[MOCK] Opening Playwright Trace Viewer for:\n${suiteFile}\n\nIn production:\nnpx playwright show-trace trace.zip`)
  }

  return (
    <div className="flex items-center gap-1.5 px-5 py-2 border-t"
      style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(239,68,68,0.04)' }}>
      <span className="text-[11px] font-medium mr-1" style={{ color: 'var(--text-muted)' }}>Actions:</span>
      <button onClick={exportJira} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-100">
        <Bug size={11} /> Export to Jira
      </button>
      <button onClick={viewTrace} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors border border-violet-100">
        <Eye size={11} /> View Trace
      </button>
      <button onClick={() => onViewArtifacts({ testId: test.id, testTitle: test.title })} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-neutral-50 text-neutral-600 hover:bg-neutral-100 transition-colors border border-neutral-200">
        <Camera size={11} /> View Artifacts
      </button>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PlaywrightDashboard() {
  const [suites, setSuites]               = useState<TestSuite[]>(INITIAL_SUITES)
  const [running, setRunning]             = useState(false)
  const [activeTab, setActiveTab]         = useState<FilterKey>('all')
  const [activeView, setActiveView]       = useState<ViewKey>('dashboard')
  const [config, setConfig]               = useState<PlaywrightConfig>(DEFAULT_CONFIG)
  const [savedConfig, setSavedConfig]     = useState<PlaywrightConfig | null>(null)
  const [lastSavedAt, setLastSavedAt]     = useState<string | null>(null)
  const [justSaved, setJustSaved]         = useState(false)
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>('list')
  const [searchQuery, setSearchQuery]     = useState('')
  const [expandedSuites, setExpandedSuites] = useState<Record<string, boolean>>({ login: true })
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
  const [availableSpecs, setAvailableSpecs] = useState<string[]>([])
  const [selectedSpec, setSelectedSpec]     = useState<string>('')

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

  // ── Fetch results from server ───────────────────────────────────────────────
  const fetchResults = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/playwright/results`)
      if (res.status === 404) {
        // Server online but no results yet
        setServerOnline(true)
        setDemoMode(true)
        return
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as { suites: TestSuite[]; runAt: string }
      setSuites(data.suites)
      setDemoMode(false)
      setServerOnline(true)
      setLastRunAt(data.runAt ?? null)
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

  // ── Fetch on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchResults()
    fetchSpecs()
  }, [fetchResults, fetchSpecs])

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
          const matchesTab    = activeTab === 'all' || t.status === activeTab
          const matchesSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase())
          return matchesTab && matchesSearch
        }),
      }))
      .filter(s => s.tests.length > 0),
    [suites, activeTab, searchQuery]
  )

  // ── Run tests (real SSE when server online, demo animation otherwise) ───────
  const runTests = useCallback(async () => {
    setRunning(true)
    setShowLog(true)
    setRunLog([])
    setExpandedErrors({})
    setSearchQuery('')

    // Optimistically mark everything pending
    setSuites(prev => prev.map(s => ({ ...s, tests: s.tests.map(t => ({ ...t, status: 'pending' as Status, duration: 0 })) })))
    setExpandedSuites(prev => Object.fromEntries(Object.keys(prev).map(k => [k, true])))

    if (serverOnline) {
      // ── Real run via server SSE ─────────────────────────────────────────────
      try {
        const response = await fetch(`${API_BASE}/api/playwright/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ spec: selectedSpec || undefined }),
        })
        if (!response.ok || !response.body) throw new Error(`Server ${response.status}`)

        const reader  = response.body.getReader()
        const decoder = new TextDecoder()
        let   buffer  = ''

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
        // Refresh results after run completes
        await fetchResults()
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err)
        setRunLog(prev => [...prev, `[ERROR] ${errMsg}`])
      }
    } else {
      // ── Demo animation ──────────────────────────────────────────────────────
      setRunLog(['[DEMO] Server offline — running demo animation'])
      setSuites(INITIAL_SUITES.map(s => ({ ...s, tests: s.tests.map(t => ({ ...t, status: 'pending' as Status, duration: 0 })) })))
      setExpandedSuites(Object.fromEntries(INITIAL_SUITES.map(s => [s.id, true])))
      const flat = INITIAL_SUITES.flatMap(s => s.tests.map(t => ({ suiteId: s.id, test: t })))
      for (const { suiteId, test } of flat) {
        setSuites(prev => prev.map(s => s.id !== suiteId ? s : { ...s, tests: s.tests.map(t => t.id !== test.id ? t : { ...t, status: 'running' }) }))
        await new Promise(r => setTimeout(r, 120 + Math.random() * 220))
        setSuites(prev => prev.map(s => s.id !== suiteId ? s : { ...s, tests: s.tests.map(t => t.id !== test.id ? t : { ...t, status: test.status, duration: test.duration, error: test.error, retries: test.retries }) }))
        setRunLog(prev => [...prev, `  ${test.status === 'passed' ? '✓' : test.status === 'failed' ? '✗' : '–'} ${test.title}`])
      }
      setRunLog(prev => [...prev, '[DONE] Demo run complete'])
    }

    setRunning(false)
  }, [serverOnline, selectedSpec, fetchResults])

  const reset = () => { setSuites(INITIAL_SUITES); setActiveTab('all'); setExpandedErrors({}); setSearchQuery(''); setDemoMode(true); setLastRunAt(null) }

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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-body)' }}>
      <div className="max-w-5xl mx-auto px-4 py-10 animate-fade-up">

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>Playwright Dashboard</h1>
              {serverOnline === true && !demoMode && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>Live</span>
              )}
              {demoMode && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#fefce8', color: '#92400e', border: '1px solid #fde68a' }}>Demo</span>
              )}
            </div>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {suites.length} suites · {counts.total} tests · {formatMs(totalDuration)}
              {lastRunAt && ` · run at ${new Date(lastRunAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              {serverOnline === false && <span className="ml-2 text-amber-500">· server offline</span>}
              {isLoading && <span className="ml-2 text-blue-400">· loading…</span>}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View switcher */}
            <div className="flex items-center gap-0.5 p-1 rounded-xl border"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
              {([
                { key: 'dashboard' as const, label: 'Dashboard', icon: <LayoutDashboard size={12} /> },
                { key: 'settings'  as const, label: 'Settings',  icon: <Settings size={12} /> },
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
                  {key === 'settings' && changedCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-px rounded-full bg-blue-600 text-white leading-none">
                      {changedCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Dashboard actions */}
            {activeView === 'dashboard' && (
              <>
                {/* Spec selector */}
                {availableSpecs.length > 0 && (
                  <select
                    value={selectedSpec}
                    onChange={e => setSelectedSpec(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
                    title="Pick a spec file to run">
                    <option value="">All specs</option>
                    {availableSpecs.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
                <button onClick={exportReport}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors shadow-sm"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-body)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}>
                  <Download size={13} /> Export
                </button>
                <button onClick={fetchResults} disabled={running || isLoading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors shadow-sm disabled:opacity-40"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-body)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
                  title="Reload results from server">
                  <RotateCcw size={13} className={isLoading ? 'animate-spin' : ''} /> Refresh
                </button>
                <button onClick={reset} disabled={running}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors shadow-sm disabled:opacity-40"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-body)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
                  title="Reset to demo data">
                  Demo
                </button>
                <button
                  onClick={running ? () => setRunning(false) : runTests}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all duration-150 active:scale-95 ${running ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                  {running ? <><Square size={14} /> Stop</> : <><Play size={14} /> Run Tests</>}
                </button>
              </>
            )}

            {/* Settings actions */}
            {activeView === 'settings' && (
              <>
                <button onClick={() => setConfig(DEFAULT_CONFIG)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors shadow-sm"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-body)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}>
                  <RotateCcw size={13} /> Reset to defaults
                </button>
                <button
                  onClick={saveConfig}
                  disabled={isSaved}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border shadow-sm transition-all duration-150 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={justSaved
                    ? { backgroundColor: '#10b981', borderColor: '#10b981', color: '#fff' }
                    : isSaved
                      ? { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }
                      : { backgroundColor: '#2563eb', borderColor: '#2563eb', color: '#fff' }
                  }
                >
                  {justSaved
                    ? <><Check size={13} /> Saved!</>
                    : isSaved
                      ? <><Check size={13} /> Saved{lastSavedAt ? ` · ${lastSavedAt}` : ''}</>
                      : <><Save size={13} /> Save</>
                  }
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
                  onClick={fetchResults}
                  className="ml-auto shrink-0 font-semibold underline hover:no-underline"
                  style={{ color: '#92400e' }}>
                  Retry
                </button>
              </div>
            )}

            {/* Metric cards */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
              {([
                { label: 'Total',     value: counts.total,            color: 'var(--text-main)' },
                { label: 'Passed',    value: counts.passed,           color: '#059669' },
                { label: 'Failed',    value: counts.failed,           color: '#ef4444' },
                { label: 'Skipped',   value: counts.skipped,          color: '#d97706' },
                { label: 'Pass Rate', value: `${passRate}%`,          color: passRate >= 80 ? '#059669' : '#ef4444' },
                { label: 'Duration',  value: formatMs(totalDuration), color: 'var(--text-main)' },
              ] as const).map(({ label, value, color }) => (
                <div key={label} className="p-4 rounded-2xl border text-center shadow-sm"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                  <p className="text-2xl font-black leading-none" style={{ color }}>{value}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mb-6 h-1.5 rounded-full overflow-hidden flex" style={{ backgroundColor: 'var(--border)' }}>
              {counts.passed  > 0 && <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${(counts.passed  / counts.total) * 100}%` }} />}
              {counts.failed  > 0 && <div className="h-full bg-red-500   transition-all duration-700" style={{ width: `${(counts.failed  / counts.total) * 100}%` }} />}
              {counts.skipped > 0 && <div className="h-full bg-amber-400 transition-all duration-700" style={{ width: `${(counts.skipped / counts.total) * 100}%` }} />}
              {counts.pending > 0 && <div className="h-full bg-neutral-300 transition-all duration-700" style={{ width: `${(counts.pending / counts.total) * 100}%` }} />}
            </div>

            {/* History chart */}
            <HistoryChart history={MOCK_HISTORY} />

            {/* Search + Filter + Mode toggle */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <div className="relative flex-1 min-w-44">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search tests…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity">
                    <X size={12} style={{ color: 'var(--text-muted)' }} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {([
                  { key: 'all' as const,     label: `All (${counts.total})` },
                  { key: 'passed' as const,  label: `Passed (${counts.passed})` },
                  { key: 'failed' as const,  label: `Failed (${counts.failed})` },
                  { key: 'skipped' as const, label: `Skipped (${counts.skipped})` },
                ]).map(({ key, label }) => (
                  <button key={key} onClick={() => setActiveTab(key)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 border"
                    style={activeTab === key
                      ? { background: '#2563eb', color: '#fff', borderColor: '#2563eb' }
                      : { background: 'var(--bg-card)', color: 'var(--text-muted)', borderColor: 'var(--border)' }
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

                return (
                  <div key={suite.id} className="rounded-2xl border shadow-sm overflow-hidden"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
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
                      <span className="text-xs shrink-0 font-medium" style={{ color: 'var(--text-muted)' }}>{passed}/{suite.tests.length} passed</span>
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
                                className={`flex items-center gap-3 px-5 py-2.5 transition-colors ${isFailed ? 'cursor-pointer' : ''}`}
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
                <div className="text-center py-16 rounded-2xl border shadow-sm"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {searchQuery ? `No tests match "${searchQuery}"` : 'No tests match the current filter.'}
                  </p>
                  {searchQuery && <button onClick={() => setSearchQuery('')} className="mt-2 text-xs text-blue-500 hover:underline">Clear search</button>}
                </div>
              )}
            </div>}

            {/* Slowest tests */}
            {slowestTests.length > 0 && !searchQuery && (
              <div className="mt-4 rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
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
                      <div className="w-24 h-1.5 rounded-full overflow-hidden shrink-0 hidden sm:block" style={{ backgroundColor: 'var(--border)' }}>
                        <div className="h-full rounded-full bg-amber-400" style={{ width: `${(test.duration / slowestTests[0].duration) * 100}%` }} />
                      </div>
                      <span className="text-xs font-mono font-semibold shrink-0" style={{ color: '#d97706' }}>{formatMs(test.duration)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Run log terminal */}
            {showLog && runLog.length > 0 && (
              <div className="mt-4 rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between px-4 py-2.5 border-b"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-body)' }}>
                  <div className="flex items-center gap-2">
                    <Terminal size={13} style={{ color: '#10b981' }} />
                    <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Run Output</span>
                    {running && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                  </div>
                  <button onClick={() => setShowLog(false)} className="hover:opacity-70 transition-opacity">
                    <X size={13} style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
                <pre
                  className="text-[10.5px] font-mono px-4 py-3 overflow-auto leading-relaxed"
                  style={{ backgroundColor: '#1e1e2e', color: '#cdd6f4', margin: 0, maxHeight: '280px' }}>
                  {runLog.join('\n')}
                </pre>
              </div>
            )}

            {/* Flaky test panel */}
            <FlakyPanel suites={suites} />
          </>
        )}

        {/* ── Settings view ────────────────────────────────────────────────────── */}
        {activeView === 'settings' && (
          <SettingsView config={config} onChange={setConfig} />
        )}

        {/* ── Docs view ────────────────────────────────────────────────────────── */}
        {activeView === 'docs' && <DocsView />}

      </div>

      {artifactModal && <ArtifactModal state={artifactModal} onClose={() => setArtifactModal(null)} />}
    </div>
  )
}
