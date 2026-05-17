Usage — Intelligent Testing Toolkit

Quick setup

1. Install dependencies:

```bash
npm install
```

2. Install Playwright browsers (if running examples):

```bash
npx playwright install
```

Running examples

- Self-healing tests (Playwright):

```bash
npm run test -- 01-Self-Healing-Tests/self-healing.ts
```

- Generate test data:

```bash
node 02-Smart-Data-Gen/generate-test-data.ts
```

Notes

- Some features require API keys for LLM providers; set them as environment variables before running agents.
- This repo is a toolkit: review each folder's README for per-agent setup.
