# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

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

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | 0 | 0% | 0 |
| v1.1 | 12 | 80% | 0 |

### Top Lessons (Verified Across Milestones)

1. Keep public routes and authorization policies strictly checked using transactional access gates.
2. Establish mock frameworks early to secure mutations from regression gaps.
