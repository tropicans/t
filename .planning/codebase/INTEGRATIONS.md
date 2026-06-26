# External Integrations

**Analysis Date:** 2026-06-26

## APIs & External Services

**OAuth:**
- Google OAuth - Sign-in provider for authenticated dashboard users.
  - SDK/Client: `next-auth/providers/google` in `src/lib/auth.ts`.
  - Auth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
  - Callback endpoint: `src/app/api/auth/[...nextauth]/route.ts` exports NextAuth `GET` and `POST` handlers.
  - User sync: `src/lib/auth.ts` manually upserts `User` records through Prisma during `signIn` callback.

**File Uploads:**
- UploadThing / UFS - Image uploads for microsite cover and avatar assets.
  - SDK/Client: `uploadthing/next` in `src/lib/uploadthing.ts` and `src/app/api/uploadthing/route.ts`; `@uploadthing/react` in `src/lib/uploadthing-client.ts`.
  - Auth: `UPLOADTHING_TOKEN` environment variable; session check via `getServerSession(authOptions)` in `src/lib/uploadthing.ts`.
  - Upload routes: `micrositeCoverImage` max `4MB`, one image; `micrositeAvatarImage` max `2MB`, one image.
  - Returned URL: `file.ufsUrl` from `src/lib/uploadthing.ts`.
  - Consumers: `src/components/cover-image-uploader.tsx` and `src/components/avatar-image-uploader.tsx` call `useUploadThing(...)`.

**Remote Images:**
- UploadThing image CDN - Render uploaded microsite images.
  - Domains: `utfs.io`, `*.ufs.sh` in `next.config.ts`.
  - Usage: cover/avatar URLs stored on `Microsite.coverImage` and `Microsite.avatarImage` in `prisma/schema.prisma`.
- Google profile images - Render OAuth profile image URLs from Google accounts.
  - Domain: `lh3.googleusercontent.com` in `next.config.ts`.
  - Usage: `User.image` updated from Google sign-in in `src/lib/auth.ts`.

**Geolocation Headers:**
- Vercel edge/country header convention - Click analytics reads `x-vercel-ip-country`.
  - SDK/Client: none; Next headers API in `src/app/[username]/page.tsx` and `src/app/actions/short-link-redirect.ts`.
  - Auth: Not applicable.
  - Fallback: `unknown` country when header missing.

## Data Storage

**Databases:**
- PostgreSQL - Primary relational store for users, links, microsites, click analytics, and NextAuth schema tables.
  - Connection: `DATABASE_URL`.
  - Client: Prisma Client with `@prisma/adapter-pg` in `src/lib/prisma.ts`.
  - Schema: `prisma/schema.prisma` defines `User`, `Account`, `Session`, `ShortLink`, `ShortLinkClick`, `Microsite`, `MicrositeLink`, `MicrositeClick`.
  - Local service: `postgres:15-alpine` in `docker-compose.yml`, host port `5436`, container port `5432`.
  - Migration SQL: `prisma/migrations/20260226034550_remove_bio_links/migration.sql` creates initial tables and indexes.

**File Storage:**
- UploadThing/UFS only for user-uploaded image files.
  - Upload route: `src/app/api/uploadthing/route.ts`.
  - Upload configuration: `src/lib/uploadthing.ts`.
  - Local filesystem only for static assets under `public/`; no app-managed local uploads detected.

**Caching:**
- Next.js route cache disabled for dynamic public/API routes where DB state must be fresh.
  - `src/app/[username]/page.tsx`, `src/app/api/click/microsite-link/[linkId]/route.ts`, and `src/app/api/microsites/[slug]/route.ts` set `dynamic = "force-dynamic"`.
  - `src/app/api/microsites/[slug]/route.ts` returns `Cache-Control: no-store, no-cache, must-revalidate, max-age=0` and `CDN-Cache-Control: no-store`.
- No Redis, Memcached, or external cache service detected.

## Authentication & Identity

**Auth Provider:**
- Google-only OAuth through NextAuth.
  - Implementation: `src/lib/auth.ts` configures `GoogleProvider`, JWT sessions, custom `signIn`, `jwt`, and `session` callbacks.
  - Session strategy: `jwt` in `src/lib/auth.ts`.
  - Sign-in page: `/login` configured in `src/lib/auth.ts`; UI in `src/app/login/page.tsx` calls `signIn("google", { callbackUrl })`.
  - Auth route: `src/app/api/auth/[...nextauth]/route.ts`.
  - Dashboard protection: `src/proxy.ts` uses `withAuth` and matches `/dashboard/:path*`.
  - Allowlist: optional comma-separated `ALLOWED_EMAILS` checked in `src/lib/auth.ts`.
  - App user creation: `src/lib/auth.ts` upserts `User` manually; `@auth/prisma-adapter` package exists but runtime adapter is not configured in `authOptions`.

## Monitoring & Observability

**Error Tracking:**
- None detected. No Sentry, Datadog, OpenTelemetry, or hosted error-tracking SDK imports found in `src`.

**Logs:**
- Console logging only.
  - Unauthorized Google allowlist attempts logged with `[AUTH]` in `src/lib/auth.ts`.
  - Sign-in DB errors logged in `src/lib/auth.ts`.
  - Short-link creation and click-tracking errors logged in `src/app/actions/short.ts` and `src/app/actions/short-link-redirect.ts`.

**Analytics:**
- First-party click/page analytics stored in PostgreSQL.
  - Short-link clicks: `ShortLinkClick` model in `prisma/schema.prisma`; writes in `src/app/actions/short-link-redirect.ts`.
  - Microsite page views: `MicrositeClick` model in `prisma/schema.prisma`; writes in `src/app/[username]/page.tsx`.
  - Microsite link clicks: `MicrositeClick` model with `linkId`; writes in `src/app/api/click/microsite-link/[linkId]/route.ts`.
  - Dashboard reporting: `src/app/dashboard/analytics/page.tsx` and `src/app/dashboard/analytics/analytics-charts.tsx`.

## CI/CD & Deployment

**Hosting:**
- Docker/standalone Next.js container.
  - Docker build: `Dockerfile`.
  - App service: `docker-compose.yml` service `app`, container `taut-app`, host port `4000`.
  - DB service: `docker-compose.yml` service `db`, container `taut-db`, host port `5436`.
- Vercel-like runtime hints exist through `x-vercel-ip-country` header usage in `src/app/[username]/page.tsx`, `src/app/actions/short-link-redirect.ts`, and `src/app/api/click/microsite-link/[linkId]/route.ts`; no Vercel project config detected.

**CI Pipeline:**
- None detected. No `.github/workflows/*` files found.

## Environment Configuration

**Required env vars:**
- `DATABASE_URL` - Prisma/PostgreSQL connection for app runtime and Prisma CLI; used in `src/lib/prisma.ts` and `prisma.config.ts`.
- `NEXTAUTH_URL` - Auth callback/base URL; passed in `docker-compose.yml`.
- `NEXTAUTH_SECRET` - NextAuth JWT/session secret; passed in `docker-compose.yml`.
- `NEXT_PUBLIC_APP_URL` - Public base URL used for redirects, short-link display, and Open Graph URLs in `src/app/page.tsx`, `src/app/[username]/page.tsx`, `src/app/dashboard/links/short-link-list.tsx`, and `src/app/dashboard/links/short-link-form.tsx`.
- `GOOGLE_CLIENT_ID` - Google OAuth client ID in `src/lib/auth.ts`.
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret in `src/lib/auth.ts`.
- `UPLOADTHING_TOKEN` - UploadThing service token passed in `docker-compose.yml`.

**Optional env vars:**
- `ALLOWED_EMAILS` - Optional Google login allowlist in `src/lib/auth.ts`.
- `GLOBAL_DASHBOARD_VIEWER_EMAIL` - Viewer override in `src/lib/microsite-access.ts` and `docker-compose.yml`.
- `GLOBAL_MICROSITE_VIEWER_EMAIL` - Alternate viewer override in `src/lib/microsite-access.ts`.

**Secrets location:**
- `.env` file present at repo root; contents not read.
- `docker-compose.yml` wires env vars from shell/.env into app container. Note: file also contains development fallback values and local Postgres credentials in plaintext; treat those as local-only configuration.

## Webhooks & Callbacks

**Incoming:**
- NextAuth OAuth callback and session endpoints: `src/app/api/auth/[...nextauth]/route.ts` handles `GET` and `POST` for `/api/auth/*`.
- UploadThing callback/route handler: `src/app/api/uploadthing/route.ts` handles `GET` and `POST` for upload flow.
- Microsite JSON API: `src/app/api/microsites/[slug]/route.ts` returns published microsite data with no-store headers.
- Microsite link click redirect endpoint: `src/app/api/click/microsite-link/[linkId]/route.ts` records click then redirects to external link URL.

**Outgoing:**
- Redirect to user-provided short-link destination: `src/app/[username]/page.tsx` and `src/app/actions/short-link-redirect.ts`.
- Redirect to microsite link destination: `src/app/api/click/microsite-link/[linkId]/route.ts`.
- Google OAuth network flow managed by NextAuth provider in `src/lib/auth.ts`.
- UploadThing file upload flow initiated by `src/components/cover-image-uploader.tsx` and `src/components/avatar-image-uploader.tsx` through `src/lib/uploadthing-client.ts`.

---

*Integration audit: 2026-06-26*
