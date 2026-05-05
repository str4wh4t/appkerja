/**
 * Menjalankan seluruh seeder berurutan (satu koneksi DB).
 *
 * CLI: `bun run seed:all`
 *
 * Urutan ada di `SEEDER_ORDER` — harus sama persis dengan file `*.seeder.ts` di folder ini
 * (diverifikasi saat runtime). Seeder baru: tambah file `*.seeder.ts`, lalu tambah nama kebab
 * ke `SEEDER_ORDER` di urutan dependensi.
 * Satu seeder saja: `bun run seed -- <nama-kebab>` — lihat `run-seeder.ts`.
 */
import { readdirSync } from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';
import dataSource from '../data-source.js';
import { kebabToSeedFunctionName } from './run-seeder.js';

const seedersDir = path.join(process.cwd(), 'database', 'seeders');

/** Urutan eksekusi (dependensi). Harus 1:1 dengan setiap `*.seeder.ts` di folder ini. */
const SEEDER_ORDER = [
  'tenants',
  'user-statuses',
  'users',
  'user-tenants',
  'roles',
  'permissions',
  'role-permissions',
  'user-roles',
] as const;

function assertSeederOrderMatchesDisk(): void {
  const onDisk = readdirSync(seedersDir)
    .filter((f) => f.endsWith('.seeder.ts'))
    .map((f) => f.replace(/\.seeder\.ts$/, ''))
    .sort();
  const registered = [...SEEDER_ORDER].sort();
  if (
    onDisk.length !== registered.length ||
    onDisk.some((n, i) => n !== registered[i])
  ) {
    throw new Error(
      `seed-all: SEEDER_ORDER tidak cocok dengan *.seeder.ts di folder ini.\n` +
        `  Disk:    [${onDisk.join(', ')}]\n` +
        `  Daftar:  [${registered.join(', ')}]\n` +
        `Perbarui SEEDER_ORDER setelah menambah/menghapus seeder.`,
    );
  }
}

export async function runAllSeeders(): Promise<void> {
  assertSeederOrderMatchesDisk();

  try {
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
      console.log('✓ Database connection initialized (seed:all)');
    }

    for (const kebab of SEEDER_ORDER) {
      let mod: Record<string, unknown>;
      try {
        mod = (await import(
          pathToFileURL(path.join(seedersDir, `${kebab}.seeder.ts`)).href
        )) as Record<string, unknown>;
      } catch {
        mod = (await import(
          pathToFileURL(path.join(seedersDir, `${kebab}.seeder.js`)).href
        )) as Record<string, unknown>;
      }
      const fnName = kebabToSeedFunctionName(kebab);
      const fn = mod[fnName];
      if (typeof fn !== 'function') {
        throw new Error(
          `${kebab}.seeder.ts — export "${fnName}" tidak ada (harus: export async function ${fnName}() { ... })`,
        );
      }
      await (fn as () => Promise<void>)();
    }

    console.log('✓ All seeders completed');
  } catch (error) {
    console.error('✗ Error running all seeders:', error);
    throw error;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('✓ Database connection closed (seed:all)');
    }
  }
}

if (require.main === module) {
  runAllSeeders()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
