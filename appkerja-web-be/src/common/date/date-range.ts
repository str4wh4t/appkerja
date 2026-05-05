import { BadRequestException } from '@nestjs/common';
import { compareAsc, startOfDay } from 'date-fns';

/**
 * true jika hari kalender `endDate` sebelum hari kalender `startDate`
 * (perbandingan pakai startOfDay — aman untuk nilai Date dari GraphQL / DB).
 */
export function isCalendarEndBeforeStart(
  startDate: Date,
  endDate: Date,
): boolean {
  return compareAsc(startOfDay(startDate), startOfDay(endDate)) > 0;
}

/**
 * Lempar BadRequestException jika tanggal selesai sebelum tanggal mulai (hari kalender).
 */
export function assertEndOnOrAfterStart(
  startDate: Date,
  endDate: Date,
  message?: string,
): void {
  if (isCalendarEndBeforeStart(startDate, endDate)) {
    throw new BadRequestException(
      message ?? 'Tanggal selesai tidak boleh sebelum tanggal mulai.',
    );
  }
}
