# Roadmap: Taut Microsite Enhancements

## Milestones

- ✅ **v1.0 Theme & Ordering MVP** — Phases 1-3 (shipped 2026-06-27)
- ✅ **v1.1 Perbaikan dan Optimasi** — Phases 4-6 (shipped 2026-08-04)
- ✅ **v1.2 Edit Link Microsite** — Phase 7 (shipped 2026-08-04)
- ✅ **v1.3 Claude Design System Integration** — Phases 8-10 (shipped 2026-09-07)
- 🚧 **v1.4 Dashboard UX & Mobile Navigation Polish** — Phases 11-12 (in progress)

## Phases

<details>
<summary>✅ Shipped Milestones (Phases 1-10)</summary>

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

### Phase 8: Design System Tooling & Token Foundation
- [x] Setup tooling awesome-design-md, DESIGN.md, tokens globals.css & Newsreader font (1 plan) — completed 2026-09-07

### Phase 9: Dashboard & UI Component Editorial Refresh
- [x] UI primitives & dashboard layout editorial refresh (2 plans) — completed 2026-09-07

### Phase 10: Microsite Theme Preset & System Verification
- [x] Preset tema claude & system verification suite (1 plan) — completed 2026-09-07

</details>

### 🚧 v1.4 Dashboard UX & Mobile Navigation Polish

### Phase 11: Mobile Navigation Drawer & Metric Card Micro-interactions
- [ ] Mobile navigation drawer & stat cards visual polish (1 plan)
**Goal:** Tambahkan slide-out navigation drawer di tampilan mobile (`md:hidden`) dengan toggle hamburger menu, active indicators, dan user profile, serta tingkatkan interaktivitas hover dan kontras link WCAG AA pada kartu metrik dashboard.
**Requirements:** NAV-01, NAV-02, CARD-01, CARD-02
**Success Criteria:**
1. Pengguna mobile dapat membuka dan menutup drawer navigasi dashboard dengan transisi mulus dan dismiss via backdrop/ESC.
2. Drawer mobile menampilkan navigasi lengkap, active indicator, profil user, dan tombol Sign Out.
3. Kartu metrik di `/dashboard` memiliki micro-interaction hover lift yang halus dan icon yang harmonis.
4. Tautan aksi pada kartu metrik menggunakan kontras warna terracotta yang memenuhi standar WCAG AA (≥ 4.5:1).

### Phase 12: Dashboard Recent Activity, Onboarding & System Verification
- [ ] Recent activity feeds, editorial onboarding state & system test verification (1 plan)
**Goal:** Tampilkan feed aktivitas terkini (microsites & short links) pada overview dashboard, sediakan panduan onboarding editorial untuk akun baru tanpa tautan, dan pastikan seluruh test suite Vitest serta TypeScript lolos tanpa regresi.
**Requirements:** ACT-01, ONBOARD-01, TEST-01
**Success Criteria:**
1. Dashboard overview menampilkan daftar aktivitas terbaru (microsite dan short link terbaru) dengan akses cepat kelola/buka tautan.
2. Akun tanpa tautan/microsite melihat kartu onboarding editorial yang memandu pembuatan pertama.
3. Seluruh unit test Vitest dan `npx tsc --noEmit` lolos 100% tanpa error.

---
*Roadmap updated: 2026-09-07*
