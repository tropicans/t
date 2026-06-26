# Coding Conventions

**Analysis Date:** 2026-06-26

## Naming Patterns

**Files:**
- Use kebab-case for route leaf components and feature files: `src/app/dashboard/links/short-link-form.tsx`, `src/app/dashboard/links/short-link-list.tsx`, `src/components/microsite-page-client.tsx`.
- Use bracketed dynamic route segments for Next App Router params: `src/app/[username]/page.tsx`, `src/app/api/microsites/[slug]/route.ts`, `src/app/dashboard/microsites/[id]/page.tsx`.
- Use `route.ts` for API route handlers: `src/app/api/click/microsite-link/[linkId]/route.ts`, `src/app/api/uploadthing/route.ts`.
- Use `page.tsx` and `layout.tsx` for App Router screens and shells: `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/dashboard/layout.tsx`.
- Use lowercase utility/module names in `src/lib`: `src/lib/auth.ts`, `src/lib/prisma.ts`, `src/lib/utils.ts`, `src/lib/public-microsite.ts`.

**Functions:**
- Use camelCase for helpers and event handlers: `getCurrentUser()` in `src/app/actions/short.ts`, `validateSlug()` in `src/app/actions/microsite.ts`, `handleDelete()` in `src/app/dashboard/microsites/[id]/microsite-editor.tsx`.
- Prefix UI event handlers with `handle`: `handleUpdateInfo`, `handleAddLink`, `handleToggleLinkVisibility` in `src/app/dashboard/microsites/[id]/microsite-editor.tsx`.
- Name exported server actions with imperative verbs: `createShortLink`, `deleteShortLink` in `src/app/actions/short.ts`; `createMicrosite`, `updateMicrosite`, `deleteMicrosite` in `src/app/actions/microsite.ts`.
- Name route handlers with HTTP verbs: `GET` in `src/app/api/click/microsite-link/[linkId]/route.ts`.

**Variables:**
- Use camelCase for locals and state: `originalUrl`, `customAlias`, `rawPassword` in `src/app/actions/short.ts`; `isPending`, `errorMsg`, `copiedId` in `src/app/dashboard/links/short-link-form.tsx` and `src/app/dashboard/links/short-link-list.tsx`.
- Use `is*` / `can*` boolean names: `isPending`, `isOwner`, `canViewAllLinks` in `src/app/dashboard/links/short-link-list.tsx`; `canManageAllMicrosites` in `src/app/actions/microsite.ts`.
- Use uppercase constants for local fixed lists/config: `APP_URL` in `src/app/[username]/page.tsx`, `THEMES` in `src/app/dashboard/microsites/[id]/microsite-editor.tsx`.

**Types:**
- Use PascalCase for interfaces and type aliases: `CurrentUserAccess` in `src/app/actions/microsite.ts`, `ShortLinkWithOwner` and `ShortLinkListProps` in `src/app/dashboard/links/short-link-list.tsx`, `MicrositeWithLinks` in `src/app/dashboard/microsites/[id]/microsite-editor.tsx`.
- Prefer explicit prop interfaces/types for exported components: `ShortLinkListProps` in `src/app/dashboard/links/short-link-list.tsx`.
- Use Prisma-generated model types where available: `type ShortLink` imported from `@prisma/client` in `src/app/dashboard/links/short-link-list.tsx`.

## Code Style

**Formatting:**
- Formatter config not detected: no `.prettierrc*` or `prettier.config.*` exists.
- Use TypeScript strict mode from `tsconfig.json`: `strict: true`, `noEmit: true`, `isolatedModules: true`, `jsx: react-jsx`.
- Existing app/action files use semicolons and 4-space indentation: `src/app/actions/short.ts`, `src/app/actions/microsite.ts`, `src/app/dashboard/links/short-link-form.tsx`.
- Existing shadcn UI files omit semicolons and use 2-space indentation: `src/components/ui/button.tsx`, `src/lib/utils.ts`. Preserve generated shadcn style when editing `src/components/ui/*`.
- Keep Tailwind classes inline on JSX elements for app UI: `src/app/dashboard/links/short-link-form.tsx`, `src/app/dashboard/links/short-link-list.tsx`, `src/app/dashboard/microsites/[id]/microsite-editor.tsx`.

**Linting:**
- Use ESLint 9 with Next core-web-vitals and TypeScript presets from `eslint.config.mjs`.
- Run `npm run lint`; script maps to `eslint` in `package.json`.
- ESLint ignores generated/build output and local agent bundles: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`, `.agents/**`, `test-prisma.cjs` in `eslint.config.mjs`.

## Import Organization

**Order:**
1. Framework/runtime imports: `react`, `next/*`, `next-auth`, `@prisma/client` as in `src/app/dashboard/links/short-link-list.tsx` and `src/app/actions/short.ts`.
2. App aliases using `@/`: actions, lib helpers, UI components as in `src/app/dashboard/links/short-link-form.tsx`.
3. Third-party UI/data packages: `lucide-react`, `date-fns`, `react-qr-code` as in `src/app/dashboard/links/short-link-list.tsx`.

**Path Aliases:**
- Use `@/*` for `src/*`, configured in `tsconfig.json`.
- Use `@/components`, `@/components/ui`, `@/lib`, `@/hooks`, `@/lib/utils` aliases from `components.json`.
- Prefer `@/lib/prisma` over relative traversal for DB access, as in `src/app/actions/short.ts` and `src/app/api/click/microsite-link/[linkId]/route.ts`.

## Error Handling

**Patterns:**
- Server actions used by forms return result objects for recoverable form errors: `{ error: "Unauthorized" }`, `{ success: "Short link deleted" }` in `src/app/actions/short.ts`.
- Server actions used by editor flows throw `Error` for auth/not-found/validation failures and let client handlers display message: `src/app/actions/microsite.ts` plus `getErrorMessage()` in `src/app/dashboard/microsites/[id]/microsite-editor.tsx`.
- Client components catch action errors inside `startTransition` and store message in component state: `handleUpdateInfo`, `handleAddLink`, `handleEditLink` in `src/app/dashboard/microsites/[id]/microsite-editor.tsx`.
- API routes return `NextResponse.json({ error: "Not found" }, { status: 404 })` for missing resources: `src/app/api/click/microsite-link/[linkId]/route.ts`.
- Page-level auth failures redirect with `redirect("/login")`: `src/app/dashboard/microsites/page.tsx`, `src/app/dashboard/microsites/[id]/page.tsx`.
- Missing public resources use `notFound()`: `src/app/[username]/page.tsx`, `src/app/dashboard/microsites/[id]/page.tsx`.
- Fire-and-forget analytics failures are swallowed to keep redirects/pages working: `.catch(() => { })` in `src/app/[username]/page.tsx`, empty `catch { }` in `src/app/api/click/microsite-link/[linkId]/route.ts`.

## Logging

**Framework:** console

**Patterns:**
- Log auth allowlist denial with `console.log` in `src/lib/auth.ts`.
- Log DB sign-in/upsert failures with `console.error` and normalized unknown errors via `getErrorMessage()` in `src/lib/auth.ts`.
- Log server-action failures before returning generic user-facing messages in `src/app/actions/short.ts`.
- Do not log expected validation errors from form actions; return/throw messages instead, as in `src/app/actions/short.ts` and `src/app/actions/microsite.ts`.

## Comments

**When to Comment:**
- Use section comments to separate server-action domains: `// ── Microsite CRUD` and `// ── Microsite Link CRUD` in `src/app/actions/microsite.ts`.
- Use short comments for non-obvious behavior: auth upsert rationale in `src/lib/auth.ts`, fire-and-forget tracking in `src/app/api/click/microsite-link/[linkId]/route.ts`, short-link priority in `src/app/[username]/page.tsx`.
- Keep comments current and operational; avoid restating JSX or obvious assignments.

**JSDoc/TSDoc:**
- Not detected. No JSDoc/TSDoc pattern in sampled app files.

## Function Design

**Size:** Keep helper functions small and colocated with feature actions. Examples: `getCurrentUser()` in `src/app/actions/short.ts`, `validateSlug()` in `src/app/actions/microsite.ts`, `getErrorMessage()` in `src/lib/auth.ts`.

**Parameters:**
- Server actions receive `FormData` from forms and extract string fields inside action: `createShortLink(formData)` in `src/app/actions/short.ts`, `createMicrosite(formData)` in `src/app/actions/microsite.ts`.
- Mutations needing identity receive explicit IDs plus `FormData`: `updateMicrosite(id, formData)`, `updateMicrositeLink(linkId, formData)` in `src/app/actions/microsite.ts`.
- Route handlers type `params` as promises for Next 16 App Router: `{ params }: { params: Promise<{ linkId: string }> }` in `src/app/api/click/microsite-link/[linkId]/route.ts`.

**Return Values:**
- Server actions for UI forms return plain serializable objects: `{ success: true, microsite }`, `{ error: "Failed to create short link" }`.
- DB query helpers return Prisma promises/results directly: `getShortLinks()` in `src/app/actions/short.ts`.
- Page components return JSX, `redirect()`, or `notFound()`; see `src/app/[username]/page.tsx`.

## Module Design

**Exports:**
- Use named exports for server actions and reusable components: `createShortLink` in `src/app/actions/short.ts`, `ShortLinkForm` in `src/app/dashboard/links/short-link-form.tsx`, `Button` in `src/components/ui/button.tsx`.
- Use default export for App Router pages/layouts: `src/app/[username]/page.tsx`, `src/app/page.tsx`, `src/app/dashboard/layout.tsx`.
- Export shared singleton clients from `src/lib`: `prisma` from `src/lib/prisma.ts`, `authOptions` from `src/lib/auth.ts`.

**Barrel Files:**
- Not detected. Import UI components directly from component files, e.g. `@/components/ui/button`, `@/components/ui/card`.

---

*Convention analysis: 2026-06-26*
