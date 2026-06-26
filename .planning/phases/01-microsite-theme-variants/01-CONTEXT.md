# Phase 1: Microsite Theme Variants - Context

**Gathered:** 2026-06-26T15:29:54.7280004+07:00
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 expands preset microsite theme choices and centralizes theme configuration so dashboard editor, dashboard microsite list thumbnail, server-side theme validation, and public microsite rendering all use the same allowed theme source. This phase does not add custom CSS, payment-gated themes, new public routing, drag-and-drop ordering, or a design-system rewrite.

</domain>

<decisions>
## Implementation Decisions

### Theme Set
- **D-01:** Target 7 total preset themes in Phase 1: preserve existing `dark`, `light`, and `gradient`, and add `midnight`, `sunset`, `forest`, and `mono`.
- **D-02:** Existing `dark`, `light`, and `gradient` public visuals should remain visually unchanged to avoid surprising current microsite owners.
- **D-03:** Theme IDs should remain stable plain strings such as `dark`, `light`, `gradient`, `midnight`, `sunset`, `forest`, and `mono`.
- **D-04:** Theme registry should include display metadata reusable by editor previews, public render styles, and dashboard list thumbnails.

### Preview Fidelity
- **D-05:** Dashboard theme picker should show mini public-page previews, not simple color swatches or a full live preview.
- **D-06:** Preview cards should use the same shared theme registry classes that public rendering uses, with miniature background, avatar/dot, title strip, and two link-card shapes.
- **D-07:** Each theme card should show theme name plus short tagline/mood text.
- **D-08:** Desktop editor picker should keep 3 cards per row, matching the existing editor grid.
- **D-09:** Selected theme state should use border plus checkmark, preserving the current visible selection pattern.

### Fallback And Validation
- **D-10:** Public microsite should render default `dark` when stored DB theme is unknown or legacy-invalid.
- **D-11:** Create/update server actions should normalize invalid submitted theme values to `dark` instead of rejecting with a user-facing error.
- **D-12:** Editor should auto-select `dark` silently for unknown saved theme values.
- **D-13:** `Microsite.theme` can remain a string; validation/normalization belongs in the shared registry and server action boundary.

### Visual Tone
- **D-14:** Expanded theme set should feel professional and brandable, suitable for real public profiles.
- **D-15:** Palette spread should be balanced: dark, light, warm, cool/nature, and high-contrast options.
- **D-16:** Themes should affect colors and surfaces only. Keep typography, layout, and spacing consistent across themes.
- **D-17:** Every preset must meet strict readability/contrast expectations for public mobile and desktop pages. Low-contrast presets should not ship.

### the agent's Discretion
No selected area was delegated to the agent. Downstream agents should follow the locked decisions above.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Scope And Requirements
- `.planning/PROJECT.md` — project scope, constraints, active/out-of-scope requirements, and brownfield context.
- `.planning/REQUIREMENTS.md` — THEME-01 through THEME-05 requirements for this phase.
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, canonical refs, and phase boundary.

### Research Guidance
- `.planning/research/SUMMARY.md` — recommends shared `src/lib/microsite-themes.ts`, registry-based theme validation, public fallback, and no theme enum migration.

### Codebase Maps
- `.planning/codebase/ARCHITECTURE.md` — microsite data flow, server action mutation boundary, public DTO, and renderer integration points.
- `.planning/codebase/STRUCTURE.md` — key file locations for editor, public renderer, server actions, and shared lib.
- `.planning/codebase/CONVENTIONS.md` — naming, module, import, Tailwind, and error-handling patterns to preserve.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/button.tsx`, `src/components/ui/card.tsx`, `src/components/ui/label.tsx`, `src/components/ui/badge.tsx` — existing shadcn/Radix-style primitives used by microsite editor; reuse them for theme picker UI.
- `src/lib/utils.ts` — existing class utility location if theme helpers need class merging, though registry should mostly use literal Tailwind class strings.
- `src/app/dashboard/microsites/[id]/microsite-editor.tsx` — already has local `THEMES` array and a 3-column mini preview picker that can be replaced by shared registry metadata.
- `src/components/microsite-page-client.tsx` — already has local `themeStyles` and public fallback to `dark`; replace local styles with shared registry access while preserving behavior.

### Established Patterns
- Server actions in `src/app/actions/microsite.ts` own authenticated mutation validation, Prisma writes, and `revalidatePath` calls.
- Client editor state uses React `useState` and `useTransition`, catches action errors, and calls `router.refresh()` after successful mutation.
- Tailwind class strings are inline and literal. Theme registry should avoid dynamic class construction that Tailwind cannot detect.
- Public microsite rendering is client-side and polls `/api/microsites/[slug]`; theme changes must work for both initial data and polled data.

### Integration Points
- `src/lib/microsite-themes.ts` — new shared source of truth for allowed theme IDs, labels, taglines, preview metadata, public style classes, thumbnail metadata, default theme, and normalization helpers.
- `src/app/actions/microsite.ts` — normalize `theme` in `createMicrosite` and `updateMicrosite`; keep public `revalidatePath` behavior.
- `src/app/dashboard/microsites/[id]/microsite-editor.tsx` — replace local `THEMES` with registry-powered picker and silent fallback to `dark` for unknown saved values.
- `src/app/dashboard/microsites/new/page.tsx` — replace local `THEMES` with same registry so create and edit screens match.
- `src/app/dashboard/microsites/page.tsx` — replace separate `ThemeThumbnail` logic with registry metadata so thumbnails do not drift from presets.
- `src/components/microsite-page-client.tsx` — replace local `themeStyles` with registry public classes and keep unknown-theme fallback to `dark`.

</code_context>

<specifics>
## Specific Ideas

- New baseline themes: `midnight`, `sunset`, `forest`, `mono`.
- Theme cards should include name plus tagline.
- Mini public previews should approximate the final public page, not just show color swatches.
- Public theme visuals for existing `dark`, `light`, and `gradient` should remain stable.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 1-Microsite Theme Variants*
*Context gathered: 2026-06-26T15:29:54.7280004+07:00*
