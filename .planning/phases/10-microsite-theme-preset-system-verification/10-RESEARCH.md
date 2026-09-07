# Phase 10: Microsite Theme Preset & System Verification - Research

**Researched:** 2026-09-07
**Domain:** Microsite Themes Registry, Editorial UI/UX Styling, Automated Testing with Vitest & TypeScript
**Confidence:** HIGH

<user_constraints>
## User Constraints (from REQUIREMENTS.md & DESIGN.md)

Planning proceeded without prior discuss-phase ("Continue without context"). Requirements and constraints are derived from `REQUIREMENTS.md`, `DESIGN.md`, and `ROADMAP.md`.

### Locked Requirements
- **THEME-01**: Add `claude` preset theme to `src/lib/microsite-themes.ts` with warm terracotta and cream editorial styling.
- **TEST-01**: Verify that all automated Vitest unit tests pass and `npx tsc --noEmit` compiles cleanly.

### Success Criteria (from ROADMAP.md)
1. Pengguna dapat memilih preset tema `claude` di microsite editor.
2. Halaman publik microsite menampilkan visual warm terracotta & cream editorial saat tema `claude` aktif.
3. Seluruh unit test Vitest (18/18) dan `npx tsc --noEmit` lolos tanpa regresi.

### Design System Contract (from DESIGN.md & globals.css)
- **Primary Accent**: Warm Terracotta (`#cc785c`, hover/active `#a9583e`).
- **Canvas / Surfaces**: Tinted Cream Canvas (`#faf9f5`), elevated card surfaces (`#efe9de`, hover `#e8e0d2`), soft surface (`#f5f0e8`).
- **Text & Ink**: Dark warm ink (`#141413`), body running text (`#3d3d3a`), muted labels (`#6c6a64`, `#8e8b82`).
- **Borders & Dividers**: Hairline soft border (`#e6dfd8`).
- **Typography**: Display & headlines with humanist serif (`font-serif` Newsreader), body text with clean sans (`font-sans` Inter).
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Layer / File | Role & Capability | Rationale |
|---|---|---|
| `src/lib/microsite-themes.ts` | Central Theme Registry | Defines `MICROSITE_THEMES` as const, `MicrositeThemeId`, `isMicrositeThemeId`, `normalizeMicrositeTheme`, and `getMicrositeTheme` |
| `src/components/microsite-page-client.tsx` | Public Microsite Client Renderer | Consumes `getMicrositeTheme(theme).public` to style page background, typography, link cards, avatar, share bar, and footer |
| `src/app/dashboard/microsites/[id]/microsite-editor.tsx` | Dashboard Microsite Editor | Maps `MICROSITE_THEMES` for theme selector, displaying miniature preview, label, and tagline; persists selected theme |
| `src/app/dashboard/microsites/new/page.tsx` | New Microsite Page | Displays theme selection grid when creating a new microsite |
| `src/app/dashboard/microsites/page.tsx` | Dashboard Microsite List | Uses `ThemeThumbnail` with `getMicrositeTheme(theme).thumbnail` |
| `src/lib/microsite-themes.test.ts` | Theme Registry Unit Tests | Verifies `claude` theme registration, ID validation, fallback normalization, and complete theme token structure |
| Existing Vitest Suite | Regression Safety | 18 existing tests across short-link and microsite actions |
</architectural_responsibility_map>

<research_summary>
## Summary

Investigation of the current codebase shows:
1. `src/lib/microsite-themes.ts` defines 7 themes (`dark`, `light`, `gradient`, `midnight`, `sunset`, `forest`, `mono`).
2. Theme objects are strictly typed via `as const`. Each theme specifies:
   - `id`: Unique theme identifier string
   - `label`: Human-readable name
   - `tagline`: Short descriptive tagline
   - `preview`: `{ bg, dot, card }` classes for mini preview cards
   - `public`: Detailed Tailwind classes for public page rendering (`page`, `hero`, `title`, `description`, `avatar`, `card`, `cardTitle`, `icon`, `empty`, `footer`, `footerBrand`, `divider`, `share`, `shareLabel`)
   - `thumbnail`: `{ container, avatar }` classes for dashboard cards
3. Public page rendering in `src/components/microsite-page-client.tsx` dynamically retrieves styles via `getMicrositeTheme(microsite.theme).public`. By including `font-serif` in `title`, the Claude theme will automatically use the editorial serif typography loaded in `RootLayout`.
4. The dashboard editor (`microsite-editor.tsx`) and new microsite page (`new/page.tsx`) automatically map `MICROSITE_THEMES`, making the new theme immediately selectable once registered.
5. In `microsite-editor.tsx` and `new/page.tsx`, theme card active state currently uses legacy `border-blue-500` and `text-blue-400`. Updating these to use `border-primary shadow-primary/20` and `text-primary` ensures full alignment with the Claude design system.
6. The test suite currently contains 18 tests (6 redirect, 6 microsite, 6 short link). Adding a dedicated test file `src/lib/microsite-themes.test.ts` will explicitly test the theme registry while ensuring all 18 existing tests pass without regressions.
</research_summary>

<component_audit>
## Detailed Token & Component Audit

### 1. `src/lib/microsite-themes.ts` - Proposed `claude` Preset
```typescript
{
  id: "claude",
  label: "Claude",
  tagline: "Editorial hangat terracotta & cream",
  preview: {
    bg: "bg-gradient-to-b from-[#faf9f5] to-[#efe9de]",
    dot: "bg-[#cc785c]",
    card: "bg-[#efe9de] border border-[#e6dfd8]",
  },
  public: {
    page: "bg-[#faf9f5]",
    hero: "from-[#faf9f5]/0 via-[#faf9f5]/60 to-[#faf9f5]",
    title: "text-[#141413] font-serif",
    description: "text-[#3d3d3a]",
    avatar: "border-[#faf9f5] ring-2 ring-[#cc785c]/40",
    card: "bg-[#efe9de] border border-[#e6dfd8] text-[#141413] hover:bg-[#e8e0d2] hover:border-[#cc785c]/40 hover:shadow-lg hover:shadow-[#cc785c]/10",
    cardTitle: "text-[#141413]",
    icon: "text-[#cc785c] group-hover:text-[#a9583e]",
    empty: "text-[#6c6a64]",
    footer: "text-[#8e8b82]",
    footerBrand: "text-[#cc785c]",
    divider: "bg-[#e6dfd8]",
    share: "text-[#6c6a64] hover:text-[#cc785c]",
    shareLabel: "text-[#8e8b82]",
  },
  thumbnail: {
    container: "bg-[#f5f0e8] flex items-center justify-center overflow-hidden group-hover:bg-[#efe9de] transition-all",
    avatar: "bg-[#efe9de] rounded-2xl w-14 h-14 flex items-center justify-center text-[#cc785c] text-2xl font-bold shadow-md group-hover:scale-110 transition-transform border border-[#e6dfd8]",
  },
}
```

### 2. Dashboard Theme Selectors (`microsite-editor.tsx` & `new/page.tsx`)
- Active theme indicator refinement: Replace `border-blue-500 shadow-blue-500/20` and `text-blue-400` with `border-primary shadow-primary/20` and `text-primary`.

### 3. Verification Suite
- Create `src/lib/microsite-themes.test.ts`:
  - Validates `isMicrositeThemeId("claude")` returns `true`.
  - Validates `normalizeMicrositeTheme("claude")` returns `"claude"`.
  - Validates `normalizeMicrositeTheme("invalid-theme")` returns `DEFAULT_MICROSITE_THEME_ID` ("dark").
  - Validates `getMicrositeTheme("claude")` returns the complete Claude theme specification with all required keys and correct colors.
  - Validates every theme in `MICROSITE_THEMES` has required properties (`id`, `label`, `tagline`, `preview`, `public`, `thumbnail`).
</component_audit>

<validation_architecture>
## Validation Architecture

1. **Unit Test Execution (Vitest)**:
   - Run `npx vitest run`.
   - Ensure all previous 18 tests pass plus new tests in `src/lib/microsite-themes.test.ts`.
2. **Type Checking (TypeScript)**:
   - Run `npx tsc --noEmit`.
   - Ensure zero TypeScript compiler errors or type mismatches.
3. **Build Verification**:
   - Run `npm run build` to ensure Next.js standalone build compiles cleanly.
4. **Theme Visual & Functional Verification**:
   - Verify `claude` preset is visible in the theme list of microsite editor and creation pages.
   - Verify that saving `claude` theme preserves `"claude"` in the database and updates UI previews.
</validation_architecture>
