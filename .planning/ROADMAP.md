# Roadmap: Taut Microsite Enhancements

## Milestones

- ✅ **v1.0 Theme & Ordering MVP** — Phases 1-3 (shipped 2026-06-27)
- ✅ **v1.1 Perbaikan dan Optimasi** — Phases 4-6 (shipped 2026-08-04)
- ✅ **v1.2 Edit Link Microsite** — Phase 7 (shipped 2026-08-04)
- ✅ **v1.3 Claude Design System Integration** — Phases 8-10 (shipped 2026-09-07)
- ✅ **v1.4 Dashboard UX & Mobile Navigation Polish** — Phases 11-12 (shipped 2026-09-07)
- 🚧 **v1.5 Invitation Link & Dynamic User Onboarding** — Phases 13-15 (in progress)

## Phases

<details>
<summary>✅ Shipped Milestones (Phases 1-12)</summary>

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

### Phase 11: Mobile Navigation Drawer & Metric Card Micro-interactions
- [x] Mobile navigation drawer & stat cards visual polish (1 plan) — completed 2026-09-07

### Phase 12: Dashboard Recent Activity, Onboarding & System Verification
- [x] Recent activity overview feeds & editorial onboarding card (1 plan) — completed 2026-09-07

</details>

---

### 🚧 v1.5 Invitation Link & Dynamic User Onboarding

### Phase 13: Invitation Data Model, Migration & Validation Engine
- [x] Prisma schema model `Invitation`, migration deployment, and backend validation engine (1 plan) — completed 2026-09-07
**Goal:** Sediakan skema database untuk model `Invitation` dengan dukungan token unik, target email opsional, kuota pemakaian (`maxUses`), waktu kedaluwarsa (`expiresAt`), dan status. Lindungi rute `/invite` dari tabrakan slug di `RESERVED_SLUGS`.
**Requirements:** INV-01, INV-02, TEST-01
**Success Criteria:**
1. Model `Invitation` didefinisikan dalam `schema.prisma` dan migrasi database berhasil dijalankan.
2. Helper dan validator undangan dapat memverifikasi keabsahan token (expired, status, kuota terpakai, kecocokan email).
3. `RESERVED_SLUGS` memuat `invite` untuk mencegah tabrakan rute publik.
4. Unit test suite memverifikasi logika validasi undangan.

### Phase 14: Public Invitation Landing Page & NextAuth Integration
- [ ] Halaman penerimaan undangan `/invite/[token]` dan NextAuth `signIn` callback bridge
**Goal:** Bangun halaman landing editorial Claude di `/invite/[token]` untuk validasi dan klaim undangan, serta hubungkan dengan callback `signIn` NextAuth agar pemegang undangan valid dapat membuat akun via Google OAuth dan masuk ke dashboard.
**Requirements:** INV-03, AUTH-01, AUTH-02
**Success Criteria:**
1. Halaman `/invite/[token]` menampilkan status undangan, nama pengundang, sisa kuota/kedaluwarsa, dan tombol "Masuk dengan Google".
2. NextAuth `signIn` mengizinkan login jika email ada di `ALLOWED_EMAILS` ATAU user sudah terdaftar di database ATAU memiliki token undangan valid.
3. Saat login pertama via undangan berhasil, user baru disimpan permanen di database `User`, kuota undangan bertambah, dan user langsung diarahkan ke `/dashboard`.
4. Login selanjutnya bagi pengguna yang sudah terdaftar tidak memerlukan token undangan lagi.

### Phase 15: Dashboard Invitation Management & System Verification
- [ ] Antarmuka manajemen undangan di Dashboard dan verifikasi sistem end-to-end
**Goal:** Buat UI di dashboard untuk mengelola undangan: formulir pembuatan link (open/email, kuota, masa aktif), daftar link aktif/kedaluwarsa, tombol salin link, dan tombol cabut (*revoke*), serta verifikasi build dan test suite menyeluruh.
**Requirements:** ADMIN-01, TEST-01
**Success Criteria:**
1. Pengguna terotentikasi di dashboard dapat membuat link undangan baru dengan parameter kuota dan kedaluwarsa.
2. Tersedia tabel riwayat undangan dengan status real-time, link salin ke clipboard, dan tombol revoke.
3. Seluruh unit test suite Vitest lulus 100% dan kompilasi TypeScript bersih.
4. Build production Docker container sukses dan dapat diakses di port 4000.
