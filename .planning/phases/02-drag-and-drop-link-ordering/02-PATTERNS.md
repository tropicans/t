# Phase 02: drag-and-drop-link-ordering - Pattern Map

**Mapped:** 2026-06-27
**Files analyzed:** 2
**Analogs found:** 2 / 2

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/app/actions/microsite.ts` | service/action | CRUD, request-response | `src/app/actions/microsite.ts` | exact |
| `src/app/dashboard/microsites/[id]/microsite-editor.tsx` | component | CRUD, request-response | `src/app/dashboard/microsites/[id]/microsite-editor.tsx` | exact |

## Pattern Assignments

### `src/app/actions/microsite.ts` (service/action, CRUD + request-response)

**Analog:** Existing `reorderMicrositeLinks` (lines 169-181) and other CRUD functions in the same file.

**Ownership validation pattern** (derived from existing actions like `createMicrositeLink` and `getEditableMicrosite`):
```typescript
const access = await getCurrentUserAccess();
await getEditableMicrosite(micrositeId, access);
```

**Prisma Transaction pattern** (to ensure atomic updates):
```typescript
await prisma.$transaction(
    orderedIds.map((id, index) =>
        prisma.micrositeLink.update({ where: { id }, data: { order: index } })
    )
);
```

**Path Revalidation pattern** (lines 102-103):
```typescript
revalidatePath(`/dashboard/microsites/${id}`);
revalidatePath(`/${updated.slug}`);
```

---

### `src/app/dashboard/microsites/[id]/microsite-editor.tsx` (component, CRUD + request-response)

**Analog:** Existing client state transition flows (`useTransition`) and forms in `microsite-editor.tsx`.

**Action execution pattern with transition** (lines 75-82):
```typescript
startTransition(async () => {
    try {
        await updateMicrosite(microsite.id, formData);
        router.refresh();
    } catch (err) {
        setError(getErrorMessage(err));
    }
});
```

**Optimistic local state & save trigger pattern**:
```typescript
// Local state for link array to allow instant drag/chevron updates
const [linksState, setLinksState] = useState<MicrositeLink[]>(microsite.links);

// Handler to trigger the server action and handle rollback on failure
function handleReorder(newLinks: MicrositeLink[]) {
    const originalLinks = [...linksState];
    setLinksState(newLinks);
    setError(null);

    // Filter out if positions haven't changed compared to database state
    const currentOrderIds = microsite.links.map(l => l.id);
    const newOrderIds = newLinks.map(l => l.id);
    if (JSON.stringify(currentOrderIds) === JSON.stringify(newOrderIds)) {
        return;
    }

    startTransition(async () => {
        try {
            const res = await reorderMicrositeLinks(microsite.id, newOrderIds);
            if (!res.success) throw new Error("Gagal mengurutkan link");
            router.refresh();
        } catch (err) {
            setLinksState(originalLinks);
            setError(getErrorMessage(err));
            // Dismiss error after 5s
            setTimeout(() => setError(null), 5000);
        }
    });
}
```

**HTML5 Drag and Drop Handlers**:
```tsx
const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggingIndex(index);
};

const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
};

const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === targetIndex) return;

    const reordered = [...linksState];
    const [draggedItem] = reordered.splice(draggingIndex, 1);
    reordered.splice(targetIndex, 0, draggedItem);
    
    setDraggingIndex(null);
    handleReorder(reordered);
};
```

**Keyboard / Chevron Movement Handlers**:
```tsx
const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const reordered = [...linksState];
    const temp = reordered[index];
    reordered[index] = reordered[index - 1];
    reordered[index - 1] = temp;
    handleReorder(reordered);
};

const handleMoveDown = (index: number) => {
    if (index === linksState.length - 1) return;
    const reordered = [...linksState];
    const temp = reordered[index];
    reordered[index] = reordered[index + 1];
    reordered[index + 1] = temp;
    handleReorder(reordered);
};
```

## Anti-Patterns to Avoid

- **Using full-card dragging triggers:** Clicking inside form inputs (or editing forms) might start dragging. Only attach the `draggable` drag handlers to the dedicated visual handle element (e.g., `GripVertical` icon) OR conditionally disable `draggable` when in edit mode.
- **Calling server action on non-mutated lists:** If a drag and drop returns the item to its original slot, do not send the API request.
- **Persistent error banners:** Error banners must self-dismiss after 5 seconds to match the local UX pattern.
