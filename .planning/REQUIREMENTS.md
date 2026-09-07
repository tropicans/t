# Requirements: Taut Microsite Enhancements
 
**Defined:** 2026-09-07
**Core Value:** Microsite owners can create a more personalized public page, control link priority, and experience fast, secure dashboard routing and analytics performance.

## v1.4 Requirements

Requirements for Milestone v1.4: Dashboard UX & Mobile Navigation Polish.

### Mobile Navigation & Header

- [ ] **NAV-01**: User on mobile screens (`< 768px`) can tap a hamburger menu button in the mobile header to toggle a responsive slide-out navigation drawer with all dashboard links, active route highlight, user profile details, and sign-out button.
- [ ] **NAV-02**: Navigation drawer supports smooth open/close transitions, backdrop dismissal, and keyboard accessibility (ESC key).

### Metric Cards & Visual Polish

- [ ] **CARD-01**: Dashboard metric stat cards feature subtle hover lift (`-translate-y-0.5`), smooth shadow transition, and cohesive icon accent styling.
- [ ] **CARD-02**: Small action links on metric cards adopt WCAG AA contrast compliant terracotta color (`#b25e43` / `#a04e35` on light surfaces) ensuring ≥ 4.5:1 contrast.

### Dashboard Overview Content & Onboarding

- [ ] **ACT-01**: Dashboard overview displays a Recent Activity section with recently updated microsites and short links with direct manage actions.
- [ ] **ONBOARD-01**: New users with zero items see an editorial warm onboarding guidance card with quick creation triggers.

### System Verification

- [ ] **TEST-01**: All automated Vitest unit tests pass and `npx tsc --noEmit` compiles cleanly without regression.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-tenant team roles / workspaces | Out of scope for link-in-bio personal dashboard |
| Real-time WebSocket notifications | Existing polling / standard server actions suffice |
| Full CMS WYSIWYG editor | Existing form cards and markdown/text fields suffice |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| NAV-01 | Phase 11 | Pending |
| NAV-02 | Phase 11 | Pending |
| CARD-01 | Phase 11 | Pending |
| CARD-02 | Phase 11 | Pending |
| ACT-01 | Phase 12 | Pending |
| ONBOARD-01 | Phase 12 | Pending |
| TEST-01 | Phase 12 | Pending |

**Coverage:**
- v1.4 requirements: 7 total
- Mapped to phases: 7
- Unmapped: 0 ✓

---
*Requirements defined: 2026-09-07*
