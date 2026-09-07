<!-- refreshed: 2026-09-07 -->
# Architecture

**Analysis Date:** 2026-09-07

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Client / Web Browser                              │
├──────────────────────────┬──────────────────────────┬───────────────────────┤
│   Public Short Link URL  │    Public Microsite URL  │   Dashboard / Admin   │
│       `/:shortCode`      │         `/:slug`         │     `/dashboard/*`    │
└─────────────┬────────────┴────────────┬─────────────┴───────────┬───────────┘
              │                         │                         │
              ▼                         ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                   Routing Layer & Auth Protection                           │
│   • `src/middleware.ts` (JWT session check on `/dashboard/:path*`)          │
│   • `src/app/[username]/page.tsx` (Unified public router)                   │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
┌──────────────────────────────┐        ┌─────────────────────────────────────┐
│    Short Link Resolution     │        │        Microsite Resolution         │
│  `ShortLink.shortCode` match │        │        `Microsite.slug` match       │
│  - Password Check / Form     │        │  - Active Links List                │
│  - Background Telemetry      │        │  - Theme & Cover Rendering          │
│  - 307 Redirect              │        │  - Share Bar & QR Code Modal        │
└──────────────┬───────────────┘        └──────────────────┬──────────────────┘
               │                                           │
               ▼                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 Application Logic & Server Actions Layer                    │
│   • `src/app/actions/short.ts` & `src/app/actions/short-link-redirect.ts`    │
│   • `src/app/actions/microsite.ts` (CRUD, ordering, visibility)             │
│   • `src/lib/user-agent.ts` (Device, browser, & country resolution)         │
│   • `src/lib/validators.ts` (Slug reservation & collision checks)           │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 Data Access Layer (Prisma ORM & Adapter)                    │
│   • `src/lib/prisma.ts` (PrismaClient singleton with pg pool adapter)       │
│   • Models: User, ShortLink, ShortLinkClick, Microsite, MicrositeLink, etc.  │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database (Port 5436)                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| **Public Route Resolver** | Resolves `:username` to either a short link redirect or microsite view | `src/app/[username]/page.tsx` |
| **Short Link Redirector** | Evaluates link validity, password authorization, and schedules click tracking | `src/app/actions/short-link-redirect.ts` |
| **Short Link Actions** | CRUD operations for short URLs, alias validation, and click telemetry | `src/app/actions/short.ts` |
| **Microsite Actions** | CRUD operations for microsites, link ordering, theme updates, and views | `src/app/actions/microsite.ts` |
| **Telemetry Parser** | Parses browser, device type, and country code from headers and IP address | `src/lib/user-agent.ts` |
| **Slug Validator** | Enforces reserved route names and bidirectional collision detection | `src/lib/validators.ts` |
| **Auth Options** | NextAuth configuration, Google OAuth provider, JWT callbacks, user upsert | `src/lib/auth.ts` |
| **Access Control** | Evaluates admin email privileges for global view across links and microsites | `src/lib/microsite-access.ts` |
| **Database Client** | Singleton Prisma client configured with `@prisma/adapter-pg` pool | `src/lib/prisma.ts` |
| **Theme Registry** | Defines available microsite visual styles (clean, ocean, sunset, emerald, etc.) | `src/lib/microsite-themes.ts` |

## Pattern Overview

**Overall:** Next.js App Router with Server-First Architecture, Server Actions for mutations, and Fire-and-Forget Background Telemetry.

**Key Characteristics:**
- **Single Public Namespace Router:** Both shortened links (`/deal2026`) and microsites (`/mybrand`) share the root-level path segment `src/app/[username]/page.tsx`.
- **Strict Resolution Precedence:** Short links take priority over microsites. Collision checks prevent users from claiming conflicting slugs or reserved paths.
- **Fire-and-Forget Telemetry:** Click recording runs asynchronously using unawaited background promises (`Promise.resolve().then(...)`) so end-users experience zero latency when redirecting.
- **Client-Side Optimistic & Transition UI:** Dashboard forms and reordering use React transitions (`useTransition`) and state updates with screen-reader accessible live announcements.

## Layers

**Presentation Layer (App Router & Components):**
- Purpose: Render server-rendered pages and interactive client interfaces
- Location: `src/app/` and `src/components/`
- Contains: Page layouts, dashboard views, QR code generators, image uploaders
- Depends on: Server Actions, UI components, NextAuth session
- Used by: End users and dashboard administrators

**Server Actions & Business Logic:**
- Purpose: Execute database mutations, authorization checks, and validation
- Location: `src/app/actions/` and `src/lib/`
- Contains: `short.ts`, `microsite.ts`, `short-link-redirect.ts`, `validators.ts`
- Depends on: Prisma ORM, NextAuth session, Node crypto/bcrypt
- Used by: Next.js pages and client forms

**Data Access Layer:**
- Purpose: Manage database connections, query building, and schema migrations
- Location: `src/lib/prisma.ts` and `prisma/schema.prisma`
- Contains: PrismaClient singleton instance configured with connection pooling
- Depends on: PostgreSQL database
- Used by: Server Actions and Server Component data loaders

## Data Flow

### 1. Short Link Redirect Flow
1. **Request Ingestion:** Visitor requests `GET /:code` (`src/app/[username]/page.tsx`).
2. **Lookup & Precedence:** App queries `prisma.shortLink.findUnique({ where: { shortCode: code } })`.
3. **Password Evaluation:** If password-protected, renders `<PasswordForm />` (`src/components/short-link/password-form.tsx`).
4. **Telemetry Dispatch:** Invokes `trackShortLinkClick(link.id, headers)` asynchronously in the background.
5. **Redirection:** Server issues an immediate HTTP 307 or 302 redirect to `originalUrl`.

### 2. Microsite View Flow
1. **Fallback Lookup:** If no short link matches `:code`, queries `prisma.microsite.findUnique({ where: { slug: code, isPublished: true } })`.
2. **Telemetry Dispatch:** Invokes `trackMicrositeClick(microsite.id, headers)` in the background.
3. **Render:** Renders `<MicrositePageClient />` (`src/components/microsite-page-client.tsx`) populated with active links, theme CSS classes, custom avatar, cover image, and QR code sharing modal.

### 3. Analytics Aggregation Flow
1. **Dashboard Access:** Authenticated user visits `/dashboard/analytics?range=7d` (`src/app/dashboard/analytics/page.tsx`).
2. **Parallel Aggregation:** Server executes parallel Prisma count and findMany queries filtered by `userId` and `createdAt` range.
3. **Telemetry Parsing:** Groups clicks into country flags, device distribution (Mobile vs Desktop), browser breakdown, and top-performing links/microsites.
4. **Chart Rendering:** Feeds hourly or daily aggregated datapoints into `<AnalyticsCharts />` (`src/app/dashboard/analytics/analytics-charts.tsx`).

## Key Abstractions

**Unified Slug Resolution:**
- Purpose: Enables short links and microsite landing pages to share concise top-level vanity URLs without route conflicts.
- Files: `src/app/[username]/page.tsx`, `src/app/actions/short-link-redirect.ts`, `src/lib/validators.ts`.

**Theme Definition Specification:**
- Purpose: Encapsulates styling tokens (background gradient, cards, text, accents, preview dots) for microsites.
- Files: `src/lib/microsite-themes.ts`.

## Entry Points

- `src/middleware.ts`: Intercepts `/dashboard/:path*` to verify active JWT session tokens.
- `src/app/[username]/page.tsx`: Top-level wildcard route handling public visits.
- `src/app/dashboard/page.tsx`: Main user control center redirecting to `/dashboard/links`.
- `src/app/api/uploadthing/route.ts`: Entry point for client asset uploads.
- `src/app/api/auth/[...nextauth]/route.ts`: Entry point for Google OAuth handshakes.

## Architectural Constraints

- **Reserved URL Namespace:** Any slug that conflicts with system routes (`dashboard`, `login`, `api`, `favicon.ico`, `_next`, etc.) is strictly rejected by `validateReservedRoute` (`src/lib/validators.ts`).
- **Cross-Entity Slug Uniqueness:** A microsite slug cannot reuse an existing short link alias, and vice versa.
- **Port Assignment:** Development and container traffic are standardized on port 4000 (avoiding port 3000 collisions).
- **Standalone Docker Output:** App builds require `output: "standalone"` with externalized native modules (`@prisma/client`, `bcrypt`).

## Anti-Patterns

### Blocking Redirects on Telemetry
**What happens:** Waiting for database click writes or external IP geolocation HTTP calls before sending a 307 redirect to the visitor.
**Why it's wrong:** Slows user experience and can cause timeout errors if database or external API is experiencing latency.
**Do this instead:** Execute `trackShortLinkClick` asynchronously without awaiting the promise (`Promise.resolve().then(...)`), ensuring immediate redirect execution (`src/app/actions/short.ts:L186-L200`).

### Hardcoded URL Prefix in Forms
**What happens:** Hardcoding `http://localhost:3000/` or `https://mydomain.com/` in dashboard UI inputs.
**Why it's wrong:** Breaks when domain changes or when running in local development on port 4000.
**Do this instead:** Use dynamic `window.location.host` or relative path prefixing (`src/app/dashboard/microsites/[id]/microsite-editor.tsx`).

---

*Architecture analysis: 2026-09-07*
