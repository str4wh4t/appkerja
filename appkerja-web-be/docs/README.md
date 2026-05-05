# Dokumentasi

Panduan database (konfigurasi, migrations, seeders), Docker, dan entrypoint — digabung dalam satu berkas.

## Daftar isi

- [Konfigurasi database](#konfigurasi-database)
- [Migrations](#migrations)
- [Seeders](#seeders)
- [Docker — setup](#docker--setup)
- [Docker — entrypoint (migration & seeder)](#docker--entrypoint-migration--seeder)
- [Entity Relation Patterns](#entity-relation-patterns)
- [Soft Delete Read Policy](#soft-delete-read-policy)
- [Validasi tanggal & waktu (date-fns)](#validasi-tanggal--waktu-date-fns)
- [Dokumentasi lainnya](#dokumentasi-lainnya)

---

## Konfigurasi database

### Setup

1. **Copy file environment:**
   ```bash
   cp .env.example .env
   ```

2. **Edit file `.env` dan sesuaikan dengan konfigurasi database Anda:**
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=your_password
   DB_NAME=nestapi
   ```

3. **Install dependencies (jika belum):**
   ```bash
   npm install
   ```

### Struktur konfigurasi

- `src/config/database.config.ts` — konfigurasi database (`@nestjs/config`)
- `src/config/configuration.ts` — konfigurasi aplikasi umum
- `.env.example` — template environment variables

### Praktik yang diterapkan

1. **Environment variables** untuk semua pengaturan database
2. **Type safety** dengan TypeScript
3. **Connection pooling** untuk performa
4. **Auto load entities** — entity dimuat otomatis
5. **Migration support** — perubahan schema lewat migration
6. **Development vs production** — `synchronize` dan `logging` disesuaikan lingkungan (jangan `synchronize: true` di production)

### Penggunaan di module

`ConfigModule` global; gunakan `ConfigService` di service:

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class YourService {
  constructor(private configService: ConfigService) {
    const dbHost = this.configService.get<string>('database.host');
    const dbName = this.configService.get<string>('database.database');
  }
}
```

### TypeORM repository

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { YourEntity } from './entities/your.entity';

@Injectable()
export class YourService {
  constructor(
    @InjectRepository(YourEntity)
    private readonly yourRepository: Repository<YourEntity>,
  ) {}
}
```

Jangan lupa `TypeOrmModule.forFeature([YourEntity])` di module.

### Checklist production

- [ ] `NODE_ENV=production`
- [ ] `synchronize: false` (wajib untuk production)
- [ ] Perubahan schema lewat migrations
- [ ] Connection pool sesuai beban
- [ ] Monitoring koneksi database
- [ ] Backup database rutin

---

## Migrations

Konfigurasi TypeORM ada di `database/data-source.ts`. Migrations berada di `database/migrations/`.

### Perintah

| Command | Deskripsi |
|---------|-----------|
| `npm run migration:generate` | Generate migration dari perubahan entity |
| `npm run migration:create` | Buat file migration kosong |
| `npm run migration:run` | Jalankan pending migrations |
| `npm run migration:revert` | Revert migration terakhir |
| `npm run migration:show` | Status migrations |
| `npm run migration:fresh` | Drop semua tabel lalu jalankan ulang migrations |

### Generate (dari entity)

```bash
npm run migration:generate database/migrations/MigrationName
```

Pastikan `synchronize: false` di production bila memakai migrations.

### Create (manual)

```bash
npm run migration:create database/migrations/MigrationName
```

### Run / revert / show / fresh

```bash
npm run migration:run
npm run migration:revert
npm run migration:show
# HATI-HATI: fresh menghapus semua data
npm run migration:fresh
```

### Struktur file

Format: `[timestamp]-[MigrationName].ts` — contoh: `1738569600000-CreateUsersTable.ts`.

### Best practices

1. Review migration sebelum production
2. Uji di development/staging dulu
3. Backup database sebelum migration production
4. Jangan mengubah migration yang sudah di-deploy
5. Pertimbangkan transaction untuk migration kompleks
6. Satu migration per perubahan schema yang logis

### Contoh singkat

**Create table** — gunakan `MigrationInterface`, `QueryRunner`, `Table` dari TypeORM.

**Add column** — `queryRunner.addColumn` / `dropColumn` di `down`.

### Migration di Docker

```bash
docker exec -it nestapi-app sh
npm run migration:run
```

Atau:

```bash
docker exec -it nestapi-app npm run migration:run
```

### Troubleshooting

- **Gagal jalan**: cek `.env`, database sudah dibuat, log error, syntax file migration
- **Sudah jalan tapi schema tidak sesuai**: cek tabel `migrations`, path di `data-source.ts`
- **Revert berulang**: `npm run migration:revert` dijalankan beberapa kali untuk beberapa step

### Entity vs migration

- **Entity** — model TypeScript di kode
- **Migration** — perubahan schema di database (utamanya untuk production)

Di production **wajib** `synchronize: false` dan mengandalkan migrations.

---

## Seeders

Seeders mengisi data referensi/awal; berbeda dari migrations yang mengubah struktur.

### Best practices

1. **Idempotent** — aman dijalankan berulang
2. **Upsert** — insert jika belum ada, update jika perlu
3. **Terpisah dari migration** — jangan seed data di file migration
4. **Type-safe** — pakai repository TypeORM

### Seeder yang lazim dijelaskan

**User statuses** — `database/seeders/user-statuses.seeder.ts` (active, inactive, suspended).

**Users (super admin)** — `database/seeders/users.seeder.ts`, dikonfigurasi lewat env (`SUPERADMIN_*`). **Production**: set password kuat via `SUPERADMIN_PASSWORD`; ganti password setelah login pertama. Lihat juga `.env.example` dan kebijakan env tim Anda.

### Perintah

```bash
npm run seed -- user-statuses
npm run seed -- users
npm run seed:all
npm run seed -- --help
```

Langsung dengan ts-node (contoh):

```bash
ts-node -r tsconfig-paths/register database/seeders/user-statuses.seeder.ts
```

### Workflow database baru

1. `npm run migration:run`
2. Lalu seed: `npm run seed -- user-statuses` → `users` atau `npm run seed:all`

Urutan: user statuses harus ada sebelum users (foreign key / referensi status).

### Menambah seeder baru

1. Buat `database/seeders/<nama-kebab>.seeder.ts` dengan `export async function seedNamaPascal(): Promise<void>` (konvensi sama seperti `run-seeder.ts`).
2. (Opsional) Export dari `database/seeders/index.ts`.
3. **Tambah nama kebab ke array `SEEDER_ORDER` di `database/seeders/seed-all.ts`** pada urutan dependensi yang benar (daftar ini diverifikasi terhadap file di disk saat `seed:all`).
4. Tidak perlu script npm baru — `npm run seed -- <nama-kebab>`.

### Seeder di Docker

```bash
docker exec -it nestapi-app npm run seed -- user-statuses
```

### Troubleshooting

- **Connection error**: DB jalan, `.env` benar, database sudah dibuat
- **Data tidak berubah**: cek logika upsert dan `save`
- **Entity not found**: import entity, path di `database/data-source.ts`, registrasi modul TypeORM

### Contoh impor dari kode

```typescript
import { seedUserStatuses } from './database/seeders';

await seedUserStatuses();
```

---

## Docker — setup

### Prasyarat

- Docker dan Docker Compose terpasang
- MySQL berjalan (misalnya container `mysql-container`)
- Network `app-bridge` menghubungkan app dan MySQL (sesuai setup proyek Anda)

### Environment (contoh)

```env
DB_HOST=mysql-container
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
DB_NAME=nestapi
```

Compose memakai **profiles** untuk memisahkan dev dan production.

### Production

```bash
docker compose --profile prod up -d
docker compose --profile prod up -d --build
docker compose --profile prod logs -f
docker compose --profile prod stop
docker compose --profile prod down
docker compose --profile prod build
```

### Development

```bash
docker compose --profile dev up -d
docker compose --profile dev up -d --build
docker compose --profile dev logs -f
docker compose --profile dev stop
docker compose --profile dev down
docker compose --profile dev build
```

### Dev + prod sekaligus

```bash
docker compose --profile dev --profile prod up -d
```

### Verifikasi koneksi

```bash
docker ps | grep nestapi
docker compose --profile dev ps
docker compose --profile prod ps
docker compose --profile prod logs | grep -i "database\|mysql\|connection"
docker compose --profile dev logs | grep -i "database\|mysql\|connection"
docker exec -it nestapi-app ping mysql-container
docker exec -it nestapi-app-dev ping mysql-container
```

### Troubleshooting

- **Tidak connect ke MySQL**: pastikan `mysql-container` hidup, keduanya di network yang sama (`docker network inspect app-bridge`), `DB_HOST=mysql-container`, tes `mysql` dari container DB
- **Port bentrok**: set `PORT` di `.env` atau override environment saat `docker compose up`

### Build & cleanup

```bash
docker compose --profile prod build
docker compose --profile dev build
docker compose --profile dev --profile prod down
docker compose --profile dev --profile prod down --rmi all
# Hati-hati: `-v` menghapus volume
docker compose --profile dev --profile prod down -v
```

### Health check

```bash
docker inspect nestapi-app --format='{{.State.Health.Status}}'
docker inspect nestapi-app-dev --format='{{.State.Health.Status}}'
```

---

## Docker — entrypoint (migration & seeder)

Script `docker-entrypoint.sh`:

1. Menunggu database siap
2. Menjalankan migrations (jika diaktifkan)
3. Menjalankan seeders (jika diaktifkan)
4. Menjalankan aplikasi

### Variabel kontrol

| Variable | Default | Deskripsi |
|----------|---------|-----------|
| `RUN_MIGRATIONS` | `false` (prod), `true` (dev) | Auto migration |
| `RUN_SEEDERS` | `true` | Auto seeder |
| `DB_MAX_RETRIES` | `30` | Max retry koneksi DB |
| `DB_RETRY_INTERVAL` | `2` | Jeda antar retry (detik) |

Nilai di `docker-compose.yml` (environment service) mengalahkan default skrip jika sudah di-set — cek `RUN_MIGRATIONS` / `RUN_SEEDERS` pada service `app` dan `app-dev`.

**Deteksi lingkungan**

- **Development** (`NODE_ENV=development`): default migration + seeder aktif
- **Production** (`NODE_ENV=production`): default migration **nonaktif** (aktifkan eksplisit), seeder default aktif

### Contoh

```bash
# Dev — default migration + seeder
docker compose --profile dev up -d app-dev

# Prod — default seeder saja (tanpa migration otomatis)
docker compose --profile prod up -d app

# Prod + migration
docker compose --profile prod up -d app -e RUN_MIGRATIONS=true
```

Atau di `docker-compose.yml`:

```yaml
environment:
  RUN_MIGRATIONS: "true"
  RUN_SEEDERS: "true"
```

Matikan seeder:

```bash
docker compose --profile dev up -d app-dev -e RUN_SEEDERS=false
```

### Alur startup

1. Container start → entrypoint
2. Tunggu DB (retry)
3. Migration (jika enabled)
4. Seeder (jika enabled)
5. Start app

**Perilaku error**

- Gagal koneksi DB → container exit
- Gagal migration → exit (fail fast)
- Gagal seeder → log peringatan, lanjut (non-kritis)

### Troubleshooting entrypoint

- **Timeout DB**: naikkan `DB_MAX_RETRIES` / `DB_RETRY_INTERVAL`
- **Migration gagal**: cek koneksi, file migration, `docker compose logs app`, manual: `docker exec -it nestapi-app npm run migration:run`
- **Seeder gagal**: `docker compose logs app | grep -i seeder`
- **Debug tanpa entrypoint**: `docker run --entrypoint /bin/sh …`

### Praktik singkat

- Dev: biasakan auto migration + seeder
- Prod: migration biasanya eksplisit/review; seeder idempotent lebih aman di startup
- CI/CD: pertimbangkan migration di pipeline terpisah

---

## Entity Relation Patterns

Pola untuk menangani **circular dependencies** antara entities TypeORM + NestJS GraphQL dengan Bun runtime.

### Masalah

Dengan konfigurasi TypeScript:
- `isolatedModules: true`
- `emitDecoratorMetadata: true`

Circular imports antara entity (misal: `Achievement` ↔ `AchievementDocument`) menyebabkan error:
- `ReferenceError: Cannot access 'X' before initialization`
- `TS1272: A type referenced in a decorated signature must be imported with 'import type'`

### Solusi: String-based Relations + Relation Wrapper

**Untuk child entity (yang punya `@ManyToOne`):**

```typescript
import {
  Entity,
  ManyToOne,
  JoinColumn,
  // ... decorators lain
} from 'typeorm';
import type { Relation } from 'typeorm';  // ← WAJIB 'import type'
import { ObjectType, Field } from '@nestjs/graphql';
import { ParentEntity } from '../../parent/entities/parent.entity';  // ← import biasa untuk decorator

@ObjectType()
@Entity('child_table')
export class ChildEntity {
  // ...

  @Field(() => ParentEntity, { nullable: true })
  @ManyToOne('ParentEntity', 'childrenPropertyName', { onDelete: 'CASCADE' })  // ← STRING reference
  @JoinColumn({ name: 'parentId' })
  parent?: Relation<any>;  // ← Relation<any> untuk property type
}
```

**Untuk parent entity (yang punya `@OneToMany`):**

```typescript
import {
  Entity,
  OneToMany,
  // ...
} from 'typeorm';
import { ChildEntity } from '../../child/entities/child.entity';

@ObjectType()
@Entity('parent_table')
export class ParentEntity {
  // ...

  @Field(() => [ChildEntity], { nullable: true })
  @OneToMany('ChildEntity', 'parent')  // ← STRING reference
  children?: ChildEntity[];  // ← Array boleh pakai class langsung
}
```

### Penjelasan

| Komponen | Keterangan |
|----------|------------|
| `import type { Relation }` | Import type-only untuk `Relation` wrapper |
| `import { ParentEntity }` | Import biasa — dibutuhkan untuk `@Field(() => ParentEntity)` |
| `@ManyToOne('ParentEntity', ...)` | String-based reference, dievaluasi lazy |
| `parent?: Relation<any>` | Mencegah metadata emission yang menyebabkan circular error |

### Kapan menggunakan pola ini

Gunakan pada **semua entity** yang memiliki relasi `@ManyToOne` ke entity lain, terutama jika:
- Ada circular reference (A → B → A)
- Entity berada di folder berbeda
- Proyek dijalankan dengan Bun

### Contoh entities yang sudah menggunakan pola ini

- `AchievementDocument` → `Achievement`
- `AchievementParticipant` → `Achievement`
- `AchievementSupervisor` → `Achievement`
- `AchievementLink` → `Achievement`
- `ApprovalLog` → `Achievement`
- `ApprovalNotification` → `Achievement`
- `AchievementPointLog` → `Achievement`
- `UserRoleScope` → `UserRole`

### TypeORM tetap type-safe

TypeORM mendapatkan informasi tipe dari:
1. Callback decorator: `@ManyToOne('Achievement', ...)` atau `() => Achievement`
2. GraphQL: `@Field(() => Achievement)`

Property type `Relation<any>` hanya untuk mencegah error compile-time/runtime.

---

## Soft Delete Read Policy

Kebijakan default read di API: hanya menampilkan data aktif (`deletedAt IS NULL`) untuk entity yang memiliki soft delete.

### Aturan

1. Query/list/read default **wajib** memfilter root entity dengan `deletedAt IS NULL`.
2. Jika endpoint membaca child yang berelasi ke parent soft-delete, query child harus memfilter parent aktif juga (join dengan syarat `parent.deletedAt IS NULL`).
3. Data child yang parent-nya soft-delete tidak ditampilkan pada endpoint read default.
4. Jika dibutuhkan data terhapus (audit/trash), sediakan endpoint/flag khusus dan jangan dijadikan default.

### Contoh kasus yang ditangani

- `achievementParticipantsFindAll` dan `achievementParticipantsFindOne` hanya mengembalikan participant yang masih terhubung ke `achievement` aktif.
- Participant dari `achievement` yang sudah soft-delete tidak lagi muncul di read default.

---

## Validasi tanggal & waktu (date-fns)

Untuk aturan bisnis yang melibatkan **tanggal atau datetime** (misalnya tanggal selesai tidak boleh sebelum tanggal mulai, rentang periode, overlap), **gunakan pustaka [date-fns](https://www.npmjs.com/package/date-fns)** sebagai satu cara standar di proyek ini — jangan mengandalkan perbandingan `Date` mentah (`getTime()`, `>` / `<`) saja untuk logika per **hari kalender**, karena rentan timezone dan jam yang tidak disengaja.

- Dependensi: `date-fns` (lihat `package.json`).
- Helper umum untuk urutan *start* / *end*: `src/common/date/date-range.ts` — misalnya `assertEndOnOrAfterStart`, `isCalendarEndBeforeStart` (memakai `startOfDay` + `compareAsc` dari date-fns).
- Contoh pemakaian di service: `PeriodSettingsService`, `AchievementsService` (validasi `startDate` / `endDate`).

---

## Dokumentasi lainnya

| Berkas | Isi |
|--------|-----|
| [MODULE-STRUCTURE-PATTERN.md](./MODULE-STRUCTURE-PATTERN.md) | Struktur modul NestJS / resource |
| [AUTH-ACTIVE-ROLE.md](./AUTH-ACTIVE-ROLE.md) | Role aktif untuk UI (`activeRoleCode` di JWT; permission tetap union) |
| [FORCE-DELETE-POLICY.md](./FORCE-DELETE-POLICY.md) | Aturan backend force delete, FK behavior, permission, dan status saat soft delete |
| [GRAPHQL-NAMING.md](./GRAPHQL-NAMING.md) | Konvensi Query & Mutation |
| [PAGINATION-PATTERN.md](./PAGINATION-PATTERN.md) | Pagination GraphQL |
| [NOTES.md](./NOTES.md) | Catatan proyek |
| [APPROVAL-WORKFLOW-DESIGN.md](./APPROVAL-WORKFLOW-DESIGN.md) | Desain alur approval |

### Alur singkat setup

1. Konfigurasi database (bagian [Konfigurasi database](#konfigurasi-database))
2. [Migrations](#migrations) lalu [Seeders](#seeders)
3. [Docker](#docker--setup) dan [Entrypoint](#docker--entrypoint-migration--seeder) bila deploy dengan container
