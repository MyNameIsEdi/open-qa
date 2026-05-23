import express from 'express'
import cors from 'cors'
import { execFile, spawn } from 'child_process'
import { promisify } from 'util'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs/promises'
import { existsSync, readdirSync, statSync } from 'fs'
import Anthropic from '@anthropic-ai/sdk'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const execFileAsync = promisify(execFile)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const app = express()
app.use(cors())
app.use(express.json())

// Static file serving — lets the browser download real test artifacts
app.use('/test-results',    express.static(path.join(root, 'test-results')))
app.use('/playwright-report', express.static(path.join(root, 'playwright-report')))

const PORT = 3001
const USE_MOCK = !process.env.ANTHROPIC_API_KEY
const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022'

const agentCatalog = [
  { id: 'healing', name: 'Self-Healing Locator', status: 'active', runCommand: 'npx tsx src/agents/self-healing/index.ts' },
  { id: 'triage', name: 'Automated Bug Triage', status: 'active', runCommand: 'npx tsx src/skills/log-analyzer/index.ts' },
  { id: 'auto-pom', name: 'Auto-POM Builder', status: 'active', runCommand: 'npx tsx src/agents/auto-pom/index.ts' },
  { id: 'visual-regression', name: 'Visual Regression Agent', status: 'active', runCommand: 'npx tsx src/agents/visual-regression/index.ts' },
  { id: 'a11y', name: 'Visual A11y Scanner', status: 'active', runCommand: 'npx tsx src/agents/visual-a11y/index.ts' },
  { id: 'network-mock', name: 'Network Interceptor & Mock Gen', status: 'planned', runCommand: 'npx tsx scripts/network-mock-gen.ts' },
  { id: 'chaos', name: 'Chaos Monkey UI', status: 'planned', runCommand: 'npx tsx scripts/chaos-monkey-ui.ts' },
]

const skillCatalog = [
  { id: 'datagen', name: 'Smart Data Gen', status: 'active', runCommand: 'npx tsx src/skills/data-gen/index.ts' },
  { id: 'graphql-fuzzer', name: 'GraphQL Fuzzer', status: 'planned', runCommand: 'npx tsx scripts/graphql-fuzzer.ts' },
  { id: 'k6-profile', name: 'K6 Load Profile Gen', status: 'planned', runCommand: 'npx tsx scripts/k6-profile-gen.ts' },
  { id: 'log-scraper', name: 'Regex Log Scraper', status: 'planned', runCommand: 'npx tsx scripts/regex-log-scraper.ts' },
  { id: 'jwt', name: 'JWT Manipulator', status: 'planned', runCommand: 'npx tsx scripts/jwt-manipulator.ts' },
]

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', project: 'open-qa', mockMode: USE_MOCK })
})

app.get('/api/agents', (_req, res) => {
  res.json(agentCatalog)
})

app.get('/api/skills', (_req, res) => {
  res.json(skillCatalog)
})

app.post('/api/run/:id', async (req, res) => {
  const { id } = req.params
  const allRunnables = [...agentCatalog, ...skillCatalog]
  const entry = allRunnables.find((e) => e.id === id)

  if (!entry) {
    return res.status(404).json({ error: `Unknown agent/skill id: ${id}` })
  }
  if (entry.status === 'planned') {
    return res.status(400).json({ error: `${entry.name} is not yet implemented (planned).` })
  }

  try {
    const [cmd, ...args] = entry.runCommand.split(' ')
    const { stdout, stderr } = await execFileAsync(cmd, args, { cwd: root, timeout: 60_000 })
    res.json({ ok: true, output: stdout, warnings: stderr || undefined })
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; message?: string }
    res.status(500).json({ ok: false, error: e.message, output: e.stdout, stderr: e.stderr })
  }
})

// Playground endpoint — streams SSE chunks from Claude (or MOCK)
app.post('/api/playground', async (req, res) => {
  const { systemPrompt, userInput } = req.body as { systemPrompt?: string; userInput?: string }

  if (!userInput?.trim()) {
    return res.status(400).json({ error: 'userInput is required' })
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  const sendChunk = (text: string) => {
    res.write(`data: ${text}\n\n`)
  }

  if (USE_MOCK) {
    // MOCK mode: stream a canned response word-by-word
    const mockResponse = `[MOCK MODE — set ANTHROPIC_API_KEY in .env for live responses]

## Analysis

Based on your input, here is a mock QA analysis:

### Test Cases Generated

| ID | Scenario | Expected | Priority |
|----|----------|----------|----------|
| TC-001 | Happy path — valid input | Success response (200) | P0 |
| TC-002 | Empty required field | Validation error (400) | P0 |
| TC-003 | SQL injection in string field | Sanitized / rejected (400) | P1 |
| TC-004 | Oversized payload (>10MB) | 413 Payload Too Large | P1 |
| TC-005 | Concurrent duplicate requests | Idempotent response or 409 | P2 |

### Edge Cases
- RTL text in name fields (Hebrew/Arabic)
- Unicode null bytes (\\u0000) in strings
- Negative and MAX_SAFE_INTEGER numeric values
- Missing optional vs required fields

### Automation Recommendation
Automate TC-001 through TC-003 with Playwright APIRequestContext for fast CI feedback.`

    const words = mockResponse.split(' ')
    for (const word of words) {
      sendChunk(word + ' ')
      await new Promise((r) => setTimeout(r, 15))
    }
    sendChunk('[DONE]')
    res.end()
    return
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const stream = client.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      system: systemPrompt || undefined,
      messages: [{ role: 'user', content: userInput }],
    })

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        sendChunk(chunk.delta.text)
      }
    }

    sendChunk('[DONE]')
    res.end()
  } catch (err: unknown) {
    const e = err as { message?: string }
    sendChunk(`\n\n[ERROR] ${e.message ?? 'Unknown error'}`)
    sendChunk('[DONE]')
    res.end()
  }
})

// ─── Gemini QA-Agent Chat endpoint ────────────────────────────────────────────
//
// POST /api/qa-agent
//   Headers:  Authorization: Bearer <geminiApiKey>
//   Body:     {
//               message:   string,          // current user turn text
//               history:   HistoryItem[],   // prior turns { role, content }
//               agentIds:  string[],        // IDs of tagged agents
//               agents:    AgentMeta[],     // name + systemPrompt for each agent
//               imageAttachments?: ImageAttachment[],  // Base64 images for vision
//               model?:    string,
//             }
//   Response: text/event-stream (SSE)
//               data: {"chunk": "..."}\n\n  — incremental token
//               data: {"done": true}\n\n    — stream complete
//               data: {"error": "..."}\n\n  — error
//
// The API key is passed from the client's localStorage in the Authorization header.

interface HistoryItem {
  role:    'user' | 'model'
  content: string
}

interface AgentMeta {
  id:           string
  name:         string
  systemPrompt: string
}

interface ImageAttachment {
  name:    string
  type:    string   // MIME, e.g. "image/png"
  content: string   // Base64 data-URL or raw Base64
}

interface QaAgentBody {
  message:           string
  history?:          HistoryItem[]
  agentIds?:         string[]
  agents?:           AgentMeta[]
  imageAttachments?: ImageAttachment[]
  model?:            string
  /** 'gemini' (default) or 'ollama' */
  provider?:         'gemini' | 'ollama'
  /** Base URL for Ollama server, e.g. http://localhost:11434 */
  ollamaBaseUrl?:    string
  /**
   * When true, the request runs through the multi-agent collaboration loop:
   * a primary specialist drafts → critic reviews → primary refines → manager
   * synthesises. Streams `turn_start | chunk | turn_done` SSE events so the
   * chat UI can render a threaded conversation.  Gemini-only for now.
   */
  collaborate?:      boolean
  /** Max refinement rounds when collaborate=true. Default 2 (4 LLM calls). */
  maxRounds?:        number
}

// ─── Multi-agent collaboration helpers ───────────────────────────────────────

/** Pick the manager (Edi M) and 1 primary + 1 critic from the tagged set */
function pickCollabRoster(
  tagged: AgentMeta[],
  allAgents: AgentMeta[],
): { manager: AgentMeta; primary: AgentMeta; critic: AgentMeta } | null {
  const manager = allAgents.find(a => a.id === 'agent-manager')
                ?? tagged.find(a => a.id === 'agent-manager')
  if (!manager) return null

  // Primary: first tagged agent that isn't the manager; fall back to a
  // sensible default (E2E Tester) so collab still works if the user only
  // typed "@Edi M, …".
  const primary = tagged.find(a => a.id !== 'agent-manager')
              ?? allAgents.find(a => a.id === 'agent-1')
              ?? allAgents[0]
  if (!primary) return null

  // Critic: second tagged agent; if none provided, default to the Bug Triager
  // (sharp eye for failure modes) or any agent other than the primary/manager.
  const critic = tagged.filter(a => a.id !== 'agent-manager' && a.id !== primary.id)[0]
             ?? allAgents.find(a => a.id === 'agent-3' && a.id !== primary.id)
             ?? allAgents.find(a => a.id !== primary.id && a.id !== manager.id)
             ?? manager
  return { manager, primary, critic }
}

/**
 * Run a single Gemini turn with a custom system instruction. Streams chunks via
 * the provided callback and resolves with the full concatenated text so the
 * next turn can be conditioned on it.
 */
async function runCollabTurn(
  apiKey: string,
  model: string,
  systemInstruction: string,
  prompt: string,
  onChunk: (text: string) => void,
): Promise<string> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI    = new GoogleGenerativeAI(apiKey)
  const genModel = genAI.getGenerativeModel({ model, systemInstruction })
  const chat     = genModel.startChat({ history: [] })
  const result   = await chat.sendMessageStream([{ text: prompt }])
  let full = ''
  for await (const chunk of result.stream) {
    const t = chunk.text()
    if (t) { full += t; onChunk(t) }
  }
  return full
}

/** Strip data-URL prefix (data:image/png;base64,…) leaving only the raw Base64 */
function stripDataUrl(b64: string): string {
  const comma = b64.indexOf(',')
  return comma !== -1 ? b64.slice(comma + 1) : b64
}

/** Map our HistoryItem[] to the Gemini SDK Content[] type */
function toGeminiHistory(
  history: HistoryItem[],
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  // Gemini requires alternating user/model turns; skip leading model turns
  const cleaned: HistoryItem[] = []
  for (const item of history) {
    const last = cleaned[cleaned.length - 1]
    if (last && last.role === item.role) {
      // Merge consecutive same-role turns
      last.content += '\n\n' + item.content
    } else {
      cleaned.push({ ...item })
    }
  }
  return cleaned.map(item => ({
    role:  item.role,
    parts: [{ text: item.content }],
  }))
}

app.post('/api/qa-agent', async (req, res) => {
  const authHeader = req.headers.authorization as string | undefined
  const apiKey     = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null

  const {
    message,
    history           = [],
    agentIds          = [],
    agents            = [],
    imageAttachments  = [],
    model             = 'gemini-2.0-flash',
    provider          = 'gemini',
    ollamaBaseUrl     = 'http://localhost:11434',
    collaborate       = false,
    maxRounds         = 2,
  } = req.body as QaAgentBody

  // SSE setup — do this before any early returns so errors arrive as SSE too
  res.setHeader('Content-Type',  'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection',    'keep-alive')
  res.flushHeaders()

  const send = (payload: Record<string, unknown>) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`)
  }

  // Auth: only Gemini needs an API key
  if (provider === 'gemini' && !apiKey) {
    send({ error: 'Missing Gemini API key — add it in Settings' })
    res.end()
    return
  }

  if (!message?.trim() && imageAttachments.length === 0) {
    send({ error: 'Body field "message" is required.' })
    res.end()
    return
  }

  // Build combined system instruction from all tagged agents
  const taggedAgents = agentIds
    .map(id => agents.find(a => a.id === id))
    .filter((a): a is AgentMeta => a !== undefined)

  const systemInstruction = taggedAgents.length > 0
    ? taggedAgents.map(a => `## ${a.name}\n${a.systemPrompt}`).join('\n\n---\n\n')
    : agents[0]?.systemPrompt ?? 'You are a helpful QA assistant.'

  // ── Multi-Agent Collaboration mode ────────────────────────────────────────────
  // When the client opts in via collaborate=true, run a structured orchestration:
  //   1. Primary specialist drafts initial answer
  //   2. Critic reviews and provides feedback (verdict: lgtm | needs_work)
  //   3. If verdict == needs_work AND rounds remain → primary refines, repeat
  //   4. Manager (Edi M) synthesises a final, polished answer
  //
  // Each step streams its own message via:
  //   {evt:'turn_start', agentId, agentName, role, round, label}
  //   {chunk:'…'}             ← reuses the regular chunk protocol
  //   {evt:'turn_done', agentId, verdict?}
  //   …
  //   {done:true}
  if (collaborate && provider === 'gemini') {
    const roster = pickCollabRoster(taggedAgents, agents)
    if (!roster) {
      send({ error: 'Collaboration needs at least one agent (and an Edi M manager) to be configured.' })
      res.end()
      return
    }
    const { manager, primary, critic } = roster
    const rounds  = Math.max(1, Math.min(maxRounds, 4))   // clamp 1–4 to avoid runaway cost

    // Helper: start/stream/end one turn
    const playTurn = async (
      agent:        AgentMeta,
      role:         'primary' | 'critic' | 'synthesis',
      round:        number,
      label:        string,
      systemPrompt: string,
      userPrompt:   string,
    ): Promise<string> => {
      send({ evt: 'turn_start', agentId: agent.id, agentName: agent.name, role, round, label })
      let full = ''
      try {
        full = await runCollabTurn(apiKey!, model, systemPrompt, userPrompt, txt => send({ chunk: txt }))
      } catch (err: unknown) {
        const m = err instanceof Error ? err.message : String(err)
        send({ chunk: `\n\n[${agent.name} error: ${m}]` })
      }
      send({ evt: 'turn_done', agentId: agent.id, role, round })
      return full
    }

    // Common context shared across turns — keeps each agent's reply grounded
    const userBlock = `# User request\n${message.trim()}\n`

    let primaryAnswer = await playTurn(
      primary,
      'primary',
      1,
      'Initial draft',
      primary.systemPrompt + '\n\nYou are drafting an initial response. Be thorough but concise; another specialist will review your work.',
      userBlock,
    )

    let verdict: 'lgtm' | 'needs_work' = 'needs_work'

    for (let round = 1; round <= rounds; round++) {
      // ── Critic review ────────────────────────────────────────────────────
      const critiquePrompt =
        userBlock +
        `\n# Draft from ${primary.name} (round ${round})\n${primaryAnswer}\n\n` +
        `# Your task\nReview the draft above as ${critic.name}. Identify gaps, bugs, or missed requirements. ` +
        `End your message with exactly one of:\n  VERDICT: LGTM   — the draft is good enough to ship\n  VERDICT: NEEDS_WORK — the primary should revise based on your feedback`

      const critiqueText = await playTurn(
        critic,
        'critic',
        round,
        `Critique (round ${round})`,
        critic.systemPrompt + '\n\nYou are reviewing a peer\'s draft. Be specific, constructive, and decisive — your goal is to make the final answer the best it can be.',
        critiquePrompt,
      )

      verdict = /VERDICT:\s*LGTM/i.test(critiqueText) ? 'lgtm' : 'needs_work'
      // Echo the verdict via a dedicated done event so the UI can render a badge
      send({ evt: 'turn_verdict', agentId: critic.id, round, verdict })

      if (verdict === 'lgtm' || round === rounds) break

      // ── Primary refines ──────────────────────────────────────────────────
      const refinePrompt =
        userBlock +
        `\n# Your previous draft (round ${round})\n${primaryAnswer}\n\n` +
        `# Feedback from ${critic.name}\n${critiqueText}\n\n` +
        `# Your task\nRevise your draft to address ${critic.name}'s feedback. Keep what works, fix what doesn't, and don't re-explain everything — just produce the improved answer.`

      primaryAnswer = await playTurn(
        primary,
        'primary',
        round + 1,
        `Refined response (round ${round + 1})`,
        primary.systemPrompt + '\n\nYou are refining your previous draft based on peer feedback. Be focused — incorporate the feedback that\'s right, push back briefly on anything that\'s wrong, and produce a stronger answer.',
        refinePrompt,
      )
    }

    // ── Manager (Edi M) final synthesis ────────────────────────────────────
    const synthPrompt =
      userBlock +
      `\n# Final draft from ${primary.name}\n${primaryAnswer}\n\n` +
      `# Your task\nAs the team manager, deliver the final polished answer to the user. ` +
      `Synthesise the team's work into a clear, actionable response. ` +
      `If anything still seems off, add a short "Heads-up" note at the end.`

    await playTurn(
      manager,
      'synthesis',
      rounds + 1,
      'Final synthesis',
      manager.systemPrompt + '\n\nYou are delivering the team\'s final answer to the user. Be clear, decisive, and useful.',
      synthPrompt,
    )

    send({ done: true })
    res.end()
    return
  }

  if (collaborate && provider === 'ollama') {
    // Ollama collaboration is intentionally a no-op for now — single-agent fallback
    send({ chunk: '_Multi-agent collaboration is currently Gemini-only. Falling back to single-agent reply._\n\n' })
    // Fall through to the normal Ollama path below
  }

  // ── Ollama path ───────────────────────────────────────────────────────────────
  if (provider === 'ollama') {
    try {
      const ollamaMessages: Array<{ role: string; content: string }> = [
        { role: 'system', content: systemInstruction },
        ...history.map(h => ({
          role:    h.role === 'model' ? 'assistant' : 'user',
          content: h.content,
        })),
        { role: 'user', content: message.trim() || '(image attached — vision not supported by Ollama in this integration)' },
      ]

      const ollamaRes = await fetch(`${ollamaBaseUrl}/api/chat`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ model, messages: ollamaMessages, stream: true }),
        signal:  AbortSignal.timeout(120_000),
      })

      if (!ollamaRes.ok) {
        const errText = await ollamaRes.text().catch(() => `HTTP ${ollamaRes.status}`)
        send({ error: `Ollama error: ${errText}` })
        res.end()
        return
      }

      if (!ollamaRes.body) {
        send({ error: 'Ollama returned no response body' })
        res.end()
        return
      }

      // Read Ollama's NDJSON stream (one JSON object per line)
      const reader  = (ollamaRes.body as ReadableStream<Uint8Array>).getReader()
      const decoder = new TextDecoder()
      let buffer    = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const parsed = JSON.parse(line) as {
              message?: { content?: string }
              done?:    boolean
              error?:   string
            }
            if (parsed.error) throw new Error(parsed.error)
            if (parsed.message?.content) send({ chunk: parsed.message.content })
            if (parsed.done) { send({ done: true }); res.end(); return }
          } catch (lineErr: unknown) {
            if (lineErr instanceof SyntaxError) continue  // skip malformed NDJSON
            throw lineErr
          }
        }
      }
      send({ done: true })
      res.end()
    } catch (err: unknown) {
      const msg  = err instanceof Error ? err.message : String(err)
      const hint = /ECONNREFUSED|fetch failed|Failed to fetch/i.test(msg)
        ? ' — is Ollama running? Run: ollama serve'
        : /timeout/i.test(msg)
        ? ' — Ollama timed out (model may still be loading)'
        : ''
      send({ error: msg + hint })
      res.end()
    }
    return
  }

  // ── Gemini path ───────────────────────────────────────────────────────────────
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI    = new GoogleGenerativeAI(apiKey!)
    const genModel = genAI.getGenerativeModel({ model, systemInstruction })
    const chatHistory = toGeminiHistory(history)
    const chat = genModel.startChat({ history: chatHistory })

    type GeminiPart =
      | { text: string }
      | { inlineData: { mimeType: string; data: string } }

    const parts: GeminiPart[] = []
    if (message.trim()) parts.push({ text: message })
    for (const img of imageAttachments) {
      parts.push({ inlineData: { mimeType: img.type, data: stripDataUrl(img.content) } })
    }

    const streamResult = await chat.sendMessageStream(parts)
    for await (const chunk of streamResult.stream) {
      const text = chunk.text()
      if (text) send({ chunk: text })
    }

    send({ done: true })
    res.end()
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err)
    const hint   = /API_KEY_INVALID|invalid api key/i.test(errMsg)
      ? ' — check your Gemini key in Settings'
      : /quota/i.test(errMsg)
      ? ' — free-tier quota exceeded; wait or upgrade'
      : ''
    send({ error: errMsg + hint })
    res.end()
  }
})

// ─── Ollama helper endpoints ──────────────────────────────────────────────────

// GET /api/ollama/test?baseUrl=... — verify Ollama is reachable
app.get('/api/ollama/test', async (req, res) => {
  const baseUrl = (req.query.baseUrl as string | undefined)?.trim() || 'http://localhost:11434'
  try {
    const r = await fetch(`${baseUrl}/api/version`, { signal: AbortSignal.timeout(5_000) })
    if (!r.ok) return res.json({ ok: false, detail: `HTTP ${r.status}` })
    const body = await r.json() as { version?: string }
    res.json({ ok: true, version: body.version ?? 'unknown' })
  } catch (err: unknown) {
    res.json({ ok: false, detail: String(err) })
  }
})

// GET /api/ollama/models?baseUrl=... — list installed Ollama models
app.get('/api/ollama/models', async (req, res) => {
  const baseUrl = (req.query.baseUrl as string | undefined)?.trim() || 'http://localhost:11434'
  try {
    const r = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(5_000) })
    if (!r.ok) return res.json({ models: [], error: `HTTP ${r.status}` })
    const body = await r.json() as { models?: Array<{ name: string }> }
    res.json({ models: (body.models ?? []).map(m => m.name) })
  } catch (err: unknown) {
    res.json({ models: [], error: String(err) })
  }
})

// ─── Playwright helpers ───────────────────────────────────────────────────────

const RESULTS_PATH = path.join(root, 'test-results', 'pw-results.json')
const TESTS_DIR    = path.join(root, 'tests')
const RUNS_DIR     = path.join(root, 'test-results', 'runs')

/** Recursively collect all spec objects from a Playwright JSON suite tree */
function collectSpecs(suite: Record<string, unknown>): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = []
  const specs = suite.specs as Record<string, unknown>[] | undefined
  const subs  = suite.suites as Record<string, unknown>[] | undefined
  if (specs) out.push(...specs)
  if (subs)  for (const child of subs) out.push(...collectSpecs(child))
  return out
}

/** Flatten Playwright's nested reporter JSON into our TestSuite[] format */
function normalizePwResults(raw: Record<string, unknown>) {
  const topSuites = (raw.suites ?? []) as Record<string, unknown>[]
  const normalized: Record<string, unknown>[] = []

  for (const topSuite of topSuites) {
    const file    = (topSuite.file ?? topSuite.title ?? 'unknown.spec.ts') as string
    const suiteId = file.replace(/[^a-z0-9]/gi, '-').toLowerCase()
    const describes = (topSuite.suites ?? []) as Record<string, unknown>[]

    const testMap: Record<string, Record<string, unknown>[]> = {}

    const processBlock = (block: Record<string, unknown>) => {
      const descTitle = (block.title as string | undefined) || '(root)'
      if (!testMap[descTitle]) testMap[descTitle] = []

      for (const spec of collectSpecs(block)) {
        const specTitle = (spec.title as string) ?? ''
        const tests     = (spec.tests ?? []) as Record<string, unknown>[]

        const browserResults: Record<string, unknown>[] = []
        let primaryStatus   = 'pending'
        let primaryDuration = 0
        let primaryError: string | undefined
        let primaryBrowser  = 'chromium'
        let retries         = 0

        // Worst status wins: a single failing browser makes the whole test fail.
        // Priority: failed(0) > pending(1) > skipped(2) > passed(3)
        const STATUS_RANK: Record<string, number> = { failed: 0, pending: 1, skipped: 2, passed: 3 }

        for (const t of tests) {
          const browser  = ((t.projectName as string | undefined) ?? 'chromium').toLowerCase()
          const results  = (t.results ?? []) as Record<string, unknown>[]
          const last     = results[results.length - 1]
          if (!last) continue

          const rawSt  = (last.status as string | undefined) ?? ''
          const status =
            rawSt === 'passed'   ? 'passed'  :
            rawSt === 'failed'   ? 'failed'  :
            rawSt === 'skipped'  ? 'skipped' :
            rawSt === 'timedOut' ? 'failed'  : 'pending'

          const duration = (last.duration as number | undefined) ?? 0
          const errors   = (last.errors   as Record<string, unknown>[] | undefined) ?? []
          const errorMsg = errors.length > 0
            ? errors.map(e => (e.message as string | undefined) ?? JSON.stringify(e)).join('\n')
            : undefined

          browserResults.push({ browser, status, duration })

          // Always track Chromium as the display browser when present (for icon/badge),
          // but let the WORST status from any browser win (so a Firefox failure surfaces).
          if (browser === 'chromium' || browserResults.length === 1) {
            primaryBrowser = browser
          }
          const rank     = STATUS_RANK[status]     ?? 4
          const prevRank = STATUS_RANK[primaryStatus] ?? 4
          if (browserResults.length === 1 || rank < prevRank) {
            primaryStatus   = status
            primaryDuration = duration
            primaryError    = errorMsg
          }

          retries = Math.max(retries, results.length - 1)
        }

        testMap[descTitle].push({
          id:       `${suiteId}-${specTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`.slice(0, 80),
          title:    specTitle,
          status:   primaryStatus,
          duration: primaryDuration,
          browser:  primaryBrowser,
          error:    primaryError,
          retries:  retries > 0 ? retries : undefined,
          browserResults: browserResults.length > 0 ? browserResults : undefined,
        })
      }
    }

    if (describes.length > 0) {
      for (const desc of describes) processBlock(desc)
    } else {
      processBlock(topSuite)
    }

    for (const [descTitle, tests] of Object.entries(testMap)) {
      if (tests.length === 0) continue
      normalized.push({
        id:    `${suiteId}-${descTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`.slice(0, 80),
        file,
        title: descTitle === '(root)' ? file.replace(/\.spec\.(ts|js)$/, '') : descTitle,
        tests,
      })
    }
  }

  const stats = (raw.stats ?? {}) as Record<string, unknown>
  return {
    suites: normalized,
    stats: {
      total:    ((stats.expected as number) ?? 0) + ((stats.unexpected as number) ?? 0) + ((stats.skipped as number) ?? 0),
      passed:   (stats.expected    as number) ?? 0,
      failed:   (stats.unexpected  as number) ?? 0,
      skipped:  (stats.skipped     as number) ?? 0,
      flaky:    (stats.flaky       as number) ?? 0,
      duration: (stats.duration    as number) ?? 0,
    },
    runAt: (stats.startTime as string | undefined) ?? new Date().toISOString(),
  }
}

/**
 * Read pw-results.json, embed _meta (spec, archivedAt, runLog), and write to RUNS_DIR.
 * Called BEFORE sending [DONE] to avoid the client fetching history too early.
 *
 * @param spec    optional spec identifier shown in the Run History table
 * @param runLog  optional array of streamed log lines captured during the run.
 *                Persisted so the dashboard can re-display logs when a user
 *                clicks an old run in the history table.
 */
async function archiveRun(spec?: string, runLog?: string[]): Promise<string | null> {
  try {
    if (!existsSync(RESULTS_PATH)) {
      console.warn('[archiveRun] skipped — pw-results.json not found at', RESULTS_PATH)
      return null
    }
    await fs.mkdir(RUNS_DIR, { recursive: true })
    const ts  = new Date().toISOString().replace(/[:.]/g, '-')
    const id  = `run-${ts}`
    const raw = JSON.parse(await fs.readFile(RESULTS_PATH, 'utf-8')) as Record<string, unknown>
    // embed lightweight metadata directly in the archive (normalizePwResults ignores unknown keys)
    raw._spec       = spec ?? null
    raw._archivedAt = new Date().toISOString()
    // Cap log size to ~5000 lines to avoid bloating archive files
    if (runLog && runLog.length > 0) raw._runLog = runLog.slice(-5000)
    await fs.writeFile(path.join(RUNS_DIR, `${id}.json`), JSON.stringify(raw))
    console.log(`[archiveRun] ok → runs/${id}.json (${runLog?.length ?? 0} log lines, spec=${spec ?? 'all'})`)
    return id
  } catch (err) {
    console.error('[archiveRun] failed:', err)
    return null
  }
}

// GET /api/playwright/specs — list *.spec.ts files in tests/
app.get('/api/playwright/specs', (_req, res) => {
  try {
    if (!existsSync(TESTS_DIR)) return res.json({ specs: [] })
    const files = readdirSync(TESTS_DIR)
      .filter(f => /\.spec\.(ts|js)$/.test(f))
      .sort()
    res.json({ specs: files })
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) })
  }
})

const NEW_SPEC_TEMPLATE = `import { test, expect } from '@playwright/test'

test.describe('My test suite', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/.*/)
  })
})
`

// GET /api/playwright/file?name=filename.spec.ts — read a spec file
app.get('/api/playwright/file', async (req, res) => {
  const { name } = req.query as { name?: string }
  if (!name || !/\.spec\.(ts|js)$/.test(name))
    return res.status(400).json({ error: 'Invalid filename — must end in .spec.ts or .spec.js' })
  const filePath = path.join(TESTS_DIR, path.basename(name))
  if (!existsSync(filePath)) return res.status(404).json({ error: `File "${name}" not found` })
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    res.json({ name, content })
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) })
  }
})

// PUT /api/playwright/file — overwrite an existing spec file
app.put('/api/playwright/file', async (req, res) => {
  const { name, content } = req.body as { name?: string; content?: string }
  if (!name || !/\.spec\.(ts|js)$/.test(name))
    return res.status(400).json({ error: 'Invalid filename' })
  if (typeof content !== 'string')
    return res.status(400).json({ error: 'content is required' })
  const filePath = path.join(TESTS_DIR, path.basename(name))
  try {
    await fs.writeFile(filePath, content, 'utf-8')
    res.json({ ok: true, name })
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) })
  }
})

// POST /api/playwright/file — create a new spec file (fails if already exists)
app.post('/api/playwright/file', async (req, res) => {
  const { name, content } = req.body as { name?: string; content?: string }
  if (!name || !/\.spec\.(ts|js)$/.test(name))
    return res.status(400).json({ error: 'Filename must end in .spec.ts or .spec.js' })
  const safe     = path.basename(name)
  const filePath = path.join(TESTS_DIR, safe)
  if (existsSync(filePath)) return res.status(409).json({ error: `"${safe}" already exists` })
  try {
    await fs.mkdir(TESTS_DIR, { recursive: true })
    await fs.writeFile(filePath, content ?? NEW_SPEC_TEMPLATE, 'utf-8')
    res.json({ ok: true, name: safe })
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) })
  }
})

// DELETE /api/playwright/file?name=filename.spec.ts — delete a spec file
app.delete('/api/playwright/file', async (req, res) => {
  const { name } = req.query as { name?: string }
  if (!name || !/\.spec\.(ts|js)$/.test(name))
    return res.status(400).json({ error: 'Invalid filename' })
  const filePath = path.join(TESTS_DIR, path.basename(name))
  if (!existsSync(filePath)) return res.status(404).json({ error: `File "${name}" not found` })
  try {
    await fs.unlink(filePath)
    res.json({ ok: true, name })
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) })
  }
})

// GET /api/playwright/results — read + normalize pw-results.json
app.get('/api/playwright/results', async (_req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  try {
    if (!existsSync(RESULTS_PATH)) {
      return res.status(404).json({ error: 'No results file found. Run tests first.' })
    }
    const raw = JSON.parse(await fs.readFile(RESULTS_PATH, 'utf-8')) as Record<string, unknown>
    res.json(normalizePwResults(raw))
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) })
  }
})

// GET /api/playwright/history — list all archived runs (newest first, max 30)
app.get('/api/playwright/history', async (_req, res) => {
  // Prevent browser caching so a fresh fetch always returns the latest run list
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  try {
    // NOTE: no auto-seed — if the user cleared history it should stay empty.
    if (!existsSync(RUNS_DIR)) return res.json({ runs: [] })
    const files = (await fs.readdir(RUNS_DIR))
      .filter(f => /^run-.+\.json$/.test(f))
      .sort()
      .reverse()
      .slice(0, 30)

    const runs = (
      await Promise.all(
        files.map(async f => {
          try {
            const raw  = JSON.parse(await fs.readFile(path.join(RUNS_DIR, f), 'utf-8')) as Record<string, unknown>
            const n    = normalizePwResults(raw)
            // Use normalized test counts (same logic as the dashboard) so history
            // totals match the suite list — important for multi-browser runs where
            // Playwright's raw stats.expected counts per-project instead of per-test.
            type NormTest = { status: string }
            type NormSuite = { tests: NormTest[] }
            const allTests = (n.suites as NormSuite[]).flatMap(s => s.tests)
            return {
              id:       f.replace('.json', ''),
              runAt:    n.runAt,
              spec:     (raw._spec as string | null | undefined) ?? null,
              total:    allTests.length,
              passed:   allTests.filter(t => t.status === 'passed').length,
              failed:   allTests.filter(t => t.status === 'failed').length,
              skipped:  allTests.filter(t => t.status === 'skipped').length,
              flaky:    n.stats.flaky,
              duration: n.stats.duration,
            }
          } catch {
            return null
          }
        })
      )
    ).filter(Boolean)
    res.json({ runs })
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) })
  }
})

// GET /api/playwright/results/:runId — fetch a specific archived run
// Returns the normalised result PLUS the optional runLog captured at run time
// so the client can re-display the original stdout in the log panel.
app.get('/api/playwright/results/:runId', async (req, res) => {
  const { runId } = req.params
  // sanitise to prevent path traversal
  const safe     = runId.replace(/[^a-zA-Z0-9_\-]/g, '')
  const filePath = path.join(RUNS_DIR, `${safe}.json`)
  try {
    if (!existsSync(filePath)) return res.status(404).json({ error: `Run "${safe}" not found` })
    const raw      = JSON.parse(await fs.readFile(filePath, 'utf-8')) as Record<string, unknown>
    const result   = normalizePwResults(raw)
    const runLog   = Array.isArray(raw._runLog) ? raw._runLog as string[] : []
    res.json({ ...result, runLog })
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) })
  }
})

// DELETE /api/playwright/history — delete all archived run files
app.delete('/api/playwright/history', async (_req, res) => {
  try {
    if (!existsSync(RUNS_DIR)) return res.json({ ok: true, deleted: 0 })
    const files = (await fs.readdir(RUNS_DIR)).filter(f => /^run-.+\.json$/.test(f))
    await Promise.all(files.map(f => fs.unlink(path.join(RUNS_DIR, f))))
    res.json({ ok: true, deleted: files.length })
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) })
  }
})

// GET /api/playwright/browser-check — verify Chromium binary is installed
app.get('/api/playwright/browser-check', async (_req, res) => {
  try {
    // Dynamically import chromium from the playwright package to get its executable path.
    // We cannot static-import at the top of the file because `playwright` (not @playwright/test)
    // is in dependencies and shares the same browser store.
    const { chromium } = await import('playwright')
    const execPath = chromium.executablePath()
    const exists   = existsSync(execPath)
    res.json({ ok: exists, execPath })
  } catch (err: unknown) {
    res.json({ ok: false, detail: String(err) })
  }
})

// POST /api/playwright/run — spawn Playwright and stream stdout/stderr via SSE
// ─── Artifacts endpoint — lists real screenshot/video/trace files from test-results/ ──
app.get('/api/playwright/artifacts', (_req, res) => {
  const dir = path.join(root, 'test-results')
  try {
    const walk = (d: string, base: string): { name: string; path: string; size: number }[] => {
      if (!existsSync(d)) return []
      return readdirSync(d, { withFileTypes: true }).flatMap(entry => {
        const full     = path.join(d, entry.name)
        const relative = path.join(base, entry.name)
        if (entry.isDirectory()) return walk(full, relative)
        if (/\.(png|webm|zip)$/i.test(entry.name)) {
          try { return [{ name: entry.name, path: relative.replace(/\\/g, '/'), size: statSync(full).size }] }
          catch { return [] }
        }
        return []
      })
    }
    res.json({ artifacts: walk(dir, '') })
  } catch {
    res.json({ artifacts: [] })
  }
})

app.post('/api/playwright/run', async (req, res) => {
  const {
    spec, specs, config,
    // AI credentials for post-run Edi M summary — same shape as /api/run-dynamic-test
    apiKey,
    model         = 'gemini-2.0-flash',
    provider      = 'gemini',
    ollamaBaseUrl = 'http://localhost:11434',
    ollamaModel   = 'llama3.2',
    agentName     = 'Dashboard',
  } = req.body as {
    spec?: string
    specs?: string[]           // multi-run: array of spec filenames
    config?: Record<string, unknown>
    apiKey?:        string
    model?:         string
    provider?:      'gemini' | 'ollama'
    ollamaBaseUrl?: string
    ollamaModel?:   string
    agentName?:     string
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  const send = (data: string) => res.write(`data: ${JSON.stringify(data)}\n\n`)

  // Do NOT pass --reporter here: playwright.config.ts already configures
  // list + html + json (with outputFile: 'test-results/pw-results.json').
  // Overriding on the CLI would give the json reporter no outputFile, causing
  // it to dump raw JSON to stdout (breaking the SSE stream) and leaving
  // pw-results.json stale so archiveRun() always reads the old results.
  const args = ['test']

  // ── Spec filtering via testMatch (cross-platform, no CLI arg escaping) ──────
  // We receive bare filenames (e.g. 'sv-api.spec.ts') from the dashboard.
  //
  // Past approaches using CLI positional args all failed on Windows:
  //   • forward-slash paths  → cmd.exe interprets '/' as switch prefix
  //   • absolute backslash   → unreliable matching inside Playwright
  //
  // Current approach: inject testMatch into PW_RUNTIME_CONFIG.
  //   playwright.config.ts reads rc.testMatch and sets Playwright's testMatch.
  //   The glob '**/sv-api.spec.ts' matches only that file, regardless of OS.
  //   No CLI arg needed — no shell escaping issues.
  const specList = (specs && specs.length > 0) ? specs : (spec ? [spec] : [])

  // Strip any stale 'tests/' prefix, keep basename only
  const cleanName = (s: string) =>
    s.replace(/^tests[\\/]/, '').replace(/^.*[\\/]/, '')
  const bareNames = specList.map(s => cleanName(s))

  // Build the runtime config, injecting testMatch when specific specs are chosen
  const runtimeConfig: Record<string, unknown> = { ...(config ?? {}) }
  if (bareNames.length > 0) {
    // '**/sv-api.spec.ts' matches the file in any directory — OS-independent
    runtimeConfig.testMatch = bareNames.map(s => `**/${s}`)
    send(`[FILTER] spec(s): ${bareNames.join(', ')}`)
  }

  // Test-title filters — passed as CLI flags
  if (typeof config?.grep === 'string' && config.grep.trim())
    args.push(`--grep=${config.grep.trim()}`)
  if (typeof config?.grepInvert === 'string' && config.grepInvert.trim())
    args.push(`--grep-invert=${config.grepInvert.trim()}`)

  // Inject config (including testMatch) into playwright.config.ts via env var
  const env: Record<string, string> = { ...process.env as Record<string, string>, FORCE_COLOR: '0' }
  env.PW_RUNTIME_CONFIG = JSON.stringify(runtimeConfig)

  send(`[INFO] Running: npx playwright ${args.join(' ')}`)
  if (runtimeConfig.baseUrl)  send(`[INFO] baseUrl  → ${runtimeConfig.baseUrl}`)
  if (runtimeConfig.timeout)  send(`[INFO] timeout  → ${runtimeConfig.timeout}ms`)
  if (runtimeConfig.workers)  send(`[INFO] workers  → ${runtimeConfig.workers}`)
  if (runtimeConfig.grep)     send(`[INFO] grep     → ${runtimeConfig.grep}`)
  if (bareNames.length > 0)   send(`[INFO] testMatch → ${(runtimeConfig.testMatch as string[]).join(', ')}`)

  // Archive key: bare filenames joined (clean display in Run History)
  const archiveSpec = bareNames.length > 0 ? bareNames.join(',') : spec

  // ── Remote server warmup ──────────────────────────────────────────────────────
  // Render free-tier sleeps after ~15 min of inactivity.  A single HTTP GET
  // before spawning Playwright wakes the dyno so tests don't cold-start timeout.
  const targetUrl = (runtimeConfig.baseUrl as string | undefined) ?? ''
  if (targetUrl && !/localhost|127\.0\.0\.1/.test(targetUrl)) {
    send(`[INFO] Warming up ${targetUrl} …`)
    try {
      const httpMod = await import(targetUrl.startsWith('https') ? 'https' : 'http')
      await new Promise<void>((resolve, reject) => {
        const req = httpMod.default.get(
          targetUrl,
          (r: { resume: () => void }) => { r.resume(); resolve() }
        )
        req.setTimeout(55_000, () => { req.destroy(); reject(new Error('warmup timeout')) })
        req.on('error', (e: Error) => reject(e))
      })
      send(`[INFO] Server is awake ✓`)
    } catch (err: unknown) {
      send(`[WARN] Warmup failed: ${String(err)} — tests will proceed but may be slow`)
    }
  }

  const child = spawn('npx', ['playwright', ...args], {
    cwd:   root,
    env,
    shell: process.platform === 'win32',
  })

  // Capture log lines so they're (a) persisted with the archived run and
  // (b) available for the AI summary if needed.
  const capturedLog: string[] = []
  const stream = (chunk: Buffer) =>
    chunk.toString().split('\n').filter(Boolean).forEach(line => {
      if (capturedLog.length < 5000) capturedLog.push(line)
      send(line)
    })

  child.stdout.on('data', stream)
  child.stderr.on('data', stream)

  child.on('close', async code => {
    // Archive FIRST so history is ready by the time the client calls fetchHistory().
    // Pass capturedLog so the run page can re-display the stdout next time it's loaded.
    try { await archiveRun(archiveSpec, capturedLog) } catch { /* non-fatal */ }
    send(`[DONE] Finished with exit code ${code ?? 0}`)

    // ── Phase 2: Edi M AI Summary — routed to chat via summary_* SSE events.
    // streamSummary is no-op-safe when credentials are missing; emits a friendly
    // placeholder and a final summary_done. The client decides whether to render.
    await streamSummary(res, { agentName, apiKey, model, provider, ollamaBaseUrl, ollamaModel })
    res.end()
  })

  child.on('error', err => {
    send(`[ERROR] ${err.message}`)
    send('[DONE]')
    res.end()
  })

  req.on('close', () => child.kill())
})

// ─── Dynamic test runner helpers ─────────────────────────────────────────────

/** Edi M's system prompt for post-run QA summaries */
const EDI_M_SUMMARY_SYSTEM =
  'You are Edi M, Team Manager and QA Orchestrator for an elite software testing team. ' +
  'You have just received the results of a Playwright test run executed by one of your specialist agents. ' +
  'Provide an **Executive QA Summary** that is concise, technically precise, and actionable. ' +
  'For EACH failing test:\n' +
  '1. Classify the failure type: Timeout | Assertion | Locator | Network | Error\n' +
  '2. Give a one-sentence root-cause analysis\n' +
  '3. Assign priority: P0 (blocker) | P1 (critical) | P2 (major) | P3 (minor)\n' +
  '4. Provide a ready-to-apply TypeScript fix in a fenced ```typescript block\n\n' +
  'Structure your response with these Markdown sections:\n' +
  '## Run Overview\n## Failure Analysis\n## Recommendations\n## Risk Assessment\n\n' +
  'If all tests passed, celebrate briefly and suggest any coverage improvements. ' +
  'Keep the tone professional and decisive.'

interface DynamicTestBody {
  code?:          string
  agentName?:     string
  // AI credentials for post-run Edi M summary
  apiKey?:        string
  model?:         string
  provider?:      'gemini' | 'ollama'
  ollamaBaseUrl?: string
  ollamaModel?:   string
}

/** Credentials accepted by the streamSummary() helper. */
interface SummaryCreds {
  agentName?:     string
  apiKey?:        string
  model?:         string
  provider?:      'gemini' | 'ollama'
  ollamaBaseUrl?: string
  ollamaModel?:   string
}

/**
 * Shared Phase 2 helper — reads the latest archived pw-results.json, builds the
 * Edi M failure-analysis prompt, and streams the AI's reply to the SSE response
 * using the structured `evt: 'summary_start' | 'summary_chunk' | 'summary_done'`
 * protocol that the dashboard chat panel listens for.
 *
 * Returns when the summary is fully streamed and `summary_done` has been sent.
 * The caller is responsible for `res.end()` after this completes.
 *
 * Safe to call when AI credentials are absent — it emits a friendly placeholder
 * chunk and resolves cleanly.
 */
async function streamSummary(
  res: import('express').Response,
  creds: SummaryCreds,
): Promise<void> {
  const sendEvt = (payload: Record<string, unknown>) =>
    res.write(`data: ${JSON.stringify(payload)}\n\n`)

  if (!existsSync(RESULTS_PATH)) {
    sendEvt({ evt: 'summary_done', failures: [] })
    return
  }

  // Build the failure list and the prompt up front so we can always emit
  // summary_done with structured failure data even if the AI call fails.
  let failures: Array<{ testTitle: string; suiteName: string; error: string; errorType: string }> = []
  let summaryPrompt = ''
  let totals = { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0 }

  try {
    const rawResults  = JSON.parse(await fs.readFile(RESULTS_PATH, 'utf-8')) as Record<string, unknown>
    const normalized  = normalizePwResults(rawResults)
    summaryPrompt     = buildSummaryPrompt(normalized, creds.agentName)
    totals            = {
      total:    normalized.stats.total,
      passed:   normalized.stats.passed,
      failed:   normalized.stats.failed,
      skipped:  normalized.stats.skipped,
      duration: normalized.stats.duration,
    }
    failures = normalized.suites.flatMap(s =>
      (s.tests as Array<{ status: string; title: string; error?: string }>)
        .filter(t => t.status === 'failed')
        .map(t => {
          const err = t.error ?? ''
          const errorType =
            /timeout/i.test(err)                          ? 'Timeout'   :
            /toHave|toBe|toContain|expect/i.test(err)    ? 'Assertion' :
            /locator|strict mode|resolved/i.test(err)    ? 'Locator'   :
            /net::|ERR_|fetch|request/i.test(err)        ? 'Network'   : 'Error'
          return { testTitle: t.title, suiteName: s.title, error: err, errorType }
        }),
    )
  } catch (err) {
    console.error('[streamSummary] failed to read/parse results:', err)
    sendEvt({ evt: 'summary_done', failures: [] })
    return
  }

  sendEvt({ evt: 'summary_start' })

  const {
    apiKey,
    model         = 'gemini-2.0-flash',
    provider      = 'gemini',
    ollamaBaseUrl = 'http://localhost:11434',
    ollamaModel   = 'llama3.2',
  } = creds

  // Guard: skip AI call if no credentials
  if (provider === 'gemini' && !apiKey) {
    sendEvt({ evt: 'summary_chunk', text: '⚠️ No Gemini API key configured — set it in **Settings** to enable AI summaries.\n\nTest run completed. Check the dashboard for full results.' })
    sendEvt({ evt: 'summary_done', failures, ...totals })
    return
  }

  try {
    if (provider === 'ollama') {
      const ollamaMessages = [
        { role: 'system', content: EDI_M_SUMMARY_SYSTEM },
        { role: 'user',   content: summaryPrompt },
      ]
      const ollamaRes = await fetch(`${ollamaBaseUrl}/api/chat`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ model: ollamaModel, messages: ollamaMessages, stream: true }),
        signal:  AbortSignal.timeout(90_000),
      })
      if (!ollamaRes.ok || !ollamaRes.body) throw new Error(`Ollama HTTP ${ollamaRes.status}`)
      const reader  = (ollamaRes.body as ReadableStream<Uint8Array>).getReader()
      const decoder = new TextDecoder()
      let buf = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n'); buf = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const p = JSON.parse(line) as { message?: { content?: string }; done?: boolean }
            if (p.message?.content) sendEvt({ evt: 'summary_chunk', text: p.message.content })
            if (p.done) break
          } catch { /* skip malformed */ }
        }
      }
    } else {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI    = new GoogleGenerativeAI(apiKey!)
      const genModel = genAI.getGenerativeModel({ model, systemInstruction: EDI_M_SUMMARY_SYSTEM })
      const chat     = genModel.startChat({ history: [] })
      const result   = await chat.sendMessageStream([{ text: summaryPrompt }])
      for await (const chunk of result.stream) {
        const text = chunk.text()
        if (text) sendEvt({ evt: 'summary_chunk', text })
      }
    }
  } catch (err: unknown) {
    sendEvt({ evt: 'summary_chunk', text: `\n\n[Summary error: ${String(err)}]` })
  }

  sendEvt({ evt: 'summary_done', failures, ...totals })
}

function buildSummaryPrompt(
  normalized: ReturnType<typeof normalizePwResults>,
  agentName?: string,
): string {
  const { suites, stats } = normalized
  const allTests    = suites.flatMap(s => s.tests)
  const failedTests = allTests.filter(t => (t as { status: string }).status === 'failed')

  const header =
    `## Test Run Results (authored by: ${agentName ?? 'agent'})\n` +
    `- Total: ${stats.total} | Passed: ${stats.passed} | ` +
    `Failed: ${stats.failed} | Skipped: ${stats.skipped}\n` +
    `- Duration: ${(stats.duration / 1000).toFixed(2)}s\n\n`

  if (failedTests.length === 0) {
    return header + '**Result: All tests passed! ✅**\nNo failures to analyse.'
  }

  const details = failedTests.map((t, i) => {
    const typed = t as { id: string; title: string; error?: string; duration: number }
    const suite  = suites.find(s =>
      s.tests.some((st: { id: string }) => st.id === typed.id),
    )
    return (
      `### Failure ${i + 1}: "${typed.title}"\n` +
      `**Suite:** ${suite?.title ?? 'unknown'}\n` +
      `**Error:** ${typed.error ?? 'No error message captured'}\n` +
      `**Duration:** ${typed.duration}ms\n`
    )
  }).join('\n')

  return header + '## Failures\n\n' + details
}

// POST /api/run-dynamic-test — write agent code, run Playwright, then stream
// Edi M's AI summary as a second SSE phase.
//
// SSE event protocol:
//   Phase 1 (test run):   data: "<string>"  — JSON-stringified log lines
//   Phase 2 (AI summary): data: {"evt":"summary_start"}
//                         data: {"evt":"summary_chunk","text":"..."}
//                         data: {"evt":"summary_done","failures":[...]}
app.post('/api/run-dynamic-test', async (req, res) => {
  const {
    code,
    agentName,
    apiKey,
    model         = 'gemini-2.0-flash',
    provider      = 'gemini',
    ollamaBaseUrl = 'http://localhost:11434',
    ollamaModel   = 'llama3.2',
  } = req.body as DynamicTestBody

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  /** Send a plain log-line string (phase 1) */
  const sendStr = (data: string) => res.write(`data: ${JSON.stringify(data)}\n\n`)
  /** Send a structured summary event (phase 2) */
  const sendEvt = (payload: Record<string, unknown>) =>
    res.write(`data: ${JSON.stringify(payload)}\n\n`)

  if (!code?.trim()) {
    sendStr('[ERROR] No test code provided')
    sendStr('[DONE] Finished with exit code 1')
    res.end()
    return
  }

  const tmpFile    = path.join(root, 'tests', '_dynamic_agent_test.spec.ts')
  const authorLine = `// Auto-generated by ${agentName ?? 'agent'} — ${new Date().toISOString()}\n`

  try {
    await fs.writeFile(tmpFile, authorLine + code, 'utf-8')
    sendStr(`[INFO] Dynamic spec written by ${agentName ?? 'agent'}`)
    sendStr('[INFO] Running: npx playwright test _dynamic_agent_test.spec.ts')
  } catch (err: unknown) {
    sendStr(`[ERROR] Failed to write test file: ${String(err)}`)
    sendStr('[DONE] Finished with exit code 1')
    res.end()
    return
  }

  const env: Record<string, string> = {
    ...(process.env as Record<string, string>),
    FORCE_COLOR: '0',
    PW_RUNTIME_CONFIG: JSON.stringify({ testMatch: ['**/_dynamic_agent_test.spec.ts'] }),
  }

  const child = spawn('npx', ['playwright', 'test'], {
    cwd:   root,
    env,
    shell: process.platform === 'win32',
  })

  // Capture every log line so we can persist them with the archived run.
  // Bounded to ~5000 to match archiveRun's slice — protects against runaway
  // logs from misbehaving tests.
  const capturedLog: string[] = []
  const streamLine = (chunk: Buffer) =>
    chunk.toString().split('\n').filter(Boolean).forEach(line => {
      if (capturedLog.length < 5000) capturedLog.push(line)
      sendStr(line)
    })

  child.stdout.on('data', streamLine)
  child.stderr.on('data', streamLine)

  child.on('close', async exitCode => {
    // Archive run first (with captured log), then clean up temp file
    try { await archiveRun(`agent:${agentName ?? 'dynamic'}`, capturedLog) } catch { /* non-fatal */ }
    try { await fs.unlink(tmpFile) } catch { /* non-fatal */ }

    sendStr(`[DONE] Finished with exit code ${exitCode ?? 0}`)

    // ── Phase 2: Edi M AI Summary (shared helper) ────────────────────────────
    await streamSummary(res, { agentName, apiKey, model, provider, ollamaBaseUrl, ollamaModel })
    res.end()
  })

  child.on('error', err => {
    sendStr(`[ERROR] ${err.message}`)
    sendStr('[DONE] Finished with exit code 1')
    sendEvt({ evt: 'summary_done', failures: [] })
    res.end()
  })

  req.on('close', () => child.kill())
})

app.listen(PORT, () => {
  console.log(`[open-qa server] listening on http://localhost:${PORT}`)
  if (USE_MOCK) {
    console.log('[open-qa server] MOCK mode — set ANTHROPIC_API_KEY in .env for live Claude calls')
  }
})
