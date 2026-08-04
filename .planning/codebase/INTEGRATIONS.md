# External Integrations

**Analysis Date:** 2026-08-04

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

- Loaded via process environment.
- Required: `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `UPLOADTHING_TOKEN`.
- Optional: `ALLOWED_EMAILS`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, `GLOBAL_DASHBOARD_VIEWER_EMAIL`, `GLOBAL_MICROSITE_VIEWER_EMAIL`.
