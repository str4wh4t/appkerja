# Pola Struktur dan Organisasi Modul NestJS

## Overview
Dokumen ini menjelaskan pola standar untuk mengorganisir struktur file dan direktori pada setiap **modul domain** (resource) di aplikasi NestJS ini. Pola ini diterapkan pada modul-modul di bawah `src/resources/`, misalnya `users`, `roles`, `permissions`, `units`, `auth`, `countries`, `achievement-types`, `competition-levels`, `user-roles` (termasuk scope `user_role_scopes`), `unit-fakultas-mappings`, `mhs`, dan `pegawai`.

### Status runtime modul

Project backend ini berjalan sebagai **full ESM project**.

Konsekuensinya:

- `package.json` menggunakan `"type": "module"`.
- `tsconfig.json` menggunakan `module: "nodenext"` dan `moduleResolution: "nodenext"`.
- Semua import/export relatif harus memakai extension eksplisit `.js` (untuk source `.ts`).

### Letak folder di repositori

| Lokasi | Isi |
|--------|-----|
| `src/resources/{module}/` | Modul domain: GraphQL, TypeORM (jika ada), service, DTO, resolver |
| `src/config/`, `database/` (akar repo), `src/redis/`, `src/storage/`, dll. | Infrastruktur bersama, migrasi, seeder — **bukan** modul resource |

`app.module.ts` mengimpor modul resource dengan path `./resources/{module}/{module}.module.js` (sesuai nama file modul, format ESM).

## Struktur Direktori Modul

Setiap modul domain harus mengikuti struktur direktori berikut:

```
src/resources/{module}/
├── dto/                          # Data Transfer Objects
│   ├── {module}-create.input.ts
│   ├── {module}-update.input.ts
│   ├── {module}-pagination.input.ts (jika diperlukan)
│   ├── {module}-pagination-response.type.ts (jika diperlukan)
│   └── index.ts                  # Export semua DTO
├── entities/                     # TypeORM Entities (biasanya juga @ObjectType GraphQL)
│   ├── {entity}.entity.ts
│   └── index.ts                  # Export semua entities
├── types/                        # (opsional) Hanya @ObjectType GraphQL tanpa tabel DB — contoh: `countries`
├── resolvers/                    # GraphQL Resolvers (terpisah query & mutation)
│   ├── {module}.query.ts         # Semua Query resolvers
│   ├── {module}.mutation.ts      # Semua Mutation resolvers
│   └── index.ts                  # Export semua resolvers
├── {module}.service.ts           # Service (langsung di root modul)
├── {module}.module.ts            # Module definition
└── (opsional) controllers/       # REST Controllers (jika diperlukan)
```

## Aturan Penting

### 1. Service dan Module File
- **Service**: File `{module}.service.ts` ditempatkan **langsung di root direktori modul**, bukan di subdirektori `services/`
- **Module**: File `{module}.module.ts` ditempatkan **langsung di root direktori modul**

**Contoh:**
```
✅ BENAR:
src/resources/users/users.service.ts
src/resources/users/users.module.ts

❌ SALAH:
src/resources/users/services/users.service.ts
src/resources/users/modules/users.module.ts
```

### 2. Resolvers - Pemisahan Query dan Mutation

**PENTING**: Query dan Mutation **HARUS** dipisah dalam file terpisah:

- `{module}.query.ts` - Berisi semua GraphQL Query resolvers
- `{module}.mutation.ts` - Berisi semua GraphQL Mutation resolvers

**File:** `src/resources/{module}/resolvers/{module}.query.ts`

Dari folder `resolvers/`, import ke modul `auth` (sejajar di bawah `resources/`) memakai **`../../auth/.../*.js`** (dua tingkat naik ke `resources/`, lalu masuk `auth/`).

```typescript
import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { {Module}Service } from '../{module}.service.js';
import { {Entity} } from '../entities/{entity}.entity.js';
import { PermissionsGuard } from '../../auth/guards/index.js';
import { Permissions, CurrentUser } from '../../auth/decorators/index.js';

@Resolver(() => {Entity})
export class {Module}Query {
  constructor(private readonly {module}Service: {Module}Service) {}

  @Query(() => [{Entity}], { name: '{module}FindAll' })
  @UseGuards(PermissionsGuard)
  @Permissions('{module}.read')
  async findAll(): Promise<{Entity}[]> {
    return this.{module}Service.findAll();
  }

  // Query lainnya...
}
```

**File:** `src/resources/{module}/resolvers/{module}.mutation.ts`
```typescript
import { Resolver, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { {Module}Service } from '../{module}.service.js';
import { {Entity} } from '../entities/{entity}.entity.js';
import { {Module}CreateInput, {Module}UpdateInput } from '../dto/index.js';
import { PermissionsGuard } from '../../auth/guards/index.js';
import { Permissions, CurrentUser } from '../../auth/decorators/index.js';

@Resolver(() => {Entity})
export class {Module}Mutation {
  constructor(private readonly {module}Service: {Module}Service) {}

  @Mutation(() => {Entity}, { name: '{module}Create' })
  @UseGuards(PermissionsGuard)
  @Permissions('{module}.create')
  async {module}Create(
    @Args('{module}CreateInput') {module}CreateInput: {Module}CreateInput,
    @CurrentUser() currentUser: {Entity},
  ): Promise<{Entity}> {
    return this.{module}Service.create({module}CreateInput, currentUser);
  }

  // Mutation lainnya...
}
```

**File:** `src/resources/{module}/resolvers/index.ts`
```typescript
export * from './{module}.query.js';
export * from './{module}.mutation.js';
```

### 3. Penamaan Query dan Mutation

**Konvensi:** **`{resourcePlural}{Verb}`** (camelCase) — nama resource domain **jamak** + kata kerja, misalnya `achievementsFindOne`, `achievementsSubmit`, `approvalNotificationsFindMine`.

Detail lengkap, daftar pengecualian (`auth*`, `usersMe`, `mhs*` / `pegawai*`), dan contoh Query/Mutation: **[GRAPHQL-NAMING.md](./GRAPHQL-NAMING.md)**.

**Ringkas:**
- **Query**: `usersFindAllPaginated`, `achievementsFindOne`, `approvalNotificationsCountUnread`
- **Mutation**: `achievementsCreate`, `achievementsApprove`, `usersAssignRoles`
- Selalu set `name:` pada `@Query` / `@Mutation` agar nama GraphQL stabil

**Contoh:**
```typescript
// ✅ BENAR — prefix jamak + verb
@Query(() => UserPaginationResponse, { name: 'usersFindAllPaginated' })
@Query(() => User, { name: 'usersFindOne', nullable: true })
@Mutation(() => Achievement, { name: 'achievementsSubmit' })

// ❌ SALAH — tanpa prefix resource atau tidak jamak
@Query(() => [User], { name: 'findAll' })
@Mutation(() => Achievement, { name: 'achievementSubmit' })
```

### 4. Penamaan DTO (Data Transfer Objects)

**Konvensi Penamaan DTO:**
- **Create Input**: `{Module}CreateInput` (contoh: `UserCreateInput`, `RoleCreateInput`)
- **Update Input**: `{Module}UpdateInput` (contoh: `UserUpdateInput`, `RoleUpdateInput`)
- **Pagination Input**: `{Module}PaginationInput` (contoh: `UserPaginationInput`)
- **Pagination Response**: `{Module}PaginationResponse` (contoh: `UserPaginationResponse`)

**Aturan:**
- Nama class menggunakan PascalCase
- Nama file menggunakan kebab-case: `{module}-create.input.ts`
- Format: `{Module}{Action}{Type}`

**Contoh File:**
```
src/resources/users/dto/
├── user-create.input.ts          # Class: UserCreateInput
├── user-update.input.ts          # Class: UserUpdateInput
├── user-pagination.input.ts      # Class: UserPaginationInput
└── index.ts
```

**File:** `src/resources/{module}/dto/{module}-create.input.ts`
```typescript
import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

@InputType()
export class {Module}CreateInput {
  @Field()
  @IsNotEmpty()
  field1: string;

  @Field()
  @IsEmail()
  @IsNotEmpty()
  field2: string;

  // Field lainnya...
}
```

**File:** `src/resources/{module}/dto/{module}-update.input.ts`
```typescript
import { InputType, Field, PartialType } from '@nestjs/graphql';
import { {Module}CreateInput } from './{module}-create.input.js';
import { IsOptional } from 'class-validator';

@InputType()
export class {Module}UpdateInput extends PartialType({Module}CreateInput) {
  @Field({ nullable: true })
  @IsOptional()
  someUpdatableField?: string;
}
```

### 4.1. Aturan khusus untuk Update Input & ID

- **ID TIDAK BOLEH** dimasukkan dalam `{Module}UpdateInput`.
- ID **selalu** dikirim sebagai argumen terpisah di resolver GraphQL.
- Pola umum:

```typescript
@Mutation(() => {Entity}, { name: '{module}Update' })
@UseGuards(PermissionsGuard)
@Permissions('{module}.update')
async {module}Update(
  @Args('id', { type: () => ID }) id: string,
  @Args('{module}UpdateInput') {module}UpdateInput: {Module}UpdateInput,
): Promise<{Entity} | null> {
  return this.{module}Service.update(id, {module}UpdateInput);
}
```

- Contoh implementasi nyata:
  - `usersUpdate(id: ID!, userUpdateInput: UserUpdateInput!)`
  - `rolesUpdate(id: Int!, roleUpdateInput: RoleUpdateInput!)`
  - `permissionsUpdate(id: Int!, permissionUpdateInput: PermissionUpdateInput!)`
  - `unitsUpdate(id: ID!, unitUpdateInput: UnitUpdateInput!)`
  - `userRoleScopesUpdate(id: Int!, userRoleScopeUpdateInput: UserRoleScopeUpdateInput!)`

**File:** `src/resources/{module}/dto/index.ts`
```typescript
export * from './{module}-create.input.js';
export * from './{module}-update.input.js';
// Export lainnya jika ada
```

### 5. Entities

**File:** `src/resources/{module}/entities/{entity}.entity.ts`
```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  // Relations jika diperlukan
} from 'typeorm';
import { Relation } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@Entity('{table_name}')
@ObjectType()
export class {Entity} {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  field1: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Jika ada relasi, gunakan Relation<T>
  @ManyToOne(() => OtherEntity, { nullable: true })
  other?: Relation<OtherEntity>;
}
```

#### 5.1 Aturan Relasi Entity

- Jika entity memakai decorator relasi TypeORM (`@ManyToOne`, `@OneToOne`, `@OneToMany`, `@ManyToMany`), properti relasi wajib bertipe **`Relation<T>`**.
- Import Relation secara langsung:
  - `import { Relation } from 'typeorm';`
- Contoh standar:
  - `user?: Relation<User>`
  - `role?: Relation<Role>`
  - `children?: Relation<Category[]>`
- Untuk project ESM, ini wajib dijaga konsisten untuk mengurangi risiko circular import saat metadata type diproses transpiler TypeScript.
- Referensi: [TypeORM FAQ - How to use TypeORM in ESM projects](https://typeorm.io/docs/help/faq#how-to-use-typeorm-in-esm-projects).

**File:** `src/resources/{module}/entities/index.ts`
```typescript
export * from './{entity}.entity.js';
// Export entities lainnya jika ada
```

### 6. Service

**File:** `src/resources/{module}/{module}.service.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { {Entity} } from './entities/index.js';

@Injectable()
export class {Module}Service {
  constructor(
    @InjectRepository({Entity})
    private readonly {entity}Repository: Repository<{Entity}>,
  ) {}

  async findAll(): Promise<{Entity}[]> {
    return this.{entity}Repository.find({
      where: { deletedAt: IsNull() },
    });
  }

  // Method lainnya...
}
```

### 7. Module Definition

**File:** `src/resources/{module}/{module}.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { {Module}Service } from './{module}.service.js';
import { {Entity} } from './entities/index.js';
import { {Module}Query, {Module}Mutation } from './resolvers/index.js';

@Module({
  imports: [TypeOrmModule.forFeature([{Entity}])],
  providers: [{Module}Service, {Module}Query, {Module}Mutation],
  exports: [{Module}Service],
})
export class {Module}Module {}
```

## Contoh Implementasi Lengkap

### Users Module

```
src/resources/users/
├── dto/
│   ├── user-create.input.ts
│   ├── user-update.input.ts
│   ├── user-pagination.input.ts
│   ├── user-pagination-response.type.ts
│   └── index.ts
├── entities/
│   ├── user.entity.ts
│   ├── user-status.entity.ts
│   └── index.ts
├── resolvers/
│   ├── users.query.ts
│   ├── users.mutation.ts
│   └── index.ts
├── users.service.ts
└── users.module.ts
```

### Roles Module

```
src/resources/roles/
├── dto/
│   ├── role-create.input.ts
│   ├── role-update.input.ts
│   ├── role-assign.input.ts
│   ├── role-assign-permission.input.ts
│   └── index.ts
├── entities/
│   ├── role.entity.ts
│   └── index.ts
├── resolvers/
│   ├── roles.query.ts
│   ├── roles.mutation.ts
│   └── index.ts
├── roles.service.ts
└── roles.module.ts
```

### Units Module

```
src/resources/units/
├── dto/
│   ├── unit-create.input.ts
│   ├── unit-update.input.ts
│   ├── unit-pagination.input.ts
│   ├── unit-pagination-response.type.ts
│   └── index.ts
├── entities/
│   ├── unit.entity.ts
│   └── index.ts
├── resolvers/
│   ├── units.query.ts
│   ├── units.mutation.ts
│   └── index.ts
├── units.service.ts
└── units.module.ts
```

### Auth Module (Khusus)

```
src/resources/auth/
├── dto/
│   ├── auth-login.input.ts
│   ├── auth-set-active-role.input.ts
│   ├── auth-refresh-token.input.ts
│   ├── login-response.type.ts
│   ├── refresh-token-response.type.ts
│   ├── mhs-where.input.ts
│   ├── mhs.types.ts
│   ├── pegawai-where.input.ts
│   ├── pegawai.types.ts
│   └── index.ts
├── decorators/
│   ├── current-user.decorator.ts
│   ├── permissions.decorator.ts
│   ├── roles.decorator.ts
│   ├── public.decorator.ts
│   └── index.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   ├── permissions.guard.ts
│   ├── roles.guard.ts
│   ├── graphql-throttler.guard.ts
│   └── index.ts
├── resolvers/
│   ├── auth.query.ts
│   ├── auth.mutation.ts
│   └── index.ts
├── services/
│   ├── msal.service.ts
│   ├── eduk-api.service.ts
│   ├── mhs-api.service.ts
│   ├── pegawai-api.service.ts
│   └── index.ts
├── strategies/
│   ├── jwt.strategy.ts
│   └── index.ts
├── auth.service.ts
├── auth.controller.ts
├── login.controller.ts
└── auth.module.ts
```

**Catatan:** Modul auth memiliki struktur khusus (decorators, guards, strategies, integrasi SSO/API). Tetap berada di `src/resources/auth/` agar sejajar dengan modul domain lain; import ke `UsersModule` memakai path relatif `../users/...`.

**Role aktif UI (`activeRoleCode` di JWT):** lihat **[AUTH-ACTIVE-ROLE.md](./AUTH-ACTIVE-ROLE.md)** — claim opsional untuk menu frontend; **tidak** mengubah perilaku `PermissionsGuard` (permission tetap gabungan semua role).

### 8. Tenant Context

Untuk logika tenancy shared schema (active tenant, membership, dan scoping antar tabel), lihat dokumen khusus:

- **[TENANCY-SHARED-SCHEMA.md](./TENANCY-SHARED-SCHEMA.md)**

## Checklist Membuat Modul Baru

Saat membuat modul baru, pastikan:

### Struktur File
- [ ] Buat direktori `src/resources/{module}/`
- [ ] Buat subdirektori `dto/`, `entities/`, `resolvers/` (sesuai kebutuhan; modul tanpa tabel DB boleh memakai folder lain seperti `types/` untuk `@ObjectType` saja)
- [ ] Buat file `{module}.service.ts` di root modul (bukan di subdirektori)
- [ ] Buat file `{module}.module.ts` di root modul

### DTO
- [ ] Buat `{module}-create.input.ts` dengan class `{Module}CreateInput`
- [ ] Buat `{module}-update.input.ts` dengan class `{Module}UpdateInput` yang extends `PartialType({Module}CreateInput)`
- [ ] Buat `index.ts` di `dto/` untuk export semua DTO
- [ ] Jika diperlukan pagination, buat `{module}-pagination.input.ts` dan `{module}-pagination-response.type.ts`

### Entities
- [ ] Buat `{entity}.entity.ts` dengan decorator `@Entity()` dan `@ObjectType()`
- [ ] Implementasi soft delete dengan `@DeleteDateColumn()`
- [ ] Buat `index.ts` di `entities/` untuk export semua entities

### Resolvers
- [ ] Buat `{module}.query.ts` untuk semua Query resolvers
- [ ] Buat `{module}.mutation.ts` untuk semua Mutation resolvers
- [ ] Gunakan prefix `{module}` pada nama query/mutation (contoh: `{module}FindAll`)
- [ ] Implementasi mutation `{module}Delete` (soft delete) dan `{module}Restore` untuk restore
- [ ] Tambahkan guards dan permissions yang sesuai
- [ ] Buat `index.ts` di `resolvers/` untuk export semua resolvers

### Service
- [ ] Buat `{module}.service.ts` dengan decorator `@Injectable()`
- [ ] Inject repository menggunakan `@InjectRepository()`
- [ ] Implementasi CRUD methods dengan soft delete support
- [ ] Implementasi method `restore()` untuk mengembalikan data yang di-soft delete
- [ ] Jika diperlukan, implementasi pagination method

### Module
- [ ] Import `TypeOrmModule.forFeature([{Entity}])`
- [ ] Register service dan resolvers sebagai providers
- [ ] Export service jika diperlukan oleh modul lain

### Penamaan
- [ ] Pastikan semua file menggunakan kebab-case
- [ ] Pastikan semua class menggunakan PascalCase
- [ ] Pastikan semua query/mutation menggunakan prefix modul
- [ ] Pastikan semua DTO mengikuti konvensi `{Module}{Action}{Type}`

## Aturan Khusus

### 1. Soft Delete dan Restore
- **SELALU** gunakan soft delete untuk semua entity
- Filter `deletedAt IS NULL` pada semua query
- Gunakan `softDelete()` untuk menghapus data
- **SELALU** sediakan mutation `restore` untuk setiap entity yang memiliki `deletedAt`

**Service pattern untuk remove dan restore:**
```typescript
async remove(id: number): Promise<void> {
  await this.repository.softDelete(id);
}

async restore(id: number): Promise<Entity | null> {
  await this.repository.restore(id);
  return this.findOne(id);
}
```

**Mutation pattern untuk soft delete dan restore (nama GraphQL `Delete`, service boleh `remove()`):**
```typescript
@Mutation(() => Boolean, { name: '{module}Delete' })
@UseGuards(PermissionsGuard)
@Permissions('{module}.delete')
async {module}Delete(
  @Args('id', { type: () => Int }) id: number,
): Promise<boolean> {
  await this.service.remove(id);
  return true;
}

@Mutation(() => {Entity}, {
  name: '{module}Restore',
  nullable: true,
})
@UseGuards(PermissionsGuard)
@Permissions('{module}.restore')
async {module}Restore(
  @Args('id', { type: () => Int }) id: number,
): Promise<{Entity} | null> {
  return this.service.restore(id);
}
```

**Catatan:** Mutation `restore` menggunakan permission `{module}.restore` yang di-seed terpisah untuk resource dengan soft delete

### 2. Permissions dan Guards
- **Default**: Semua query/mutation memerlukan authentication (JWT)
- Gunakan `@Public()` decorator untuk endpoint yang tidak memerlukan auth
- Gunakan `@Permissions('{module}.{action}')` untuk authorization
- Format permission: `{module}.{action}` (contoh: `users.create`, `users.read`, `users.update`, `users.delete`)
- **`PermissionsGuard`:** User dengan role **`superadmin`** **selalu lolos** (bypass pengecekan permission DB), selaras dengan **[FORCE-DELETE-POLICY.md](./FORCE-DELETE-POLICY.md)** / seed admin.
- **`RolesGuard` + `@Roles(...)`:** Pengecekan berdasarkan **kode role** pada JWT. User dengan role **`superadmin` juga selalu lolos** (bypass), agar perilaku konsisten dengan `PermissionsGuard` dan endpoint seperti `usersResetPassword` cukup dekorasi `@Roles('admin')` tanpa menyebut `superadmin` di decorator.

### 3. Import Paths
- Gunakan **relative path** untuk import dalam satu modul dengan extension `.js` (`../dto/index.js`, `../entities/index.js`, dll.)
- Modul domain berada di **`src/resources/`**; modul sejajar (misalnya `auth`, `users`, `roles`) diimpor dengan naik ke folder `resources/` lalu turun ke nama modul tujuan.
- **Dari** `src/resources/{module}/resolvers/*.ts` **ke** auth: `import { PermissionsGuard } from '../../auth/guards/index.js';` (dua tingkat `../` sampai `resources/`, lalu `auth/...`).
- **Dari** `app.module.ts` (di `src/`): `import { XxxModule } from './resources/{module}/{module}.module.js';`
- **Seeders** (`database/seeders/`) mengimpor entity dengan path seperti `../../src/resources/{module}/entities/{entity}.entity.js`.

### 4. Index Files
- **SELALU** buat `index.ts` di setiap subdirektori untuk export
- Ini memudahkan import dan menjaga konsistensi

### 5. Konsistensi Tipe Tanggal (Date vs DateTime)
- GraphQL default **tidak** memiliki scalar `Date`; gunakan custom scalar dari `graphql-scalars`.
- Untuk kolom database `type: 'date'` (tanggal tanpa jam), **WAJIB** gunakan scalar **`Date`** (`DateResolver`), bukan `DateTime`.
- Untuk kolom `timestamp`/`datetime` (misalnya `createdAt`, `updatedAt`, `lastLoginAt`), gunakan `DateTime`.
- Tujuan aturan ini:
  - menghindari error serialisasi seperti `DateTime.serialize("YYYY-MM-DD") returned null`,
  - menjaga kontrak API konsisten dengan tipe kolom database.

**Contoh implementasi date-only (entity / DTO):**
```typescript
import { DateResolver } from 'graphql-scalars';

@Field(() => DateResolver, { description: 'format YYYY-MM-DD' })
@Column({ type: 'date' })
periodStartDate: Date;
```

**Catatan konfigurasi GraphQL (app):**
```typescript
import { DateResolver } from 'graphql-scalars';

GraphQLModule.forRootAsync({
  // ...
  useFactory: () => ({
    // ...
    resolvers: { Date: DateResolver },
  }),
});
```

## Modul yang Sudah Mengikuti Pola Ini

Semua berada di bawah `src/resources/`:

- ✅ `users` — pagination, relasi role
- ✅ `roles` — relasi permission & user
- ✅ `permissions`
- ✅ `units` — pagination
- ✅ `auth` — guards, decorators, strategies, SSO/API
- ✅ `countries` — data GraphQL (tanpa entity TypeORM); folder `types/` untuk `@ObjectType`
- ✅ `achievement-types`, `competition-levels`
- ✅ `user-roles` — assignment user–role dan scope terkait; `unit-fakultas-mappings`
- ✅ `mhs`, `pegawai` — resolver tipis yang mengimpor service dari `auth`

## Catatan Penting

1. **Konsistensi**: Selalu ikuti pola yang sama untuk semua modul
2. **Service Location**: Service HARUS di root modul, bukan di subdirektori
3. **Resolver Separation**: Query dan Mutation HARUS dipisah dalam file terpisah
4. **Naming Convention**: Ikuti konvensi penamaan yang sudah ditetapkan
5. **Index Files**: Selalu buat index.ts untuk memudahkan import
6. **Soft Delete**: Selalu implementasikan soft delete untuk semua entity
7. **Permissions**: Selalu tambahkan permission guard pada resolvers yang memerlukan authorization

## Referensi File

Untuk melihat contoh implementasi lengkap, lihat:
- `src/resources/users/` — modul dengan pagination
- `src/resources/roles/` — modul dengan relasi
- `src/resources/units/` — modul dengan pagination
- `src/resources/auth/` — guards, decorators, strategies
- `src/resources/countries/` — modul tanpa entity DB (perbandingan dengan pola `entities/`)
