# Taut Microsite Enhancements

## What This Is

Taut is a Next.js URL shortener and link-in-bio product. This project has completed its first milestone (v1.0): expanding microsite visual theme choices (7 presets) and letting dashboard users reorder microsite links by drag-and-drop or keyboard chevrons.

## Core Value

Microsite owners can create a more personalized public page and control link priority without fighting manual editing order.

## Business Context

- **Customer**: Authenticated Taut users who publish public microsites.
- **Revenue model**: Product value/retention for existing short-link and microsite users; monetization model not defined in repository.
- **Success metric**: Users can choose from more microsite themes and reorder links reliably, with public microsites reflecting the saved order.

## Current State

- Shipped **v1.0** milestone delivering preset themes, drag-and-drop link ordering, Indonesian accessibility announcements/restoration, and mobile double-row responsive layout.

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

### Active

- DB-01: Resolving Prisma schema and migration drift for `Microsite.avatarImage`.
- BUG-01: Checking `expiresAt` on password-protected redirects.
- BUG-02: Checking `isActive` and `isPublished` on direct click redirects.
- SEC-01: Standardizing middleware path routing by moving `proxy.ts` to `middleware.ts`.
- SEC-02: Centralizing alias/slug validation to prevent namespace shadowing/collisions.
- SEC-03: Enforcing URL protocol scheme validation to prevent open redirect abuse.
- PERF-01: Adding database indexes on Click tables for analytics.
- PERF-02: Parallelizing async count queries in the dashboard overview.
- TEST-01: Setting up Vitest and writing unit tests for server actions.

### Out of Scope

- New authentication providers — not needed for this microsite UI increment.
- Payment tiers or gated themes — monetization not requested.
- New public routing model — existing short-link-first resolution stays unchanged.
- Full design-system rewrite — scope is microsite themes and link ordering only.

## Context

- Codebase is a Next.js 16 App Router monolith with React 19, Prisma 7, PostgreSQL, Tailwind CSS v4, shadcn/Radix UI, and server actions.
- Theme presets registry is centralized in `src/lib/microsite-themes.ts`.
- Microsite mutations live in `src/app/actions/microsite.ts` (with ownership validations and atomic transactions for reordering).
- Public microsite data loading lives in `src/lib/public-microsite.ts`.
- Microsite editor UI lives in `src/app/dashboard/microsites/[id]/microsite-editor.tsx` (implements HTML5 drag/drop, keyboard move actions, ARIA live region announcements, and focus restoration).
- Public microsite client rendering lives in `src/components/microsite-page-client.tsx`.

## Constraints

- **Tech stack**: Use existing Next.js App Router, React, Prisma, Tailwind, and shadcn/Radix patterns — avoid new framework choices.
- **Data integrity**: Preserve ownership and global viewer access checks in microsite actions.
- **Routing**: Keep `/:username` resolution order: short link first, microsite second.
- **Verification**: Use `npm run lint`; use `npx tsc --noEmit` for TypeScript changes because repo has no test script.
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
*Last updated: 2026-08-04 after starting v1.1 milestone*
