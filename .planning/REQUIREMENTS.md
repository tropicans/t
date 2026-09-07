# Requirements: Milestone v1.5 — Invitation Link & Dynamic User Onboarding

## Scope
Enable dynamic and secure user onboarding via invitation links so administrators can invite users without editing `.env`. Supports hybrid links (open links with usage limits/expiration, and email-specific links) with a dedicated invitation acceptance landing page and NextAuth Google sign-in bridge.

## Requirements

### Data Model & Routing
- **INV-01**: Define Prisma `Invitation` model with fields `id`, `token` (unique), `email` (optional), `invitedById` (relation to User), `maxUses` (default 1), `usesCount` (default 0), `expiresAt` (optional DateTime), `status` (`PENDING`, `ACCEPTED`, `EXPIRED`, `REVOKED`), `createdAt`, and `updatedAt`.
- **INV-02**: Protect the `/invite` route namespace by adding `invite` to `RESERVED_SLUGS` in `src/lib/validators.ts` to prevent conflicts with short links and microsite slugs.

### Public Invitation Acceptance & Auth Bridge
- **INV-03**: Create public invitation landing page at `src/app/invite/[token]/page.tsx` that validates the token and renders an editorial welcome card with inviter name, invitation type/expiration, and an action button to "Masuk dengan Google".
- **AUTH-01**: Update NextAuth `signIn` callback in `src/lib/auth.ts` to allow users holding a valid invitation token: create new account in Prisma `User` table, increment `usesCount`, update `status`, and permit access to `/dashboard`.
- **AUTH-02**: Permit any previously registered user existing in `prisma.user` to sign in freely, while preserving `ALLOWED_EMAILS` from `.env` as the superadmin bootstrap allowlist.

### Dashboard Management & Administration
- **ADMIN-01**: Build Invitation Management UI in the dashboard (accessible from Settings or dedicated section) allowing users to create new invitations (choose Open link with custom max uses / expiration or Email-specific), view active/expired invitations, copy invite URLs, and revoke invitations.

### Verification & Testing
- **TEST-01**: Comprehensive Vitest automated unit test suite verifying token generation, collision protection with reserved routes, invitation validation logic (expiration, max uses, email match), and NextAuth sign-in authorization rules.
