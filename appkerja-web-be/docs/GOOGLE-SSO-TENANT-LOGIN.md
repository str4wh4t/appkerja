# Google SSO Tenant Login

Dokumen ini menjelaskan implementasi login Google SSO pada backend dengan konteks tenancy shared schema.

## Tujuan

- Mendukung login Google per tenant.
- Menjaga callback OAuth tetap statis (`/auth/google/callback`).
- Menghindari pengiriman access token/refresh token melalui URL redirect frontend.

## Endpoint

- `GET /auth/:tenantId/google`
  - Memulai OAuth Google dengan tenant context.
- `GET /auth/google`
  - Shortcut tanpa tenant explicit; backend fallback ke tenant default.
- `GET /auth/google/callback`
  - Callback statis dari Google.
- `POST /auth/google/exchange-code`
  - Menukar one-time code menjadi access token + refresh token.
- `POST /auth/exchange-code`
  - Alias endpoint exchange-code untuk kompatibilitas.

## Alur Login

1. Frontend memanggil `GET /auth/:tenantId/google`.
2. Backend memvalidasi tenant, lalu membuat `state` signed berisi:
   - `tenantId`
   - `nonce`
   - masa berlaku (`expiresIn`)
3. Backend redirect ke halaman login Google.
4. Google callback ke `GET /auth/google/callback` dengan `code` dan `state`.
5. Backend:
   - memverifikasi `state`,
   - menukar `code` ke token Google,
   - membaca profil user dari Google userinfo endpoint,
   - menolak login jika `email_verified !== true`,
   - sinkronisasi user lokal (`syncFromGoogle`),
   - memastikan membership `user_tenants` ke tenant aktif,
   - memastikan role `guest` di `user_roles` untuk tenant aktif.
6. Backend membuat one-time login code (single-use, TTL pendek).
7. Backend redirect ke frontend URL login dengan query:
   - `success=true`
   - `code=<one_time_code>`
   - `tenantId=<tenant_id>`
8. Frontend memanggil `POST /auth/google/exchange-code` untuk menukar code menjadi token aplikasi.

## Keamanan

- Callback tenant context tidak diambil dari path callback, tetapi dari `state` signed.
- Access token dan refresh token tidak dikirim melalui URL redirect.
- One-time code bersifat:
  - sekali pakai (single-use),
  - berumur pendek (default 60 detik),
  - disimpan di Redis jika tersedia, fallback ke in-memory store jika Redis tidak aktif.

## Tenant Resolution

- `GET /auth/:tenantId/google` mencoba tenant berdasarkan nilai path.
- Jika tenant tidak ditemukan, backend fallback ke `DEFAULT_TENANT_CODE` (default: `default`).
- Jika tenant default juga tidak ada, request ditolak.

## Dependensi Data

- Tenant target harus ada dan tidak soft-deleted.
- Role `guest` harus tersedia di tabel `roles`.
- User status harus `active`.

## Konfigurasi Environment

Variabel yang dipakai:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `GOOGLE_STATE_SECRET`
- `GOOGLE_STATE_EXPIRES_IN` (default `10m`)
- `GOOGLE_LOGIN_CODE_EXPIRES_IN_MS` (default `60000`)
- `DEFAULT_TENANT_CODE` (default `default`)
- `FRONTEND_URL_LOGIN`

## Catatan Frontend

- Setelah menerima `code`, frontend harus segera menukar code ke backend.
- Setelah berhasil exchange, frontend disarankan membersihkan query URL (`history.replaceState`) agar code tidak tertinggal di browser history.
