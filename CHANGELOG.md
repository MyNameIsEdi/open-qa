# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- **Multi-agent collaboration loop** in `/api/qa-agent` — when 2+ agents are
  tagged or the Edi M manager is mentioned, requests now run as a primary
  draft → critic review → primary refine → manager synthesis sequence. New
  SSE events `turn_start | turn_done | turn_verdict` stream each turn into
  its own chat bubble so the user sees the full back-and-forth
  (`server/index.ts`, `ui/src/pages/PlaywrightDashboard.tsx`).
- **Per-run log persistence** — `archiveRun()` now saves up to 5000 stdout
  lines into each `test-results/runs/run-*.json`. Clicking an old run in the
  history table re-hydrates the log panel with the original output
  (`server/index.ts`, `ui/src/pages/PlaywrightDashboard.tsx`).
- **Edi M AI summary for every Run Tests** — `/api/playwright/run` now
  emits the same `summary_start | summary_chunk | summary_done` SSE protocol
  as `/api/run-dynamic-test`, so the dashboard's main Run button delivers
  a root-cause analysis to chat (not just agent-generated dynamic runs).
  Shared `streamSummary()` helper extracted on the server
  (`server/index.ts`, `ui/src/pages/PlaywrightDashboard.tsx`).
- Enterprise folder layout: `src/agents`, `src/skills`, `src/core`, `docs/` (GitHub Pages), root `output/`.

### Changed

- **Playwright Dashboard UI/UX upgrades** (`ui/src/pages/PlaywrightDashboard.tsx`):
  - Header KPI block redesigned with visual hierarchy — large "Run Health"
    hero card with progress ring + verdict text + inline stack bar, plus
    3 secondary tiles (Total / Failed / Duration) with sub-labels.
  - Subtitle row replaced inline `·`-separated text with discrete pill
    badges (suites · tests · duration · last run · loading).
  - Run-history chart now shows a styled hover tooltip with full
    breakdown, a moving-average pass-rate trend line overlay, and a
    "latest run" pin on the newest bar.
  - Suite headers stick to the navbar while scrolling expanded suites;
    chevron icons rotate smoothly instead of swapping; failed-test error
    blocks gained a header strip with error type chip + Copy button and
    a scrollable monospace body.
  - Chat message bubbles now render a colour-coded role pill (blue =
    primary draft, amber = critic review, emerald = final synthesis) for
    each multi-agent collaboration turn.
- **QA Office sidebar canvas cropped to content area** — wraps
  `OfficeCanvas` in an `aspectRatio: 21/12` + `overflow: hidden`
  container with the canvas anchored to the bottom, eliminating the ~45%
  empty "blue void" caused by the 10 unused top rows in
  `default-layout-1.json`. Localised CSS-only fix; OfficePage and the
  layout JSON are untouched (`ui/src/pages/PlaywrightDashboard.tsx`).
- `archiveRun()` now logs success/failure to the console — silent
  archive failures are no longer invisible.
- Migrated AI logic from numbered demo folders into `src/`; shared LLM client at `src/core/llm-client.ts`.
- Moved marketplace HTML to `docs/` with `css/` and `js/` assets; updated all script paths and README links.

### Changed

- Migrated AI logic from numbered demo folders into `src/`; shared LLM client at `src/core/llm-client.ts`.
- Moved marketplace HTML to `docs/` with `css/` and `js/` assets; updated all script paths and README links.

### Removed

- Deleted legacy folders `01-Self-Healing-Tests`, `02-Smart-Data-Gen`, `03-Automated-Bug-Report`, `04-AI-Agents-QA`, `05-Visual-Regression`, and `lib/`.

### Previously added

- Expanded marketplace: 6 agents, 5 skills, 6 prompts across `agents.html`, `skills.html`, `prompts.html`.
- New system prompts in README: BDD Master, Strict SDET PR Reviewer, API Contract Enforcer.
- Agent/Skill catalog tables and `badge-planned` status styling.

### Changed

- Refactored `index.html` into multi-page UI: `index.html`, `agents.html`, `skills.html`, `prompts.html` with shared nav and `css/site.css` + `js/site.js`.
- Consolidated documentation into master `README.md` with collapsible `<details>` sections for prompts and contributing guidelines.
- Removed redundant `CONTRIBUTING.md`, `MARKETPLACE.md`, `claude-projects/Test-Plan-Generator.md`, `claude-projects/PRD-Analyzer.md`, and `02-Smart-Data-Gen/claude-data-gen.md`.

## [1.0.0] - 2026-05-17

### Added

- Added professional README and usage/docs guidance.
- Added `CONTRIBUTING.md` with contributor and release process guidance.
- Added CI workflow to run demos and validation scripts.
- Added mock fallback mode for self-healing, data generation, and bug-report scripts.
- Added lightweight test harness and TypeScript type checking (`tsconfig.json`).
- Polished marketplace UI in `index.html` with live demo cards and copy button support.

### Changed

- Updated `package.json` with `verify:demos`, `test`, and `typecheck` scripts.
- Added `scripts/verify-demos.js` to centralize demo verification logic.
- Refactored core demo modules to export testable helper functions.
