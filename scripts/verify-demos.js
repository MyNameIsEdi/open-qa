import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function run(cmd, envVars = {}) {
  console.log(`\n> Running: ${cmd}`);
  execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...envVars } });
}

run('npx tsx 01-Self-Healing-Tests/src/auto-locator.ts', { HEADLESS: 'true' });
run('npx tsx 02-Smart-Data-Gen/src/generate-test-data.ts');
run('npx tsx 03-Automated-Bug-Report/src/log-analyzer.ts');

const genPath = path.resolve('02-Smart-Data-Gen/output/generated-edge-cases.json');
const reportPath = path.resolve('03-Automated-Bug-Report/output/AI_BUG_REPORT.md');

for (const file of [genPath, reportPath]) {
  if (!fs.existsSync(file)) {
    console.error('Missing output file:', file);
    process.exit(1);
  }
}

console.log('\n✅ All demos executed and outputs verified.');
