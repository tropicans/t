# Phase 06: Performance Optimization & Testing - Context

**Gathered:** 2026-08-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Menambahkan indeks database untuk analytics, memparalelkan kueri dashboard, dan menyediakan unit testing suite (Vitest) (Requirements PERF-01, PERF-02, TEST-01, VER-01, VER-02, VER-03).

</domain>

<decisions>
## Implementation Decisions

### Database Indexing Strategy (PERF-01)
- **D-01 (Index Design):** Define single-column indexes on key columns of `ShortLinkClick` (`shortLinkId`, `createdAt`) and `MicrositeClick` (`micrositeId`, `linkId`, `createdAt`) in [schema.prisma](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/prisma/schema.prisma) to maximize performance and flexibility for date-filtered and ID queries.
- **D-02 (Migration Execution):** Generate the database migrations locally via `npx prisma migrate dev` and commit the generated SQL migration files to Git.

### Dashboard Query Parallelization Scope (PERF-02)
- **D-03 (Parallelization Scope):** Optimize query execution using `Promise.all` on both the main Overview dashboard page ([page.tsx](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/app/dashboard/page.tsx)) and the Analytics dashboard page ([page.tsx](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/app/dashboard/analytics/page.tsx)).
- **D-04 (UI & Loading States):** Retain the existing Server-Side Rendering (SSR) model and standard Next.js error boundary patterns instead of transitioning to Suspense streaming, matching current codebase patterns.

### Testing Suite Configuration & Mocking (TEST-01)
- **D-05 (Test File Organization):** Co-locate Vitest test files next to their corresponding source code files (e.g., `src/app/actions/short.test.ts` next to `short.ts` for maximum visibility).
- **D-06 (Prisma Mocking):** Mock the Prisma client using Vitest mocks (via mock patterns for `@/lib/prisma`) to run fast unit tests without relying on a live database container.
- **D-07 (Auth Session Mocking):** Mock NextAuth `getServerSession` to validate both authenticated and unauthenticated permission branches inside the server actions under test.

### the agent's Discretion
None. All areas have explicit user choices/recommendations.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Performance Requirements
- [ROADMAP.md](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/.planning/ROADMAP.md) §Phase 6 — goals, success criteria, and canonical references.
- [REQUIREMENTS.md](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/.planning/REQUIREMENTS.md) §Phase 6 — requirements PERF-01, PERF-02, TEST-01, and verification requirements.
- [AGENTS.md](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/AGENTS.md) — project guidelines, TypeScript verification, linting, and database setup.

### Codebase & Testing Maps
- [TESTING.md](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/.planning/codebase/TESTING.md) — testing conventions.
- [CONCERNS.md](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/.planning/codebase/CONCERNS.md) — performance bottlenecks and test coverage gaps.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Promise.all` — standard pattern for parallelizing async operations in Next.js/Node.ts.
- Vitest mock utilities (`vi.mock`, `vi.fn`) — for mock implementation of database calls and sessions.

### Established Patterns
- Count queries for short links and microsites in [page.tsx](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/app/dashboard/page.tsx).
- Click record and summary counting queries in [page.tsx](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/app/dashboard/analytics/page.tsx).

### Integration Points
- [schema.prisma](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/prisma/schema.prisma) — defining indexes for `ShortLinkClick` and `MicrositeClick`.
- [page.tsx](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/app/dashboard/page.tsx) — parallelizing counts queries.
- [page.tsx](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/app/dashboard/analytics/page.tsx) — parallelizing counts, per-link analytics, and recent click queries.
- [short.ts](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/app/actions/short.ts) — server actions target for unit testing (e.g., `createShortLink`).
- [short-link-redirect.ts](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/app/actions/short-link-redirect.ts) — server actions target for unit testing (e.g., `verifyPasswordAndRedirect`).

</code_context>

<specifics>
## Specific Ideas

- For query parallelization on the main Overview page, restructure it as:
  ```typescript
  const [shortLinksCount, micrositesCount, shortClicksCount, micrositeClicksCount] = dbUser
      ? await Promise.all([
          prisma.shortLink.count({ where: { userId: dbUser.id } }),
          prisma.microsite.count({ where: { userId: dbUser.id } }),
          prisma.shortLinkClick.count({ where: { shortLink: { userId: dbUser.id } } }),
          prisma.micrositeClick.count({ where: { microsite: { userId: dbUser.id } } }),
      ])
      : [0, 0, 0, 0];
  const totalClicks = shortClicksCount + micrositeClicksCount;
  ```
- For analytics page queries, combine the sequential queries into one `Promise.all` containing the count, details, and recent click queries.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 06-Performance Optimization & Testing*
*Context gathered: 2026-08-04*
