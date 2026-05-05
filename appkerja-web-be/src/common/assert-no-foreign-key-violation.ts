import { ConflictException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

/** MySQL InnoDB: cannot delete or update a parent row: a foreign key constraint fails */
const MYSQL_ERRNO_ROW_IS_REFERENCED = 1451;

/**
 * Memetakan pelanggaran FK (RESTRICT) ke respons API. Untuk CASCADE, DB menghapus anak tanpa error.
 */
export function assertNoForeignKeyViolation(error: unknown): never {
  if (error instanceof QueryFailedError) {
    const errno = (error.driverError as { errno?: number } | undefined)?.errno;
    if (errno === MYSQL_ERRNO_ROW_IS_REFERENCED) {
      throw new ConflictException(
        'Penghapusan permanen ditolak: masih ada data lain yang mereferensi ke record ini (constraint database).',
      );
    }
  }
  throw error;
}
