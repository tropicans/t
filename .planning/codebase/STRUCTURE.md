# Codebase Structure

**Analysis Date:** 2026-08-04

## Directory Layout

```text
url-shortener/
├── src/                     # Application source
│   ├── app/                 # Next.js App Router routes, layouts, API routes, server actions
│   │   ├── actions/         # Server action mutation modules
│   │   ├── api/             # Route handlers for auth, uploads, polling, click redirect
│   │   ├── dashboard/       # Authenticated dashboard routes
│   │   ├── login/           # Login page
│   │   └── [username]/      # Public short-link/microsite resolver
│   ├── components/          # Shared React components and UI primitives
│   │   ├── short-link/      # Public short-link components
│   │   └── ui/              # shadcn/Radix UI primitives
│   ├── lib/                 # Shared server/client utilities and integrations
│   └── types/               # Type augmentation
├── prisma/                  # Prisma schema and migrations
│   └── migrations/          # Checked-in migration SQL
├── public/                  # Static assets
├── .agents/                 # Agent skill library and settings
├── .planning/codebase/      # Generated codebase maps
├── package.json             # npm scripts and dependencies
├── tsconfig.json            # TypeScript config and `@/*` path alias
├── next.config.ts           # Next.js deployment/build config
├── Dockerfile               # Container build
└── docker-compose.yml       # Local Postgres service
```

## Directory Purposes

**`src/app`:**
- Purpose: Own Next.js App Router application structure.
- Contains: Pages, layouts, route handlers, server actions.
- Key files: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/[username]/page.tsx`, `src/app/dashboard/layout.tsx`.

**`src/app/actions`:**
- Purpose: Server-side mutation boundary for dashboard and redirect workflows.
- Contains: Authenticated CRUD, click tracking, password redirect actions.
- Key files: `src/app/actions/short.ts`, `src/app/actions/microsite.ts`, `src/app/actions/short-link-redirect.ts`, `src/app/actions/user.ts`.

**`src/app/api`:**
- Purpose: HTTP route handlers for integrations and browser polling/redirect endpoints.
- Contains: NextAuth route, UploadThing route, public microsite JSON route, click redirect route.
- Key files: `src/app/api/auth/[...nextauth]/route.ts`, `src/app/api/uploadthing/route.ts`, `src/app/api/microsites/[slug]/route.ts`, `src/app/api/click/microsite-link/[linkId]/route.ts`.

**`src/app/dashboard`:**
- Purpose: Authenticated product UI.
- Contains: Overview, links, microsites, analytics, settings routes.
- Key files: `src/app/dashboard/layout.tsx`, `src/app/dashboard/page.tsx`, `src/app/dashboard/links/page.tsx`, `src/app/dashboard/microsites/page.tsx`, `src/app/dashboard/analytics/page.tsx`.

**`src/components`:**
- Purpose: Shared React components independent from route file conventions.
- Contains: Providers, public microsite client, share bar, uploaders, UI primitives, short-link password form, canvas QR code components.
- Key files: `src/components/providers.tsx`, `src/components/microsite-page-client.tsx`, `src/components/share-bar.tsx`, `src/components/cover-image-uploader.tsx`, `src/components/avatar-image-uploader.tsx`, `src/components/modern-qr-code.tsx`, `src/components/qr-code-dialog.tsx`, `src/components/microsite-qr-code.tsx`.

**`src/components/ui`:**
- Purpose: Reusable shadcn/Radix-style primitives.
- Contains: Buttons, cards, dialogs, dropdowns, inputs, labels, switch, textarea, badge, avatar.
- Key files: `src/components/ui/button.tsx`, `src/components/ui/card.tsx`, `src/components/ui/dialog.tsx`, `src/components/ui/input.tsx`.

**`src/lib`:**
- Purpose: Shared services, helper files, registries.
- Contains: Auth config, Prisma client, UploadThing router, public microsite query, access helper, class utility, theme definitions.
- Key files: `src/lib/auth.ts`, `src/lib/prisma.ts`, `src/lib/uploadthing.ts`, `src/lib/public-microsite.ts`, `src/lib/microsite-access.ts`, `src/lib/microsite-themes.ts`, `src/lib/utils.ts`.

**`src/types`:**
- Purpose: Project type augmentation.
- Contains: NextAuth type declarations.
- Key files: `src/types/next-auth.d.ts`.

**`prisma`:**
- Purpose: Database schema and migration history.
- Contains: Prisma schema, migration lock, migration SQL.
- Key files: `prisma/schema.prisma`, `prisma/migrations/20260226034550_remove_bio_links/migration.sql`, `prisma/migrations/migration_lock.toml`.

**`public`:**
- Purpose: Static assets served from web root.
- Contains: SVG assets from Next template.
- Key files: `public/next.svg`, `public/vercel.svg`, `public/globe.svg`, `public/file.svg`, `public/window.svg`.

**`.planning/codebase`:**
- Purpose: GSD-generated codebase reference docs.
- Contains: Architecture and structure maps.
- Key files: `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md`.

## Key File Locations

**Entry Points:**
- `src/app/page.tsx`: Root route redirects `/` to `/dashboard`.
- `src/app/[username]/page.tsx`: Public resolver for short links and microsites.
- `src/app/login/page.tsx`: Google sign-in page.
- `src/app/dashboard/layout.tsx`: Dashboard shell.
- `src/proxy.ts`: Dashboard route protection.
- `src/app/api/auth/[...nextauth]/route.ts`: NextAuth HTTP entrypoint.

**Configuration:**
- `prisma/schema.prisma`: Schema database models.
- `next.config.ts`: Image whitelisting and standalone build config.
- `tsconfig.json`: TypeScript compiler options and aliases.
- `eslint.config.mjs`: ESLint style configurations.
- `postcss.config.mjs`: PostCSS presets.
- `components.json`: shadcn workspace config.

**Static Data / Registries:**
- `src/lib/microsite-themes.ts`: Shared visual options and style mapping configurations.

**Custom Primitives:**
- `src/components/modern-qr-code.tsx`: High-resolution rounded dot Canvas rendering logic.
- `src/components/qr-code-dialog.tsx`: Popover frame supporting clipboard copy and image downloads.
