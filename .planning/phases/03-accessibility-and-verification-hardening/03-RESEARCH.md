# Phase 03: accessibility-and-verification-hardening - Research

**Researched:** 2026-06-27
**Domain:** Keyboard Focus Management, HTML5 Drag & Drop Visuals, React 19 Client State, Screen Reader (ARIA) Accessibility, Tailwind Mobile Layouts, ESLint, TypeScript Type Checking
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
## Implementation Decisions

### Focus Management & Keyboard Flow
- **D-01:** When a keyboard user clicks "Move Up" or "Move Down", focus is kept on the clicked chevron button of the moved item in its new position. This enables continuous keyboard movement of the same item.
- **D-02:** Store target button identifier (linkId + direction) in component state, and apply focus via ref-based elements in a React `useEffect` hook after re-rendering.
- **D-03:** If a link reaches a boundary (top or bottom of the list) and the clicked chevron button becomes disabled, shift focus to the opposite active chevron button on the same card (e.g., focus "Move Down" if "Move Up" becomes disabled).
- **D-04:** Hide the drag handles from keyboard navigation and screen readers (`aria-hidden="true"` and no `tabIndex`), relying on the chevron buttons as the primary keyboard path.

### Drag & Drop Visual Feedback
- **D-05:** Show the exact drop insertion point using a horizontal blue drop indicator line rendered between cards during dragover.
- **D-06:** Calculate mouse relative position during `onDragOver` (show the indicator line at the top of the card if hovering the upper 50%, or at the bottom if hovering the lower 50%).
- **D-07:** Dim the card being dragged (`opacity-40`) in its original list position so it remains visible as a reference.
- **D-08:** Show a transient success indicator `'Tersimpan ✓'` in green next to the "Links" title upon a successful reorder save, fading out after 1.5 seconds.

### Mobile Layout Responsiveness
- **D-09:** Implement a two-row card layout on mobile viewports: keep the drag handle and link info on the first row, and place all action buttons on a separate second row for plenty of tap space.
- **D-10:** Style the second row as a right-aligned flex toolbar with a subtle top border (`border-t border-zinc-800/60` or similar) separating it from the first row.
- **D-11:** For inline edit/add form states on mobile viewports, stack the input fields (Title, URL, and Status select) vertically for readability.
- **D-12:** Keep the public responsive layout centered `max-w-md` profile container as is, ensuring consistency and alignment with standard Link-in-Bio aesthetics.

### Screen Reader & ARIA Live Announcements
- **D-13:** Use Indonesian (Bahasa Indonesia) for screen reader/ARIA live announcements to match the existing UI translation style.
- **D-14:** Implement the ARIA live region using a dedicated visually-hidden element (`className="sr-only"` and `aria-live="polite"`), updating its text state on reorder actions.
- **D-15:** Announce both save start (e.g., `"Mengurutkan..."`) and save success (e.g., `"Tautan '[Title]' berhasil dipindahkan ke posisi [Index] dari [Total]"`) in the live region.
- **D-16:** Provide title-specific descriptions for the Move Up and Move Down chevron buttons (e.g., `aria-label='Pindahkan "[Title]" ke atas'` and `aria-label='Pindahkan "[Title]" ke bawah'`) for clear assistive reading.

### the agent's Discretion
No selected area was delegated to the agent. Downstream agents should follow the locked decisions above.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UX-01 | Link reordering remains usable with keyboard or accessible controls, not pointer-only drag behavior. | Dynamic focus management and chevron buttons with automatic boundary focus shifting. [VERIFIED: CONTEXT.md + codebase read] |
| UX-02 | Reorder UI provides clear visual feedback while dragging and after save/failure. | Horizontal insertion lines, opacity feedback, and transient status text. [VERIFIED: CONTEXT.md + codebase read] |
| UX-03 | Theme and ordering changes do not break responsive public microsite layout on mobile and desktop. | Responsive card formatting using flex layout for mobile row stacking and centered container layout. [VERIFIED: CONTEXT.md + codebase read] |
| VER-01 | `npm run lint` passes after implementation. | ESLint runs as a verification step. [VERIFIED: package.json] |
| VER-02 | `npx tsc --noEmit` passes after TypeScript or Prisma-related implementation. | TypeScript compiler verification step. [VERIFIED: package.json] |
| VER-03 | Manual UAT confirms theme selection and link ordering in dashboard and public microsite. | Manual verification protocol. [VERIFIED: ROADMAP.md] |
</phase_requirements>

## Summary

Phase 3 addresses accessibility (a11y), responsive design (mobile friendliness), visual state indicators, and formal code quality verification. The reordering feature will support fluid keyboard-only flows by restoring focus dynamically. Drag-and-drop visuals will show exactly where dropping will insert a link using dynamic line indicators. Indonesian screen reader messages will state the save progress and success of ordering changes. Mobile screens will stack editor forms vertically and arrange list actions on a right-aligned second row.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| Focus Management | Browser / Client | - | React refs and useEffect focus restoration based on updated link arrays. |
| Drag Visuals & Drop Indicator | Browser / Client | - | Mouse clientY/rect math onDragOver determines line placement. |
| ARIA Announcements | Browser / Client | - | Visual-hidden aria-live container announces client transitions. |
| Responsive Layout | Browser / Client | - | CSS media queries stack layouts on mobile and align side toolbars. |
| Code Quality | Tooling / CLI | - | ESLint and TypeScript compiler run on local filesystem files. |

## Project Constraints (from AGENTS.md)

- Trust `package.json`, `docker-compose.yml`, Prisma config, and `src/app`.
- Dev and prod app traffic use port `4000`, not `3000`.
- Use `npm` in this repo (`package-lock.json` is checked in).
- `npm run dev` starts Next on `http://localhost:4000`.
- `npm run lint` is the only verification script.
- There is no `test` or `typecheck` script; use `npx tsc --noEmit` when TypeScript changes need verification.
- Local Postgres is defined in `docker-compose.yml` and exposed on host port `5436`; `docker compose up -d db` starts it.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | 16.1.6 | Next.js App Router and Server Components. | Core application framework. |
| `react` / `react-dom` | 19.2.3 | Component structure, focus refs, useEffect loops. | Standard UI rendering. |
| `tailwindcss` | ^4 | Responsive layouts and focus outline overlays. | Styling system. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | ^0.575.0 | Icons: `ChevronUp`, `ChevronDown`, `GripVertical`, `Check`. | Visual triggers and focus indicators. |

## Package Legitimacy Audit

No new external packages are installed in this phase.

## Architecture Patterns

### Focus Restoration and Boundary Shifting Pattern
When list elements are shifted via buttons, re-renders normally cause focus to drop back to the document body. By tracking the identifier of the active link and the intended direction, a React `useEffect` can query the newly rendered DOM button using a unique ID attribute and programmatically apply `.focus()`.
If the action makes a button disabled (e.g. moving a link to the top makes Move Up disabled), the code detects this condition and focuses the opposite button (Move Down) on the same element instead.

### Recommended Project Structure
This phase updates:
- `src/app/dashboard/microsites/[id]/microsite-editor.tsx` (adds focus recovery, drag lines, mobile rows, ARIA live messages, save status)

No changes are expected outside the main editor view, save for testing public pages.

## Common Pitfalls

### Pitfall 1: Loss of Focus on State Refresh
**What goes wrong:** User clicks "Move Up" using a keyboard spacebar/enter key. The state updates, rendering the moved item at a new index. The focused DOM node is destroyed or moved, causing focus to reset to `document.body` or the top of the page.
**Why it happens:** React replaces DOM nodes or swaps attributes during the array swap.
**How to avoid:** Assign unique IDs to the buttons (`btn-up-${link.id}`, `btn-down-${link.id}`) and focus them after the state update via `useEffect`.

### Pitfall 2: Too Small Click/Touch Targets on Mobile
**What goes wrong:** Desktop-centric side-by-side action buttons are hard to tap on mobile viewports.
**Why it happens:** Multi-button row layouts shrink horizontally on narrow screens.
**How to avoid:** Stack actions into a secondary dedicated row layout on mobile viewports (`flex flex-col md:flex-row`).

## Code Examples

### Focus Restoration Hook/Effect
```typescript
useEffect(() => {
  if (focusTarget) {
    const el = document.getElementById(`btn-${focusTarget.direction}-${focusTarget.id}`);
    if (el && !el.disabled) {
      el.focus();
    }
  }
}, [linksState, focusTarget]);
```

## Assumptions Log

All claims in this research were verified or cited — no user confirmation needed.

## Open Questions

None — requirements and implementation decisions are fully specified in `03-CONTEXT.md`.

## Environment Availability

Pure code and config changes. No external dependencies are introduced.

## Validation Architecture

### Test Framework
No automated test suite is set up in this repository. All validation is performed statically via ESLint and TypeScript checks, and dynamically via manual UAT checklists.

### Phase Requirements → Test Map
- UX-01: Focus restoration and chevron movement test (Manual UAT)
- UX-02: Visual drag lines and saving status message (Manual UAT)
- UX-03: Responsiveness verification via browser resize / DevTools (Manual UAT)
- VER-01: `npm run lint` (Automated CLI)
- VER-02: `npx tsc --noEmit` (Automated CLI)

## Security Domain

### Applicable ASVS Categories
- V5 Input Validation (no new input fields, but stacked inputs validate title/URL properly).
- V4 Access Control (verification that access controls established in Phase 2 are not modified).

## Sources

### Primary (HIGH confidence)
- `.planning/phases/03-accessibility-and-verification-hardening/03-CONTEXT.md` - Context, decisions, and boundary specifications.
- `src/app/dashboard/microsites/[id]/microsite-editor.tsx` - Existing component code and structure.
