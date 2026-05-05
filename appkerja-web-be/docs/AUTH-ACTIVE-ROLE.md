# Role aktif untuk UI (`activeRoleCode` di JWT)

Dokumen ini menjelaskan **claim `activeRoleCode`** pada access token dan refresh token: dipakai untuk **konteks tampilan menu di frontend**, bukan untuk membatasi hak akses API.

## Tujuan

- User yang memiliki **lebih dari satu role** dapat memilih **role aktif** agar UI menampilkan menu yang sesuai per role.
- **Otorisasi API tidak berubah:** `PermissionsGuard` tetap menggabungkan (**union**) permission dari **semua** role user. Memilih satu role **tidak** menghapus permission role lain.
- **UI bukan security boundary:** user bisa secara manual membuka route fitur lain; jika union permission mengizinkan, API tetap merespons sesuai aturan permission.

## Di mana nilai disimpan

| Lokasi | Perilaku |
|--------|----------|
| **Access token (JWT)** | Claim opsional `activeRoleCode` (string, sama dengan `user.roles[].code`). Jika tidak dipilih, claim tidak disertakan. |
| **Refresh token (JWT)** | Sama: claim opsional agar **token rotation** mempertahankan pilihan UI. |
| **Kolom database** | Tidak ada. Field `User.activeRoleCode` di GraphQL hanya **dihidrat dari JWT** di `JwtStrategy` (bukan `@Column`). |
| **Response login / refresh** | `LoginResponse.activeRoleCode` dan `RefreshTokenResponse.activeRoleCode` mengecho nilai yang disematkan (boleh `null`). |

## Validasi

- Setiap penerbitan token (`authLogin`, `authSetActiveRole`, `login` setelah Azure, `refreshToken`), jika `activeRoleCode` diisi non-kosong, nilai **harus** persis salah satu `user.roles[].code`.
- Jika tidak valid → `BadRequestException` dengan pesan bahwa role bukan milik user.

## GraphQL & HTTP

### `authLogin`

Input `AuthLoginInput` memiliki field opsional **`activeRoleCode`**. Setelah kredensial valid, token diterbitkan dengan claim tersebut (jika diisi dan valid).

### `authSetActiveRole`

Mutation **`authSetActiveRole`** (memerlukan JWT): menerima `AuthSetActiveRoleInput.activeRoleCode` wajib, memvalidasi terhadap role user, lalu mengembalikan **`LoginResponse`** baru (`access_token`, `refresh_token`, `user`, `activeRoleCode`). Dipakai saat user **ganti role aktif** tanpa login ulang.

### `authRefreshToken`

Membaca `activeRoleCode` dari refresh token lama; setelah memuat user dari DB, nilai **divalidasi ulang** terhadap role saat ini. Token baru mempertahankan pilihan UI jika masih valid (atau `null` jika token lama tidak punya claim / kosong).

### `usersMe`

Query `usersMe` mengembalikan `user` dari konteks request; **`user.activeRoleCode`** selaras dengan access token saat ini (diset di `JwtStrategy`).

### Azure OAuth callback

`GET /login/azure/callback` mendukung query opsional **`activeRoleCode`** (jika redirect URI / alur Anda mengirimkannya). Nilai diteruskan ke `AuthService.login` dengan validasi yang sama.

## Alur yang disarankan di frontend

1. Login (`authLogin`) — opsional kirim `activeRoleCode` jika user sudah memilih role di layar login.
2. Atau setelah login, panggil **`authSetActiveRole`** dengan role yang dipilih → simpan `access_token` dan `refresh_token` baru.
3. Render menu berdasarkan **`activeRoleCode`** (mapping statis di FE atau konfigurasi per role).
4. Tetap gunakan **union permission** dari `user.roles` untuk menyembunyikan aksi yang benar-benar tidak diizinkan (UX), mengingat API tetap menegakkan permission.

## Impersonate

Saat **`usersImpersonate`** / **`usersExitImpersonate`**, token baru diterbitkan lewat `login()`; **`activeRoleCode` default tidak dibawa** dari sesi sebelumnya (mulai dari tidak terpilih kecuali nanti ditambahkan di input terpisah).

## Referensi kode

- `src/resources/auth/auth.service.ts` — normalisasi, assert, `generateAccessToken` / `generateRefreshToken`, `login`, `setActiveRole`, `refreshToken`
- `src/resources/auth/strategies/jwt.strategy.ts` — menyematkan `activeRoleCode` ke `request.user`
- `src/resources/auth/dto/auth-login.input.ts`, `auth-set-active-role.input.ts`, `login-response.type.ts`, `refresh-token-response.type.ts`
- `src/resources/users/entities/user.entity.ts` — field GraphQL `activeRoleCode` (tanpa kolom DB)

Lihat juga: [GRAPHQL-NAMING.md](./GRAPHQL-NAMING.md) (pengecualian nama `authSetActiveRole`).
