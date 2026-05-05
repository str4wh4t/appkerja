# Tenancy Shared Schema

Dokumen ini menjelaskan aturan implementasi tenancy dengan model shared database + shared schema di backend.

## Keputusan Arsitektur

- Tenant context request menggunakan pendekatan **Opsi 1 (implicit)**.
- Sumber tenant context adalah claim JWT `activeTenantId`.
- Perubahan tenant aktif dilakukan lewat endpoint auth (`authSetActiveTenant`), bukan lewat input tenant pada mutation umum.

## Model Data

- `users` dan `tenants` berelasi many-to-many melalui tabel `user_tenants`.
- `roles` bersifat global (tidak punya kolom `tenantId`).
- `permissions` bersifat global (tidak punya kolom `tenantId`).
- Tenancy assignment disimpan di tabel pivot:
  - `user_roles.tenantId`
  - `role_permissions.tenantId`

## Aturan Otorisasi Tenant

- User non-superadmin hanya boleh mengakses tenant yang dimilikinya di `user_tenants`.
- Superadmin tidak wajib punya baris membership di `user_tenants`.
- Meski begitu, superadmin tetap harus membawa `activeTenantId` valid di token.

## Flow Operasional

1. Login menghasilkan token dengan `activeTenantId` default.
2. User dapat mengganti tenant aktif via `authSetActiveTenant`.
3. Server menerbitkan token baru dengan `activeTenantId` terbaru.
4. Mutation tenancy-sensitive mengeksekusi data sesuai tenant aktif tersebut.

## Catatan Implementasi

- Untuk operasi assign role/permission per tenant, tenant context diperlakukan sebagai konteks request aktif.
- Seeder awal menyiapkan tenant default dan relasi awal user-tenant/user-role sesuai kebutuhan bootstrap.
- Semua properti relasi entity tenancy (`users`, `tenants`, `user_tenants`, `user_roles`, dst.) mengikuti tipe `Relation<T>` agar konsisten dengan standar ESM TypeORM.
- Referensi: [TypeORM FAQ - How to use TypeORM in ESM projects](https://typeorm.io/docs/help/faq#how-to-use-typeorm-in-esm-projects).

## Google SSO (Tenant Context)

- Inisiasi OAuth memakai endpoint `GET /auth/:tenantId/google`.
- Callback Google tetap statis di `GET /auth/google/callback`; konteks tenant dibawa aman melalui `state` yang ditandatangani backend.
- Setelah callback valid:
  - user disinkronkan dari profil Google,
  - membership `user_tenants` ke tenant aktif dipastikan ada,
  - role `guest` dipastikan terpasang di `user_roles` untuk tenant tersebut.
- Backend tidak mengirim access/refresh token di URL callback FE. Backend mengirim one-time `code` untuk ditukar melalui `POST /auth/google/exchange-code`.
- Dokumen rinci: **[GOOGLE-SSO-TENANT-LOGIN.md](./GOOGLE-SSO-TENANT-LOGIN.md)**.
