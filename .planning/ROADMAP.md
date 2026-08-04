# Roadmap: Taut Microsite Enhancements

## Milestones

- ✅ **v1.0 Theme & Ordering MVP** — Phases 1-3 (shipped 2026-06-27)
- ✅ **v1.1 Perbaikan dan Optimasi** — Phases 4-6 (shipped 2026-08-04)
- 🚧 **v1.2 Edit Link Microsite** — Phase 7 (in progress)

## Phases

<details>
<summary>✅ Shipped Milestones (Phases 1-6)</summary>

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

</details>

---

### 🚧 v1.2 Edit Link Microsite (In Progress)

#### Phase 7: Edit Microsite Slug
**Goal:** Memungkinkan pengguna untuk mengedit slug URL microsite mereka secara aman dengan validasi collision dan revalidatePath.
**Requirements:** SLUG-01, SLUG-02, SLUG-03, SLUG-04, SLUG-05
**Depends on:** Phase 6
- [ ] 07-01: Implementasi field input slug di dashboard editor UI, pembaruan server action updateMicrosite, dan penulisan unit tests.

---
*Roadmap updated: 2026-08-04*
