import { useState, useMemo, useCallback } from 'react'
import {
  Play, Square, RotateCcw, Download, Bug, Eye, Camera,
  ChevronDown, ChevronUp, CheckCircle2, XCircle, MinusCircle,
  Circle, AlertTriangle, X,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type Status = 'passed' | 'failed' | 'skipped' | 'pending' | 'running'
type FilterKey = 'all' | 'passed' | 'failed' | 'skipped'

interface TestCase {
  id: string
  title: string
  status: Status
  duration: number
  browser: 'chromium' | 'firefox' | 'webkit'
  error?: string
  retries?: number
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

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_SUITES: TestSuite[] = [
  {
    id: 'login',
    file: 'tests/login.spec.ts',
    title: 'Login flow',
    tests: [
      { id: 'l1', title: 'successful login redirects to dashboard',  status: 'passed', duration: 1240, browser: 'chromium' },
      { id: 'l2', title: 'wrong password shows error message',        status: 'passed', duration: 890,  browser: 'chromium' },
      { id: 'l3', title: 'empty fields show validation errors',       status: 'failed', duration: 2100, browser: 'chromium', retries: 1,
        error: "Error: Timeout 5000ms exceeded.\nExpected element to be visible: getByTestId('email-error')\nReceived: hidden\n  at tests/login.spec.ts:42:18" },
      { id: 'l4', title: 'remember me checkbox persists session',     status: 'passed', duration: 1560, browser: 'chromium' },
      { id: 'l5', title: 'logout clears session and redirects',       status: 'passed', duration: 730,  browser: 'chromium' },
    ],
  },
  {
    id: 'nav',
    file: 'tests/navigation.spec.ts',
    title: 'Navigation',
    tests: [
      { id: 'n1', title: 'clicking logo navigates to home',           status: 'passed', duration: 410,  browser: 'chromium' },
      { id: 'n2', title: 'all nav links are reachable',               status: 'passed', duration: 1820, browser: 'chromium' },
      { id: 'n3', title: 'browser back / forward works correctly',    status: 'passed', duration: 590,  browser: 'chromium' },
      { id: 'n4', title: 'deep link to /agents renders agents page',  status: 'skipped', duration: 0,   browser: 'chromium' },
    ],
  },
  {
    id: 'forms',
    file: 'tests/forms.spec.ts',
    title: 'Form validation',
    tests: [
      { id: 'f1', title: 'required fields marked on empty submit',    status: 'passed', duration: 980,  browser: 'chromium' },
      { id: 'f2', title: 'email format validated inline',             status: 'passed', duration: 760,  browser: 'chromium' },
      { id: 'f3', title: 'max-length enforced on text inputs',        status: 'failed', duration: 1350, browser: 'firefox',
        error: "Error: expect(received).toHaveValue(expected)\nExpected: 'a'.repeat(255)\nReceived: 'a'.repeat(256)\n  at tests/forms.spec.ts:88:5" },
      { id: 'f4', title: 'form submits with valid data',              status: 'passed', duration: 1140, browser: 'chromium' },
    ],
  },
  {
    id: 'api',
    file: 'tests/api.spec.ts',
    title: 'API endpoints',
    tests: [
      { id: 'a1', title: 'GET /api/agents returns 200 with array',    status: 'passed', duration: 210,  browser: 'chromium' },
      { id: 'a2', title: 'POST /api/run/:id executes agent',          status: 'passed', duration: 3400, browser: 'chromium' },
      { id: 'a3', title: 'GET /api/health returns ok status',         status: 'passed', duration: 95,   browser: 'chromium' },
      { id: 'a4', title: 'unknown route returns 404',                 status: 'passed', duration: 130,  browser: 'chromium' },
    ],
  },
  {
    id: 'a11y',
    file: 'tests/accessibility.spec.ts',
    title: 'Accessibility (axe-core)',
    tests: [
      { id: 'ax1', title: 'home page has no critical WCAG violations', status: 'passed', duration: 2200, browser: 'chromium' },
      { id: 'ax2', title: 'agents page passes WCAG AA',                status: 'passed', duration: 1980, browser: 'chromium' },
      { id: 'ax3', title: 'modal dialogs trap focus correctly',        status: 'skipped', duration: 0,   browser: 'chromium' },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMs(ms: number) {
  if (ms === 0) return '—'
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`
}

function StatusIcon({ status, size = 15 }: { status: Status; size?: number }) {
  const s = size
  if (status === 'passed')  return <CheckCircle2  size={s} className="text-emerald-500 shrink-0" />
  if (status === 'failed')  return <XCircle        size={s} className="text-red-500 shrink-0" />
  if (status === 'skipped') return <MinusCircle   size={s} className="text-amber-400 shrink-0" />
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
  test,
  suiteFile,
  onViewArtifacts,
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
    alert(`[MOCK] Opening Playwright Trace Viewer for:\n${suiteFile}\n\nIn production this would open:\nnpx playwright show-trace trace.zip`)
  }

  return (
    <div className="flex items-center gap-1.5 px-5 py-2 border-t" style={{ borderColor: 'var(--border)', backgroundColor: '#fef9f9' }}>
      <span className="text-[11px] font-medium mr-1" style={{ color: 'var(--text-muted)' }}>Actions:</span>
      <button
        onClick={exportJira}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-100"
      >
        <Bug size={11} />
        Export to Jira
      </button>
      <button
        onClick={viewTrace}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors border border-violet-100"
      >
        <Eye size={11} />
        View Trace
      </button>
      <button
        onClick={() => onViewArtifacts({ testId: test.id, testTitle: test.title })}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-neutral-50 text-neutral-600 hover:bg-neutral-100 transition-colors border border-neutral-200"
      >
        <Camera size={11} />
        View Artifacts
      </button>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PlaywrightDashboard() {
  const [suites, setSuites] = useState<TestSuite[]>(INITIAL_SUITES)
  const [running, setRunning] = useState(false)
  const [activeTab, setActiveTab] = useState<FilterKey>('all')
  const [expandedSuites, setExpandedSuites] = useState<Record<string, boolean>>({ login: true })
  const [expandedErrors, setExpandedErrors] = useState<Record<string, boolean>>({})
  const [hoveredTest, setHoveredTest] = useState<string | null>(null)
  const [artifactModal, setArtifactModal] = useState<ArtifactModalState | null>(null)

  // ── Derived counts ──────────────────────────────────────────────────────────
  const allTests = useMemo(() => suites.flatMap(s => s.tests), [suites])
  const counts = useMemo(() => ({
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

  // ── Filtered suites ─────────────────────────────────────────────────────────
  const filteredSuites = useMemo(() =>
    suites
      .map(s => ({
        ...s,
        tests: activeTab === 'all' ? s.tests : s.tests.filter(t => t.status === activeTab),
      }))
      .filter(s => s.tests.length > 0),
    [suites, activeTab]
  )

  // ── Run simulation ──────────────────────────────────────────────────────────
  const runTests = useCallback(async () => {
    setRunning(true)
    setExpandedErrors({})
    setSuites(INITIAL_SUITES.map(s => ({
      ...s, tests: s.tests.map(t => ({ ...t, status: 'pending' as Status, duration: 0 })),
    })))
    setExpandedSuites(Object.fromEntries(INITIAL_SUITES.map(s => [s.id, true])))

    const flat = INITIAL_SUITES.flatMap(s => s.tests.map(t => ({ suiteId: s.id, test: t })))
    for (const { suiteId, test } of flat) {
      setSuites(prev => prev.map(s => s.id !== suiteId ? s : {
        ...s, tests: s.tests.map(t => t.id !== test.id ? t : { ...t, status: 'running' }),
      }))
      await new Promise(r => setTimeout(r, 150 + Math.random() * 250))
      setSuites(prev => prev.map(s => s.id !== suiteId ? s : {
        ...s, tests: s.tests.map(t => t.id !== test.id ? t : {
          ...t, status: test.status, duration: test.duration, error: test.error, retries: test.retries,
        }),
      }))
    }
    setRunning(false)
  }, [])

  const reset = () => { setSuites(INITIAL_SUITES); setActiveTab('all'); setExpandedErrors({}) }

  const exportReport = () => {
    const report = {
      generated: new Date().toISOString(),
      summary: { ...counts, passRate: `${passRate}%`, totalDuration: formatMs(totalDuration) },
      suites: suites.map(s => ({
        title: s.title, file: s.file,
        tests: s.tests.map(t => ({ title: t.title, status: t.status, duration: formatMs(t.duration), retries: t.retries ?? 0 })),
      })),
    }
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'playwright-report.json'; a.click()
    URL.revokeObjectURL(url)
  }

  const toggleSuite = (id: string) => setExpandedSuites(p => ({ ...p, [id]: !p[id] }))
  const toggleError = (id: string) => setExpandedErrors(p => ({ ...p, [id]: !p[id] }))

  // ── Suite-level derived status ──────────────────────────────────────────────
  function suiteStatus(suite: TestSuite): Status {
    if (suite.tests.some(t => t.status === 'running')) return 'running'
    if (suite.tests.some(t => t.status === 'failed'))  return 'failed'
    if (suite.tests.every(t => t.status === 'passed')) return 'passed'
    if (suite.tests.every(t => t.status === 'skipped' || t.status === 'pending')) return 'skipped'
    return 'pending'
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F2EB' }}>
      <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-up">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>
              Playwright Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {INITIAL_SUITES.length} test suites · {counts.total} tests · {formatMs(totalDuration)} total
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={exportReport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border bg-white hover:bg-neutral-50 transition-colors shadow-sm"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              <Download size={13} />
              Export Report
            </button>
            <button
              onClick={reset}
              disabled={running}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border bg-white hover:bg-neutral-50 transition-colors shadow-sm disabled:opacity-40"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              <RotateCcw size={13} />
              Reset
            </button>
            <button
              onClick={running ? () => setRunning(false) : runTests}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all duration-150 active:scale-95 ${
                running ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {running ? <><Square size={14} /> Stop</> : <><Play size={14} /> Run Tests</>}
            </button>
          </div>
        </div>

        {/* ── Metric cards ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          {([
            { label: 'Total',     value: counts.total,   color: 'text-neutral-800' },
            { label: 'Passed',    value: counts.passed,  color: 'text-emerald-600' },
            { label: 'Failed',    value: counts.failed,  color: 'text-red-500' },
            { label: 'Skipped',   value: counts.skipped, color: 'text-amber-500' },
            { label: 'Pass Rate', value: `${passRate}%`, color: passRate >= 80 ? 'text-emerald-600' : 'text-red-500' },
          ] as const).map(({ label, value, color }) => (
            <div key={label} className="p-4 rounded-2xl border text-center bg-white shadow-sm" style={{ borderColor: 'var(--border)' }}>
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* ── Segmented progress bar ─────────────────────────────────────────── */}
        <div className="mb-6 h-1.5 rounded-full overflow-hidden flex bg-neutral-200">
          {counts.passed  > 0 && <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${(counts.passed  / counts.total) * 100}%` }} />}
          {counts.failed  > 0 && <div className="h-full bg-red-500   transition-all duration-700" style={{ width: `${(counts.failed  / counts.total) * 100}%` }} />}
          {counts.skipped > 0 && <div className="h-full bg-amber-400 transition-all duration-700" style={{ width: `${(counts.skipped / counts.total) * 100}%` }} />}
          {counts.pending > 0 && <div className="h-full bg-neutral-300 transition-all duration-700" style={{ width: `${(counts.pending / counts.total) * 100}%` }} />}
        </div>

        {/* ── Filter tabs ────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 mb-5 flex-wrap">
          {([
            { key: 'all',     label: `All (${counts.total})` },
            { key: 'passed',  label: `Passed (${counts.passed})` },
            { key: 'failed',  label: `Failed (${counts.failed})` },
            { key: 'skipped', label: `Skipped (${counts.skipped})` },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                activeTab === key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border text-neutral-500 hover:border-blue-300 hover:text-blue-600'
              }`}
              style={activeTab === key ? {} : { borderColor: 'var(--border)' }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Test suite accordion ───────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          {filteredSuites.map(suite => {
            const passed  = suite.tests.filter(t => t.status === 'passed').length
            const status  = suiteStatus(suite)
            const isOpen  = expandedSuites[suite.id]

            return (
              <div key={suite.id} className="rounded-2xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: 'var(--border)' }}>

                {/* Suite row */}
                <button
                  onClick={() => toggleSuite(suite.id)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-neutral-50 transition-colors text-left"
                >
                  <StatusIcon status={status} size={16} />
                  <span className="flex-1 min-w-0">
                    <span className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>{suite.title}</span>
                    <span className="ml-2 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{suite.file}</span>
                  </span>
                  <span className="text-xs shrink-0 font-medium" style={{ color: 'var(--text-muted)' }}>
                    {passed}/{suite.tests.length} passed
                  </span>
                  {isOpen
                    ? <ChevronUp size={15} style={{ color: 'var(--text-muted)' }} className="shrink-0" />
                    : <ChevronDown size={15} style={{ color: 'var(--text-muted)' }} className="shrink-0" />
                  }
                </button>

                {/* Test case rows */}
                {isOpen && (
                  <div className="border-t" style={{ borderColor: 'var(--border)' }}>
                    {suite.tests.map((test, i) => {
                      const isFailed   = test.status === 'failed'
                      const showActions = isFailed && (hoveredTest === test.id || expandedErrors[test.id])
                      const errorOpen  = expandedErrors[test.id]

                      return (
                        <div key={test.id} className={i > 0 ? 'border-t' : ''} style={{ borderColor: 'var(--border)' }}>

                          {/* Test row */}
                          <div
                            className={`flex items-center gap-3 px-5 py-2.5 transition-colors ${isFailed ? 'cursor-pointer hover:bg-red-50/40' : ''}`}
                            onMouseEnter={() => isFailed && setHoveredTest(test.id)}
                            onMouseLeave={() => setHoveredTest(null)}
                            onClick={() => isFailed && toggleError(test.id)}
                          >
                            <StatusIcon status={test.status} />
                            <span className="flex-1 text-xs" style={{ color: 'var(--text-main)' }}>{test.title}</span>

                            {/* Flakiness badge */}
                            {test.retries !== undefined && test.retries > 0 && (
                              <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
                                <AlertTriangle size={10} />
                                {test.retries} retry
                              </span>
                            )}

                            <span className="text-xs font-mono shrink-0" style={{ color: 'var(--text-muted)' }}>
                              {formatMs(test.duration)}
                            </span>
                            <StatusBadge status={test.status} />
                            {isFailed && (
                              errorOpen
                                ? <ChevronUp size={13} style={{ color: 'var(--text-muted)' }} className="shrink-0" />
                                : <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} className="shrink-0" />
                            )}
                          </div>

                          {/* Action bar — shown on hover or when error is expanded */}
                          {showActions && (
                            <FailedActions
                              test={test}
                              suiteFile={suite.file}
                              onViewArtifacts={setArtifactModal}
                            />
                          )}

                          {/* Error output */}
                          {isFailed && errorOpen && (
                            <div
                              className="mx-4 mb-3 p-3 rounded-xl text-[11px] font-mono leading-relaxed whitespace-pre-wrap border-l-2 border-red-400"
                              style={{ backgroundColor: '#fff5f5', color: '#dc2626' }}
                            >
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
            <div className="text-center py-16 bg-white rounded-2xl border shadow-sm" style={{ borderColor: 'var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No tests match the current filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Artifact Modal ──────────────────────────────────────────────────── */}
      {artifactModal && (
        <ArtifactModal state={artifactModal} onClose={() => setArtifactModal(null)} />
      )}
    </div>
  )
}
