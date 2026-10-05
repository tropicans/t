# Quick Task: Fix Invited Admin Visibility for Microsites and System Dashboard

## Goal
Ensure users invited and assigned the `ADMIN` (or `OPERATOR`) role in the database can view and manage all microsites and links, just like admins configured via `.env`.

## Root Cause
1. `isGlobalDashboardViewer` / `isGlobalMicrositeViewer` in `src/lib/microsite-access.ts` only inspected environment variables (`GLOBAL_DASHBOARD_VIEWER_EMAIL` / `GLOBAL_MICROSITE_VIEWER_EMAIL`) and did not accept `dbRole` or check `isUserAdmin(email, dbRole)` / `isUserOperator(email, dbRole)`.
2. `/dashboard/microsites/page.tsx`, `/dashboard/microsites/[id]/page.tsx`, `/dashboard/links/page.tsx`, `/dashboard/page.tsx`, `/dashboard/analytics/page.tsx`, and `/dashboard/invitations/page.tsx` either did not pass `dbUser.role` or performed authorization checks against `.env` only before loading the DB role.
3. NextAuth JWT callback did not dynamically re-fetch user role from DB if `token.role` was already set on initial login as `MEMBER`.

## Implementation Steps (TDD)
1. **Reproduce Bug with Failing Test**:
   - Write tests in `src/lib/microsite-access.test.ts` showing that `isGlobalMicrositeViewer` / `isGlobalDashboardViewer` fails for a database user with `dbRole = "ADMIN"` or `dbRole = "OPERATOR"` when their email is NOT in `.env`.
   - Run `npm test` to verify test fails (RED).
2. **Fix `src/lib/microsite-access.ts`**:
   - Update `isGlobalDashboardViewer(email?: string | null, dbRole?: string | null): boolean` to integrate with `isUserAdmin(email, dbRole)` and `isUserOperator(email, dbRole)`.
   - Verify test passes (GREEN).
3. **Update Pages and Actions**:
   - Update `/dashboard/microsites/page.tsx` to pass `dbUser.role`.
   - Update `/dashboard/microsites/[id]/page.tsx` to fetch `dbUser` first and pass `dbUser.role`.
   - Update `/dashboard/links/page.tsx`, `/dashboard/page.tsx`, `/dashboard/analytics/page.tsx`, `/dashboard/invitations/page.tsx`, and `/dashboard/settings/page.tsx` to pass `dbUser.role`.
   - Ensure `src/lib/auth.ts` JWT callback refreshes DB role.
4. **Verification**:
   - Run all tests to ensure no regressions and verify full passing test suite.
