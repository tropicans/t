# Testing Patterns

**Analysis Date:** 2026-06-26

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

**Requirements:** None enforced

**View Coverage:**
```bash
# Not available: no coverage script configured in package.json
```

## Test Types

**Unit Tests:**
- Not used. Highest-value unit targets are pure/recoverable logic in `src/app/actions/short.ts`, `src/app/actions/microsite.ts`, `src/lib/auth.ts`, and `src/lib/utils.ts`.
- Add tests for URL validation, alias uniqueness behavior, password hashing branch, reserved slug rejection, owner/global-viewer access checks, and result object shapes.

**Integration Tests:**
- Not used. Highest-value integration targets are Prisma-backed server actions and route handlers: `src/app/actions/short.ts`, `src/app/actions/microsite.ts`, `src/app/api/click/microsite-link/[linkId]/route.ts`, `src/app/api/microsites/[slug]/route.ts`.
- Integration tests need isolated Postgres or transaction cleanup because runtime DB access goes through `src/lib/prisma.ts`.

**E2E Tests:**
- Not used. No Playwright/Cypress config detected.
- Highest-value E2E flows: Google login redirect gate from `src/proxy.ts`, create short link in `src/app/dashboard/links/short-link-form.tsx`, delete/copy/QR actions in `src/app/dashboard/links/short-link-list.tsx`, public short-link resolution in `src/app/[username]/page.tsx`, microsite editor flow in `src/app/dashboard/microsites/[id]/microsite-editor.tsx`.

## Common Patterns

**Async Testing:**
```typescript
// No actual async test pattern exists.
// Future tests should await server actions directly with real FormData:
const formData = new FormData();
formData.set("originalUrl", "https://example.com");
const result = await createShortLink(formData);
```

**Error Testing:**
```typescript
// No actual error test pattern exists.
// Future tests should cover both returned errors and thrown errors:
// - `createShortLink()` returns `{ error: "Invalid URL provided." }` in `src/app/actions/short.ts`
// - `createMicrosite()` throws `Error("Title is required")` in `src/app/actions/microsite.ts`
```

---

*Testing analysis: 2026-06-26*
