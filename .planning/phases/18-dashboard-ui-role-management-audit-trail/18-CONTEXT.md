# Phase 18 Context: Dashboard UI Role Management & Audit Trail Timeline

## Recommended Architecture & Design Decisions

1. **Role Management Action & Self-Lockout Safety**:
   - Action `updateUserRoleAction(userId, newRole)` in `src/app/actions/users.ts`.
   - Only `ADMIN` can invoke this action.
   - Self-lockout check: The logged-in admin cannot demote or modify their own role.
   - Audit trail integration: Every role update automatically emits a `USER_ROLE_UPDATE` audit log.

2. **User Management UI (`src/app/dashboard/invitations/user-list.tsx`)**:
   - Displays all 3 roles: `ADMIN`, `OPERATOR`, `MEMBER`.
   - Includes an inline role selector for each user card.
   - Disables role selector for the current logged-in user with `(Akun Anda)` badge to avoid accidental self-demotion.
   - Filter pills updated to filter by `ALL`, `ADMIN`, `OPERATOR`, `MEMBER`, `INVITED`.

3. **Audit Trail UI (`src/app/dashboard/invitations/audit-trail-list.tsx`)**:
   - Integrated as a third tab in `AdminTabs` ("Audit Trail").
   - Shows actor, action type badge, entity, timestamp, and expandable or readable details.
   - Styled following Claude warm terracotta editorial system (`DESIGN.md`).

4. **Testing & Verification**:
   - Unit test suite `src/app/actions/users.test.ts` to test admin role changes, member role changes, operator role changes, self-lockout prevention, and unauthorized access rejection.
   - Full Vitest suite run and TypeScript validation.
