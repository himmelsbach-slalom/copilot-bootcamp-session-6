# UI Contract: TodoCard Component — Overdue Indicator

**Phase**: 1 — Design
**Branch**: `001-overdue-todo-highlight`
**Date**: 2026-03-19

---

## Scope

This contract documents the observable UI behavior of the `TodoCard` component as it relates to the overdue indicator. It defines what the DOM must look like in verifiable, testable terms — the contract used by `TodoCard.test.js`.

No new public props are added. Overdue status is computed internally from the existing `todo` prop.

---

## Component: `TodoCard`

### Props (unchanged)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `todo` | object | yes | The todo item (see fields below) |
| `todo.id` | integer | yes | Unique identifier |
| `todo.title` | string | yes | Display title |
| `todo.dueDate` | string \| null | no | ISO date `YYYY-MM-DD`; null = no due date |
| `todo.completed` | 0 \| 1 | yes | 0 = incomplete, 1 = complete |
| `onToggle` | function | yes | Called with `todo.id` on checkbox change |
| `onEdit` | function | yes | Called with `(id, title, dueDate)` on save |
| `onDelete` | function | yes | Called with `todo.id` on confirmed delete |
| `isLoading` | boolean | yes | Disables interactive elements during async ops |

*No new props are introduced by this feature.*

---

## Overdue Indicator: Observable DOM Contract

### When the todo IS overdue (dueDate < today, completed = 0)

| Observable | Expected Value |
|-----------|---------------|
| Card root `className` | Contains `"overdue"` (e.g., `"todo-card overdue"`) |
| Card root CSS | `border-left: 4px solid var(--danger-color)` (applied via `.todo-card.overdue`) |
| "Overdue" badge element | `<span class="overdue-badge">` is present in the DOM |
| Badge text content | Includes the word `"Overdue"` (case-insensitive match acceptable) |
| Badge location | Inside `<p class="todo-due-date">` — same element as the formatted due date |
| `aria-label` on badge | None required (text content is the accessible label) |

**Test assertion example**:
```js
expect(container.querySelector('.todo-card')).toHaveClass('overdue');
expect(screen.getByText(/Overdue/i)).toBeInTheDocument();
```

---

### When the todo is NOT overdue (any of: no dueDate, dueDate ≥ today, completed = 1)

| Observable | Expected Value |
|-----------|---------------|
| Card root `className` | Does NOT contain `"overdue"` |
| Card root CSS | No Danger-colored left border |
| "Overdue" badge element | NOT present in the DOM |

**Test assertion example**:
```js
expect(container.querySelector('.todo-card')).not.toHaveClass('overdue');
expect(screen.queryByText(/Overdue/i)).not.toBeInTheDocument();
```

---

## CSS Class Definitions

### `.todo-card.overdue` (in `App.css`)

```css
.todo-card.overdue {
  border-left: 4px solid var(--danger-color);
}
```

### `.overdue-badge` (in `App.css`)

```css
.overdue-badge {
  color: var(--danger-color);
  font-weight: 600;
  font-size: 12px;
}
```

Both classes use `var(--danger-color)`, which resolves automatically to:
- Light mode: `#c62828`
- Dark mode: `#ef5350`

---

## Scenarios Covered by Contract

| Scenario | Input | Expected indicator |
|----------|-------|-------------------|
| Future due date, incomplete | `dueDate = "2099-01-01"`, `completed = 0` | None |
| Today's date, incomplete | `dueDate = <today>`, `completed = 0` | None |
| Past due date, incomplete | `dueDate = "2020-01-01"`, `completed = 0` | YES |
| Past due date, complete | `dueDate = "2020-01-01"`, `completed = 1` | None |
| No due date, incomplete | `dueDate = null`, `completed = 0` | None |
| Past due → mark complete | Toggle `completed` from 0 to 1 | indicator removed |
| Complete → mark incomplete | Toggle `completed` from 1 to 0 | indicator appears |
| Past due → edit to future | Change `dueDate` to future | indicator removed |
| Future due → edit to past | Change `dueDate` to past | indicator appears |
