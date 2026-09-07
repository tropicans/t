# Milestones

## v1.5 Invitation Link & Dynamic User Onboarding (Shipped: 2026-09-07)

**Phases completed:** 3 phases, 3 plans, 0 tasks

**Key accomplishments:**

- Defined Prisma `Invitation` schema with unique token generation, expiration timestamps, usage quotas, target email restrictions, and status lifecycle.
- Protected `/invite` route namespace in `RESERVED_SLUGS` against short-link and microsite collisions.
- Designed and built Claude warm editorial public invitation landing page at `/invite/[token]` with real-time status validation, inviter metadata, and Google sign-in action.
- Implemented NextAuth 3-tier authorization callback in `src/lib/auth.ts`: unrestricted login for existing database users, superadmin bootstrap allowlist (`ALLOWED_EMAILS`), and secure cookie-based dynamic invitation claiming with atomic user provisioning.
- Built Invitation Management dashboard in `/dashboard/invitations` with multi-use open and email-specific links generation, quota/expiry selectors, real-time status badges, claimed users accordion, copy-to-clipboard, and link revocation.
- Verified system stability with 64/64 passing Vitest automated tests across 8 test suites, clean TypeScript compilation, 18-route Next.js production build, and successful production Docker image build targeting port 4000.

---

## v1.3 Claude Design System Integration (Shipped: 2026-09-07)

**Phases completed:** 3 phases, 4 plans, 0 tasks

**Key accomplishments:**

- Integrated Claude design system specification (`DESIGN.md`) into repository and registered guidelines in `AGENTS.md`.
- Configured Tailwind CSS v4 design tokens and CSS custom properties for Claude palette (warm terracotta `#cc785c`, cream canvas `#faf9f5`, dark surfaces `#181715`).
- Configured Google Font `Newsreader` to inject `--font-serif` for editorial typography.
- Refactored core UI primitives (button, card, badge, input) and dashboard layout (sidebar, metrics, charts, tables) to Claude warm editorial aesthetics.
- Added `claude` preset theme to microsite theme registry with warm cream canvas, elevated cards, and terracotta accents.
- Verified system stability with 24/24 Vitest unit tests, clean TypeScript compilation, and successful Next.js production build.

---

## v1.2 Edit Link Microsite (Shipped: 2026-08-04)

**Phases completed:** 1 phases, 1 plans, 0 tasks

**Key accomplishments:**

- (none recorded)

---

## v1.1 Perbaikan dan Optimasi (Shipped: 2026-08-04)

**Phases completed:** 3 phases, 3 plans, 0 tasks

**Key accomplishments:**

- (none recorded)

---

## v1.0 v1.0 (Shipped: 2026-06-27)

**Phases completed:** 3 phases, 4 plans, 0 tasks

**Key accomplishments:**

- (none recorded)

---

## v1.0 v1.0 (Shipped: 2026-06-27)

**Phases completed:** 3 phases, 4 plans, 0 tasks

**Key accomplishments:**

- (none recorded)

---

## v1.0 v1.0 (Shipped: 2026-06-27)

**Phases completed:** 3 phases, 4 plans, 0 tasks

**Key accomplishments:**

- (none recorded)

---
