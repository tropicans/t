# Roadmap: Taut Microsite Enhancements

**Created:** 2026-06-26
**Project:** Taut Microsite Enhancements
**Mode:** Vertical MVP
**Granularity:** Coarse

## Summary

This roadmap delivers two requested brownfield capabilities in the existing microsite system: more theme variants and drag-and-drop link ordering. Phases are ordered to establish safe shared data/config first, then add reorder persistence/UI, then harden accessibility and verification.

| Phase | Name | Goal | Requirements | UI hint |
|-------|------|------|--------------|---------|
| 1 | Microsite Theme Variants | Expand and centralize theme choices across editor and public rendering. | THEME-01, THEME-02, THEME-03, THEME-04, THEME-05 | yes |
| 2 | Drag-and-Drop Link Ordering | 1/1 | Complete    | 2026-06-27 |
| 3 | Accessibility And Verification Hardening | Make interactions robust, responsive, accessible, and verified. | UX-01, UX-02, UX-03, VER-01, VER-02, VER-03 | yes |

## Phases

### Phase 1: Microsite Theme Variants

**Goal:** User can choose from expanded microsite themes and see the saved theme reflected on public pages.
**Mode:** mvp
**Requirements:** THEME-01, THEME-02, THEME-03, THEME-04, THEME-05
**UI hint:** yes

**Success Criteria**:

1. Theme options are defined in one shared source, likely `src/lib/microsite-themes.ts`.
2. Dashboard editor at `src/app/dashboard/microsites/[id]/microsite-editor.tsx` exposes expanded theme choices.
3. Public renderer at `src/components/microsite-page-client.tsx` uses the same theme definitions.
4. Invalid/legacy theme values fall back safely to a default theme.
5. Theme selection survives save and reload.

**Canonical refs:**

- `.planning/PROJECT.md` — project scope and constraints.
- `.planning/REQUIREMENTS.md` — THEME requirements.
- `.planning/research/SUMMARY.md` — stack and architecture recommendations.
- `.planning/codebase/ARCHITECTURE.md` — microsite data flow and component boundaries.
- `.planning/codebase/STRUCTURE.md` — key file locations.

### Phase 2: Drag-and-Drop Link Ordering

**Goal:** User can reorder microsite links with drag and drop, save order, and public pages display active links in that order.
**Mode:** mvp
**Requirements:** ORDER-01, ORDER-02, ORDER-03, ORDER-04, ORDER-05
**UI hint:** yes

**Success Criteria**:

1. Data model or existing fields support stable per-microsite link ordering.
2. Server action in `src/app/actions/microsite.ts` validates ownership/access and persists reordered link IDs atomically.
3. Dashboard editor uses drag-and-drop behavior for link list ordering without losing link field values.
4. Public query in `src/lib/public-microsite.ts` returns active links ordered by saved position.
5. Existing click route `src/app/api/click/microsite-link/[linkId]/route.ts` continues to work unchanged.

**Canonical refs:**

- `.planning/PROJECT.md` — project scope and constraints.
- `.planning/REQUIREMENTS.md` — ORDER requirements.
- `.planning/research/ARCHITECTURE.md` — recommended build order and data flow.
- `.planning/research/PITFALLS.md` — ordering and DnD risks.
- `.planning/codebase/CONCERNS.md` — migration drift and fragile areas.

### Phase 3: Accessibility And Verification Hardening

**Goal:** Theme and reorder features are accessible, responsive, and verified against repo checks and manual UAT.
**Mode:** mvp
**Requirements:** UX-01, UX-02, UX-03, VER-01, VER-02, VER-03
**UI hint:** yes

**Success Criteria**:

1. Reorder UI provides accessible keyboard or button-based fallback controls.
2. Dragging, saving, and failure states provide clear feedback.
3. Public microsite themes remain readable and responsive on mobile and desktop.
4. `npm run lint` passes.
5. `npx tsc --noEmit` passes if TypeScript/Prisma changes were made.
6. Manual UAT covers editor save/reload, public page display, active link filtering, and click tracking preservation.

**Canonical refs:**

- `.planning/REQUIREMENTS.md` — UX and verification requirements.
- `.planning/research/PITFALLS.md` — accessibility, public revalidation, and UAT watch-outs.
- `.planning/codebase/TESTING.md` — available verification commands.
- `AGENTS.md` — repo-specific commands and known drift.

## Requirement Coverage

| Requirement | Phase |
|-------------|-------|
| THEME-01 | Phase 1 |
| THEME-02 | Phase 1 |
| THEME-03 | Phase 1 |
| THEME-04 | Phase 1 |
| THEME-05 | Phase 1 |
| ORDER-01 | Phase 2 |
| ORDER-02 | Phase 2 |
| ORDER-03 | Phase 2 |
| ORDER-04 | Phase 2 |
| ORDER-05 | Phase 2 |
| UX-01 | Phase 3 |
| UX-02 | Phase 3 |
| UX-03 | Phase 3 |
| VER-01 | Phase 3 |
| VER-02 | Phase 3 |
| VER-03 | Phase 3 |

**Coverage:** 16/16 v1 requirements mapped.

---
*Roadmap created: 2026-06-26*
