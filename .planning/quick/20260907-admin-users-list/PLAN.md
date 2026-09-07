# Quick Task: Display Registered User List in Admin Dashboard (`admin-users-list`)

## Goal
Provide a comprehensive registered users list UI and query for administrators on `/dashboard/invitations` (and alias `/dashboard/users`), displaying all users in the database with their profile info, admin/member role, join origin (direct allowlist vs invitation), short link & microsite counts, and join date.

## Tasks
1. **Admin User Query Helper**:
   - Implement `getAllUsersForAdmin()` in `src/lib/admin.ts` using `prisma.user.findMany` with relations to `invitation` (including inviter info) and `_count` (`shortLinks`, `microsites`).
   - Annotate each user with their computed `isAdmin` flag using `isUserAdmin(user.email)`.
2. **User List UI Component**:
   - Create `src/app/dashboard/invitations/user-list.tsx` with search input, role and registration filter pills, user avatar with fallback initial, badges for role (Superadmin vs Member) and registration origin, link/microsite counts, and joined date.
   - Adhere to Claude warm terracotta editorial design system (`DESIGN.md`).
3. **Admin Dashboard Page Enhancements**:
   - In `src/app/dashboard/invitations/page.tsx`:
     - Fetch all users via `getAllUsersForAdmin()`.
     - Update `getUserInvitations` call to pass `isAdmin` so any admin sees all invitations.
     - Add total registered users overview metric card.
     - Implement clean tab switcher: **"Daftar Pengguna"** (Users List) & **"Tautan Undangan"** (Invitations Management).
4. **Navigation & Route Usability**:
   - In `src/app/dashboard/layout.tsx`: Update navigation item label to `"Users & Invites"` with `Users` icon.
   - Create `src/app/dashboard/users/page.tsx` with server-side redirect to `/dashboard/invitations?tab=users`.
5. **Testing & Verification**:
   - Add unit tests for `getAllUsersForAdmin` in `src/lib/admin.test.ts`.
   - Run `npm run test` (Vitest) and `npx tsc --noEmit`.
   - Rebuild Docker container to ensure production deployment stability.
