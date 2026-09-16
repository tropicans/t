# Phase 16 Context: RBAC & Audit Data Model, Migration & Auth Synchronization

## Phase Goal
Mendefinisikan skema Prisma untuk multi-role (enum `Role`: `ADMIN`, `OPERATOR`, `MEMBER`) dan model `AuditLog`, memperbarui Prisma client, serta mengintegrasikan resolusi role pada autentikasi Google OAuth NextAuth (JWT dan Session).

## Decisions & Locked Constraints

1. **Role Definition**:
   - `ADMIN`: Memiliki hak penuh atas seluruh data dan manajemen pengguna/sistem.
   - `OPERATOR`: Memiliki hak baca global (Overview, Analytics, All Links, All Microsites), namun tidak dapat mengubah role orang lain atau mengakses audit log.
   - `MEMBER`: User biasa, hanya dapat mengakses dan mengelola resource miliknya sendiri.

2. **Schema Prisma**:
   - Enum `Role { ADMIN, OPERATOR, MEMBER }`
   - Field `User.role Role @default(MEMBER)`
   - Model `AuditLog` dengan relasi opsional ke `User` (`userId`, `userEmail`, `userName`, `action`, `entity`, `entityId`, `details`, `ipAddress`, `createdAt`).

3. **Bootstrap & Auth Synchronization**:
   - Saat user sign in dengan Google OAuth:
     - Jika email user terdaftar di `ALLOWED_EMAILS` -> role diset menjadi `ADMIN` (jika belum atau jika role masih MEMBER).
     - Jika email user terdaftar di `GLOBAL_DASHBOARD_VIEWER_EMAIL` dan bukan `ADMIN` -> role diset menjadi `OPERATOR`.
     - User baru dari invitation -> role default `MEMBER`.
   - Token JWT dan Session NextAuth mengekspos `session.user.role: Role` dan `session.user.isAdmin: boolean`.

4. **Backward Compatibility**:
   - Fungsi pembantu `isUserAdmin(email)` tetap kompatibel.
   - Tambahkan helper `getUserRole(email)` dan `isUserOperator(email)`.
