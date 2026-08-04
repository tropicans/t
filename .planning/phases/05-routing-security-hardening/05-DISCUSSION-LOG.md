# Phase 5: Routing & Security Hardening - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-04
**Phase:** 5-routing-security-hardening
**Areas discussed:** Namespace Collision Validation & Reserved Routes, URL Scheme Validation & Protocol Auto-Correction, Middleware Placement & NextAuth Configuration

---

## Centralized Namespace Collision Validation & Reserved Routes (SEC-02)

### 1. Where should the centralized slug and alias validation logic reside?
| Option | Description | Selected |
|--------|-------------|----------|
| **Utility File** | Define in a new utility file `src/lib/validators.ts` to keep validation decoupled from server actions. | ✓ |
| **Helper in Action File** | Define as a helper in one of the action files and import it. | |
| **You decide** | Let Antigravity choose the best location. | |

**User's choice:** Utility File (`src/lib/validators.ts`)
**Notes:** Decoupled layout makes imports cleaner and prevents circular dependencies.

### 2. How strictly should we prevent collisions between short link codes and microsite slugs?
| Option | Description | Selected |
|--------|-------------|----------|
| **Strict Mutual Exclusion** | Enforce strict mutual exclusion: a custom alias/slug cannot match any existing shortCode OR microsite slug, preventing any shadowing. | ✓ |
| **Allow shadowing** | Only prevent microsite slugs from colliding with short links, but allow short links to shadow microsites. | |
| **You decide** | Let Antigravity choose the strictness level. | |

**User's choice:** Strict Mutual Exclusion
**Notes:** Complete mutual exclusion avoids route shadowing entirely.

### 3. Should we expand the reserved slug list to cover other static assets and files?
| Option | Description | Selected |
|--------|-------------|----------|
| **Yes, expand** | Yes, expand the list to include standard static paths and assets (e.g., 'robots.txt', 'sitemap.xml', 'static', 'images', 'uploads'). | ✓ |
| **Keep current** | No, keep the current reserved list only (dashboard, login, api, l, _next, favicon.ico). | |
| **You decide** | Let Antigravity compile the final reserved list. | |

**User's choice:** Yes, expand reserved routes
**Notes:** Prevents users from registering usernames/slugs matching common static URLs.

### 4. How descriptive should the validation error messages be when a namespace collision occurs?
| Option | Description | Selected |
|--------|-------------|----------|
| **Clear Errors** | Throw clear, user-friendly Errors indicating the specific type of collision (e.g. 'already taken by a short link' vs 'already taken by a microsite'). | ✓ |
| **Generic Errors** | Throw generic validation errors (e.g., 'This path is unavailable' or 'Invalid alias'). | |
| **You decide** | Let Antigravity write the error message structure. | |

**User's choice:** Clear, user-friendly errors
**Notes:** Allows front-end users to understand why their input was rejected.

---

## URL Scheme Validation & Protocol Auto-Correction (SEC-03)

### 1. What protocols should be permitted for destination URLs?
| Option | Description | Selected |
|--------|-------------|----------|
| **Permit HTTP/HTTPS** | Permit only 'http:' and 'https:' protocols to prevent malicious protocols like 'javascript:' or 'data:'. | ✓ |
| **Permit Any** | Permit any protocol as long as it parses as a valid URL. | |
| **You decide** | Let Antigravity decide. | |

**User's choice:** Permit HTTP/HTTPS only
**Notes:** Mitigates XSS / open redirect risks.

### 2. If the user inputs a domain without a protocol (e.g., "google.com"), how should we handle it?
| Option | Description | Selected |
|--------|-------------|----------|
| **Auto-prepend HTTPS** | Auto-prepend 'https://' if it parses as a valid domain name, improving UX. | ✓ |
| **Strict rejection** | Strictly reject it as an invalid URL and require the user to explicitly type 'http://' or 'https://'. | |
| **You decide** | Let Antigravity decide. | |

**User's choice:** Auto-prepend HTTPS
**Notes:** Prepend scheme for typical browser-friendly input.

### 3. Should we allow loopback IPs/localhost and relative URLs as destination URLs?
| Option | Description | Selected |
|--------|-------------|----------|
| **Strictly reject** | Strictly reject relative URLs, localhost, and loopback IPs (with a NODE_ENV !== 'development' bypass for testing local redirects). | ✓ |
| **Allow relative/local** | Allow relative/local URLs globally. | |
| **You decide** | Let Antigravity decide. | |

**User's choice:** Strictly reject in production with dev bypass
**Notes:** Mitigates SSRF risks while preserving testing convenience.

### 4. Should we apply the new URL validation logic to both Short Links and Microsite Links?
| Option | Description | Selected |
|--------|-------------|----------|
| **Apply to both** | Apply to both Short Links (originalUrl) and Microsite Links (url) to ensure complete redirection safety. | ✓ |
| **Short links only** | Apply to Short Links only. | |
| **You decide** | Let Antigravity decide. | |

**User's choice:** Apply to both Short Links and Microsite Links
**Notes:** Secures all outbound redirect vectors uniformly.

---

## Middleware Placement & NextAuth Configuration (SEC-01)

### 1. When moving proxy protection to the native middleware file, should we keep the route matcher as "/dashboard/:path*"?
| Option | Description | Selected |
|--------|-------------|----------|
| **Keep Matcher** | Keep the exact current config with matcher "/dashboard/:path*" and login redirect to "/login". | ✓ |
| **Expand Matcher** | Expand the matcher to cover other routes. | |
| **You decide** | Let Antigravity decide. | |

**User's choice:** Keep the exact current matcher (`/dashboard/:path*`)
**Notes:** Minimal changes prevent unexpected authorization blocks on public routes.

### 2. Should we implement custom behavior for unauthorized access attempt routing, or stick to NextAuth's default behavior?
| Option | Description | Selected |
|--------|-------------|----------|
| **Stick to default** | Stick to NextAuth's default redirect to "/login" as configured. | ✓ |
| **Custom handler** | Return a custom JSON error or page for API or AJAX calls under `/dashboard/api`. | |
| **You decide** | Let Antigravity decide. | |

**User's choice:** Stick to NextAuth's default redirect behavior
**Notes:** Simplifies client redirection on session expiration.

### 3. Should we keep the optional ALLOWED_EMAILS check strictly inside the NextAuth signIn callback in "src/lib/auth.ts", or add an additional layer of enforcement in "src/middleware.ts"?
| Option | Description | Selected |
|--------|-------------|----------|
| **auth.ts callbacks** | Keep it inside "src/lib/auth.ts" callbacks, as NextAuth already prevents signing in and issuing a JWT token for non-allowed emails. | ✓ |
| **Both files** | Enforce it in both "src/lib/auth.ts" and "src/middleware.ts". | |
| **You decide** | Let Antigravity decide. | |

**User's choice:** Keep it inside `src/lib/auth.ts` callbacks only
**Notes:** Relies on authentication token creation phase rather than performing redundant checks at runtime.

### 4. How should we implement the file transition from "src/proxy.ts" to "src/middleware.ts"?
| Option | Description | Selected |
|--------|-------------|----------|
| **git mv** | Use 'git mv' to rename the file, preserving its commit history. | ✓ |
| **Recreate** | Delete 'src/proxy.ts' and create 'src/middleware.ts' from scratch. | |
| **You decide** | Let Antigravity decide. | |

**User's choice:** Use `git mv`
**Notes:** Retains source history tracking.

---

## the agent's Discretion
None. All options were selected based on user decisions.

## Deferred Ideas
None.
