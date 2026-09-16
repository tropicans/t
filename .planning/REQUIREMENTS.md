# Requirements: Milestone v1.6 — Role-Based Access Control (RBAC) & Audit Activity Trail

## Scope
Menerapkan sistem multi-role access control berbasis database (`ADMIN`, `OPERATOR`, `MEMBER`) dan audit activity logging untuk mencatat "siapa melakukan apa" secara real-time pada aplikasi Taut.

## Requirements

### RBAC Data Model & Auth Synchronization
- [ ] **RBAC-01**: Definisikan enum `Role` (`ADMIN`, `OPERATOR`, `MEMBER`) pada tabel Prisma `User` dengan default `MEMBER`.
- [ ] **RBAC-02**: Sinkronisasi role saat Google OAuth sign-in (`src/lib/auth.ts`):
  - Email di `ALLOWED_EMAILS` di-bootstrap menjadi `ADMIN`.
  - Email di `GLOBAL_DASHBOARD_VIEWER_EMAIL` di-bootstrap menjadi `OPERATOR`.
  - User baru via invitation atau existing member tetap `MEMBER` (kecuali diubah oleh admin di database).
  - Simpan dan teruskan `role` pada JWT session (`session.user.role`).
- [ ] **RBAC-03**: Terapkan permission boundaries di server actions dan page loader:
  - `ADMIN`: Akses penuh (CRUD semua links/microsites, ubah role user, kelola undangan, lihat audit trail).
  - `OPERATOR`: Hak baca global (Overview, Analytics, All Links, All Microsites), dilarang menghapus link/microsite milik orang lain, dilarang mengubah role, dilarang mengakses audit log.
  - `MEMBER`: Terisolasi hanya ke link dan microsite miliknya sendiri.

### Audit Activity Logging Engine
- [ ] **AUDIT-01**: Definisikan model `AuditLog` di Prisma schema: `id`, `userId`, `userEmail`, `userName`, `action`, `entity`, `entityId`, `details` (JSON), `ipAddress`, dan `createdAt`.
- [ ] **AUDIT-02**: Buat helper server-side `logAuditEvent()` di `src/lib/audit.ts` yang atomic dan resilient terhadap kegagalan log.
- [ ] **AUDIT-03**: Pasang instrumentasi `logAuditEvent()` pada seluruh server actions mutasi:
  - Short Link: Buat, Perbarui, Hapus (`SHORT_LINK_CREATE`, `SHORT_LINK_UPDATE`, `SHORT_LINK_DELETE`).
  - Microsite: Buat, Perbarui, Hapus, Reorder (`MICROSITE_CREATE`, `MICROSITE_UPDATE`, `MICROSITE_DELETE`, `MICROSITE_REORDER`).
  - Invitation: Terbitkan, Revoke (`INVITATION_CREATE`, `INVITATION_REVOKE`).
  - User Management: Ubah role (`USER_ROLE_CHANGE`).

### Dashboard UI & Management
- [ ] **UI-01**: Antarmuka Manajemen Role pada tab Users di `/dashboard/invitations`:
  - Menampilkan badge role saat ini (`ADMIN`, `OPERATOR`, `MEMBER`).
  - Admin dapat mengubah role user lain via dropdown selector dengan Server Action `updateUserRole`.
  - Mencegah admin mengubah rolenya sendiri menjadi non-admin agar tidak terkunci (*self-lockout protection*).
- [ ] **UI-02**: Tampilan Audit Trail Timeline di Dashboard:
  - Tab atau subhalaman baru "Audit Trail" khusus untuk role `ADMIN`.
  - Menampilkan linimasa aktivitas: waktu, pelaku (avatar/nama/email), jenis tindakan, entitas sasaran, dan ringkasan detail perubahan.
  - Mendukung filter berdasarkan tipe aksi / pencarian user.

### Verification & Automated Testing
- [ ] **TEST-01**: Test suite Vitest komprehensif menguji:
  - RBAC permission guards (Admin allowed, Operator read-only, Member isolated).
  - Self-lockout prevention pada perubahan role.
  - Pencatatan event `logAuditEvent` pada setiap mutasi.
  - Auth callback role resolution and JWT token decoration.

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| RBAC-01 | Phase 16 | Pending |
| RBAC-02 | Phase 16 | Pending |
| RBAC-03 | Phase 16, 17 | Pending |
| AUDIT-01 | Phase 16 | Pending |
| AUDIT-02 | Phase 17 | Pending |
| AUDIT-03 | Phase 17 | Pending |
| UI-01 | Phase 18 | Pending |
| UI-02 | Phase 18 | Pending |
| TEST-01 | Phase 16, 17, 18 | Pending |

**Coverage:**
- v1.6 requirements: 9 total
- Mapped to phases: 9
- Unmapped: 0 ✓
