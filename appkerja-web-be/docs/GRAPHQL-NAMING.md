# Pola penamaan GraphQL (Query & Mutation)

Dokumen ini menjelaskan konvensi nama **operation** GraphQL di API ini agar konsisten: **nama resource (jamak) + kata kerja**, dalam **camelCase**.

## Prinsip

| Bagian | Aturan | Contoh |
|--------|--------|--------|
| **Resource** | Nama domain **jamak** (sesuai modul/koleksi), camelCase | `achievements`, `users`, `approvalNotifications`, `userRoleScopes`, `approvalStepHasRoles` |
| **Verb** | Kata kerja / frasa tindakan (PascalCase digabung tanpa spasi) | `FindOne`, `FindAllPaginated`, `Create`, `Submit`, `Approve`, `MarkAsRead` |

**Format gabungan:** `{resourcePlural}{Verb}`

Contoh:

- `achievementsFindOne` — resource `achievements`, aksi `FindOne`
- `approvalNotificationsCountUnread` — resource `approvalNotifications`, aksi `CountUnread`

Selalu set **`name`** eksplisit pada decorator:

```typescript
@Query(() => Achievement, { name: 'achievementsFindOne', nullable: true })
@Mutation(() => Achievement, { name: 'achievementsSubmit' })
```

## Query — contoh yang dipakai

| Pola | Contoh |
|------|--------|
| Daftar / pagination | `achievementsFindAllPaginated`, `usersFindAllPaginated`, `countriesFindAllPaginated` |
| Satu entitas | `achievementsFindOne`, `achievementDocumentsFindOne` (resource = `achievementDocuments`) |
| Filter / relasi | `approvalLogsFindByAchievementId`, `approvalStepHasRolesFindAll`, `userRoleScopesFindByUserRole` |
| Khusus domain | `approvalNotificationsFindMine`, `approvalNotificationsCountUnread` |
| Hierarki | `unitsFindDescendants`, `unitsFindAncestors` |

## Mutation — contoh yang dipakai

| Pola | Contoh |
|------|--------|
| CRUD | `achievementsCreate`, `achievementsUpdate`, `achievementsDelete`, `achievementsRestore` |
| Alur bisnis | `achievementsSubmit`, `achievementsApprove`, `achievementsReject`, `achievementsScore` |
| Relasi / utility | `usersAssignRoles`, `rolesAssignPermissions`, `approvalStepHasRolesAssign` |
| Notifikasi | `approvalNotificationsMarkAsRead`, `approvalNotificationsMarkAllAsRead` |

## Pengecualian (disengaja)

| Nama | Alasan |
|------|--------|
| `authLogin`, `authRefreshToken`, `authSetActiveRole` | Namespace modul **auth**, bukan entity jamak. |
| `usersImpersonate`, `usersExitImpersonate` | Tetap memakai prefix `users` + verb (sesuai domain User). |
| `usersMe` | Shortcut untuk user sesi saat ini; lebih pendek daripada `usersFindMe`. |
| `mhsFindAllPaginated`, `pegawaiFindAllPaginated` | Nama resource domain singkatan (mahasiswa / pegawai), bukan plural Inggris penuh. |

## Yang bukan nama operation

Argumen dan **input types** tetap mengikuti DTO (mis. `userAssignRolesInput`, `achievementCreateInput`) — itu **bukan** pola `{resource}{Verb}` untuk nama field operation.

## Cek konsistensi

Daftar lengkap operation ada di **`src/schema.gql`** (`type Query`, `type Mutation`). Setelah menambah resolver baru, pastikan `name:` mengikuti pola di dokumen ini.

Lihat juga: [Module Structure Pattern](./MODULE-STRUCTURE-PATTERN.md) (pemisahan `*.query.ts` / `*.mutation.ts`).
