---
phase: 02-drag-and-drop-link-ordering
plan: 01
subsystem: microsites
tags:
  - links
  - ordering
  - transaction
  - optimistic-ui
requires: []
provides:
  - link-ordering
  - accessible-chevrons
affects:
  - actions
  - editor
tech-stack:
  added: []
  patterns:
    - transaction-pattern
    - optimistic-ui-pattern
key-files:
  created:
    - scripts/verify-link-ordering.mjs
  modified:
    - src/app/actions/microsite.ts
    - src/app/dashboard/microsites/[id]/microsite-editor.tsx
key-decisions:
  - "D-01: Move Up/Down chevron buttons are provided for keyboard/accessibility fallback."
  - "D-02: Standard zero-dependency HTML5 drag-and-drop is utilized."
  - "D-05, D-06: Auto-saves trigger immediately with header status indicators."
  - "D-08: Reorder calls validate ownership and run inside prisma.$transaction."
  - "D-13: UI updates optimistically and rolls back on failure with a 5s error banner."
requirements-completed:
  - ORDER-01
  - ORDER-02
  - ORDER-03
  - ORDER-04
  - ORDER-05
duration: 8 min
completed: 2026-06-27T15:15:00Z
coverage:
  - deliverable: "Secure, atomic server-side link reordering"
    verification:
      kind: "command"
      ref: "node scripts/verify-link-ordering.mjs"
      status: "pass"
    human_judgment: false
  - deliverable: "Accessible drag-and-drop UI with optimistic updates & error rollback"
    verification:
      kind: "command"
      ref: "node scripts/verify-link-ordering.mjs"
      status: "pass"
    human_judgment: false
---

# Phase 2 Plan 1: Drag-and-Drop Link Ordering Summary

Implemented persistent and highly accessible link ordering inside the campaign editor.

## Accomplishments

- Updated the `reorderMicrositeLinks` server action to perform thorough user permission checks, validate link IDs, execute index updates inside a `prisma.$transaction`, and revalidate campaign routes.
- Modified the `MicrositeEditor` client component to manage local link order state with standard HTML5 drag-and-drop events and accessible Move Up/Down chevron buttons.
- Integrated optimistic UI updates with an auto-dismissing error banner and rollback functionality on save failure.
- Configured visual disabled indicators (reduced opacity and cursor-not-allowed) while saving is in progress or when the editor is in edit mode.
- Wrote `scripts/verify-link-ordering.mjs` to dynamically verify transaction usage, path revalidation, native drag event handlers, and keyboard navigation chevrons.
