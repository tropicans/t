# Phase 01: microsite-theme-variants - Research

**Researched:** 2026-06-26
**Domain:** Next.js App Router microsite theming, shared TypeScript registry, Tailwind class configuration
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
## Implementation Decisions

### Theme Set
- **D-01:** Target 7 total preset themes in Phase 1: preserve existing `dark`, `light`, and `gradient`, and add `midnight`, `sunset`, `forest`, and `mono`.
- **D-02:** Existing `dark`, `light`, and `gradient` public visuals should remain visually unchanged to avoid surprising current microsite owners.
- **D-03:** Theme IDs should remain stable plain strings such as `dark`, `light`, `gradient`, `midnight`, `sunset`, `forest`, and `mono`.
- **D-04:** Theme registry should include display metadata reusable by editor previews, public render styles, and dashboard list thumbnails.

### Preview Fidelity
- **D-05:** Dashboard theme picker should show mini public-page previews, not simple color swatches or a full live preview.
- **D-06:** Preview cards should use the same shared theme registry classes that public rendering uses, with miniature background, avatar/dot, title strip, and two link-card shapes.
- **D-07:** Each theme card should show theme name plus short tagline/mood text.
- **D-08:** Desktop editor picker should keep 3 cards per row, matching the existing editor grid.
- **D-09:** Selected theme state should use border plus checkmark, preserving the current visible selection pattern.

### Fallback And Validation
- **D-10:** Public microsite should render default `dark` when stored DB theme is unknown or legacy-invalid.
- **D-11:** Create/update server actions should normalize invalid submitted theme values to `dark` instead of rejecting with a user-facing error.
- **D-12:** Editor should auto-select `dark` silently for unknown saved theme values.
- **D-13:** `Microsite.theme` can remain a string; validation/normalization belongs in the shared registry and server action boundary.

### Visual Tone
- **D-14:** Expanded theme set should feel professional and brandable, suitable for real public profiles.
- **D-15:** Palette spread should be balanced: dark, light, warm, cool/nature, and high-contrast options.
- **D-16:** Themes should affect colors and surfaces only. Keep typography, layout, and spacing consistent across themes.
- **D-17:** Every preset must meet strict readability/contrast expectations for public mobile and desktop pages. Low-contrast presets should not ship.

### the agent's Discretion
No selected area was delegated to the agent. Downstream agents should follow the locked decisions above.

### the agent's Discretion
No selected area was delegated to the agent. Downstream agents should follow the locked decisions above.

### Deferred Ideas (OUT OF SCOPE)
## Deferred Ideas

None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| THEME-01 | User can choose from an expanded set of microsite visual themes in the dashboard editor. | Use 7-entry shared `MICROSITE_THEMES` registry consumed by edit and create screens. [VERIFIED: CONTEXT.md + codebase read] |
| THEME-02 | User can preview or recognize each theme option by name and visual styling before saving. | Registry must include `label`, `tagline`, and literal preview classes for mini public-page preview cards. [VERIFIED: CONTEXT.md + codebase read] |
| THEME-03 | User can save a selected theme and see it persist across editor reloads. | Existing editor submits hidden `theme` field to `updateMicrosite`; server action writes `Microsite.theme`; add normalization before write. [VERIFIED: codebase read] |
| THEME-04 | Public microsite renders the saved theme consistently for background, text, buttons, and card/link styling. | Replace local `themeStyles` in `src/components/microsite-page-client.tsx` with shared registry public styles. [VERIFIED: codebase read] |
| THEME-05 | Theme configuration is centralized so dashboard editor and public microsite use the same allowed theme list. | Add `src/lib/microsite-themes.ts`; remove local `THEMES`, `themeStyles`, and `ThemeThumbnail` drift points. [VERIFIED: CONTEXT.md + codebase read] |
</phase_requirements>

## Summary

Phase 01 should be planned as a narrow brownfield refactor plus UI expansion: add one shared theme registry, route all dashboard and public theme usage through it, and keep `Microsite.theme` as a string with normalization at action and render boundaries. Current code has three separate theme definitions: edit picker local `THEMES`, create page local `THEMES`, public `themeStyles`, plus dashboard list `ThemeThumbnail`; these are drift risks and must be replaced by one source. [VERIFIED: codebase read]

No external package install needed. Current stack already supports this phase: Next.js 16.1.6, React 19.2.3, TypeScript 5, Tailwind CSS 4, shadcn/Radix primitives, Prisma 7.4.1, and npm scripts. [VERIFIED: package.json] Theme work should use literal Tailwind class strings in registry, because existing code and project guidance warn against dynamic Tailwind class construction. [VERIFIED: CONTEXT.md + codebase read]

**Primary recommendation:** Create `src/lib/microsite-themes.ts` with `DEFAULT_MICROSITE_THEME_ID`, typed theme IDs, `MICROSITE_THEMES`, `getMicrositeTheme`, `normalizeMicrositeTheme`, and `isMicrositeThemeId`; then update create/edit/list/public consumers in one wave. [VERIFIED: CONTEXT.md + codebase read]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| Theme source of truth | Shared Library | Browser / Client | Registry belongs in `src/lib` so both client components and server actions import same allowlist. [VERIFIED: codebase read] |
| Theme selection UI | Browser / Client | Shared Library | Dashboard editor/create screens own interaction state; registry supplies metadata/classes. [VERIFIED: codebase read] |
| Submitted theme normalization | API / Backend | Shared Library | Server action boundary must prevent new invalid free-string writes. [VERIFIED: codebase read] |
| Public theme fallback/rendering | Browser / Client | Shared Library | Public renderer is client component and already falls back to dark; registry should own fallback. [VERIFIED: codebase read] |
| Theme persistence | Database / Storage | API / Backend | Existing Prisma `Microsite.theme` string persists selection; no enum migration desired. [VERIFIED: CONTEXT.md + codebase read] |
| Dashboard thumbnail parity | Frontend Server (SSR) | Shared Library | `src/app/dashboard/microsites/page.tsx` is server-rendered and should consume registry thumbnail metadata. [VERIFIED: codebase read] |

## Project Constraints (from AGENTS.md)

- Trust `package.json`, `docker-compose.yml`, Prisma config, and `src/app`; do not trust template README. [VERIFIED: AGENTS.md]
- Dev and prod app traffic use port `4000`, not `3000`. [VERIFIED: AGENTS.md]
- Use `npm`; `package-lock.json` exists. [VERIFIED: AGENTS.md]
- `npm run dev` starts Next at `http://localhost:4000`. [VERIFIED: AGENTS.md]
- `npm run lint` is only package verification script. [VERIFIED: AGENTS.md]
- No `test` or `typecheck` script exists; use `npx tsc --noEmit` for TypeScript verification. [VERIFIED: AGENTS.md]
- `npm run build` intentionally injects mock `DATABASE_URL`; build should succeed without live DB. [VERIFIED: AGENTS.md]
- Local Postgres uses Docker Compose and host port `5436`; focused start command is `docker compose up -d db`. [VERIFIED: AGENTS.md]
- Prisma CLI loads `.env` through `prisma.config.ts`. [VERIFIED: AGENTS.md]
- Runtime DB access goes through `src/lib/prisma.ts`; missing `DATABASE_URL` falls back to local Postgres URL. [VERIFIED: AGENTS.md]
- After changing `prisma/schema.prisma`, run `npx prisma generate`; this phase should avoid schema change. [VERIFIED: AGENTS.md + CONTEXT.md]
- NextAuth is Google-only and JWT-based in `src/lib/auth.ts`; do not assume PrismaAdapter runtime auth. [VERIFIED: AGENTS.md]
- Auth protection lives in `src/proxy.ts`, not `middleware.ts`, and only matches `/dashboard/:path*`. [VERIFIED: AGENTS.md]
- `/` always redirects to `/dashboard`; no landing page. [VERIFIED: AGENTS.md]
- `src/app/[username]/page.tsx` is public entrypoint for short links and microsites. [VERIFIED: AGENTS.md]
- `[username]` resolution order is `ShortLink.shortCode` first, `Microsite.slug` second; short link wins on conflict. [VERIFIED: AGENTS.md]
- When adding public routes, update reserved microsite slug list; this phase adds no public route. [VERIFIED: AGENTS.md + CONTEXT.md]
- UploadThing uploads require authenticated session; not in phase scope. [VERIFIED: AGENTS.md]
- Known drift: `Microsite.avatarImage` exists in Prisma schema but only checked-in migration may not add column; avoid schema reliance/migration unless DB state confirmed. [VERIFIED: AGENTS.md]

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | 16.1.6 | App Router pages, server actions, route handlers. | Existing app framework; dashboard and public microsite already live in `src/app`. [VERIFIED: package.json + codebase read] |
| `react` / `react-dom` | 19.2.3 | Client theme picker state and public renderer. | Existing UI runtime; editor and public renderer are client components. [VERIFIED: package.json + codebase read] |
| `typescript` | ^5 | Typed theme registry and helper return types. | Existing strict TS config; central registry should enforce allowed theme IDs at compile time. [VERIFIED: package.json + codebase read] |
| `tailwindcss` | ^4 | Literal utility classes for themes/previews. | Existing styling model; class strings already drive editor/public themes. [VERIFIED: package.json + codebase read] |
| `@prisma/client` | ^7.4.1 | Persist `Microsite.theme` string. | Existing data layer; no schema change needed for this phase. [VERIFIED: package.json + CONTEXT.md] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | ^0.575.0 | Checkmark/visual selected state icon if desired. | Preserve border-plus-checkmark selected state in theme cards. [VERIFIED: package.json + CONTEXT.md] |
| `clsx` / `tailwind-merge` via `src/lib/utils.ts` | clsx ^2.1.1, tailwind-merge ^3.5.0 | Optional class merging helper. | Use only if composing existing literal class fragments; avoid dynamic Tailwind generation. [VERIFIED: package.json + codebase read] |
| shadcn/Radix local UI primitives | `radix-ui` ^1.4.3 | Cards, labels, buttons in dashboard. | Reuse existing `Button`, `Card`, `Label`, `Badge` patterns. [VERIFIED: package.json + codebase read] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Shared TypeScript registry | Prisma enum migration | Rejected by locked decision; enum adds migration risk and conflicts with free-string fallback strategy. [VERIFIED: CONTEXT.md] |
| Literal Tailwind class strings | Dynamic class builders | Rejected because Tailwind may not see dynamic class names and existing project uses inline literal utilities. [VERIFIED: CONTEXT.md + codebase read] |
| Mini public-page preview cards | Full live preview iframe | Rejected by locked decision; mini previews are sufficient and cheaper. [VERIFIED: CONTEXT.md] |
| Existing UI primitives | New design system/theme framework | Rejected by phase boundary; no design-system rewrite. [VERIFIED: CONTEXT.md] |

**Installation:**
```bash
# No package install needed for Phase 01.
```

**Version verification:** Versions verified from `package.json` read in this session. [VERIFIED: package.json]

## Package Legitimacy Audit

No external packages installed in this phase. Package legitimacy gate not required. [VERIFIED: phase scope + package.json]

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| none | — | — | — | — | — | No install |

**Packages removed due to [SLOP] verdict:** none  
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```text
Dashboard create/edit input
  -> Theme picker uses MICROSITE_THEMES preview metadata
  -> FormData.theme submitted as stable string
  -> createMicrosite/updateMicrosite server actions
      -> normalizeMicrositeTheme(raw) at trust boundary
      -> Prisma writes Microsite.theme string
      -> revalidate dashboard/public paths
  -> Public resolver/API returns theme string in DTO
  -> MicrositePageClient getMicrositeTheme(theme)
      -> known theme: render public classes
      -> unknown/legacy theme: default dark classes

Dashboard microsite list
  -> ThemeThumbnail consumes same registry thumbnail metadata
  -> unknown/legacy theme: dark thumbnail
```

### Recommended Project Structure

```text
src/
├── lib/
│   └── microsite-themes.ts        # shared theme IDs, classes, metadata, fallback helpers
├── app/
│   ├── actions/microsite.ts       # normalize theme in create/update actions
│   └── dashboard/microsites/
│       ├── new/page.tsx           # registry-powered create picker
│       ├── page.tsx               # registry-powered thumbnails
│       └── [id]/microsite-editor.tsx # registry-powered edit picker and fallback state
└── components/
    └── microsite-page-client.tsx  # registry-powered public rendering
```

### Pattern 1: Registry as Policy Boundary

**What:** One module exports allowed IDs, default ID, theme metadata, public classes, preview classes, thumbnail classes, and helper functions. [VERIFIED: CONTEXT.md]

**When to use:** Any place needs theme label, preview, validation, fallback, thumbnail, or public rendering. [VERIFIED: CONTEXT.md + codebase read]

**Example:**
```typescript
// Source: derived from CONTEXT.md locked decisions and current code seams [VERIFIED: CONTEXT.md + codebase read]
export const DEFAULT_MICROSITE_THEME_ID = "dark";

export const MICROSITE_THEMES = [
    {
        id: "dark",
        label: "Dark",
        tagline: "Gelap elegan",
        preview: {
            page: "bg-gradient-to-b from-zinc-900 to-zinc-950",
            avatar: "bg-zinc-400",
            card: "bg-zinc-800",
        },
        public: {
            page: "bg-zinc-950",
            hero: "from-zinc-900/0 via-zinc-950/60 to-zinc-950",
            title: "text-white",
            description: "text-zinc-400",
            avatar: "border-zinc-800 ring-2 ring-zinc-700",
            card: "bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 hover:border-zinc-600 hover:shadow-lg hover:shadow-black/30",
            cardTitle: "text-white",
            icon: "text-zinc-600 group-hover:text-zinc-300",
            empty: "text-zinc-600",
            footer: "text-zinc-800",
            footerBrand: "text-zinc-600",
            divider: "bg-zinc-800",
            share: "text-zinc-500 hover:text-white",
            shareLabel: "text-zinc-600",
        },
    },
] as const;

export type MicrositeThemeId = (typeof MICROSITE_THEMES)[number]["id"];

export function isMicrositeThemeId(value: string): value is MicrositeThemeId {
    return MICROSITE_THEMES.some((theme) => theme.id === value);
}

export function normalizeMicrositeTheme(value: FormDataEntryValue | null | undefined): MicrositeThemeId {
    return typeof value === "string" && isMicrositeThemeId(value) ? value : DEFAULT_MICROSITE_THEME_ID;
}

export function getMicrositeTheme(value: string) {
    return MICROSITE_THEMES.find((theme) => theme.id === value) ?? MICROSITE_THEMES[0];
}
```

### Pattern 2: Normalize at Server Action Boundary

**What:** Convert any invalid submitted theme to `dark` before Prisma write. [VERIFIED: CONTEXT.md]

**When to use:** `createMicrosite` and `updateMicrosite`. [VERIFIED: codebase read]

**Example:**
```typescript
// Source: src/app/actions/microsite.ts seam + CONTEXT.md fallback decision [VERIFIED: codebase read]
import { normalizeMicrositeTheme } from "@/lib/microsite-themes";

const theme = normalizeMicrositeTheme(formData.get("theme") ?? microsite.theme);
```

### Pattern 3: Silent Client Fallback

**What:** Initialize selected theme from `normalizeMicrositeTheme(microsite.theme)` so unknown DB values do not show broken selection. [VERIFIED: CONTEXT.md + codebase read]

**When to use:** Edit page initial `useState`. [VERIFIED: codebase read]

**Example:**
```typescript
// Source: src/app/dashboard/microsites/[id]/microsite-editor.tsx current state pattern [VERIFIED: codebase read]
const [selectedTheme, setSelectedTheme] = useState(() => normalizeMicrositeTheme(microsite.theme));
```

### Anti-Patterns to Avoid

- **Separate local theme arrays:** Causes create/edit/public/list drift; replace all local theme maps with registry imports. [VERIFIED: codebase read]
- **Reject invalid theme with user-facing error:** Locked decision says normalize invalid submitted theme to `dark`. [VERIFIED: CONTEXT.md]
- **Change existing `dark`, `light`, `gradient` public classes:** Locked decision says keep current visuals unchanged. [VERIFIED: CONTEXT.md + codebase read]
- **Dynamic Tailwind class concatenation:** Tailwind can miss generated classes; keep literal classes in registry. [VERIFIED: CONTEXT.md]
- **Schema enum migration:** Not needed and increases Prisma drift risk. [VERIFIED: CONTEXT.md + AGENTS.md]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Theme allowlist | Ad hoc string checks in each component | `isMicrositeThemeId` + registry | One policy prevents drift. [VERIFIED: CONTEXT.md] |
| Theme fallback | `themeStyles[theme] ?? themeStyles.dark` copied everywhere | `getMicrositeTheme(raw)` | Single fallback preserves legacy invalid DB handling. [VERIFIED: codebase read] |
| Preview metadata | Separate swatch object | Registry `preview` metadata | Mini previews must use same classes as public renderer. [VERIFIED: CONTEXT.md] |
| Thumbnail visuals | `if (theme === ...)` in list page | Registry `thumbnail` metadata | New themes otherwise default to dark thumbnail. [VERIFIED: codebase read] |
| Theme persistence | Client-only state | Existing server actions + Prisma `Microsite.theme` | Persistence already exists; only normalize. [VERIFIED: codebase read] |

**Key insight:** This phase complexity is not theme design; risk is divergence across four existing theme consumers. [VERIFIED: codebase read]

## Common Pitfalls

### Pitfall 1: Existing theme visuals accidentally change
**What goes wrong:** `dark`, `light`, or `gradient` public pages look different after registry migration. [VERIFIED: CONTEXT.md]  
**Why it happens:** Developer rewrites classes instead of copying current `themeStyles` exactly. [VERIFIED: codebase read]  
**How to avoid:** Copy existing `themeStyles.dark/light/gradient.public` class strings byte-for-byte into registry before adding new themes. [VERIFIED: codebase read]  
**Warning signs:** Visual diff for existing microsites; altered `bg-zinc-950`, `bg-gray-50`, or `bg-gradient-to-b from-white to-[#8EC5E8]` public page classes. [VERIFIED: codebase read]

### Pitfall 2: New theme exists in editor but not public renderer
**What goes wrong:** User chooses `sunset`; public page falls back to dark. [VERIFIED: codebase read]  
**Why it happens:** Create/edit `THEMES` updated but public `themeStyles` not updated. [VERIFIED: codebase read]  
**How to avoid:** Remove local arrays; import registry everywhere. [VERIFIED: CONTEXT.md]  
**Warning signs:** Local `const THEMES` or `const themeStyles` remains after phase. [VERIFIED: codebase read]

### Pitfall 3: Invalid theme breaks selected card or public render
**What goes wrong:** Legacy DB value produces no selected state or missing classes. [VERIFIED: CONTEXT.md]  
**Why it happens:** UI uses raw `microsite.theme` instead of normalized default. [VERIFIED: codebase read]  
**How to avoid:** Use `normalizeMicrositeTheme` for editor state and `getMicrositeTheme` for render. [VERIFIED: CONTEXT.md]  
**Warning signs:** `useState(microsite.theme || "dark")` remains. [VERIFIED: codebase read]

### Pitfall 4: Toggle publish wipes images/description
**What goes wrong:** `handleTogglePublished` submits only title and isPublished; `updateMicrosite` converts missing description/cover/avatar to `null`. [VERIFIED: codebase read]  
**Why it happens:** `updateMicrosite` treats omitted fields as empty values, not unchanged fields. [VERIFIED: codebase read]  
**How to avoid:** In plan, either preserve current values when fields absent or create dedicated publish toggle action. [VERIFIED: codebase read]  
**Warning signs:** `const description = (formData.get("description") as string)?.trim() || null;` remains with publish toggle using partial FormData. [VERIFIED: codebase read]

### Pitfall 5: Low contrast new themes
**What goes wrong:** Public title/link text unreadable on mobile/public page. [VERIFIED: CONTEXT.md]  
**Why it happens:** Pretty palette chosen without checking text/card/background contrast. [ASSUMED]  
**How to avoid:** Use conservative palettes: dark/cool/warm/nature/mono; manually test title, description, link card, empty state, footer. [VERIFIED: CONTEXT.md]  
**Warning signs:** White text on light gradient, muted gray on saturated background, translucent cards over busy cover. [ASSUMED]

## Code Examples

Verified patterns from project sources:

### Public Renderer Registry Lookup
```typescript
// Source: src/components/microsite-page-client.tsx current fallback seam [VERIFIED: codebase read]
import { getMicrositeTheme } from "@/lib/microsite-themes";

const theme = getMicrositeTheme(microsite.theme);
const styles = theme.public;
```

### Editor Theme Picker Grid
```tsx
// Source: CONTEXT.md D-05..D-09 + existing editor grid [VERIFIED: CONTEXT.md + codebase read]
<div className="grid grid-cols-3 gap-3">
    {MICROSITE_THEMES.map((theme) => (
        <button
            key={theme.id}
            type="button"
            onClick={() => setSelectedTheme(theme.id)}
            className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                selectedTheme === theme.id
                    ? "border-blue-500 shadow-lg shadow-blue-500/20"
                    : "border-zinc-700 hover:border-zinc-500"
            }`}
        >
            <div className={`h-20 w-full ${theme.preview.page} flex flex-col items-center justify-center gap-1.5 p-2`}>
                <div className={`w-6 h-6 rounded-full ${theme.preview.avatar} opacity-80`} />
                <div className={`h-2 w-12 rounded-full ${theme.preview.card} opacity-70`} />
                <div className={`h-2 w-10 rounded-full ${theme.preview.card} opacity-50`} />
            </div>
            <div className="py-1.5 text-center text-xs font-medium text-zinc-400">
                <span>{theme.label}</span>
                {selectedTheme === theme.id ? <span aria-hidden="true"> ✓</span> : null}
                <p className="text-[10px] text-zinc-500">{theme.tagline}</p>
            </div>
        </button>
    ))}
</div>
```

### Server Action Normalization
```typescript
// Source: src/app/actions/microsite.ts current create/update seams [VERIFIED: codebase read]
const theme = normalizeMicrositeTheme(formData.get("theme"));

const updated = await prisma.microsite.update({
    where: { id },
    data: { title, description, theme, isPublished, coverImage, avatarImage },
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate component-local theme maps | Shared typed registry with helpers | This phase | Prevents dashboard/public drift. [VERIFIED: CONTEXT.md] |
| DB enum for presets | String column plus allowlist/fallback | Locked decision for Phase 01 | Avoids migration and preserves legacy invalid fallback. [VERIFIED: CONTEXT.md] |
| Swatch-only picker | Mini public-page preview card | Locked decision for Phase 01 | Better recognition before save. [VERIFIED: CONTEXT.md] |

**Deprecated/outdated:**
- Local `THEMES` in editor/create page: replace with registry. [VERIFIED: codebase read]
- Local `themeStyles` in public renderer: replace with registry. [VERIFIED: codebase read]
- `ThemeThumbnail` switch/if logic: replace with registry thumbnail metadata. [VERIFIED: codebase read]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Low-contrast failures likely arise from palette choices like muted gray on saturated backgrounds. | Common Pitfalls | Planner may need stricter contrast checklist if brand palettes differ. |

## Open Questions (RESOLVED)

1. **Should create page preview match edit page mini public preview exactly?**
   - What we know: CONTEXT names dashboard editor; code context also lists create page as integration point. [VERIFIED: CONTEXT.md]
   - What's unclear: Whether create page must use full same mini preview treatment or can use simplified registry card.
    - Recommendation: Use same component/markup for create and edit to satisfy THEME-05 and avoid drift. [VERIFIED: CONTEXT.md]
   - RESOLVED: Yes. Create and edit flows should both use the shared registry-powered mini public preview treatment so THEME-02 and THEME-05 are satisfied without a second picker pattern.

2. **Should publish toggle partial-update bug be fixed in this phase?**
   - What we know: Current toggle omits description/cover/avatar/theme and `updateMicrosite` can null omitted fields. [VERIFIED: codebase read]
   - What's unclear: Whether planner includes this as prerequisite guardrail or separate bug fix.
    - Recommendation: Include small guardrail task because theme save/reload testing touches same action. [VERIFIED: codebase read]
   - RESOLVED: Yes. Include a small guardrail in this phase so `updateMicrosite` preserves omitted optional fields during partial submissions; theme save/reload and publish-toggle flows share this server action boundary.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| npm | package scripts and verification | ✓ | package manager selected by AGENTS.md | — [VERIFIED: AGENTS.md] |
| Node.js | Next.js/TypeScript tooling | not probed | — | Planner can run `node --version` in Wave 0 if needed. [ASSUMED] |
| TypeScript CLI via `npx tsc` | Type checking | package present | ^5 | Use `npx tsc --noEmit`. [VERIFIED: package.json + AGENTS.md] |
| ESLint | Lint verification | package present | ^9 | `npm run lint`. [VERIFIED: package.json + AGENTS.md] |
| PostgreSQL | Full persistence UAT | optional for build; local via Docker port 5436 | — | Build uses mock DB; for save/reload UAT start `docker compose up -d db`. [VERIFIED: AGENTS.md] |

**Missing dependencies with no fallback:** none identified for planning.  
**Missing dependencies with fallback:** live DB optional for build; use Docker Compose DB for manual persistence UAT. [VERIFIED: AGENTS.md]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | yes | Existing NextAuth session guard in server actions; no auth changes. [VERIFIED: codebase read] |
| V3 Session Management | no | Theme registry does not alter sessions. [VERIFIED: phase scope] |
| V4 Access Control | yes | Keep `getEditableMicrosite` ownership check before update. [VERIFIED: codebase read] |
| V5 Input Validation | yes | Allowlist theme IDs via `normalizeMicrositeTheme`; never trust client hidden input. [VERIFIED: CONTEXT.md] |
| V6 Cryptography | no | No crypto changes. [VERIFIED: phase scope] |
| V7 Error Handling | yes | Normalize invalid themes silently; do not expose validation failure for legacy values. [VERIFIED: CONTEXT.md] |

### Known Threat Patterns for Next.js theme selection

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Hidden input tampering sets arbitrary theme string | Tampering | Server action allowlist normalization to `dark`. [VERIFIED: CONTEXT.md + codebase read] |
| Cross-user update attempt | Elevation of privilege | Keep `getEditableMicrosite` before Prisma update. [VERIFIED: codebase read] |
| CSS injection through theme value | Tampering | Do not concatenate untrusted theme into class names; map IDs to literal classes. [VERIFIED: CONTEXT.md] |
| Legacy invalid DB value breaks public render | Denial of service | `getMicrositeTheme` fallback to default dark. [VERIFIED: CONTEXT.md] |

## Sources

### Primary (HIGH confidence)
- `.planning/phases/01-microsite-theme-variants/01-CONTEXT.md` — locked decisions, phase boundary, integration points. [VERIFIED: file read]
- `.planning/REQUIREMENTS.md` — THEME-01..THEME-05 requirement text. [VERIFIED: file read]
- `.planning/STATE.md` — current phase/status and existing research/codebase maps. [VERIFIED: file read]
- `AGENTS.md` — project constraints and commands. [VERIFIED: file read]
- `package.json` — package versions and scripts. [VERIFIED: file read]
- `src/app/dashboard/microsites/[id]/microsite-editor.tsx` — current editor theme picker and save flow. [VERIFIED: file read]
- `src/app/dashboard/microsites/new/page.tsx` — current create-page local theme array. [VERIFIED: file read]
- `src/app/dashboard/microsites/page.tsx` — current thumbnail switch logic. [VERIFIED: file read]
- `src/components/microsite-page-client.tsx` — current public theme styles and fallback. [VERIFIED: file read]
- `src/app/actions/microsite.ts` — current create/update theme persistence and access checks. [VERIFIED: file read]

### Secondary (MEDIUM confidence)
- `.planning/research/SUMMARY.md` — prior stack/architecture/pitfall synthesis. [VERIFIED: file read]
- `.planning/codebase/ARCHITECTURE.md` — app layers and data flow. [VERIFIED: file read]
- `.planning/codebase/STRUCTURE.md` — key file locations. [VERIFIED: file read]
- `.planning/codebase/CONVENTIONS.md` — naming/import/error handling conventions. [VERIFIED: file read]

### Tertiary (LOW confidence)
- Project skills `nextjs-app-router-patterns`, `tailwind-patterns`, `zod-validation-expert`, `frontend-dev-guidelines` were read for relevant patterns; community skill source, use as advisory only. [VERIFIED: file read]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions and scripts verified from `package.json` and AGENTS.md.
- Architecture: HIGH — exact phase files and current consumers read.
- Pitfalls: HIGH — drift and fallback risks visible in current source; one contrast-specific visual warning marked assumed.

**Research date:** 2026-06-26  
**Valid until:** 2026-07-26 for this stable brownfield phase.
