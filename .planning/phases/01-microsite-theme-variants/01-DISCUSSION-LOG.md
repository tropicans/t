# Phase 1: Microsite Theme Variants - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-26T15:29:54.7280004+07:00
**Phase:** 1-Microsite Theme Variants
**Areas discussed:** Preview fidelity, Fallback rules, Visual tone, Theme set

---

## Preview Fidelity

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| How close should dashboard theme cards be to final public microsite? | Mini public preview | Show background, avatar dot, title strip, two link cards using same registry classes. | yes |
| How close should dashboard theme cards be to final public microsite? | Simple swatches | Color tile plus label; less confidence before save. | |
| How close should dashboard theme cards be to final public microsite? | Full live preview | Most accurate but bigger UI change; likely too much for Phase 1. | |
| Should each theme card include short mood/usage text beyond theme name? | Name plus tagline | Helps users recognize choices. | yes |
| Should each theme card include short mood/usage text beyond theme name? | Name only | Less clutter. Visual preview carries meaning. | |
| Should each theme card include short mood/usage text beyond theme name? | Name plus badges | More structured, e.g. Minimal, Bold, Warm. Adds copy decisions. | |
| How many theme cards per row in editor desktop layout? | 3 per row | Matches current editor grid and keeps cards scannable. | yes |
| How many theme cards per row in editor desktop layout? | 2 per row | Bigger previews, more vertical scrolling with 6-8 themes. | |
| How many theme cards per row in editor desktop layout? | Responsive auto grid | 2 on small, 3 on wider editor. | |
| What should make chosen theme obvious? | Border plus checkmark | Current pattern already uses blue border and check mark. | yes |
| What should make chosen theme obvious? | Filled card state | Stronger visual, but may hide theme preview colors. | |
| What should make chosen theme obvious? | Radio control | Accessible familiar control, less visual polish. | |

**User's choices:** Mini public preview; name plus tagline; 3 per row; border plus checkmark.
**Notes:** Preview cards should be close enough to public rendering to build confidence before saving, without adding a full live preview surface.

---

## Fallback Rules

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| When DB contains unknown/legacy theme value, what should public page do? | Render default dark | Safe visual fallback; no public breakage. | yes |
| When DB contains unknown/legacy theme value, what should public page do? | Render light | Gentler public look, but changes current default expectation. | |
| When DB contains unknown/legacy theme value, what should public page do? | Show warning in editor only | Public falls back, editor tells owner to choose valid theme. | |
| When user submits invalid theme in create/update action, what should server do? | Normalize to dark | Bad value saves as default; no user-blocking error. | yes |
| When user submits invalid theme in create/update action, what should server do? | Reject with error | Stricter. Helps catch tampering but may surface errors for stale clients. | |
| When user submits invalid theme in create/update action, what should server do? | Preserve old value | Only for update; avoids overwriting unknown legacy values. | |
| Should editor surface unknown saved theme to owner? | Auto-select dark silently | Keeps UI simple; public also renders dark. | yes |
| Should editor surface unknown saved theme to owner? | Show small notice | Owner sees saved theme was invalid and fallback applied. | |
| Should editor surface unknown saved theme to owner? | Block save until choosing | Strict but more friction for rare legacy state. | |
| Should theme IDs stay stable plain strings? | Stable plain IDs | Fits current DB string and shared registry. | yes |
| Should theme IDs stay stable plain strings? | Prefixed IDs | Example `theme_midnight`; clearer but changes style from current values. | |
| Should theme IDs stay stable plain strings? | Versioned IDs | Example `v1_midnight`; future-proof but unnecessary for presets now. | |

**User's choices:** Render default dark; normalize invalid submissions to dark; auto-select dark silently in editor; stable plain IDs.
**Notes:** Fallback behavior should be resilient and non-disruptive.

---

## Visual Tone

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| Overall feel for expanded presets? | Professional brandable | Polished presets users can use for real profiles without looking gimmicky. | yes |
| Overall feel for expanded presets? | Playful expressive | More personality; stronger gradients/colors. | |
| Overall feel for expanded presets? | Minimal neutral | Very safe; less perceived expansion. | |
| Color range should lean how far? | Balanced palette | Mix dark, light, warm, cool, nature, high-contrast. | yes |
| Color range should lean how far? | Mostly subdued | Safer for readability, less variety. | |
| Color range should lean how far? | Bold gradients | Stronger visual impact; more contrast testing burden. | |
| Should themes affect typography weight/spacing or only colors/surfaces? | Colors and surfaces only | Safer scope; same layout and typography stays consistent. | yes |
| Should themes affect typography weight/spacing or only colors/surfaces? | Subtle typography variants | More expressive, but may complicate registry and QA. | |
| Should themes affect typography weight/spacing or only colors/surfaces? | Theme-specific layout accents | Highest variety, but scope creep for Phase 1. | |
| Minimum readability standard for every preset? | Strict contrast | Theme rejected if text/link contrast feels weak on mobile/public page. | yes |
| Minimum readability standard for every preset? | Good enough visually | Faster but risks low-contrast themes. | |
| Minimum readability standard for every preset? | Planner discretion | Trust implementation to balance aesthetics and accessibility. | |

**User's choices:** Professional brandable; balanced palette; colors/surfaces only; strict contrast.
**Notes:** Theme expansion should add variety without making public microsites look gimmicky or reducing readability.

---

## Theme Set

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| How many total themes should Phase 1 target? | 7 total | Existing 3 plus 4 new: enough variety, manageable QA. | yes |
| How many total themes should Phase 1 target? | 6 total | Existing 3 plus 3 new: safer and faster. | |
| How many total themes should Phase 1 target? | 8 total | Existing 3 plus 5 new: richer palette, more visual checks. | |
| Which four new presets should be baseline? | Midnight Sunset Forest Mono | Balanced dark/warm/nature/high-contrast spread. | yes |
| Which four new presets should be baseline? | Midnight Sunset Ocean Forest | More colorful, less neutral/high-contrast. | |
| Which four new presets should be baseline? | Mono Sand Ocean Rose | Softer lifestyle set, less strong dark option. | |
| Should existing visuals remain unchanged? | Preserve existing | Avoid surprising current microsite owners. | yes |
| Should existing visuals remain unchanged? | Polish slightly | Can improve consistency, but changes existing public pages. | |
| Should existing visuals remain unchanged? | Redesign all | Most cohesive, highest regression risk. | |
| Should registry include display metadata for dashboard list thumbnail too? | Yes reuse registry | Dashboard microsite list currently has separate thumbnail logic; registry prevents drift. | yes |
| Should registry include display metadata for dashboard list thumbnail too? | Only editor/public | Meets core success criteria, leaves list thumbnail duplicated. | |
| Should registry include display metadata for dashboard list thumbnail too? | Planner discretion | If low effort, include; else defer. | |

**User's choices:** 7 total; add `midnight`, `sunset`, `forest`, `mono`; preserve existing visuals; reuse registry for list thumbnails.
**Notes:** New presets should cover distinct use cases while keeping QA manageable.

---

## the agent's Discretion

None.

## Deferred Ideas

None.
