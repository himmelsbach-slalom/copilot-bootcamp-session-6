# Quickstart: Overdue Todo Highlight Feature

**Branch**: `001-overdue-todo-highlight`
**Date**: 2026-03-19

---

## What Gets Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `packages/frontend/src/components/TodoCard.js` | Modify | Add `getTodayLocalDateString()` + `isOverdue()` helpers; apply `.overdue` class; render `<span class="overdue-badge">` |
| `packages/frontend/src/App.css` | Modify | Add `.todo-card.overdue` and `.overdue-badge` CSS rules |
| `packages/frontend/src/components/__tests__/TodoCard.test.js` | Modify | Add test cases for all overdue indicator scenarios |

**No backend changes. No new dependencies. No new files.**

---

## Running the App

```bash
# From the repo root — starts both frontend and backend
npm run start

# Frontend only (port 3000)
cd packages/frontend && npm start

# Backend only (port 3001 or configured port)
cd packages/backend && npm start
```

To verify the feature manually:
1. Open `http://localhost:3000` in the browser.
2. Create a todo with a due date set to **yesterday or earlier** (leave it incomplete) — the card should show a red left border and an inline "Overdue" badge next to the date.
3. Create a todo with a due date set to **today or tomorrow** — no overdue indicator should appear.
4. Mark the overdue todo as complete — the indicator should disappear immediately.
5. Toggle dark mode — both the border and badge should switch to the dark-mode Danger color (`#ef5350`).

---

## Running Tests

```bash
# All frontend tests with coverage report
cd packages/frontend && npm test

# Watch mode (reruns on file save)
cd packages/frontend && npm run test:watch

# From root (all packages)
npm test
```

Coverage target: **≥80%** across all packages (enforced by constitution Principle II).

---

## Key Design Decisions (quick reference)

| Decision | Choice | Reason |
|----------|--------|--------|
| Date comparison | Day-level, local calendar date | User's local date; no time component |
| `today` injection | Default parameter `today = getTodayLocalDateString()` | Enables pure-function testing without Date mocking |
| Badge placement | Inline `<span>` inside `<p class="todo-due-date">` | Same line as due date; not above/below |
| CSS token | `var(--danger-color)` | Existing token; auto-resolves for light/dark mode |
| List ordering | Unchanged (insertion order) | No reordering or grouping introduced |

---

## Testing a Specific Scenario

To test the overdue helper in isolation (recommended for TDD):

```js
import { isOverdue } from '../TodoCard'; // only if exported; otherwise test via render
// Or test the rendered component with a fixed 'today':

const pastTodo = { id: 1, title: 'Old task', dueDate: '2020-01-01', completed: 0 };
// Render TodoCard and assert '.overdue' class and 'Overdue' text appear
```

The `isOverdue` helper accepts an optional `today` string argument (`YYYY-MM-DD`) so tests can fix the reference date without mocking `Date`:

```js
// Internal to TodoCard.js:
isOverdue({ dueDate: '2020-01-01', completed: 0 }, '2026-03-19') // → true
isOverdue({ dueDate: '2026-03-19', completed: 0 }, '2026-03-19') // → false (today = not overdue)
isOverdue({ dueDate: '2020-01-01', completed: 1 }, '2026-03-19') // → false (completed)
isOverdue({ dueDate: null,         completed: 0 }, '2026-03-19') // → false (no due date)
```
