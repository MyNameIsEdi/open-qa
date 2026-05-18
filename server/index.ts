import express from 'express'
import cors from 'cors'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { fileURLToPath } from 'url'
import path from 'path'

const execFileAsync = promisify(execFile)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const app = express()
app.use(cors())
app.use(express.json())

const PORT = 3001

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
  res.json({ status: 'ok', project: 'open-qa' })
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

app.listen(PORT, () => {
  console.log(`[open-qa server] listening on http://localhost:${PORT}`)
})
