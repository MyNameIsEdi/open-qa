# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
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
