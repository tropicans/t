# Research Summary: Taut Microsite Enhancements

**Project:** Taut microsite enhancements  
**Scope:** More microsite theme variants and drag-and-drop ordering for microsite links  
**Synthesized:** 2026-06-26  
**Overall confidence:** HIGH for architecture and pitfalls; MEDIUM for DnD package/API details

## Executive Summary

Taut is an existing Next.js URL shortener plus link-in-bio product. This increment should stay brownfield and narrow: expand curated microsite themes, keep public rendering aligned with saved theme choice, and let dashboard users reorder microsite links with persisted order.

Best approach: reuse current Next.js App Router, Server Actions, Prisma/PostgreSQL, Tailwind v4, and shadcn/Radix patterns. Add only `@dnd-kit/core`, `@dnd-kit/sortable`, and `@dnd-kit/utilities` for accessible sortable drag-and-drop. Theme work should be configuration, not new framework: create one typed `src/lib/microsite-themes.ts` registry consumed by both editor and public renderer.

Main risks sit at trust boundaries and brownfield drift. Reorder payloads must be validated server-side per link ID, written atomically in a Prisma transaction, and revalidated for both dashboard and public slug. Theme IDs must be allowlisted because `Microsite.theme` is a free string. Before schema work, confirm known `Microsite.avatarImage` migration drift.

## Key Findings

### Stack Recommendations

| Need | Recommendation | Rationale |
|------|----------------|-----------|
| Theme variants | Shared TypeScript theme registry + literal Tailwind v4 classes | Existing app already stores `Microsite.theme` as string and maps Tailwind classes in editor/public render. |
| Theme picker UI | Reuse existing shadcn/Radix `Button`, `Card`, `Label`, `Badge` patterns | Keeps dashboard UI consistent; avoids design-system rewrite. |
| Public theme rendering | Import shared registry into `src/components/microsite-page-client.tsx` | Prevents editor/public theme drift. |
| Drag-and-drop | Add `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` | Best fit for React sortable list with pointer, touch, keyboard, TypeScript support. |
| Persistence | Harden `reorderMicrositeLinks(micrositeId, orderedLinkIds)` server action | Existing mutation boundary already lives in `src/app/actions/microsite.ts`. |
| Database | Keep `Microsite.theme String`; keep `MicrositeLink.order Int`; optionally add `@@index([micrositeId, order])` | Avoid enum migration friction; support stable ordered reads. |

Avoid: `react-beautiful-dnd`, `react-dnd`, `sortablejs`, theme frameworks, global state stores, form libraries, arbitrary CSS/theme builders.

### Table Stakes

- Editor shows current themes plus 3-5 curated new theme variants.
- Theme selection has clear label, selected state, preview, and persisted stable theme ID.
- Public microsite exactly matches saved theme; unknown/stale theme falls back to `dark`.
- Theme preview approximates real public look: background, avatar, link cards, contrast.
- Drag-and-drop has visible handle and does not conflict with edit/delete/toggle/open controls.
- Reorder persists to DB and public page renders active links in saved order.
- Inactive links remain hidden publicly but stay reorderable in dashboard.
- Link CRUD still works after reorder; new links append to end.
- Reorder action enforces ownership and validates every submitted link belongs to same microsite.
- Mobile/touch and keyboard reorder work, or explicit move up/down fallback exists.
- Save/reorder errors show feedback and rollback/refresh from server.

### Architecture Implications

Keep changes inside existing monolith. No new service, route model, API layer, or state manager.

Recommended data flow:

```text
Dashboard editor client
  src/app/dashboard/microsites/[id]/microsite-editor.tsx
    -> Server actions
       src/app/actions/microsite.ts
         -> Prisma/PostgreSQL
            prisma/schema.prisma
              -> Public DTO
                 src/lib/public-microsite.ts
                 src/app/api/microsites/[slug]/route.ts
                   -> Public renderer
                      src/components/microsite-page-client.tsx
```

Primary code boundaries:

- `src/lib/microsite-themes.ts` — new shared source of truth for allowed theme IDs, labels, preview classes, public classes, default/fallback helpers.
- `src/app/actions/microsite.ts` — theme validation, partial update safety, reorder ownership validation, transaction writes, path revalidation.
- `src/app/dashboard/microsites/[id]/microsite-editor.tsx` — consume registry; manage local ordered link state; wire DnD handle/sensors; rollback on failure.
- `src/components/microsite-page-client.tsx` — consume registry; render DTO order directly; keep fallback for legacy invalid theme.
- `src/lib/public-microsite.ts` — verify active links ordered by `order asc` with deterministic tie-breaker.
- `prisma/schema.prisma` — avoid theme enum now; add link-order index only if migration state safe.

Important architecture fix: `updateMicrosite` should not null `description`, `coverImage`, or `avatarImage` when FormData omits fields during publish toggle. Prefer partial-update semantics or dedicated publish toggle action.

### Pitfalls / Watch-outs

1. **Cross-microsite reorder attack** — Current reorder action validates editable microsite but can update arbitrary submitted link IDs. Fetch IDs scoped by `micrositeId`, reject duplicates/foreign IDs, then transaction update.
2. **Partial/non-atomic order writes** — `Promise.all` can leave duplicate/partial order if one write fails. Use `prisma.$transaction` and dense zero-based order.
3. **Theme drift between editor and public page** — Local `THEMES` and public `themeStyles` can diverge. Use one registry and server allowlist validation.
4. **Free-form theme string** — DB accepts any string. Normalize/validate in create/update; keep public fallback but prevent new invalid values.
5. **DnD state resets unsaved form work** — Editor uses uncontrolled inputs. Keep local ordered state; disable drag while editing/dirty; avoid unnecessary `router.refresh()` during active edits.
6. **Mouse-only reorder** — Must include keyboard sensor or move up/down fallback and mobile/touch verification.
7. **Public freshness gap** — Link mutations should revalidate public `/${slug}`, not only dashboard path.
8. **Contrast/Tailwind issues** — Keep literal Tailwind class strings in registry; visually test every theme with cover/no cover, avatar/no avatar, long text.
9. **Migration drift** — `Microsite.avatarImage` exists in schema but may be absent from checked-in migration. Confirm DB/migration state before touching schema.
10. **Lint-only false confidence** — Repo has no test script. Use `npm run lint`, `npx tsc --noEmit`, plus explicit browser/manual DB-backed UAT.

## Roadmap Implications

Suggested phases: 5.

### Phase 1 — Preflight, Registry, and Server Guardrails

**Rationale:** Build shared source of truth and close trust-boundary holes before UI expansion.

**Delivers:**
- Confirm DB/migration state for `avatarImage`; decide whether schema/index migration is safe.
- Create `src/lib/microsite-themes.ts` with current `dark`, `light`, `gradient` themes unchanged.
- Add `normalizeMicrositeTheme` / allowlist guard.
- Update create/update actions to validate theme and preserve omitted optional fields.
- Harden `reorderMicrositeLinks` membership validation and duplicate rejection before DnD UI.

**Features covered:** shared registry, public fallback, ownership enforcement, partial update safety.

**Pitfalls avoided:** theme drift, free-form theme writes, cross-user reorder, publish-toggle field wiping, migration drift.

**Research flag:** May need focused phase research only if migration state unclear.

### Phase 2 — Theme Expansion and Public Parity

**Rationale:** Theme variants are low complexity once registry exists; visible value ships early.

**Delivers:**
- Add 3-5 curated theme IDs such as `midnight`, `sunset`, `forest`, `mono`.
- Editor theme picker consumes registry preview metadata.
- Public renderer consumes registry public classes.
- Unknown DB theme falls back to default.
- Visual contrast matrix checked.

**Features covered:** expanded theme choices, trustworthy previews, public theme parity, persistence through save/refresh.

**Pitfalls avoided:** preview/public mismatch, low contrast, Tailwind dynamic class loss.

**Research flag:** Standard patterns; skip extra research unless design direction changes.

### Phase 3 — Reorder Backend Persistence and Public Order Contract

**Rationale:** Public saved order must be correct before drag UI can be trusted.

**Delivers:**
- Transactional reorder writes with dense `0..n-1` order.
- Full-list order contract including inactive links.
- Public slug revalidation after reorder and possibly link create/update/delete cleanup.
- Verify dashboard bootstrap and public DTO order by `order asc` plus stable tie-breaker.

**Features covered:** persisted order, public order, active/inactive behavior, link CRUD preservation.

**Pitfalls avoided:** partial order state, stale public page, inactive reactivation confusion.

**Research flag:** Standard patterns; no extra research unless adding DB uniqueness/fractional ranking.

### Phase 4 — Accessible Drag-and-Drop Editor UI

**Rationale:** UI should wire to already-safe action; DnD bugs then cannot corrupt data outside microsite.

**Delivers:**
- Install `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.
- Local ordered links state in editor.
- Explicit drag handle using `GripVertical` or equivalent.
- Pointer/touch/keyboard sensors or move up/down fallback.
- Optimistic reorder with pending state and rollback/error message.
- No conflicts with edit/delete/toggle/external-link controls.

**Features covered:** drag-and-drop reorder, mobile/touch support, keyboard accessibility, error behavior.

**Pitfalls avoided:** mouse-only UI, form state loss, control conflicts, silent desync.

**Research flag:** Needs phase research if exact dnd-kit v2026 API changed or dependency policy rejects new packages.

### Phase 5 — Verification and Regression Pass

**Rationale:** Behavior spans client state, server actions, DB order, public render, and polling; lint alone insufficient.

**Delivers:**
- `npm run lint`
- `npx tsc --noEmit`
- Manual UAT: theme save/reload/public polling; all theme visual matrix; create/edit/delete/toggle after reorder; inactive link reactivation; dashboard reload order; public order; mobile/touch; keyboard reorder.
- Negative UAT: unknown theme rejected; duplicate/foreign link ID reorder rejected.
- Confirm click tracking unaffected.

**Features covered:** all active requirements.

**Pitfalls avoided:** hidden regressions, stale public behavior, security gap.

**Research flag:** Standard verification; skip extra research.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Existing stack reuse is high confidence; dnd-kit API/version details need verify during install. |
| Features | HIGH | Requirements are narrow and well mapped to existing repo files. |
| Architecture | HIGH | Existing app seams align directly with needed editor/action/Prisma/public-render flow. |
| Pitfalls | HIGH | Findings grounded in repo paths and known brownfield drift. |

## Gaps to Address During Planning

- Confirm whether `reorderMicrositeLinks` already changed since research; FEATURES says action exists, PITFALLS says current implementation unsafe.
- Confirm live/local migration state for `Microsite.avatarImage` before any Prisma migration.
- Decide if `@@index([micrositeId, order])` belongs in this milestone or deferred to avoid migration drift.
- Decide whether keyboard DnD via dnd-kit is enough or move up/down buttons are required for acceptance.
- Define manual UAT checklist because repo has no automated test script.

## Sources / Files Read

- `.planning/research/STACK.md`
- `.planning/research/FEATURES.md`
- `.planning/research/ARCHITECTURE.md`
- `.planning/research/PITFALLS.md`
- `.planning/PROJECT.md`
