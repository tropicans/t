---
phase: 07-edit-microsite-slug
plan: 01
subsystem: ui
tags:
  - react
  - nextjs
  - prisma
  - testing
requires: []
provides:
  - edit-microsite-slug-field
  - microsite-slug-collision-validation
  - selective-cache-revalidation
affects:
  - public-microsite-page
  - dashboard-microsite-editor
tech-stack:
  added: []
  patterns:
    - client-side slug input sanitization
    - selective path cache revalidation on slug change
key-files:
  created:
    - src/app/actions/microsite.test.ts
  modified:
    - src/app/actions/microsite.ts
    - src/app/dashboard/microsites/[id]/microsite-editor.tsx
key-decisions:
  - "D-01: Placed the new slug input field inline inside the existing 'Informasi Microsite' card, right below the title field, sharing the existing 'Simpan' button."
  - "D-02: Formatted the input with a prefixed layout showing the dynamic location host domain."
  - "D-03: Sanitized the input client-side using automatic lowercase, non-alphanumeric replacement with hyphens, and trimming hyphens on blur."
  - "D-04: Validated the slug on form submission using the centralized validateSlugCollision helper."
  - "D-05: Showed validation and collision errors using the card-level error banner."
  - "D-06: Aborted database update atomically on slug validation error."
  - "D-07: Performed selective path revalidation for old slug, new slug, and editor pages."
requirements-completed:
  - SLUG-01
  - SLUG-02
  - SLUG-03
  - SLUG-04
  - SLUG-05
duration: 12 min
completed: 2026-08-04T08:19:17Z
coverage:
  - deliverable: "Edit microsite slug in the editor UI"
    verification:
      kind: "command"
      ref: "npx tsc --noEmit"
      status: "pass"
    human_judgment: false
  - deliverable: "Validate slug against collision with reserved routes and short links"
    verification:
      kind: "command"
      ref: "npm run test"
      status: "pass"
    human_judgment: false
  - deliverable: "updateMicrosite server action processes slug validation and db update"
    verification:
      kind: "command"
      ref: "npm run test"
      status: "pass"
    human_judgment: false
  - deliverable: "Path cache revalidation on slug updates"
    verification:
      kind: "command"
      ref: "npm run test"
      status: "pass"
    human_judgment: false
  - deliverable: "Vitest unit tests verifying slug actions and edge cases"
    verification:
      kind: "command"
      ref: "npm run test"
      status: "pass"
    human_judgment: false
---

# Phase 7 Plan 1: Edit Microsite Slug Summary

Successfully implemented edit microsite slug capability with client-side sanitization, collision checking on submit, selective revalidation, and integrated unit tests.

## Accomplishments

- Integrated a slug URL input field with a dynamic hostname prefix inside the dashboard editor UI form.
- Configured client-side sanitization converting inputs to lowercase, swapping spaces/non-alphanumeric characters with hyphens on input change, and trimming leading/trailing hyphens on blur.
- Updated the `updateMicrosite` server action to perform slug validation against reserved routes, short links, and other microsites.
- Handled selective `revalidatePath` calls for the old slug, new slug, and editor routes to refresh Next.js cache.
- Wrote 6 unit tests in `src/app/actions/microsite.test.ts` verifying all requirements, all passing successfully.

## Next Step

Phase 7 is complete. Proceed to milestone audit.
