const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd, envVars = {}) {
  console.log(`\n> Running: ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...envVars } });
  } catch (err) {
    console.error(`Command failed: ${cmd}`);
    process.exit(1);
  }
}

// Run demos (self-healing in headless mode)
run('npx tsx "01-Self-Healing-Tests/self-healing.ts"', { HEADLESS: 'true' });
run('npx tsx "02-Smart-Data-Gen/generate-test-data.ts"');
run('npx tsx "03-Automated-Bug-Report/log-analyzer.ts"');

// Verify outputs
const genPath = path.resolve('./generated-edge-cases.json');
const reportPath = path.resolve('./AI_GENERATED_BUG_REPORT.md');

if (!fs.existsSync(genPath)) {
  console.error('Missing output file:', genPath);
  process.exit(1);
}
if (!fs.existsSync(reportPath)) {
  console.error('Missing output file:', reportPath);
  process.exit(1);
}

console.log('\n✅ All demos executed and outputs verified.');
