import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022';

export const USE_MOCK = !process.env.ANTHROPIC_API_KEY;

let client: Anthropic | undefined;

export function getAnthropicClient(): Anthropic | null {
  if (USE_MOCK) {
    return null;
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export function warnMockMode(feature: string): void {
  if (USE_MOCK) {
    console.warn(`⚠️  ANTHROPIC_API_KEY not set — ${feature} running in MOCK mode.`);
  }
}

export async function askClaude(params: {
  system?: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const anthropic = getAnthropicClient();
  if (!anthropic) {
    throw new Error('MOCK_MODE');
  }

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: params.maxTokens ?? 1024,
    temperature: params.temperature ?? 0.2,
    system: params.system,
    messages: [{ role: 'user', content: params.prompt }],
  });

  const block = response.content[0];
  if (block.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }
  return block.text.trim();
}
