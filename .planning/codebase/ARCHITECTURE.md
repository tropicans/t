# Architecture

**Analysis Date:** 2026-08-04

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
| Theme Registry | Central registry mapping theme IDs to tailwind class groupings. | `src/lib/microsite-themes.ts` |
| Modern QR Code | Premium Canvas-based QR code component featuring rounded dots and eyes. | `src/components/modern-qr-code.tsx` |
| QR Code Dialog | Interactive modal trigger that copy/downloads QR codes as high-res PNGs. | `src/components/qr-code-dialog.tsx` |
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
- Use client components for interactive forms, session UI, uploads, polling, and modal interactions: `src/app/dashboard/layout.tsx`, `src/app/dashboard/microsites/[id]/microsite-editor.tsx`, `src/components/microsite-page-client.tsx`, `src/components/qr-code-dialog.tsx`.
- Use `src/lib/*` for reusable auth, access, themes, Prisma, public DTO, upload, and utility code.

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
- Contains: `src/components/ui/*`, `src/components/microsite-page-client.tsx`, `src/components/modern-qr-code.tsx`, `src/components/qr-code-dialog.tsx`, `src/components/share-bar.tsx`.
- Depends on: Server actions, public DTO types, React state, UploadThing client helpers, custom Canvas API.
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
- Contains: `auth.ts`, `prisma.ts`, `microsite-themes.ts`, `public-microsite.ts`, `microsite-access.ts`, `uploadthing.ts`, `utils.ts`.
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

1. Browser requests `/:username`; App Router invokes `SlugPage` (`src/app/[username]/page.tsx`).
2. Page queries `ShortLink` by `shortCode`.
3. Expired link renders expired state.
4. Password link renders `PasswordForm`.
5. Unprotected link calls `trackShortLinkClick(shortLink)`.
6. `trackShortLinkClick` creates `ShortLinkClick` from headers.
7. Page redirects to original URL.

### Password-Protected Short-Link Path

1. Password form submits to `verifyPasswordAndRedirect`.
2. Action loads link by `shortCode`.
3. Action compares bcrypt hash.
4. Action tracks click and redirects.

### Public Microsite Path

1. `/:username` tries short-link lookup first.
2. Page calls `getPublishedMicrosite(slug)` when no short link exists.
3. Query selects published microsite and active links.
4. Page records initial `MicrositeClick` fire-and-forget.
5. Page renders `MicrositePageClient`.
6. Client polls `/api/microsites/[slug]` every 10 seconds and on visibility/focus.
7. API route returns no-store JSON.

### Microsite Link Click Path

1. Public link targets click API from `MicrositePageClient`.
2. Route loads `MicrositeLink` by id.
3. Route writes `MicrositeClick` with headers.
4. Route redirects to stored URL.

### Authenticated Dashboard Mutation Path

1. `src/proxy.ts` protects `/dashboard/:path*`.
2. Dashboard layout redirects unauthenticated users to `/login`.
3. Server page loads session and DB user.
4. Client form invokes server action, e.g. `createShortLink(formData)`.
5. Action validates ownership/input, writes Prisma record, and calls `revalidatePath`.
6. Client refreshes page data with `router.refresh()` where needed.

**State Management:**
- Persistent state: PostgreSQL via `prisma/schema.prisma`.
- Auth state: NextAuth JWT sessions in `src/lib/auth.ts`.
- Client auth context: `SessionProvider` in `src/components/providers.tsx`.
- Form/editor UI state: React state in client components such as `src/app/dashboard/microsites/[id]/microsite-editor.tsx`.
- Public microsite live refresh: local polling state in `src/components/microsite-page-client.tsx`.

## Key Abstractions

**Prisma Client Singleton:**
- Shared database client across route modules and hot reloads in `src/lib/prisma.ts`.

**NextAuth Options Object:**
- Central auth callbacks and provider setup in `src/lib/auth.ts`.

**Server Actions as Mutation Boundary:**
- Server-side authenticated mutations in `src/app/actions/short.ts` and `src/app/actions/microsite.ts`.

**Public Microsite DTO:**
- Return only public fields and active link titles for public render/polling in `src/lib/public-microsite.ts`.

**Route-Level Access Helper:**
- Detect global dashboard viewer from configured email in `src/lib/microsite-access.ts`.

**Theme Registry:**
- Standardized theme styling tokens mapped to client thumbnails and public styling attributes in `src/lib/microsite-themes.ts`.

## Entry Points

**Root Page:**
- Location: `src/app/page.tsx`
- Responsibilities: Set metadata and redirect to `/dashboard`.

**Public Slug Page:**
- Location: `src/app/[username]/page.tsx`
- Responsibilities: Resolve short link, resolve microsite, track views, redirect or render.

**Login Page:**
- Location: `src/app/login/page.tsx`
- Responsibilities: Google sign-in UI and access-denied messaging.

**Dashboard Pages:**
- Location: `src/app/dashboard/**/*page.tsx`
- Responsibilities: Server-side session/DB reads, feature screens, editor bootstrap.

**API Routes:**
- Location: `src/app/api/*/route.ts`
- Responsibilities: Auth, uploads, public polling JSON, tracked outbound redirects.

**Proxy:**
- Location: `src/proxy.ts`
- Responsibilities: Require NextAuth token before dashboard access.

## Architectural Constraints

- **Threading:** Next.js Node.js request lifecycle; route handlers and server actions run asynchronously on Node runtime.
- **Global state:** `src/lib/prisma.ts` stores `global.__prisma` for Prisma client reuse.
- **Circular imports:** Not detected in read paths; keep `src/lib/*` free of imports from `src/app/*` except type-only cases.
- **Runtime:** Public slug and click/polling routes force Node/dynamic behavior with `export const runtime = "nodejs"` or `dynamic = "force-dynamic"`.
- **Path alias:** Use `@/*` for `src/*` imports, configured in `tsconfig.json`.

## Anti-Patterns

### Bypassing Server Actions for Authenticated Mutations
- Avoid client components writing through direct fetch endpoints or custom routes. Keep all writes inside server actions like `src/app/actions/microsite.ts`.

### Duplicating Public Microsite Shape
- Keep selection logic unified. Both `/[username]` and `/api/microsites/[slug]` should consume `getPublishedMicrosite` from `src/lib/public-microsite.ts` to prevent drift.

### Adding Dashboard Auth Only in Client Components
- Keep the proxy validation in `src/proxy.ts` and `getServerSession(authOptions)` in server components. Never rely solely on client-side router checks.
