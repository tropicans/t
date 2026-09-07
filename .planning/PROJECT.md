# Taut Microsite Enhancements

## What This Is

Taut is a Next.js URL shortener and link-in-bio product. This project has completed its first two milestones: expanding microsite visual theme choices and drag-and-drop link ordering (v1.0), and implementing database index optimizations, dashboard query parallelization, routing security hardening, and an automated testing suite (v1.1).

## Current Milestone: v1.3 Claude Design System Integration

**Goal:** Integrasikan tool dan repositori `awesome-design-md` / `getdesign`, terapkan spesifikasi Claude design system (`DESIGN.md`), serta implementasikan tema warm terracotta editorial ke dalam styling aplikasi Taut.

**Target features:**
- Instalasi tool `getdesign` / spesifikasi `awesome-design-md` dan integrasi Claude `DESIGN.md`.
- Konfigurasi token Tailwind CSS v4 untuk palet Claude (warm terracotta `#cc785c`, cream canvas `#faf9f5`, dark surfaces `#181715`, editorial typography).
- Pembaruan komponen UI & Dashboard agar konsisten dengan Claude warm terracotta editorial design.
- Penambahan preset tema microsite Claude (`claude` / warm terracotta) di `src/lib/microsite-themes.ts`.
- Verifikasi bebas regresi dengan Vitest automated tests dan TypeScript compiler.

## Core Value

Microsite owners can create a more personalized public page, control link priority, and experience fast, secure dashboard routing and analytics performance.

## Business Context

- **Customer**: Authenticated Taut users who publish public microsites.
- **Revenue model**: Product value/retention for existing short-link and microsite users; monetization model not defined in repository.
- **Success metric**: Fast dashboard loading speed, secure route access checks, collision-free short codes and slugs, and high codebase reliability verified by automated test suites.

## Current State

- Shipped **v1.0** milestone delivering preset themes, drag-and-drop link ordering, Indonesian accessibility announcements/restoration, and mobile double-row responsive layout.
- Shipped **v1.1** milestone delivering clicks database indexing, query parallelization using Promise.all, Next.js middleware protection migration, central route collision checks, protocol scheme validation, and a Vitest automated unit testing suite.
- Shipped **v1.2** milestone delivering microsite slug editing UI, collision-free validators, server action updates, path revalidation, and automated Vitest unit tests.

## Requirements

### Validated

- ✓ Users can authenticate with Google and access protected dashboard routes (existing).
- ✓ Users can create, edit, publish, and view microsites (existing).
- ✓ Users can add active links to microsites and public visitors can click them (existing).
- ✓ Public `/:username` resolves short links first and microsites second (existing).
- ✓ Microsite pages support image uploads, public rendering, and polling refresh (existing).
- ✓ Preset theme selection expanded to 7 choices (dark, light, gradient, midnight, sunset, forest, mono) — v1.0.
- ✓ Dashboard microsite list thumbnails use the same shared registry metadata as the theme picker and public renderer — v1.0.
- ✓ Normalization in server action uses normalizeMicrositeTheme to prevent user-facing validation crashes — v1.0.
- ✓ Picker previews use shared registry styling to render mini public-page lookalikes — v1.0.
- ✓ Public renderer styled using shared registry with fallback — v1.0.
- ✓ User can drag and drop microsite links in the dashboard editor to change their order — v1.0.
- ✓ User can save reordered links and see the new order persist across editor reloads — v1.0.
- ✓ Public microsite displays active links in the saved order — v1.0.
- ✓ Reordering preserves each link's label, URL, active state, and click tracking behavior — v1.0.
- ✓ Reorder persistence is validated server-side so users can only reorder links belonging to their own accessible microsite — v1.0.
- ✓ Link reordering remains usable with keyboard/accessible Indonesian chevrons and focus restoration — v1.0.
- ✓ Reorder UI provides clear visual drag lines and transient green save indicators — v1.0.
- ✓ Theme and ordering changes do not break responsive public microsite layout on mobile and desktop — v1.0.
- ✓ DB-01: Resolving Prisma schema and migration drift for `Microsite.avatarImage` — v1.1.
- ✓ BUG-01: Checking `expiresAt` on password-protected redirects — v1.1.
- ✓ BUG-02: Checking `isActive` and `isPublished` on direct click redirects — v1.1.
- ✓ SEC-01: Standardizing middleware path routing by moving `proxy.ts` to `middleware.ts` — v1.1.
- ✓ SEC-02: Centralizing alias/slug validation to prevent namespace shadowing/collisions — v1.1.
- ✓ SEC-03: Enforcing URL protocol scheme validation to prevent open redirect abuse — v1.1.
- ✓ PERF-01: Adding database indexes on Click tables for analytics — v1.1.
- ✓ PERF-02: Parallelizing async count queries in the dashboard overview and analytics — v1.1.
- ✓ TEST-01: Setting up Vitest and writing unit tests for server actions — v1.1.
- ✓ SLUG-01: User can edit their microsite slug via the information form in the dashboard editor. — v1.2
- ✓ SLUG-02: Editing the slug must validate against collision with reserved routes and short-link codes. — v1.2
- ✓ SLUG-03: Server action `updateMicrosite` must handle slug validation and database updates. — v1.2
- ✓ SLUG-04: Changing the slug triggers path revalidation for both the old and new URLs. — v1.2
- ✓ SLUG-05: Write Vitest unit tests to verify slug updates, collision rejections, and validation outcomes. — v1.2

### Active

- [x] TOOL-01: Install and configure `awesome-design-md` / `getdesign` tooling and pull Claude `DESIGN.md` specification (Phase 8).
- [x] TOKEN-01: Configure Tailwind CSS v4 design tokens and CSS variables adhering to Claude design system (Phase 8).
- [ ] UI-01: Refresh dashboard and shared UI components (cards, buttons, typography, inputs) to match the Claude warm terracotta editorial theme.
- [ ] THEME-01: Add Claude-inspired preset theme to microsite theme registry (`src/lib/microsite-themes.ts`).
- [ ] TEST-01: Verify all unit tests, route validations, and TypeScript typechecking remain passing.

### Out of Scope

- New authentication providers — not needed for this microsite UI increment.
- Payment tiers or gated themes — monetization not requested.
- New public routing model — existing short-link-first resolution stays unchanged.
- Full design-system rewrite — scope is microsite themes and link ordering only.

## Context

- Codebase is a Next.js 16 App Router monolith with React 19, Prisma 7, PostgreSQL, Tailwind CSS v4, shadcn/Radix UI, and server actions.
- Theme presets registry is centralized in `src/lib/microsite-themes.ts`.
- Centralized validation rules for URL syntax, loopback checks, and route collisions live in `src/lib/validators.ts`.
- Next.js native middleware protection is handled via `src/middleware.ts`.
- Vitest automated tests are co-located alongside target server actions (`src/app/actions/*.test.ts`) and configured in `vitest.config.ts`.
- Microsite mutations live in `src/app/actions/microsite.ts` (with ownership validations and atomic transactions for reordering).
- Public microsite data loading lives in `src/lib/public-microsite.ts`.
- Microsite editor UI lives in `src/app/dashboard/microsites/[id]/microsite-editor.tsx` (implements HTML5 drag/drop, keyboard move actions, ARIA live region announcements, and focus restoration).
- Public microsite client rendering lives in `src/components/microsite-page-client.tsx`.

## Constraints

- **Tech stack**: Use existing Next.js App Router, React, Prisma, Tailwind, and shadcn/Radix patterns — avoid new framework choices.
- **Data integrity**: Preserve ownership and global viewer access checks in microsite actions.
- **Routing**: Keep `/:username` resolution order: short link first, microsite second.
- **Verification**: Use `npm run lint`; use `npm run test` for automated Vitest unit testing, and `npx tsc --noEmit` for TypeScript compilation checks.
- **Database**: If `prisma/schema.prisma` changes, run `npx prisma generate` and consider migration drift.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Brownfield planning over greenfield setup | Existing app and codebase map already exist. | ✓ Completed |
| Focus v1 on microsite themes and drag-and-drop link ordering | User requested these two capabilities directly. | ✓ Completed |
| Use vertical MVP phases | Each phase should produce a user-visible capability in the existing app. | ✓ Completed |
| Keep public routing and auth model unchanged | Reduces regression risk for short links, microsites, and dashboard access. | ✓ Completed |
| Centralized theme preset registry | Avoids if-chain duplication across picker previews, public pages, list thumbnails, and server validations. | ✓ Completed |
| Chevrons keyboard reordering | Provides screen-reader accessibility and keyboard-only fallbacks. | ✓ Completed |
| Indonesian ARIA live region | Speaks reorder action start and success announcements in the user's language. | ✓ Completed |
| Optimistic reordering updates | Updates client state instantly on drag/drop or chevron click with automatic transactional persist. | ✓ Completed |
| Native Next.js middleware protection | Moving protected checks to `src/middleware.ts` allows native route control in Next.js. | ✓ Completed (v1.1) |
| Centralized namespace validators | Checking custom aliases and slugs in `src/lib/validators.ts` prevents route collision/shadowing. | ✓ Completed (v1.1) |
| Scheme and protocol auto-correction | Enforcing http/https and auto-prepending protocol improves UX and prevents redirects to data/javascript URIs. | ✓ Completed (v1.1) |
| Database Indexing for clicks | Adding indices to `ShortLinkClick` and `MicrositeClick` accelerates analytics queries. | ✓ Completed (v1.1) |
| Dashboards query parallelization | Utilizing Promise.all reduces query roundtrip latencies for loading dashboards. | ✓ Completed (v1.1) |
| Vitest automated test suite | Co-located unit/integration tests with mocked prisma/sessions validates server actions regression-free. | ✓ Completed (v1.1) |
| Inline slug input field | Placed inside the 'Informasi Microsite' card and shared the 'Simpan' button to minimize UI footprint. | ✓ Completed (v1.2) |
| Prefixed dynamic hostname | Ensures the user understands the resulting URL format. | ✓ Completed (v1.2) |
| Client-side slug sanitization | Converts to lowercase, swaps spaces/non-alphanumeric with hyphens on change, and trims hyphens on blur. | ✓ Completed (v1.2) |
| Centralized collision checking | Validates slug updates against reserved routes and short links before saving. | ✓ Completed (v1.2) |
| Card-level error banner | Provides clear, inline user feedback when slug validation or collision check fails. | ✓ Completed (v1.2) |
| Atomic server action validations | Ensures database updates only occur if all validation and collision checks pass. | ✓ Completed (v1.2) |
| Selective cache revalidation | Triggers path revalidation for old slug, new slug, and editor routes to keep cache fresh. | ✓ Completed (v1.2) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-08-04 after completing v1.2 milestone*
