# Technology Stack Research: Taut Microsite Enhancements

**Project:** Taut microsite enhancements  
**Dimension:** Stack choices for theme variants + drag-and-drop link ordering  
**Researched:** 2026-06-26  
**Overall confidence:** MEDIUM

## Recommendation

Use current stack first. Add only `dnd-kit` for accessible sortable drag-and-drop. Do not add theme frameworks, state stores, form libraries, or page-builder tooling.

| Need | Decision | Package impact | Confidence | Why |
|------|----------|----------------|------------|-----|
| Theme variants | Centralize theme definitions in TypeScript and Tailwind v4 utility class tokens | No new dependency | HIGH | Existing app already stores `Microsite.theme` as string and renders Tailwind class maps in editor/public page. Variants are data, not new framework. |
| Theme picker UI | Reuse shadcn/Radix primitives + existing `Button`, `Card`, `Label`, `Badge` | No new dependency | HIGH | Current editor already uses these primitives. Consistent dashboard UI, less CSS drift. |
| Public theme rendering | Reuse `src/components/microsite-page-client.tsx` class-map pattern, but move theme config to shared file | No new dependency | HIGH | Public client already chooses theme by `microsite.theme`; shared config prevents editor/public mismatch. |
| Drag-and-drop sorting | Add `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` | New dependency | MEDIUM | dnd kit docs describe built-in sort/reorder, sensors for mouse/touch/keyboard, TypeScript support, and accessibility focus. Best fit for React client island. |
| Persistence | Add server action `reorderMicrositeLinks(micrositeId, orderedLinkIds)` using Prisma `update` transaction | No new dependency | HIGH | Existing mutation boundary is `src/app/actions/microsite.ts`; ownership checks already live there. |

## Current Package Reuse Before New Dependencies

### Keep using existing packages

| Package / tool | Use for | Files |
|----------------|---------|-------|
| Next.js App Router + Server Actions | Persist theme and link order, refresh dashboard/public cache | `src/app/actions/microsite.ts`, `src/app/dashboard/microsites/[id]/page.tsx`, `src/app/[username]/page.tsx` |
| React 19 | Local editor state, optimistic reorder state, transition while saving | `src/app/dashboard/microsites/[id]/microsite-editor.tsx` |
| Prisma 7 + PostgreSQL | Store `Microsite.theme`; store `MicrositeLink.order` | `prisma/schema.prisma`, `src/lib/public-microsite.ts`, `src/app/actions/microsite.ts` |
| Tailwind CSS v4 | Theme classes, previews, public page variants | `src/app/globals.css`, new `src/lib/microsite-themes.ts`, `src/components/microsite-page-client.tsx` |
| shadcn/Radix UI | Theme picker cards/buttons, editor controls, focus-visible states | `src/components/ui/*`, `src/app/dashboard/microsites/[id]/microsite-editor.tsx` |
| lucide-react | Drag handle icon, theme affordance icons | `src/app/dashboard/microsites/[id]/microsite-editor.tsx` |
| framer-motion | Optional micro-animation only after dnd works | Avoid initially | Already installed, but not right primitive for accessible sorting/persistence. |

### Add one dependency group

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Do not install `react-beautiful-dnd`; it is deprecated/unmaintained lineage and poor 2026 choice. Do not install `react-dnd`; too heavy for single-list sorting and worse DX for keyboard sorting. Do not install `sortablejs`; imperative DOM style fights React state and server-action persistence.

## Exact Implementation Placement

### Theme variants

Create shared theme source of truth:

| File | Action |
|------|--------|
| `src/lib/microsite-themes.ts` | New file. Export `MICROSITE_THEMES`, `MicrositeThemeId`, `DEFAULT_MICROSITE_THEME`, `getMicrositeTheme(id)`. Include editor preview classes and public render classes in one object. |
| `src/app/dashboard/microsites/[id]/microsite-editor.tsx` | Remove inline `THEMES` array. Import `MICROSITE_THEMES`. Use same theme IDs as hidden `theme` input. |
| `src/components/microsite-page-client.tsx` | Remove local `themeStyles`. Import `getMicrositeTheme`. Keep fallback to default. |
| `src/app/actions/microsite.ts` | Validate submitted `theme` against `MICROSITE_THEMES` IDs before saving. Reject unknown values or coerce to default. |
| `src/lib/public-microsite.ts` | Keep selecting `theme`; ensure active links ordered by `order` then `createdAt`/`id`. |
| `prisma/schema.prisma` | No schema change needed for variants. `Microsite.theme String @default("dark")` remains enough for a small enum-like catalog. |

Recommended theme IDs:

```ts
export const DEFAULT_MICROSITE_THEME = "dark";

export const MICROSITE_THEMES = [
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
  { id: "gradient", label: "Sky Gradient" },
  { id: "midnight", label: "Midnight" },
  { id: "sunset", label: "Sunset" },
  { id: "forest", label: "Forest" },
  { id: "mono", label: "Mono" },
] as const;
```

Keep IDs stable forever. Theme IDs become persisted data and public API surface.

### Drag-and-drop ordering

Use `dnd-kit` inside existing editor client island, not page-level server component.

| File | Action |
|------|--------|
| `src/app/dashboard/microsites/[id]/microsite-editor.tsx` | Split link list into local sortable state. Wrap rendered links with `DndContext` + `SortableContext`. Add drag handle button with keyboard label. On drag end, reorder local array and call server action. |
| `src/app/actions/microsite.ts` | Add `reorderMicrositeLinks(micrositeId: string, orderedLinkIds: string[])`. Check session, load microsite owner/global viewer rules, verify all IDs belong to same microsite, update `order` in transaction. |
| `src/lib/public-microsite.ts` | Ensure `links: { where: { isActive: true }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] }`. Public order must match saved order. |
| `src/app/api/microsites/[slug]/route.ts` | No special change if it uses `getPublishedMicrosite`; inherits order. |
| `prisma/schema.prisma` | Keep `MicrositeLink.order Int @default(0)`. Add index only if list grows: `@@index([micrositeId, order])`. For small link-in-bio lists, optional. |

Prescriptive dnd-kit setup:

```tsx
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
```

Use `PointerSensor` + `KeyboardSensor`. Use `verticalListSortingStrategy`. Use a drag handle, not whole card, because link cards already contain buttons and anchors.

## Server Action Contract

Add to `src/app/actions/microsite.ts`:

```ts
export async function reorderMicrositeLinks(micrositeId: string, orderedLinkIds: string[]) {
  // 1. require session
  // 2. verify microsite ownership / existing global viewer policy
  // 3. verify orderedLinkIds contains exactly links for microsite, no foreign IDs, no duplicates
  // 4. prisma.$transaction(orderedLinkIds.map((id, index) => prisma.micrositeLink.update({ where: { id }, data: { order: index } })))
  // 5. revalidate dashboard microsite path and public slug path
}
```

Important validation:

- Reject duplicate IDs.
- Reject IDs not owned by microsite.
- Decide whether inactive links participate. Recommendation: reorder all links visible in dashboard, active and inactive, because users expect hidden links to keep position when re-enabled.
- Use dense zero-based `order` values after every reorder.
- Keep CRUD actions assigning `order = max(order) + 1` on create.

## Rationale

Theme variants should remain configuration, not a styling subsystem. Current app already has Tailwind class maps duplicated between editor preview and public page. Shared config gives fastest safe win: more themes, same persistence, no schema change, no new package risk.

Drag-and-drop needs one focused dependency because native HTML drag events are poor for touch and keyboard accessibility. dnd kit remains best fit: React-friendly hooks, sortable abstraction, sensors, modifiers, TypeScript support, no giant page-builder model. It fits existing client component without changing server architecture.

Persistence belongs in server actions because all existing authenticated writes use `src/app/actions/microsite.ts`. Keeping reorder there preserves auth/ownership pattern and avoids route-handler duplication.

## Risks And Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Editor preview and public render drift | User saves one look, public page shows another | Single `src/lib/microsite-themes.ts` source used by both. |
| Unknown theme string in DB | Broken public rendering | `getMicrositeTheme()` fallback to `dark`; server action allowlist validation. |
| Tailwind v4 class detection misses dynamic classes | Theme styles missing in production | Store complete literal class strings in exported objects; avoid constructing class names like `bg-${color}`. |
| Drag on whole card conflicts with edit/delete/open buttons | Bad UX, accidental drags | Use explicit handle button. Keep other controls normal. |
| Keyboard users cannot reorder | Accessibility regression | Use `KeyboardSensor` + visible handle label. Test tab/focus path. |
| Race during reorder save | Public order stale or jumps | Optimistic local reorder, disable further reorder while save pending, revert or refresh on error. |
| Foreign link ID attack | Cross-user link order tampering | Server action verifies every ID belongs to owned microsite before transaction. |
| Existing migration drift around `avatarImage` | Prisma migration surprises | Avoid unrelated schema changes unless index added. If schema changes, inspect DB state and run `npx prisma generate`. |

## Alternatives Rejected

| Alternative | Why not |
|-------------|---------|
| CSS variables/theme provider for public microsites | Overkill for seven curated themes. Tailwind class objects clearer and current-compatible. |
| Storing full theme JSON per microsite | Makes migrations/content validation harder, invites unsafe arbitrary styling. Store ID only. |
| `react-beautiful-dnd` / forks | Legacy ecosystem; not recommended for new 2026 React work. |
| `react-dnd` | Strong for complex drag/drop canvases, too heavy for vertical sortable list. |
| `sortablejs` / imperative DOM reorder | More fragile with React state, server actions, and accessibility. |
| Framer Motion reorder only | Already installed but not persistence/accessibility complete enough as primary reorder stack. |
| New global state manager | Local editor state is enough; server remains source of truth. |

## Verification Commands

```bash
npm run lint
npx tsc --noEmit
```

If `prisma/schema.prisma` changes:

```bash
npx prisma generate
```

## Sources

- Existing project context: `.planning/PROJECT.md` (HIGH)
- Existing stack map: `.planning/codebase/STACK.md` (HIGH)
- Existing architecture map: `.planning/codebase/ARCHITECTURE.md` (HIGH)
- Current package inventory: `package.json` (HIGH)
- Current editor implementation: `src/app/dashboard/microsites/[id]/microsite-editor.tsx` (HIGH)
- Current public renderer: `src/components/microsite-page-client.tsx` (HIGH)
- Current schema: `prisma/schema.prisma` (HIGH)
- dnd kit docs overview fetched 2026-06-26: framework support, sortable/reorder, sensors, accessibility/performance claims (LOW via webfetch; use docs for API shape, verify package behavior during implementation)

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Theme stack | HIGH | Existing code already uses this pattern; no dependency or schema change needed. |
| Drag-and-drop stack | MEDIUM | dnd kit is right category choice; verify exact 2026 API versions during install because docs source confidence from webfetch classified LOW. |
| Persistence approach | HIGH | Aligns with existing server action + Prisma pattern. |
| Risk profile | HIGH | Main risks are known: validation, accessibility, Tailwind class discovery, migration drift. |
