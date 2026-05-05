# GraphQL multipart & upload (pres-api)

Dokumen ini menjelaskan bagaimana server menangani `multipart/form-data` untuk GraphQL dengan scalar `Upload`, konfigurasi yang relevan, dan **mengapa** ada langkah “drain” stream setelah error.

## Ringkasan

| Topik | Isi |
|--------|-----|
| Parser | `graphql-upload-ts` (`processRequest`) pada route GraphQL — **bukan** `@fastify/multipart` global |
| Pendaftaran | `registerGraphqlUpload` dipanggil **sebelum** `NestFactory.create` pada `FastifyAdapter` yang sama |
| Scalar | `Upload` dari `graphql-upload-ts`, didaftarkan di `GraphQLModule` |
| Batas | `maxFileSize` / `maxFiles` di middleware; ukuran bisnis di `UploadService` (`DOCUMENT_UPLOAD_MAX_MB`) |
| Error tanpa resolver | Hook Fastify `onSend`: jika respons JSON berisi `errors` (apa pun), drain variabel/body |
| Error di resolver | `AchievementsService` (+ `UploadService`) mengosongkan stream yang tersisa |

## Mengapa tidak pakai `@fastify/multipart` global?

`graphql-upload-ts` memakai busboy sendiri. Parser multipart ganda (Fastify + graphql-upload) berbenturan pada stream request — gejala umum **415** atau stream rusak. Parser `multipart/form-data` di sini sengaja **noop** (`done(null, undefined)`); pembacaan dilakukan hanya di `processRequest` untuk path GraphQL.

## Urutan bootstrap (`main.ts`)

1. Normalisasi path GraphQL (`GRAPHQL_PATH`).
2. `registerGraphqlUpload(adapter.getInstance(), graphqlPath)` — content-type parser + `preValidation` + `processRequest`.
3. `NestFactory.create(AppModule, adapter)`.
4. `registerGraphqlMultipartUploadDrainOnSend(fastify, graphqlPath, () => app.get(UploadService))` — drain saat error GraphQL **sebelum** resolver selesai dengan benar (lihat bawah).

## Request multipart GraphQL (klien)

Format mengikuti [GraphQL multipart request](https://github.com/jaydenseric/graphql-multipart-request-spec): field `operations`, `map`, dan file sebagai part terpisah. Urutan dan `map` harus konsisten; sandbox browser sering tidak cocok untuk uji upload — lebih aman pakai skrip/HTTP client (mis. `scripts/run-achievements-create-upload.mjs`).

## Validasi Nest & field upload di input

`ValidationPipe` global memakai `forbidNonWhitelisted: true`. Field bertipe `Upload` (mis. `document`, `fileUpload`) harus punya decorator yang mengizinkan properti (mis. `@Allow()` pada input nested) agar tidak ditolak sebelum masuk resolver.

## Avatar user (`usersOwnAvatarUpdate`) vs profil (`usersOwnUpdateProfile`)

- **`usersOwnUpdateProfile`**: hanya field teks (`firstName`, `lastName`, `phone`); **bukan** multipart file.
- **`usersOwnAvatarUpdate`**: input `UsersOwnAvatarUpdateInput` dengan **`fileUpload`** (`Upload!`) dan opsional **`isPublicUpload`** (default `false`). User target selalu dari **JWT** (bukan argumen `userId`).

Contoh `map` multipart (nilai string adalah indeks file di array parts):

```json
{ "0": ["variables.usersOwnAvatarUpdateInput.fileUpload"] }
```

Variabel `operations` memuat `usersOwnAvatarUpdateInput` berisi `isPublicUpload` (boolean) dan placeholder `null` untuk `fileUpload` sesuai spesifikasi multipart GraphQL.

Untuk **`UPLOAD_DISK=s3`**: `isPublicUpload: false` menulis ke **`S3_BUCKET`**; `true` ke **`S3_PUBLIC_BUCKET`** (keduanya wajib ter-set dan berbeda).

## Drain stream — dua lapisan

### 1. Hook `onSend` (error GraphQL di engine)

Jika error seperti **variabel tidak valid** atau **`Upload!` tidak dikirim**, resolver **tidak** dijalankan — drain di `AchievementsService` tidak pernah terpanggil. Sisa byte multipart tetap menahan koneksi **keep-alive**.

Hook membaca **payload respons** (JSON): jika ada `errors` apa pun, server memanggil `UploadService.drainPossibleUploadValuesDeep(request.body)` (isi body setelah `processRequest` berisi `variables` dan scalar `Upload`). Pendekatan ini lebih future-proof untuk tipe error baru yang bisa terjadi sebelum resolver menyelesaikan pembacaan stream.

### 2. Service (`AchievementsService` + `UploadService`)

Untuk error **setelah** variabel masuk resolver (validasi MIME, DB, dll.), drain dilakukan di service (indeks lampiran, flag oversize, outer `catch` jika error sebelum loop dokumen).

## Konfigurasi lingkungan

| Variabel | Peran |
|----------|--------|
| `GRAPHQL_PATH` | Path endpoint GraphQL (dinormalisasi di `configuration.ts`) |
| `DOCUMENT_UPLOAD_MAX_MB` | Batas ukuran file bisnis (avatar, dokumen achievement, …) |
| `UPLOAD_DISK` | `local` atau penyimpanan lain (mis. S3 lewat service) |
| `S3_BUCKET` | Bucket privat (default upload) |
| `S3_PUBLIC_BUCKET` | Bucket publik (hanya jika `isPublicUpload` true pada alur yang mendukung) |

## Referensi kode

- `src/common/middleware/graphql-upload.middleware.ts` — parser noop, `processRequest`, `registerGraphqlMultipartUploadDrainOnSend`
- `src/common/graphql/graphql-upload-drain.ts` — heuristik error untuk drain `onSend`
- `src/storage/upload.service.ts` — simpan file, drain stream, MIME/ukuran; helper umum `getUploadDrainStartIndexAfterError` / `markErrorUploadStreamFullyConsumed` untuk loop multi-upload di mutation mana pun
- `src/resources/achievements/achievements.service.ts` — transaksi create/update + drain lampiran
