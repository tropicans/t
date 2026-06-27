# Phase 3: Accessibility And Verification Hardening - Context

**Gathered:** 2026-06-27T15:29:21Z
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 3 implements accessibility, responsiveness, visual feedback, and verification hardening for the microsite themes and drag-and-drop link ordering features. This includes:
- Usable keyboard controls and focus restoration for link reordering.
- Responsive design styling for edit forms and action toolbars on mobile.
- Clear visual feedback for drag-and-drop hovering and save operations.
- ARIA live announcements in Indonesian to match the localized UI.
- Clean verification runs (`npm run lint` and `npx tsc --noEmit`) and a manual UAT script.

</domain>

<decisions>
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
No areas were delegated to the agent. Downstream agents must follow the decisions outlined above.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Scope and Requirements
- `.planning/PROJECT.md` — overall project description, constraints, and scope.
- `.planning/REQUIREMENTS.md` — requirements UX-01 through UX-03, and VER-01 through VER-03 for this phase.
- `.planning/ROADMAP.md` §Phase 3 — goals, success criteria, and canonical refs.
- `AGENTS.md` — project guidelines, Next.js ports, database defaults, and verification tools.

### Codebase & Research Maps
- `.planning/codebase/TESTING.md` — available testing patterns and commands.
- `.planning/codebase/STRUCTURE.md` — key files: microsite editor and public page layouts.
- `.planning/codebase/CONVENTIONS.md` — naming, error handling, import ordering, and commenting conventions.
- `.planning/research/PITFALLS.md` — accessibility and responsive layout risks (specifically Pitfalls 6, 8, 12).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/button.tsx` — button component used for chevrons and toolbar actions.
- `lucide-react` — icons: `ChevronUp` (move up), `ChevronDown` (move down), `GripVertical` (grip handle), `Check` (success checkmark).
- Tailwind utilities: `sr-only` (visually-hidden live regions), `opacity-40` (dimmed source cards), `@max-md` or `md:` media selectors (mobile/desktop layouts).

### Established Patterns
- Client state transitions using `useTransition` and `router.refresh()` in `src/app/dashboard/microsites/[id]/microsite-editor.tsx`.
- Indonesian error and notification copy.
- Uncontrolled inputs with defaults for inline editing, paired with local sync states for reordering.

### Integration Points
- `src/app/dashboard/microsites/[id]/microsite-editor.tsx` — Integrate the new focus management, custom keyboard refs, drag targets indicators, responsive mobile rows, and aria-live announcements region.
- `src/components/microsite-page-client.tsx` — Verify styling integrity on different screen sizes when new themes are active.

</code_context>

<specifics>
## Specific Ideas

- Visual drop line styles: A thin horizontal line (`h-0.5 w-full bg-blue-500 rounded my-1`) that renders when `draggingIndex !== null` and another card triggers `onDragOver`.
- Chevron aria-labels should dynamically interpolate the target title: `aria-label={`Pindahkan "${link.title}" ke atas`}`.
- ARIA live region content state: `const [announcement, setAnnouncement] = useState("")`. Update `announcement` at the start and completion of `handleReorder`.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-Accessibility And Verification Hardening*
*Context gathered: 2026-06-27T15:29:21Z*
