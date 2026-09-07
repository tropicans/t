# Phase 14: Public Invitation Landing Page & NextAuth Integration - Research

**Researched:** 2026-09-07
**Domain:** NextAuth Google OAuth Callback, Dynamic User Provisioning, Next.js App Router Dynamic Route (`/invite/[token]`), Claude Editorial Design System
**Confidence:** HIGH

<user_constraints>
## User Constraints (from Requirements & Roadmap)

No CONTEXT.md was created; planning proceeded using research, requirements, and project design contracts.

### Locked Requirements (from REQUIREMENTS.md)
- **INV-03**: Create public invitation landing page at `src/app/invite/[token]/page.tsx` that validates the token and renders an editorial welcome card with inviter name, invitation type/expiration, and an action button to "Masuk dengan Google".
- **AUTH-01**: Update NextAuth `signIn` callback in `src/lib/auth.ts` to allow users holding a valid invitation token: create new account in Prisma `User` table, increment `usesCount`, update `status`, and permit access to `/dashboard`.
- **AUTH-02**: Permit any previously registered user existing in `prisma.user` to sign in freely, while preserving `ALLOWED_EMAILS` from `.env` as the superadmin bootstrap allowlist.
- **TEST-01**: Automated unit test suite verifying invitation landing page logic, authorization rules in NextAuth `signIn`, and token claim transaction.

### Design System Contract (from DESIGN.md)
- **Palette**: Warm terracotta (`#cc785c`, hover/active `#a9583e`), tinted cream canvas (`#faf9f5`), dark product surface (`#181715`), hairline borders (`#e6dfd8` / `border-border`).
- **Typography**: Display/Heading serif (`font-heading` / `font-serif`), body sans (`font-sans` / `Inter`).
- **Components**: Editorial cards (`rounded-3xl bg-card border border-border shadow-2xl p-8`), circular avatar badges, BrandLogo header.
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Token Acceptance Page (`/invite/[token]`) | Server Component (`src/app/invite/[token]/page.tsx`) | `src/lib/invitations.ts` (`getInvitationByToken`, `validateInvitationStatus`) | Server-side validation before rendering, prevents client flash of invalid states |
| Token Cookie & Action Bridge | Client Component + Server Action (`src/app/invite/[token]/invite-action.tsx` & `actions.ts`) | Next.js `cookies()` & NextAuth `signIn("google")` | Sets `taut_invite_token` cookie and triggers Google OAuth sign-in with `/dashboard` callback |
| NextAuth Sign-In Authorization Engine | Callback Handler (`src/lib/auth.ts`) | Prisma Client (`prisma.user`, `prisma.invitation`) | Enforces 3-tier auth: (1) Existing DB User, (2) ALLOWED_EMAILS bootstrap, (3) Valid Invitation Claim |
| Automated Authorization Unit Tests | Vitest Suite (`src/lib/auth.test.ts`) | Mock Prisma & NextAuth Callbacks | Verifies all authentication permutations and edge cases without live OAuth |
</architectural_responsibility_map>

<research_summary>
## Summary

Investigation of the authentication flow and invitation model shows:

1. **Invitation State from Phase 13**:
   - `prisma/schema.prisma` already defines the `Invitation` model with relation to `User` (`createdInvitations` and `claimedUsers` via `invitationId`).
   - `src/lib/invitations.ts` contains `getInvitationByToken`, `validateInvitationStatus`, and `claimInvitationTransaction`.
   - `src/lib/validators.ts` already reserves `"invite"` in `RESERVED_SLUGS`.

2. **NextAuth Callback Flow (`src/lib/auth.ts`)**:
   - Currently, `signIn({ user, account })` only allows emails in `ALLOWED_EMAILS`. Any user not in that environment variable is blocked with `AccessDenied`.
   - To support dynamic onboarding (AUTH-01 & AUTH-02):
     - **Tier 1 (Existing User)**: Query `prisma.user.findUnique({ where: { email: userEmail } })`. If exists, allow sign-in immediately (`return true`) and update user profile name/image. Subsequent logins will never require an invitation token again.
     - **Tier 2 (Bootstrap Allowlist)**: If `ALLOWED_EMAILS` is defined in `.env` and matches `userEmail`, allow sign-in and upsert `prisma.user`.
     - **Tier 3 (Invitation Claim)**: Read `taut_invite_token` from request cookies (`await cookies()`). If present:
       - Validate invitation token using `getInvitationByToken` and `validateInvitationStatus(invitation, userEmail)`.
       - If valid, execute an atomic transaction creating the `User` with `invitationId: invitation.id`, incrementing `invitation.usesCount`, updating `invitation.status` to `ACCEPTED` if quota exhausted, and deleting the cookie.
       - If token is missing, expired, exhausted, revoked, or target email mismatches, deny sign-in (`return false`).

3. **Landing Page Experience (`/invite/[token]`)**:
   - Next.js App Router route: `src/app/invite/[token]/page.tsx` (with `params: Promise<{ token: string }>`).
   - If token is invalid (expired, revoked, exhausted, or non-existent): Render a warm editorial card informing the user of the invalid status with a link to `/login`.
   - If token is valid: Render an editorial welcome card displaying:
     - Inviter's name and avatar.
     - Invitation parameters (remaining quota, expiration date, or target email restriction).
     - Google OAuth button (`InviteAction`) that sets the cookie and initiates `signIn("google", { callbackUrl: "/dashboard" })`.

4. **Testing Strategy**:
   - Create `src/lib/auth.test.ts` to test `signIn` callback authorization permutations:
     - Existing user in DB allows login.
     - Allowlisted email in ALLOWED_EMAILS allows login and creates user.
     - Valid open invitation allows login, creates user, and increments usage.
     - Valid email-specific invitation allows login when email matches.
     - Email-specific invitation denies login when email mismatches.
     - Expired or exhausted invitation denies login.
     - Unauthorized user without invitation or allowlist is rejected.
</research_summary>

<validation_architecture>
## Validation Architecture

1. **TypeScript Type Check**:
   - `npx tsc --noEmit` must pass with 0 errors.
2. **Automated Unit Tests**:
   - `npx vitest run src/lib/auth.test.ts` passes 100%.
   - `npx vitest run src/lib/invitations.test.ts` passes 100%.
   - Full test suite `npm run test` passes 100%.
3. **Build Validation**:
   - `npm run build` succeeds cleanly.
</validation_architecture>
