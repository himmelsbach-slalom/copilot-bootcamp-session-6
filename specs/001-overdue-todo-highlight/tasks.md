# Tasks: Support for Overdue Todo Items

**Feature**: 001-overdue-todo-highlight
**Input**: Design documents from `/specs/001-overdue-todo-highlight/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/todo-card-api.md ✓, quickstart.md ✓

**Organization**: Tasks grouped by user story to enable independent implementation and testing of each story. TDD order enforced — tests are written first and must fail before implementation begins (Constitution Principle II).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (operates on a different file, no dependency on incomplete tasks)
- **[Story]**: User story label (US1, US2, US3)
- All paths are relative to the monorepo root

---

## Phase 1: Setup

**Purpose**: Modification-only feature — no new project initialization is required. One verification step to confirm the required CSS design token is available before writing any code.

- [X] T001 Confirm `--danger-color` is defined in both `:root` (light) and `[data-theme="dark"]` (dark) blocks in `packages/frontend/src/styles/theme.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No shared infrastructure changes are needed. All three user stories are served by the same render-time computation in `TodoCard.js`. There are no database, API, or architectural changes. Proceed directly to Phase 3.

*(No tasks — Phase 1 verification is sufficient.)*

---

## Phase 3: User Story 1 — Visual Overdue Indicator on Todo Items (Priority: P1) 🎯 MVP

**Goal**: An incomplete todo whose `dueDate` is strictly before today's local calendar date displays a 4px Danger-colored left border and an inline "Overdue" text badge next to the due date. Todos that are complete, undated, today-due, or future-due show no indicator.

**Independent Test**: Render two TodoCards side-by-side — one with `dueDate: "2020-01-01"` and `completed: 0` (past, incomplete), one with `dueDate: "2099-12-31"` and `completed: 0` (future, incomplete). Verify the past-due card has class `overdue` on its root `<div>` and the text "Overdue" is visible inline with the date. Verify the future-due card has neither.

### Tests for User Story 1

> ⚠️ **Write these tests FIRST. Confirm they FAIL before writing any implementation code (Constitution Principle II — Test-First Development).**

- [X] T002 [US1] Add the following failing test cases to `packages/frontend/src/components/__tests__/TodoCard.test.js`: (1) past due date + incomplete → card has class `overdue` and text "Overdue" is in the document; (2) future due date + incomplete → no `overdue` class, no "Overdue" text; (3) today's date + incomplete → no `overdue` class, no "Overdue" text; (4) past due date + completed → no `overdue` class, no "Overdue" text; (5) null due date + incomplete → no `overdue` class, no "Overdue" text. Use a fixed `today` string (e.g., `"2026-03-19"`) passed directly to the component's internal helper to avoid Date mocking.

### Implementation for User Story 1

- [X] T003 [P] [US1] Add `getTodayLocalDateString()` (builds `YYYY-MM-DD` from `new Date()` local year/month/date components) and `isOverdue(todo, today = getTodayLocalDateString())` (returns `true` only when `todo.dueDate` is set, `todo.dueDate < today`, and `todo.completed` is falsy) as module-level helper functions before the `TodoCard` function declaration in `packages/frontend/src/components/TodoCard.js`
- [X] T004 [P] [US1] Append the following two CSS rules to `packages/frontend/src/App.css`: `.todo-card.overdue { border-left: 4px solid var(--danger-color); }` and `.overdue-badge { color: var(--danger-color); font-weight: 600; font-size: 12px; }`
- [X] T005 [US1] Update the card root `<div>` in the non-editing return of `packages/frontend/src/components/TodoCard.js` to append `" overdue"` to the className when `isOverdue(todo)` is true (pattern mirrors the existing `" completed"` modifier), and add `{isOverdue(todo) && <span className="overdue-badge"> · Overdue</span>}` inside the `<p className="todo-due-date">` element, after `{formatDate(todo.dueDate)}` (depends on T003)

**Checkpoint**: Run `cd packages/frontend && npm test -- --testPathPattern=TodoCard`. All five US1 test cases must pass. The overdue visual indicator is now fully functional for static rendering.

---

## Phase 4: User Story 2 — Overdue Status Updates Dynamically on Due Date Change (Priority: P2)

**Goal**: When a todo's due date is edited to a past date the overdue indicator appears immediately after re-render; when edited to a future date it disappears immediately. No page refresh is required.

**Independent Test**: Render a `TodoCard` with `dueDate: "2020-01-01"` and `completed: 0`. Re-render it with `dueDate: "2099-12-31"` and verify the `overdue` class and "Overdue" text are gone. Re-render with `dueDate: "2020-01-01"` again and verify both reappear.

### Tests for User Story 2

> ⚠️ **Write these tests BEFORE verifying implementation. If Phase 3 is not yet complete, confirm these fail first.**

- [X] T006 [US2] Add the following test cases to `packages/frontend/src/components/__tests__/TodoCard.test.js`: (1) overdue todo re-rendered with a future due date → `overdue` class and "Overdue" text are removed; (2) non-overdue todo re-rendered with a past due date → `overdue` class and "Overdue" text appear. Use `rerender` from `@testing-library/react` to simulate a prop change without a page reload.

### Implementation Notes for User Story 2

> **No new implementation code required.** `isOverdue()` is computed at render time from `todo.dueDate` and `todo.completed`. When the parent passes an updated `todo` prop after a `onEdit` callback completes, React re-renders `TodoCard` and the helper recomputes the new overdue state automatically. The implementation from Phase 3 (T003–T005) is sufficient.

**Checkpoint**: Run `cd packages/frontend && npm test -- --testPathPattern=TodoCard`. All US1 + US2 test cases must pass.

---

## Phase 5: User Story 3 — Completing an Overdue Todo Clears the Indicator (Priority: P3)

**Goal**: When a user marks an overdue todo as complete the overdue indicator disappears immediately. Unchecking the todo restores the indicator if the due date is still in the past.

**Independent Test**: Render a `TodoCard` with `dueDate: "2020-01-01"` and `completed: 0` (indicator visible). Re-render with `completed: 1` and verify the `overdue` class and "Overdue" text are absent. Re-render with `completed: 0` and verify both reappear.

### Tests for User Story 3

> ⚠️ **Write these tests BEFORE verifying implementation. If Phase 3 is not yet complete, confirm these fail first.**

- [X] T007 [US3] Add the following test cases to `packages/frontend/src/components/__tests__/TodoCard.test.js`: (1) overdue todo (`completed: 0`) re-rendered with `completed: 1` → `overdue` class and "Overdue" text are removed; (2) the same todo re-rendered back to `completed: 0` → `overdue` class and "Overdue" text reappear. Use `rerender` from `@testing-library/react`.

### Implementation Notes for User Story 3

> **No new implementation code required.** `isOverdue()` already returns `false` when `todo.completed` is truthy. Toggling completion triggers a re-render via the `onToggle` callback in the parent, which passes an updated `todo` prop with the new `completed` value. The implementation from Phase 3 (T003–T005) is sufficient.

**Checkpoint**: Run `cd packages/frontend && npm test -- --testPathPattern=TodoCard`. All US1 + US2 + US3 test cases must pass.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final coverage gate and manual quickstart validation across all user stories.

- [X] T008 [P] Run the full frontend test suite with coverage and confirm the ≥80% coverage threshold passes: `cd packages/frontend && npm test -- --coverage`
- [X] T009 Run the quickstart.md manual verification steps against `http://localhost:3000`: create a todo with a past due date (incomplete) → verify red left border and inline "Overdue" badge; create a todo with a future due date → verify no indicator; toggle dark mode → verify Danger color updates on both border and badge; mark the overdue todo complete → verify indicator disappears immediately; unmark it → verify indicator reappears

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — verify immediately
- **Phase 2 (Foundational)**: Empty — skip
- **Phase 3 (US1)**: Depends on Phase 1; write tests (T002) → confirm fail → implement (T003 + T004 in parallel, then T005) → confirm tests pass
- **Phase 4 (US2)**: Depends on Phase 3 completion; add US2 tests (T006) — no new implementation needed
- **Phase 5 (US3)**: Depends on Phase 3 completion; add US3 tests (T007) — no new implementation needed
- **Phase 6 (Polish)**: Depends on Phases 3, 4, and 5 all complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependency on other stories — start immediately after Phase 1
- **User Story 2 (P2)**: Can start after Phase 3 (US1) is complete — implementation is shared
- **User Story 3 (P3)**: Can start after Phase 3 (US1) is complete — implementation is shared; Phases 4 and 5 can proceed in parallel

### Task-Level Dependencies

- **T001**: No dependencies
- **T002**: After T001
- **T003**: After T002 (write implementation once tests are confirmed failing)
- **T004**: After T002, parallel with T003 (different file: `App.css`)
- **T005**: After T003 (same file as T003; needs helper functions present)
- **T006**: After T005 (adds tests that rely on implementation from Phase 3)
- **T007**: After T005, parallel with T006 (both add tests to the same file — if working concurrently, merge carefully)
- **T008**: After T005, T006, T007
- **T009**: After T008

### Parallel Opportunities

- **Phase 3**: T003 (`TodoCard.js` helpers) and T004 (`App.css` rules) can run in parallel — different files, no shared dependencies
- **Phase 4 & 5**: T006 and T007 can run in parallel if implemented by separate agents — both append to `TodoCard.test.js`; merge carefully to avoid conflicts
- **Phase 6**: T008 and T009 can run in parallel — automated coverage check and manual browser verification are independent

---

## Parallel Example: User Story 1 (Core Implementation)

After T002 tests are written and confirmed failing:

```bash
# Terminal 1 — Add isOverdue helpers to TodoCard.js (T003)
# Edit: packages/frontend/src/components/TodoCard.js
# Add getTodayLocalDateString() and isOverdue() above the TodoCard function

# Terminal 2 — Add CSS rules to App.css (T004) — different file, safe to run in parallel
# Edit: packages/frontend/src/App.css
# Append .todo-card.overdue and .overdue-badge rules
```

Then sequentially:

```bash
# Terminal 1 — Update render output in TodoCard.js (T005) — depends on T003
# Edit: packages/frontend/src/components/TodoCard.js
# Update className on card <div> and add <span class="overdue-badge"> inside <p class="todo-due-date">
```

---

## Implementation Strategy

**MVP Scope**: Phase 3 (User Story 1) alone is a shippable MVP. The core visual overdue indicator is delivered in 4 tasks (T001–T005) and is independently verifiable with 5 distinct test cases.

**Incremental Delivery Order**:

1. Phase 1 + Phase 3 → Core overdue indicator implemented, tested, and working in both light and dark mode
2. Phase 4 → Dynamic due date editing behavior verified with test coverage (no code changes)
3. Phase 5 → Completion toggle behavior verified with test coverage (no code changes)
4. Phase 6 → Full coverage threshold confirmed + manual quickstart passed → feature ready to merge

**Total Task Count**: 9 tasks (T001–T009)
