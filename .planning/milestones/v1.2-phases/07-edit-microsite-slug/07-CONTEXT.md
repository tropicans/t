# Phase 7: Edit Microsite Slug - Context

**Gathered:** 2026-08-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Memungkinkan pengguna untuk mengedit slug URL microsite mereka secara aman dengan validasi collision (reserved routes dan short links) dan pembersihan cache via revalidatePath.

</domain>

<decisions>
## Implementation Decisions

### Form Field Integration & Layout
- **D-01:** Place the new slug input field inline inside the existing 'Informasi Microsite' card, above or below the title field, sharing the existing 'Simpan' button.
- **D-02:** Format the input with a prefixed layout showing a leading '/' or dynamic domain to make it clear that it is the URL path segment.
- **D-03:** Sanitize the input client-side (auto-lowercase, replace spaces/invalid characters with hyphens) to prevent typing mistakes.

### Validation & Feedback Loop
- **D-04:** Validate the slug on form submission using the centralized `validateSlugCollision` helper in `src/lib/validators.ts`.
- **D-05:** Show any validation or collision errors using the existing card-level error banner at the top of the editor page.
- **D-06:** Ensure the update operation is atomic; abort the entire update operation (do not save title/description/cover/theme changes) on slug validation error.

### Cache Revalidation Scope
- **D-07:** Perform selective path revalidation for the old slug path (`/${oldSlug}`), the new slug path (`/${newSlug}`), and the dashboard editor path (`/dashboard/microsites/${id}`).

### the agent's Discretion
- Open to standard Tailwind and component styles for the prefixed input segment inside the dashboard editor.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specifications
- `.planning/ROADMAP.md` — Phase 7 roadmap entry
- `.planning/REQUIREMENTS.md` — Requirements SLUG-01 through SLUG-05

### Core Code Files
- `src/lib/validators.ts` — Contains centralized `validateSlugCollision` logic
- `src/app/actions/microsite.ts` — Defines the `updateMicrosite` server action
- `src/app/dashboard/microsites/[id]/microsite-editor.tsx` — Dashboard editor form UI

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `validateSlugCollision` in `src/lib/validators.ts` (currently checks reservations, short links, and existing microsites).
- `cleanSlugOrAlias` in `src/lib/validators.ts` to sanitize alphanumeric/hyphen characters.

### Established Patterns
- Form event handling in `microsite-editor.tsx` catches exceptions inside `startTransition` and populates a local state `error`.
- Server actions like `createMicrosite` throw standard JavaScript `Error` objects on validation failures.

### Integration Points
- `updateMicrosite` server action in `src/app/actions/microsite.ts`.
- Form component inside `src/app/dashboard/microsites/[id]/microsite-editor.tsx`.

</code_context>

<specifics>
## Specific Ideas
No specific custom layout requirements — standard inline styling using shadcn/Radix UI component patterns.

</specifics>

<deferred>
## Deferred Ideas
None — discussion stayed within phase scope.

</deferred>

---

*Phase: 7-Edit Microsite Slug*
*Context gathered: 2026-08-04*
