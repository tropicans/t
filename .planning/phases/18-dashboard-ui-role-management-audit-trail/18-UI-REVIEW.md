# Phase 18 — UI Review

**Audited:** 2026-09-18
**Baseline:** Abstract 6-pillar standards + `DESIGN.md` (Claude warm terracotta system, since no UI-SPEC.md exists)
**Screenshots:** Not captured — dev server live on `http://localhost:4000` (HTTP 200) but Playwright browser binaries not installed (`npx playwright install` required) and the dashboard route is Google-auth gated. Audit is code-only.

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | Specific Indonesian copy and real empty states, but raw `ADMIN/OPERATOR/MEMBER` enum leaks into the success toast and UI language is mixed (English "Role:", "Audit Trail" alongside Indonesian). |
| 2. Visuals | 3/4 | Clear header → metrics → tabs hierarchy, but the "Audit Trail timeline" ships as a plain stacked card list with no timeline rail, and the role selector is visually under-weight for the primary action on the page. |
| 3. Color | 2/4 | Semantics use hardcoded non-token `emerald-500` / `amber-500` (Tailwind defaults, not `{colors.success}`/`{colors.accent-amber}`); coral `primary` spread across 11+ distinct element types. |
| 4. Typography | 2/4 | 6 distinct sizes incl. arbitrary `text-[11px]` (18 uses); 3 weights; serif headings use `font-bold` which DESIGN explicitly forbids ("Don't bold serif display weight"). |
| 5. Spacing | 3/4 | Largely 4px-scale consistent, but off-scale values (`p-4.5`, `gap-3.5`, `gap-2.5`, `py-0.5`) appear repeatedly. |
| 6. Experience Design | 2/4 | Role change has spinner/disabled/empty/success states, but no confirmation for an irreversible privilege mutation, no `aria-live` on feedback, no `aria-expanded` on detail toggle, label not associated to select. |

**Overall: 15/24**

---

## Top 3 Priority Fixes

1. **Role change executes with no confirmation** (`src/app/dashboard/invitations/user-list.tsx:269`) — A single dropdown `onChange` immediately calls `updateUserRoleAction`, including demoting another ADMIN. An accidental tap permanently revokes access with no undo. Add a confirm step (dialog or inline "Ubah ke X? Ya/Batal") before dispatching, at minimum for demotions from ADMIN/OPERATOR.
2. **Hardcoded non-token colors break brand palette** (`user-list.tsx:214`, `:228`, `audit-trail-list.tsx:49`, `:65`, `page.tsx:118`) — `emerald-500`/`amber-500` are default Tailwind, not DESIGN tokens. Role/semantic meaning should use `{colors.success}` (#5db872), `{colors.accent-amber}` (#e8a55a), and `{colors.error}` (#c64545) via `bg-success/15 text-success` style token classes. Replace all 9 non-token color matches.
3. **Serif display bolded + size drift** (`page.tsx:87,103,113,123,133`; `user-list.tsx` 18× `text-[11px]`) — `font-serif font-bold` on h1 and metric numerals violates the "Copernicus at 400, never bold" rule. Drop to `font-normal`/weight-400 with negative tracking; collapse arbitrary `text-[11px]` to `text-xs` or a token.

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

**Passes**
- Search placeholders are specific and intent-revealing: `"Cari pengguna berdasarkan nama, email, atau token..."` (`user-list.tsx:131`), `"Cari berdasarkan nama, email, tindakan, atau ID entitas..."` (`audit-trail-list.tsx:118`).
- Both empty states are contextual with a recovery hint, not generic "No data": `Tidak ada pengguna yang cocok dengan kriteria.` + `Coba sesuaikan kata kunci pencarian atau filter Anda.` (`user-list.tsx:167-168`); `Belum ada aktivitas tercatat yang sesuai filter.` + explanation (`audit-trail-list.tsx:154-155`).
- Server errors are specific and actionable: `"Anda tidak dapat mengubah role akun Anda sendiri untuk mencegah lockout."` (`users.ts:44`), `"Hanya admin yang memiliki izin untuk mengubah role pengguna."` (`users.ts:29`).

**Findings**
- **WARNING — raw enum in user-facing copy**: success toast interpolates the enum directly — `Role pengguna berhasil diperbarui menjadi ${newRole}.` renders `...menjadi ADMIN.` (`user-list.tsx:93`). Should map to the localized label already used in the `<option>`s.
- **WARNING — mixed language**: `Role:` label (`user-list.tsx:259`), tab `"Audit Trail"` (`admin-tabs.tsx:92`), and toast noun `"Role"` sit inside an otherwise Indonesian UI (`"Daftar Pengguna"`, `"Tautan Undangan"`, `"Peran"/"Hak Akses"` would be consistent).
- **WARNING — terminology collision**: metric card reads `"Superadmin"` (`page.tsx:112`), badge/role vocabulary says `"Admin"`, header says `"Administrasi Sistem"`. The same privilege level is named three ways.
- **WARNING — role option glosses may misinform**: `Admin (Penuh)`, `Operator (Baca)`, `Member (Mandiri)` (`user-list.tsx:272-274`) assert capability semantics the UI never verifies; if OPERATOR can mutate anything, "Baca" is false advertising.
- Network catch uses generic `"Terjadi kesalahan jaringan."` (`user-list.tsx:97`) — acceptable but loses the server detail.

### Pillar 2: Visuals (3/4)

**Passes**
- Strong top-down hierarchy: uppercase pill badge → `text-3xl` serif h1 → `text-sm` muted lede → 4-up metric grid → tabbed body (`page.tsx:76-136`).
- Role badges are icon+label differentiated by hue and shape, not color alone: ShieldCheck/Admin, Radio/Operator, User/Member (`user-list.tsx:207-224`).
- Avatar fallback renders initials, not a broken image (`user-list.tsx:194-197`).
- No unlabeled icon-only buttons — every icon is paired with text.

**Findings**
- **WARNING — "timeline" is not a timeline**: `AuditTrailList` renders independent `Card`s in `space-y-3` (`audit-trail-list.tsx:158-173`). The plan/CONTEXT promised a "linimasa" (`18-CONTEXT.md:17-20`); no vertical rail, connector, date grouping, or ordering affordance exists to make the sequence legible as an audit trail.
- **WARNING — primary-action under-weight**: the role `<select>` is `text-xs`, `py-1`, ~28px tall (`user-list.tsx:270`), smaller than nearby passive metadata chips, so the one interactive control on the card has the least visual weight. Also below DESIGN's 40px input height.
- Detail expand uses `hover:underline` on a `text-[11px]` coral link (`audit-trail-list.tsx:226`) — low-affordance for the only way to see mutation payloads.

### Pillar 3: Color (2/4)

**Evidence — non-token colors (9 matches)**
- `audit-trail-list.tsx:49` `bg-emerald-500/15 text-emerald-700 dark:text-emerald-400`
- `audit-trail-list.tsx:65` `bg-amber-500/15 text-amber-700 dark:text-amber-400`
- `user-list.tsx:110` `bg-emerald-500/10 text-emerald-700 dark:text-emerald-300`
- `user-list.tsx:214` `bg-amber-500/15 ... dark:text-amber-400`
- `user-list.tsx:228` `text-emerald-600 dark:text-emerald-400 bg-emerald-500/10`
- `page.tsx:118` `bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`

None of these map to `{colors.success}` (#5db872), `{colors.accent-amber}` (#e8a55a), or `{colors.error}` (#c64545). They are Tailwind default palette, and `emerald` is a hue the DESIGN doc never sanctions ("Cream + coral + dark navy is the trinity. Don't introduce a fourth surface tone").

**Findings**
- **WARNING — accent spread**: coral `primary` appears across 11+ distinct element families — header badge (`page.tsx:78`), 3 of 4 metric icon tiles (`page.tsx:98,108,128`), active tab text + underline (`admin-tabs.tsx:35,52`), counter pills (`admin-tabs.tsx:45`), filter-pill active (`user-list.tsx:147`), search focus ring (`user-list.tsx:270`), avatar fallback bg (`user-list.tsx:195`), Admin badge (`user-list.tsx:208`), link buttons (`audit-trail-list.tsx:226`), focus ring. DESIGN: "Don't put coral everywhere ... scarce on individual elements." On this dashboard coral reads as the default utility tint rather than brand voltage.
- **WARNING — semantic color overload**: success green, amber, destructive red, and coral are all in play in one view (audit badges + role badges + metric tile), with no single reserved meaning.
- No raw hex found in the phase files (styles route through CSS vars) — positive.

### Pillar 4: Typography (2/4)

**Size distribution across `src/app/dashboard/invitations/*.tsx`**
`text-xs` 29 · `text-[11px]` 18 (arbitrary) · `text-sm` 11 · `text-2xl` 4 · `text-xl` 2 · `text-3xl` 1 → **6 distinct sizes**, above the ≤4 threshold.

**Weight distribution**
`font-medium` 39 · `font-semibold` 14 · `font-bold` 11 → **3 weights**, above ≤2.

**Findings**
- **WARNING — forbidden serif bold**: `text-3xl font-serif font-bold` (`page.tsx:87`) and every metric numeral `text-2xl font-serif font-bold` (`page.tsx:103,113,123,133`). DESIGN is explicit: "Don't bold serif display weight. Copernicus at 700 reads as bombastic; the system stays at 400," and display sizes carry negative letter-spacing, none of which is applied. Also `text-xl font-serif font-bold` section heads (`page.tsx:153,172`).
- **WARNING — arbitrary micro-size**: `text-[11px]` used 18× for badges, captions, timestamps (`user-list.tsx:208-233,288-301`; `audit-trail-list.tsx:49-241`). Off-scale and unthemed; should collapse to `text-xs` (12px) or `{typography.caption}` (13px).
- `font-mono` applied to audit action badges and emails (`audit-trail-list.tsx:49,65,72`) mixes monospace into a label role it isn't meant for — body is StyreneB/Inter; mono is reserved for code.
- Positive: serif/sans split otherwise respected (h1 + section heads serif, body/UI sans).

### Pillar 5: Spacing (3/4)

**Findings**
- Off-scale (not 4px-multiple) values recur: `p-4.5` (`audit-trail-list.tsx:178`), `gap-3.5` (`user-list.tsx:185,256`), `gap-2.5` (`audit-trail-list.tsx:183`), `p-2.5` (`page.tsx:98,108,118,128`), `px-2.5` (`page.tsx:78`; `user-list.tsx:270`), `py-1.5` (`user-list.tsx:284`). None map to the `{spacing}` scale (xxs 4 / xs 8 / sm 12 / md 16 / lg 24 / xl 32).
- `px-2.5 py-1` role selector (`user-list.tsx:270`) yields a ~28px control vs. the DESIGN 40px `{component.text-input}` height.
- Positive: radius usage is coherent — `rounded-lg`/`rounded-xl`/`rounded-2xl` on cards and controls, `rounded-full` on pills/counters, matching the hierarchical radius rule. Card padding `p-4 sm:p-5` and `p-4 sm:p-4.5` are close to a consistent rhythm.
- Positive: no arbitrary bracketed spacing values (`[Npx]`) in the phase files — drift is limited to fractional Tailwind steps.

### Pillar 6: Experience Design (2/4)

**State coverage present**
- Loading: `updatingId` + `Loader2 animate-spin` overlay + `disabled` select (`user-list.tsx:268,276-278`).
- Success/error alert with dismiss (`user-list.tsx:106-123`); empty states in both lists; self-lockout selector replaced by `(Akun Anda)` (`user-list.tsx:260-263`); server-side authorization + self-lockout guard (`users.ts:28-45`); audit logging on every mutation (`users.ts:63-76`).
- Audit detail toggle expand/collapse with chevron state (`audit-trail-list.tsx:222-235`).

**Findings**
- **BLOCKER (interaction) — no confirmation for privilege mutation**: changing a role is irreversible from the UI (no undo, no history restore) yet fires on `onChange` with zero confirmation (`user-list.tsx:269`). This is the highest-risk interaction in the phase.
- **WARNING — no `aria-live`**: the success/error alert (`user-list.tsx:106`) is not announced to screen readers; role-change feedback is silent for AT users.
- **WARNING — unassociated label**: `<label>Role:</label>` (`user-list.tsx:259`) has no `htmlFor`/`id` linking it to the `<select>` (`user-list.tsx:266`).
- **WARNING — no `aria-expanded` / `aria-controls`** on the "Lihat Detail" toggle (`audit-trail-list.tsx:223-234`).
- **WARNING — search inputs rely on placeholder only**: no `aria-label`/visually-hidden label (`user-list.tsx:129`, `audit-trail-list.tsx:116`); placeholder is not an accessible name.
- **WARNING — optimistic update with no rollback path**: local state is mutated only after server `success`, but `revalidatePath` failure/reconciliation lag can leave UI and DB divergent with no `catch` around revalidation (`user-list.tsx:80-94`); the surrounding `try` only guards the network call.
- No React error boundary around either client list — a render error blanks the tab.
- Audit list is capped at `limit: 100` with no pagination or "load more" (`page.tsx:44`); older events are silently unreadable. Counter shows only the truncated set.

---

## Registry Safety

Not applicable — no UI-SPEC.md registry table and `components.json` declares `"registries": {}` (no third-party blocks installed). Registry audit skipped.

---

## Files Audited

- `src/app/dashboard/invitations/page.tsx`
- `src/app/dashboard/invitations/admin-tabs.tsx`
- `src/app/dashboard/invitations/user-list.tsx`
- `src/app/dashboard/invitations/audit-trail-list.tsx`
- `src/app/actions/users.ts`
- Supporting context: `DESIGN.md`, `src/app/globals.css`, `components.json`, `18-01-PLAN.md`, `18-01-SUMMARY.md`, `18-CONTEXT.md`, `18-VERIFICATION.md`