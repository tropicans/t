# Phase 5: Routing & Security Hardening - Context

**Gathered:** 2026-08-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Mengaktifkan native Next.js middleware, mencegah tabrakan namespace rute, dan memvalidasi skema URL tujuan (Requirements SEC-01, SEC-02, SEC-03).

</domain>

<decisions>
## Implementation Decisions

### Namespace Collision Validation & Reserved Routes (SEC-02)
- **D-01 (Location):** Define a new utility file [validators.ts](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/lib/validators.ts) containing the centralized URL validation and route collision checking logic.
- **D-02 (Strictness):** Enforce strict mutual exclusion: a custom alias/slug cannot match any existing shortCode OR microsite slug, preventing any route shadowing.
- **D-03 (Reserved Slugs):** Expand the reserved route list to include standard static paths and assets (e.g., `robots.txt`, `sitemap.xml`, `static`, `images`, `uploads`, plus `dashboard`, `login`, `api`, `l`, `_next`, `favicon.ico`).
- **D-04 (Error Handling):** Server actions throw clear, user-friendly Errors indicating the specific type of collision (e.g. "This alias/slug is already taken by a short link" or "This alias/slug is already taken by a microsite").

### URL Scheme Validation & Protocol Auto-Correction (SEC-03)
- **D-05 (Protocols):** Permit only `http:` and `https:` protocols for destination URLs in both Short Links and Microsite Links to prevent script/injection exploits (e.g., `javascript:`, `data:`).
- **D-06 (Auto-Correction):** Auto-prepend `https://` if the input parses as a valid domain name but lacks a protocol (e.g., `google.com` becomes `https://google.com`), improving UX.
- **D-07 (Local/Relative URLs):** Strictly reject relative URLs, localhost, and loopback IPs (with a `NODE_ENV !== 'development'` bypass to allow local development testing).
- **D-08 (Scope):** Apply the URL validation logic to both Short Links (`originalUrl` in `createShortLink`) and Microsite Links (`url` in `createMicrositeLink` and `updateMicrositeLink`) for comprehensive security.

### Middleware Placement & NextAuth Configuration (SEC-01)
- **D-09 (Matcher):** Move route protection from [proxy.ts](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/proxy.ts) to [middleware.ts](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/middleware.ts) using `git mv`, keeping the exact current configuration with matcher `/dashboard/:path*` and unauthorized redirect to `/login`.
- **D-10 (Allowlist):** Keep the optional `ALLOWED_EMAILS` check strictly inside the NextAuth callbacks in [auth.ts](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/lib/auth.ts), as NextAuth already prevents signing in and issuing a JWT token for non-allowed emails.

### the agent's Discretion
None. All areas have explicit user choices/recommendations.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Security Requirements
- [ROADMAP.md](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/.planning/ROADMAP.md) §Phase 5 — Phase 5 goals and success criteria.
- [REQUIREMENTS.md](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/.planning/REQUIREMENTS.md) §Phase 5 — v1.1 security requirements (SEC-01, SEC-02, SEC-03).
- [AGENTS.md](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/AGENTS.md) — Middleware routing instructions and allowlist configuration rules.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- NextAuth `withAuth` middleware from [proxy.ts](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/proxy.ts) to be renamed to [middleware.ts](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/middleware.ts).
- `validateSlug` function in [microsite.ts](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/app/actions/microsite.ts) will be updated to use the centralized validation module.

### Established Patterns
- Server actions throw `Error` on validation failure, which is caught by UI form submit handlers and displayed as user-facing errors.

### Integration Points
- [short.ts](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/app/actions/short.ts) (`createShortLink`)
- [microsite.ts](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/app/actions/microsite.ts) (`createMicrosite` and link mutation actions)
- [page.tsx](file:///c:/Users/yudhiar/Downloads/oprek/Dev/url-shortener/src/app/%5Busername%5D/page.tsx) (public entrypoint for link resolution)

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 5-Routing & Security Hardening*
*Context gathered: 2026-08-04*
