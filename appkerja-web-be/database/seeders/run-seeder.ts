/**
 * CLI tunggal untuk seeder: tidak perlu menambah script npm per file.
 *
 *   bun run seed -- <nama-file-kebab>   contoh: bun run seed -- user-statuses
 *   bun run seed -- --help              daftar seeder yang dikenali
 *
 * Semua seeder: bun run seed:all
 */
import { readdirSync } from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';

const seedersDir = path.join(process.cwd(), 'database', 'seeders');

/** `user-statuses` → `seedUserStatuses` (sama dengan konvensi export di *.seeder.ts) */
export function kebabToSeedFunctionName(kebab: string): string {
  const parts = kebab.split('-').filter(Boolean);
  const pascal = parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join('');
  return `seed${pascal}`;
}

function listSeederKebabNames(): string[] {
  return readdirSync(seedersDir)
    .filter((f) => f.endsWith('.seeder.ts') && !f.startsWith('run-seeder'))
    .map((f) => f.replace(/\.seeder\.ts$/, ''))
    .sort();
}

function printHelp(exitCode: number): void {
  const names = listSeederKebabNames();
  console.log(`
Usage:
  bun run seed -- <nama-seeder>

Nama seeder = nama file tanpa ".seeder.ts" (kebab-case), contoh:
  bun run seed -- users
  bun run seed -- document-attach-types

Jalankan semua seeder (urutan seed-all.ts):
  bun run seed:all

Seeder tersedia (${names.length}):
  ${names.join(', ')}
`);
  process.exit(exitCode);
}

async function main(): Promise<void> {
  const raw = process.argv.slice(2);
  const arg = raw[0];

  if (!arg || arg === '--help' || arg === '-h') {
    printHelp(arg ? 0 : 1);
  }

  const fnName = kebabToSeedFunctionName(arg);
  let mod: Record<string, unknown>;
  try {
    try {
      mod = (await import(
        pathToFileURL(path.join(seedersDir, `${arg}.seeder.ts`)).href
      )) as Record<string, unknown>;
    } catch {
      mod = (await import(
        pathToFileURL(path.join(seedersDir, `${arg}.seeder.js`)).href
      )) as Record<string, unknown>;
    }
  } catch (e) {
    console.error(
      `✗ Tidak bisa memuat ./${arg}.seeder.ts — pastikan file ada dan nama benar.`,
    );
    console.error(e);
    process.exit(1);
  }

  const fn = mod[fnName];
  if (typeof fn !== 'function') {
    console.error(
      `✗ Export "${fnName}" tidak ada di ${arg}.seeder.ts (diharapkan: export async function ${fnName}() { ... })`,
    );
    process.exit(1);
  }

  await (fn as () => Promise<void>)();
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
