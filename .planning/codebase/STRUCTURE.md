# Codebase Structure

**Analysis Date:** 2026-06-26

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
- Contains: Providers, public microsite client, share bar, uploaders, UI primitives, short-link password form.
- Key files: `src/components/providers.tsx`, `src/components/microsite-page-client.tsx`, `src/components/share-bar.tsx`, `src/components/cover-image-uploader.tsx`, `src/components/avatar-image-uploader.tsx`.

**`src/components/ui`:**
- Purpose: Reusable shadcn/Radix-style primitives.
- Contains: Buttons, cards, dialogs, dropdowns, inputs, labels, switch, textarea, badge, avatar.
- Key files: `src/components/ui/button.tsx`, `src/components/ui/card.tsx`, `src/components/ui/dialog.tsx`, `src/components/ui/input.tsx`.

**`src/lib`:**
- Purpose: Shared services and helpers.
- Contains: Auth config, Prisma client, UploadThing router, public microsite query, access helper, class utility.
- Key files: `src/lib/auth.ts`, `src/lib/prisma.ts`, `src/lib/uploadthing.ts`, `src/lib/public-microsite.ts`, `src/lib/microsite-access.ts`, `src/lib/utils.ts`.

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
- `package.json`: npm scripts, Next/React/Prisma dependencies.
- `tsconfig.json`: TypeScript strict mode and `@/*` alias to `src/*`.
- `eslint.config.mjs`: ESLint config.
- `components.json`: shadcn component config.
- `postcss.config.mjs`: Tailwind/PostCSS config.
- `prisma.config.ts`: Prisma CLI config.
- `Dockerfile`: Production container build.
- `docker-compose.yml`: Local PostgreSQL service.
- `.env`: Environment configuration file present; do not read contents.

**Core Logic:**
- `src/lib/auth.ts`: NextAuth provider/callback/session policy.
- `src/lib/prisma.ts`: Database client singleton.
- `src/app/actions/short.ts`: Short-link CRUD.
- `src/app/actions/microsite.ts`: Microsite and microsite link CRUD.
- `src/app/actions/short-link-redirect.ts`: Short-link password and click tracking.
- `src/lib/public-microsite.ts`: Public microsite DTO query.
- `src/lib/microsite-access.ts`: Global viewer access helper.

**Feature Pages:**
- `src/app/dashboard/links/page.tsx`: Short-link list and creation page.
- `src/app/dashboard/links/short-link-form.tsx`: Short-link creation client form.
- `src/app/dashboard/links/short-link-list.tsx`: Short-link list client UI.
- `src/app/dashboard/microsites/page.tsx`: Microsite list page.
- `src/app/dashboard/microsites/new/page.tsx`: Microsite creation page.
- `src/app/dashboard/microsites/[id]/page.tsx`: Microsite edit page bootstrap.
- `src/app/dashboard/microsites/[id]/microsite-editor.tsx`: Microsite edit client UI.
- `src/app/dashboard/analytics/page.tsx`: Analytics data aggregation page.
- `src/app/dashboard/analytics/analytics-charts.tsx`: Analytics chart client UI.

**API/Integration:**
- `src/app/api/uploadthing/route.ts`: UploadThing handler.
- `src/lib/uploadthing.ts`: UploadThing file router and auth middleware.
- `src/lib/uploadthing-client.ts`: UploadThing client helpers.
- `src/app/api/microsites/[slug]/route.ts`: Public microsite polling JSON.
- `src/app/api/click/microsite-link/[linkId]/route.ts`: Microsite outbound click tracking redirect.

**Testing:**
- `test-prisma.cjs`: Standalone Prisma smoke/test script.
- No `*.test.*` or `*.spec.*` files detected in app source during architecture scan.

## Naming Conventions

**Files:**
- App Router route files use Next conventions: `page.tsx`, `layout.tsx`, `route.ts`.
- Route-specific client components use kebab-case: `short-link-form.tsx`, `short-link-list.tsx`, `microsite-editor.tsx`, `analytics-charts.tsx`.
- Shared components use kebab-case: `microsite-page-client.tsx`, `share-bar.tsx`, `cover-image-uploader.tsx`.
- UI primitives use kebab-case: `dropdown-menu.tsx`, `button.tsx`, `textarea.tsx`.
- Library modules use kebab-case or single noun: `public-microsite.ts`, `microsite-access.ts`, `prisma.ts`, `auth.ts`.
- Dynamic route folders use bracket syntax: `[username]`, `[id]`, `[slug]`, `[linkId]`, `[...nextauth]`.

**Directories:**
- Feature routes live under route path directories: `src/app/dashboard/links`, `src/app/dashboard/microsites`, `src/app/dashboard/analytics`.
- API routes mirror URL structure: `src/app/api/click/microsite-link/[linkId]`, `src/app/api/microsites/[slug]`.
- Shared primitives live under `src/components/ui`.
- Cross-cutting helpers live under `src/lib`.

## Where to Add New Code

**New Dashboard Feature:**
- Primary route: `src/app/dashboard/<feature>/page.tsx`.
- Feature client components: `src/app/dashboard/<feature>/<feature-component>.tsx`.
- Shared components: `src/components/<component-name>.tsx` only if reused across features.
- Mutations: `src/app/actions/<feature>.ts`.
- Data helpers: `src/lib/<feature>.ts` when needed by multiple routes/actions.

**New Public Route:**
- Primary route: `src/app/<route>/page.tsx` for static route.
- Dynamic route: `src/app/[param]/page.tsx` only if it belongs in global slug namespace.
- Reserved slug list update: `src/app/actions/microsite.ts` when route competes with microsite slugs.

**New API Endpoint:**
- Implementation: `src/app/api/<resource>/route.ts`.
- Dynamic resource endpoint: `src/app/api/<resource>/[id]/route.ts`.
- Shared query code: `src/lib/<resource>.ts` when API and page both need same DTO.

**New Database Model:**
- Schema: `prisma/schema.prisma`.
- Migration: `prisma/migrations/<timestamp>_<name>/migration.sql` via Prisma CLI.
- Client regeneration: run `npx prisma generate` after schema change.
- Data access: import `prisma` from `src/lib/prisma.ts`; do not instantiate new clients.

**New Authenticated Mutation:**
- Implementation: `src/app/actions/<domain>.ts`.
- Pattern: call `getServerSession(authOptions)`, look up DB user by email, validate ownership, mutate Prisma, call `revalidatePath`.
- Caller: client form component under route folder or shared component.

**New UI Primitive:**
- Implementation: `src/components/ui/<primitive>.tsx`.
- Use for cross-feature primitives only; route-specific UI stays beside route under `src/app/dashboard/<feature>`.

**Utilities:**
- Shared helpers: `src/lib/utils.ts` for generic helpers.
- Domain helpers: `src/lib/<domain>.ts` for reusable domain reads/policies.

## Special Directories

**`.next`:**
- Purpose: Next.js build/dev output.
- Generated: Yes.
- Committed: No.

**`node_modules`:**
- Purpose: npm dependency install output.
- Generated: Yes.
- Committed: No.

**`.agents`:**
- Purpose: Agent skills, hooks, and settings for development workflows.
- Generated: No; project tooling content.
- Committed: Repository-specific; do not use for runtime app code.

**`.planning`:**
- Purpose: GSD planning and codebase map artifacts.
- Generated: Yes.
- Committed: Project planning docs.

**`prisma/migrations`:**
- Purpose: Database schema migration history.
- Generated: By Prisma migration workflow.
- Committed: Yes.

**`public`:**
- Purpose: Static web assets.
- Generated: No.
- Committed: Yes.

---

*Structure analysis: 2026-06-26*
