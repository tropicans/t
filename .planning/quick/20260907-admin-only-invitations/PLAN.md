# Quick Task: Restrict Invitation Management to Admin Users (`admin-only-invitations`)

## Goal
Restrict the invitation management menu, dashboard page (`/dashboard/invitations`), settings card, and server actions exclusively to administrators (defined via `ALLOWED_EMAILS` or `GLOBAL_DASHBOARD_VIEWER_EMAIL`), preventing unauthorized regular users from viewing the menu or generating/revoking invitations.

## Tasks
1. **Admin Authorization Helper & NextAuth Session Typing**:
   - Implement `isUserAdmin(email?: string | null): boolean` in `src/lib/admin.ts`.
   - Update `src/types/next-auth.d.ts` to type `isAdmin?: boolean` on `Session["user"]` and `JWT`.
   - Update `src/lib/auth.ts` JWT and session callbacks to populate `isAdmin`.
2. **UI Navigation & Settings Protection**:
   - In `src/app/dashboard/layout.tsx`, filter navigation items so the "Invitations" link is only visible when `session?.user?.isAdmin` is true (both desktop sidebar and mobile drawer).
   - In `src/app/dashboard/settings/page.tsx`, conditionally render the "Manajemen Undangan" card only for admin users.
3. **Route & Action Guarding**:
   - In `src/app/dashboard/invitations/page.tsx`, check `isUserAdmin(session.user.email)` and redirect non-admin users to `/dashboard`.
   - In `src/app/actions/invitations.ts`, guard `createInvitationAction` and `revokeInvitationAction` with `isUserAdmin(user.email)`.
4. **Verification & Tests**:
   - Update `src/app/actions/invitations.test.ts` to test non-admin permission denials and verify existing tests pass.
   - Run `npm run test` (all Vitest suites) and `npx tsc --noEmit`.
