# Codebase Structure

**Analysis Date:** 2026-09-07

## Directory Layout

```text
url-shortener/
├── .agents/                      # GSD workflow orchestration, agent configs, and skills
│   ├── agents/                   # Subagent role definitions (e.g. gsd-codebase-mapper.md)
│   ├── gsd-core/                 # Core GSD scripts and workflow specifications
│   └── skills/                   # Specialized task and workflow skills
├── .planning/                    # Project tracking, state, roadmaps, and codebase maps
│   ├── codebase/                 # 7 codebase documentation maps
│   ├── milestones/               # Archived milestone completion summaries
│   ├── phases/                   # Phase plans, specs, and execution logs
│   ├── config.json               # GSD workflow configuration
│   ├── PROJECT.md                # Project mission, scope, and core decisions
│   ├── ROADMAP.md                # Multi-milestone release plan
│   └── STATE.md                  # Project velocity, current milestone, and active state
├── prisma/                       # Database schema and migration management
│   ├── migrations/               # SQL migration files
│   └── schema.prisma             # Core data model definitions
├── public/                       # Static public assets (SVGs, icons, images)
├── src/                          # Application source code
│   ├── app/                      # Next.js App Router root
│   │   ├── [username]/           # Dynamic public router for short codes & microsites
│   │   ├── actions/              # Next.js Server Actions (mutations and backend queries)
│   │   ├── api/                  # API route handlers (Auth, UploadThing, Clicks, Microsites)
│   │   ├── dashboard/            # Authenticated dashboard views (Links, Microsites, Analytics, Settings)
│   │   ├── login/                # Sign-in page
│   │   ├── favicon.ico           # Application favicon
│   │   ├── globals.css           # Tailwind CSS v4 directives and design tokens
│   │   ├── layout.tsx            # Root HTML layout with providers and fonts
│   │   └── page.tsx              # Root index page (redirects to /dashboard)
│   ├── components/               # Reusable React components
│   │   ├── short-link/           # Short-link specific components (password forms)
│   │   ├── ui/                   # Primitive UI components (buttons, dialogs, cards, switches)
│   │   ├── avatar-image-uploader.tsx
│   │   ├── cover-image-uploader.tsx
│   │   ├── microsite-page-client.tsx
│   │   ├── microsite-qr-code.tsx
│   │   ├── modern-qr-code.tsx
│   │   ├── providers.tsx
│   │   ├── qr-code-dialog.tsx
│   │   └── share-bar.tsx
│   ├── lib/                      # Core business utilities, clients, and helpers
│   │   ├── auth.ts               # NextAuth configuration and callbacks
│   │   ├── microsite-access.ts   # Role and global viewer permission checks
│   │   ├── microsite-themes.ts   # Microsite color schemes and design tokens
│   │   ├── prisma.ts             # PrismaClient singleton with Postgres adapter
│   │   ├── public-microsite.ts   # Helper queries for public microsite presentation
│   │   ├── uploadthing-client.ts # UploadThing React client helper
│   │   ├── uploadthing.ts        # UploadThing file router definition
│   │   ├── user-agent.ts         # User-agent string parser and IP geolocation resolver
│   │   ├── utils.ts              # Classname merge helpers (cn)
│   │   └── validators.ts         # Slug format validation and collision checks
│   ├── middleware.ts             # NextAuth routing protection for /dashboard/*
│   └── types/                    # Custom TypeScript declaration files
├── docker-compose.yml            # Local development orchestration (App + Postgres on 5436)
├── Dockerfile                    # Multi-stage production container build
├── eslint.config.mjs             # ESLint configuration
├── next.config.ts                # Next.js runtime, standalone, and external packages config
├── package.json                  # NPM manifest and project scripts
├── prisma.config.ts              # Prisma CLI configuration
├── tsconfig.json                 # TypeScript compiler options
└── vitest.config.ts              # Vitest unit test configuration
```

## Directory Purposes

**`src/app/`:**
- Purpose: Contains all App Router pages, layouts, and route handlers
- Key files:
  - `src/app/[username]/page.tsx`: Single entry point handling `/my-slug` resolution for both short links and microsites
  - `src/app/dashboard/layout.tsx`: Sidebar navigation, profile info, and breadcrumbs for management views
  - `src/app/dashboard/analytics/page.tsx`: Aggregated telemetry visualization with range filtering

**`src/app/actions/`:**
- Purpose: Server Actions providing type-safe mutations directly callable from UI components
- Key files:
  - `src/app/actions/short.ts`: Short link creation, deletion, and background click recording
  - `src/app/actions/microsite.ts`: Microsite management, link reordering, visibility toggling
  - `src/app/actions/short-link-redirect.ts`: Password verification and redirect execution logic

**`src/app/api/`:**
- Purpose: REST endpoints and third-party webhook integrations
- Key files:
  - `src/app/api/auth/[...nextauth]/route.ts`: NextAuth authentication endpoint
  - `src/app/api/uploadthing/route.ts`: UploadThing media intake
  - `src/app/api/microsites/[slug]/route.ts`: Public JSON API for microsite data

**`src/components/`:**
- Purpose: Modular React client and server components
- Key subdirectories:
  - `src/components/ui/`: Primitive components styled with Tailwind CSS (Card, Button, Dialog, Input, Badge, Switch)
  - `src/components/`: Composite components (e.g. `microsite-qr-code.tsx`, `modern-qr-code.tsx`, `cover-image-uploader.tsx`)

**`src/lib/`:**
- Purpose: Infrastructure singletons, business rule validators, and utility libraries
- Key files:
  - `src/lib/prisma.ts`: Central database client export
  - `src/lib/validators.ts`: Reserved route check and alias conflict prevention
  - `src/lib/microsite-themes.ts`: Predefined themes (clean, ocean, sunset, emerald, etc.)

## Key File Locations

**Entry Points:**
- Web App Wildcard Resolver: `src/app/[username]/page.tsx`
- Dashboard Home: `src/app/dashboard/page.tsx` (redirects to `/dashboard/links`)
- Middleware Protection: `src/middleware.ts`

**Configuration:**
- Next.js: `next.config.ts`
- Database Schema: `prisma/schema.prisma`
- Database CLI: `prisma.config.ts`
- Tests: `vitest.config.ts`
- Docker: `docker-compose.yml` & `Dockerfile`

**Testing:**
- Action Tests: `src/app/actions/*.test.ts`
  - `src/app/actions/short.test.ts`
  - `src/app/actions/microsite.test.ts`
  - `src/app/actions/short-link-redirect.test.ts`

## Naming Conventions

**Files:**
- React components and pages: `kebab-case.tsx` (e.g. `microsite-editor.tsx`, `short-link-form.tsx`)
- Server action files: `kebab-case.ts` (e.g. `short-link-redirect.ts`)
- Unit test files: `kebab-case.test.ts` (e.g. `microsite.test.ts`)
- App Router special files: standard Next.js conventions (`page.tsx`, `layout.tsx`, `route.ts`)

**Directories:**
- App Router routes: `kebab-case` (e.g. `dashboard/analytics`, `dashboard/microsites/new`)
- Dynamic parameters: `[parameter]` (e.g. `[username]`, `[id]`, `[slug]`, `[linkId]`)

## Where to Add New Code

**New Server Action / Backend Logic:**
- Place in `src/app/actions/` (e.g. `src/app/actions/<feature>.ts`).
- Accompany with unit test in `src/app/actions/<feature>.test.ts`.

**New Dashboard Feature / Screen:**
- Create route folder under `src/app/dashboard/<feature-name>/page.tsx`.
- Place complex interactive UI forms in a co-located client component (e.g. `<feature-name>-editor.tsx`).
- If linking from dashboard menu, add navigation entry in `src/app/dashboard/layout.tsx`.

**New Public API Endpoint:**
- Place handler in `src/app/api/<endpoint>/route.ts`.

**New Shared UI Primitive:**
- Place in `src/components/ui/<component>.tsx`.

**New Utility or Helper:**
- Place in `src/lib/<utility-name>.ts`.

## Special Directories

**`prisma/`:**
- Contains `schema.prisma` and SQL migrations. Run `npx prisma generate` whenever modifying models.

**`.planning/`:**
- Tracks project milestones, architecture maps, and task states. Never contains committed secrets or API keys.

---

*Structure analysis: 2026-09-07*
