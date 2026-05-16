# 🕵️ Automated Triage & Bug Reporter (AI)

In CI/CD environments, triaging failed tests is one of the most time-consuming tasks for a QA Engineer. This module acts as an **AI-powered Triage Assistant**.

### How it works:
1. It simulates catching a raw, messy stack trace from a failed Playwright test (including DOM state and API network failures).
2. It sends the raw log to the **Claude API**.
3. The LLM analyzes the technical context, identifies the root cause (e.g., a button remaining disabled due to a backend 500 error), and formats the output.
4. It generates a professional, Jira-ready `AI_GENERATED_BUG_REPORT.md` file containing Severity, Root Cause Analysis, and Suggested Fixes.

### To Run:
Make sure your `.env` is set up with `ANTHROPIC_API_KEY` in the root folder.
```bash
npx tsx src/log-analyzer.ts
