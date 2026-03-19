# Implementation Plan: Support for Overdue Todo Items

**Branch**: `001-overdue-todo-highlight` | **Date**: 2026-03-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-overdue-todo-highlight/spec.md`

## Summary

Add a computed "overdue" visual indicator to each todo card in the React frontend. An item is overdue when it has a due date set, that date is strictly before today's local calendar date, and the item is not marked complete. The indicator consists of a 4px Danger-colored left border plus an inline "Overdue" text badge displayed on the same line as the due date. No backend changes are required.

## Technical Context

**Language/Version**: JavaScript (React 18 / Node.js 16+)
**Primary Dependencies**: React, Express.js (backend unchanged)
**Storage**: N/A — overdue status is computed at render time; no storage changes
**Testing**: Jest + @testing-library/react (frontend); backend untouched
**Target Platform**: Desktop web browser (Chrome/Firefox/Safari/Brave)
**Project Type**: Web application — React SPA frontend + Express REST backend (monorepo)
**Performance Goals**: None — synchronous render-time computation, no async paths
**Constraints**: No page refresh required; local calendar date comparison only (no time component); no backend changes; no new npm dependencies; monorepo structure unchanged
**Scale/Scope**: Single-user application; no pagination or sorting changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Clean Code & Consistency — 2-space indent, camelCase, <100 chars, ESLint | PASS | All new code follows existing conventions |
| II | Test-First Development — tests before implementation, ≥80% coverage | PASS | TodoCard.test.js additions written before implementation code |
| III | Single Responsibility — no scope creep; no features beyond FR-001–FR-009 | PASS | Only `TodoCard.js` and `App.css` change; single pure `isOverdue` helper |
| IV | UI Consistency — 8px grid, `--danger-color` token, both themes | PASS | Reuses existing `--danger-color` CSS variable; no ad-hoc hex values |
| V | Full-Stack Simplicity — React only, no state libraries, monorepo maintained | PASS | Frontend-only change; no new packages; no Redux or additional state |

**Gate result**: ALL PASS — proceed to Phase 0.

*Post-design re-check*: All gates remain PASS after Phase 1 design. The `isOverdue` helper is a pure function (no state), badge is a `<span>` in existing JSX, and border is a single CSS class — no additional abstractions introduced.

## Project Structure

### Documentation (this feature)

```text
specs/001-overdue-todo-highlight/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── todo-card-api.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
packages/frontend/
├── src/
│   ├── components/
│   │   └── TodoCard.js          ← MODIFY: add isOverdue() helper + .overdue CSS class
│   ├── App.css                  ← MODIFY: add .todo-card.overdue styles
│   └── styles/
│       └── theme.css            ← NO CHANGE (--danger-color token already exists)
└── src/components/__tests__/
    └── TodoCard.test.js         ← MODIFY: add overdue indicator tests

packages/backend/                ← NO CHANGES
```

**Structure Decision**: Frontend-only, single-project change within the existing monorepo (web application layout). Only two production files change (`TodoCard.js` and `App.css`) and one test file (`TodoCard.test.js`). No new files in `src/`. No backend files touched.

## Complexity Tracking

> No constitution violations were found. This table is intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
