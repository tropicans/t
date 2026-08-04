# Phase 4: Bug Fixes & Schema Integrity - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-04T06:54:15Z
**Phase:** 04-bug-fixes-schema-integrity
**Areas discussed:** Link Expiration & Password Workflow, Access Control for Inactive/Unpublished Links, Database Migration Strategy

---

## Link Expiration & Password Workflow

| Option | Description | Selected |
|--------|-------------|----------|
| Redirect back to page | Redirect the user back to the /[shortCode] page (which will automatically render the standard 'Link Expired' UI) | ✓ |
| Redirect back with error | Redirect back with an explicit error parameter like /[shortCode]?error=Expired (to show a custom banner or message) | |
| Render error page | Render a generic error page directly from the server action | |
| You decide | Implement the cleanest redirect approach | |

**User's choice:** Redirect the user back to the /[shortCode] page (which will automatically render the standard 'Link Expired' UI)
**Notes:** Decided to verify expiration before bcrypt computation for performance and security.

---

## Access Control for Inactive/Unpublished Links

| Option | Description | Selected |
|--------|-------------|----------|
| Smart Redirect / 404 | If parent microsite is published but link is inactive, redirect back to the parent microsite. If the microsite itself is unpublished or missing, return a JSON 404 error. | ✓ |
| Raw JSON 404 | Return a raw JSON 404 error for both cases (simple, standard API behavior) | |
| Redirect to Home | Redirect the user back to the homepage (/) with an error query parameter in all cases | |
| You decide | Implement the cleanest routing fallback | |

**User's choice:** If parent microsite is published but link is inactive, redirect back to the parent microsite. If the microsite itself is unpublished or missing, return a JSON 404 error.
**Notes:** Keeps the user within the microsite domain when only a single link is disabled.

---

## Database Migration Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Commit migration | Yes, commit the new migration file (keeps migrations/ schema history synchronized across local, CI, and deployment environments) | ✓ |
| Keep local only | No, do not commit the migration (only generate locally or use db push for testing) | |
| You decide | Implement the most robust choice | |

**User's choice:** Yes, commit the new migration file (keeps migrations/ schema history synchronized across local, CI, and deployment environments)
**Notes:** Committed migration folder to version control.

---

## the agent's Discretion

None.

## Deferred Ideas

None.
