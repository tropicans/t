# Architecture Research: Microsite Theme Variants and Link Ordering

**Project:** Taut Microsite Enhancements  
**Domain:** Brownfield Next.js microsite editor and public renderer  
**Researched:** 2026-06-26  
**Overall confidence:** HIGH

## Recommended Architecture

Keep enhancement inside existing Next.js App Router monolith. Do not add new service, route model, state manager, or API layer. Existing seams already match target features:

```text
Dashboard editor client
  src/app/dashboard/microsites/[id]/microsite-editor.tsx
        │ FormData + ordered id array
        ▼
Server actions mutation boundary
  src/app/actions/microsite.ts
        │ validated theme + validated link ownership/order
        ▼
Prisma/PostgreSQL persistence
  prisma/schema.prisma + migrations
        │ selected public DTO
        ▼
Public microsite reader + polling API
  src/lib/public-microsite.ts
  src/app/api/microsites/[slug]/route.ts
        │ theme + active links ordered by order asc
        ▼
Public renderer
  src/components/microsite-page-client.tsx
```

Core move: centralize theme definitions and link-order rules, then let editor and public renderer consume same stable theme IDs. Keep `Microsite.theme` as string unless this milestone also introduces strict Prisma enum migration. Add only DB changes needed to fix drift and strengthen ordering indexes/constraints.

## Component Boundaries

| Component | Responsibility | Change Needed | Repo Paths |
|-----------|----------------|---------------|------------|
| Theme registry | Single source of allowed theme IDs, labels, previews, and public class tokens. | Create shared module; editor preview and public renderer import from it. | `src/lib/microsite-themes.ts` or `src/components/microsite/theme-registry.ts` |
| Microsite actions | Authenticated mutation boundary for theme choice and link order. | Validate `theme` against registry; harden `reorderMicrositeLinks` ownership and atomicity; revalidate dashboard and public paths. | `src/app/actions/microsite.ts` |
| Prisma schema | Persist selected theme and stable link display order. | Keep `Microsite.theme`; ensure `Microsite.avatarImage` migration exists; add link ordering index; optionally add uniqueness for `(micrositeId, order)` only if reorder strategy avoids transient collisions. | `prisma/schema.prisma`, `prisma/migrations/*` |
| Dashboard editor | User interaction surface for theme selection and drag-and-drop ordering. | Replace local `THEMES` constant; add drag handles and local optimistic `links` state; call reorder action on drag end. | `src/app/dashboard/microsites/[id]/microsite-editor.tsx` |
| Public DTO query | Public read contract for microsite pages and polling API. | Already selects `theme`, `coverImage`, `avatarImage`, active links ordered by `order`; keep this contract stable. | `src/lib/public-microsite.ts` |
| Public renderer | Applies selected theme and renders ordered active links. | Replace local `themeStyles` with shared registry mapping; fallback to default theme for legacy/invalid strings. | `src/components/microsite-page-client.tsx` |
| Public polling API | Keeps public page updated after dashboard changes. | No new endpoint needed; existing DTO reflects theme and order because query already orders links. | `src/app/api/microsites/[slug]/route.ts` |
| Microsite edit page bootstrap | Supplies editor initial links. | Verify server query orders `links` by `order asc`; if missing, add `orderBy`. | `src/app/dashboard/microsites/[id]/page.tsx` |

## Data Model Integration

### Theme variants

Existing model has `Microsite.theme String @default("dark")` at `prisma/schema.prisma`. For this milestone, keep string storage and validate in application code. Reason: variants are product/UI configuration, not relational data, and existing rows already store string IDs. Prisma enum adds migration friction without much value unless theme IDs become long-lived public API.

Recommended shared type:

```typescript
export const MICROSITE_THEMES = {
  dark: { label: "Dark", preview: ..., public: ... },
  light: { label: "Light", preview: ..., public: ... },
  gradient: { label: "Gradient", preview: ..., public: ... },
  sunset: { label: "Sunset", preview: ..., public: ... },
  forest: { label: "Forest", preview: ..., public: ... },
} as const;

export type MicrositeThemeId = keyof typeof MICROSITE_THEMES;
export const DEFAULT_MICROSITE_THEME: MicrositeThemeId = "dark";

export function normalizeMicrositeTheme(value: FormDataEntryValue | string | null | undefined): MicrositeThemeId {
  return typeof value === "string" && value in MICROSITE_THEMES
    ? (value as MicrositeThemeId)
    : DEFAULT_MICROSITE_THEME;
}
```

Use same function in `createMicrosite` and `updateMicrosite`. Public renderer should not trust DB blindly; use registry lookup with default fallback.

### Link ordering

Existing `MicrositeLink.order Int @default(0)` already supports persisted ordering. Existing `createMicrositeLink` appends with `max(order) + 1`. Existing `getPublishedMicrosite` already uses `orderBy: { order: "asc" }`. Architecture should harden, not reinvent.

Recommended schema additions:

```prisma
model MicrositeLink {
  ...
  order       Int      @default(0)
  micrositeId String

  @@index([micrositeId, order])
}
```

Do **not** add `@@unique([micrositeId, order])` in first pass unless reorder action uses two-phase temporary values or delete/reinsert style updates. Directly updating multiple rows from order A to order B can transiently violate uniqueness. Index gives read performance and ordering support with low risk.

Migration must also address known drift: checked-in migration lacks `Microsite.avatarImage` while schema and runtime use it. Next migration should include both `avatarImage` if missing and link-order index. Confirm database state before applying because live DB may already have column manually.

## Server Action Integration

### Theme validation

Update these paths:

- `src/app/actions/microsite.ts:createMicrosite`
- `src/app/actions/microsite.ts:updateMicrosite`

Rules:

1. Parse `theme` through `normalizeMicrositeTheme`.
2. Store only allowed theme IDs.
3. Preserve current theme when form omits theme during publish toggle.
4. Revalidate both dashboard editor path and public microsite path after update.

Important existing bug: `handleTogglePublished` builds FormData with only `title` and `isPublished`; `updateMicrosite` currently defaults `description`, `coverImage`, and `avatarImage` to null when omitted. This can wipe images/description during publish toggle. Fix before or during theme work: update action should preserve existing nullable fields when fields absent, or toggle should submit full state. Better architecture: action merges partial FormData with existing microsite.

### Reorder hardening

Existing `reorderMicrositeLinks(micrositeId, orderedIds)` checks microsite access, then updates arbitrary IDs. Fix before wiring drag-and-drop.

Recommended contract:

```typescript
export async function reorderMicrositeLinks(micrositeId: string, orderedIds: string[]) {
  const access = await getCurrentUserAccess();
  const microsite = await getEditableMicrosite(micrositeId, access);

  const uniqueIds = [...new Set(orderedIds)];
  if (uniqueIds.length !== orderedIds.length) throw new Error("Duplicate link ids");

  const links = await prisma.micrositeLink.findMany({
    where: { micrositeId, id: { in: uniqueIds } },
    select: { id: true },
  });

  if (links.length !== uniqueIds.length) throw new Error("Invalid link order");

  await prisma.$transaction(
    uniqueIds.map((id, index) =>
      prisma.micrositeLink.update({ where: { id }, data: { order: index } })
    )
  );

  revalidatePath(`/dashboard/microsites/${micrositeId}`);
  revalidatePath(`/${microsite.slug}`);
  return { success: true };
}
```

If UI submits only subset of links, decide explicit behavior. Recommended: submit full current list, including inactive links. Public query hides inactive but dashboard order should remain stable if link later reactivated.

## Dashboard Editor Integration

### Theme picker

Replace local `THEMES` array in `src/app/dashboard/microsites/[id]/microsite-editor.tsx` with shared theme registry. Keep UI route-local because only editor needs preview controls. New variants should be registry-only additions plus optional visual QA.

Avoid scattering Tailwind classes across editor and public renderer. Recommended structure:

- `preview` tokens: mini card classes for editor.
- `public` tokens: page, hero, title, description, avatar, card, icon, footer classes for public renderer.

### Drag-and-drop ordering

Use minimal dependency only if existing stack lacks DnD primitives. Best fit: `@dnd-kit/core` + `@dnd-kit/sortable` if dependency acceptable. It is React-friendly, accessible enough with keyboard sensor support, and does not require architecture change. If dependency minimization matters, implement HTML5 pointer drag manually, but accessibility and mobile behavior cost rises.

Editor state shape:

```typescript
const [links, setLinks] = useState(microsite.links);

function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;
  if (!over || active.id === over.id) return;

  const nextLinks = arrayMove(...);
  setLinks(nextLinks);
  startTransition(async () => {
    try {
      await reorderMicrositeLinks(microsite.id, nextLinks.map((link) => link.id));
      router.refresh();
    } catch (err) {
      setLinks(microsite.links); // rollback
      setError(getErrorMessage(err));
    }
  });
}
```

Editor should render from local `links`, not `microsite.links`, after DnD. Add handle icon from `lucide-react` such as `GripVertical`. Keep edit/delete/toggle buttons inside sortable row. Disable drag while edit form open or while pending if interactions conflict.

## Public Rendering Integration

Public path already fits target:

- `src/app/[username]/page.tsx` resolves short link first, then microsite.
- `src/lib/public-microsite.ts` selects `theme` and active links ordered by `order asc`.
- `src/app/api/microsites/[slug]/route.ts` reuses public query for polling.
- `src/components/microsite-page-client.tsx` computes styles from `microsite.theme` and maps links in DTO order.

Needed changes:

1. Import shared theme registry into `microsite-page-client.tsx`.
2. Use `getMicrositeTheme(microsite.theme)` fallback helper.
3. Keep `hasMicrositeChanged` comparing ordered link IDs and titles; it already catches reorder because index comparison changes.
4. Confirm public click route still receives same link IDs; no change to URL format needed.

## Data Flow

### Theme update flow

1. User selects theme in dashboard editor.
2. Editor stores selected theme ID in hidden `theme` field.
3. `updateMicrosite(id, formData)` validates ID against shared registry.
4. Prisma updates `Microsite.theme`.
5. Action revalidates `/dashboard/microsites/${id}` and `/${slug}`.
6. Public page render and polling API return updated `theme`.
7. `MicrositePageClient` applies theme registry public classes.

### Link reorder flow

1. User drags link row in dashboard editor.
2. Editor reorders local `links` array optimistically.
3. Editor calls `reorderMicrositeLinks(microsite.id, orderedIds)`.
4. Server action verifies current user can edit microsite.
5. Server action verifies every ordered ID belongs to same microsite and no duplicates exist.
6. Prisma transaction updates `MicrositeLink.order` values.
7. Action revalidates dashboard editor and public slug.
8. Public DTO query returns active links by `order asc`.
9. Public renderer maps DTO order directly.

## Suggested Build Order

1. **Migration safety first**
   - Add migration for existing `avatarImage` drift if needed.
   - Add `@@index([micrositeId, order])` to `MicrositeLink`.
   - Run `npx prisma generate`.

2. **Shared theme registry**
   - Create `src/lib/microsite-themes.ts`.
   - Move current `dark`, `light`, `gradient` classes into registry.
   - Add new variants only after current variants render unchanged.

3. **Server action validation and partial update safety**
   - Normalize theme in create/update.
   - Preserve existing fields when FormData omits optional fields.
   - Harden URL validation opportunistically for microsite links if phase budget allows; current concern exists.

4. **Public renderer refactor**
   - Import registry in `src/components/microsite-page-client.tsx`.
   - Preserve fallback to `dark` for bad legacy values.
   - Verify polling detects theme/order change.

5. **Editor theme variants**
   - Replace local `THEMES` with registry preview data.
   - Add selected-state styling only; no server calls until save.

6. **Reorder server action hardening**
   - Update `reorderMicrositeLinks` with ownership validation and `$transaction`.
   - Revalidate public slug as well as dashboard path.

7. **Drag-and-drop editor UI**
   - Add sortable row component near `microsite-editor.tsx` or as route-local file.
   - Submit full link order on drag end.
   - Roll back optimistic state on action failure.

8. **Verification**
   - Check dashboard edit, theme save, publish toggle, add/edit/delete/toggle link, drag reorder, public page, public polling.
   - Run `npm run lint` and `npx tsc --noEmit`.

## Migration Needs

| Need | Why | Recommended Action |
|------|-----|--------------------|
| `Microsite.avatarImage` drift fix | Schema uses field; checked-in migration lacks column. Fresh DB can break current app. | Add migration that safely adds nullable column if absent. |
| `MicrositeLink(micrositeId, order)` index | Public and dashboard reads sort links per microsite. | Add Prisma index and migration. |
| Theme enum | Optional only. String plus validation is enough for current milestone. | Defer unless product needs DB-level allowed values. |
| Unique order per microsite | Nice invariant, but direct reorder updates can conflict. | Defer; add later with two-phase reorder algorithm if needed. |

## Repo Paths to Touch

Primary:

- `src/lib/microsite-themes.ts` — new shared theme registry and helpers.
- `src/app/actions/microsite.ts` — theme validation, partial update safety, reorder hardening.
- `src/app/dashboard/microsites/[id]/microsite-editor.tsx` — theme picker registry integration and DnD ordering UI.
- `src/components/microsite-page-client.tsx` — theme registry consumption.
- `prisma/schema.prisma` — link-order index and schema drift alignment.
- `prisma/migrations/*` — migration SQL.

Check/possibly touch:

- `src/app/dashboard/microsites/[id]/page.tsx` — ensure editor bootstrap orders links by `order asc`.
- `src/lib/public-microsite.ts` — likely no change; already selects theme and orders active links.
- `src/app/api/microsites/[slug]/route.ts` — likely no change; inherits DTO.
- `src/app/api/click/microsite-link/[linkId]/route.ts` — optional security hardening for inactive/unpublished direct clicks.

## Patterns to Follow

### Pattern 1: Shared Registry, Not Duplicate Theme Maps

**What:** Store theme ID, label, preview classes, and public classes in one module.  
**When:** Any UI both edits and renders same product style setting.  
**Example:**

```typescript
const styles = getMicrositeTheme(microsite.theme).public;
```

### Pattern 2: Server Action Owns Trust Boundary

**What:** Client may reorder optimistically, but server validates ownership and membership before writes.  
**When:** Any ordered ID array from browser.  
**Example:** fetch all IDs by `{ micrositeId, id: { in: orderedIds } }`, reject count mismatch, then transaction update.

### Pattern 3: Public DTO Is Rendering Contract

**What:** Public renderer consumes DTO order directly; no client-side sorting.  
**When:** Server query already encodes visibility and ordering rules.  
**Example:** `links: { where: { isActive: true }, orderBy: { order: "asc" } }`.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Theme Classes Split Across Editor and Public Renderer

**Why bad:** New variants drift; preview lies; public fallback behavior differs.  
**Instead:** Shared registry with preview/public token groups.

### Anti-Pattern 2: Trusting Ordered IDs From Browser

**Why bad:** Existing action can update link IDs outside microsite after only parent access check.  
**Instead:** Verify all IDs belong to `micrositeId` and update inside transaction.

### Anti-Pattern 3: Adding Unique Order Constraint Before Reorder Algorithm Supports It

**Why bad:** Sequential order swaps can violate unique constraint mid-transaction.  
**Instead:** Start with index; add uniqueness later with temporary-order two-phase updates.

### Anti-Pattern 4: Publish Toggle Through Full Update With Missing Fields

**Why bad:** Current action can null optional fields when FormData omits them.  
**Instead:** Partial-update semantics or dedicated `setMicrositePublished` action.

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| Theme variants | Static class registry enough. | Same; avoid per-theme DB rows unless admin-editable themes appear. | Move to CDN/static CSS tokens only if theme count explodes. |
| Link ordering | Transaction updating 5-20 rows fine. | Add `(micrositeId, order)` index; keep reorder full-list small. | Consider fractional ranking only if users manage hundreds of links. |
| Public rendering | Existing server render + polling fine. | Polling every 10s may cost; consider ETag or longer interval. | Replace polling with cache invalidation/live mechanism if traffic high. |
| Click tracking | Unchanged by reorder. | Existing synchronous/direct writes become bottleneck. | Queue/rollup click analytics; unrelated but important. |

## Research Flags for Implementation Phase

- Confirm `src/app/dashboard/microsites/[id]/page.tsx` orders links before editor receives them.
- Confirm live DB migration state for `avatarImage` before writing migration.
- Decide dependency policy for `@dnd-kit/*`; if no new deps allowed, build pointer-based reorder with keyboard fallback.
- Add focused tests or manual UAT for cross-user reorder rejection because current code has known ownership gap.

## Sources

- `.planning/PROJECT.md` — milestone scope and constraints.
- `.planning/codebase/ARCHITECTURE.md` — existing layers, data flow, and mutation patterns.
- `.planning/codebase/STRUCTURE.md` — repo paths and placement conventions.
- `.planning/codebase/CONCERNS.md` — migration drift, reorder ownership bug, public endpoint concerns.
- `src/app/actions/microsite.ts` — current theme/link server actions and reorder implementation.
- `prisma/schema.prisma` — current `Microsite.theme`, `Microsite.avatarImage`, and `MicrositeLink.order` fields.
- `src/app/dashboard/microsites/[id]/microsite-editor.tsx` — current editor theme picker and link list UI.
- `src/lib/public-microsite.ts` — public DTO query and existing link order.
- `src/components/microsite-page-client.tsx` — current public theme map, polling, and link rendering.
