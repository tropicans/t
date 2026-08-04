# Testing Patterns

**Analysis Date:** 2026-08-04

## Test Framework

**Runner:**
- Not detected. No Jest, Vitest, Playwright, Cypress, or test runner config found in repository root.
- Config: Not detected (`jest.config.*`, `vitest.config.*`, `playwright.config.*`, `cypress.config.*` absent).
- `package.json` has no `test`, `typecheck`, or `coverage` script; only `dev`, `build`, `start`, and `lint` exist.

**Assertion Library:**
- Not detected. No `expect`, `describe`, `it`, `test`, `vitest`, `jest`, or `@testing-library/*` app test usage detected under `src`.

**Run Commands:**
```bash
npm run lint              # Current verification command
npx tsc --noEmit          # Manual TypeScript verification when needed
npm run build             # Production build; injects mock DATABASE_URL via package.json
```

## Test File Organization

**Location:**
- Not detected. No `*.test.*` or `*.spec.*` files found.
- No `__tests__` directory detected.

**Naming:**
- Not established. Future tests should use co-located `*.test.ts` / `*.test.tsx` near target files or a consistent `src/**/__tests__/*` pattern.

**Structure:**
```text
Not detected
```

## Test Structure

**Suite Organization:**
```typescript
// No actual test suite pattern exists in this repo.
// When adding tests, mirror source behavior boundaries:
// describe("createShortLink", () => { ... }) for `src/app/actions/short.ts`
// describe("validateSlug behavior", () => { ... }) for `src/app/actions/microsite.ts`
// describe("GET /api/click/microsite-link/[linkId]", () => { ... }) for `src/app/api/click/microsite-link/[linkId]/route.ts`
```

**Patterns:**
- Setup pattern: Not detected.
- Teardown pattern: Not detected.
- Assertion pattern: Not detected.
- Current validation relies on static linting via `npm run lint` and manual TypeScript checking via `npx tsc --noEmit`.

## Mocking

**Framework:** Not detected

**Patterns:**
```typescript
// No actual mocking pattern exists.
// Needed future mocks:
// - `@/lib/prisma` for server actions in `src/app/actions/short.ts` and `src/app/actions/microsite.ts`
// - `next-auth` `getServerSession` for auth-gated actions
// - `next/cache` `revalidatePath` for mutation side effects
// - `next/navigation` `redirect` / `notFound` for pages like `src/app/[username]/page.tsx`
```

**What to Mock:**
- Mock Prisma client calls when unit testing server actions: `prisma.shortLink.findUnique`, `prisma.shortLink.create`, `prisma.microsite.update` in `src/app/actions/short.ts` and `src/app/actions/microsite.ts`.
- Mock `getServerSession(authOptions)` for authenticated branches in `src/app/actions/short.ts`, `src/app/actions/microsite.ts`, and dashboard pages.
- Mock `revalidatePath` for mutation actions in `src/app/actions/short.ts` and `src/app/actions/microsite.ts`.
- Mock browser APIs for client components: `navigator.clipboard.writeText` in `src/app/dashboard/links/short-link-list.tsx`, `confirm` in `src/app/dashboard/links/short-link-list.tsx` and `src/app/dashboard/microsites/[id]/microsite-editor.tsx`.

**What NOT to Mock:**
- Do not mock pure string/URL validation behavior; test inputs through actions such as `createShortLink()` in `src/app/actions/short.ts` and `validateSlug()` behavior through `createMicrosite()` in `src/app/actions/microsite.ts`.
- Do not mock Next form serialization semantics; pass real `FormData` to server actions.
- Do not mock Tailwind class merging utility `cn()` in `src/lib/utils.ts`; test output directly if component class behavior matters.

## Fixtures and Factories

**Test Data:**
```typescript
// No actual fixture/factory pattern exists.
// Useful future factory shape for `src/app/dashboard/links/short-link-list.tsx`:
const shortLink = {
  id: "link_1",
  userId: "user_1",
  shortCode: "abc1234",
  originalUrl: "https://example.com",
  password: null,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  user: { name: "User", email: "user@example.com" },
};
```

**Location:**
- Not detected. No `fixtures`, `factories`, or test support directories exist.
- If added, keep shared factories under `src/test/factories/*` or co-located with tests for small feature-specific data.

## Coverage

**Target:** Not applicable (no test runner is configured).
**Requirements:** Future configurations should set coverage targets around core database transaction modules (mutations in `src/app/actions`) to protect against authorization bypasses and invalid data entries.
