# Feature Specification: Support for Overdue Todo Items

**Feature Branch**: `001-overdue-todo-highlight`  
**Created**: 2026-03-19  
**Status**: Draft  
**Input**: Users need a clear, visual way to identify which todos have not been completed by their due date, so they can prioritize work and quickly see which tasks are past their due date.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visual Overdue Indicator on Todo Items (Priority: P1)

A user opens their todo list and immediately sees which items are overdue — that is, items that have a due date set in the past and are not yet marked as complete. Overdue items are visually distinct from on-time or undated items, without the user having to read and mentally compare individual dates.

**Why this priority**: This is the core value of the feature. Everything else is secondary to a user being able to glance at the list and spot overdue tasks instantly. Without this, the feature does not exist.

**Independent Test**: Create two todos — one with a due date in the past (incomplete) and one with a future due date (incomplete). Open the todo list and verify the past-due item displays a distinct visual indicator, while the future-due item does not.

**Acceptance Scenarios**:

1. **Given** a todo with a due date that has already passed and a completion status of incomplete, **When** the user views the todo list, **Then** that todo is displayed with a clear visual indicator distinguishing it as overdue (e.g., a distinct colour, label, or icon).
2. **Given** a todo with a due date in the future, **When** the user views the todo list, **Then** no overdue indicator is shown on that item.
3. **Given** a todo with no due date set, **When** the user views the todo list, **Then** no overdue indicator is shown on that item.
4. **Given** a todo that is marked as complete but has a past due date, **When** the user views the todo list, **Then** no overdue indicator is shown — completed items are never considered overdue.

---

### User Story 2 - Overdue Status Updates Dynamically on Due Date Change (Priority: P2)

A user edits a todo's due date. If the new date is in the past (and the item is incomplete), the overdue indicator appears. If the new date is in the future, the indicator disappears. The visual state reflects reality at all times without requiring a page refresh.

**Why this priority**: Editing due dates is a core operation. If the overdue state becomes stale after an edit, users lose trust in what the indicator means.

**Independent Test**: Take an overdue todo and edit its due date to a future date. Verify the overdue indicator disappears immediately. Then edit it back to a past date and verify the indicator reappears.

**Acceptance Scenarios**:

1. **Given** an overdue todo, **When** the user edits its due date to a future date, **Then** the overdue indicator is removed immediately after saving.
2. **Given** a non-overdue todo with a future due date, **When** the user edits its due date to a past date, **Then** the overdue indicator appears immediately after saving.

---

### User Story 3 - Completing an Overdue Todo Clears the Indicator (Priority: P3)

A user marks an overdue todo as complete. The overdue indicator is removed immediately upon completion, reflecting that the task is done regardless of its due date.

**Why this priority**: This ensures the overdue state and completion state stay in sync. If a completed item still shows as overdue, the UI becomes confusing and users may distrust the indicators.

**Independent Test**: Mark an overdue todo as complete and verify the overdue indicator disappears. Unmark it and verify the indicator reappears.

**Acceptance Scenarios**:

1. **Given** an overdue todo displaying an overdue indicator, **When** the user marks it as complete, **Then** the overdue indicator is removed immediately.
2. **Given** a completed todo with a past due date, **When** the user marks it as incomplete again, **Then** the overdue indicator reappears immediately.

---

### Edge Cases

- What happens when a todo's due date is exactly today? — A todo due today (not yet past midnight) is NOT overdue; it is on time.
- What happens when the clock rolls past midnight and a todo's due date becomes yesterday? — The todo becomes overdue on next page load or interaction; no real-time clock-watching is required.
- What happens when a todo has no due date and is incomplete for a long time? — It is never overdue; only todos with explicit due dates in the past can be overdue.
- What happens when many todos are all overdue at the same time? — All of them display the overdue indicator independently; there is no limit.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a distinct visual indicator on any incomplete todo item whose due date is in the past (before today's date).
- **FR-002**: The system MUST NOT display an overdue indicator on any todo item that is marked as complete, regardless of its due date.
- **FR-003**: The system MUST NOT display an overdue indicator on any todo item that has no due date set.
- **FR-004**: The system MUST NOT display an overdue indicator on any todo item whose due date is today or in the future.
- **FR-005**: The overdue indicator MUST update immediately (without a page refresh) when a user marks a todo as complete or incomplete.
- **FR-006**: The overdue indicator MUST update immediately (without a page refresh) when a user edits a todo's due date.
- **FR-007**: The visual treatment for overdue items MUST be consistent with the project's existing design system (colour palette, spacing, typography scale defined in `docs/ui-guidelines.md`).
- **FR-008**: The overdue indicator MUST be accessible — it MUST NOT rely on colour alone to convey overdue status (e.g., a label, icon, or text indicator must accompany any colour change).

### Key Entities

- **Todo Item**: Represents a task. Relevant attributes for this feature: title, due date (optional date), completion status (boolean). The overdue state is derived — it is not stored; it is computed at render time from due date and completion status.
- **Overdue State**: A computed, display-only property. A todo is overdue if: `due date is set` AND `due date < today` AND `completion status = incomplete`.

## Assumptions

- "Today" is determined by the user's local date at the time the page is rendered or the todo list is updated.
- No backend changes are required — overdue status is computed purely in the frontend based on the existing due date field.
- The existing due date field on a todo item is sufficient to support this feature; no new data fields are needed.
- Real-time background polling to update overdue status as midnight passes is out of scope; status updates on the next user interaction or page load is acceptable.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify all overdue todos at a glance without reading or comparing any dates — verified by observing that overdue items display a distinct, clearly different visual treatment from non-overdue items.
- **SC-002**: 100% of incomplete todos with a past due date display the overdue indicator; 0% of complete todos or undated todos display it — verified by automated tests covering all combinations.
- **SC-003**: The overdue indicator updates without a page refresh within the same user interaction (mark complete, mark incomplete, save due date edit) — verified by interaction tests.
- **SC-004**: The overdue indicator is identifiable by users who cannot distinguish colour alone (e.g., has a visible label or icon in addition to any colour change) — verified by accessibility review.
