#!/usr/bin/env npx tsx
import { execSync } from 'child_process';

const [, , command, ...args] = process.argv;

function run(cmd: string): void {
  execSync(cmd, { stdio: 'inherit' });
}

function printHelp(): void {
  console.log(`
  open-qa — AI-powered QA toolkit

  Usage:
    open-qa <command> [options]

  Commands:
    start              Start the dev server (UI + API on localhost)
    explore <url>      Crawl a URL and generate an AI QA report
    heal               Run the self-healing locator agent
    help               Show this help message

  Examples:
    open-qa start
    open-qa explore https://example.com
    open-qa heal

  Tip: Set ANTHROPIC_API_KEY in .env to enable live Claude — otherwise
       agents run in MOCK mode automatically.
`);
}

switch (command) {
  case 'start':
    run('npm run dev');
    break;

  case 'explore': {
    const url = args[0];
    if (!url) {
      console.error('  Error: explore requires a URL argument.\n  Usage: open-qa explore <url>');
      process.exit(1);
    }
    run(`npm run explore -- ${url}`);
    break;
  }

  case 'heal':
    run('npm run heal');
    break;

  case 'help':
  case undefined:
    printHelp();
    break;

  default:
    console.error(`  Unknown command: "${command}"\n  Run "open-qa help" for usage.`);
    process.exit(1);
}
