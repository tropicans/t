# Requirements: Taut Microsite Enhancements

**Defined:** 2026-06-26
**Core Value:** Microsite owners can create a more personalized public page and control link priority without fighting manual editing order.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Theme Variants

- [ ] **THEME-01**: User can choose from an expanded set of microsite visual themes in the dashboard editor.
- [ ] **THEME-02**: User can preview or recognize each theme option by name and visual styling before saving.
- [ ] **THEME-03**: User can save a selected theme and see it persist across editor reloads.
- [ ] **THEME-04**: Public microsite renders the saved theme consistently for background, text, buttons, and card/link styling.
- [ ] **THEME-05**: Theme configuration is centralized so dashboard editor and public microsite use the same allowed theme list.

### Link Ordering

- [ ] **ORDER-01**: User can drag and drop microsite links in the dashboard editor to change their order.
- [ ] **ORDER-02**: User can save reordered links and see the new order persist across editor reloads.
- [ ] **ORDER-03**: Public microsite displays active links in the saved order.
- [ ] **ORDER-04**: Reordering preserves each link's label, URL, active state, and click tracking behavior.
- [ ] **ORDER-05**: Reorder persistence is validated server-side so users can only reorder links belonging to their own accessible microsite.

### Accessibility And UX

- [ ] **UX-01**: Link reordering remains usable with keyboard or accessible controls, not pointer-only drag behavior.
- [ ] **UX-02**: Reorder UI provides clear visual feedback while dragging and after save/failure.
- [ ] **UX-03**: Theme and ordering changes do not break responsive public microsite layout on mobile and desktop.

### Verification

- [ ] **VER-01**: `npm run lint` passes after implementation.
- [ ] **VER-02**: `npx tsc --noEmit` passes after TypeScript or Prisma-related implementation.
- [ ] **VER-03**: Manual UAT confirms theme selection and link ordering in dashboard and public microsite.

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Theme Customization

- **THEME-V2-01**: User can create fully custom colors/fonts beyond preset themes.
- **THEME-V2-02**: User can duplicate or import theme presets from templates.
- **THEME-V2-03**: User can schedule seasonal or time-based theme changes.

### Advanced Ordering

- **ORDER-V2-01**: User can group links into sections.
- **ORDER-V2-02**: User can schedule link visibility/order by date.
- **ORDER-V2-03**: User can A/B test link order.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Payment-gated themes | Monetization not requested for this increment. |
| Custom CSS editor | High security/support risk; presets solve current request. |
| New microsite public route model | Existing short-link-first resolution must remain stable. |
| Replacing dashboard design system | Existing shadcn/Tailwind patterns are sufficient. |
| Analytics redesign | Click tracking must keep working, but new analytics UI is separate scope. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| THEME-01 | Phase 1 | Pending |
| THEME-02 | Phase 1 | Pending |
| THEME-03 | Phase 1 | Pending |
| THEME-04 | Phase 1 | Pending |
| THEME-05 | Phase 1 | Pending |
| ORDER-01 | Phase 2 | Pending |
| ORDER-02 | Phase 2 | Pending |
| ORDER-03 | Phase 2 | Pending |
| ORDER-04 | Phase 2 | Pending |
| ORDER-05 | Phase 2 | Pending |
| UX-01 | Phase 3 | Pending |
| UX-02 | Phase 3 | Pending |
| UX-03 | Phase 3 | Pending |
| VER-01 | Phase 3 | Pending |
| VER-02 | Phase 3 | Pending |
| VER-03 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-26*
*Last updated: 2026-06-26 after roadmap creation*
