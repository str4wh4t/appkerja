# AppKerja Monorepo

Monorepo untuk layanan utama AppKerja.

## Struktur Proyek

- `appkerja-web-fe` - Frontend web (Nuxt 3 + Apollo GraphQL client)
- `appkerja-web-be` - Backend API (NestJS + GraphQL)
- `appkerja-mobile` - Aplikasi mobile (incoming)
- `appkerja-desktop` - Aplikasi desktop (incoming)
- `appkerja-storage` - Layanan storage/asset terkait

## Platform Status

- **Web**: channel utama operasional saat ini (`appkerja-web-fe` + `appkerja-web-be`).
- **Mobile**: channel berjalan untuk kebutuhan mobile user (`appkerja-mobile`).
- **Desktop (Incoming)**: folder inisialisasi sudah tersedia (`appkerja-desktop`) dan dipersiapkan sebagai channel tambahan.

## Tech Stack

- **Web Frontend (`appkerja-web-fe`)**: Nuxt 3, Vue 3, TypeScript, Vuetify 3, Apollo Client (GraphQL), SCSS.
- **Backend API (`appkerja-web-be`)**: NestJS, TypeScript, GraphQL, TypeORM.
- **Mobile (`appkerja-mobile`)**: Flutter (Dart).
- **Desktop (`appkerja-desktop`)**: Incoming (stack akan ditetapkan pada fase implementasi).
- **Storage (`appkerja-storage`)**: Layanan penyimpanan aset/file (detail stack mengikuti konfigurasi service).

## Menjalankan Proyek

Masuk ke folder service yang ingin dijalankan, lalu install dependency dan jalankan script sesuai service tersebut.

Contoh:

```bash
cd appkerja-web-fe
npm install
npm run dev
```

atau

```bash
cd appkerja-web-be
npm install
npm run start:dev
```

## Catatan

- Setiap service bisa memiliki `.env` dan dokumen operasional masing-masing.
- Gunakan README di masing-masing service untuk instruksi yang lebih detail.
