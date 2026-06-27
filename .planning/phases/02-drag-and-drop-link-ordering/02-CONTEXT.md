# Phase 2: Drag-and-Drop Link Ordering - Context

**Gathered:** 2026-06-27T15:06:21Z
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 adds persistent link reordering inside the dashboard editor (both native HTML5 drag-and-drop handles and keyboard-accessible Move Up/Down buttons) and ensures the public microsite page displays active links sorted by this saved order.
Out of scope: Section grouping (ORDER-V2-01), link visibility/order scheduling (ORDER-V2-02), and link order A/B testing (ORDER-V2-03).

</domain>

<decisions>
## Implementation Decisions

### Interaction & Accessibility Fallback
- **D-01:** Reordering is performed via both drag-and-drop grip handles (for mouse/touch gestures) and explicit "Move Up" / "Move Down" chevron buttons (for complete keyboard, screen reader, and mobile touch fallback accessibility).
- **D-02:** Use a zero-dependency HTML5 drag-and-drop API approach (e.g., standard React handlers for `draggable`, `onDragStart`, `onDragOver`, and `onDrop`) to avoid external packages and ensure full compatibility with React 19.
- **D-03:** Reorder controls (grip handle on the left, chevron buttons on the right) are always visible and compact on the link cards across both mobile/touch and desktop viewports.
- **D-04:** Disable the "Move Up" button on the first link and the "Move Down" button on the last link in the list to prevent invalid operations.

### Save Trigger Strategy
- **D-05:** Save the updated link order immediately (auto-save) upon every drop action or chevron button click via the `reorderMicrositeLinks` server action.
- **D-06:** Display a subtle saving progress indicator (such as "Saving..." or "Saved" / "Tersimpan" text/spinner) in the card header next to the "Links" title to communicate server status without locking or cluttering individual card states.
- **D-07:** Temporarily disable all reorder controls (both drag handles and chevron buttons) while the save transition is in progress (`isPending` is true) to prevent database race conditions and duplicate writes.
- **D-08:** Guarantee link ordering data integrity inside the server action using a `prisma.$transaction`. The action will validate all submitted link IDs, check ownership, and recalculate a dense, gapless `0..n-1` sequence for the database.

### Edit Mode Conflict
- **D-09:** Completely disable reordering controls (both dragging and chevrons) if the "Add Link" form is open or if any link card is actively in edit mode.
- **D-10:** Visually indicate that reordering is disabled during edit mode by dimming the opacity of the grip handles and chevron buttons, and applying a `cursor-not-allowed` pointer on hover.
- **D-11:** Allow reordering of inactive (hidden) links in the editor list. Their position index is saved, and their sorted order is preserved if/when they are reactivated.
- **D-12:** Newly created links are appended to the bottom of the list, automatically obtaining the highest order value.

### Error Recovery
- **D-13:** Use an optimistic UI updates strategy. Dragging/clicking chevrons instantly rearranges the links in local state. If the server action fails, display the error and automatically roll back the UI list to its previous order.
- **D-14:** Display server action errors by updating the existing `error` state banner at the top of the editor.
- **D-15:** Dismiss the error banner automatically after 5 seconds to avoid permanent clutter in the dashboard.
- **D-16:** Compare the index sequence before sending the update to the server. If a drag/drop returns the link to its original position, skip the server action call entirely.

### the agent's Discretion
No areas were delegated to the agent. Downstream agents must follow the decisions outlined above.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Scope And Requirements
- `.planning/PROJECT.md` — overall project description, constraints, and scope.
- `.planning/REQUIREMENTS.md` — requirements ORDER-01 through ORDER-05 for this phase.
- `.planning/ROADMAP.md` §Phase 2 — goal, success criteria, and canonical refs for this phase.

### Research Guidance
- `.planning/research/ARCHITECTURE.md` — recommended build order and data flow.
- `.planning/research/PITFALLS.md` — ordering and DnD risks, particularly Pitfalls 1, 2, 5, 6, 7, and 9.

### Codebase Maps
- `.planning/codebase/ARCHITECTURE.md` — data layers, routing, and access control.
- `.planning/codebase/CONCERNS.md` — fragile areas and data security risks.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/button.tsx` — button component used for control chevrons.
- `lucide-react` — icons: `GripVertical` (grip handle), `ChevronUp` (move up), `ChevronDown` (move down), `Loader2` (loading spinner).

### Established Patterns
- Server actions in `src/app/actions/microsite.ts` own authentication checks (`getCurrentUserAccess`), edit verification (`getEditableMicrosite`), and cache revalidation (`revalidatePath`).
- Client editor state in `src/app/dashboard/microsites/[id]/microsite-editor.tsx` manages forms, transitions (`useTransition`), and re-fetching data (`router.refresh()`).

### Integration Points
- `src/app/actions/microsite.ts:reorderMicrositeLinks` — update this action to use a `prisma.$transaction`, perform dense index recalculation, validate that every link ID belongs to the target microsite, and revalidate the public route `/${slug}` along with the dashboard page.
- `src/app/dashboard/microsites/[id]/microsite-editor.tsx` — integrate optimistic local state, drag-and-drop handlers (`onDragStart`, `onDragOver`, `onDrop`), chevron click handlers, "Saving..." progress indicator, and disabling states when `isPending` or edit forms are active.
- `src/lib/public-microsite.ts` — verify public query retrieves links with `orderBy: { order: "asc" }` (already implemented).

</code_context>

<specifics>
## Specific Ideas

- Show saving indicator as "Saving..." / "Saved" (in Indonesian: "Menyimpan..." / "Tersimpan" to match the error handling localization style) next to the "Links" section title.
- Dim disabled reorder controls to `opacity-40` and apply `cursor-not-allowed` when edit forms are active.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-Drag-and-Drop Link Ordering*
*Context gathered: 2026-06-27T15:06:21Z*
