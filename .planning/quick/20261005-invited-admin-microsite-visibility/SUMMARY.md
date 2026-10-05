---
status: complete
date: "2026-10-05"
slug: invited-admin-microsite-visibility
description: Fix invited admin visibility for microsites, links, and system dashboards
---

# Quick Task Summary: Fix Invited Admin Visibility for Microsites and System Dashboards

## Problem
Users invited and assigned the `ADMIN` (or `OPERATOR`) role in the database were unable to view other users' microsites or global resources like admins configured in `.env`.

## Root Cause
1. `isGlobalMicrositeViewer` was previously an alias to `isGlobalDashboardViewer` in [src/lib/microsite-access.ts](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/lib/microsite-access.ts), which solely checked the environment variables (`GLOBAL_DASHBOARD_VIEWER_EMAIL` / `GLOBAL_MICROSITE_VIEWER_EMAIL`) and did not check `isUserAdmin(email, dbRole)` or `isUserOperator(email, dbRole)`.
2. Dashboard views ([src/app/dashboard/microsites/page.tsx](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/app/dashboard/microsites/page.tsx), [src/app/dashboard/microsites/[id]/page.tsx](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/app/dashboard/microsites/[id]/page.tsx), [src/app/dashboard/links/page.tsx](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/app/dashboard/links/page.tsx), [src/app/dashboard/page.tsx](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/app/dashboard/page.tsx), [src/app/dashboard/analytics/page.tsx](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/app/dashboard/analytics/page.tsx), [src/app/dashboard/invitations/page.tsx](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/app/dashboard/invitations/page.tsx), [src/app/dashboard/settings/page.tsx](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/app/dashboard/settings/page.tsx)) either passed only `session.user.email` without `dbUser.role`, or executed admin gates prior to fetching the database role.
3. NextAuth JWT callback in [src/lib/auth.ts](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/lib/auth.ts) didn't re-evaluate role from database if `token.role` was already cached as `MEMBER`.

## Changes Made
1. **TDD Bug Reproduction**:
   - Added tests in [src/lib/microsite-access.test.ts](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/lib/microsite-access.test.ts) demonstrating failure when `dbRole: "ADMIN"` or `dbRole: "OPERATOR"` is present without `.env` config.
2. **Access Utility Fix**:
   - Updated [src/lib/microsite-access.ts](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/lib/microsite-access.ts) so `isGlobalMicrositeViewer(email, dbRole)` checks `isUserAdmin(email, dbRole) || isUserOperator(email, dbRole) || isGlobalDashboardViewer(email)`.
3. **Dashboard Pages Updated**:
   - [src/app/dashboard/microsites/page.tsx](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/app/dashboard/microsites/page.tsx): passed `dbUser.role` to `isGlobalMicrositeViewer`.
   - [src/app/dashboard/microsites/[id]/page.tsx](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/app/dashboard/microsites/[id]/page.tsx): fetched `dbUser` first and passed `dbUser.role`.
   - [src/app/dashboard/links/page.tsx](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/app/dashboard/links/page.tsx), [src/app/dashboard/page.tsx](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/app/dashboard/page.tsx), [src/app/dashboard/analytics/page.tsx](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/app/dashboard/analytics/page.tsx): switched to `isGlobalMicrositeViewer` with `dbUser.role`.
   - [src/app/dashboard/invitations/page.tsx](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/app/dashboard/invitations/page.tsx): fetched `dbUser` first and verified `isUserAdmin(session.user.email, dbUser.role)`.
   - [src/app/dashboard/settings/page.tsx](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/app/dashboard/settings/page.tsx): passed `session.user.role` to `isUserAdmin`.
4. **JWT Dynamic Refresh**:
   - Updated [src/lib/auth.ts](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/lib/auth.ts) to re-sync `token.role`, `token.isAdmin`, `token.isOperator` against database on each token resolution when email is present.
   - Added test coverage in [src/lib/auth.test.ts](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/lib/auth.test.ts).

## Verification
- All 13 test suites (107 tests) passing cleanly with `vitest run`.
- Type checking passes with 0 errors via `npx tsc --noEmit`.
- ESLint passes cleanly on modified application files.
