import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function run(cmd, envVars = {}) {
  console.log(`\n> Running: ${cmd}`);
  execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...envVars } });
}

run('npx tsx src/agents/self-healing.ts', { HEADLESS: 'true' });
run('npx tsx src/skills/generate-test-data.ts');
run('npx tsx src/skills/log-analyzer.ts');

const genPath = path.resolve('output/generated-edge-cases.json');
const reportPath = path.resolve('output/AI_BUG_REPORT.md');

for (const file of [genPath, reportPath]) {
  if (!fs.existsSync(file)) {
    console.error('Missing output file:', file);
    process.exit(1);
  }
}

console.log('\n✅ All demos executed and outputs verified.');
