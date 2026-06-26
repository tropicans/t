# Architecture

**Analysis Date:** 2026-06-26

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                 Next.js 16 App Router UI                    │
├──────────────────┬──────────────────┬───────────────────────┤
│   Public Slug    │   Dashboard      │    API Routes         │
│ `src/app/[username]/page.tsx` │ `src/app/dashboard/*` │ `src/app/api/*` │
└────────┬─────────┴────────┬─────────┴──────────┬────────────┘
         │                  │                     │
         ▼                  ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Server Actions + Shared Libraries              │
│ `src/app/actions/*`, `src/lib/*`                             │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              Prisma Client + PostgreSQL Data Store           │
│ `src/lib/prisma.ts`, `prisma/schema.prisma`                  │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Root shell | Loads global styles, fonts, metadata, and `SessionProvider`. | `src/app/layout.tsx` |
| Dashboard protection | Protects `/dashboard/:path*` with NextAuth token check. | `src/proxy.ts` |
| Auth config | Google-only NextAuth, JWT sessions, allowlist, manual `User` upsert. | `src/lib/auth.ts` |
| Prisma singleton | Shared Prisma Client using `@prisma/adapter-pg`. | `src/lib/prisma.ts` |
| Public resolver | Resolves `/:username` as short link first, microsite second. | `src/app/[username]/page.tsx` |
| Public microsite query | Fetches published microsite DTO with active links only. | `src/lib/public-microsite.ts` |
| Short-link actions | Create/list/delete authenticated user short links. | `src/app/actions/short.ts` |
| Redirect actions | Track short-link clicks and verify password redirects. | `src/app/actions/short-link-redirect.ts` |
| Microsite actions | CRUD microsites and microsite links with ownership checks. | `src/app/actions/microsite.ts` |
| Dashboard shell | Authenticated sidebar plus main content. | `src/app/dashboard/layout.tsx` |
| Analytics | Aggregates click counts and 7-day click series. | `src/app/dashboard/analytics/page.tsx` |
| Microsite editor | Client form shell calling microsite server actions. | `src/app/dashboard/microsites/[id]/microsite-editor.tsx` |
| Public microsite client | Renders microsite and polls fresh JSON. | `src/components/microsite-page-client.tsx` |
| Uploads | Authenticated UploadThing file routes for microsite images. | `src/lib/uploadthing.ts`, `src/app/api/uploadthing/route.ts` |

## Pattern Overview

**Overall:** Next.js App Router monolith with Server Components, Server Actions, Prisma data access, and focused client islands.

**Key Characteristics:**
- Use `src/app` file-system routes as feature boundaries.
- Use server components for page-level reads: `src/app/dashboard/links/page.tsx`, `src/app/dashboard/analytics/page.tsx`, `src/app/[username]/page.tsx`.
- Use server actions for mutations: `src/app/actions/short.ts`, `src/app/actions/microsite.ts`.
- Use client components for interactive forms, session UI, uploads, and polling: `src/app/dashboard/layout.tsx`, `src/app/dashboard/microsites/[id]/microsite-editor.tsx`, `src/components/microsite-page-client.tsx`.
- Use `src/lib/*` for reusable auth, access, Prisma, public DTO, upload, and utility code.

## Layers

**Routing Layer:**
- Purpose: Map URLs to pages and API handlers.
- Location: `src/app`
- Contains: `page.tsx`, `layout.tsx`, `route.ts`, and `actions/*` modules.
- Depends on: `src/lib/*`, `src/components/*`, Prisma through `src/lib/prisma.ts`.
- Used by: Browser requests, server action submissions, API clients.

**UI Component Layer:**
- Purpose: Render dashboard UI, public microsites, forms, uploaders, and primitives.
- Location: `src/components`
- Contains: `src/components/ui/*`, `src/components/microsite-page-client.tsx`, `src/components/short-link/password-form.tsx`, `src/components/share-bar.tsx`.
- Depends on: Server actions, public DTO types, React state, UploadThing client helpers.
- Used by: Pages and route-local components under `src/app`.

**Action Layer:**
- Purpose: Authenticated mutations and route revalidation.
- Location: `src/app/actions`
- Contains: `short.ts`, `microsite.ts`, `user.ts`, `short-link-redirect.ts`.
- Depends on: `getServerSession(authOptions)`, `src/lib/prisma.ts`, `src/lib/microsite-access.ts`, `next/cache`, `next/navigation`.
- Used by: Client forms in `src/app/dashboard/**/*` and `src/components/short-link/password-form.tsx`.

**Shared Library Layer:**
- Purpose: Cross-cutting app services.
- Location: `src/lib`
- Contains: `auth.ts`, `prisma.ts`, `public-microsite.ts`, `microsite-access.ts`, `uploadthing.ts`, `utils.ts`.
- Depends on: NextAuth, Prisma, UploadThing, environment variables.
- Used by: Pages, API routes, server actions, components.

**Data Layer:**
- Purpose: Persist users, URLs, microsites, links, click events, and auth tables.
- Location: `prisma/schema.prisma`, `prisma/migrations/*`
- Contains: `User`, `ShortLink`, `ShortLinkClick`, `Microsite`, `MicrositeLink`, `MicrositeClick`, `Account`, `Session`.
- Depends on: PostgreSQL datasource and generated Prisma Client.
- Used by: All Prisma callers through `src/lib/prisma.ts`.

## Data Flow

### Public Short-Link Redirect Path

1. Browser requests `/:username`; App Router invokes `SlugPage` (`src/app/[username]/page.tsx:58`).
2. Page queries `ShortLink` by `shortCode` (`src/app/[username]/page.tsx:63`).
3. Expired link renders expired state (`src/app/[username]/page.tsx:69`).
4. Password link renders `PasswordForm` (`src/app/[username]/page.tsx:81`).
5. Unprotected link calls `trackShortLinkClick(shortLink)` (`src/app/[username]/page.tsx:86`).
6. `trackShortLinkClick` creates `ShortLinkClick` from headers (`src/app/actions/short-link-redirect.ts:9`).
7. Page redirects to original URL (`src/app/[username]/page.tsx:87`).

### Password-Protected Short-Link Path

1. Password form submits to `verifyPasswordAndRedirect` (`src/app/actions/short-link-redirect.ts:27`).
2. Action loads link by `shortCode` (`src/app/actions/short-link-redirect.ts:34`).
3. Action compares bcrypt hash (`src/app/actions/short-link-redirect.ts:40`).
4. Action tracks click and redirects (`src/app/actions/short-link-redirect.ts:46`).

### Public Microsite Path

1. `/:username` tries short-link lookup first (`src/app/[username]/page.tsx:62`).
2. Page calls `getPublishedMicrosite(slug)` when no short link exists (`src/app/[username]/page.tsx:91`).
3. Query selects published microsite and active links (`src/lib/public-microsite.ts:21`).
4. Page records initial `MicrositeClick` fire-and-forget (`src/app/[username]/page.tsx:98`).
5. Page renders `MicrositePageClient` (`src/app/[username]/page.tsx:103`).
6. Client polls `/api/microsites/[slug]` every 10 seconds and on visibility/focus (`src/components/microsite-page-client.tsx:92`).
7. API route returns no-store JSON (`src/app/api/microsites/[slug]/route.ts:27`).

### Microsite Link Click Path

1. Public link targets click API from `MicrositePageClient` (`src/components/microsite-page-client.tsx:219`).
2. Route loads `MicrositeLink` by id (`src/app/api/click/microsite-link/[linkId]/route.ts:14`).
3. Route writes `MicrositeClick` with headers (`src/app/api/click/microsite-link/[linkId]/route.ts:26`).
4. Route redirects to stored URL (`src/app/api/click/microsite-link/[linkId]/route.ts:36`).

### Authenticated Dashboard Mutation Path

1. `src/proxy.ts` protects `/dashboard/:path*` (`src/proxy.ts:19`).
2. Dashboard layout redirects unauthenticated users to `/login` (`src/app/dashboard/layout.tsx:20`).
3. Server page loads session and DB user (`src/app/dashboard/links/page.tsx:9`).
4. Client form invokes server action, e.g. `createShortLink(formData)` (`src/app/actions/short.ts:27`).
5. Action validates ownership/input, writes Prisma record, and calls `revalidatePath` (`src/app/actions/short.ts:74`).
6. Client refreshes page data with `router.refresh()` where needed (`src/app/dashboard/microsites/[id]/microsite-editor.tsx:101`).

**State Management:**
- Persistent state: PostgreSQL via `prisma/schema.prisma`.
- Auth state: NextAuth JWT sessions in `src/lib/auth.ts`.
- Client auth context: `SessionProvider` in `src/components/providers.tsx`.
- Form/editor UI state: React state in client components such as `src/app/dashboard/microsites/[id]/microsite-editor.tsx`.
- Public microsite live refresh: local polling state in `src/components/microsite-page-client.tsx`.

## Key Abstractions

**Prisma Client Singleton:**
- Purpose: Shared database client across route modules and hot reloads.
- Examples: `src/lib/prisma.ts`, Prisma callers in `src/app/**/*`.
- Pattern: `global.__prisma` plus `PrismaPg` adapter.

**NextAuth Options Object:**
- Purpose: Central auth callbacks and provider setup.
- Examples: `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`.
- Pattern: Export `authOptions`, reuse from server pages/actions/routes.

**Server Actions as Mutation Boundary:**
- Purpose: Keep writes server-side and authenticated.
- Examples: `src/app/actions/short.ts`, `src/app/actions/microsite.ts`.
- Pattern: Start with session/DB-user lookup, validate input, mutate Prisma, `revalidatePath`.

**Public Microsite DTO:**
- Purpose: Return only public fields and active link titles for public render/polling.
- Examples: `src/lib/public-microsite.ts`, `src/app/api/microsites/[slug]/route.ts`.
- Pattern: Prisma `select` shapes an explicit data contract.

**Route-Level Access Helper:**
- Purpose: Detect global dashboard viewer from configured email.
- Examples: `src/lib/microsite-access.ts`, `src/app/dashboard/links/page.tsx`, `src/app/actions/microsite.ts`.
- Pattern: Normalize session email and env-configured viewer email.

## Entry Points

**Root Page:**
- Location: `src/app/page.tsx`
- Triggers: Request to `/`.
- Responsibilities: Set metadata and redirect to `/dashboard`.

**Public Slug Page:**
- Location: `src/app/[username]/page.tsx`
- Triggers: Request to `/:username`.
- Responsibilities: Resolve short link, resolve microsite, track views, redirect or render.

**Login Page:**
- Location: `src/app/login/page.tsx`
- Triggers: Request to `/login`.
- Responsibilities: Google sign-in UI and access-denied messaging.

**Dashboard Pages:**
- Location: `src/app/dashboard/**/*page.tsx`
- Triggers: Requests under `/dashboard`.
- Responsibilities: Server-side session/DB reads, feature screens, editor bootstrap.

**API Routes:**
- Location: `src/app/api/*/route.ts`
- Triggers: HTTP requests to `/api/auth/*`, `/api/uploadthing`, `/api/microsites/[slug]`, `/api/click/microsite-link/[linkId]`.
- Responsibilities: Auth, uploads, public polling JSON, tracked outbound redirects.

**Proxy:**
- Location: `src/proxy.ts`
- Triggers: Matched `/dashboard/:path*` requests.
- Responsibilities: Require NextAuth token before dashboard access.

## Architectural Constraints

- **Threading:** Next.js Node.js request lifecycle; route handlers and server actions run asynchronously on Node runtime.
- **Global state:** `src/lib/prisma.ts` stores `global.__prisma` for Prisma client reuse.
- **Circular imports:** Not detected in read paths; keep `src/lib/*` free of imports from `src/app/*` except type-only cases avoided.
- **Runtime:** Public slug and click/polling routes force Node/dynamic behavior with `export const runtime = "nodejs"` or `dynamic = "force-dynamic"` in `src/app/[username]/page.tsx`, `src/app/api/click/microsite-link/[linkId]/route.ts`, and `src/app/api/microsites/[slug]/route.ts`.
- **Path alias:** Use `@/*` for `src/*` imports, configured in `tsconfig.json`.

## Anti-Patterns

### Bypassing Server Actions for Authenticated Mutations

**What happens:** Client components could write through API routes or direct fetch endpoints.
**Why it's wrong:** Existing ownership and revalidation logic lives in server actions like `src/app/actions/microsite.ts` and `src/app/actions/short.ts`.
**Do this instead:** Add new dashboard mutations in `src/app/actions/*`, verify session and ownership, then call `revalidatePath`.

### Duplicating Public Microsite Shape

**What happens:** Public page and polling API could drift if they use separate Prisma selections.
**Why it's wrong:** Client polling compares current and next DTO shape in `src/components/microsite-page-client.tsx`.
**Do this instead:** Use `getPublishedMicrosite` from `src/lib/public-microsite.ts` for both page and API reads.

### Adding Dashboard Auth Only in Client Components

**What happens:** Client-only redirects leave server pages able to execute reads before UI redirects.
**Why it's wrong:** Server pages already read sensitive user-scoped data in `src/app/dashboard/links/page.tsx` and `src/app/dashboard/analytics/page.tsx`.
**Do this instead:** Keep `src/proxy.ts` matcher protection and server-side `getServerSession(authOptions)` checks on pages/actions.

## Error Handling

**Strategy:** Use early returns for expected auth/validation failures, thrown errors for server-action form failures, and `notFound`/`redirect` for route control flow.

**Patterns:**
- Return object errors in short-link action UI flow (`src/app/actions/short.ts:29`).
- Throw errors for microsite edit failures consumed by client editor (`src/app/actions/microsite.ts:18`).
- Use `notFound()` for missing public slug or unauthorized microsite edit (`src/app/[username]/page.tsx:111`, `src/app/dashboard/microsites/[id]/page.tsx:35`).
- Use fire-and-forget click tracking where tracking must not block microsite render (`src/app/[username]/page.tsx:98`).

## Cross-Cutting Concerns

**Logging:** `console.error`/`console.log` in auth and short-link tracking paths: `src/lib/auth.ts`, `src/app/actions/short-link-redirect.ts`, `src/app/actions/short.ts`.
**Validation:** URL validation in `src/app/actions/short.ts`; slug normalization/reserved route checks in `src/app/actions/microsite.ts`; auth allowlist in `src/lib/auth.ts`.
**Authentication:** Google-only NextAuth in `src/lib/auth.ts`; dashboard proxy in `src/proxy.ts`; server actions call `getServerSession(authOptions)`.

---

*Architecture analysis: 2026-06-26*
