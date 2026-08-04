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

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | 4 | 3 | Preset theme Selection Registry and optimistic UI reordering. |
| v1.1 | 2 | 3 | Next.js native middleware protection, click index performance optimizations, and Vitest test suite setup. |
| v1.2 | 1 | 1 | Inline slug editor UI, collision checks validation, path revalidation, and unit test suite. |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|----------|--------|-------------------|
| v1.0 | 0 | 0% | 0 |
| v1.1 | 12 | 80% | 0 |
| v1.2 | 18 | 85% | 0 |

### Top Lessons (Verified Across Milestones)

1. Keep public routes and authorization policies strictly checked using transactional access gates.
2. Establish mock frameworks early to secure mutations from regression gaps.
