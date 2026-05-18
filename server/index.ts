import express from 'express'
import cors from 'cors'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { fileURLToPath } from 'url'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const execFileAsync = promisify(execFile)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const app = express()
app.use(cors())
app.use(express.json())

const PORT = 3001
const USE_MOCK = !process.env.ANTHROPIC_API_KEY
const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022'

const agentCatalog = [
  { id: 'healing', name: 'Self-Healing Locator', status: 'active', runCommand: 'npx tsx src/agents/self-healing.ts' },
  { id: 'triage', name: 'Automated Bug Triage', status: 'active', runCommand: 'npx tsx src/skills/log-analyzer.ts' },
  { id: 'auto-pom', name: 'Auto-POM Builder', status: 'planned', runCommand: 'npx tsx scripts/auto-pom-builder.ts' },
  { id: 'network-mock', name: 'Network Interceptor & Mock Gen', status: 'planned', runCommand: 'npx tsx scripts/network-mock-gen.ts' },
  { id: 'a11y', name: 'Visual A11y Scanner', status: 'planned', runCommand: 'npx tsx scripts/visual-a11y-scanner.ts' },
  { id: 'chaos', name: 'Chaos Monkey UI', status: 'planned', runCommand: 'npx tsx scripts/chaos-monkey-ui.ts' },
]

const skillCatalog = [
  { id: 'datagen', name: 'Smart Data Gen', status: 'active', runCommand: 'npx tsx src/skills/generate-test-data.ts' },
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

app.listen(PORT, () => {
  console.log(`[open-qa server] listening on http://localhost:${PORT}`)
  if (USE_MOCK) {
    console.log('[open-qa server] MOCK mode — set ANTHROPIC_API_KEY in .env for live Claude calls')
  }
})
