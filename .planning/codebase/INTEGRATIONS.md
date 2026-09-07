# External Integrations

**Analysis Date:** 2026-09-07

## APIs & External Services

**File & Media Hosting:**
- UploadThing - Cloud storage for microsite cover images and avatar images
  - SDK/Client: `uploadthing` (`^7.7.4`), `@uploadthing/react` (`^7.3.3`)
  - Integration Files: `src/lib/uploadthing.ts`, `src/lib/uploadthing-client.ts`, `src/app/api/uploadthing/route.ts`
  - Auth/Keys: `UPLOADTHING_TOKEN` (or `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID`)
  - Allowed Domains: `utfs.io` (configured in `next.config.ts`)

**IP Geolocation Fallback:**
- ip-api.com - Background country resolution for self-hosted deployments lacking CDN header geolocation
  - Implementation: `resolveCountryCodeFromIp` in `src/lib/user-agent.ts`
  - Protocol: HTTP REST (`http://ip-api.com/json/{ip}?fields=status,countryCode`)
  - Cache: In-memory `Map<string, string>` to minimize external HTTP overhead and avoid rate limits (45 req/min)

## Data Storage

**Databases:**
- PostgreSQL (v14+)
  - Connection: `DATABASE_URL` (fallback configured in `src/lib/prisma.ts`: `postgresql://taut_admin:taut_password_123!@localhost:5436/taut_db?schema=public`)
  - Local Dev Container: Service `db` in `docker-compose.yml` exposing port `5436:5432`
  - Client / ORM: Prisma ORM (`@prisma/client` `^7.4.1`) using `@prisma/adapter-pg` driver adapter with `pg` pool
  - Models: `User`, `Account`, `Session`, `VerificationToken`, `ShortLink`, `ShortLinkClick`, `Microsite`, `MicrositeLink`, `MicrositeClick`

**File Storage:**
- Cloud bucket: UploadThing CDN (`https://utfs.io/f/...`)
- No local filesystem media storage is used in production or container environments.

**Caching & Memory:**
- In-memory Geolocation Cache: `ipCountryCache` Map in `src/lib/user-agent.ts` (max 500 entries)
- Prisma Client Singleton: Cached on `globalThis.prismaGlobal` in non-production environments (`src/lib/prisma.ts`)

## Authentication & Identity

**Auth Provider:**
- NextAuth.js v4 (`src/app/api/auth/[...nextauth]/route.ts`, `src/lib/auth.ts`)
  - Provider: Google Provider (`GoogleProvider`)
  - Credentials: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - Session Strategy: JWT (JSON Web Token) with maxAge 30 days
  - Allowlist Enforcement: Optional `ALLOWED_EMAILS` check in `signIn` callback
  - Database Sync: Manual user upsert (`prisma.user.upsert`) during `signIn` callback to ensure a database record exists without relying on `PrismaAdapter` session management
  - Admin/Viewer Role: `ADMIN_EMAIL` env check via `src/lib/microsite-access.ts`

## Monitoring & Observability

**Error Tracking:**
- Standard console logging (`console.error`, `console.warn`)
- Server action error bubbling to client via error return shapes or thrown Error messages caught by UI transition handlers

**Telemetry & Analytics:**
- Built-in click tracking models: `ShortLinkClick` and `MicrositeClick`
- User-Agent parser (`src/lib/user-agent.ts`) extracting device type (`Mobile`, `Desktop`, `Unknown`) and browser name (`Chrome`, `Safari`, `Firefox`, `Edge`, etc.)
- Country code extraction from request headers (`x-vercel-ip-country`, `cf-ipcountry`, `x-country-code`) with fallback to IP resolution

## CI/CD & Deployment

**Hosting & Containers:**
- Multi-stage Docker build (`Dockerfile`)
  - Stage 1: `base` with alpine & node 20
  - Stage 2: `deps` running `npm ci`
  - Stage 3: `builder` running `prisma generate` and `npm run build`
  - Stage 4: `runner` serving standalone output `node server.js`
- Docker Compose: Orchestrates `db` (Postgres) and `app` container services

## Environment Configuration

**Required Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Random string for encrypting auth cookies/tokens
- `NEXTAUTH_URL`: Canonical domain URL (e.g. `http://localhost:4000`)
- `GOOGLE_CLIENT_ID`: Google Cloud OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Google Cloud OAuth Client Secret
- `UPLOADTHING_TOKEN`: UploadThing authentication token for file uploads

**Optional Variables:**
- `ALLOWED_EMAILS`: Comma-separated list of allowed user emails
- `ADMIN_EMAIL`: Email granted global dashboard viewer privileges across all user links/microsites

## Webhooks & API Endpoints

**Incoming / API Routes:**
- `/api/auth/[...nextauth]`: NextAuth handler for Google OAuth flow and session checks
- `/api/uploadthing`: UploadThing server route for receiving file upload webhooks and authorizing client tokens
- `/api/click/microsite-link/[linkId]`: GET route for tracking individual microsite link button clicks
- `/api/microsites/[slug]`: GET route returning published microsite data, links, and styling in JSON format

**Outgoing:**
- Google OAuth API: Token exchange during sign-in
- UploadThing API: File upload validation and asset registry
- ip-api.com: IP Geolocation queries (background)

---

*Integration audit: 2026-09-07*
