# Technology Stack

**Analysis Date:** 2026-09-07

## Languages

**Primary:**
- TypeScript 5 (`^5`) - Used across entire application (`src/**/*.ts`, `src/**/*.tsx`, configuration files `next.config.ts`, `prisma.config.ts`, `vitest.config.ts`)
- SQL (PostgreSQL dialect) - Handled through Prisma schema (`prisma/schema.prisma`) and raw migrations

**Secondary:**
- CSS / Tailwind CSS v4 (`@tailwindcss/postcss`, `src/app/globals.css`) - Global styles, color tokens, and utility classes
- CommonJS / Shell scripts - Legacy or tooling scripts in `bin/` and `.agents/`

## Runtime

**Environment:**
- Node.js: v20+ LTS (Local development tested on Node v22.22 via NVM at `C:\Users\yudhiar\AppData\Local\nvm\v22.22.3\node.exe`; Dockerfile uses `node:20-alpine`)
- Target: Next.js Node.js server runtime (`output: "standalone"` in `next.config.ts`)

**Package Manager:**
- npm (lockfile `package-lock.json` checked into repository)
- Dev and prod app traffic bound to port 4000 (`next dev -p 4000`, `next start -p 4000`)

## Frameworks

**Core:**
- Next.js 16.1.6 (App Router, Server Components, Server Actions, Dynamic Route segments)
- React 19.2.3 & React DOM 19.2.3

**UI & Styling:**
- Tailwind CSS v4 (`tailwindcss` `^4`, `@tailwindcss/postcss` `^4`, `tw-animate-css` `^1.4.0`)
- Radix UI (`radix-ui` `^1.4.3`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-slot`, `@radix-ui/react-switch`)
- Lucide React (`lucide-react` `^0.575.0`) - Application icons
- Framer Motion (`framer-motion` `^12.34.3`) - Animations
- Class variance & utilities: `clsx` (`^2.1.1`), `tailwind-merge` (`^3.5.0`), `class-variance-authority` (`^0.7.1`)

**Data Visualization & Presentation:**
- Recharts (`recharts` `^3.7.0`) - Analytics time-series Area charts
- QR Code generation: `react-qr-code` (`^2.0.18`), `qrcode` (`^1.5.4`)
- Date handling: `date-fns` (`^4.1.0`)

**Testing:**
- Vitest (`vitest` `^4.1.10`)
- `@vitejs/plugin-react` (`^6.0.5`)
- Node test environment with `@` path resolution (`vitest.config.ts`)

**Build/Dev:**
- Next.js Compiler / SWC
- ESLint 9 (`eslint` `^9`, `eslint-config-next` `16.1.6`)
- Prisma CLI (`prisma` `^7.4.1`)
- `cross-env` (`^10.1.0`) - Injects build-time mock `DATABASE_URL`

## Key Dependencies

**Critical:**
- `@prisma/client` (`^7.4.1`) - Prisma ORM runtime client
- `@prisma/adapter-pg` (`^7.4.1`) & `pg` (`^8.19.0`) - PostgreSQL connection pool adapter
- `next-auth` (`^4.24.13`) - Authentication system with Google OAuth and JWT sessions (`src/lib/auth.ts`)
- `uploadthing` (`^7.7.4`) & `@uploadthing/react` (`^7.3.3`) - Media upload handling for microsite covers and avatars
- `bcrypt` (`^6.0.0`) - Password hashing for password-protected short links
- `nanoid` (`^5.1.6`) - Random unique code generator for short links

**Infrastructure:**
- Docker & Docker Compose (`docker-compose.yml`) - Multi-stage container builds and PostgreSQL service on host port 5436

## Configuration

**Environment:**
- Local config via `.env` file (loaded at runtime by Next.js and Prisma CLI via `prisma.config.ts`)
- Core env variables:
  - `DATABASE_URL`: PostgreSQL connection string (fallback default: `postgresql://taut_admin:taut_password_123!@localhost:5436/taut_db?schema=public`)
  - `NEXTAUTH_SECRET`: Secret token for signing NextAuth JWTs
  - `NEXTAUTH_URL`: Canonical URL for auth redirects (e.g. `http://localhost:4000`)
  - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Google OAuth credentials
  - `ALLOWED_EMAILS`: Optional comma-separated list of permitted emails
  - `ADMIN_EMAIL`: Email granted global viewer access across links and microsites
  - `UPLOADTHING_TOKEN` / `UPLOADTHING_SECRET` / `UPLOADTHING_APP_ID`: UploadThing API credentials

**Build Configuration:**
- `next.config.ts`:
  - `output: "standalone"`
  - `serverExternalPackages: ["@prisma/client", "bcrypt"]`
  - `images.remotePatterns`: Allowed host `utfs.io`
- `tsconfig.json`: Target `ES2017`, `moduleResolution: "bundler"`, paths `@/*` -> `./src/*`
- `prisma.config.ts`: CLI env loader with `dotenv` configuration

## Platform Requirements

**Development:**
- Node.js 20+
- Docker (optional but recommended for running `docker compose up -d db` on port 5436)
- Port 4000 free for web server

**Production:**
- Docker Alpine container (`node:20-alpine`)
- PostgreSQL database 14+
- Port 4000 exposed

---

*Stack analysis: 2026-09-07*
