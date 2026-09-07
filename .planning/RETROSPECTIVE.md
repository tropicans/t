# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.2 — Edit Link Microsite

**Shipped:** 2026-08-04
**Phases:** 1 | **Plans:** 1 | **Sessions:** 1

### What Was Built
- Inline slug input field inside the 'Informasi Microsite' editor form card with client-side sanitization.
- Integrated `updateMicrosite` server action handling centralized validation, collision checking against reserved routes, and db updates.
- Dynamic Next.js path cache revalidation on slug change.
- Automated Vitest unit test suite covering 6 different success and failure scenarios for updateMicrosite.

### What Worked
- Putting the new slug field inside the existing form card minimized UI footprint and kept the user experience seamless.
- Client-side input sanitization (lowercase and hyphen substitution) prevented invalid slugs from reaching server-side checks.
- Mocking revalidatePath and db client using Vitest allowed comprehensive assertion coverage.

### What Was Inefficient
- None; the phase was extremely focused and finished with no validation gaps or errors.

### Patterns Established
- Client-side sanitization on-change combined with hyphen-trimming on-blur creates a highly polished URL inputs UX.

### Key Lessons
1. Centralized validation helper `validateSlugCollision` in `src/lib/validators.ts` made adding collision checking for new features like microsite slug edits simple and secure.

---

## Milestone: v1.1 — Perbaikan dan Optimasi

**Shipped:** 2026-08-04
**Phases:** 3 | **Plans:** 3 | **Sessions:** 2

### What Was Built
- Database click index creation on search/filter keys (`createdAt`, `shortLinkId`, `micrositeId`, `linkId`).
- Dashboard query parallelization using Promise.all on overview and analytics views.
- Native Next.js route protection using `src/middleware.ts` and centralised URL and route collision validators.
- Vitest unit testing integration with 12 mock assertions.

### What Worked
- Concurrent Promise.all queries dramatically reduced database query overhead and Dashboard page rendering times.
- Centralizing URL and route collision checking logic into a dedicated file (`src/lib/validators.ts`) makes server actions robust, clean, and easily testable.

### What Was Inefficient
- Missing GSD files (`PLAN.md`, `SUMMARY.md`, `VERIFICATION.md`) for Phase 5 initially halted milestone close-out, requiring retrospective documentation writing.

### Patterns Established
- Co-locating Vitest test files (`*.test.ts`) next to source files for server actions ensures maximum visibility and high testing adoption.
- Using Object.assign to mock Next.js redirect behavior in Vitest prevents assertions from executing downstream logic.

### Key Lessons
1. Always run `/gsd-audit-milestone` and write all phase documents consecutively to avoid out-of-order documentation drift.
2. Centralize validations early rather than scattering inline validations in mutations server actions.

## Milestone: v1.3 — Claude Design System Integration

**Shipped:** 2026-09-07
**Phases:** 3 | **Plans:** 4 | **Sessions:** 3

### What Was Built
- Verified and integrated Claude `DESIGN.md` specification and registered guidelines in `AGENTS.md`.
- Implemented Tailwind CSS v4 design tokens and CSS custom properties in `src/app/globals.css` with Google Font `Newsreader` (`--font-serif`).
- Refactored core UI primitives (`button.tsx`, `card.tsx`, `badge.tsx`, `input.tsx`) and dashboard views (overview, links, microsites, analytics, settings) to warm terracotta editorial styling.
- Registered `claude` preset theme in `src/lib/microsite-themes.ts` with public rendering, selector preview, and dashboard thumbnail styles.
- Added comprehensive unit test suites in `src/lib/microsite-themes.test.ts` (24/24 Vitest unit tests passing across project).

### What Worked
- Referencing `DESIGN.md` in `AGENTS.md` ensured all downstream subagent plans and implementations maintained strict consistency with the Claude palette and typography tokens.
- Using CSS variables mapped through Tailwind `@theme inline` made swapping legacy `zinc` hardcoded classes to semantic tokens (`bg-sidebar`, `border-border`, `hover:bg-terracotta-active`) clean and cohesive.
- Pre-emptively writing Vitest tests for the theme registry prevented regression and validated fallback behaviors for corrupt or missing theme IDs.

### What Was Inefficient
- ESLint configuration has legacy rule mismatches for external scripts and third-party templates that produce noise during lint checks, though they did not affect the core application build.

### Patterns Established
- Editorial design hierarchy combining serif headlines (`font-serif`, Newsreader) with clean modern sans body text creates a distinctly premium, human-centric aesthetic.
- Co-locating theme tests with the theme registry ensures contract validation whenever new visual styles or presets are introduced.

### Key Lessons
1. Clear design system documentation in markdown (`DESIGN.md`) drastically streamlines autonomous frontend development and removes ambiguity about color tokens, spacing, and micro-interactions.
2. Replacing hardcoded Tailwind color utilities (`bg-zinc-800`, `text-blue-500`) with semantic tokens (`bg-card`, `border-border`, `text-primary`) is essential for maintaining maintainable design systems.

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | 4 | 3 | Preset theme Selection Registry and optimistic UI reordering. |
| v1.1 | 2 | 3 | Next.js native middleware protection, click index performance optimizations, and Vitest test suite setup. |
| v1.2 | 1 | 1 | Inline slug editor UI, collision checks validation, path revalidation, and unit test suite. |
| v1.3 | 3 | 3 | Claude design system integration, Tailwind v4 design tokens, Newsreader serif typography, and claude microsite theme preset. |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|----------|--------|-------------------|
| v1.0 | 0 | 0% | 0 |
| v1.1 | 12 | 80% | 0 |
| v1.2 | 18 | 85% | 0 |
| v1.3 | 24 | 90% | 0 |

### Top Lessons (Verified Across Milestones)

1. Keep public routes and authorization policies strictly checked using transactional access gates.
2. Establish mock frameworks early to secure mutations from regression gaps.
3. Centralize design tokens and system guidelines in DESIGN.md to align human and AI agents on visual standards.

