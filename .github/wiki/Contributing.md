# Contributing

Contributions are welcome — agents, skills, prompts, UI improvements, tests, docs.

---

## Quick Start

1. **Fork** the repo and clone your fork
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes (keep them small and focused)
4. Run the checks (see below)
5. Open a PR

---

## Running Checks

```bash
npm install
npm run typecheck     # TypeScript (src + ui) — must pass
npm run lint          # ESLint — must pass
npm run format:check  # Prettier — must pass
npm test              # Playwright tests — must pass
npm run ui:build      # React build — must succeed
```

---

## PR Checklist

- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] `npm run ui:build` succeeds
- [ ] `README.md` updated if behavior or UI changed
- [ ] `CHANGELOG.md` entry added (for features and fixes)
- [ ] New agents/skills have a matching card in the correct page (`AgentsPage.tsx` / `SkillsPage.tsx`)

---

## Adding a New Agent

1. Create `src/agents/your-agent.ts` following the pattern in `self-healing.ts`
2. Add a `npm run run:your-agent` script in `package.json`
3. Add an entry to the `agents` array in `ui/src/pages/AgentsPage.tsx`
4. Add the agent to `agentCatalog` in `server/index.ts`
5. Add a wiki entry to `.github/wiki/Agents.md`

## Adding a New Skill

Same pattern as agents but under `src/skills/` and `ui/src/pages/SkillsPage.tsx`.

## Adding a New Prompt

Add an entry to the `prompts` array in `ui/src/pages/PromptsPage.tsx` and `.github/wiki/Prompts.md`.

---

## Release Process

1. Bump `package.json` version following [semver](https://semver.org/)
2. Add a summary to `CHANGELOG.md` under the new version heading
3. Ensure all checks pass
4. Open a PR describing the release scope and notable changes
5. After merge, the `deploy-pages` workflow auto-deploys to GitHub Pages

---

## Code Style

- **TypeScript strict mode** — no `any`, no `ts-ignore`
- **No comments** unless the WHY is non-obvious
- **No unused imports or variables** (enforced by tsc)
- **Prettier** for formatting — run `npm run format` before pushing
- Prefer `getByRole`, `getByLabel`, `getByTestId` in Playwright — no CSS selectors
