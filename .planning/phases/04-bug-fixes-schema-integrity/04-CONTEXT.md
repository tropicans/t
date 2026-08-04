# Phase 4: Bug Fixes & Schema Integrity - Context

**Gathered:** 2026-08-04T06:54:05Z
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 4 resolves database schema drift and fixes logic gaps in the redirect paths:
- Applies and logs a database migration for `Microsite.avatarImage` to eliminate drift on fresh database installations.
- Checks link expiration (`expiresAt`) in the password redirect server action to reject expired links.
- Ensures the microsite link click API `/api/click/microsite-link/[linkId]` verifies that the link is active and the parent microsite is published before tracking and redirecting.

</domain>

<decisions>
## Implementation Decisions

### Link Expiration & Password Workflow
- **D-01:** The server action `verifyPasswordAndRedirect` will verify the short link's expiration before performing the `bcrypt.compare` operation (saving computing cost and preventing bypasses).
- **D-02:** If the link is expired, the server action will redirect the user back to the public `/[shortCode]` page, which will automatically evaluate the expiration and render the standard "Link Expired" error screen.

### Access Control for Inactive/Unpublished Links
- **D-03:** In `/api/click/microsite-link/[linkId]`, the API must verify that the link has `isActive: true` and the parent microsite has `isPublished: true`.
- **D-04:** If the parent microsite is published but the specific link is inactive, redirect the visitor back to the parent microsite's public profile page `/[username]` so they are not left on a raw JSON error page.
- **D-05:** If the parent microsite itself is unpublished, disabled, or missing entirely, return a standard `NextResponse.json({ error: "Not found" }, { status: 404 })`.

### Database Migration Strategy
- **D-06:** The newly generated Prisma migration `20260804065310_add_avatar_image` that adds the `avatarImage` column to the `Microsite` table will be committed to git.

### the agent's Discretion
No areas were delegated to the agent's sole discretion; implementation will follow the explicit decisions documented above.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Scope and Requirements
- `.planning/PROJECT.md` — overall project description, constraints, and scope.
- `.planning/REQUIREMENTS.md` — requirements DB-01, BUG-01, and BUG-02 for this phase.
- `.planning/ROADMAP.md` §Phase 4 — goals, success criteria, and canonical refs.
- `AGENTS.md` — project guidelines, Next.js ports, database defaults, and verification tools.

### Codebase & Research Maps
- `.planning/codebase/STRUCTURE.md` — codebase organization and structure map.
- `.planning/codebase/CONCERNS.md` — schema drift and redirect bugs documentation.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `prisma/client` (`src/lib/prisma.ts`) — for database queries and actions.
- `bcrypt` — for comparing passwords.
- `next/navigation` (`redirect`) — for triggering redirections.
- `next/server` (`NextResponse`) — for returning JSON responses.

### Established Patterns
- Expiration check format in `src/app/[username]/page.tsx`: checks if `expiresAt` exists and is before `new Date()`.
- Public microsite data query helper `getPublishedMicrosite` in `src/lib/public-microsite.ts` which uses `isPublished: true` and `isActive: true` sub-filtering.

### Integration Points
- `src/app/actions/short-link-redirect.ts` — integrate `expiresAt` check inside `verifyPasswordAndRedirect`.
- `src/app/api/click/microsite-link/[linkId]/route.ts` — add `isActive` and `isPublished` validation checks and fallback redirects/JSON errors.
- `prisma/migrations` — commit `20260804065310_add_avatar_image/migration.sql` to git.

</code_context>

<specifics>
## Specific Ideas

- Check expiration in `verifyPasswordAndRedirect` before password check:
  ```typescript
  if (link.expiresAt && link.expiresAt < new Date()) {
      redirect(`/${shortCode}`);
  }
  ```
- Fetch link with parent microsite status in `/api/click/microsite-link/[linkId]`:
  ```typescript
  const link = await prisma.micrositeLink.findUnique({
      where: { id: linkId },
      include: { microsite: true },
  });
  if (!link) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!link.microsite.isPublished) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!link.isActive) {
      redirect(`/${link.microsite.slug}`);
  }
  ```

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-Bug Fixes & Schema Integrity*
*Context gathered: 2026-08-04T06:54:05Z*
