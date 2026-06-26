# Feature Landscape

**Domain:** Link-in-bio microsite customization and link ordering  
**Project:** Taut microsite enhancements  
**Researched:** 2026-06-26  
**Context:** Brownfield Next.js app. Target increment: more microsite visual theme variants plus drag-and-drop ordering for microsite links.

## Current Repo Reality

| Area | Current State | Repo Paths |
|------|---------------|------------|
| Microsite editor | Client component handles title, description, avatar, cover, publish toggle, three-theme picker, link CRUD, active toggle. | `src/app/dashboard/microsites/[id]/microsite-editor.tsx` |
| Microsite mutations | Server actions enforce session/user ownership, update theme, create links with incremental `order`, update/delete links, and already expose `reorderMicrositeLinks(micrositeId, orderedIds)`. | `src/app/actions/microsite.ts` |
| Public microsite render | Theme styles live in local `themeStyles`; renders selected theme with active public links and polling refresh. | `src/components/microsite-page-client.tsx` |
| Public data query | Public DTO should keep active links only and preserve `order`; roadmap should verify query ordering. | `src/lib/public-microsite.ts` |
| Public polling API | Returns public microsite JSON for live refresh. | `src/app/api/microsites/[slug]/route.ts` |
| Data model | `Microsite.theme` string default `dark`; `MicrositeLink.order` int default `0`. | `prisma/schema.prisma` |

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes / Acceptance Implications | Repo Paths |
|---------|--------------|------------|----------------------------------|------------|
| Expanded theme choices visible in editor | Users asked for more visual theme variants; current 3 choices feels basic for link-in-bio product. | Low | Add curated variants, not arbitrary style controls. Each option needs label, selected state, preview, persisted `theme` id. | `src/app/dashboard/microsites/[id]/microsite-editor.tsx` |
| Public page exactly matches saved theme | Theme picker useless if public page differs. | Low-Med | Every new theme id in editor must exist in public `themeStyles`; unknown/stale value must safely fall back to `dark`. | `src/components/microsite-page-client.tsx`, `src/lib/public-microsite.ts` |
| Theme preview approximates real public look | Users choose visually; preview must be trustworthy. | Low | Preview should show background, avatar dot, link-card treatment, contrast. No misleading thumbnails. | `src/app/dashboard/microsites/[id]/microsite-editor.tsx` |
| Theme persistence through save/refresh | Expected form behavior. | Low | Selecting theme alone can stay local, but clicking `Simpan` must persist; refresh editor and public page show saved theme. | `src/app/actions/microsite.ts`, `src/app/dashboard/microsites/[id]/microsite-editor.tsx` |
| Accessible theme contrast | Public microsites are user-facing pages; themes must keep text and link cards readable. | Med | Each new theme needs readable title, description, link text, icon, share bar, footer states. Avoid low-contrast aesthetic themes. | `src/components/microsite-page-client.tsx` |
| Drag-and-drop reorder affordance | Users expect visible grip/drag handle, not hidden reordering. | Med | Add handle icon, cursor state, dragged item styling, drop target feedback. Do not make edit/delete buttons drag handles. | `src/app/dashboard/microsites/[id]/microsite-editor.tsx` |
| Reorder persists to database | Core requirement: public order follows saved dashboard order. | Med | Use existing `reorderMicrositeLinks(micrositeId, orderedIds)` or harden it. After reorder, refresh/revalidate dashboard and public slug. | `src/app/actions/microsite.ts`, `prisma/schema.prisma` |
| Public microsite links render in saved order | Visitor behavior must match owner intent. | Med | Public query must order links by `order` ascending and likely `createdAt`/`id` as tie-breaker. Polling diff must detect link order changes. | `src/lib/public-microsite.ts`, `src/components/microsite-page-client.tsx` |
| Active/inactive filtering unchanged | Reordering should not reveal hidden links or alter visibility. | Low-Med | Dashboard may show all links; public page must show active links only. Inactive link order may still persist for later reactivation. | `src/app/dashboard/microsites/[id]/microsite-editor.tsx`, `src/lib/public-microsite.ts` |
| Link CRUD still works after reordering | Existing add/edit/delete/toggle flows are core product behavior. | Med | Add link should append to end. Delete should not break remaining order. Edit mode should not conflict with drag actions. | `src/app/actions/microsite.ts`, `src/app/dashboard/microsites/[id]/microsite-editor.tsx` |
| Ownership enforcement on reorder | Reorder is mutation; must not allow cross-user link changes. | Med | Existing action checks microsite access but updates any passed id. Harden: verify every ordered id belongs to same microsite before update. | `src/app/actions/microsite.ts`, `src/lib/microsite-access.ts` |
| Mobile/touch reorder support | Link-in-bio owners often edit on phones. | Med-High | DnD library/pattern must work on pointer/touch/keyboard or provide explicit move buttons fallback. | `src/app/dashboard/microsites/[id]/microsite-editor.tsx` |
| Loading/error behavior during save | Reorder failures must not silently desync UI from DB. | Med | Optimistic reorder acceptable only if failure rolls back or triggers refresh plus error message. Disable conflicting actions while save pending. | `src/app/dashboard/microsites/[id]/microsite-editor.tsx` |

## Differentiators

Features not strictly required for MVP, but valuable and roadmap-worthy.

| Feature | Value Proposition | Complexity | Notes / Acceptance Implications | Repo Paths |
|---------|-------------------|------------|----------------------------------|------------|
| Theme groups by vibe/use case | Helps non-designers choose fast: professional, creator, event, minimal, playful. | Low-Med | Add labels/descriptions; keep choices curated. Avoid bloated picker. | `src/app/dashboard/microsites/[id]/microsite-editor.tsx` |
| Live public-style preview panel | Increases confidence before save. | Med | Preview can reuse shared theme token map to prevent editor/public drift. | Possible new `src/lib/microsite-themes.ts`, `src/app/dashboard/microsites/[id]/microsite-editor.tsx`, `src/components/microsite-page-client.tsx` |
| Shared theme registry | Prevents duplicate theme definitions and mismatch between editor and public render. | Med | Extract ids, labels, preview classes, and public classes into typed constant; use `as const` union. | New `src/lib/microsite-themes.ts` |
| Keyboard-accessible reorder controls | Improves accessibility and gives fallback when drag fails. | Med | Add “Move up/down” buttons or keyboard DnD support. Acceptance: tab to item, move with controls, persisted order updates. | `src/app/dashboard/microsites/[id]/microsite-editor.tsx`, `src/components/ui/button.tsx` |
| Autosave reorder | Feels modern; no separate save button needed for order. | Med | Must show saving/saved/error status. Debounce rapid moves. Avoid losing updates. | `src/app/dashboard/microsites/[id]/microsite-editor.tsx`, `src/app/actions/microsite.ts` |
| Undo last reorder | Lowers anxiety for accidental drag. | Med | Can be client-only until next navigation; not necessary for MVP. | `src/app/dashboard/microsites/[id]/microsite-editor.tsx` |
| Theme-aware cover/avatar blending | Better polish: cover gradient overlay and avatar ring adapt per theme. | Med | Public `themeStyles` already controls hero/avatar classes; extend consistently. | `src/components/microsite-page-client.tsx` |

## Anti-Features

Features to explicitly NOT build in this milestone.

| Anti-Feature | Why Avoid | What to Do Instead | Repo Paths Affected |
|--------------|-----------|-------------------|---------------------|
| Arbitrary color picker / custom CSS | Raises accessibility, validation, XSS-ish styling, support, and design QA cost. | Ship curated theme ids with known contrast and typed registry. | Avoid broad changes beyond `src/app/dashboard/microsites/[id]/microsite-editor.tsx`, `src/components/microsite-page-client.tsx` |
| Full design-system rewrite | Project scope says no design-system rewrite. | Add small reusable theme registry or route-local UI only. | Avoid churn in `src/components/ui/*` |
| Payment-gated/pro themes | Monetization out of scope and adds entitlement logic. | Make all new variants available. | Avoid billing/auth changes |
| Per-link theme/style controls | Explodes complexity and distracts from microsite-level visual variants. | Keep one microsite theme controlling all public elements. | `src/components/microsite-page-client.tsx` |
| Reordering only active links | Creates confusing behavior when inactive links are reactivated. | Reorder full dashboard list; public still filters inactive. | `src/app/dashboard/microsites/[id]/microsite-editor.tsx`, `src/lib/public-microsite.ts` |
| Reorder by editing numeric order fields | Poor UX; user asked drag-and-drop. | Use drag handles plus optional accessible move up/down controls. | `src/app/dashboard/microsites/[id]/microsite-editor.tsx` |
| New public routing model | High regression risk; project explicitly says keep short-link-first resolution. | Keep `/:username` flow unchanged. | `src/app/[username]/page.tsx` |
| New auth/provider work | Not relevant to visual themes or order. | Reuse existing Google/NextAuth session and action ownership checks. | `src/lib/auth.ts`, `src/proxy.ts` |
| Heavy analytics changes | Click tracking must keep working, but analytics redesign not required. | Verify click tracking unaffected. | `src/app/api/click/microsite-link/[linkId]/route.ts`, `src/app/dashboard/analytics/page.tsx` |

## Feature Dependencies

```text
Theme registry / theme ids → Editor theme picker → Public theme renderer → Public polling reflects changed theme

Existing Microsite.theme field → More theme variants (no schema change required if using string ids)

Existing MicrositeLink.order field → Reorder action hardening → Drag-and-drop UI → Public query order verification

Drag-and-drop UI → Optimistic/local ordered state → reorderMicrositeLinks server action → router.refresh / revalidate public slug

Reorder persistence → Public microsite data query orderBy → MicrositePageClient order-change detection
```

## MVP Recommendation

Prioritize:

1. **Curated theme expansion**
   - Add 3-5 new theme ids with clear labels and previews.
   - Keep no schema migration: `Microsite.theme` already string.
   - Prefer extracting shared typed registry if implementation remains small.

2. **Public theme parity**
   - Every editor theme has public style mapping.
   - Unknown theme falls back to `dark`.
   - Public polling detects theme changes and updates rendered page.

3. **Robust drag-and-drop ordering**
   - Use existing `MicrositeLink.order` and `reorderMicrositeLinks` action.
   - Harden action against cross-microsite ordered ids.
   - Add editor drag handles, save state, error recovery.
   - Verify public query orders active links by `order`.

Defer:

- **Custom colors/CSS:** too much validation and accessibility risk.
- **Undo/history:** useful but not required to satisfy milestone.
- **Payment-gated themes:** explicitly out of scope.
- **Analytics UI changes:** only regression-test click tracking.

## Acceptance Implications

### Theme Selection Acceptance

- Editor at `src/app/dashboard/microsites/[id]/microsite-editor.tsx` shows existing `dark`, `light`, `gradient` plus added variants.
- Selecting theme changes selected visual state and hidden `theme` form value.
- Clicking `Simpan` persists theme via `updateMicrosite` in `src/app/actions/microsite.ts`.
- Reloading editor keeps saved theme selected.
- Public page at `src/components/microsite-page-client.tsx` applies same saved theme to page background, title, description, avatar, link cards, share bar, and footer.
- Public polling via `src/app/api/microsites/[slug]/route.ts` reflects theme change without full manual refresh within existing polling behavior.
- Unknown theme values render safe `dark` fallback, not broken classes.
- New themes pass basic contrast/readability check for title, description, link text, icons, and share controls.

### Link Reordering Acceptance

- Dashboard links in `src/app/dashboard/microsites/[id]/microsite-editor.tsx` can be reordered by drag and drop.
- Reorder controls do not conflict with edit, delete, visibility toggle, or external-link buttons.
- Reorder persists using `reorderMicrositeLinks` in `src/app/actions/microsite.ts`.
- Server action verifies microsite ownership and verifies every ordered id belongs to same `micrositeId` before updating.
- New links created by `createMicrositeLink` append to end using current max `order`.
- Public data from `src/lib/public-microsite.ts` orders active links by `order` ascending with deterministic tie-breaker.
- Public microsite rendered by `src/components/microsite-page-client.tsx` shows saved order.
- Inactive links stay hidden publicly but remain reorderable in dashboard.
- Delete/edit/toggle after reorder still works and does not reset order.
- On failed reorder save, UI shows error and either rolls back to last known DB order or refreshes from server.

## Complexity Notes

| Work Item | Complexity | Why |
|-----------|------------|-----|
| Add curated theme variants | Low | Mostly data/classes in editor and public renderer. |
| Extract shared theme registry | Med | Reduces drift but requires import-safe structure usable by client components. |
| Public theme parity | Low-Med | Straightforward if theme map centralized; risk is class mismatch/contrast. |
| Drag-and-drop UI | Med | Needs pointer/touch behavior, local state, visual feedback, pending/error state. |
| Accessible reorder fallback | Med | Extra UI logic but improves reliability and testability. |
| Server reorder hardening | Med | Need validate full ordered id set belongs to microsite before batch update. |
| Public order verification | Low | Likely query `orderBy` adjustment in `src/lib/public-microsite.ts`. |

## Sources

- `.planning/PROJECT.md`
- `.planning/codebase/ARCHITECTURE.md`
- `.planning/codebase/STRUCTURE.md`
- `src/app/dashboard/microsites/[id]/microsite-editor.tsx`
- `src/app/actions/microsite.ts`
- `src/components/microsite-page-client.tsx`
- `prisma/schema.prisma`
