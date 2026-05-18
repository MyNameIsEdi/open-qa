import SkillCard, { SkillDef } from '../components/SkillCard'

const skills: SkillDef[] = [
  {
    name: 'Smart Data Gen',
    description:
      'Generates extreme edge-case JSON payloads: SQL injection, XSS strings, nulls, RTL text, emoji, boundary numbers. Perfect for API fuzzing.',
    status: 'active',
    runCommand: 'npx tsx src/skills/generate-test-data.ts',
    systemPrompt:
      'You are an elite Senior QA Data Engineer. Generate JSON test data designed to break systems — SQLi, XSS, nulls, RTL text, emoji, boundary numbers. Return ONLY a raw JSON array. No markdown fences. No commentary.',
    inputSchema: {
      type: 'object',
      properties: {
        target: { type: 'string', description: 'The API field, schema, or URL to generate payloads for' },
        count: { type: 'integer', description: 'Number of payloads to generate', default: 20 },
      },
      required: ['target'],
    },
  },
  {
    name: 'GraphQL Fuzzer',
    description:
      'Takes a GraphQL schema and generates a comprehensive fuzz test suite targeting type mismatches, nested injection, and introspection abuse.',
    status: 'planned',
    runCommand: 'npx tsx scripts/graphql-fuzzer.ts --schema ./api/schema.graphql',
    systemPrompt:
      'You are a GraphQL security researcher. Given a schema, generate a list of malformed queries designed to expose injection vulnerabilities, resolver errors, and excessive data exposure. Return an array of query strings.',
  },
  {
    name: 'K6 Load Profile Gen',
    description:
      'Analyzes a Playwright test file and generates a k6 load test script that mirrors the same user journey at scale.',
    status: 'planned',
    runCommand: 'npx tsx scripts/k6-profile-gen.ts --input ./tests/checkout.spec.ts',
    systemPrompt:
      'You are a performance engineering expert. Convert the provided Playwright test into a k6 load test script with realistic virtual user ramp-up, think times, and scenario stages. Output valid k6 JavaScript.',
  },
  {
    name: 'Regex Log Scraper',
    description:
      'AI-powered log analysis: extracts error patterns, anomaly timestamps, and severity clusters from raw production logs.',
    status: 'planned',
    runCommand: 'npx tsx scripts/regex-log-scraper.ts --file ./logs/production.log',
    systemPrompt:
      'You are a site reliability engineer. Analyze the log file, extract unique error patterns with their frequencies, identify time-based anomaly clusters, and classify each by severity (P0–P3). Return structured JSON.',
  },
  {
    name: 'JWT Manipulator',
    description:
      'Generates a full suite of JWT attack payloads: none algorithm, expired tokens, key confusion, missing claims — for security regression testing.',
    status: 'planned',
    runCommand: 'npx tsx scripts/jwt-manipulator.ts --secret test --out ./fixtures/tokens.json',
    systemPrompt:
      'You are a security testing expert. Generate a JSON array of JWT attack scenario objects, each with a "scenario", "token", and "expected_behavior" field. Cover: none algorithm, expired, invalid signature, wrong audience, missing sub.',
  },
]

export default function SkillsPage() {
  const active = skills.filter((s) => s.status === 'active')
  const planned = skills.filter((s) => s.status === 'planned')

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-up">
      <div className="mb-10">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>
          Testing Skills
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {active.length} active · {planned.length} planned. Composable utilities you can import into any test framework.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <SkillCard key={skill.name} skill={skill} />
        ))}
      </div>
    </div>
  )
}
