import AgentCard, { AgentDef } from '../components/AgentCard'

const agents: AgentDef[] = [
  {
    name: 'Self-Healing Locator',
    description:
      'When a Playwright test fails because the UI changed, this agent suggests a new getByRole / getByTestId locator from stripped DOM context using Claude.',
    status: 'active',
    runCommand: 'npx tsx src/agents/self-healing.ts',
    systemPrompt:
      'You are a senior Playwright automation engineer. Given a failed locator and a DOM snapshot, suggest the single best alternative locator using getByRole, getByLabel, or getByTestId. Return only the locator string, no explanation.',
    toolSchema: {
      name: 'self_healing_locator',
      description: 'Suggests a new Playwright locator when the current one fails due to UI changes.',
      input_schema: {
        type: 'object',
        properties: {
          failed_locator: { type: 'string', description: 'The locator that failed' },
          dom_snapshot: { type: 'string', description: 'Stripped DOM context around the target element' },
        },
        required: ['failed_locator', 'dom_snapshot'],
      },
    },
  },
  {
    name: 'Automated Bug Triage',
    description:
      'Reads an error log file and writes a Jira-ready Markdown report with root-cause analysis, severity classification, and reproduction steps.',
    status: 'active',
    runCommand: 'npx tsx src/skills/log-analyzer.ts',
    systemPrompt:
      'You are an elite QA engineer. Read the error log and produce a structured bug report: Title, Severity (P0–P3), Summary, Root Cause, Steps to Reproduce, Expected vs Actual, Environment. Output clean Markdown.',
    toolSchema: {
      name: 'automated_bug_triage',
      description: 'Analyzes error logs and generates Jira-ready bug reports.',
      input_schema: {
        type: 'object',
        properties: {
          log_content: { type: 'string', description: 'Raw error log content' },
        },
        required: ['log_content'],
      },
    },
  },
  {
    name: 'Auto-POM Builder',
    description:
      'Crawls a URL, analyzes the page structure, and auto-generates a Playwright Page Object Model class with typed selectors and action methods.',
    status: 'planned',
    runCommand: 'npx tsx scripts/auto-pom-builder.ts --url <url> --out ./pages',
    systemPrompt:
      'You are a Playwright architect. Given a DOM snapshot, generate a complete TypeScript Page Object Model class with getByRole locators and async action methods. Follow POM best practices.',
  },
  {
    name: 'Network Interceptor & Mock Gen',
    description:
      'Analyzes a Playwright network trace and generates MSW/Playwright mock handlers for all captured API endpoints.',
    status: 'planned',
    runCommand: 'npx tsx scripts/network-mock-gen.ts --trace <trace.zip>',
    systemPrompt:
      'You are an API mocking specialist. Given a HAR or Playwright trace, generate Playwright route intercept handlers in TypeScript for every unique API endpoint found.',
  },
  {
    name: 'Visual A11y Scanner',
    description:
      'Screenshots a page, analyzes it with Claude Vision, and produces a WCAG 2.1 AA accessibility report with specific remediation steps.',
    status: 'planned',
    runCommand: 'npx tsx scripts/visual-a11y-scanner.ts --standard WCAG21AA',
    systemPrompt:
      'You are an accessibility expert. Analyze the screenshot and DOM and produce a WCAG 2.1 AA compliance report with specific violation descriptions and code-level fix recommendations.',
  },
  {
    name: 'Chaos Monkey UI',
    description:
      'Randomly interacts with UI elements, captures unexpected errors and console exceptions, and reports all anomalies found during the chaos session.',
    status: 'planned',
    runCommand: 'npx tsx scripts/chaos-monkey-ui.ts --duration 120',
    systemPrompt:
      'You are a chaos engineering agent. After each random UI interaction, evaluate whether any console errors, network failures, or visible anomalies occurred. Document each finding with a screenshot and reproduction path.',
  },
]

export default function AgentsPage() {
  const active = agents.filter((a) => a.status === 'active')
  const planned = agents.filter((a) => a.status === 'planned')

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-up">
      <div className="mb-10">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>
          Autonomous Agents
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {active.length} active · {planned.length} planned. Click "Add to Claude" to copy any agent's config.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <AgentCard key={agent.name} agent={agent} />
        ))}
      </div>
    </div>
  )
}
