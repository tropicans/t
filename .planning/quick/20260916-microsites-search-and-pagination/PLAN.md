# Quick Task: Search and Pagination for Dashboard Microsites (`microsites-search-and-pagination`)

## Goal
Add real-time client-side search, status filtering, and pagination to the microsites dashboard (`/dashboard/microsites`) so users do not need to scroll through long lists of microsites.

## Tasks
1. **Create MicrositeList Client Component (`src/app/dashboard/microsites/microsite-list.tsx`)**:
   - Provide search input with clear button (filters by title, slug, and owner name/email).
   - Provide status filter pills (Semua, Publik, Draft).
   - Implement clean pagination (e.g. 9 or 12 items per page matching 3-column responsive grid).
   - Display pagination controls (Previous, page buttons, Next) and item range indicator ("Menampilkan X-Y dari Z microsite").
   - Handle empty search results state with a reset button.
   - Retain full card styling (thumbnail, badge, owner, links/clicks stats, QR code dialog, external link, and edit button).
2. **Update Server Component (`src/app/dashboard/microsites/page.tsx`)**:
   - Delegate list rendering to `<MicrositeList initialMicrosites={microsites} viewerUserId={dbUser.id} canViewAllMicrosites={canViewAllMicrosites} />`.
   - Maintain empty state and header creation button.
3. **Verification**:
   - Add unit test in `src/app/dashboard/microsites/microsite-list.test.tsx` (or Vitest test) testing filter, search, and pagination slicing logic.
   - Run `npx tsc --noEmit` and `npm run test`.
