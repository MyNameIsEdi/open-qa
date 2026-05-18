import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined'
import StopOutlinedIcon from '@mui/icons-material/StopOutlined'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckIcon from '@mui/icons-material/Check'

const PROMPTS = [
  {
    name: 'PRD to Test Matrix',
    systemPrompt: `You are an elite Lead QA Architect with over 15 years of experience in enterprise software testing. You possess a hacker's mindset and a deep understanding of complex system architectures. Your expertise lies in breaking down ambiguous Product Requirements Documents (PRDs) or user stories into exhaustive, highly structured, and actionable Test Plans.

Analyze the provided feature description and generate a comprehensive Test Plan covering functional, non-functional, and extreme edge cases. Format as a structured Markdown document with test ID tables.`,
  },
  {
    name: 'The Hacker QA',
    systemPrompt: `You are an elite Senior QA Data Engineer.
Generate JSON test data designed to break systems — SQLi, XSS, nulls, RTL text, emoji, boundary numbers.
Return ONLY a raw JSON array. No markdown fences. No commentary.
For each object include a "scenario_description" field explaining the edge case being tested.`,
  },
  {
    name: 'PRD Analyzer (Quick)',
    systemPrompt: `You are a meticulous QA Architect. Analyze the provided PRD or feature description.
Identify implicit requirements, contradictions, and missing error-handling.
Generate a test matrix in Markdown table format covering happy paths, negative workflows, edge cases, and security considerations.`,
  },
  {
    name: 'The BDD Master',
    systemPrompt: `You are a Principal QA Engineer and BDD specialist. Translate the product description into executable Gherkin scenarios with @smoke @regression tags, Background, and Scenario Outlines with Examples tables.`,
  },
  {
    name: 'Strict SDET PR Reviewer',
    systemPrompt: `You are a Staff SDET and test-architecture gatekeeper. Review the provided test code for: flaky locators, missing assertions, hardcoded waits, secrets, lack of test isolation. Output Blockers, Warnings, Praise, and a Flakiness Score 1-10.`,
  },
  {
    name: 'API Contract Enforcer',
    systemPrompt: `You are a Senior API Test Architect. Analyze the provided OpenAPI spec or endpoint description and generate a parameter permutation matrix covering all status codes, schema validation cases, and security edge cases.`,
  },
]

const PLACEHOLDER_MAP: Record<string, string> = {
  'PRD to Test Matrix': 'Paste your PRD or user story here…\n\nExample:\n"Users should be able to reset their password via email. The reset link expires after 1 hour."',
  'The Hacker QA': 'Describe the API schema or endpoint to generate attack payloads for…\n\nExample:\n"POST /api/users { name: string, email: string, age: number }"',
  'PRD Analyzer (Quick)': 'Paste your PRD or feature description here…',
  'The BDD Master': 'Describe the feature or user story…\n\nExample:\n"As a logged-in user, I can add items to my cart and proceed to checkout."',
  'Strict SDET PR Reviewer': 'Paste the test code to review here…',
  'API Contract Enforcer': 'Paste your OpenAPI spec, endpoint path, or API description here…',
}

export default function PlaygroundPage() {
  const { t } = useTranslation()
  const [selectedPromptIdx, setSelectedPromptIdx] = useState(0)
  const [systemPrompt, setSystemPrompt] = useState(PROMPTS[0].systemPrompt)
  const [userInput, setUserInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const selectedPrompt = PROMPTS[selectedPromptIdx]

  const handleSelectPrompt = (idx: number) => {
    setSelectedPromptIdx(idx)
    setSystemPrompt(PROMPTS[idx].systemPrompt)
  }

  const handleRun = async () => {
    if (!userInput.trim()) return
    abortRef.current = new AbortController()
    setLoading(true)
    setOutput('')
    setError('')

    try {
      const res = await fetch('/api/playground', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, userInput }),
        signal: abortRef.current.signal,
      })

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || `Server error ${res.status}`)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        // SSE lines: "data: <text>\n\n"
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const text = line.slice(6)
            if (text === '[DONE]') break
            accumulated += text
            setOutput(accumulated)
          }
        }
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return
      setError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleStop = () => {
    abortRef.current?.abort()
    setLoading(false)
  }

  const handleCopyOutput = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
          <ScienceOutlinedIcon className="text-primary-500" sx={{ fontSize: 24 }} />
          {t('playground.title')}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {t('playground.subtitle')}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left panel — input */}
        <div className="flex flex-col gap-4">
          {/* Prompt selector */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
              {t('playground.system_prompt')}
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PROMPTS.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => handleSelectPrompt(i)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
                    i === selectedPromptIdx
                      ? 'bg-primary-600 text-white shadow-soft'
                      : 'hover:bg-sand-400'
                  }`}
                  style={i === selectedPromptIdx ? {} : { color: 'var(--text-muted)' }}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={6}
              className="w-full text-xs font-mono p-3 rounded-xl border outline-none focus:ring-2 focus:ring-primary-300 resize-none leading-relaxed"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)',
              }}
            />
          </div>

          {/* User input */}
          <div className="flex flex-col flex-1">
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
              {t('playground.your_input')}
            </label>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              rows={10}
              placeholder={PLACEHOLDER_MAP[selectedPrompt.name] ?? 'Paste your PRD, log, spec, or test code here…'}
              className="w-full text-sm p-3 rounded-xl border outline-none focus:ring-2 focus:ring-primary-300 resize-none leading-relaxed flex-1"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)',
              }}
            />
          </div>

          {/* Run / Stop */}
          <div className="flex gap-2">
            <button
              onClick={handleRun}
              disabled={loading || !userInput.trim()}
              className="flex items-center justify-center gap-2 flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft"
            >
              <PlayArrowOutlinedIcon sx={{ fontSize: 16 }} />
              {loading ? t('playground.running') : t('playground.run')}
            </button>
            {loading && (
              <button
                onClick={handleStop}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-150 hover:bg-sand-400"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                <StopOutlinedIcon sx={{ fontSize: 16 }} />
                {t('playground.stop')}
              </button>
            )}
          </div>
        </div>

        {/* Right panel — output */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              {t('playground.output')}
              {loading && (
                <span className="ml-2 inline-flex items-center gap-1 text-primary-500">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                  {t('playground.streaming')}
                </span>
              )}
            </label>
            {output && (
              <button
                onClick={handleCopyOutput}
                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg hover:bg-sand-400 transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                {copied ? <CheckIcon sx={{ fontSize: 12 }} /> : <ContentCopyIcon sx={{ fontSize: 12 }} />}
                {copied ? t('playground.copied') : t('playground.copy')}
              </button>
            )}
          </div>
          <div
            className="flex-1 rounded-2xl border overflow-hidden"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', minHeight: '400px' }}
          >
            {error ? (
              <div className="p-4 text-sm text-coral-500">{error}</div>
            ) : output ? (
              <pre className="p-4 text-sm leading-relaxed whitespace-pre-wrap overflow-auto h-full" style={{ color: 'var(--text-main)' }}>
                {output}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 p-8" style={{ color: 'var(--text-muted)' }}>
                <ScienceOutlinedIcon sx={{ fontSize: 40, opacity: 0.3 }} />
                <p className="text-sm text-center">
                  {t('playground.empty_hint')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
