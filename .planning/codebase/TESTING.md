# Testing Patterns

**Analysis Date:** 2026-09-07

## Test Framework

**Runner & Configuration:**
- Runner: Vitest (`vitest` `^4.1.10`) with `@vitejs/plugin-react` (`^6.0.5`)
- Configuration File: `vitest.config.ts`
- Test Environment: `node` (configured in `vitest.config.ts` with `globals: true` and path alias `@` -> `./src`)

**Run Commands:**
```bash
npm test                               # Run all test suites once (vitest run)
npx vitest                             # Run tests in watch mode
npx vitest run                         # Explicit single-pass execution
npx vitest run src/app/actions/short   # Run a targeted test file
```

## Test Suite Inventory

The codebase currently maintains 18 automated unit tests across 3 core action test files:

| Test File | Focus Area | Test Count |
|---|---|---|
| `src/app/actions/short.test.ts` | Short link creation, deletion, alias collisions, and validation | 6 tests |
| `src/app/actions/microsite.test.ts` | Microsite CRUD, link creation, reordering, and visibility toggling | 6 tests |
| `src/app/actions/short-link-redirect.test.ts` | Public wildcard resolution, password checks, and redirect logic | 6 tests |

## Test File Organization

**Location:**
- Co-located with server action modules under `src/app/actions/*.test.ts`.
- When adding actions or lib utilities, place unit test files directly alongside the source file with `.test.ts` extension.

**Naming:**
- `<module-name>.test.ts` for unit test files.

## Mocking Patterns

Tests use Vitest's `vi.mock` to stub Next.js framework utilities, NextAuth session getters, and the Prisma client singleton.

### Mocking Prisma
```typescript
// Pattern in src/app/actions/short.test.ts & microsite.test.ts
vi.mock("@/lib/prisma", () => ({
    prisma: {
        shortLink: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
            delete: vi.fn(),
        },
        microsite: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        micrositeLink: {
            findMany: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
            upsert: vi.fn(),
        },
        $transaction: vi.fn((callbacks) => (Array.isArray(callbacks) ? Promise.all(callbacks) : callbacks())),
    },
}));
```

### Mocking Next.js Navigation & Cache
```typescript
// Pattern in src/app/actions/short-link-redirect.test.ts
vi.mock("next/navigation", () => ({
    redirect: vi.fn((url: string) => {
        const error = new Error("NEXT_REDIRECT");
        (error as any).digest = `NEXT_REDIRECT;replace;${url};307;`;
        throw error;
    }),
    notFound: vi.fn(() => {
        const error = new Error("NEXT_NOT_FOUND");
        (error as any).digest = "NEXT_NOT_FOUND";
        throw error;
    }),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));
```

### Mocking NextAuth Session
```typescript
vi.mock("next-auth", () => ({
    getServerSession: vi.fn(() => Promise.resolve({
        user: { email: "test@example.com", name: "Test User" },
    })),
}));
```

## Common Test Patterns

### Testing Server Actions Throwing Errors
```typescript
it("rejects unauthorized requests when user is not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null);
    const formData = new FormData();
    formData.append("slug", "my-slug");

    await expect(createMicrosite(formData)).rejects.toThrow("Unauthorized");
});
```

### Testing Dynamic Slugs and Reserved Routes
```typescript
it("rejects short link code matching reserved system keywords", async () => {
    const formData = new FormData();
    formData.append("originalUrl", "https://example.com");
    formData.append("customCode", "dashboard");

    await expect(createShortLink(formData)).rejects.toThrow();
});
```

### Testing Link Reordering Transactions
```typescript
it("updates order of links in transaction", async () => {
    const orderedIds = ["link-3", "link-1", "link-2"];
    const result = await reorderMicrositeLinks("ms-1", orderedIds);

    expect(result.success).toBe(true);
    expect(prisma.$transaction).toHaveBeenCalled();
});
```

## Guidelines for New Tests

1. **Reset Mocks Between Tests:** Include `beforeEach(() => { vi.clearAllMocks(); })` to prevent mock leakage across test cases.
2. **Deterministic Inputs:** Avoid depending on network connections or live database instances in unit tests.
3. **Type Verification:** Run `npx tsc --noEmit` alongside test suites to ensure strict TypeScript compliance.

---

*Testing analysis: 2026-09-07*
