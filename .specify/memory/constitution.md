<!--
SYNC IMPACT REPORT
==================
Version change: (none) → 1.0.0
Modified principles: N/A — initial ratification from docs/ guidelines
Added sections:
  - Core Principles (5 principles derived from docs/)
  - Technical Stack & Constraints
  - Development Workflow
Removed sections: N/A
Templates reviewed:
  - .specify/templates/plan-template.md ✅ aligned (Constitution Check gate present)
  - .specify/templates/spec-template.md ✅ aligned (FR/user story structure compatible)
  - .specify/templates/tasks-template.md ✅ aligned (test-first task ordering matches Principle II)
Follow-up TODOs: None — all placeholders resolved.
-->

# Copilot Bootcamp Todo App Constitution

## Core Principles

### I. Clean Code & Consistency (NON-NEGOTIABLE)

All code MUST follow the project's established conventions without exception:

- **Indentation**: 2 spaces for all file types (JS, JSON, CSS, Markdown).
- **Naming**: `camelCase` for variables/functions; `PascalCase` for React components and
  classes; `UPPER_SNAKE_CASE` for constants. File names MUST match their exported component name.
- **Line length**: MUST stay under 100 characters for code.
- **Imports**: MUST be ordered — external libraries → internal modules → styles —
  with a blank line separating each group. No circular dependencies.
- **Linting**: All code MUST pass ESLint before merge. Auto-fixable warnings MUST be fixed;
  suppressions require explicit justification in a comment.

> **Rationale**: Consistent style reduces cognitive load during code review and prevents
> entire classes of bugs (e.g., shadowed variables, missing exports).

### II. Test-First Development (NON-NEGOTIABLE)

Tests MUST be written before (or alongside) implementation — never after:

- Tests MUST describe expected behavior before code is written (Red → Green → Refactor).
- Unit and integration tests are REQUIRED; end-to-end tests are out of scope for now.
- **Coverage target**: 80%+ across all packages, tracked via Jest coverage reports.
- Tests MUST be isolated: each test sets up its own data, cleans up after itself, and
  mocks all external dependencies (API calls, timers, etc.).
- Test names MUST describe behavior in plain language (e.g., `"should mark todo as complete
  when checkbox is clicked"`).

> **Rationale**: Untested code is unmaintainable code. The 80% floor prevents coverage
> theater while ensuring critical paths are protected.

### III. Single Responsibility & Minimal Scope

Every module, component, and function MUST have exactly one well-defined responsibility:

- No feature creep: implement only what is specified in the functional requirements.
- YAGNI (You Aren't Gonna Need It) applies — do not build for hypothetical future needs.
- Out-of-scope features (authentication, multi-user, filtering, search, bulk operations,
  recurring todos, mobile optimization) MUST NOT be introduced without an explicit
  constitution amendment.
- Components MUST NOT own logic that belongs to a service layer, and vice versa.

> **Rationale**: Scope discipline keeps the codebase small, understandable, and aligned
> with the bootcamp's teaching goals.

### IV. UI Consistency & Design System Adherence

All UI work MUST conform to the established design system defined in `docs/ui-guidelines.md`:

- **Spacing**: 8px grid system MUST be used for all margins, paddings, and gaps.
- **Color**: Only palette tokens defined in the design system (light and dark mode variants)
  MUST be used — no ad-hoc hex values.
- **Typography**: Font sizes and weights MUST stay within the defined scale
  (28px heading → 12px caption).
- **Theme**: Both light and dark modes MUST be supported; new components MUST handle both.
- **Layout**: Single-column layout with a 600px max-width constraint MUST be maintained.

> **Rationale**: Visual consistency makes the app appear intentional and professional,
> and reduces design decision fatigue during development.

### V. Full-Stack Simplicity

The architecture MUST remain as simple as possible for the defined scope:

- Frontend: React only. No state management libraries (Redux, Zustand, etc.) unless
  explicitly approved.
- Backend: Express.js only. No ORM, no additional frameworks.
- Monorepo: npm workspaces structure MUST be maintained — do not restructure the repo.
- All todo changes MUST persist to the backend immediately (no local-only state as
  a permanent solution).
- No database schema changes beyond basic todo storage are permitted.

> **Rationale**: Simplicity ensures the project remains a useful teaching artifact and
> does not introduce incidental complexity that distracts from the bootcamp objectives.

## Technical Stack & Constraints

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React (with React DOM) | CSS for styling; no CSS-in-JS |
| Backend | Node.js + Express.js | REST API |
| Testing | Jest + @testing-library/react | Both packages |
| Monorepo | npm workspaces | Root `npm run start` / `npm test` |
| Min Node.js | v16 | Min npm v7 |

**Constraints**:

- Single-user application — no authentication or user isolation required.
- Desktop-focused UI — no mobile-specific optimisation required.
- All API state changes MUST be reflected in the UI after persistence (optimistic updates
  are permitted but MUST be reconciled with the server response).

## Development Workflow

- All feature work MUST occur on a dedicated branch (e.g., `feature/<description>`).
- A branch MUST be pushed with upstream set (`git push -u origin <branch>`) before
  opening a pull request.
- Every PR MUST include passing tests and lint checks before merge.
- Constitution compliance MUST be verified in the plan's "Constitution Check" gate before
  implementation begins.
- Any complexity that deviates from the principles MUST be documented in the plan's
  "Complexity Tracking" table with a justification.

## Governance

This constitution supersedes all other practices and documentation in the event of a conflict.
Amendments require:

1. An explicit rationale explaining why the change is necessary.
2. A version bump following semantic versioning rules (MAJOR for breaking/removal,
   MINOR for additions, PATCH for clarifications).
3. Updates to all dependent templates (`.specify/templates/`) to remain consistent.
4. Entry in the next Sync Impact Report.

All pull requests MUST verify compliance with the active version of this constitution.
Complexity MUST be justified — if it cannot be, it MUST be removed.

**Version**: 1.0.0 | **Ratified**: 2026-03-19 | **Last Amended**: 2026-03-19
