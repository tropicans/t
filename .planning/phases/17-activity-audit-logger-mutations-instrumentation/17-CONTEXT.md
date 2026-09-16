# Phase 17 Context: Activity Audit Logger Engine & Mutations Instrumentation

## Phase Goal
Membangun engine pencatatan log audit `logAuditEvent()` di `src/lib/audit.ts` dan menginstrumentasikannya pada seluruh server actions mutasi (Short Links, Microsites, Invitations) dengan pencatatan rinci mengenai "siapa melakukan apa" serta penegakan batas hak akses mutasi RBAC.

## Decisions & Locked Constraints

1. **Audit Logger Engine (`src/lib/audit.ts`)**:
   - Fungsi `logAuditEvent(params: LogAuditEventInput): Promise<void>`.
   - Data yang dicatat: `userId`, `userEmail`, `userName`, `action`, `entity`, `entityId`, `details`, `ipAddress`.
   - Logging harus non-blocking / resilient (error saat menulis audit log tidak boleh membatalkan aksi pengguna utama, namun dicatat ke console).

2. **Actions to Instrument**:
   - Short Links (`src/app/actions/short.ts`):
     - `createShortLink`: `SHORT_LINK_CREATE` (mencatat shortCode, target URL).
     - `updateShortLink`: `SHORT_LINK_UPDATE` (mencatat perubahan).
     - `deleteShortLink`: `SHORT_LINK_DELETE` (mencatat shortCode yang dihapus).
   - Microsites (`src/app/actions/microsite.ts`):
     - `createMicrosite`: `MICROSITE_CREATE` (mencatat slug, title).
     - `updateMicrosite`: `MICROSITE_UPDATE` (mencatat field yang diubah).
     - `deleteMicrosite`: `MICROSITE_DELETE` (mencatat slug).
     - `saveReorderedLinks`: `MICROSITE_REORDER` (mencatat micrositeId dan jumlah link).
   - Invitations (`src/app/actions/invitations.ts`):
     - `createInvitation`: `INVITATION_CREATE` (mencatat token, maxUses, target email).
     - `revokeInvitation`: `INVITATION_REVOKE` (mencatat token yang dicabut).

3. **RBAC Guard Enforcement on Mutations**:
   - `ADMIN`: Dapat melakukan aksi pada resource apapun.
   - `OPERATOR`: Hanya memiliki hak BACA (read-only). Jika mencoba memanggil aksi mutasi (delete/update link orang lain), ditolak.
   - `MEMBER`: Hanya dapat memodifikasi resource miliknya sendiri.
