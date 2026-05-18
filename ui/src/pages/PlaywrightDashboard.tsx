import { useState, useCallback } from 'react'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutlined'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import StopIcon from '@mui/icons-material/Stop'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import RefreshIcon from '@mui/icons-material/Refresh'
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined'

type Status = 'passed' | 'failed' | 'skipped' | 'pending' | 'running'

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

const INITIAL_SUITES: TestSuite[] = [
  {
    id: 'login',
    file: 'tests/login.spec.ts',
    title: 'Login flow',
    tests: [
      { id: 'l1', title: 'successful login redirects to dashboard', status: 'passed', duration: 1240, browser: 'chromium' },
      { id: 'l2', title: 'wrong password shows error message', status: 'passed', duration: 890, browser: 'chromium' },
      { id: 'l3', title: 'empty fields show validation errors', status: 'failed', duration: 2100, browser: 'chromium', error: 'Error: Timeout 5000ms exceeded.\nExpected element to be visible: getByTestId(\'email-error\')\nReceived: hidden', retries: 1 },
      { id: 'l4', title: 'remember me checkbox persists session', status: 'passed', duration: 1560, browser: 'chromium' },
      { id: 'l5', title: 'logout clears session and redirects', status: 'passed', duration: 730, browser: 'chromium' },
    ],
  },
  {
    id: 'nav',
    file: 'tests/navigation.spec.ts',
    title: 'Navigation',
    tests: [
      { id: 'n1', title: 'clicking logo navigates to home', status: 'passed', duration: 410, browser: 'chromium' },
      { id: 'n2', title: 'all nav links are reachable', status: 'passed', duration: 1820, browser: 'chromium' },
      { id: 'n3', title: 'browser back / forward works correctly', status: 'passed', duration: 590, browser: 'chromium' },
      { id: 'n4', title: 'deep link to /agents renders agents page', status: 'skipped', duration: 0, browser: 'chromium' },
    ],
  },
  {
    id: 'forms',
    file: 'tests/forms.spec.ts',
    title: 'Form validation',
    tests: [
      { id: 'f1', title: 'required fields marked on empty submit', status: 'passed', duration: 980, browser: 'chromium' },
      { id: 'f2', title: 'email format validated inline', status: 'passed', duration: 760, browser: 'chromium' },
      { id: 'f3', title: 'max-length enforced on text inputs', status: 'failed', duration: 1350, browser: 'firefox', error: 'Error: expect(received).toHaveValue(expected)\nExpected: "a".repeat(255)\nReceived: "a".repeat(256)', retries: 0 },
      { id: 'f4', title: 'form submits with valid data', status: 'passed', duration: 1140, browser: 'chromium' },
    ],
  },
  {
    id: 'api',
    file: 'tests/api.spec.ts',
    title: 'API endpoints',
    tests: [
      { id: 'a1', title: 'GET /api/agents returns 200 with array', status: 'passed', duration: 210, browser: 'chromium' },
      { id: 'a2', title: 'POST /api/run/:id executes agent', status: 'passed', duration: 3400, browser: 'chromium' },
      { id: 'a3', title: 'GET /api/health returns ok status', status: 'passed', duration: 95, browser: 'chromium' },
      { id: 'a4', title: 'unknown route returns 404', status: 'passed', duration: 130, browser: 'chromium' },
    ],
  },
  {
    id: 'a11y',
    file: 'tests/accessibility.spec.ts',
    title: 'Accessibility (axe-core)',
    tests: [
      { id: 'ax1', title: 'home page has no critical WCAG violations', status: 'passed', duration: 2200, browser: 'chromium' },
      { id: 'ax2', title: 'agents page passes WCAG AA', status: 'passed', duration: 1980, browser: 'chromium' },
      { id: 'ax3', title: 'modal dialogs trap focus correctly', status: 'skipped', duration: 0, browser: 'chromium' },
    ],
  },
]

function statusIcon(s: Status, size = 16) {
  if (s === 'passed')  return <CheckCircleIcon sx={{ fontSize: size }} className="text-sage-600" />
  if (s === 'failed')  return <CancelIcon sx={{ fontSize: size }} className="text-red-500" />
  if (s === 'skipped') return <RemoveCircleOutlineIcon sx={{ fontSize: size }} className="text-amber-500" />
  if (s === 'running') return <span className="inline-block w-3 h-3 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
  return <RadioButtonUncheckedIcon sx={{ fontSize: size }} style={{ color: 'var(--text-muted)' }} />
}

function statusBadge(s: Status) {
  const base = 'text-xs font-medium px-2 py-0.5 rounded-full'
  if (s === 'passed')  return <span className={`${base} bg-sage-100 text-sage-700`}>passed</span>
  if (s === 'failed')  return <span className={`${base} bg-red-50 text-red-600`}>failed</span>
  if (s === 'skipped') return <span className={`${base} bg-amber-50 text-amber-600`}>skipped</span>
  if (s === 'running') return <span className={`${base} bg-primary-50 text-primary-600`}>running…</span>
  return <span className={`${base} bg-sand-400`} style={{ color: 'var(--text-muted)' }}>pending</span>
}

function formatDuration(ms: number) {
  if (ms === 0) return '—'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export default function PlaywrightDashboard() {
  const [suites, setSuites] = useState<TestSuite[]>(INITIAL_SUITES)
  const [running, setRunning] = useState(false)
  const [filter, setFilter] = useState<Status | 'all'>('all')
  const [openSuites, setOpenSuites] = useState<Record<string, boolean>>({ login: true })
  const [openTests, setOpenTests] = useState<Record<string, boolean>>({})

  const allTests = suites.flatMap(s => s.tests)
  const counts = {
    total:   allTests.length,
    passed:  allTests.filter(t => t.status === 'passed').length,
    failed:  allTests.filter(t => t.status === 'failed').length,
    skipped: allTests.filter(t => t.status === 'skipped').length,
    pending: allTests.filter(t => t.status === 'pending').length,
  }
  const totalDuration = allTests.reduce((acc, t) => acc + t.duration, 0)

  const runTests = useCallback(async () => {
    setRunning(true)
    // Reset all to pending
    setSuites(prev => prev.map(s => ({
      ...s,
      tests: s.tests.map(t => ({ ...t, status: 'pending' as Status, duration: 0 })),
    })))
    setOpenSuites(Object.fromEntries(INITIAL_SUITES.map(s => [s.id, true])))

    // Run each test with a delay
    const allFlat = INITIAL_SUITES.flatMap(s => s.tests.map(t => ({ suiteId: s.id, test: t })))
    for (const { suiteId, test } of allFlat) {
      // Mark running
      setSuites(prev => prev.map(s => s.id !== suiteId ? s : {
        ...s,
        tests: s.tests.map(t => t.id !== test.id ? t : { ...t, status: 'running' }),
      }))
      await new Promise(r => setTimeout(r, 200 + Math.random() * 300))
      // Mark final status
      setSuites(prev => prev.map(s => s.id !== suiteId ? s : {
        ...s,
        tests: s.tests.map(t => t.id !== test.id ? t : {
          ...t,
          status: test.status,
          duration: test.duration,
          error: test.error,
        }),
      }))
    }
    setRunning(false)
  }, [])

  const reset = () => {
    setSuites(INITIAL_SUITES)
    setFilter('all')
  }

  const toggleSuite = (id: string) =>
    setOpenSuites(p => ({ ...p, [id]: !p[id] }))

  const toggleTest = (id: string) =>
    setOpenTests(p => ({ ...p, [id]: !p[id] }))

  const filteredSuites = suites.map(suite => ({
    ...suite,
    tests: filter === 'all' ? suite.tests : suite.tests.filter(t => t.status === filter),
  })).filter(s => s.tests.length > 0)

  const passRate = counts.total > 0
    ? Math.round(((counts.passed) / (counts.total - counts.skipped - counts.pending)) * 100) || 0
    : 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
            <BugReportOutlinedIcon sx={{ fontSize: 24 }} className="text-primary-600" />
            Playwright Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {suites.length} test suites · {counts.total} tests · {formatDuration(totalDuration)} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            disabled={running}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border hover:bg-sand-400 transition-colors disabled:opacity-40"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            <RefreshIcon sx={{ fontSize: 14 }} />
            Reset
          </button>
          <button
            onClick={running ? () => setRunning(false) : runTests}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-95 ${
              running
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-primary-600 text-white hover:bg-primary-700 shadow-soft'
            }`}
          >
            {running ? <><StopIcon sx={{ fontSize: 16 }} /> Stop</> : <><PlayArrowIcon sx={{ fontSize: 16 }} /> Run Tests</>}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total',   value: counts.total,   cls: '' },
          { label: 'Passed',  value: counts.passed,  cls: 'text-sage-600' },
          { label: 'Failed',  value: counts.failed,  cls: 'text-red-500' },
          { label: 'Skipped', value: counts.skipped, cls: 'text-amber-500' },
          { label: 'Pass rate', value: `${passRate}%`, cls: passRate >= 80 ? 'text-sage-600' : 'text-red-500' },
        ].map(({ label, value, cls }) => (
          <div
            key={label}
            className="p-4 rounded-2xl border text-center"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
          >
            <p className={`text-2xl font-black ${cls}`}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mb-6 h-2 rounded-full overflow-hidden flex" style={{ backgroundColor: 'var(--bg-body)' }}>
        {counts.passed  > 0 && <div className="h-full bg-sage-500  transition-all duration-500" style={{ width: `${(counts.passed  / counts.total) * 100}%` }} />}
        {counts.failed  > 0 && <div className="h-full bg-red-500   transition-all duration-500" style={{ width: `${(counts.failed  / counts.total) * 100}%` }} />}
        {counts.skipped > 0 && <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${(counts.skipped / counts.total) * 100}%` }} />}
        {counts.pending > 0 && <div className="h-full opacity-20" style={{ width: `${(counts.pending / counts.total) * 100}%`, backgroundColor: 'var(--text-muted)' }} />}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-5 flex-wrap">
        {([
          { key: 'all',     label: `All (${counts.total})` },
          { key: 'passed',  label: `Passed (${counts.passed})` },
          { key: 'failed',  label: `Failed (${counts.failed})` },
          { key: 'skipped', label: `Skipped (${counts.skipped})` },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === key
                ? 'bg-primary-600 text-white'
                : 'hover:bg-sand-400'
            }`}
            style={filter === key ? {} : { color: 'var(--text-muted)' }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Test suites */}
      <div className="flex flex-col gap-3">
        {filteredSuites.map(suite => {
          const suitePassed  = suite.tests.filter(t => t.status === 'passed').length
          const suiteFailed  = suite.tests.filter(t => t.status === 'failed').length
          const suiteRunning = suite.tests.some(t => t.status === 'running')

          return (
            <div
              key={suite.id}
              className="rounded-2xl border overflow-hidden"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
            >
              {/* Suite header */}
              <button
                onClick={() => toggleSuite(suite.id)}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-sand-400 transition-colors text-left"
              >
                <span className="shrink-0">
                  {suiteRunning
                    ? statusIcon('running')
                    : suiteFailed > 0
                      ? <CancelIcon sx={{ fontSize: 16 }} className="text-red-500" />
                      : <CheckCircleIcon sx={{ fontSize: 16 }} className="text-sage-600" />
                  }
                </span>
                <span className="flex-1">
                  <span className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>
                    {suite.title}
                  </span>
                  <span className="ml-2 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    {suite.file}
                  </span>
                </span>
                <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                  {suitePassed}/{suite.tests.length} passed
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {openSuites[suite.id] ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
                </span>
              </button>

              {/* Individual tests */}
              {openSuites[suite.id] && (
                <div className="border-t" style={{ borderColor: 'var(--border)' }}>
                  {suite.tests.map((test, i) => (
                    <div key={test.id}>
                      <button
                        onClick={() => test.error && toggleTest(test.id)}
                        className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                          i > 0 ? 'border-t' : ''
                        } ${test.error ? 'hover:bg-sand-400 cursor-pointer' : 'cursor-default'}`}
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <span className="shrink-0">{statusIcon(test.status)}</span>
                        <span className="flex-1 text-xs" style={{ color: 'var(--text-main)' }}>
                          {test.title}
                        </span>
                        {test.retries !== undefined && test.retries > 0 && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 shrink-0">
                            {test.retries} retry
                          </span>
                        )}
                        <span className="text-xs font-mono shrink-0" style={{ color: 'var(--text-muted)' }}>
                          {formatDuration(test.duration)}
                        </span>
                        <span className="shrink-0">{statusBadge(test.status)}</span>
                        {test.error && (
                          <span style={{ color: 'var(--text-muted)' }}>
                            {openTests[test.id] ? <ExpandLessIcon sx={{ fontSize: 14 }} /> : <ExpandMoreIcon sx={{ fontSize: 14 }} />}
                          </span>
                        )}
                      </button>

                      {/* Error output */}
                      {test.error && openTests[test.id] && (
                        <div
                          className="mx-4 mb-3 p-3 rounded-xl text-xs font-mono leading-relaxed whitespace-pre-wrap"
                          style={{ backgroundColor: 'var(--bg-body)', color: '#ef4444', borderLeft: '3px solid #ef4444' }}
                        >
                          {test.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {filteredSuites.length === 0 && (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            <p className="text-sm">No tests match the current filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}
