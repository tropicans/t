# Roadmap: Taut Microsite Enhancements

## Milestones

- ✅ **v1.0 Theme & Ordering MVP** — Phases 1-3 (shipped 2026-06-27)
- ✅ **v1.1 Perbaikan dan Optimasi** — Phases 4-6 (shipped 2026-08-04)
- ✅ **v1.2 Edit Link Microsite** — Phase 7 (shipped 2026-08-04)
- 🟡 **v1.3 Claude Design System Integration** — Phases 8-10 (in progress)

## Phases

<details>
<summary>✅ Shipped Milestones (Phases 1-7)</summary>

### Phase 1: Microsite Theme Variants
- [x] Preset themes registry & Selection UI (2 plans) — completed 2026-06-27

### Phase 2: Drag and Drop Link Ordering
- [x] Link drag & drop reordering & persistence (1 plan) — completed 2026-06-27

### Phase 3: Accessibility and Verification Hardening
- [x] Chevron-based reordering, ARIA announcements & mobile layouts (1 plan) — completed 2026-06-27

### Phase 4: Bug Fixes & Schema Integrity
- [x] prisma/schema.prisma migration for avatarImage, expiresAt validations & published status checks (1 plan) — completed 2026-08-04

### Phase 5: Routing & Security Hardening
- [x] src/middleware.ts native protection, route collision validators & URL scheme parsing (1 plan) — completed 2026-08-04

### Phase 6: Performance Optimization & Testing
- [x] clicks database indexes, query parallelization & Vitest integration (1 plan) — completed 2026-08-04

### Phase 7: Edit Microsite Slug
- [x] Implementasi field input slug di dashboard editor UI, pembaruan server action updateMicrosite, dan penulisan unit tests (1 plan) — completed 2026-08-04

</details>

### Phase 8: Design System Tooling & Token Foundation
- [x] Setup tooling awesome-design-md, DESIGN.md, tokens globals.css & Newsreader font (1 plan) — completed 2026-09-07
**Goal:** Setup tooling `awesome-design-md` / `getdesign`, validasi `DESIGN.md`, hubungkan ke `AGENTS.md`, dan konfigurasi CSS custom properties / Tailwind CSS v4 design tokens untuk palet Claude (terracotta, cream canvas, dark surfaces).
**Requirements:** TOOL-01, TOOL-02, TOKEN-01, TOKEN-02
**Success Criteria:**
1. `DESIGN.md` aktif di root project dan terdokumentasi dalam panduan agent `AGENTS.md`.
2. `src/app/globals.css` memuat CSS variables dan token Tailwind untuk warna Claude (`#cc785c`, `#a9583e`, `#faf9f5`, `#141413`, `#181715`, `#efe9de`).
3. Typography rules dan border radius tokens didefinisikan dengan fallback font editorial.

### Phase 9: Dashboard & UI Component Editorial Refresh
- [x] UI primitives & dashboard layout editorial refresh (2 plans) — completed 2026-09-07
**Goal:** Terapkan gaya editorial warm terracotta pada tata letak dashboard, navigasi, cards, buttons, badge status, dan form input.
**Requirements:** UI-01, UI-02
**Success Criteria:**
1. Header dan sidebar/navigasi dashboard menggunakan warm terracotta accents dan styling editorial.
2. Komponen kartu (cards), tombol utama/sekunder, dan field input mengadopsi styling Claude design system secara harmonis.
3. Seluruh alur user di dashboard tetap responsif dan fungsional.

### Phase 10: Microsite Theme Preset & System Verification
- [ ] Preset tema claude & system verification suite (1 plan)
**Goal:** Tambahkan preset tema `claude` pada microsite theme registry dan lakukan verifikasi menyeluruh melalui automated test suite serta TypeScript compiler.
**Requirements:** THEME-01, TEST-01
**Success Criteria:**
1. Pengguna dapat memilih preset tema `claude` di microsite editor.
2. Halaman publik microsite menampilkan visual warm terracotta & cream editorial saat tema `claude` aktif.
3. Seluruh unit test Vitest (18/18) dan `npx tsc --noEmit` lolos tanpa regresi.

---
*Roadmap updated: 2026-09-07*
