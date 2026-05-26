# Agent Contribution Template

Copy this file when proposing a new Open-QA agent. Keep one file per agent so reviewers can understand the agent contract before reading the implementation.

## Agent Name

**Status:** Planned / Active
**Category:** Testing / Security / Performance / Accessibility / Data / CI
**Location:** `src/agents/<agent-name>/index.ts`
**Command:** `npm run run:<agent-name>`

**What it does:** One sentence that explains the agent's job.

## When to Use

- Use this agent when...
- Do not use this agent when...

## Input

| Field       | Type   | Required | Description                               |
| ----------- | ------ | -------- | ----------------------------------------- |
| `targetUrl` | string | Yes      | URL or route the agent should inspect.    |
| `goal`      | string | Yes      | What the user wants the agent to produce. |
| `context`   | string | No       | Extra logs, selectors, errors, or notes.  |

## Output

| Field       | Type   | Description                                              |
| ----------- | ------ | -------------------------------------------------------- |
| `summary`   | string | Short human-readable result.                             |
| `findings`  | array  | Structured issues, recommendations, or generated assets. |
| `artifacts` | array  | File paths, screenshots, reports, or generated code.     |

## How to Run

```bash
npm run run:<agent-name>
```

Example:

```bash
npm run run:visual-a11y -- --url http://localhost:5173
```

## How to Add to Claude

Copy this payload and update the fields for your agent:

```json
{
  "name": "open-qa-agent-name",
  "description": "One-line description of what the agent does.",
  "command": "npm run run:<agent-name>",
  "inputs": {
    "targetUrl": "URL to inspect",
    "goal": "Requested result",
    "context": "Optional supporting notes"
  }
}
```

## Mock Mode

Describe how the agent behaves without a live API key. Agents should stay deterministic in mock mode so contributors and CI can run them without paid credentials.

## Verification

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] Focused command works in mock mode:

```bash
npm run run:<agent-name>
```

## Notes for Reviewers

- Mention any new dependencies.
- Mention any files written to `output/` or `test-results/`.
- Mention any network calls the agent makes.
