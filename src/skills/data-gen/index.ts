import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { askClaude, USE_MOCK, warnMockMode } from '../../core/llm-client';
import { QA_ENGINEER_SYSTEM_PROMPT, buildEdgeCasePrompt } from './prompts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface EdgeCasePayload {
  scenario_description: string;
  first_name: string;
  last_name: string;
  email: string;
  address: string | null;
  cart_total: number;
  items_count: number;
}

const DEFAULT_SCHEMA = {
  endpoint: 'POST /api/v1/checkout',
  description: 'E-commerce checkout payload',
  fields: {
    scenario_description: 'string',
    first_name: 'string',
    last_name: 'string',
    email: 'string',
    address: 'string | null',
    cart_total: 'number',
    items_count: 'number',
  },
};

const OUTPUT_DIR = path.join(process.cwd(), 'output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'generated-edge-cases.json');
const SCHEMA_FILE = path.join(__dirname, '../schema', 'checkout-api.json');

export function createMockEdgeCaseData(count = 5): EdgeCasePayload[] {
  return Array.from({ length: count }, (_, i) => ({
    scenario_description: `Mock edge case #${i + 1}: SQLi/XSS/boundary mix`,
    first_name: `${'A'.repeat(180)}'; DROP TABLE users;--`,
    last_name: `O'Connor<script>alert('xss-${i}')</script>`,
    email: `qa+edge${i}@example.com`,
    address: i % 2 === 0 ? null : 'רחוב הרצל 12 — RTL & emoji 🛒',
    cart_total: i % 3 === 0 ? -0.01 : 9_999_999.99,
    items_count: i === 4 ? 0 : 1_000_000,
  }));
}

function loadSchemaDescription(): string {
  if (fs.existsSync(SCHEMA_FILE)) {
    return fs.readFileSync(SCHEMA_FILE, 'utf-8');
  }
  return JSON.stringify(DEFAULT_SCHEMA, null, 2);
}

function parsePayloadArray(raw: string): EdgeCasePayload[] {
  const cleaned = raw
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
  const parsed = JSON.parse(cleaned) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error('Claude response is not a JSON array');
  }
  return parsed as EdgeCasePayload[];
}

export async function generateEdgeCaseData(count = 5): Promise<EdgeCasePayload[]> {
  warnMockMode('Smart data generation');
  console.log(`🤖 Generating ${count} edge-case payloads...`);

  const schemaDescription = loadSchemaDescription();
  let testData: EdgeCasePayload[];

  try {
    if (USE_MOCK) {
      testData = createMockEdgeCaseData(count);
    } else {
      const raw = await askClaude({
        system: QA_ENGINEER_SYSTEM_PROMPT,
        prompt: buildEdgeCasePrompt(count, schemaDescription),
        maxTokens: 2000,
        temperature: 0.85,
      });
      testData = parsePayloadArray(raw);
    }

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(testData, null, 2));

    console.log(`✅ Saved ${testData.length} payloads to ${OUTPUT_FILE}`);
    console.log(`   Preview: ${testData[0].scenario_description}`);
    return testData;
  } catch (error) {
    console.error('❌ Error generating test data:', error);
    throw error;
  }
}

const isMain =
  process.argv[1]?.includes('data-gen') || process.argv[1]?.includes('generate-test-data');

if (isMain) {
  generateEdgeCaseData(5).catch(() => process.exit(1));
}
