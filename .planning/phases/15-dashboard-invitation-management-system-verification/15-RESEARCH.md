# Phase 15: Dashboard Invitation Management & System Verification - Research

**Researched:** 2026-09-07
**Domain:** Next.js Server Actions, Dashboard Management UI, Clipboard APIs, Claude Editorial Design System, Vitest Unit Testing, Docker Production Build
**Confidence:** HIGH

<user_constraints>
## User Constraints (from Requirements & Roadmap)

No CONTEXT.md was created; planning proceeded using research, requirements, and project design contracts.

### Locked Requirements (from REQUIREMENTS.md)
- **ADMIN-01**: Build Invitation Management UI in the dashboard (accessible from Settings or dedicated section) allowing users to create new invitations (choose Open link with custom max uses / expiration or Email-specific), view active/expired invitations, copy invite URLs, and revoke invitations.
- **TEST-01**: Automated unit test suite verifying invitation management actions (creation, revocation, listing), status calculations, authorization boundaries, and end-to-end system verification (build & tests).

### Design System Contract (from DESIGN.md)
- **Palette**: Warm terracotta (`#cc785c`, hover/active `#a9583e`), tinted cream canvas (`#faf9f5`), dark product surface (`#181715`), hairline borders (`#e6dfd8` / `border-border`).
- **Typography**: Display/Heading serif (`font-serif`, `font-heading`), body sans (`font-sans`, `Inter`).
- **Components**: Editorial cards (`rounded-2xl bg-card border border-border`), clean status badges (Active/Pending = teal/terracotta tint, Expired/Exhausted = muted amber, Revoked = muted red), copy button with instant feedback.
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Data Access & Queries | `src/lib/invitations.ts` (`getUserInvitations`, `createInvitation`, `revokeInvitation`) | Prisma Client (`prisma.invitation`) | Encapsulates DB logic, relations with claimed users, and ownership validation |
| Server Actions | `src/app/actions/invitations.ts` | NextAuth `getServerSession`, `revalidatePath` | Enforces authenticated session, sanitizes input, and revalidates dashboard cache |
| Dashboard Invitation Management Page | `src/app/dashboard/invitations/page.tsx` (Server Component) | `src/app/dashboard/invitations/invitation-form.tsx`, `invitation-list.tsx` (Client Components) | Fast initial server rendering without waterfall; rich client-side interactions for copy, toggle, and revoke |
| Navigation & Settings Integration | `src/app/dashboard/layout.tsx` & `src/app/dashboard/settings/page.tsx` | Next.js `Link`, Lucide icons (`UserPlus`, `Mail`) | Seamless discoverability from both main dashboard navigation and settings |
| Automated Test Suite | Vitest (`src/app/actions/invitations.test.ts`) | Mock Prisma & NextAuth | Comprehensive unit testing of server actions, permission gates, and edge cases |
| System Verification | CLI scripts (`npm run test`, `npx tsc --noEmit`, `npm run build`) | Next.js Standalone Docker configuration | Guarantees complete stability and container deployability on port 4000 |
</architectural_responsibility_map>

<research_summary>
## Summary

1. **Existing Foundation**:
   - `prisma/schema.prisma` already defines the `Invitation` model with relations to `User` (`invitedBy` and `claimedUsers`).
   - `src/lib/invitations.ts` contains `createInvitation`, `getInvitationByToken`, `validateInvitationStatus`, and `revokeInvitation`.
   - `src/lib/auth.ts` has full support for claiming invitations during Google sign-in.
   - The `/invite/[token]` public landing page is deployed and verified.

2. **Server Actions Needed (`src/app/actions/invitations.ts`)**:
   - `createInvitationAction(formData: FormData | InvitationInput)`:
     - Verifies active session user.
     - Validates invitation type (`open` vs `email`).
     - Parses and bounds `maxUses` (e.g., minimum 1, default 1 for email, configurable for open links).
     - Parses `expiresInDays` (e.g., 1 day, 7 days, 30 days, or never/null).
     - Calls `createInvitation` and `revalidatePath("/dashboard/invitations")`.
     - Returns `{ success: true, invitation: ... }` with generated URL (`${origin}/invite/${token}`).
   - `revokeInvitationAction(invitationId: string)`:
     - Verifies active session user.
     - Calls `revokeInvitation(invitationId, user.id)`.
     - Calls `revalidatePath("/dashboard/invitations")`.
     - Returns `{ success: true }`.

3. **Helper Extensions in `src/lib/invitations.ts`**:
   - Add `getUserInvitations(userId: string, isGlobalViewer?: boolean)`:
     - Queries invitations ordered by `createdAt: 'desc'`.
     - Includes `claimedUsers: { select: { id: true, name: true, email: true, image: true, createdAt: true } }` and `invitedBy: { select: { id: true, name: true, email: true } }`.

4. **UI Components (`src/app/dashboard/invitations/`)**:
   - `page.tsx`: Server Component resolving session, querying invitations, rendering header with summary statistics (total created, active, claimed count), and embedding form + list.
   - `invitation-form.tsx`: Client Component supporting:
     - Type toggle: "Tautan Terbuka" (Open) vs "Khusus Email" (Email-specific).
     - Target email input with email format validation.
     - Max uses selector (1, 5, 10, 25, 50, or custom).
     - Expiration selector (1 hari, 7 hari, 30 hari, Tanpa batas waktu).
     - Success banner upon creation featuring the complete invite link and a prominent "Salin Link" button with copied toast/feedback.
   - `invitation-list.tsx`: Interactive table/card list featuring:
     - Status badges: Aktif (green/teal), Habis (amber), Kedaluwarsa (slate/muted), Dicabut (rose/red).
     - Copy invite link button with instant visual feedback.
     - Progress bar / indicator for quota used (`usesCount / maxUses`).
     - Claimed users dropdown or tooltip displaying which registered users claimed the token.
     - Revoke button with confirmation prompt for active invitations.
     - Filter tabs (Semua, Aktif, Selesai/Kedaluwarsa).

5. **Navigation & Settings Integration**:
   - Add `{ name: "Invitations", href: "/dashboard/invitations", icon: UserPlus }` to `navItems` in `src/app/dashboard/layout.tsx`.
   - Add an invitation card / shortcut link in `src/app/dashboard/settings/page.tsx`.

6. **Testing & Verification (TEST-01)**:
   - Vitest suite in `src/app/actions/invitations.test.ts` covering:
     - Creating open invitation links with custom parameters.
     - Creating email-specific invitation links.
     - Input validation (invalid email format, negative quota, etc.).
     - Revoking an invitation successfully.
     - Preventing revocation of invitations belonging to another user.
     - `getUserInvitations` query with claimed users relation.
   - Full test suite run (`npm run test`), clean TypeScript check (`npx tsc --noEmit`), and production build test (`npm run build`).
</research_summary>

<validation_architecture>
## Validation Architecture

1. **Unit Testing**:
   - `npx vitest run src/app/actions/invitations.test.ts` passes 100%.
   - Full repository test suite `npm run test` passes 100%.
2. **TypeScript Compilation**:
   - `npx tsc --noEmit` exits with 0 errors.
3. **Production Build**:
   - `npm run build` succeeds cleanly.
</validation_architecture>
