# Phase 02: drag-and-drop-link-ordering - Research

**Researched:** 2026-06-27
**Domain:** HTML5 Drag and Drop API, React 19 Client State, Prisma $transaction server actions, Optimistic UI Updates
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
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
No selected area was delegated to the agent. Downstream agents should follow the locked decisions above.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ORDER-01 | User can drag and drop microsite links in the dashboard editor to change their order. | Implement zero-dependency HTML5 drag-and-drop using standard React handlers (`onDragStart`, `onDragOver`, `onDrop`) with active visual dragging state. [VERIFIED: CONTEXT.md + codebase read] |
| ORDER-02 | User can save reordered links and see the new order persist across editor reloads. | Update `reorderMicrositeLinks` server action to accept `orderedIds`, execute writes in `prisma.$transaction`, and call `revalidatePath` to refresh cache. [VERIFIED: codebase read] |
| ORDER-03 | Public microsite displays active links in the saved order. | Public microsite resolver `getPublishedMicrosite` already queries links using `orderBy: { order: "asc" }`. Verification proves it works with updated DB order. [VERIFIED: codebase read] |
| ORDER-04 | Reordering preserves each link's label, URL, active state, and click tracking behavior. | Ordering only updates the `order` field of links; other fields are unmodified. [VERIFIED: codebase read] |
| ORDER-05 | Reorder persistence is validated server-side so users can only reorder links belonging to their own accessible microsite. | Inside `reorderMicrositeLinks`, verify that the caller owns the microsite and that all submitted link IDs belong to that microsite before running updates. [VERIFIED: CONTEXT.md + codebase read] |
</phase_requirements>

## Summary

Phase 02 implements a drag-and-drop and keyboard-accessible link ordering system inside the microsite editor. It is designed to be highly reliable, secure, accessible, and performant:
- **Zero external packages** are needed; we will leverage standard HTML5 drag-and-drop APIs.
- **Accessibility** is treated as a first-class citizen by introducing explicit Move Up/Down chevrons on each card.
- **Data security** is enforced on the server by checking ownership of the microsite and validating that every link ID indeed belongs to the microsite.
- **Database transaction integrity** is achieved via `prisma.$transaction` to avoid partial updates.
- **User experience** is optimized using optimistic client state updates, rollback on failure, server status indicators, and automatic error banner dismissal.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| State Management | Browser / Client | Server (refresh) | Optimistic updates keep interaction instantaneous; server revalidation provides source-of-truth parity. |
| Reorder Logic | Browser / Client | - | HTML5 Drag & Drop event handlers compute new array index order. |
| DB Access & Transaction | API / Backend | Database | `reorderMicrositeLinks` Server Action uses `prisma.$transaction` for atomic database updates. |
| Validation & Access Control | API / Backend | - | Server action checks caller permission via `getEditableMicrosite` and verifies link ownership. |
| Route Revalidation | API / Backend | NextJS Cache | Call `revalidatePath` for dashboard and public pages to invalidate SSR cache. |

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
| `next` | 16.1.6 | Next.js App Router & Server Actions. | Core application framework. |
| `react` / `react-dom` | 19.2.3 | Client component state management and transition handling. | Core UI library. Compatible with standard HTML5 drag-and-drop attributes. |
| `typescript` | ^5 | Typing parameters and server action signatures. | Workspace language standard. |
| `tailwindcss` | ^4 | Hover cursors, opacity styling, layout adjustments. | Workspace styling framework. |
| `@prisma/client` | ^7.4.1 | Atomic transaction updates inside server actions. | Application ORM. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | ^0.575.0 | Icons: `GripVertical`, `ChevronUp`, `ChevronDown`, `Loader2`. | Visual UI indicators for dragging, moving, and saving. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zero-dependency HTML5 DnD | `@hello-pangea/dnd` or `@dnd-kit/core` | External packages add bundle size and risk React 19 compatibility issues. Zero-dependency standard React handlers are lightweight and highly reliable. |
| Immediate auto-save | Manual "Save Order" button | Manual buttons force extra clicks. Immediate auto-save is the expected modern UX. |
| Index loop update | Offset ordering schema | Incremental/dense index recalculation (0..n-1) prevents gap accumulation and is robust. |

## Architecture Patterns

### Recommended Project Structure

```text
src/
├── app/
│   ├── actions/
│   │   └── microsite.ts           # reorderMicrositeLinks with transaction and validation
│   └── dashboard/
│       └── microsites/
│           └── [id]/
│               └── microsite-editor.tsx # drag handlers, optimistic order list, Move Up/Down buttons, saving status
└── lib/
    └── public-microsite.ts        # getPublishedMicrosite returns links ordered by 'order' (already implemented)
```

### Pattern 1: Zero-Dependency React Drag-and-Drop Handlers
Using standard HTML5 draggable elements in React:
```tsx
const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggingIndex(index);
};

const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault(); // Required to allow dropping
};

const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === targetIndex) return;

    const newLinks = [...links];
    const [draggedItem] = newLinks.splice(draggingIndex, 1);
    newLinks.splice(targetIndex, 0, draggedItem);
    
    setDraggingIndex(null);
    updateOrderOptimistically(newLinks);
};
```

### Pattern 2: Atomic Server-Side Order Persistence
Ensuring link ownership and transaction updates:
```typescript
export async function reorderMicrositeLinks(micrositeId: string, orderedIds: string[]) {
    const access = await getCurrentUserAccess();
    const microsite = await getEditableMicrosite(micrositeId, access);

    // Validate that all link IDs belong to this microsite
    const existingLinks = await prisma.micrositeLink.findMany({
        where: { micrositeId },
        select: { id: true }
    });
    const existingIds = new Set(existingLinks.map(l => l.id));
    const allValid = orderedIds.every(id => existingIds.has(id));
    if (!allValid || orderedIds.length !== existingLinks.length) {
        throw new Error("Invalid link IDs submitted");
    }

    // Recalculate dense indices atomically
    await prisma.$transaction(
        orderedIds.map((id, index) =>
            prisma.micrositeLink.update({
                where: { id },
                data: { order: index },
            })
        )
    );

    revalidatePath(`/dashboard/microsites/${micrositeId}`);
    revalidatePath(`/${microsite.slug}`);
    return { success: true };
}
```

### Pattern 3: Optimistic UI Updates & Error Rollback
Instantly rearranging local state while performing background save:
```tsx
const [links, setLinks] = useState(microsite.links);
const [isSaving, setIsSaving] = useState(false);

const changeOrder = async (newLinks: MicrositeLink[]) => {
    const originalLinks = [...links];
    setLinks(newLinks); // Update UI immediately
    setIsSaving(true);
    setError(null);

    try {
        const result = await reorderMicrositeLinks(microsite.id, newLinks.map(l => l.id));
        if (!result.success) throw new Error("Gagal menyimpan urutan");
        router.refresh();
    } catch (err) {
        setLinks(originalLinks); // Rollback on error
        setError(err instanceof Error ? err.message : "Gagal menyimpan urutan");
        // Dismiss error after 5s
        setTimeout(() => setError(null), 5000);
    } finally {
        setIsSaving(false);
    }
};
```

## Don't Hand-Roll

- **Don't use dynamic Tailwind classes** for visual cues (opacity, disabling state). Use explicit class conditionals (e.g. `isPending ? "opacity-40 cursor-not-allowed" : ""`).
- **Don't perform non-atomic updates** in `reorderMicrositeLinks`. Always wrap loop updates inside `prisma.$transaction`.
- **Don't perform server updates when position is unchanged.** Compare the `orderedIds` against current IDs; skip action call if identical.

## Common Pitfalls

### Pitfall 1: Draggable inputs block form interaction
- **What goes wrong:** User cannot select or focus text fields inside the link cards because the card itself or its children block default event handlers.
- **How to avoid:** Do not make the entire link card `draggable`. Make only the handle (e.g., the `GripVertical` icon) the draggable trigger, or use standard React `draggable={!isEditing}` conditionals.

### Pitfall 2: Optimistic UI update out-of-sync with concurrent edits
- **What goes wrong:** User reorders, then immediately updates a link title. The local state arrays collide and overwrite each other.
- **How to avoid:** Completely disable reordering controls (both dragging and chevrons) if any link card is in edit mode or if the Add Link form is open.

### Pitfall 3: Reordering non-active links throws out of bounds
- **What goes wrong:** Reordering active links ignores inactive links, causing inactive links to get orphaned or duplicate order indices.
- **How to avoid:** Maintain all links (active and inactive) in the reordering array in the editor. Ensure the server action validates and updates *all* links of the microsite.

### Pitfall 4: Missing public page cache invalidation
- **What goes wrong:** Dashboard editor reflects the new order, but public page `/${slug}` shows the old order due to Next.js route cache.
- **How to avoid:** Ensure the server action calls `revalidatePath("/[username]")` or `revalidatePath("/" + slug)` explicitly.
