# SIPEMU FE Development Notes

Dokumen ini merangkum pola implementasi, service, dan keputusan teknis yang sudah diterapkan selama proses development saat ini.

## 1) Stack dan Arsitektur

- Frontend framework: Nuxt 3 (SPA mode, `ssr: false`).
- UI framework: Vuetify 3.
- State management: Pinia.
- API layer: Apollo Client + GraphQL.
- Containerization: Docker + Docker Compose (`dev` dan `prod` profile).

## 2) Pattern yang Dipakai

### A. GraphQL Service Layer Pattern

- Semua call API dibungkus di layer service (`services/graphql/*`), bukan langsung di komponen.
- `gqlQuery` dan `gqlMutation` jadi helper standar untuk query/mutation.
- Error dinormalisasi via `normalizeGraphQLError` agar komponen menerima format error yang konsisten.

### B. Auth Token Flow Pattern

- Login credentials menghasilkan `access_token` dan `refresh_token`.
- Token disimpan di browser storage.
- Header `Authorization` diinjeksi otomatis melalui Apollo `authLink`.
- Saat `UNAUTHENTICATED`/`401`, `errorLink` memicu refresh token otomatis lalu retry request.
- Terdapat guard halaman dashboard untuk memastikan route protected hanya bisa diakses user login.

### C. Runtime Config Pattern

- Konfigurasi publik dipusatkan di `runtimeConfig.public`:
  - `graphqlEndpoint`
  - `ssoLoginUrl`
  - `appName`
  - `appUrl`
- Nilai berasal dari environment variable agar mudah beda antar environment.

### D. UI/UX Pattern

- Branding aplikasi menggunakan `APP_NAME`.
- Profile area menggunakan data user login dari query `usersMe`.
- Dev overlay pasca login (Lottie) dikontrol via flag `sessionStorage`.
- Dashboard dev panel hanya muncul pada environment development.
- **Konvensi form dialog, tema tombol footer, snackbar, dan status tabel:** lihat [`docs/UI-CONVENTIONS.md`](./UI-CONVENTIONS.md) (referensi implementasi: `pages/users/index.vue`, `pages/roles/index.vue`).
- **Form create/update (`v-form`, rules, submit, error di dialog):** lihat [`docs/FORM-UI-UX.md`](./FORM-UI-UX.md) — sertakan **`validate-on="input lazy"`** pada `v-form` (tanpa `input eager` per field) agar error tidak muncul saat dialog baru dibuka; referensi: Users/Units/Tenants, profil (`ProfileAccountTab.vue`), onboarding (`complete-google-profile.vue`).

## 3) Service dan Modul Utama

- `plugins/apollo.client.ts`
  - Inisialisasi Apollo Client.
  - Inject access token.
  - Handle refresh flow + retry operation.

- `services/graphql/client.ts`
  - Wrapper query/mutation (`gqlQuery`, `gqlMutation`).
  - Normalisasi error.

- `services/graphql/auth.service.ts`
  - `loginWithCredentials()`
  - `refreshAuthToken()`
  - `getUserMe()`
  - `exchangeSsoToken()` (REST exchange one-time code ke `POST /auth/exchange-code`)

- `services/graphql/error-handler.ts`
  - Menyatukan berbagai bentuk error resolver/network menjadi format standar.

- `middleware/auth.ts` + inline route middleware dashboard
  - Proteksi route dashboard.
  - Redirect ke login dengan query `redirect`.

## 4) Implementasi UI yang Sudah Diterapkan

- Login page custom:
  - Username/email validation.
  - Password visibility toggle.
  - Error backend ditampilkan inline.
  - SSO button custom Microsoft.

- Dashboard custom:
  - Route dedicated: `/dashboards/dashboard`.
  - Sidebar minimal (Home/Dashboard).
  - Header minimal (search, dark mode, notification, profile).
  - Dev-only auth debug panel.
  - Overlay Lottie sesudah login sukses (sekitar 2 detik).

- Profile dropdown:
  - Data user live dari `usersMe`.
  - Item `My Notes` dan `My Tasks` dihapus.
  - Logout sudah aktif.
  - Avatar menggunakan initials (tanpa foto).

## 5) Catatan Operasional Development

- Jika dependency baru tidak terbaca di container dev:
  - lakukan rebuild `docker compose --profile dev down && docker compose --profile dev up -d --build`.
- Jika error middleware named tidak terbaca pada runtime:
  - gunakan inline middleware per page sebagai fallback aman.

## 6) Docker Compose Flow

- Development mode (hot reload) pada `http://localhost:8088`:
  - `docker compose --profile dev up --build`
- Production-like mode (build + serve) pada `http://localhost:3001`:
  - `docker compose --profile prod up --build`
- Menjalankan dua profile sekaligus:
  - `docker compose --profile dev --profile prod up --build`

## 7) Runtime Config dan Environment Variables

Runtime config yang dipakai frontend:

- `NUXT_PUBLIC_GRAPHQL_ENDPOINT`: endpoint GraphQL untuk Apollo Client.
- `NUXT_PUBLIC_SSO_LOGIN_URL`: URL yang dibuka saat tombol `Login SSO` ditekan.
- `APP_NAME`: nama aplikasi untuk branding UI.
- `APP_URL`: URL aplikasi yang dipakai pada link brand/header.

Catatan:

- Credential login mutation di `services/graphql/auth.service.ts` (`LOGIN_MUTATION`) harus tetap selaras dengan schema backend GraphQL.

## 8) Referensi Environment Variables (aktif)

- `APP_NAME`
- `APP_URL`
- `NUXT_PUBLIC_GRAPHQL_ENDPOINT`
- `NUXT_PUBLIC_SSO_LOGIN_URL`

## 9) Google SSO Callback (One-Time Code)

- FE memulai login SSO melalui URL dari `NUXT_PUBLIC_SSO_LOGIN_URL`.
- Setelah redirect dari backend, halaman login menerima query `code`.
- `AuthLoginForm` otomatis menukar code ke backend lewat `exchangeSsoToken()`:
  - endpoint backend: `POST /auth/exchange-code`
  - hasil: `access_token` + `refresh_token`
- Setelah sukses:
  - token disimpan ke storage FE,
  - query callback dibersihkan dari URL,
  - user diarahkan ke route dashboard/redirect target.

