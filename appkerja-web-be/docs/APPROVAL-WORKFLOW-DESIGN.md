# Approval Workflow Design (Achievement)

Dokumen ini menyimpan rancangan proses approval untuk data achievements.

**Status: Sudah diimplementasikan**

## Tujuan

- Menyediakan workflow approval yang generik dan bisa dipakai lintas resource.
- Fase pertama difokuskan untuk approval data `achievements`.
- Menjamin kontrol akses approval berbasis role per step.

## Ruang Lingkup Fase Ini

- Definisi status approval.
- Definisi approval type, approval step, dan mapping step ke role.
- Definisi alur mutation `submit`, `approve`, `reject`.
- Definisi struktur log approval.

---

## Master Data

### 1) `approval_types` (full normalisasi)

Kolom inti:

- `id` (PK)
- `code` (unique), contoh: `achievement`
- `name`

Catatan:

- Untuk fase achievement, cukup ada satu type (`achievement`).
- Tetap dipisah agar reusable untuk resource lain di masa depan.

### 2) `approval_statuses`

Kolom inti:

- `id` (PK)
- `code` (unique)
- `name`

Nilai status yang disepakati:

- `draft`
- `ongoing`
- `approved`
- `rejected`

Catatan:

- Tidak perlu kolom `description`.

### 3) `approval_steps`

Kolom inti:

- `id` (PK)
- `approvalTypeId` (FK -> `approval_types.id`, RESTRICT delete)
- `approvalName` - nama step, contoh: "Approval Dekan", "Approval Rektor"
- `sort` (urutan step)

Kaidah:

- Unique gabungan: (`approvalTypeId`, `sort`).
- Full normalisasi (tidak menyimpan `approvalTypeName`).

### 4) `approval_step_has_roles`

Tabel pivot many-to-many antara step dan role.

Kolom inti:

- `id` (PK)
- `approvalStepId` (FK -> `approval_steps.id`, CASCADE delete)
- `roleId` (FK -> `roles.id`, CASCADE delete)
- `createdAt`

Kaidah:

- Satu step boleh punya banyak role.
- Unique gabungan: (`approvalStepId`, `roleId`).

Aturan API:

- Tidak perlu mutation create/remove per-row.
- Cukup mutation update bulk:
  - input: `approvalStepId`, `roleIds: [Int!]!`
  - perilaku: replace seluruh role mapping pada step tersebut.

### 5) `approval_logs`

Tabel histori aksi approval.

Kolom inti:

- `id` (PK)
- `achievementId` (FK -> `achievements.id`, CASCADE delete)
- `approvalTypeId` (FK -> `approval_types.id`, RESTRICT delete)
- `approvalStepId` (FK nullable -> `approval_steps.id`, SET NULL on delete)
- `approvalStatusId` (FK -> `approval_statuses.id`, RESTRICT delete) status setelah aksi
- `action` (`submit`, `approve`, `reject`)
- `userId` (FK -> `users.id`, RESTRICT delete)
- `note` (nullable, wajib untuk reject)
- `createdAt`

### 6) `approval_notifications`

Tabel untuk menyimpan notifikasi approval yang ditujukan kepada user.

Kolom inti:

- `id` (PK)
- `achievementId` (FK -> `achievements.id`, CASCADE delete)
- `approvalStepId` (FK nullable -> `approval_steps.id`, SET NULL on delete)
- `roleId` (FK nullable -> `roles.id`, CASCADE delete)
- `userId` (FK nullable -> `users.id`, CASCADE delete)
- `message` (varchar 500)
- `isRead` (boolean, default false)
- `createdAt`

**Penggunaan kolom `roleId` dan `userId`:**

| Skenario | `roleId` | `userId` | Keterangan |
|----------|----------|----------|------------|
| Submit / Approve (ke step berikutnya) | Terisi | NULL | Notifikasi dibuat per-role yang ada di step berikutnya. User yang memiliki role tersebut akan melihat notifikasi. |
| Reject | NULL | Terisi | Notifikasi dikirim langsung ke `createdBy` achievement (pembuat record). |

**Catatan:**
- Saat query notifikasi untuk user, sistem akan mencari notifikasi dimana:
  - `userId` = ID user yang login, ATAU
  - `roleId` IN (role-role yang dimiliki user)
- Notifikasi di-delete otomatis saat achievement berpindah step (untuk menghindari notifikasi stale).

---

## Pengaturan periode dan achievement

Tabel **`period_settings`** menyimpan rentang kalender per periode (nama, `periodStartDate`, `periodEndDate`, `periodYear`) dan flag **`isActive`** (boolean, default **`true`**). Kolom ini didefinisikan di migration **`1742000000000-CreatePeriodSettingsTable`** bersama pembuatan tabel. Database yang sudah dibuat **sebelum** kolom ini ada perlu diselaraskan manual (misalnya `ALTER TABLE` menambah `isActive` dengan default `true`) agar selaras dengan entity TypeORM.

### Aturan penempatan `periodSettingId` pada achievement

- Saat **create** atau **update** achievement, sistem menentukan **`periodSettingId`** dari baris `period_settings` yang:
  - **`isActive = true`**, dan
  - **`endDate`** achievement berada di dalam rentang **`periodStartDate`–`periodEndDate`** (inklusif), biasanya dicek dengan kondisi setara *`endDate` BETWEEN tanggal mulai dan selesai periode*.
- Periode dengan **`isActive = false`** tidak dipakai untuk penempatan; achievement tidak boleh “masuk” periode nonaktif.
- Jika **tidak ada** periode aktif yang memenuhi syarat, penyimpanan achievement **ditolak** (respons kesalahan klien / `BadRequestException` dengan pesan yang menjelaskan bahwa tanggal selesai tidak berada dalam periode pengaturan yang aktif).
- Pada **update**, yang dipakai adalah **tanggal selesai efektif** (nilai baru bila `endDate` ikut diubah, atau nilai yang sudah tersimpan bila tidak), sehingga setiap simpan tetap memvalidasi ulang terhadap periode aktif.

Implementasi: `AchievementsService` (resolver `periodSettingId` berdasarkan `endDate`), entity `PeriodSetting`, `PeriodSettingsService` untuk CRUD pengaturan periode.

---

## Perubahan pada `achievements`

Kolom tambahan yang dibutuhkan:

- `approvalTypeId` (FK -> `approval_types.id`, RESTRICT delete)
- `approvalStatusId` (FK -> `approval_statuses.id`, RESTRICT delete)
- `currentApprovalSort` (nullable int)

Makna:

- `approvalTypeId` = jenis approval yang digunakan (untuk achievement, nilainya adalah ID dari type `achievement`).
- `approvalStatusId` = status proses saat ini (`draft`, `ongoing`, `approved`, `rejected`).
- `currentApprovalSort` = posisi step aktif saat `ongoing`, `null` saat `draft`/`approved`/`rejected`.

---

## Alur Mutasi Approval

### A) `achievementsCreate`

State awal:

- `approvalStatus = draft`
- `currentApprovalSort = null`

### B) `achievementsSubmit`

Prasyarat:

- status saat ini harus **`draft`** atau **`rejected`** (setelah ditolak, pembuat memperbaiki data lalu mengajukan ulang dari awal).
- hanya **`createdBy`** yang boleh memanggil.

Efek:

- `approvalStatus = ongoing`
- `currentApprovalSort = 1`
- insert log action `submit`.

### C) `achievementsApprove`

Prasyarat:

- status saat ini harus `ongoing`.
- `currentApprovalSort` tidak null.
- user memiliki role yang diizinkan pada step aktif (`approval_step_has_roles`).

Efek:

- Jika masih ada step berikutnya:
  - `currentApprovalSort = current + 1`
  - status tetap `ongoing`
- Jika step aktif adalah step terakhir:
  - `approvalStatus = approved`
  - `currentApprovalSort = null`
- insert log action `approve`.

### D) `achievementsReject`

Prasyarat:

- status saat ini harus `ongoing`.
- user memiliki role yang diizinkan pada step aktif.
- `note` wajib diisi.

Efek:

- `approvalStatus = rejected` (bukan `draft`, agar riwayat penolakan tetap terbaca dari status)
- `currentApprovalSort = null`
- insert log action `reject`.

Setelah ditolak, pembuat boleh **`achievementsUpdate`** lalu **`achievementsSubmit`** lagi untuk memulai alur approval dari step 1. **`achievementsDelete`** tetap hanya diperbolehkan saat status **`draft`** (bukan `rejected`).

### E) `achievementsUpdate`

Prasyarat (di luar permission `achievements.update`):

- Hanya user yang sama dengan **`createdBy`** (pembuat achievement) yang boleh memanggil mutation ini.
- **`approvalStatus`** harus **`draft`** atau **`rejected`**. Jika **`ongoing`**, pembuat harus menunggu approve/reject. Jika **`approved`**, data tidak diubah lewat mutation ini (sesuai kebijakan bisnis).

Ringkas: selama dalam antrian approval aktif (`ongoing`), isi achievement tidak bisa diubah. Setelah **`rejected`**, pembuat dapat memperbaiki data lalu submit ulang (lihat **B**).

### F) `achievementsDelete` (soft delete)

Prasyarat (di luar permission `achievements.delete`):

- Hanya **`createdBy`** yang boleh memanggil.
- **`approvalStatus`** harus **`draft`** saja. Achievement berstatus **`rejected`** tidak boleh dihapus lewat mutation ini (harus diperbaiki lewat update atau dibiarkan); status **`ongoing`** / **`approved`** juga tidak boleh dihapus.

Catatan: **`achievementsRestore`** tidak dibahas di sini; aturan restore mengikuti implementasi terpisah bila ada.

---

## Aturan Otorisasi

Untuk `achievementsApprove` dan `achievementsReject`:

1. Ambil step aktif berdasarkan `approvalTypeId + currentApprovalSort`.
2. Ambil seluruh role user yang login.
3. Cek apakah ada intersection dengan role yang terdaftar di `approval_step_has_roles`.
4. Jika tidak ada -> forbidden.

Catatan keamanan:

- Step tanpa role mapping dianggap tidak dapat dieksekusi siapa pun (secure by default).

---

## Catatan Implementasi Teknis

- Gunakan transaction pada mutasi state (`submit`, `approve`, `reject`).
- Disarankan row lock pada record achievement saat transisi untuk mencegah race condition.
- Pastikan idempotency terkontrol (mis. submit ulang saat sudah ongoing harus ditolak).

---

## Migrations

Urutan migration yang sudah dibuat:

1. `1740800000000-CreateApprovalTypesTable.ts`
2. `1740900000000-CreateApprovalStatusesTable.ts`
3. `1740950000000-CreateAchievementsTable.ts` (sudah termasuk kolom approval)
4. `1741000000000-CreateApprovalStepsTable.ts`
5. `1741100000000-CreateApprovalStepHasRolesTable.ts`
6. `1741300000000-CreateApprovalLogsTable.ts`
7. `1741500000000-CreateApprovalNotificationsTable.ts`

---

## Seeders

- `approval-types.seeder.ts` - seed type `achievement`
- `approval-statuses.seeder.ts` - seed 4 status (`draft`, `ongoing`, `approved`, `rejected`)

---

## GraphQL API

Konvensi nama operation (Query & Mutation): **`{resourcePlural}{Verb}`** — lihat [GRAPHQL-NAMING.md](./GRAPHQL-NAMING.md).

### Mutations

`achievementsSubmit` / `achievementsApprove` / `achievementsReject` tidak memakai permission `achievements.update`: cukup user terautentikasi (JWT). **Submit**: hanya jika `userId` = `createdBy`; dari status **`draft`** atau **`rejected`**. **Approve / reject**: otorisasi lewat **role pada step aktif** (`approval_step_has_roles`).

**Update & hapus** (lihat juga bagian **E** dan **F** di atas):

- `achievementsUpdate` membutuhkan permission `achievements.update`; **hanya pembuat**; status **`draft`** atau **`rejected`**.
- `achievementsDelete` membutuhkan permission `achievements.delete`; **hanya pembuat**; status **`draft`** saja (bukan `rejected`).

- `achievementsSubmit(id: ID!)` - submit atau resubmit untuk approval (dari `draft` / `rejected`)
- `achievementsApprove(id: ID!)` - approve step aktif
- `achievementsReject(input: AchievementRejectInput!)` - reject dengan note wajib
- `achievementsScore(input: AchievementScoreInput!)` - beri skor pada achievement
- `approvalStepHasRolesAssign(input: ApprovalStepRolesAssignInput!)` - bulk assign role mapping per step
- `approvalNotificationsMarkAsRead(id: Int!)` - tandai satu notifikasi sebagai sudah dibaca
- `approvalNotificationsMarkAllAsRead` - tandai semua notifikasi user sebagai sudah dibaca

### Queries

- `approvalLogsFindByAchievementId(achievementId: ID!)` - lihat histori approval
- `approvalStepHasRolesFindAll(approvalStepId: Int)` - lihat role mapping (filter opsional per step), atau field nested `approvalStepHasRoles` pada `ApprovalStep` / `achievement.approvalSteps`
- `approvalNotificationsFindMine` - lihat notifikasi untuk user yang login (berdasarkan userId atau roleId)
- `approvalNotificationsCountUnread` - hitung jumlah notifikasi yang belum dibaca
