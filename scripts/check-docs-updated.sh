#!/usr/bin/env bash
# check-docs-updated.sh
# Enforces that README.md and CHANGELOG.md are updated whenever core code changes.
#
# Usage (local):  bash scripts/check-docs-updated.sh [base-branch]
# Usage (CI):     called automatically by docs-validation.yml
#
# Exit codes:
#   0 — all good (no code change, or code + docs both updated)
#   1 — core code changed but docs missing

set -euo pipefail

# ── Colour helpers ────────────────────────────────────────────────────────────
RED=$'\033[0;31m'
GREEN=$'\033[0;32m'
YELLOW=$'\033[1;33m'
CYAN=$'\033[0;36m'
BOLD=$'\033[1m'
RESET=$'\033[0m'

info()    { echo "${CYAN}${BOLD}[docs-check]${RESET} $*"; }
success() { echo "${GREEN}${BOLD}[docs-check] ✔${RESET} $*"; }
warn()    { echo "${YELLOW}${BOLD}[docs-check] ⚠${RESET}  $*" >&2; }
fail()    {
  echo "" >&2
  echo "${RED}${BOLD}╔══════════════════════════════════════════════════════════╗${RESET}" >&2
  echo "${RED}${BOLD}║              DOCUMENTATION CHECK FAILED                  ║${RESET}" >&2
  echo "${RED}${BOLD}╚══════════════════════════════════════════════════════════╝${RESET}" >&2
  echo "" >&2
  for line in "$@"; do
    echo "${RED}  ✖  ${line}${RESET}" >&2
  done
  echo "" >&2
  echo "${YELLOW}${BOLD}  How to fix:${RESET}" >&2
  echo "${YELLOW}  1. Update README.md  — describe what changed and why.${RESET}" >&2
  echo "${YELLOW}  2. Update CHANGELOG.md — add an entry under [Unreleased].${RESET}" >&2
  echo "${YELLOW}  3. Commit both files along with your code changes.${RESET}" >&2
  echo "" >&2
}

# ── Resolve base branch ───────────────────────────────────────────────────────
# Priority: explicit arg → GITHUB_BASE_REF (PR) → GITHUB_DEFAULT_BRANCH → main
BASE_BRANCH="${1:-${GITHUB_BASE_REF:-${GITHUB_DEFAULT_BRANCH:-main}}}"

info "Base branch : ${BOLD}${BASE_BRANCH}${RESET}"
info "Current ref : ${BOLD}$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'detached')${RESET}"

# ── Fetch base branch so git diff has something to compare against ────────────
# In CI (shallow clone) we need the base ref to be available locally.
if ! git rev-parse --verify "origin/${BASE_BRANCH}" &>/dev/null 2>&1; then
  info "Fetching origin/${BASE_BRANCH} …"
  git fetch --no-tags --depth=1 origin "${BASE_BRANCH}" 2>/dev/null || {
    warn "Could not fetch origin/${BASE_BRANCH}. Falling back to HEAD~1."
    BASE_BRANCH="HEAD~1"
  }
fi

MERGE_BASE=$(git merge-base HEAD "origin/${BASE_BRANCH}" 2>/dev/null || git merge-base HEAD "${BASE_BRANCH}" 2>/dev/null || echo "HEAD~1")
info "Diff base   : ${BOLD}${MERGE_BASE:0:12}${RESET}"

# ── Collect changed files ─────────────────────────────────────────────────────
CHANGED_FILES=$(git diff --name-only "${MERGE_BASE}" HEAD 2>/dev/null)

if [[ -z "$CHANGED_FILES" ]]; then
  success "No files changed vs ${BASE_BRANCH}. Nothing to validate."
  exit 0
fi

info "Changed files in this diff:"
echo "$CHANGED_FILES" | sed 's/^/    /'
echo ""

# ── Core code directories / files that trigger the doc requirement ─────────────
# Edit this list to match your project layout.
CORE_PATTERNS=(
  "^src/"
  "^server/"
  "^ui/src/"
  "^agents/"
  "^skills/"
)

# ── Docs that MUST be updated when core code changes ─────────────────────────
REQUIRED_DOCS=(
  "README.md"
  "CHANGELOG.md"
)

# ── Check whether any core code was touched ───────────────────────────────────
CODE_CHANGED=false
CHANGED_CODE_FILES=()

while IFS= read -r file; do
  for pattern in "${CORE_PATTERNS[@]}"; do
    if [[ "$file" =~ $pattern ]]; then
      CODE_CHANGED=true
      CHANGED_CODE_FILES+=("$file")
      break
    fi
  done
done <<< "$CHANGED_FILES"

if [[ "$CODE_CHANGED" == "false" ]]; then
  success "No core code directories changed. Documentation check skipped."
  exit 0
fi

info "Core code changes detected (${#CHANGED_CODE_FILES[@]} file(s)):"
for f in "${CHANGED_CODE_FILES[@]}"; do
  echo "    ${YELLOW}~${RESET} $f"
done
echo ""

# ── Enforce doc updates ───────────────────────────────────────────────────────
ERRORS=()

for doc in "${REQUIRED_DOCS[@]}"; do
  if echo "$CHANGED_FILES" | grep -qx "$doc"; then
    success "${doc} is updated. ✔"
  else
    ERRORS+=("${doc} was NOT updated. Core code changed but ${doc} is missing from this diff.")
  fi
done

# ── Result ────────────────────────────────────────────────────────────────────
if [[ ${#ERRORS[@]} -gt 0 ]]; then
  fail "${ERRORS[@]}"
  exit 1
fi

echo ""
success "All documentation checks passed!"
exit 0
