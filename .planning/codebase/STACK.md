# Technology Stack

**Analysis Date:** 2026-08-04

## Languages

**Primary:**
- TypeScript 5.x - App Router pages, route handlers, server actions, React components in `src/app`, `src/components`, `src/lib`, and `src/types`; configured by `tsconfig.json`.

**Secondary:**
- JavaScript / CommonJS - Local Prisma smoke script in `test-prisma.cjs`.
- CSS - Tailwind CSS v4 global styles through `src/app/globals.css` and `postcss.config.mjs`.
- SQL - Prisma migration SQL in `prisma/migrations/20260226034550_remove_bio_links/migration.sql`.
- Dockerfile / YAML - Container packaging in `Dockerfile`; local app/Postgres stack in `docker-compose.yml`.

## Runtime

**Environment:**
- Node.js 20 Alpine - Production container base image in `Dockerfile` line 1.
- Next.js runtime on port `4000` - `npm run dev`, `npm run start`, `Dockerfile`, and `docker-compose.yml` expose/use port `4000`.
- Next.js route handlers use Node runtime where DB/header access required: `src/app/[username]/page.tsx`, `src/app/api/click/microsite-link/[linkId]/route.ts`, and `src/app/api/microsites/[slug]/route.ts` set `runtime = "nodejs"`.

**Package Manager:**
- npm - `package-lock.json` present; scripts and dependencies defined in `package.json`.
- Lockfile: present (`package-lock.json`).

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React App Router in `src/app`; route handlers in `src/app/api`; server actions in `src/app/actions`; configured by `next.config.ts`.
- React 19.2.3 / React DOM 19.2.3 - UI runtime for `src/components` and `src/app`.
- Prisma 7.4.1 - ORM/client generation through `prisma/schema.prisma`, `prisma.config.ts`, and `src/lib/prisma.ts`.
- PostgreSQL 15 - Local database container in `docker-compose.yml` and Prisma datasource provider in `prisma/schema.prisma`.
- NextAuth 4.24.13 - Google OAuth and JWT session auth in `src/lib/auth.ts` and `src/app/api/auth/[...nextauth]/route.ts`.

**Testing:**
- Not detected - `package.json` has no `test` script or test runner dependency.
- Type verification command is ad hoc: use `npx tsc --noEmit` when TypeScript changes need checking.

**Build/Dev:**
- Next.js build/dev/start - `package.json` scripts: `dev`, `build`, `start`.
- ESLint 9 with Next config - `eslint.config.mjs`; command `npm run lint`.
- Tailwind CSS 4 - PostCSS plugin in `postcss.config.mjs`; shadcn config in `components.json` points CSS to `src/app/globals.css`.
- shadcn/ui 3.8.5 + Radix UI 1.4.3 - Component system configured in `components.json`; UI primitives live in `src/components/ui`.
- Docker multi-stage build - `Dockerfile` runs `npm ci`, `npx prisma generate`, `npm run build`, then runs standalone Next server.
- cross-env 10.1.0 - Injects mock `DATABASE_URL` during `npm run build` in `package.json`.

## Key Dependencies

**Critical:**
- `next` 16.1.6 - Routing, SSR/RSC, server actions, route handlers, standalone output.
- `react` / `react-dom` 19.2.3 - Client/server component rendering.
- `@prisma/client` 7.4.1 - Generated DB client used by `src/lib/prisma.ts`.
- `@prisma/adapter-pg` 7.4.1 and `pg` 8.19.0 - Prisma PostgreSQL driver adapter in `src/lib/prisma.ts`.
- `next-auth` 4.24.13 - Google login, JWT sessions, dashboard protection.
- `uploadthing` 7.7.4 and `@uploadthing/react` 7.3.3 - Authenticated image uploads in `src/lib/uploadthing.ts` and upload UI helpers in `src/lib/uploadthing-client.ts`.
- `bcrypt` 6.0.0 - Short-link password hashing and verification in `src/app/actions/short.ts` and `src/app/actions/short-link-redirect.ts`.
- `nanoid` 5.1.6 - Random short-code generation in `src/app/actions/short.ts`.

**Infrastructure:**
- `postgres:15-alpine` - Local DB service in `docker-compose.yml`.
- `next/font/google` - Inter and DM Sans loaded in `src/app/layout.tsx`.
- `lucide-react` 0.575.0 - Icon library used across components including `src/components/avatar-image-uploader.tsx` and `src/components/cover-image-uploader.tsx`.
- `framer-motion` 12.34.3 - Animation dependency in `package.json`; use for interactive UI when imported.
- `recharts` 3.7.0 - Dashboard charting dependency for analytics UI, including `src/app/dashboard/analytics/analytics-charts.tsx`.
- `qrcode` 1.5.4 and `react-qr-code` 2.0.18 - QR generation/rendering dependencies.
- `class-variance-authority`, `clsx`, `tailwind-merge` - shadcn-style class composition utilities used by UI components and `src/lib/utils.ts`.
- `date-fns` 4.1.0 - Date formatting utility dependency.

## Configuration

**Environment:**
- Runtime env loaded from process environment; `.env` file present.
- Prisma CLI loads `.env` via `prisma.config.ts` using `import "dotenv/config"` and `env("DATABASE_URL")`.
- App DB client reads `DATABASE_URL` and falls back to local Postgres URL in `src/lib/prisma.ts`.
- Auth env vars: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, optional `ALLOWED_EMAILS` in `src/lib/auth.ts` and `docker-compose.yml`.
- Public URL env var: `NEXT_PUBLIC_APP_URL` in `src/app/page.tsx`, `src/app/[username]/page.tsx`, `src/app/dashboard/links/short-link-list.tsx`, and `src/app/dashboard/links/short-link-form.tsx`.
- Upload env var: `UPLOADTHING_TOKEN` passed by `docker-compose.yml`; UploadThing route uses `src/lib/uploadthing.ts`.
- Dashboard/microsite viewer env vars: `GLOBAL_DASHBOARD_VIEWER_EMAIL` and `GLOBAL_MICROSITE_VIEWER_EMAIL` in `src/lib/microsite-access.ts`.

**Build:**
- `next.config.ts` uses `output: 'standalone'` for Docker deployment.
- `next.config.ts` externalizes `@prisma/client` and `bcrypt` through `serverExternalPackages`.
- `next.config.ts` whitelists remote images from `utfs.io`, `*.ufs.sh`, and `lh3.googleusercontent.com`.
- `tsconfig.json` uses strict TypeScript, `moduleResolution: "bundler"`, React JSX, and `@/*` alias to `./src/*`.
- `eslint.config.mjs` extends Next core web vitals and TypeScript lint configs, ignoring `.agents/**` and `test-prisma.cjs`.
- `postcss.config.mjs` enables `@tailwindcss/postcss`.
- `components.json` configures shadcn style `new-york`, RSC, TSX, Tailwind CSS path `src/app/globals.css`, neutral base color, and aliases.

## Platform Requirements

**Development:**
- Use npm commands from `package.json`.
- Run dev app at `http://localhost:4000` with `npm run dev`.
- Start focused local DB with Docker Compose service `db` from `docker-compose.yml`; host port is `5436`.
- Run `npx prisma generate` after `prisma/schema.prisma` changes; Docker build runs this automatically, npm scripts do not.
- Run `npm run lint` for configured verification; use `npx tsc --noEmit` for TypeScript checks.

**Production:**
- Next standalone deployment from `Dockerfile` using `node server.js` on `0.0.0.0:4000`.
