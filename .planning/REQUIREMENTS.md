# Requirements: Taut Microsite Enhancements

**Defined:** 2026-09-07
**Core Value:** Microsite owners can create a more personalized public page, control link priority, and experience fast, secure dashboard routing and analytics performance.

## v1.3 Requirements

Requirements for Milestone v1.3: Claude Design System Integration.

### Tooling & Design Specification

- [x] **TOOL-01**: Developer/Agents have access to `awesome-design-md` / `getdesign` CLI and active Claude `DESIGN.md` in repository root.
- [x] **TOOL-02**: Project agent guidelines (`AGENTS.md`) reference `DESIGN.md` as the visual design system contract.

### Design Tokens & Foundation

- [x] **TOKEN-01**: Configure CSS custom properties and Tailwind CSS v4 variables in `src/app/globals.css` with Claude design system tokens (terracotta `#cc785c`, ink `#141413`, canvas `#faf9f5`, cards, and dark surfaces).
- [x] **TOKEN-02**: Define typography rules, font fallback hierarchy, and border radius variables matching Claude editorial specifications.

### UI & Dashboard Refresh

- [x] **UI-01**: Refresh dashboard layout, navigation bar, and page headers with Claude warm editorial aesthetics.
- [x] **UI-02**: Update core interactive components (buttons, cards, inputs, and badges) to reflect Claude design tokens.

### Microsite Theme & Verification

- [x] **THEME-01**: Add `claude` preset theme to `src/lib/microsite-themes.ts` with warm terracotta and cream editorial styling.
- [x] **TEST-01**: Verify that all automated Vitest unit tests pass and `npx tsc --noEmit` compiles cleanly.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Third-party external font licensing (e.g. proprietary Copernicus font) | Use high-quality web-safe serif/sans fallbacks (e.g. Georgia/serif, Inter/system-ui) |
| Complete rewrite of public short-link redirect logic | Routing resolution stays short link first, microsite second |
| Multi-tenant theme builder | Focus on standardized Claude design system and theme preset |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TOOL-01 | Phase 8 | Complete |
| TOOL-02 | Phase 8 | Complete |
| TOKEN-01 | Phase 8 | Complete |
| TOKEN-02 | Phase 8 | Complete |
| UI-01 | Phase 9 | Complete |
| UI-02 | Phase 9 | Complete |
| THEME-01 | Phase 10 | Complete |
| TEST-01 | Phase 10 | Complete |

**Coverage:**
- v1.3 requirements: 8 total
- Mapped to phases: 8
- Unmapped: 0 ✓

---
*Requirements defined: 2026-09-07*
*Last updated: 2026-09-07 after milestone v1.3 initialization*
