# Quick Task: Brand Logo Design & Integration (`brand-logo-design`)

## Goal
Design and integrate a distinctive, elegant, and modern brand logo for "Taut" that embodies its warm editorial design language (`DESIGN.md`), replacing default Lucide link icons and starter templates with an iconic vector mark and logotype.

## Tasks
1. **Logo Concept & SVG Assets**:
   - Design an iconic vector mark representing "Taut" (interlocking tension-link / infinity bond) with terracotta (`#cc785c`), warm cream (`#faf9f5`), and dark contrast.
   - Generate standalone SVGs: `public/logo.svg` (full lockup), `public/logo-mark.svg` (mark only), and `src/app/icon.svg` (modern SVG favicon).
2. **Reusable BrandLogo Component**:
   - Create `src/components/brand-logo.tsx` with support for `variant="full" | "mark" | "wordmark"` and sizes `sm` (24px), `md` (32px), `lg` (40px), `xl` (56px).
   - Ensure responsive, accessible SVG rendering with dark/light mode compatibility.
3. **Application Integration**:
   - Update `src/app/dashboard/layout.tsx` (sidebar logo, mobile drawer logo, mobile header logo).
   - Update `src/app/login/page.tsx` (login hero brand badge).
   - Update `src/components/microsite-page-client.tsx` (footer "Powered by Taut" brand badge).
   - Update `src/app/layout.tsx` (metadata favicon reference).
4. **Verification**:
   - Run Vitest test suite (`npx vitest run`) and TypeScript check (`npx tsc --noEmit`).
   - Rebuild Docker container (`docker compose up -d --build app`) and verify live rendering.
