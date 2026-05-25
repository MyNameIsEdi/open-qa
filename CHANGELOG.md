# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- **SQLite run history** — replaces per-run JSON files in `test-results/runs/` with a
  single `better-sqlite3` database (`test-results/runs.db`). `archiveRun()` INSERTs into
  the DB; `/api/playwright/history`, `/api/playwright/results/:runId`, and
  `DELETE /api/playwright/history` all query SQLite directly. No migration of old JSON
  files — DB starts fresh (`server/index.ts`, `package.json`).
- **Expanded DocsView** — grew from 5 to 8 sections: added Authentication (storageState,
  global setup), Visual & A11y (axe-core / `checkA11y`), and CI/CD (GitHub Actions matrix,
  sharding) chapters with runnable code examples (`ui/src/pages/PlaywrightDashboard.tsx`).

### Changed

- **Remove Quick Presets** — deleted `PRESETS` constant, `applyPreset()`, `noPresets` prop,
  and the Zap-icon preset card from the Settings panel to reduce visual clutter
  (`ui/src/pages/PlaywrightDashboard.tsx`).
- **Run Output above Run History** — terminal log panel now renders immediately after the
  Insights row, before the RunsPanel history table, so live output is visible without
  scrolling (`ui/src/pages/PlaywrightDashboard.tsx`).
- **History from SQLite only** — removed all `localStorage` caching of run history
  (`RUN_HISTORY_KEY`, seed-on-mount effect, write-on-change effect) to prevent stale
  pre-migration data surfacing on page load (`ui/src/pages/PlaywrightDashboard.tsx`).

### Fixed

- **Stop button race condition** — added `runAbortRef = useRef<AbortController | null>(null)`
  so the Stop button aborts the active SSE fetch via `runAbortRef.current?.abort()` rather
  than calling `setRunning(false)` directly, which previously left the stream alive and
  killed subsequent runs (`ui/src/pages/PlaywrightDashboard.tsx`).
- **`streamSummary` crash** (`ReferenceError: RUNS_DIR is not defined`) — removed the stale
  `path.join(RUNS_DIR, ...)` reference left over from the JSON-file era; the helper now
  reads `raw_json` directly from SQLite when `creds.runId` is present (`server/index.ts`).

### Added

- **5-card KPI row with sparklines** — replaced the hero-ring + 3-tile KPI
  layout with five uniform stat cards (Total Executions, Passed, Failed, Flaky,
  Success Rate). Each card shows a mini SVG sparkline from the last 8 runs and
  a trend delta badge vs the previous run (`PlaywrightDashboard.tsx`).
- **Failure Reasons donut chart** — new SVG donut + legend that classifies
  current-run failures into UI Text Change, Element Not Found, Timeout, Network
  Error, and Other using the existing `parseErrorType()` function
  (`PlaywrightDashboard.tsx`).
- **Top Failed Tests panel** — ranked list of the 5 most-retried failing tests
  in the current run with error-type badges and a "View all failures →" CTA
  that filters the test list (`PlaywrightDashboard.tsx`).
- **Insights row** — three-column grid below the KPI cards: Executions Over
  Time (HistoryChart), Top Failed Tests, Failure Reasons (`PlaywrightDashboard.tsx`).
- **Real-time live counts during test runs** — stat cards and the Run Health
  hero update live while Phase 1 SSE stdout streams, parsing Playwright's
  ✓/✗ symbols to derive pass/fail counts without server changes. Cards pulse
  and display a "RUNNING" badge during an active run (`PlaywrightDashboard.tsx`).
- **"Last updated: N min ago" indicator** — relative timestamp in the header
  pill row with an inline refresh button; auto-ticks every 60 s
  (`PlaywrightDashboard.tsx`).

### Changed

- **Demo mode removed** — replaced fake `DEMO_SUITES` data with a clean empty
  state ("No test results yet — click Run Tests…") and a server-offline banner.
  The "Demo" toolbar button is gone; all data now comes from real runs
  (`PlaywrightDashboard.tsx`).
- **Run Health hero card** — kept below the 5-card row and upgraded to show
  live counts (passed · failed · remaining) and a spinning arc overlay during
  an active run; progress bar shows running tests in indigo (`PlaywrightDashboard.tsx`).

### Fixed

- **Run history now refreshes immediately on `[DONE]`** — `fetchHistory()` is
  called as soon as the Phase 1 `[DONE]` marker arrives (archive is written
  server-side before `[DONE]`), then again in the `finally` block so history
  always updates even when `fetchResults()` fails or the AI summary is skipped
  (`PlaywrightDashboard.tsx`).

- **Archived run log restored in full** — `setRunLog` no longer truncates
  historical run logs to the last 999 lines when restoring an archived run.
  The `.slice(-999)` cap is now applied only to the live-streaming path,
  where it is needed to bound unbounded SSE output; the archived-run restore
  path sets `data.runLog` directly so all historical context is visible
  (`ui/src/pages/PlaywrightDashboard.tsx`).

### Changed

- **Design system compliance pass on PlaywrightDashboard** — aligns
  `PlaywrightDashboard.tsx` with `DESIGN.md` across all token categories:
  primary brand blue changed from Tailwind `#2563eb` to DESIGN `#1a3a8f`
  throughout all interactive elements (buttons, toggles, active states, focus
  outlines, badges, "latest"/"viewing" chips); success semantic color updated
  from `#10b981` (emerald-500) to DESIGN `#34C759`/`#16A34A`; warning color
  updated from `#fbbf24` to DESIGN `#E8A728`/`#D97706`; hover tooltip
  background corrected to DESIGN tooltip spec `#2D2823`; `StatusBadge`
  `uppercase` transform removed per DESIGN "no uppercase on buttons/chips"
  rule; `StatusIcon` converted to inline `style` so semantic colors use exact
  DESIGN tokens; KPI stack bar, run-history chart bars and legend dots,
  duration bar, and inline stat counts all updated to use DESIGN semantic
  palette (`ui/src/pages/PlaywrightDashboard.tsx`).

- **DocsPage updated for Gemini/Ollama stack** — all nine documentation
  sections rewritten to reflect the current project state: Anthropic/Claude
  references replaced with Gemini/Ollama, directory tree updated, env-var
  section shows dual-provider setup, tech stack table corrected, FAQ updated
  with Gemini key and provider-switching questions, roadmap marks completed
  features (multi-agent collab, Playwright Dashboard, run history, AI
  summaries, Gemini/Ollama switching) as done (`ui/src/pages/DocsPage.tsx`).

### Fixed

- **Prettier formatting** — `DocsPage.tsx` and `PlaywrightDashboard.tsx`
  normalized to `singleQuote: true` (project `.prettierrc`) after
  Windows CRLF line-ending conversion masked the issue locally; both files
  now pass `format:check` on Linux CI (`ui/src/pages/DocsPage.tsx`,
  `ui/src/pages/PlaywrightDashboard.tsx`).

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
