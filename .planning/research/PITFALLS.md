# Domain Pitfalls: Taut Microsite Theme Variants + Drag-and-Drop Ordering

**Domain:** Brownfield Next.js App Router + Prisma microsite editor  
**Scope:** More microsite visual themes and drag-and-drop ordering for microsite links  
**Researched:** 2026-06-26  
**Confidence:** HIGH from repo inspection; no `.planning/PROJECT.md`, `.planning/codebase/CONCERNS.md`, or `.planning/codebase/TESTING.md` found.

## Critical Pitfalls

### Pitfall 1: Client-only reorder without server-side ownership validation per link
**What goes wrong:** `reorderMicrositeLinks(micrositeId, orderedIds)` updates every submitted `id` directly. Current action validates editable microsite but does not prove every submitted link belongs to that microsite before update. Malicious or stale clients could submit another link id and mutate order outside intended scope.

**Repo paths:**
- `src/app/actions/microsite.ts:170-181` — reorder server action
- `src/app/actions/microsite.ts:29-49` — existing ownership helpers
- `prisma/schema.prisma:94-108` — `MicrositeLink` model

**Warning signs:**
- Server action trusts `orderedIds` from drag-and-drop component.
- `prisma.micrositeLink.update({ where: { id } })` used without `micrositeId` guard.
- No count check that submitted ids equal current microsite link ids.
- Global viewer logic tested for microsite, not each link.

**Prevention:**
- Fetch current links for `micrositeId` after `getEditableMicrosite`.
- Reject if submitted ids contain unknown ids, duplicates, or missing active rows expected by UI contract.
- Update with composite-safe condition via `updateMany({ where: { id, micrositeId }, data: { order: index } })` or validate all ids first then transaction updates.
- Wrap updates in `prisma.$transaction`; verify affected counts.

**Detection:**
- Attempt reorder payload containing valid `micrositeId` plus link id from another microsite.
- Confirm no order change outside owned microsite.

**Phase mapping:**
- **Drag-and-drop ordering phase:** Blocker before UI polish. Server action contract first, client DnD second.
- **Security hardening phase:** Add ownership/duplicate tests around link mutation actions.

### Pitfall 2: Non-atomic order updates causing duplicate or partial order state
**What goes wrong:** Current reorder uses `Promise.all` independent updates. If one update fails midway, some rows may have new order while others keep old order. Concurrent reorder/add/delete operations can also produce duplicate or surprising order values.

**Repo paths:**
- `src/app/actions/microsite.ts:129-137` — max-order append logic
- `src/app/actions/microsite.ts:170-181` — reorder logic
- `src/lib/public-microsite.ts:32-35` — public order by `order`

**Warning signs:**
- `Promise.all` for DB writes instead of `prisma.$transaction`.
- No unique or compound index for `(micrositeId, order)`.
- Public page order flickers after reorder or after quick add/delete.
- Same `order` values visible in database.

**Prevention:**
- Use `prisma.$transaction` for all reorder writes.
- Normalize order values to dense `0..n-1` sequence on reorder.
- Consider `@@index([micrositeId, order])` for stable reads; unique constraint optional if transaction strategy avoids temporary conflicts.
- Preserve append behavior but calculate next order from scoped current links inside same request path if races become visible.

**Detection:**
- Simulate reorder request failure mid-batch.
- Run two reorder requests quickly and inspect final `order` sequence.
- Add regression check that public `getPublishedMicrosite()` returns sorted titles matching submitted order.

**Phase mapping:**
- **Drag-and-drop ordering phase:** Must ship with transaction update and reorder validation.
- **Testing phase:** Add integration-level server action test or DB-backed script for duplicate/missing order.

### Pitfall 3: Breaking public microsite rendering by adding themes only to editor
**What goes wrong:** Theme picker and public renderer keep separate theme maps. New theme variants added only to editor preview will save valid-looking theme ids, but public page falls back to dark because `themeStyles` lacks matching key.

**Repo paths:**
- `src/app/dashboard/microsites/[id]/microsite-editor.tsx:67-92` — editor `THEMES`
- `src/components/microsite-page-client.tsx:11-60` — public `themeStyles`
- `src/components/microsite-page-client.tsx:163` — fallback to dark
- `prisma/schema.prisma:78` — `theme String @default("dark")`

**Warning signs:**
- Same theme id duplicated in multiple files.
- Preview looks correct in dashboard but published page shows dark.
- No shared `ThemeId` type or theme registry.
- Type assertion `microsite.theme as keyof typeof themeStyles` hides invalid theme strings.

**Prevention:**
- Create shared registry, e.g. `src/lib/microsite-themes.ts`, exporting allowed ids, editor preview metadata, and public style mapping or typed style keys.
- Import same registry in editor and public page.
- Validate submitted `theme` in `updateMicrosite` and `createMicrosite` against registry; reject unknown values.
- Keep fallback for legacy data but never allow new invalid values.

**Detection:**
- Add one new theme and verify: editor preview, saved form value, database value, public page classes, polling update.
- Try submitting unknown theme via FormData; expect server rejection.

**Phase mapping:**
- **Theme variant phase:** First task should be shared theme registry + server validation, then UI variant additions.
- **Regression phase:** Public rendering smoke test for every theme id.

### Pitfall 4: Treating `theme` as free-form string forever
**What goes wrong:** Database accepts any string. Server actions currently store `formData.get("theme")` with no allowlist. More variants increase chance of typos, stale clients, and unsupported theme ids.

**Repo paths:**
- `src/app/actions/microsite.ts:68` — create theme read
- `src/app/actions/microsite.ts:91` — update theme read
- `prisma/schema.prisma:78` — no enum/constraint

**Warning signs:**
- Theme id typo persists in DB.
- Public fallback masks bug instead of failing visibly in dashboard.
- No TypeScript union for theme ids.

**Prevention:**
- Use shared `MICROSITE_THEME_IDS` and `isMicrositeThemeId()` guard.
- In server actions: if theme absent, keep old/default; if present and invalid, throw clear error.
- Optional later migration to Prisma enum only after compatibility cost considered; for brownfield milestone, code-level validation lower risk.

**Detection:**
- Manual action call with `theme=neon_typo`; verify rejected.
- Query DB for themes not in registry before release.

**Phase mapping:**
- **Theme variant phase:** Required early guardrail.
- **Data cleanup phase:** Optional script to list/fix invalid legacy themes.

### Pitfall 5: Losing unsaved editor form state when adding DnD state
**What goes wrong:** Current editor uses uncontrolled form inputs for title/description/link edit fields and separate React state for selected theme/images. Adding local ordered-link state plus `router.refresh()` can reset open forms, discard typed edits, or re-open stale order.

**Repo paths:**
- `src/app/dashboard/microsites/[id]/microsite-editor.tsx:57-65` — local state
- `src/app/dashboard/microsites/[id]/microsite-editor.tsx:224-303` — uncontrolled info form
- `src/app/dashboard/microsites/[id]/microsite-editor.tsx:346-407` — link list rendering

**Warning signs:**
- Drag reorder closes edit form.
- Typed link title disappears after reorder save.
- `microsite.links.map(...)` uses prop order while DnD library uses local order state.
- `router.refresh()` called after every reorder even when optimistic state already updated.

**Prevention:**
- Introduce `orderedLinks` state initialized from `microsite.links`; sync carefully when prop ids change.
- Disable drag while `editLinkId` active or while add/edit form dirty.
- Persist reorder on explicit drop; keep optimistic state but rollback on error.
- Do not refresh until save completes; if refreshing, avoid resetting unrelated form state or block reorder while forms open.

**Detection:**
- Open edit form, type unsaved value, drag another link, save reorder, confirm typed value behavior is intentional.
- Add link form open + reorder; confirm no hidden reset.

**Phase mapping:**
- **Drag-and-drop UI phase:** Build state model before DnD visuals.
- **UAT phase:** Include unsaved-edit + reorder scenarios.

## Moderate Pitfalls

### Pitfall 6: DnD accessibility and mobile support treated as optional
**What goes wrong:** Mouse-only drag works on desktop demos but fails keyboard users and touch users. Microsite editor likely used from mobile because product is link-in-bio adjacent.

**Repo paths:**
- `src/app/dashboard/microsites/[id]/microsite-editor.tsx:346-407` — link item controls
- `src/components/ui/button.tsx` — button focus/disabled conventions

**Warning signs:**
- Drag handle is `div` with no label or keyboard fallback.
- Reorder unavailable by keyboard.
- Touch drag scrolls page instead of moving link.
- Screen reader only announces “button” without position.

**Prevention:**
- Use accessible DnD library/pattern with keyboard sensors, or add explicit “Move up/down” buttons as fallback.
- Add visible drag handle with `aria-label="Reorder link"` and position text.
- Preserve existing edit/delete/toggle buttons; avoid nested interactive conflicts.
- Test touch scrolling and dragging on narrow viewport.

**Detection:**
- Keyboard-only reorder all links.
- Screen reader announces item title and position.
- Mobile viewport reorder without accidental page scroll.

**Phase mapping:**
- **Drag-and-drop UI phase:** Include from first implementation, not polish.
- **Accessibility phase:** Verify keyboard and touch behavior.

### Pitfall 7: Public polling change detection misses URL/icon/order semantics
**What goes wrong:** Public page polls `/api/microsites/[slug]` and compares link `id` and `title` by index only. Today public type only exposes id/title. If theme/order changes matter, index change catches reorder; but future link visual fields or URL behavior changes may not update UI if omitted from compare/type.

**Repo paths:**
- `src/components/microsite-page-client.tsx:62-80` — change detection
- `src/lib/public-microsite.ts:11-14` — public link shape
- `src/components/microsite-page-client.tsx:225-236` — link rendering

**Warning signs:**
- New link display field added but `hasMicrositeChanged` unchanged.
- Public API response includes data not represented in `PublicMicrositeData`.
- Reorder appears only after full reload, not poll.

**Prevention:**
- Keep `PublicMicrositeData` as source of public fields.
- Update `hasMicrositeChanged` whenever link fields affect rendering.
- For order, compare ordered id sequence explicitly and add test fixture.

**Detection:**
- Reorder in dashboard while public page open; expect poll refresh within 10 seconds.
- Change every displayed link field; expect poll refresh.

**Phase mapping:**
- **Drag-and-drop ordering phase:** Polling smoke test required.
- **Theme variant phase:** Theme switch polling already covered but retest with new ids.

### Pitfall 8: Theme variants with poor contrast, image overlay, or Tailwind purge issues
**What goes wrong:** New themes can look fine in static preview but fail with cover images, avatars, long descriptions, and link cards. Dynamic Tailwind class construction can also drop classes if built from unscanned strings, though current code uses literal classes in objects.

**Repo paths:**
- `src/components/microsite-page-client.tsx:11-60` — Tailwind classes in theme object
- `src/components/microsite-page-client.tsx:167-254` — cover/avatar/link layout
- `next.config.ts` — image host whitelist context

**Warning signs:**
- Theme class strings generated dynamically like `bg-${color}-500`.
- Light text over bright cover image.
- Link hover state loses contrast.
- Long title/description breaks card layout.

**Prevention:**
- Keep Tailwind class names literal in shared registry.
- Define complete style tokens per theme: page, hero overlay, title, description, avatar, card, cardTitle, icon, empty, footer, divider, share.
- Test with no cover, dark cover, bright cover, no avatar, long title, long link title.
- Prefer semantic theme registry over scattered CSS snippets.

**Detection:**
- Visual smoke matrix: every theme × cover/no cover × avatar/no avatar.
- Build check confirms Tailwind classes exist in production output.

**Phase mapping:**
- **Theme variant phase:** Visual QA required before release.
- **UI review phase:** Contrast and responsive matrix.

### Pitfall 9: Revalidation only covers dashboard, not public slug after reorder/link changes
**What goes wrong:** Link create/update/delete/reorder revalidate dashboard path only. Public page relies on polling with `cache: "no-store"`, but static/cache behavior can still surprise if route caching or future caching changes. Reorder should invalidate public slug too.

**Repo paths:**
- `src/app/actions/microsite.ts:139` — create link revalidate dashboard only
- `src/app/actions/microsite.ts:157` — update link revalidate dashboard only
- `src/app/actions/microsite.ts:166` — delete link revalidate dashboard only
- `src/app/actions/microsite.ts:180` — reorder revalidate dashboard only
- `src/app/actions/microsite.ts:103-104` — microsite info update revalidates public slug

**Warning signs:**
- Public page stale until hard refresh.
- Info update invalidates public path but link mutations do not.
- Future removal of polling exposes stale public content.

**Prevention:**
- After link mutation, know microsite slug and call `revalidatePath(`/${slug}`)` as updateMicrosite does.
- For reorder action, fetch microsite once with slug and validate ownership in same flow.
- Keep public polling but do not depend on it as only freshness mechanism.

**Detection:**
- Disable polling or inspect server-rendered public path after link reorder; expect new order.

**Phase mapping:**
- **Drag-and-drop ordering phase:** Add public path revalidation with reorder.
- **Link mutation cleanup phase:** Apply same fix to create/update/delete links.

## Minor Pitfalls

### Pitfall 10: Reserved route and slug collision rules forgotten during public route work
**What goes wrong:** Public entrypoint `src/app/[username]/page.tsx` resolves short links before microsites. Theme/order work may add public preview URLs or theme ids that look like routes; developers may forget existing collision behavior.

**Repo paths:**
- `src/app/[username]/page.tsx:90-104` — microsite resolution
- `src/app/actions/microsite.ts:55-57` — reserved slug list
- `AGENTS.md` — notes short link wins over microsite slug

**Warning signs:**
- New preview route under root without reserved slug update.
- Assumption that microsite slug always wins.
- Theme preview path collides with user slug.

**Prevention:**
- Keep new editor-only preview routes under `/dashboard/...`, not root.
- If adding public routes, update reserved list in `validateSlug`.
- Do not change `[username]` resolution order as part of theme/order milestone.

**Detection:**
- Create microsite slug matching proposed route; ensure blocked if route added.

**Phase mapping:**
- **Theme preview phase:** Avoid public route additions unless explicitly scoped.
- **Routing phase:** Only if roadmap adds public theme previews.

### Pitfall 11: Migration drift around `avatarImage` ignored while editing same model
**What goes wrong:** Repo notes known drift: Prisma schema has `Microsite.avatarImage`, but checked-in migration may not add column. Theme/order milestone touching microsite forms can fail in fresh DB if drift remains.

**Repo paths:**
- `prisma/schema.prisma:79-80` — `coverImage`, `avatarImage`
- `src/app/dashboard/microsites/[id]/microsite-editor.tsx:40-41, 227-233` — avatar field usage
- `AGENTS.md` — known drift note

**Warning signs:**
- Fresh migration DB throws missing column on microsite query/update.
- Build passes due mock `DATABASE_URL`, runtime fails against real DB.
- Theme work blamed for unrelated schema drift.

**Prevention:**
- Before changing microsite model/UI, run `npx prisma migrate status` against intended DB or inspect migration history.
- If adding schema changes, include drift fix migration or explicitly avoid schema edits.
- Run `npx prisma generate` after schema changes.

**Detection:**
- Fresh local DB from migrations then open microsite editor.

**Phase mapping:**
- **Preflight phase:** Verify DB state before theme/order work.
- **Migration phase:** Only if schema changes required.

### Pitfall 12: Tests absent or limited to lint, so regressions hide in manual-only flows
**What goes wrong:** Project has `npm run lint` only; no test script. DnD and theme behavior spans server actions, Prisma ordering, client state, and public rendering. Manual-only validation will miss ownership, stale UI, and route freshness issues.

**Repo paths:**
- `package.json` — verification script context
- `src/app/actions/microsite.ts` — server action behavior needs targeted checks
- `src/components/microsite-page-client.tsx` — public rendering behavior needs smoke checks
- `src/app/dashboard/microsites/[id]/microsite-editor.tsx` — DnD/client state needs UAT

**Warning signs:**
- Only `npm run lint` run before marking phase done.
- No manual checklist for reorder persistence, ownership rejection, public order.
- DnD library added without browser verification.

**Prevention:**
- Define manual UAT checklist in phase plan if test framework not added.
- At minimum run `npm run lint`, `npx tsc --noEmit`, and manual DB-backed browser checks.
- Add small script or temporary verification for reorder server action if full test stack out of scope.

**Detection:**
- Fresh browser session: create microsite, add three links, reorder, reload dashboard, open public page, verify order.
- Unauthorized/cross-microsite reorder attempt rejected.

**Phase mapping:**
- **Verification phase:** Mandatory explicit UAT, because repo lacks automated tests.
- **Future testing phase:** Add server-action tests or integration harness.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|----------------|------------|
| Theme registry | Editor/public theme drift | Shared `src/lib/microsite-themes.ts`; server allowlist validation |
| Theme UI | Poor contrast across cover/avatar combinations | Visual matrix across every theme and content state |
| Reorder server action | Cross-microsite mutation and partial writes | Validate ids, reject duplicates/missing ids, use `prisma.$transaction` |
| Reorder client UI | Unsaved form state loss | Local ordered state, disable drag while editing, rollback on error |
| Revalidation | Public page stale after link order change | Revalidate dashboard path and `/${slug}` for link mutations |
| Accessibility | Mouse-only DnD | Keyboard fallback or accessible DnD sensors plus labelled controls |
| DB preflight | Existing migration drift | Confirm fresh DB state before editing microsite model |
| Verification | Lint-only false confidence | `npm run lint`, `npx tsc --noEmit`, browser UAT, DB order inspection |

## Recommended Build Order

1. **Preflight and registry** — confirm DB state; create shared typed theme registry and server theme validation.
2. **Theme variants** — add complete theme tokens and editor previews from registry; test public rendering matrix.
3. **Reorder backend** — harden `reorderMicrositeLinks` with id validation, duplicate rejection, transaction writes, public revalidation.
4. **Reorder UI** — add accessible drag/drop or move controls with stable local state and rollback.
5. **Verification pass** — run lint/typecheck plus manual UAT across dashboard reload, public polling, unauthorized payload, mobile/keyboard reorder.

## Sources

- Repo inspection: `src/app/actions/microsite.ts`
- Repo inspection: `src/app/dashboard/microsites/[id]/microsite-editor.tsx`
- Repo inspection: `src/components/microsite-page-client.tsx`
- Repo inspection: `src/lib/public-microsite.ts`
- Repo inspection: `prisma/schema.prisma`
- Repo context: `AGENTS.md`
