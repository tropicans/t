# AGENTS.md

## Read First
- `README.md` is still the default create-next-app template. Trust `package.json`, `docker-compose.yml`, Prisma config, and `src/app` instead.
- Dev and prod app traffic use port `4000`, not `3000`.

## Commands
- Use `npm` in this repo (`package-lock.json` is checked in).
- `npm run dev` starts Next on `http://localhost:4000`.
- `npm run lint` is the only verification script in `package.json`.
- There is no `test` or `typecheck` script; use `npx tsc --noEmit` when TypeScript changes need verification.
- `npm run build` intentionally injects a mock `DATABASE_URL`, so build is designed to succeed without a live DB.
- Local Postgres is defined in `docker-compose.yml` and exposed on host port `5436`; `docker compose up -d db` is the focused way to bring it up.

## Prisma And Auth
- Prisma CLI loads `.env` through `prisma.config.ts`.
- App runtime DB access goes through `src/lib/prisma.ts`; if `DATABASE_URL` is unset it falls back to `postgresql://taut_admin:taut_password_123!@localhost:5436/taut_db?schema=public`.
- After changing `prisma/schema.prisma`, run `npx prisma generate` manually. The Docker build does this, but npm scripts do not.
- NextAuth is Google-only and JWT-based in `src/lib/auth.ts`.
- Do not assume `PrismaAdapter` is active: the package and `Account`/`Session` models exist, but runtime auth manually upserts `User` and does not use the adapter.
- `ALLOWED_EMAILS` is an optional comma-separated allowlist for Google sign-in.

## Routing
- Auth protection lives in `src/proxy.ts`, not `middleware.ts`, and only matches `/dashboard/:path*`.
- `/` always redirects to `/dashboard`; there is no landing page.
- `src/app/[username]/page.tsx` is the public entrypoint for both short links and microsites.
- Resolution order in `[username]` is `ShortLink.shortCode` first, `Microsite.slug` second. If both use the same string, the short link wins.
- When adding public routes, update the reserved microsite slug list in `src/app/actions/microsite.ts`.
- Short-link custom aliases are only checked against existing short links. They are not validated against reserved routes or microsite slugs.

## Uploads And Deploy
- UploadThing is wired through `src/lib/uploadthing.ts` and `src/app/api/uploadthing/route.ts`; uploads require an authenticated session.
- `next.config.ts` uses `output: "standalone"`, externalizes `@prisma/client` and `bcrypt`, and only whitelists remote images from `utfs.io`.

## Known Drift
- `prisma/schema.prisma` contains `Microsite.avatarImage`, but the only checked-in migration does not add that column. Confirm DB state before relying on it.
