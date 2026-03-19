# Research: Support for Overdue Todo Items

**Phase**: 0 — Pre-design research
**Branch**: `001-overdue-todo-highlight`
**Date**: 2026-03-19

---

## 1. Local Calendar Date Comparison in JavaScript

**Decision**: Use `new Date()` with local year/month/day components to build a `YYYY-MM-DD` string for today, then compare directly against `todo.dueDate` (which is stored as a `YYYY-MM-DD` string from the HTML `<input type="date">` picker.

**Approach**:
```js
function getTodayLocalDateString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isOverdue(todo) {
  if (!todo.dueDate || todo.completed) return false;
  return todo.dueDate < getTodayLocalDateString();
}
```

**Rationale**:
- `new Date().toISOString().slice(0, 10)` returns the **UTC** date, which can be a different calendar day from the user's local date near midnight. The spec states clearly that "today" is the user's local calendar date.
- ISO string comparison of `YYYY-MM-DD` is lexicographically correct for date ordering, so no date parsing is needed after formatting.
- The helper is a pure function with no side effects — easy to unit test by mocking `Date`.

**Alternatives considered**:
- `new Date().toISOString().slice(0, 10)` — Rejected: returns UTC date, not local date (causes off-by-one errors near midnight for users in non-UTC time zones).
- `new Date().toLocaleDateString('en-CA')` — Returns `YYYY-MM-DD` in local time on most browsers, but `en-CA` locale availability is not guaranteed across all engines. Rejected for portability.
- Storing a `Date` object and calling `.getTime()` — Rejected: introduces time component which the spec explicitly excludes.

---

## 2. CSS Left Border Approach for Overdue Cards

**Decision**: Add a conditional CSS class `.overdue` to the `.todo-card` root `<div>` when the todo is overdue. Define `.todo-card.overdue` in `App.css` with `border-left: 4px solid var(--danger-color)`.

**Approach**:

```jsx
// In TodoCard.js (view render):
const overdue = isOverdue(todo);
<div className={`todo-card${todo.completed ? ' completed' : ''}${overdue ? ' overdue' : ''}`}>
```

```css
/* In App.css */
.todo-card.overdue {
  border-left: 4px solid var(--danger-color);
}
```

**Rationale**:
- `--danger-color` is already defined in `theme.css` for both light (`#c62828`) and dark (`#ef5350`) modes. No new CSS variables are needed.
- Applying the border via a modifier CSS class (`overdue`) is the established pattern in the existing codebase (see `.completed` class on `.todo-card`).
- `border-left` adds a 4px visual accent without changing the card's layout dimensions perceptibly (the card already has a 1px full border; 4px left border is additive and visually noticeable).
- Both light and dark modes are covered automatically by the CSS variable.

**Alternatives considered**:
- Inline `style` prop — Rejected: bypasses the CSS variable system; inconsistent with the rest of the codebase; harder to override in tests.
- Adding a CSS class in `theme.css` — Rejected: `theme.css` contains only token definitions, not component styles. `App.css` is the correct location for component-specific rules.
- Changing `border` (all sides) — Rejected: more visually dominant and may conflict with existing `1px solid var(--border-color)` full border on the card.

---

## 3. Inline "Overdue" Badge Placement

**Decision**: Render the "Overdue" badge as a `<span>` element inside the existing `<p className="todo-due-date">` element, on the same line as the formatted date string.

**Approach**:
```jsx
{todo.dueDate && (
  <p className="todo-due-date">
    Due: {formatDate(todo.dueDate)}
    {overdue && <span className="overdue-badge"> · Overdue</span>}
  </p>
)}
```

```css
/* In App.css */
.overdue-badge {
  color: var(--danger-color);
  font-weight: 600;
  font-size: 12px;  /* caption scale */
}
```

**Rationale**:
- Badge is inline (same `<p>` element), satisfying the explicit requirement "Must be inline. Do not display above or below due date text."
- Using a `<span>` inside the existing `<p>` preserves the card layout — no new DOM containers needed.
- Plain text with `·` separator is readable and avoids icon-only communication (satisfies FR-008 accessibility requirement).
- `font-size: 12px` uses the caption typography scale from `docs/ui-guidelines.md`.
- `color: var(--danger-color)` reuses the existing token; both themes automatically covered.

**Alternatives considered**:
- Adding the badge outside the `<p>` (sibling element) — Rejected: spec explicitly requires inline (same line) placement.
- Using an emoji or icon (e.g., ⚠️) — Rejected: icon-only would violate FR-008 (not colour-alone but also not text-alone guaranteed). Text is unambiguous.
- A pill/tag with background color — Rejected: introduces background color not in current design token set; over-engineered for a caption-level label.

---

## 4. Testing Strategy for Date-Dependent Logic

**Decision**: Mock `Date` using Jest's `jest.spyOn(global, 'Date')` pattern (or `jest.useFakeTimers`) to control "today" during tests, ensuring tests are deterministic regardless of when they run.

**Approach**:
```js
// At top of describe block or in beforeEach:
const RealDate = global.Date;

beforeEach(() => {
  // Fix "today" to 2026-03-19 for all tests
  jest.spyOn(global, 'Date').mockImplementation((...args) => {
    if (args.length === 0) return new RealDate('2026-03-19T12:00:00');
    return new RealDate(...args);
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});
```

Alternatively, extract `isOverdue` into a utility where `today` is passed as an argument (makes testing trivial without Date mocking):
```js
// Pure, injectable signature:
function isOverdue(todo, today = getTodayLocalDateString()) {
  if (!todo.dueDate || todo.completed) return false;
  return todo.dueDate < today;
}
// In tests: isOverdue(todo, '2026-03-19')
```

**Decision (preferred)**: Use the injectable `today` parameter approach. It avoids `Date` mocking complexity entirely and keeps the helper a pure function.

**Rationale**:
- Pure functions are simpler to test than code with implicit global dependencies.
- The default parameter (`today = getTodayLocalDateString()`) means production code needs no changes to the call sites in the component.
- `jest.useFakeTimers` can interfere with other async tests; the injectable pattern avoids this risk.

**Alternatives considered**:
- `jest.useFakeTimers()` — Viable but heavier; affects all timer-based APIs in the test file.
- Hardcoding specific past/future dates in tests without mocking — Fragile; tests would fail when those dates become "today" or "past today".
- Direct `Date` spy — Works but requires careful restore; injectable parameter is cleaner.

---

## 5. Dark Mode Border Compatibility

**Decision**: Use `var(--danger-color)` for both the left border and the badge text, with no additional dark-mode-specific override needed.

**Rationale**:
- `--danger-color` is already set to `#c62828` in `:root` (light) and `#ef5350` in `[data-theme="dark"]` in `theme.css`. The CSS variable automatically resolves to the correct value for the active theme.
- No new CSS rules or tokens are required.
- This was confirmed as the desired approach in Question 5 of the clarification session.

**Alternatives considered**:
- Separate muted border color for dark mode — Rejected by product decision; use existing tokens as-is.

---

## Summary: All NEEDS CLARIFICATION Resolved

| Unknown | Resolution |
|---------|-----------|
| Date comparison granularity | Day-level; local calendar date via `getFullYear/Month/Date()`; injectable `today` parameter for testing |
| Visual treatment specifics | Left border (4px, `--danger-color`) + inline "Overdue" badge (`<span>` in due-date `<p>`) |
| Badge placement | Inline within `<p className="todo-due-date">` — same line, not above/below |
| Dark mode | `--danger-color` token handles both modes automatically; no new tokens |
| List ordering | No reordering; items stay in insertion order |
| CSS extension point | Modifier class `.overdue` on `.todo-card`, defined in `App.css` |
| Testing date dependency | Injectable `today` parameter with default; no Date mocking needed |
