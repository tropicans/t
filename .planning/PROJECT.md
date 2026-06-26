# Taut Microsite Enhancements

## What This Is

Taut is an existing Next.js URL shortener and link-in-bio product. This project initializes planning for the next brownfield increment: expanding microsite visual theme choices and letting dashboard users reorder microsite links by drag and drop.

## Core Value

Microsite owners can create a more personalized public page and control link priority without fighting manual editing order.

## Business Context

- **Customer**: Authenticated Taut users who publish public microsites.
- **Revenue model**: Product value/retention for existing short-link and microsite users; monetization model not defined in repository.
- **Success metric**: Users can choose from more microsite themes and reorder links reliably, with public microsites reflecting the saved order.

## Requirements

### Validated

- ✓ Users can authenticate with Google and access protected dashboard routes — existing.
- ✓ Users can create, edit, publish, and view microsites — existing.
- ✓ Users can add active links to microsites and public visitors can click them — existing.
- ✓ Public `/:username` resolves short links first and microsites second — existing.
- ✓ Microsite pages support image uploads, public rendering, and polling refresh — existing.

### Active

- [ ] Microsite editor offers more visual theme variants than current implementation.
- [ ] Public microsite rendering applies selected theme consistently.
- [ ] Dashboard users can drag and drop microsite links to reorder them.
- [ ] Saved link order persists and controls public microsite link order.
- [ ] Reordering works without breaking link CRUD, active/inactive filtering, or click tracking.

### Out of Scope

- New authentication providers — not needed for this microsite UI increment.
- Payment tiers or gated themes — monetization not requested.
- New public routing model — existing short-link-first resolution stays unchanged.
- Full design-system rewrite — scope is microsite themes and link ordering only.

## Context

- Codebase is a Next.js 16 App Router monolith with React 19, Prisma 7, PostgreSQL, Tailwind CSS v4, shadcn/Radix UI, and server actions.
- Current microsite mutations live in `src/app/actions/microsite.ts`.
- Public microsite data loading lives in `src/lib/public-microsite.ts`.
- Microsite editor UI lives in `src/app/dashboard/microsites/[id]/microsite-editor.tsx`.
- Public microsite client rendering lives in `src/components/microsite-page-client.tsx`.
- Data model lives in `prisma/schema.prisma`; existing codebase map warns that `Microsite.avatarImage` exists in schema but checked-in migration drift may exist.

## Constraints

- **Tech stack**: Use existing Next.js App Router, React, Prisma, Tailwind, and shadcn/Radix patterns — avoid new framework choices.
- **Data integrity**: Preserve ownership and global viewer access checks in microsite actions.
- **Routing**: Keep `/:username` resolution order: short link first, microsite second.
- **Verification**: Use `npm run lint`; use `npx tsc --noEmit` for TypeScript changes because repo has no test script.
- **Database**: If `prisma/schema.prisma` changes, run `npx prisma generate` and consider migration drift.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Brownfield planning over greenfield setup | Existing app and codebase map already exist. | — Pending |
| Focus v1 on microsite themes and drag-and-drop link ordering | User requested these two capabilities directly. | — Pending |
| Use vertical MVP phases | Each phase should produce a user-visible capability in the existing app. | — Pending |
| Keep public routing and auth model unchanged | Reduces regression risk for short links, microsites, and dashboard access. | — Pending |

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
*Last updated: 2026-06-26 after initialization*
