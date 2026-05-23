import * as fs from 'fs';
import * as path from 'path';

/**
 * SKILL_TEMPLATE — Example Skill Implementation
 *
 * This is a boilerplate file that shows the recommended structure.
 * Copy this folder and modify:
 * 1. Function names to match your skill
 * 2. Logic to implement your feature
 * 3. Output file name and format
 *
 * Delete this file after implementing your skill.
 */

// Step 1: Define interfaces for your skill's data
interface ExampleInput {
  text: string;
  options?: {
    length?: number;
    uppercase?: boolean;
  };
}

interface ExampleOutput {
  original: string;
  processed: string;
  wordCount: number;
}

// Step 2: Detect mock mode (no API key)
const USE_MOCK = !Boolean(process.env.ANTHROPIC_API_KEY);

// Step 3: Implement helper functions (testable, side-effect-free)

/**
 * Example: Simple text processing function
 * - Pure function (no side effects)
 * - Type-safe inputs/outputs
 * - Works in both mock and real modes
 */
export function processTextMock(input: ExampleInput): ExampleOutput {
  let processed = input.text;

  if (input.options?.uppercase) {
    processed = processed.toUpperCase();
  }

  return {
    original: input.text,
    processed,
    wordCount: processed.split(/\s+/).filter((w) => w.length > 0).length,
  };
}

/**
 * Example: Call Claude for complex analysis
 * - Only called when ANTHROPIC_API_KEY is available
 * - Returns deterministic result based on input
 */
export async function analyzeWithClaude(input: string): Promise<string> {
  if (USE_MOCK) {
    // Mock: return educated guess based on input characteristics
    if (input.length > 100) {
      return 'This is a longer text with multiple concepts.';
    } else {
      return 'This is a short text.';
    }
  }

  // Real mode: Call Claude API
  // const response = await client.messages.create({
  //   model: 'claude-3-5-sonnet-20241022',
  //   max_tokens: 256,
  //   messages: [{ role: 'user', content: input }]
  // });
  // return response.content[0].type === 'text' ? response.content[0].text : '';

  return 'Claude API integration needed';
}

/**
 * Example: Generate mock data for testing
 * - Deterministic output
 * - Useful for demos without real computation
 */
export function generateMockResults(count: number): ExampleOutput[] {
  const results: ExampleOutput[] = [];

  const sampleTexts = [
    'Hello world',
    'This is a longer sample text for processing',
    'Short',
    'Testing the template skill implementation',
  ];

  for (let i = 0; i < count; i++) {
    const text = sampleTexts[i % sampleTexts.length];
    results.push(processTextMock({ text, options: { uppercase: i % 2 === 0 } }));
  }

  return results;
}

/**
 * Example: Create a markdown report
 * - Structured output
 * - Human-readable format
 * - Easy to parse programmatically
 */
export function generateReport(results: ExampleOutput[]): string {
  let markdown = `# Example Skill Report\n\n`;
  markdown += `**Generated:** ${new Date().toISOString()}\n\n`;
  markdown += `## Summary\n\n`;
  markdown += `- Total items processed: ${results.length}\n`;
  markdown += `- Average word count: ${(results.reduce((sum, r) => sum + r.wordCount, 0) / results.length).toFixed(1)}\n\n`;

  markdown += `## Results\n\n`;

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    markdown += `### Item ${i + 1}\n\n`;
    markdown += `- **Original:** ${result.original}\n`;
    markdown += `- **Processed:** ${result.processed}\n`;
    markdown += `- **Word Count:** ${result.wordCount}\n\n`;
  }

  return markdown;
}

/**
 * Main demo function
 * - Orchestrates the skill workflow
 * - Shows how to use helper functions
 * - Generates output file
 */
export async function runDemoTest(): Promise<void> {
  console.log('🎬 Starting example skill demo...\n');

  // Create output directory
  const outputDir = path.join(process.cwd(), 'skill-output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Step 1: Process some inputs
  console.log('📝 Processing inputs...\n');
  const results = generateMockResults(3);

  for (let i = 0; i < results.length; i++) {
    console.log(`Item ${i + 1}: "${results[i].original}" → "${results[i].processed}"`);
    console.log(`  Words: ${results[i].wordCount}\n`);
  }

  // Step 2: Analyze with Claude (optional)
  console.log('🤖 Analyzing with Claude (optional)...\n');
  const analysis = await analyzeWithClaude(results[0].original);
  console.log(`Analysis: ${analysis}\n`);

  // Step 3: Generate report
  console.log('📊 Generating report...\n');
  const report = generateReport(results);

  // Step 4: Save output
  const outputPath = path.join(outputDir, 'EXAMPLE_SKILL_OUTPUT.md');
  fs.writeFileSync(outputPath, report);

  console.log(`✅ Report saved to: ${outputPath}`);
  console.log(`\n📈 Summary:`);
  console.log(`   - Items processed: ${results.length}`);
  console.log(`   - Total words: ${results.reduce((sum, r) => sum + r.wordCount, 0)}`);
}

// Step 4: Entry point (only run when executed directly)
if (process.argv.some((arg) => arg.endsWith('skill.ts'))) {
  runDemoTest().catch(console.error);
}

/**
 * HOW TO ADAPT THIS TEMPLATE:
 *
 * 1. Rename this file to match your skill (e.g., my-skill.ts)
 * 2. Replace ExampleInput/ExampleOutput with your data types
 * 3. Replace processTextMock with your main logic
 * 4. Update analyzeWithClaude to call Claude with your prompt
 * 5. Update generateMockResults with your mock data
 * 6. Update generateReport with your output format
 * 7. Update runDemoTest to orchestrate your workflow
 * 8. Test: npm test && npx tsx XX-Skill-Name/skill.ts
 * 9. Submit PR with updated README.md
 */
