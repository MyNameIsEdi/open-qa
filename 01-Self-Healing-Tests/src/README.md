# 🚑 AI Self-Healing Locator Engine

Brittle UI selectors are the number one cause of flaky tests. This proof-of-concept demonstrates how to integrate **Playwright** with the **Claude API** to create tests that automatically heal themselves during runtime.

### How it works:
1. The script attempts to interact with an element using a hardcoded, outdated CSS selector.
2. When Playwright throws a `TimeoutError`, the `catch` block intercepts the failure.
3. The script extracts the current DOM (`page.innerHTML()`) and passes it to the LLM along with the user's *intent* (e.g., "The button used to complete the order").
4. The LLM acts as a QA engineer, analyzes the DOM, and returns the newly updated selector.
5. The script retries the action dynamically, successfully completing the test without manual intervention.

### To Run:
Make sure your `.env` is set up with `ANTHROPIC_API_KEY`.
```bash
npx tsx src/self-healing.ts
