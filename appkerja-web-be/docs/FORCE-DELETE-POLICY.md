# Force Delete Policy

Dokumen ini mencatat aturan backend untuk **hard delete / force delete** pada resource yang memakai soft delete.

## Scope saat ini

Resource yang mendukung force delete:

- `users`
- `units`
- `tenants`

Mutasi GraphQL:

- Soft delete: `usersDelete`, `unitsDelete`, `tenantsDelete` (permission `*.delete`).
- Force delete: `usersForceDelete(id: ID!): Boolean!`, `unitsForceDelete(id: ID!): Boolean!`, `tenantsForceDelete(id: ID!): Boolean!`

## Aturan utama backend

1. Force delete **hanya boleh** untuk baris yang sudah soft delete (`deletedAt IS NOT NULL`).
2. Jika baris belum soft delete, API mengembalikan `BadRequestException`.
3. Jika baris tidak ditemukan, API mengembalikan `NotFoundException`.
4. Behavior referensi mengikuti aturan FK di database:
   - `ON DELETE CASCADE` → baris turunan ikut terhapus.
   - `RESTRICT`/`NO ACTION` → operasi ditolak.
5. Error FK MySQL (`errno: 1451`) dipetakan ke pesan domain lewat helper `assert-no-foreign-key-violation`.

## Permission

Kode permission force delete:

- `users.force_delete`
- `units.force_delete`
- `tenants.force_delete`

Catatan:

- `superadmin` tetap bypass via `PermissionsGuard`.
- Role lain (mis. `admin`) perlu memiliki permission di atas via seeder role-permissions.

## Soft delete dan status

Saat soft delete, status record harus dibuat nonaktif jika kolom status tersedia:

- `users`: set `statusId` ke status code `inactive` sebelum `softDelete`.
- `units`: set `isActive = false` sebelum `softDelete`.
- `tenants`: tidak memiliki kolom status, langsung `softDelete`.

## Catatan operasional

- Jalankan seeder `permissions` + `role-permissions` setelah perubahan permission force delete.
- Jika soft delete `users` gagal karena status `inactive` tidak ada, jalankan seeder `user-statuses`.
