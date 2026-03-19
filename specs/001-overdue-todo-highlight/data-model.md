# Data Model: Support for Overdue Todo Items

**Phase**: 1 — Design
**Branch**: `001-overdue-todo-highlight`
**Date**: 2026-03-19

---

## Entities

### TodoItem (existing entity — read-only for this feature)

The overdue feature does not modify the TodoItem data model. The existing fields are sufficient.

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| `id` | integer | yes | positive, unique | Primary key (backend) |
| `title` | string | yes | 1–255 characters | Todo description |
| `dueDate` | string \| null | no | ISO date format `YYYY-MM-DD` or null | Set by HTML `<input type="date">`; null = no due date |
| `completed` | integer (0 \| 1) | yes | 0 = incomplete, 1 = complete | Backend stores as integer; frontend treats truthy |
| `createdAt` | ISO datetime string | yes | read-only | Set by backend at creation |

---

### OverdueState (computed, display-only — no storage)

This is not a stored entity. It is a **derived, display-only property** computed at render time in `TodoCard.js`.

**Computation rule**:

```
isOverdue(todo, today) =
  todo.dueDate IS NOT NULL
  AND todo.dueDate < today        (lexicographic string comparison, YYYY-MM-DD)
  AND todo.completed IS falsy     (0 or false)
```

Where `today` is the user's local calendar date in `YYYY-MM-DD` format, derived from `new Date()` using `.getFullYear()`, `.getMonth()`, `.getDate()`.

**State Transitions**:

```
                    ┌──────────────────────────────────┐
                    │ todo.dueDate = null               │
                    │   → isOverdue = false (always)    │
                    └──────────────────────────────────┘

  ┌────────────────────────────────────────────────────────────────┐
  │ todo.dueDate set                                               │
  │                                                                │
  │  ┌─────────────────┐   dueDate moves    ┌──────────────────┐  │
  │  │  NOT overdue    │   to past          │    OVERDUE       │  │
  │  │  (future date   │ ────────────────→  │  (past date,     │  │
  │  │   or today)     │                    │   incomplete)    │  │
  │  └─────────────────┘ ←────────────────  └──────────────────┘  │
  │           ↑            dueDate moves           │               │
  │           │            to future/today         │               │
  │           │                                    │               │
  │           └────────────────────────────────────┘               │
  │                    todo.completed toggles                       │
  │                    (complete → not overdue;                     │
  │                     incomplete + past date → overdue)           │
  └────────────────────────────────────────────────────────────────┘
```

**Validation rules** (from spec):

| Condition | isOverdue result |
|-----------|-----------------|
| `dueDate = null` | `false` — always |
| `dueDate = today` | `false` — today is NOT overdue |
| `dueDate > today` (future) | `false` — not overdue |
| `dueDate < today` AND `completed = 0` | `true` — overdue |
| `dueDate < today` AND `completed = 1` | `false` — completed items are never overdue |

---

## Helper Function Signature

```js
/**
 * Determines if a todo item is overdue.
 * @param {Object} todo - The todo item.
 * @param {string} todo.dueDate - ISO date string (YYYY-MM-DD) or null/undefined.
 * @param {number|boolean} todo.completed - Truthy = complete; falsy = incomplete.
 * @param {string} [today] - Today's date in YYYY-MM-DD format (injected for testability).
 *                           Defaults to the user's current local calendar date.
 * @returns {boolean} true if the todo is overdue, false otherwise.
 */
function isOverdue(todo, today = getTodayLocalDateString()) { ... }
```

**Location**: Defined as a module-level helper inside `packages/frontend/src/components/TodoCard.js`. Not exported — internal to the component file. If needed by other components in the future, it can be extracted to a utility module at that time (YAGNI until then).

---

## Visual Representation of OverdueState

The `isOverdue` boolean maps directly to visual changes on the `TodoCard` component:

| `isOverdue` | CSS class added | Left border | "Overdue" badge |
|-------------|----------------|-------------|-----------------|
| `false` | (none) | `1px solid var(--border-color)` (existing) | hidden |
| `true` | `.overdue` | `4px solid var(--danger-color)` | visible inline with due date |

---

## No Backend Schema Changes

- The overdue feature requires **zero backend changes**.
- No new fields are added to the todo storage model.
- No new API endpoints or parameters are needed.
- The `dueDate` field is already returned by the backend REST API in `YYYY-MM-DD` format.
