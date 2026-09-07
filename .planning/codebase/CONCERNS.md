# Codebase Concerns

**Analysis Date:** 2026-09-07

## Tech Debt

**Schema vs Migration Drift for `Microsite.avatarImage`:**
- Issue: `prisma/schema.prisma` defines the `avatarImage` field on the `Microsite` model, and application code (`src/app/actions/microsite.ts`, `src/app/dashboard/microsites/[id]/microsite-editor.tsx`) actively reads and writes it. However, the initial migration files in `prisma/migrations/` do not create the `avatarImage` column.
- Files: `prisma/schema.prisma`, `prisma/migrations/`, `src/app/actions/microsite.ts`
- Impact: Running `npx prisma migrate deploy` on a clean PostgreSQL instance will create tables missing `avatarImage`, causing runtime Prisma errors when querying microsites.
- Fix approach: Run `npx prisma migrate dev --name add_avatar_image` or generate a synchronization migration to guarantee reproducible deployments.

**Unused `@auth/prisma-adapter` Dependency:**
- Issue: Package `@auth/prisma-adapter` is present in `package.json` and models `Account`, `Session`, and `VerificationToken` exist in `prisma/schema.prisma`. However, `src/lib/auth.ts` implements a purely JWT-based session strategy and manually upserts the `User` model, never using the adapter.
- Files: `package.json`, `src/lib/auth.ts`, `prisma/schema.prisma`
- Impact: Unnecessary dependency baggage and redundant database models.
- Fix approach: Either remove `@auth/prisma-adapter` and prune unneeded models, or formally switch NextAuth session management to database sessions.

## Known Fragile Areas

**Single Public Namespace Collision Surface:**
- Files: `src/app/[username]/page.tsx`, `src/lib/validators.ts`
- Why fragile: Both short links (`/link123`) and microsites (`/brand`) share the root wildcard route segment. If a new public or dashboard route is introduced (e.g. `/features`, `/terms`, `/pricing`) without adding it to `RESERVED_ROUTES` in `src/lib/validators.ts`, users could register that slug and hijack the route, or existing users could have their vanity URLs obscured.
- Safe modification: Whenever adding a top-level route under `src/app/`, always append the route name to `RESERVED_ROUTES` in `src/lib/validators.ts` and add a corresponding unit test in `src/app/actions/short.test.ts`.

**Fire-and-Forget Background Telemetry:**
- Files: `src/app/actions/short.ts`, `src/app/actions/microsite.ts`
- Why fragile: Click tracking uses `Promise.resolve().then(...)` to run queries without blocking HTTP redirects. In serverless deployment runtimes (Vercel, AWS Lambda) or during sudden container restarts, unawaited background promises may be prematurely frozen or terminated, resulting in dropped telemetry.
- Safe modification: If transitioning to serverless or high-scale environments, adopt an asynchronous queue (e.g., Redis, BullMQ, Upstash QStash, or a Cloudflare Worker log stream).

## Security Considerations

**Unencrypted HTTP IP Geolocation Fallback:**
- Risk: `resolveCountryCodeFromIp` in `src/lib/user-agent.ts` issues external requests to `http://ip-api.com/json/{ip}` over plaintext HTTP.
- Files: `src/lib/user-agent.ts`
- Current mitigation: In-memory cache `ipCountryCache` limits outgoing calls, and header-based geolocation (`x-vercel-ip-country`, `cf-ipcountry`) is checked first.
- Recommendations: Upgrade to an HTTPS endpoint or a local offline MaxMind GeoLite database/embedded MMDB reader to eliminate plaintext network requests and rate limits.

**Admin Email Elevation via Environment Variable:**
- Risk: `src/lib/microsite-access.ts` relies on string comparison against `process.env.ADMIN_EMAIL`.
- Current mitigation: Access check is read-only for dashboard aggregation and viewer pages.
- Recommendations: Migrate admin authorization to a formal `role` column on the `User` model in Postgres.

## Performance Bottlenecks

**On-the-Fly Analytics Aggregation:**
- Problem: `src/app/dashboard/analytics/page.tsx` executes `findMany` across all click records for the user's links and microsites within the date range, then aggregates countries, devices, and browsers using JavaScript loops in the server component.
- Files: `src/app/dashboard/analytics/page.tsx`
- Cause: As link clicks scale to 10,000+ records, fetching and deserializing raw rows will degrade database throughput and server memory.
- Improvement path: Leverage PostgreSQL `GROUP BY` aggregation queries (or Prisma `groupBy`) for country, browser, and device counters, fetching only summarized totals instead of raw click rows.

## Scaling Limits

**IP Geolocation API Limits:**
- Current capacity: Free tier of `ip-api.com` is strictly rate-limited to 45 HTTP requests per minute per origin IP.
- Limit: Sustained burst of unknown-country traffic exceeding 45 req/min on a single server instance causes HTTP 429 errors.
- Scaling path: Rely on reverse proxy headers (Nginx/Cloudflare) or install an offline IP-to-country database library.

## Dependencies at Risk

**ESM / CommonJS Warning in Vite Config:**
- Risk: Running `vitest` logs: `Your Vite config uses features that are unsupported by configLoader: 'native'`.
- Files: `vitest.config.ts`, `package.json`
- Impact: Future major versions of Vite will enforce native ESM configuration loading.
- Migration plan: Rename `vitest.config.ts` to `vitest.config.mts` or configure appropriate module type.

---

*Concerns audit: 2026-09-07*
