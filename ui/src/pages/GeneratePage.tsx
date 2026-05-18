import { useState, useRef } from 'react'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined'
import StopOutlinedIcon from '@mui/icons-material/StopOutlined'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckIcon from '@mui/icons-material/Check'

const TEST_GENERATOR_PROMPT = `You are an elite Playwright Test Architect. Given a user story or acceptance criteria, generate a complete, production-ready Playwright test file (.spec.ts).

Rules:
- Use TypeScript strict mode
- Use getByRole / getByLabel / getByTestId locators — never CSS selectors or XPath
- Include test.describe block with a descriptive title
- Cover: happy path, validation errors, edge cases
- Use Page Object Model if the test has more than 4 interactions
- Use page.route() for API mocking if the story involves network calls
- Add realistic test data (not "foo" / "bar")
- If POM is requested, generate both the POM class and the spec file
- If auth is required, add a test.use({ storageState }) fixture comment

Return ONLY valid TypeScript. No markdown fences. No preamble.`

const PLACEHOLDER = `Paste your user story or acceptance criteria here…

Example:
"As a registered user, I can log in with my email and password.
- Happy path: valid credentials redirect to /dashboard
- Error: wrong password shows 'Invalid credentials' alert
- Error: empty email shows inline validation message
- Security: SQL injection in password field is rejected"`

export default function GeneratePage() {
  const [userStory, setUserStory] = useState('')
  const [includePOM, setIncludePOM] = useState(false)
  const [includeAuth, setIncludeAuth] = useState(false)
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const handleGenerate = async () => {
    if (!userStory.trim()) return
    setLoading(true)
    setError('')
    setOutput('')

    const abort = new AbortController()
    abortRef.current = abort

    const pomNote = includePOM ? '\n\nGenerate a Page Object Model class AND a spec file.' : ''
    const authNote = includeAuth ? '\n\nInclude test.use({ storageState: "playwright/.auth/user.json" }) for authenticated tests.' : ''
    const fullInput = userStory + pomNote + authNote

    try {
      const res = await fetch('/api/playground', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt: TEST_GENERATOR_PROMPT, userInput: fullInput }),
        signal: abort.signal,
      })

      if (!res.ok || !res.body) {
        throw new Error(`Server error ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const chunk = line.slice(6)
          if (chunk === '[DONE]') break
          accumulated += chunk
          setOutput(accumulated)
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        setError((err as Error).message ?? 'Unknown error')
      }
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }

  const handleStop = () => {
    abortRef.current?.abort()
    setLoading(false)
  }

  const handleCopy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!output) return
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'generated.spec.ts'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
          <AutoAwesomeOutlinedIcon className="text-primary-500" sx={{ fontSize: 24 }} />
          Test Generator
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Paste a user story or acceptance criteria — get a production-ready Playwright <code>.spec.ts</code> file.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Left panel — input */}
        <div
          className="rounded-2xl border flex flex-col overflow-hidden"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
        >
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>User Story</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none" style={{ color: 'var(--text-muted)' }}>
                <input
                  type="checkbox"
                  checked={includePOM}
                  onChange={(e) => setIncludePOM(e.target.checked)}
                  className="rounded"
                />
                POM
              </label>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none" style={{ color: 'var(--text-muted)' }}>
                <input
                  type="checkbox"
                  checked={includeAuth}
                  onChange={(e) => setIncludeAuth(e.target.checked)}
                  className="rounded"
                />
                Auth
              </label>
            </div>
          </div>

          <textarea
            className="flex-1 p-4 text-sm font-mono resize-none outline-none bg-transparent"
            style={{ color: 'var(--text-main)' }}
            placeholder={PLACEHOLDER}
            value={userStory}
            onChange={(e) => setUserStory(e.target.value)}
            spellCheck={false}
          />

          <div className="px-4 py-3 border-t flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
            {loading ? (
              <button
                onClick={handleStop}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                <StopOutlinedIcon sx={{ fontSize: 16 }} />
                Stop
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={!userStory.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <PlayArrowOutlinedIcon sx={{ fontSize: 16 }} />
                Generate Test
              </button>
            )}
            <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
              {userStory.length > 0 ? `${userStory.length} chars` : 'No API key needed in MOCK mode'}
            </span>
          </div>
        </div>

        {/* Right panel — output */}
        <div
          className="rounded-2xl border flex flex-col overflow-hidden"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
        >
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
              Generated <code className="text-xs">.spec.ts</code>
            </span>
            {output && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium hover:bg-neutral-100 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  title="Download .spec.ts"
                >
                  <DownloadOutlinedIcon sx={{ fontSize: 14 }} />
                  Download
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium hover:bg-neutral-100 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {copied ? <CheckIcon sx={{ fontSize: 14 }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto p-4">
            {error && (
              <p className="text-sm text-red-500 mb-3">{error}</p>
            )}
            {!output && !loading && (
              <p className="text-sm text-center mt-16" style={{ color: 'var(--text-muted)' }}>
                Your generated test will appear here…
              </p>
            )}
            {output && (
              <pre
                className="text-xs font-mono leading-relaxed whitespace-pre-wrap break-words"
                style={{ color: 'var(--text-main)' }}
              >
                {output}
              </pre>
            )}
            {loading && !output && (
              <div className="flex items-center gap-2 text-sm mt-16 justify-center" style={{ color: 'var(--text-muted)' }}>
                <span className="inline-block w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                Generating…
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
