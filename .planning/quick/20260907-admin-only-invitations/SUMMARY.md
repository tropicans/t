---
status: complete
quick_id: 20260907-admin-only-invitations
date: 2026-09-07
description: Restrict invitation management menu, page, and server actions to admin users only
---

# Quick Task Summary: Restrict Invitation Management to Admin Users

## Overview
Restricted all invitation management access—including desktop sidebar and mobile navigation drawer menu items, settings card, `/dashboard/invitations` route, and backend server actions—exclusively to administrators (defined via `ALLOWED_EMAILS` or `GLOBAL_DASHBOARD_VIEWER_EMAIL`). Regular invited users no longer see or have access to invitation generation or revocation capabilities.

## Key Changes
1. **Centralized Admin Authorization Helper (`src/lib/admin.ts`):**
   - Created `isUserAdmin(email?: string | null): boolean` to check if a user's email belongs to `ALLOWED_EMAILS` (case-insensitive) or `GLOBAL_DASHBOARD_VIEWER_EMAIL`.
   - Added unit test suite `src/lib/admin.test.ts` (4 unit tests passing).

2. **NextAuth Session & JWT Typing:**
   - Updated `src/types/next-auth.d.ts` to type `isAdmin?: boolean` on `Session["user"]` and `JWT`.
   - Updated `jwt` and `session` callbacks in `src/lib/auth.ts` to compute and pass `isAdmin` to the client-side session.

3. **UI Navigation & Settings Protection:**
   - **Dashboard Layout (`src/app/dashboard/layout.tsx`):** Conditionally included `{ name: "Invitations", href: "/dashboard/invitations", icon: UserPlus }` in `navItems` only when `session?.user?.isAdmin` is `true`. Both desktop sidebar and mobile navigation drawer automatically hide the item for regular users.
   - **Settings Page (`src/app/dashboard/settings/page.tsx`):** Wrapped "Manajemen Undangan" card with `{isAdmin && ...}`, preventing non-admin users from discovering or linking to the invitation page.

4. **Route Guarding & Server Action Authorization:**
   - **Invitations Page (`src/app/dashboard/invitations/page.tsx`):** Added server-side guard redirecting non-admin users to `/dashboard`.
   - **Server Actions (`src/app/actions/invitations.ts`):** Added authorization checks to `createInvitationAction` and `revokeInvitationAction` verifying `isUserAdmin(user.email)`.

5. **Automated Unit Tests & Verification:**
   - Updated `src/app/actions/invitations.test.ts` with test cases verifying non-admin rejection for both creation and revocation.
   - All 70 unit tests across 9 test files pass 100%.
   - TypeScript compilation (`npx tsc --noEmit`) passes with 0 errors.
   - Next.js production build (`npm run build`) succeeded with all 18 routes compiled.
