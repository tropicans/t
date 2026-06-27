# Phase 3: Accessibility And Verification Hardening - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-27T15:29:21Z
**Phase:** 3-Accessibility And Verification Hardening
**Areas discussed:** Focus management & keyboard flow, Drag & drop visual feedback, Mobile layout responsiveness, Screen reader & ARIA live announcements

---

## Focus management & keyboard flow

| Option | Description | Selected |
|--------|-------------|----------|
| Keep focus on clicked button | Focus remains on the clicked Move Up/Down button of the moved item in its new position (enables continuous keyboard movement) | ✓ |
| Focus entire card container | Focus shifts to the parent card container of the moved item | |
| Let browser handle focus | Focus falls back to the default browser behavior, which might reset or lose focus on re-render | |

**Focus Target Pattern:**
- Store target button identifier (linkId + direction) in component state, and apply focus via ref-based elements in a React `useEffect` hook.

**Focus on boundaries:**
- Shift focus to the opposite active chevron button on the same card if the clicked button becomes disabled at list boundaries (e.g. focus Move Down if Move Up becomes disabled).

**Drag Handle Accessibility:**
- Hide the drag handles from keyboard navigation and screen readers (`aria-hidden="true"` and no `tabIndex`), relying on the chevron buttons as the primary keyboard path.

---

## Drag & drop visual feedback

| Option | Description | Selected |
|--------|-------------|----------|
| Drop indicator line | Render a horizontal blue line between cards showing the exact drop insertion point | ✓ |
| Target card highlight | Style the border/background of the hovered card (e.g., border-blue-500 or bg-zinc-800) | |
| Gap insertion animation | Animate cards sliding apart to reveal an empty gap where the item will be inserted | |

**Drop Line Position Calculation:**
- Calculate mouse position on `onDragOver`: show the line at the top of the card if hovering upper 50%, or at the bottom if hovering lower 50%.

**Source Card Appearance:**
- Dim the card (`opacity-40`) in its original list position so it remains visible as a reference.

**Save Success Visual:**
- Show a transient success indicator `'Tersimpan ✓'` in green next to the Links title, fading out after 1.5 seconds.

---

## Mobile layout responsiveness

| Option | Description | Selected |
|--------|-------------|----------|
| Two-row card layout | Keep drag handle and link info on the first row, and place all action buttons on a separate second row for plenty of tap space | ✓ |
| Dropdown action menu | Keep only drag handle, link info, and a '...' menu button. Hide actions inside a dropdown | |
| High-density single-row | Keep all buttons on a single row, but reduce button size and padding on mobile | |

**Toolbar Styling:**
- Style the second row as a right-aligned flex toolbar with a subtle top border separating it from the first row.

**Edit Form Layout:**
- Stack the Title, URL, and Status select fields vertically on mobile for readability, keeping it inline.

**Public Page Layout:**
- Keep public responsive layout centered `max-w-md` profile container as is.

---

## Screen reader & ARIA live announcements

| Option | Description | Selected |
|--------|-------------|----------|
| Indonesian announcements | Spoken announcements in Indonesian, matching existing UI localization strings | ✓ |
| English announcements | Spoken announcements in English | |

**ARIA Live Implementation:**
- Render an element with class `sr-only` and `aria-live="polite"`, updating its text state on reorder actions.

**Announcement Events:**
- Announce both save start (e.g., `"Mengurutkan..."`) and save success (e.g., `"Tautan '[Title]' berhasil dipindahkan ke posisi [Index] dari [Total]"`).

**Chevron Screen Reader Labels:**
- Use title-specific descriptions (e.g., `aria-label='Pindahkan "[Title]" ke atas'` and `aria-label='Pindahkan "[Title]" ke bawah'`).

---

## the agent's Discretion

No areas were delegated to the agent. Downstream agents will follow the locked decisions.

## Deferred Ideas

None — discussion stayed within phase scope.
