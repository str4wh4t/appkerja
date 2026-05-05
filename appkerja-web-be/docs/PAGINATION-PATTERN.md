# Pola Pagination untuk GraphQL Resolvers

## Overview
Dokumen ini menjelaskan pola standar untuk mengimplementasikan pagination pada GraphQL resolvers di aplikasi NestJS ini. Pola ini telah diterapkan pada modul `users` dan `units`.

## Struktur File yang Dibutuhkan

Untuk setiap modul yang memerlukan pagination, buat file-file berikut di direktori `dto/`:

1. `{module}-pagination.input.ts` - Input DTO untuk pagination
2. `{module}-pagination-response.type.ts` - Response type untuk pagination

## 1. Pagination Input DTO

**File:** `src/{module}/dto/{module}-pagination.input.ts`

```typescript
import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, Min, Max, IsBoolean } from 'class-validator';

@InputType()
export class {Module}PaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @Field({ nullable: true })
  @IsOptional()
  search?: string;

  @Field({ nullable: true, defaultValue: 'createdAt' })
  @IsOptional()
  sortBy?: string = 'createdAt';

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  descending?: boolean = true;
}
```

**Aturan:**
- `page`: Minimal 1, default 1
- `limit`: Minimal 1, maksimal 100, default 10
- `search`: Opsional, untuk pencarian teks
- `sortBy`: Default 'createdAt', harus divalidasi di service dengan whitelist
- `descending`: Default true (DESC), false untuk ASC

## 2. Pagination Response Type

**File:** `src/{module}/dto/{module}-pagination-response.type.ts`

```typescript
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { {Entity} } from '../entities/{entity}.entity';

@ObjectType()
export class {Module}PaginationResponse {
  @Field(() => [{Entity}])
  data: {Entity}[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Boolean)
  hasNextPage: boolean;

  @Field(() => Boolean)
  hasPreviousPage: boolean;
}
```

**Aturan:**
- Selalu include field: `data`, `total`, `page`, `limit`, `totalPages`, `hasNextPage`, `hasPreviousPage`
- `totalPages` dihitung dengan `Math.ceil(total / limit)`
- `hasNextPage` = `page < totalPages`
- `hasPreviousPage` = `page > 1`

## 3. Export di index.ts

**File:** `src/{module}/dto/index.ts`

Tambahkan export:
```typescript
export * from './{module}-pagination.input';
export * from './{module}-pagination-response.type';
```

## 4. Service Method

**File:** `src/{module}/{module}.service.ts`

```typescript
async findAllPaginated(
  page: number = 1,
  limit: number = 10,
  search?: string,
  sortBy: string = 'createdAt',
  descending: boolean = true,
): Promise<{
  data: {Entity}[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}> {
  const skip = (page - 1) * limit;

  // Build query builder
  const queryBuilder = this.{entity}Repository
    .createQueryBuilder('{entity}')
    .where('{entity}.deletedAt IS NULL');

  // Add relations jika diperlukan
  // queryBuilder.leftJoinAndSelect('{entity}.relation', 'relation');

  // Add search condition if provided
  if (search) {
    queryBuilder.andWhere(
      '({entity}.field1 LIKE :search OR {entity}.field2 LIKE :search OR ...)',
      { search: `%${search}%` },
    );
  }

  // Validate and set sortBy field (PENTING: prevent SQL injection)
  const allowedSortFields = ['createdAt', 'updatedAt', 'field1', 'field2', ...];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const sortOrder = descending ? 'DESC' : 'ASC';

  // Get total count
  const total = await queryBuilder.getCount();

  // Get paginated data
  const data = await queryBuilder
    .orderBy(`{entity}.${sortField}`, sortOrder)
    .skip(skip)
    .take(limit)
    .getMany();

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
```

**Aturan Penting:**
1. **Security**: SELALU validasi `sortBy` dengan whitelist `allowedSortFields` untuk mencegah SQL injection
2. Gunakan `QueryBuilder` untuk fleksibilitas search dan sorting
3. Untuk soft delete, selalu filter `deletedAt IS NULL`
4. Gunakan `skip` dan `take` untuk pagination
5. Hitung `total` SEBELUM mengambil data (untuk performa)

## 5. Resolver Query

**File:** `src/{module}/resolvers/{module}.query.ts`

```typescript
import {
  {Module}PaginationInput,
  {Module}PaginationResponse,
} from '../dto';

@Query(() => {Module}PaginationResponse, { name: '{module}FindAllPaginated' })
@UseGuards(PermissionsGuard)
@Permissions('{module}.read')
async findAllPaginated(
  @Args('paginationInput', { nullable: true }) paginationInput?: {Module}PaginationInput,
): Promise<{Module}PaginationResponse> {
  const page = paginationInput?.page || 1;
  const limit = paginationInput?.limit || 10;
  const search = paginationInput?.search;
  const sortBy = paginationInput?.sortBy || 'createdAt';
  const descending = paginationInput?.descending ?? true;

  return this.{module}Service.findAllPaginated(page, limit, search, sortBy, descending);
}
```

**Aturan:**
- Nama query: `{module}FindAllPaginated` (mengikuti konvensi prefix module)
- `paginationInput` harus nullable dengan default values
- Gunakan `??` untuk `descending` karena default adalah `true` (bukan falsy value)
- Tetap pertahankan query `{module}FindAll` yang lama untuk backward compatibility

## Contoh Implementasi Lengkap

### Users Module

**Input DTO:** `src/users/dto/user-pagination.input.ts`
- Search fields: username, email, firstName, lastName
- Allowed sort fields: createdAt, updatedAt, username, email, firstName, lastName
- **`withDeleted`** (default `false`): jika `true`, query hanya baris soft-deleted (`deletedAt IS NOT NULL`); jika `false`, hanya baris aktif.

**Service:** `src/users/users.service.ts`
- Method: `findAllPaginated`
- Relations: status, roles, roles.permissions

**Query:** `usersFindAllPaginated`

### Units Module

**Input DTO:** `src/units/dto/unit-pagination.input.ts`
- Search fields: code, name, description
- Allowed sort fields: createdAt, updatedAt, code, name

**Service:** `src/units/units.service.ts`
- Method: `findAllPaginated`
- No relations needed

**Query:** `unitsFindAllPaginated`

## Contoh GraphQL Query

```graphql
query {
  usersFindAllPaginated(
    paginationInput: {
      page: 1
      limit: 10
      search: "john"
      sortBy: "username"
      descending: false
      withDeleted: false
    }
  ) {
    data {
      id
      username
      email
      firstName
      lastName
    }
    total
    page
    limit
    totalPages
    hasNextPage
    hasPreviousPage
  }
}
```

## Checklist Implementasi

Saat menambahkan pagination ke modul baru, pastikan:

- [ ] Buat `{module}-pagination.input.ts` dengan semua field standar
- [ ] Buat `{module}-pagination-response.type.ts` dengan semua field response
- [ ] Export kedua file di `dto/index.ts`
- [ ] Implementasi method `findAllPaginated` di service dengan:
  - [ ] QueryBuilder untuk fleksibilitas
  - [ ] Whitelist validation untuk `sortBy` (security)
  - [ ] Search condition yang sesuai dengan entity
  - [ ] Proper pagination calculation
- [ ] Tambahkan query `{module}FindAllPaginated` di resolver
- [ ] Test dengan berbagai kombinasi parameter
- [ ] Pastikan permission guard dan decorator sudah benar

## Catatan Penting

1. **Security First**: SELALU validasi `sortBy` dengan whitelist untuk mencegah SQL injection
2. **Performance**: Hitung `total` sebelum mengambil data, gunakan index pada kolom yang sering di-sort
3. **Consistency**: Gunakan pola yang sama untuk semua modul yang memerlukan pagination
4. **Backward Compatibility**: Jangan hapus query `findAll` yang lama, tambahkan query pagination sebagai alternatif
5. **Default Values**: Selalu sediakan default values yang masuk akal (page: 1, limit: 10, sortBy: 'createdAt', descending: true)

## Modul yang Sudah Mengimplementasikan

- ✅ `users` - Implementasi lengkap dengan search dan sorting
- ✅ `units` - Implementasi lengkap dengan search dan sorting

## Modul yang Belum Memerlukan Pagination

- `roles` - Belum diperlukan
- `permissions` - Belum diperlukan
- `auth` - Tidak memerlukan pagination
