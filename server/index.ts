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

          if (browser === 'chromium' || browserResults.length === 1) {
            primaryStatus   = status
            primaryDuration = duration
            primaryError    = errorMsg
            primaryBrowser  = browser
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
 * Read pw-results.json, embed _meta (spec, archivedAt), and write to RUNS_DIR.
 * Called BEFORE sending [DONE] to avoid the client fetching history too early.
 */
async function archiveRun(spec?: string): Promise<string | null> {
  try {
    if (!existsSync(RESULTS_PATH)) return null
    await fs.mkdir(RUNS_DIR, { recursive: true })
    const ts  = new Date().toISOString().replace(/[:.]/g, '-')
    const id  = `run-${ts}`
    const raw = JSON.parse(await fs.readFile(RESULTS_PATH, 'utf-8')) as Record<string, unknown>
    // embed lightweight metadata directly in the archive (normalizePwResults ignores unknown keys)
    raw._spec       = spec ?? null
    raw._archivedAt = new Date().toISOString()
    await fs.writeFile(path.join(RUNS_DIR, `${id}.json`), JSON.stringify(raw))
    return id
  } catch {
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
            return {
              id:   f.replace('.json', ''),
              runAt: n.runAt,
              spec: (raw._spec as string | null | undefined) ?? null,
              ...n.stats,
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
app.get('/api/playwright/results/:runId', async (req, res) => {
  const { runId } = req.params
  // sanitise to prevent path traversal
  const safe     = runId.replace(/[^a-zA-Z0-9_\-]/g, '')
  const filePath = path.join(RUNS_DIR, `${safe}.json`)
  try {
    if (!existsSync(filePath)) return res.status(404).json({ error: `Run "${safe}" not found` })
    const raw = JSON.parse(await fs.readFile(filePath, 'utf-8')) as Record<string, unknown>
    res.json(normalizePwResults(raw))
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

app.post('/api/playwright/run', (req, res) => {
  const { spec, specs, config } = req.body as {
    spec?: string
    specs?: string[]           // multi-run: array of spec filenames
    config?: Record<string, unknown>
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  const send = (data: string) => res.write(`data: ${JSON.stringify(data)}\n\n`)

  const args = ['playwright', 'test', '--reporter=list,json']

  // Multi-spec support — push each spec as a positional argument.
  // Playwright matches positional args as path-substring patterns against
  // the files it discovers in testDir.  Bare filenames work because
  // 'sv-api.spec.ts' is a substring of 'tests/sv-api.spec.ts'.
  // Absolute paths with Windows backslashes do NOT match (different
  // path separator from Playwright's internal forward-slash paths).
  const specList = (specs && specs.length > 0) ? specs : (spec ? [spec] : [])
  for (const s of specList) args.push(s)

  if (specList.length > 0) {
    send(`[FILTER] spec(s): ${specList.join(', ')}`)
  }

  // Test-title filters — passed as CLI flags
  if (typeof config?.grep === 'string' && config.grep.trim())
    args.push(`--grep=${config.grep.trim()}`)
  if (typeof config?.grepInvert === 'string' && config.grepInvert.trim())
    args.push(`--grep-invert=${config.grepInvert.trim()}`)

  // Inject full config into playwright.config.ts via PW_RUNTIME_CONFIG env var
  const env: Record<string, string> = { ...process.env as Record<string, string>, FORCE_COLOR: '0' }
  if (config) env.PW_RUNTIME_CONFIG = JSON.stringify(config)

  send(`[INFO] npx ${args.join(' ')}`)
  if (config?.baseUrl)  send(`[INFO] baseUrl  → ${config.baseUrl}`)
  if (config?.timeout)  send(`[INFO] timeout  → ${config.timeout}ms`)
  if (config?.workers)  send(`[INFO] workers  → ${config.workers}`)
  if (config?.grep)     send(`[INFO] grep     → ${config.grep}`)

  // Archive key: join spec names for multi-run
  const archiveSpec = specList.length === 1 ? specList[0] : (specList.length > 1 ? specList.join(',') : spec)

  const child = spawn('npx', args, {
    cwd: root,
    env,
    shell: process.platform === 'win32',
  })

  const stream = (chunk: Buffer) =>
    chunk.toString().split('\n').filter(Boolean).forEach(line => send(line))

  child.stdout.on('data', stream)
  child.stderr.on('data', stream)

  child.on('close', async code => {
    // Archive FIRST so history is ready by the time the client calls fetchHistory()
    try { await archiveRun(archiveSpec) } catch { /* non-fatal */ }
    send(`[DONE] Finished with exit code ${code ?? 0}`)
    res.end()
  })

  child.on('error', err => {
    send(`[ERROR] ${err.message}`)
    send('[DONE]')
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
