# Phase 2: Drag-and-Drop Link Ordering - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-27T15:06:21Z
**Phase:** 2-Drag-and-Drop Link Ordering
**Areas discussed:** Interaction & Accessibility Fallback, Save Trigger Strategy, Edit Mode Conflict, Error Recovery

---

## Interaction & Accessibility Fallback

| Option | Description | Selected |
|--------|-------------|----------|
| Both DnD handles and Move Up/Down buttons | Best of both worlds: intuitive dragging for mouse/touch, and explicit button controls for perfect keyboard/screen reader accessibility | ✓ |
| Pointer-based Drag-and-Drop handles only | Sleek visual drag interaction, but lacks keyboard support unless a heavy library with screen-reader announcer is added | |
| Move Up/Down buttons only | Simple, zero-dependency, works 100% reliably on all devices and keyboards, but lacks the visual dragging experience | |

**Technical Implementation:**
- Zero-dependency HTML5 DnD (Uses native `draggable` and standard React event handlers. Fast, clean, and React 19 compatible).

**Visual Controls Visibility:**
- Always visible, compact controls (subtle vertical grip on the left, chevrons on the right) for guaranteed accessibility on both mobile and desktop.

**Boundary Buttons Behavior:**
- Disable boundary buttons (Disable Up chevron on first item, and Down chevron on last item).

---

## Save Trigger Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-save on drop or button click | Trigger the server action immediately. More modern, eliminates manual Save clicks, and aligns with the existing editor behavior | ✓ |
| Explicit 'Save Order' button | Reorder links locally, and show a 'Save Order' button. Useful if database writes need to be minimized | |

**Saving Progress UI:**
- Status indicator in the Card Header next to the title (subtle "Saving..." / "Saved" text/spinner).

**Rapid Reordering Handling:**
- Temporarily disable reorder controls (drag handle and chevron buttons) while `isPending` is true to prevent database write races.

**Data Integrity Strategy:**
- Transactional dense re-indexing (0..n-1) in the Server Action using a single `prisma.$transaction`.

---

## Edit Mode Conflict

| Option | Description | Selected |
|--------|-------------|----------|
| Disable reordering while editing | Disable all reorder controls if the 'Add Link' form is open or if any link card is in edit mode. Prevents losing unsaved inputs | ✓ |
| Close active edit forms on reorder | Allow reordering, but automatically cancel/close any open edit forms without saving | |
| Allow reordering with active edit forms | Keep the form open and move it along with the link | |

**Disabled Reorder UI Visual:**
- Dim opacity of controls and apply a `cursor-not-allowed` pointer on hover.

**Inactive Link Sorting:**
- Allow reordering of inactive/hidden links (preserving their position index if reactivated).

**New Link Position:**
- Append to the bottom of the list (assigning the highest order value).

---

## Error Recovery

| Option | Description | Selected |
|--------|-------------|----------|
| Optimistic UI with rollback | Instantly update the link order on the client. If the server update fails, show an error alert and automatically slide the links back to their original position | ✓ |
| UI blocking spinner | Display a spinner overlay over the links card while saving to block further input | |

**Error UI Visual:**
- Reuse the existing editor error banner (setting the local `error` state).

**Error Banner Dismissal:**
- Dismiss the error banner automatically after 5 seconds.

**Redundant Save Prevention:**
- Skip server save if the new position sequence is identical to the old sequence.

---

## the agent's Discretion

No areas were delegated to the agent. Downstream agents will follow the locked decisions.

## Deferred Ideas

None — discussion stayed within phase scope.
