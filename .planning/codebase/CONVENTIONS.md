# Coding Conventions

**Analysis Date:** 2026-09-07

## Naming Patterns

**Files & Directories:**
- Files: `kebab-case.ts` / `kebab-case.tsx` (e.g. `short-link-form.tsx`, `microsite-editor.tsx`, `user-agent.ts`)
- Tests: `[name].test.ts` (e.g. `microsite.test.ts`, `short.test.ts`)
- Route Folders: `kebab-case` and brackets for dynamic parameters (`[username]`, `[id]`, `[slug]`)

**Functions & Variables:**
- Standard functions and variables: `camelCase` (e.g. `createShortLink`, `trackMicrositeClick`, `normalizeMicrositeTheme`)
- React Components: `PascalCase` (e.g. `AnalyticsCharts`, `MicrositeEditor`, `ShortLinkList`)
- Boolean flags / state: Prefixed with `is`, `has`, `can`, or `show` (e.g. `isPublished`, `isPending`, `canViewAllLinks`, `showAddForm`)
- Constants & Enums: `UPPER_SNAKE_CASE` (e.g. `MICROSITE_THEMES`, `RESERVED_ROUTES`)

**Types & Interfaces:**
- Types: `PascalCase` (e.g. `MicrositeWithLinks`, `ClickRecord`, `ThemeConfig`)
- Props Types: Co-located with component or declared inline (e.g. `{ microsite }: { microsite: MicrositeWithLinks }`)

## Code Style

**Formatting & Linting:**
- Linter: ESLint 9 (`eslint.config.mjs`) extending `eslint-config-next`
- Indentation: 4 spaces standard across TypeScript files
- Semicolons: Always used
- Quotes: Double quotes (`"`) for JSX attributes and strings, backticks for template strings

**Styling System:**
- Tailwind CSS v4 with dark mode defaults (`bg-zinc-950`, `bg-zinc-900/60`, `border-zinc-800`, `text-white`, `text-zinc-400`)
- Dynamic classes composed via `cn(...)` utility (`src/lib/utils.ts`) combining `clsx` and `tailwind-merge`

## Import Organization

**Order:**
1. Next.js / React built-ins and framework directives (`"use client"`, `"use server"`, `useState`, `useRouter`)
2. Third-party packages (`next-auth`, `recharts`, `lucide-react`, `date-fns`)
3. Internal Server Actions (`@/app/actions/...`)
4. Internal components (`@/components/...`)
5. Internal libraries, helpers, and types (`@/lib/...`, `@/types/...`)

**Path Aliases:**
- All internal project modules use the `@/` alias mapped to `./src/*` (configured in `tsconfig.json` and `vitest.config.ts`). Relative `../` imports are avoided across directories.

## Error Handling

**Server Actions:**
- Validate inputs early using validation helpers (`validateShortCode`, `validateUrl`, `validateReservedRoute`).
- Throw explicit `Error("Deskripsi kesalahan...")` with user-friendly messages in Indonesian or English.
- Revalidate relevant paths upon success using `revalidatePath("/dashboard/...")`.

```typescript
// Pattern in Server Actions (src/app/actions/microsite.ts)
export async function createMicrosite(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Unauthorized");

    const slug = (formData.get("slug") as string)?.trim().toLowerCase();
    if (!slug) throw new Error("Slug wajib diisi");

    const validation = await validateShortCode(slug);
    if (!validation.isValid) throw new Error(validation.error);

    // Database mutation
    return await prisma.microsite.create({ ... });
}
```

**Client UI Forms:**
- Use React `useTransition` (`isPending, startTransition`) to manage loading states.
- Catch errors in transition blocks and extract error string via helper (`getErrorMessage(err)`).
- Display errors inline using alert blocks (`text-red-400 bg-red-500/10 border border-red-500/20`).

```typescript
// Pattern in Client Components (src/app/dashboard/microsites/[id]/microsite-editor.tsx)
function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Terjadi kesalahan tak terduga";
}

startTransition(async () => {
    try {
        await updateMicrosite(microsite.id, formData);
        router.refresh();
    } catch (err) {
        setError(getErrorMessage(err));
    }
});
```

## Logging & Telemetry

**Logging Guidelines:**
- Use `console.error` for unexpected backend action failures or database communication errors.
- Never log raw request authorization headers, session secrets, or user passwords.

**Background Telemetry:**
- Background tasks (such as click recording and IP geocoding) must run in non-blocking fashion using `Promise.resolve().then(...)` or unawaited async functions.
- Catch all errors inside telemetry routines so background failures never abort user redirection.

```typescript
// Pattern in src/app/actions/short.ts
export async function trackShortLinkClick(shortLinkId: string, headersList: Headers) {
    Promise.resolve().then(async () => {
        try {
            // Asynchronously resolve country and record click
            await prisma.shortLinkClick.create({ ... });
        } catch (error) {
            console.error("Failed to track short link click in background:", error);
        }
    });
}
```

## Accessibility (a11y) & UX

- Live status announcements for screen readers use visually hidden `aria-live="polite"` containers (e.g. `announcement` state in link reordering).
- Action buttons have explicit `aria-label` or `title` attributes.
- Keyboard navigation maintains focus using targeted element ref or `focusTarget` effects.

---

*Convention analysis: 2026-09-07*
