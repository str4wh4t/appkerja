import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { Writable } from 'stream';
import { pipeline } from 'stream/promises';
import { S3StorageService } from './s3-storage.service.js';
import { FileUpload } from 'graphql-upload-ts';

/**
 * MIME -> ekstensi file (semua format yang didukung upload).
 */
const MIME_TO_EXT: Record<string, string> = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    '.pptx',
  'application/zip': '.zip',
};

/**
 * Label di kolom document_attach_types.allowedFormats (mis. "JPG, PNG, PDF") -> MIME.
 */
const EXT_LABEL_TO_MIME: Record<string, string> = {
  JPG: 'image/jpeg',
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  PDF: 'application/pdf',
  DOC: 'application/msword',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLS: 'application/vnd.ms-excel',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PPT: 'application/vnd.ms-powerpoint',
  PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ZIP: 'application/zip',
};

/** Default batas ukuran (MB) jika env tidak di-set / tidak valid. */
const DEFAULT_DOCUMENT_UPLOAD_MAX_MB = 5;

/**
 * Kunci pada objek error: stream `FileUpload` sudah habis dibaca sebelum error dilempar
 * (mis. validasi ukuran setelah `readUploadToBuffer`). Pemanggil yang meng-drain sisa upload
 * dalam loop harus mulai dari **indeks berikutnya**, bukan meng-drain file gagal lagi.
 */
export const UPLOAD_STREAM_FULLY_CONSUMED_KEY =
  'uploadStreamFullyConsumed' as const;

/**
 * Tandai exception (biasanya `BadRequestException`) setelah stream upload penuh dibaca.
 * Dipakai bersama {@link getUploadDrainStartIndexAfterError} di loop drain mutation lain.
 */
export function markErrorUploadStreamFullyConsumed(
  ex: BadRequestException,
): BadRequestException & Record<string, boolean> {
  const marked = ex as BadRequestException & Record<string, boolean>;
  marked[UPLOAD_STREAM_FULLY_CONSUMED_KEY] = true;
  return marked;
}

/**
 * Indeks mulai drain setelah error di item ke-`failedAtIndexInclusive`:
 * jika error membawa {@link UPLOAD_STREAM_FULLY_CONSUMED_KEY}, stream item itu sudah habis → drain dari `index + 1`.
 */
export function getUploadDrainStartIndexAfterError(
  err: unknown,
  failedAtIndexInclusive: number,
): number {
  if (
    typeof err === 'object' &&
    err !== null &&
    (err as Record<string, unknown>)[UPLOAD_STREAM_FULLY_CONSUMED_KEY] === true
  ) {
    return failedAtIndexInclusive + 1;
  }
  return failedAtIndexInclusive;
}

/** Batas ukuran upload file dari env `DOCUMENT_UPLOAD_MAX_MB`. */
export function getDocumentUploadMaxFromConfig(configService: ConfigService): {
  mb: number;
  label: string;
  maxBytes: number;
} {
  const raw = configService.get<string>('DOCUMENT_UPLOAD_MAX_MB');
  const parsed =
    raw != null && String(raw).trim() !== ''
      ? Number.parseFloat(String(raw).trim())
      : NaN;
  const mb =
    Number.isFinite(parsed) && parsed > 0
      ? parsed
      : DEFAULT_DOCUMENT_UPLOAD_MAX_MB;
  const label = Number.isInteger(mb) ? String(mb) : String(mb);
  const maxBytes = Math.floor(mb * 1024 * 1024);
  return { mb, label, maxBytes };
}

/** Default jika allowedFormats kosong / tidak menghasilkan MIME valid. */
function defaultAllowedMimeTypes(): Set<string> {
  return new Set(['application/pdf', 'image/jpeg', 'image/png']);
}

/**
 * Mem-parse nilai `document_attach_types.allowedFormats` (contoh: "JPG, PNG, PDF").
 * Mengembalikan `null` jika string kosong / hanya spasi / tidak ada token yang dikenal → pemanggil memakai default.
 */
export function parseAllowedFormatsToMimeSet(
  allowedFormats: string | null | undefined,
): Set<string> | null {
  if (allowedFormats == null) {
    return null;
  }
  const trimmed = allowedFormats.trim();
  if (trimmed === '') {
    return null;
  }
  const mimes = new Set<string>();
  for (const part of trimmed.split(/[,;]+/)) {
    const label = part.trim().toUpperCase();
    if (!label) {
      continue;
    }
    const mime = EXT_LABEL_TO_MIME[label];
    if (mime) {
      mimes.add(mime);
    }
  }
  return mimes.size > 0 ? mimes : null;
}

@Injectable()
export class UploadService {
  constructor(
    private readonly configService: ConfigService,
    private readonly s3StorageService: S3StorageService,
  ) {}

  /**
   * Avatar dari multipart GraphQL: JPEG atau PNG, disimpan sebagai `avatars/{userId}.jpg|.png`.
   */
  async saveAvatarFromUpload(
    upload: FileUpload,
    userId: string,
    options?: { isPublicUpload?: boolean },
  ): Promise<string> {
    const mime = upload.mimetype.toLowerCase().trim();
    if (mime !== 'image/jpeg' && mime !== 'image/png') {
      throw new BadRequestException('Avatar harus berformat JPEG atau PNG');
    }
    const ext = MIME_TO_EXT[mime];
    if (!ext) {
      throw new BadRequestException('Format avatar tidak didukung');
    }

    const buffer = await this.readUploadToBuffer(upload);
    const { label, maxBytes } = getDocumentUploadMaxFromConfig(
      this.configService,
    );
    if (buffer.length > maxBytes) {
      throw markErrorUploadStreamFullyConsumed(
        new BadRequestException(`Ukuran avatar maksimal ${label}MB`),
      );
    }

    const key = `avatars/${userId}${ext}`;
    const isPublic = options?.isPublicUpload === true;
    return this.persistUpload(key, buffer, mime, isPublic);
  }

  /**
   * Avatar dari URL eksternal (mis. Google userinfo), disimpan ke storage aplikasi.
   * Hanya menerima HTTPS dengan MIME image/jpeg atau image/png.
   */
  async saveAvatarFromExternalUrl(
    externalUrl: string,
    userId: string,
    options?: { isPublicUpload?: boolean },
  ): Promise<string> {
    const raw = String(externalUrl || '').trim();
    if (!/^https:\/\//i.test(raw)) {
      throw new BadRequestException('Avatar URL eksternal harus HTTPS');
    }

    const response = await fetch(raw);
    if (!response.ok) {
      throw new BadRequestException(
        `Gagal mengambil avatar eksternal (HTTP ${response.status})`,
      );
    }

    const contentType = String(response.headers.get('content-type') || '')
      .split(';')[0]
      ?.trim()
      .toLowerCase();
    const mime =
      contentType === 'image/jpg'
        ? 'image/jpeg'
        : contentType === 'image/jpeg' || contentType === 'image/png'
          ? contentType
          : '';

    if (!mime) {
      throw new BadRequestException('Avatar eksternal harus berformat JPEG atau PNG');
    }

    const ext = MIME_TO_EXT[mime];
    if (!ext) {
      throw new BadRequestException('Format avatar eksternal tidak didukung');
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const { label, maxBytes } = getDocumentUploadMaxFromConfig(
      this.configService,
    );
    if (buffer.length > maxBytes) {
      throw new BadRequestException(`Ukuran avatar maksimal ${label}MB`);
    }

    const key = `avatars/${userId}${ext}`;
    const isPublic = options?.isPublicUpload === true;
    return this.persistUpload(key, buffer, mime, isPublic);
  }

  /**
   * Mengosongkan stream upload (graphql-upload / fs-capacitor) tanpa menyimpan.
   * Penting dipanggil saat error sebelum stream dibaca penuh — mencegah request berikutnya
   * pada koneksi keep-alive terasa lambat.
   */
  async drainFileUploadForCleanup(
    uploadPromise: Promise<FileUpload>,
  ): Promise<void> {
    try {
      const file = await uploadPromise;
      await this.drainFileUploadStream(file);
    } catch {
      // sudah konsumsi, ditolak, atau tidak ada stream — abaikan
    }
  }

  /**
   * Traverse `variables` / body GraphQL untuk Promise/FileUpload yang tidak sempat dibaca resolver
   * (mis. error coercion `Upload!` sebelum eksekusi). Dipanggil dari plugin Apollo `didEncounterErrors`.
   */
  async drainPossibleUploadValuesDeep(value: unknown): Promise<void> {
    await this.drainUnknownUploadDeep(value, new WeakSet<object>());
  }

  private async drainUnknownUploadDeep(
    value: unknown,
    seen: WeakSet<object>,
  ): Promise<void> {
    if (value == null) {
      return;
    }
    const t = typeof value;
    if (t === 'boolean' || t === 'number' || t === 'bigint' || t === 'symbol') {
      return;
    }
    if (t === 'string') {
      return;
    }
    if (typeof value === 'object') {
      if (value instanceof Buffer) {
        return;
      }
      const asUpload = value as FileUpload;
      if (typeof asUpload.createReadStream === 'function') {
        await this.drainFileUploadForCleanup(Promise.resolve(asUpload));
        return;
      }
      const thenFn = (value as { then?: unknown }).then;
      if (typeof thenFn === 'function') {
        try {
          const resolved = await (value as PromiseLike<unknown>);
          await this.drainUnknownUploadDeep(resolved, seen);
        } catch {
          /* reject promise upload */
        }
        return;
      }
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
      if (Array.isArray(value)) {
        for (const item of value) {
          await this.drainUnknownUploadDeep(item, seen);
        }
        return;
      }
      const rec = value as Record<string, unknown>;
      for (const key of Object.keys(rec)) {
        await this.drainUnknownUploadDeep(rec[key], seen);
      }
    }
  }

  private async drainFileUploadStream(file: FileUpload): Promise<void> {
    try {
      const stream = file.createReadStream();
      await pipeline(
        stream,
        new Writable({
          write(_chunk, _encoding, cb) {
            cb();
          },
        }),
      );
    } catch {
      /* stream sudah habis / rusak / dibatalkan — abaikan */
    }
  }

  async saveAchievementDocumentFromUpload(
    upload: FileUpload,
    achievementId: string,
    allowedFormatsFromDb?: string | null,
  ): Promise<string> {
    const mime = upload.mimetype.toLowerCase().trim();
    const ext = MIME_TO_EXT[mime];
    if (!ext) {
      throw new BadRequestException(
        'Format file tidak didukung oleh sistem (MIME tidak dikenali)',
      );
    }

    const allowedMimes =
      parseAllowedFormatsToMimeSet(allowedFormatsFromDb) ??
      defaultAllowedMimeTypes();

    if (!allowedMimes.has(mime)) {
      const labels = mimeSetToAllowedLabels(allowedMimes);
      throw new BadRequestException(
        `Tipe file tidak diizinkan untuk jenis lampiran ini. Diizinkan: ${labels.join(', ')}`,
      );
    }

    const buffer = await this.readUploadToBuffer(upload);
    const { label, maxBytes } = getDocumentUploadMaxFromConfig(
      this.configService,
    );
    if (buffer.length > maxBytes) {
      throw markErrorUploadStreamFullyConsumed(
        new BadRequestException(`Ukuran file maksimal ${label}MB`),
      );
    }

    const key = `achievement-documents/${achievementId}/${randomUUID()}${ext}`;
    return this.persistUpload(key, buffer, mime, false);
  }

  private async readUploadToBuffer(upload: FileUpload): Promise<Buffer> {
    const stream = upload.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  private async persistUpload(
    key: string,
    buffer: Buffer,
    mime: string,
    isPublicUpload = false,
  ): Promise<string> {
    const uploadDisk = this.configService.get<string>('UPLOAD_DISK') ?? 'local';

    if (uploadDisk === 'local') {
      const uploadsRoot = path.join(process.cwd(), 'uploads');
      const filePath = path.join(uploadsRoot, key);
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      await fs.promises.writeFile(filePath, buffer);
      return `/uploads/${key}`;
    }

    const privateBucket = (this.configService.get<string>('S3_BUCKET') ?? '').trim();
    const publicBucket = (
      this.configService.get<string>('S3_PUBLIC_BUCKET') ?? ''
    ).trim();
    const bucket = isPublicUpload ? publicBucket : privateBucket;
    return this.s3StorageService.uploadObject(bucket, key, buffer, mime);
  }

  /**
   * Hapus satu file yang sudah tertulis ke penyimpanan, dari URL yang dikembalikan alur upload
   * (lokal: `/uploads/...` untuk semua key yang ditulis lewat `persistUpload`, `saveAvatarFromUpload`, dokumen achievement;
   * S3: ref `s3://bucket/key`).
   * Dipakai saat rollback: transaksi / alur multi-langkah gagal setelah sebagian file sudah tersimpan.
   * Folder induk di disk tidak dihapus (boleh kosong), agar struktur direktori tetap bisa dipakai upload lain.
   */
  async deleteStoredUploadByUrl(documentUrl: string): Promise<void> {
    if (!documentUrl) {
      return;
    }
    const uploadDisk = this.configService.get<string>('UPLOAD_DISK') ?? 'local';
    if (uploadDisk === 'local') {
      if (!documentUrl.startsWith('/uploads/')) {
        return;
      }
      const rel = documentUrl.slice('/uploads/'.length);
      const filePath = path.join(process.cwd(), 'uploads', rel);
      try {
        await fs.promises.unlink(filePath);
      } catch (e: unknown) {
        const code = (e as NodeJS.ErrnoException)?.code;
        if (code !== 'ENOENT') {
          throw e;
        }
      }
      return;
    }
    await this.s3StorageService.deleteByStoredValue(documentUrl);
  }

  /**
   * Resolve nilai tersimpan upload (lokal/S3) menjadi URL akses untuk klien.
   * - local: path `/uploads/...` — jika `APP_URL` di-set (origin publik aplikasi/API, tanpa trailing slash),
   *   digabung menjadi URL absolut agar klien beda origin bisa memuat aset.
   * - s3: ref internal/URL legacy dikonversi menjadi presigned URL sementara
   */
  async resolveStoredUploadUrl(
    storedValue: string | null | undefined,
  ): Promise<string | null> {
    if (!storedValue) {
      return null;
    }
    const uploadDisk = this.configService.get<string>('UPLOAD_DISK') ?? 'local';
    if (uploadDisk === 'local') {
      if (/^https?:\/\//i.test(storedValue)) {
        return storedValue;
      }
      const rawBase = this.configService.get<string>('APP_URL') ?? '';
      const base = String(rawBase).trim().replace(/\/+$/, '');
      if (
        base &&
        storedValue.startsWith('/') &&
        !storedValue.startsWith('//')
      ) {
        return `${base}${storedValue}`;
      }
      return storedValue;
    }
    return this.s3StorageService.resolveAccessUrl(storedValue);
  }
}

function mimeSetToAllowedLabels(mimes: Set<string>): string[] {
  const labels: string[] = [];
  const seen = new Set<string>();
  for (const [label, mime] of Object.entries(EXT_LABEL_TO_MIME)) {
    if (mimes.has(mime) && !seen.has(mime)) {
      seen.add(mime);
      labels.push(label);
    }
  }
  return labels.sort();
}
