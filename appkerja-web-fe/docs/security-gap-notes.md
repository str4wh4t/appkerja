# SIPEMU FE Security Gap Notes

Dokumen ini mencatat area keamanan yang **belum sepenuhnya diterapkan** dan rekomendasi prioritas berikutnya.

## 1) Gap Saat Ini

### A. Refresh Token Masih di Browser Storage

- Saat ini refresh token masih disimpan di storage client.
- Risiko utama: jika terjadi XSS, token dapat dicuri.

### B. Belum Cookie-Based Refresh Token

- Belum menggunakan HttpOnly Secure cookie untuk refresh token.
- Akibatnya refresh token masih dapat diakses JavaScript.

### C. Belum Terlihat Mekanisme Rotation/Reuse Detection di Sisi Frontend Contract

- Frontend belum enforce contract rotation token (bergantung backend).
- Belum ada handling khusus reuse detection jika backend mengembalikan kode spesifik replay.

### D. Belum Ada Session Management View

- Belum ada fitur "manage active sessions/devices" di UI.
- Belum ada "logout all devices".

### E. Hardening Frontend Security Masih Dasar

- Belum ada checklist CSP ketat yang terdokumentasi untuk produksi.
- Belum ada dokumentasi sanitasi input rich content (jika nanti ada editor/HTML render).

## 2) Risiko Studi Kasus

- Jika attacker memperoleh access token + refresh token:
  - attacker bisa terus memperpanjang sesi (selama refresh token valid).
  - attacker dapat menyamar sebagai user sampai token dicabut/expired.

## 3) Rekomendasi Prioritas (Urutan Implementasi)

1. Migrasi refresh token ke HttpOnly Secure cookie.
2. Access token dibuat short-lived (mis. 5-15 menit).
3. Terapkan refresh token rotation + revoke token lama.
4. Tambahkan reuse detection (indikasi token replay) + force logout chain.
5. Implement endpoint logout yang clear cookie + revoke session server.
6. Tambah audit log untuk login/refresh/logout/revoke.

## 4) Kebutuhan Contract Backend untuk Peningkatan Security

- Login:
  - set refresh token via cookie, bukan body JSON.
- Refresh:
  - baca refresh token dari cookie.
  - return access token baru.
- Logout:
  - clear refresh cookie.
  - invalidate refresh token di server.
- CORS:
  - `Access-Control-Allow-Credentials: true`.
  - origin harus spesifik (bukan wildcard).

## 5) Checklist Frontend Saat Migrasi Cookie Refresh

- Hapus penyimpanan refresh token di `localStorage`.
- Pastikan Apollo request pakai `credentials: "include"`.
- Sesuaikan mutation refresh agar tidak mengirim refresh token dari JS.
- Ubah logout flow: call logout endpoint + clear access token lokal + redirect login.

## 6) Status Saat Dokumen Ini Dibuat

- Auth flow sudah bekerja untuk use case development.
- Proteksi route dashboard sudah ada.
- Security hardening tingkat lanjut belum final untuk production-grade rollout.

