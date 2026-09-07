---
phase: 14-public-invitation-landing-page-nextauth-integration
plan: 14-01
status: complete
date: 2026-09-07
requirements:
  - INV-03
  - AUTH-01
  - AUTH-02
  - TEST-01
---

# Summary 14-01: Public Invitation Landing Page & NextAuth Integration

## Overview
Built the public invitation landing page at `/invite/[token]` with Claude warm editorial aesthetics, integrated NextAuth's `signIn` callback to dynamically onboard users claiming valid invitations, and verified all authorization pathways via a dedicated Vitest test suite.

## Key Changes
1. **NextAuth 3-Tier Sign-In Bridge (`AUTH-01`, `AUTH-02`):**
   - Updated `src/lib/auth.ts` with `authorizeUserSignIn` helper and enhanced `callbacks.signIn`:
     - **Tier 1 (Existing DB User - `AUTH-02`):** Users already in `prisma.user` sign in freely without requiring an invite token. Profile details (`name`, `image`) update automatically.
     - **Tier 2 (Superadmin Bootstrap - `AUTH-02`):** Users matching the comma-separated `ALLOWED_EMAILS` environment variable can sign in and are upserted into `prisma.user`.
     - **Tier 3 (Invitation Claim - `AUTH-01`):** Users presenting a `taut_invite_token` session cookie are validated using `getInvitationByToken` and `validateInvitationStatus`. If valid, an atomic transaction provisions the new `User` linked to `invitationId`, increments `usesCount`, transitions status to `ACCEPTED` if quota is reached, and clears the cookie.
     - **Unauthorized:** Access denied if user is not in DB, not in `ALLOWED_EMAILS`, and holds no valid invitation.

2. **Cookie Server Action (`AUTH-01`):**
   - Implemented `src/app/invite/[token]/actions.ts`:
     - `setInvitationCookie(token)`: Stores the invite token in an HTTP-only, secure, SameSite=Lax cookie with 1-hour expiration prior to OAuth redirection.
     - `clearInvitationCookie()`: Helper to delete the cookie upon successful claim.

3. **Invitation Action Client Component (`INV-03`):**
   - Implemented `src/app/invite/[token]/invite-action.tsx`:
     - Styled with Claude terracotta (`bg-primary hover:bg-terracotta-active rounded-full h-12 w-full`).
     - Includes Google multicolored SVG icon and loading spinner.
     - Sets cookie via server action and triggers `signIn("google", { callbackUrl: "/dashboard" })`.

4. **Public Invitation Landing Page (`INV-03`):**
   - Implemented `src/app/invite/[token]/page.tsx`:
     - Server Component validating token on load via `getInvitationByToken` and `validateInvitationStatus`.
     - **Valid State:** Renders editorial card with BrandLogo, "Undangan Terverifikasi" pill, inviter avatar and name, invitation parameters (quota, expiration date, target email restriction), and Google sign-in action button.
     - **Invalid State:** Renders editorial warning card with clear failure reason (expired, exhausted, revoked, or non-existent) and link to `/login`.

5. **Automated Unit Testing (`TEST-01`):**
   - Implemented `src/lib/auth.test.ts` covering 12 test cases:
     - Existing user login without invite token.
     - Case-insensitive email matching.
     - Superadmin bootstrap allowlist via `ALLOWED_EMAILS`.
     - Open invitation claim transaction and usage counter increment.
     - Single-use and quota transition to `ACCEPTED`.
     - Email-specific invitation allowance and mismatch rejection.
     - Expired, exhausted, and revoked token rejections.
     - Unauthorized user rejection and empty email guard.

## Verification
- `npx vitest run src/lib/auth.test.ts`: 12/12 tests passed (100%).
- `npm run test`: All 7 test suites (54 tests total) passed (100%).
- `npx tsc --noEmit`: Exited with code 0 (0 errors).
- `npm run build`: Production build completed cleanly with dynamic `/invite/[token]` route.
