# Codebase Concerns

**Analysis Date:** 2026-06-26

## Tech Debt

**Prisma schema and migration drift:**
- Issue: `prisma/schema.prisma` defines `Microsite.avatarImage` at `prisma/schema.prisma:80`, but checked-in migration `prisma/migrations/20260226034550_remove_bio_links/migration.sql` creates `Microsite` without `avatarImage` at `prisma/migrations/20260226034550_remove_bio_links/migration.sql:55-68`.
- Files: `prisma/schema.prisma`, `prisma/migrations/20260226034550_remove_bio_links/migration.sql`, `src/app/actions/microsite.ts`, `src/app/[username]/page.tsx`
- Impact: Fresh databases created from migrations miss a column used by runtime reads/writes. `createMicrosite`, `updateMicrosite`, metadata generation, and public microsite rendering can fail with missing-column database errors.
- Fix approach: Add a new Prisma migration that adds `Microsite.avatarImage`, run `npx prisma generate`, then verify create/edit/public microsite flows against a fresh migrated database.

**NextAuth adapter models present but adapter inactive:**
- Issue: `Account` and `Session` models exist in `prisma/schema.prisma:10-35`, and `@auth/prisma-adapter` is installed in `package.json:12`, but runtime auth in `src/lib/auth.ts` uses JWT sessions and manually upserts `User` without a Prisma adapter.
- Files: `prisma/schema.prisma`, `package.json`, `src/lib/auth.ts`
- Impact: Future auth changes can wrongly assume database sessions/accounts are active. OAuth account metadata is not persisted by NextAuth, and schema complexity suggests behavior that does not exist.
- Fix approach: Either wire `PrismaAdapter` intentionally and change session behavior, or document/remove unused adapter models/package to match JWT-only auth.

**Fallback database credentials in app code:**
- Issue: `src/lib/prisma.ts:9-11` embeds a default PostgreSQL URL when `DATABASE_URL` is unset.
- Files: `src/lib/prisma.ts`, `docker-compose.yml`
- Impact: Runtime silently connects to local/default database instead of failing fast. Production misconfiguration can use wrong database target and hide missing secret setup.
- Fix approach: Fail fast when `DATABASE_URL` is missing outside local development. Keep local default only behind explicit `NODE_ENV === "development"` guard or documented dev-only config.

**Build script masks database configuration problems:**
- Issue: `package.json:7` injects mock `DATABASE_URL` for `npm run build`.
- Files: `package.json`, `prisma.config.ts`, `src/lib/prisma.ts`
- Impact: Build passes without proving real database configuration, Prisma connectivity, or migration alignment. Deployment can fail after green build.
- Fix approach: Keep mock build for CI if needed, but add separate deploy verification that checks required env vars, Prisma generation, and migrated schema compatibility.

**Routing namespace collisions:**
- Issue: Public route `src/app/[username]/page.tsx:62-91` resolves `ShortLink.shortCode` before `Microsite.slug`. `createShortLink` validates alias uniqueness only against short links at `src/app/actions/short.ts:46-50`; it does not check reserved routes or microsite slugs.
- Files: `src/app/[username]/page.tsx`, `src/app/actions/short.ts`, `src/app/actions/microsite.ts`
- Impact: A short link can shadow an existing microsite. Users see redirect/password flow instead of microsite. Reserved public paths can also become aliases unless already captured elsewhere.
- Fix approach: Centralize public slug/alias validation. Check short links, microsites, and reserved route list for both `createShortLink` and `createMicrosite`.

## Known Bugs

**Microsite avatar column missing in migrated databases:**
- Symptoms: Creating/updating microsites with avatar images or loading public metadata can fail after migrating from checked-in SQL.
- Files: `prisma/schema.prisma`, `prisma/migrations/20260226034550_remove_bio_links/migration.sql`, `src/app/actions/microsite.ts`, `src/lib/public-microsite.ts`, `src/app/[username]/page.tsx`
- Trigger: Run migrations into empty database, then execute code path that reads/writes `avatarImage`.
- Workaround: Manually add `avatarImage` column or regenerate/add migration before using avatar image features.

**Password-protected expired links still show password form:**
- Symptoms: `verifyPasswordAndRedirect` does not check `expiresAt`; expired password-protected links can redirect after correct password.
- Files: `src/app/[username]/page.tsx`, `src/app/actions/short-link-redirect.ts`
- Trigger: Create protected short link with expired `expiresAt`, visit `/{shortCode}`, submit correct password.
- Workaround: Check expiration again in `verifyPasswordAndRedirect` before `bcrypt.compare` and redirect.

**Inactive microsite links still redirect:**
- Symptoms: Public microsite hides inactive links via `src/lib/public-microsite.ts:32-39`, but direct route `src/app/api/click/microsite-link/[linkId]/route.ts:14-36` redirects any existing link without checking `isActive` or parent `isPublished`.
- Files: `src/lib/public-microsite.ts`, `src/app/api/click/microsite-link/[linkId]/route.ts`
- Trigger: Disable microsite link, then request `/api/click/microsite-link/{linkId}` directly.
- Workaround: Add `where: { id: linkId, isActive: true, microsite: { isPublished: true } }` or equivalent guard.

## Security Considerations

**Open redirect by design needs allow/deny policy:**
- Risk: Short links and microsite links redirect to arbitrary user-provided URLs. This is expected for a shortener, but enables phishing and abuse if no policy, scanning, or reporting exists.
- Files: `src/app/actions/short.ts`, `src/app/actions/microsite.ts`, `src/app/[username]/page.tsx`, `src/app/api/click/microsite-link/[linkId]/route.ts`
- Current mitigation: `createShortLink` uses `new URL(originalUrl)` at `src/app/actions/short.ts:37-41`. Microsite link URLs only require non-empty string at `src/app/actions/microsite.ts:123-127`.
- Recommendations: Validate URL scheme as `http:` or `https:`, block local/private IP hostnames, add abuse reporting, and consider interstitial warning for risky domains.

**Microsite link URL validation missing:**
- Risk: `src/app/actions/microsite.ts:123-127` accepts any non-empty string for `url`; `NextResponse.redirect(link.url)` at `src/app/api/click/microsite-link/[linkId]/route.ts:36` consumes it.
- Files: `src/app/actions/microsite.ts`, `src/app/api/click/microsite-link/[linkId]/route.ts`
- Current mitigation: None detected for microsite link URL format.
- Recommendations: Parse with `new URL(url)`, allow only `http:` and `https:`, reject `javascript:`, `data:`, relative URLs, and internal service hosts.

**Weak default secrets in Docker Compose:**
- Risk: `docker-compose.yml:18` defaults `NEXTAUTH_SECRET` to `changeme_in_production`, and database credentials are hardcoded for local containers at `docker-compose.yml:14` and `docker-compose.yml:37-39`.
- Files: `docker-compose.yml`
- Current mitigation: Environment interpolation allows overriding values.
- Recommendations: Require `NEXTAUTH_SECRET` in production compose, move production secrets to secret manager, and keep sample credentials dev-only.

**Auth degraded mode allows sign-in after DB upsert failure:**
- Risk: `src/lib/auth.ts:50-53` returns `true` if user upsert fails. JWT session can exist without matching `User` row.
- Files: `src/lib/auth.ts`, `src/app/actions/short.ts`, `src/app/actions/microsite.ts`, `src/app/dashboard/page.tsx`
- Current mitigation: Most app actions/pages re-query user and deny/null if missing.
- Recommendations: Return `false` on DB upsert failure for strict consistency, or clearly isolate read-only degraded mode with explicit UX and telemetry.

**Global dashboard viewer controlled by single env email:**
- Risk: `src/lib/microsite-access.ts:1-12` grants cross-user microsite management based on one configured email string.
- Files: `src/lib/microsite-access.ts`, `src/app/actions/microsite.ts`, `src/app/dashboard/microsites/[id]/page.tsx`
- Current mitigation: Exact normalized email match.
- Recommendations: Use explicit role field in database or audited allowlist. Log privileged actions and avoid single mutable env var for admin authorization.

## Performance Bottlenecks

**Analytics loads click rows into application memory:**
- Problem: `src/app/dashboard/analytics/page.tsx:46-57` fetches every click in the last 7 days and groups client-side/server-side in TypeScript.
- Files: `src/app/dashboard/analytics/page.tsx`, `prisma/schema.prisma`
- Cause: No aggregate `groupBy` query or daily rollup table. Click tables have no indexes on `createdAt`, `shortLinkId`, or `micrositeId` in `prisma/schema.prisma:110-131`.
- Improvement path: Add indexes for click analytics, use Prisma `groupBy` by date where possible, or maintain daily counters/materialized rollups.

**Dashboard count query chains unnecessary async work:**
- Problem: `src/app/dashboard/page.tsx` counts short-link clicks and then chains a second microsite click count through `.then(async ...)` instead of parallelizing both counts.
- Files: `src/app/dashboard/page.tsx`
- Cause: Mixed Promise composition makes independent counts sequential inside one Promise branch.
- Improvement path: Run short-link click count and microsite click count as separate `Promise.all` entries, then sum locally.

**Click tracking writes on hot redirect path:**
- Problem: `trackShortLinkClick` awaits `prisma.shortLinkClick.create` before redirect at `src/app/actions/short-link-redirect.ts:46-47`; public short links call it at `src/app/[username]/page.tsx:85-87`.
- Files: `src/app/[username]/page.tsx`, `src/app/actions/short-link-redirect.ts`
- Cause: Analytics write is synchronous for short-link redirects.
- Improvement path: Queue click events or use fire-and-forget with bounded error handling. Keep redirect latency independent of database write latency.

**No retention or partitioning for click tables:**
- Problem: `ShortLinkClick` and `MicrositeClick` grow indefinitely.
- Files: `prisma/schema.prisma`, `src/app/actions/short-link-redirect.ts`, `src/app/api/click/microsite-link/[linkId]/route.ts`, `src/app/[username]/page.tsx`
- Cause: Schema has append-only click models and no cleanup job.
- Improvement path: Add retention policy, monthly partitions, or rollup-and-delete process before traffic grows.

## Fragile Areas

**Server actions rely on thrown strings for control flow:**
- Files: `src/app/actions/microsite.ts`
- Why fragile: `getCurrentUserAccess`, `getEditableMicrosite`, and validation functions throw generic `Error`. Client behavior depends on action callers handling exceptions consistently.
- Safe modification: Return typed action results (`{ success: false, error, code }`) for expected validation/auth failures; reserve thrown errors for unexpected failures.
- Test coverage: No automated tests detected for server actions.

**Reorder accepts arbitrary IDs after only parent access check:**
- Files: `src/app/actions/microsite.ts`
- Why fragile: `reorderMicrositeLinks` checks access to `micrositeId`, then updates every `orderedIds` entry at `src/app/actions/microsite.ts:170-178` without verifying each link belongs to that microsite.
- Safe modification: Fetch links by `{ id: { in: orderedIds }, micrositeId }`, reject mismatches, then update inside `$transaction`.
- Test coverage: No automated tests detected for ownership/mismatch cases.

**Analytics and dashboard pages return `null` for auth gaps:**
- Files: `src/app/dashboard/analytics/page.tsx`, `src/app/dashboard/page.tsx`
- Why fragile: `return null` hides unauthenticated or missing-user states instead of redirecting or showing error. Proxy protects `/dashboard`, but DB user drift creates blank pages.
- Safe modification: Redirect missing session to `/login`; show explicit recovery state for missing DB user.
- Test coverage: No automated tests detected for auth/DB drift UI.

**Public microsite API exposes stable link IDs:**
- Files: `src/lib/public-microsite.ts`, `src/app/api/microsites/[slug]/route.ts`, `src/app/api/click/microsite-link/[linkId]/route.ts`
- Why fragile: API returns link IDs but not URLs; redirect endpoint trusts link ID. Disabled/unpublished checks must stay aligned across read and click endpoints.
- Safe modification: Keep all public link visibility rules in one helper used by both API and click redirect route.
- Test coverage: No automated tests detected for disabled/unpublished click behavior.

## Scaling Limits

**Single PostgreSQL-backed synchronous app:**
- Current capacity: Not measured in repository. App uses one Next.js service and one PostgreSQL service in `docker-compose.yml`.
- Limit: Click-heavy traffic saturates database writes and analytics reads first because every redirect writes a row and dashboard reads raw clicks.
- Scaling path: Queue click writes, add indexes/rollups, introduce retention, and separate analytics reads from redirect path.

**No rate limiting on public endpoints:**
- Current capacity: Not measured in repository.
- Limit: `/[username]` and `/api/click/microsite-link/[linkId]` can be hammered to create unbounded click rows.
- Scaling path: Add IP/user-agent throttling at edge or route level, bot filtering, and write sampling for suspicious traffic.

## Dependencies at Risk

**NextAuth v4 with Next.js 16:**
- Risk: `next-auth` is `^4.24.13` while Next.js is `16.1.6` in `package.json`. Auth.js v5 is separate from NextAuth v4 conventions.
- Impact: Middleware/proxy behavior and App Router integration can become fragile across upgrades.
- Migration plan: Track Auth.js migration path, add auth smoke tests, and verify `src/proxy.ts` behavior after Next.js updates.

**Native bcrypt in standalone output:**
- Risk: `bcrypt` is a native dependency and is externalized in `next.config.ts:5`.
- Impact: Container/runtime mismatch can break password hashing or verification if native module is not present for target platform.
- Migration plan: Keep Docker build validating password flows, or consider `bcryptjs`/WebCrypto-compatible hashing if native packaging becomes unstable.

## Missing Critical Features

**No automated tests:**
- Problem: No test script exists in `package.json`, and no `*.test.*` or `*.spec.*` source tests were detected during mapping.
- Blocks: Safe refactors of auth, slug resolution, redirect behavior, analytics aggregation, and Prisma migration changes.

**No input schema validation layer:**
- Problem: Server actions parse `FormData` inline across `src/app/actions/short.ts` and `src/app/actions/microsite.ts`.
- Blocks: Consistent validation, error messages, and security checks for URL schemes, slug rules, theme values, and max field lengths.

**No migration drift verification:**
- Problem: Schema/migration drift exists and no CI command verifies fresh migration state.
- Blocks: Confidence that checked-in migrations can provision production/staging from scratch.

## Test Coverage Gaps

**Slug and alias collision behavior:**
- What's not tested: Short-link vs microsite precedence, reserved slugs, duplicate aliases, and shadowing rules.
- Files: `src/app/[username]/page.tsx`, `src/app/actions/short.ts`, `src/app/actions/microsite.ts`
- Risk: Public routes can point to wrong destination.
- Priority: High

**Authorization and ownership checks:**
- What's not tested: Editing/deleting/reordering microsites and links across users, global viewer privileges, missing DB user behavior.
- Files: `src/app/actions/microsite.ts`, `src/lib/microsite-access.ts`, `src/app/dashboard/microsites/[id]/page.tsx`
- Risk: Cross-user mutations or blank UI states can ship unnoticed.
- Priority: High

**Redirect security and lifecycle:**
- What's not tested: URL scheme validation, expired password-protected links, inactive microsite links, unpublished microsites, and direct linkId access.
- Files: `src/app/actions/short-link-redirect.ts`, `src/app/api/click/microsite-link/[linkId]/route.ts`, `src/app/[username]/page.tsx`
- Risk: Security bypasses and broken link lifecycle behavior remain invisible.
- Priority: High

**Analytics correctness and scale:**
- What's not tested: Total click calculations, 7-day grouping, top-item ordering, and behavior with large click tables.
- Files: `src/app/dashboard/analytics/page.tsx`, `src/app/dashboard/analytics/analytics-charts.tsx`
- Risk: Dashboard can become slow or inaccurate as data grows.
- Priority: Medium

---

*Concerns audit: 2026-06-26*
