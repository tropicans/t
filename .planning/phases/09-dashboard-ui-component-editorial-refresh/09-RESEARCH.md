# Phase 9: Dashboard & UI Component Editorial Refresh - Research

**Researched:** 2026-09-07
**Domain:** UI/UX Design System Integration, Tailwind CSS v4, Next.js App Router Components
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

No user constraints from CONTEXT.md — planning proceeded without prior discuss-phase. All implementation details are at the agent's discretion guided by `DESIGN.md`, `ROADMAP.md`, and `REQUIREMENTS.md` (UI-01, UI-02).

### Locked Requirements (from REQUIREMENTS.md)
- **UI-01**: Refresh dashboard layout, navigation bar, and page headers with Claude warm editorial aesthetics.
- **UI-02**: Update core interactive components (buttons, cards, inputs, and badges) to reflect Claude design tokens.

### Design System Contract (from DESIGN.md & globals.css)
- **Primary Accent**: Warm Terracotta (`#cc785c`, hover/active `#a9583e`).
- **Canvas / Surfaces**: Tinted Cream Canvas (`#faf9f5`) for light mode, Dark Surface (`#181715`) for dark mode; elevated cards (`#efe9de` light / `#252320` dark).
- **Borders**: Hairline Soft (`#e6dfd8` light / `#2e2b27` dark).
- **Typography**: Display/Headlines with humanist serif (`font-serif`), body text with clean sans (`font-sans` / `Inter`).
- **Elimination of Legacy Styles**: Replace legacy hardcoded Tailwind classes (`bg-zinc-900`, `border-zinc-800`, `text-zinc-400`, `text-blue-500`, `stroke="#3b82f6"`, etc.) with semantic token classes.
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Base UI Primitives (`button`, `card`, `input`, `badge`) | Component Library (`src/components/ui`) | Tailwind `@theme` in `globals.css` | Atomic building blocks consumed across all dashboard pages |
| Dashboard Shell & Navigation | Client Component (`src/app/dashboard/layout.tsx`) | Global layout & NextAuth session | Provides persistent sidebar, brand mark, navigation tabs, user badge |
| Overview & Dashboard Views | Server & Client Components (`src/app/dashboard/**`) | Data Fetching via Prisma | Renders metric cards, quick actions, link management lists, analytics charts |
| Analytics Telemetry Charts | Client Component (`analytics-charts.tsx`) | Recharts | Renders area chart with terracotta palette instead of legacy blue |
</architectural_responsibility_map>

<research_summary>
## Summary

Investigation of the current codebase revealed that `src/app/globals.css` already defines the necessary Claude design tokens (`--color-terracotta`, `--color-cream-canvas`, `--color-dark-surface`, `--card`, `--border`, `--sidebar`, `--primary`, `--font-serif`, etc.) established during Phase 8.

However, the dashboard views and components are still using legacy dark utility classes directly:
1. `src/app/dashboard/layout.tsx` hardcodes `border-zinc-800`, `text-white`, `bg-zinc-800`, and `hover:bg-zinc-800`.
2. `src/components/ui/button.tsx`, `card.tsx`, `input.tsx`, and `badge.tsx` have slight styling discrepancies (such as button hover states, focus rings, and input backgrounds).
3. Dashboard pages (`/dashboard`, `/dashboard/links`, `/dashboard/microsites`, `/dashboard/analytics`, `/dashboard/settings`) heavily use `bg-zinc-900/50`, `border-zinc-800`, `text-white`, `text-zinc-400`, and legacy blue accent colors (`text-blue-500`, `hover:border-blue-500/40`, `shadow-blue-600/20`, Recharts `stroke="#3b82f6"`).
4. Section headers lack the humanist editorial serif touch (`font-serif`) specified in `DESIGN.md`.

**Primary recommendation:**
Execute the editorial refresh across two focused plans:
1. Plan 01: Core UI primitives (`button`, `card`, `input`, `badge`) + Dashboard Shell (`DashboardLayout` sidebar, navigation, mobile header).
2. Plan 02: Dashboard pages (`Overview`, `Short Links`, `Microsites`, `Analytics`, `Settings`) to eliminate hardcoded zinc/blue classes, apply `font-serif` headings, and wire Claude chart gradients.
</research_summary>

<component_audit>
## Component Audit & Target Refactoring

### 1. `src/components/ui/`
- **`button.tsx`**: Update `default` variant to `bg-primary text-primary-foreground hover:bg-terracotta-active`, ensure `outline` uses `border-border bg-background hover:bg-muted hover:text-foreground`, and verify focus rings use `focus-visible:ring-ring`.
- **`card.tsx`**: Verify `bg-card text-card-foreground border-border rounded-xl shadow-xs`.
- **`badge.tsx`**: Add semantic styling matching warm terracotta editorial design.
- **`input.tsx`**: Ensure input backgrounds and borders cleanly adapt to theme tokens with `border-border focus-visible:ring-ring`.

### 2. `src/app/dashboard/layout.tsx`
- Refactor sidebar container to `bg-sidebar border-r border-sidebar-border text-sidebar-foreground`.
- Brand logo: Warm terracotta icon container with editorial typography.
- Nav items: Active state `bg-primary/15 text-primary font-medium`, hover state `text-muted-foreground hover:text-foreground hover:bg-sidebar-accent`.
- User badge: Clean semantic card / avatar block.
- Main background: `bg-background text-foreground`.

### 3. Dashboard Pages
- **Overview (`/dashboard/page.tsx`)**: Page title using `font-serif`, metric cards using `Card` primitive without `zinc` overrides, quick action buttons in terracotta and editorial outline.
- **Links (`/dashboard/links/`)**: `ShortLinkForm` inputs and domain badge refactored; `ShortLinkList` cards refactored to `bg-card border-border hover:border-primary/40`.
- **Microsites (`/dashboard/microsites/`)**: Title in `font-serif`, "Buat Microsite" button with terracotta glow, card items styled with `bg-card border-border hover:border-primary/40` without blue shadows.
- **Analytics (`/dashboard/analytics/`)**: Time range selector using semantic pills; Recharts area chart using `#cc785c` (terracotta) stroke and gradient fill, tooltip styled with `bg-card border-border`.
- **Settings (`/dashboard/settings/`)**: Heading in `font-serif`, account card using semantic `Card`.
</component_audit>

<validation_architecture>
## Validation Architecture

1. **TypeScript Type Check**:
   - `npx tsc --noEmit` must pass with zero errors across all modified components.
2. **Automated Unit Tests**:
   - Run existing Vitest test suite (`npm run test` or `npx vitest run`) to guarantee no logic or routing regressions.
3. **Build Validation**:
   - `npm run build` must complete cleanly.
4. **Visual & Interaction Verification**:
   - Confirm active navigation item uses warm terracotta accent.
   - Confirm buttons show `#cc785c` primary and `#a9583e` hover.
   - Confirm headers display editorial serif typography.
   - Confirm light & dark modes render seamlessly without hardcoded zinc clashing.
</validation_architecture>
