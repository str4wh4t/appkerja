import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GetObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3StorageService {
  /** S3_ENDPOINT: upload/delete dari proses BE (mis. hostname Docker). */
  private readonly internalClient: S3Client;
  /** S3_PUBLIC_ENDPOINT: presigned URL yang dibuka browser / host di luar container. */
  private readonly presignClient: S3Client;
  private readonly privateBucket: string;
  private readonly publicBucket: string;
  private readonly internalEndpoint: string;
  private readonly publicEndpoint: string;
  private readonly presignedTtlSeconds: number;

  constructor(private readonly configService: ConfigService) {
    const uploadDisk = this.configService.get<string>('UPLOAD_DISK') ?? 'local';
    this.internalEndpoint = (this.configService.get<string>('S3_ENDPOINT') ?? '').trim();
    const publicRaw = (this.configService.get<string>('S3_PUBLIC_ENDPOINT') ?? '').trim();
    this.publicEndpoint = publicRaw || this.internalEndpoint;
    this.privateBucket = (this.configService.get<string>('S3_BUCKET') ?? '').trim();
    this.publicBucket = (this.configService.get<string>('S3_PUBLIC_BUCKET') ?? '').trim();
    this.presignedTtlSeconds = this.getPresignedTtlSeconds();

    if (uploadDisk === 's3') {
      if (!this.privateBucket || !this.publicBucket) {
        throw new Error(
          'UPLOAD_DISK=s3 requires non-empty S3_BUCKET and S3_PUBLIC_BUCKET',
        );
      }
      if (this.privateBucket === this.publicBucket) {
        throw new Error('S3_BUCKET and S3_PUBLIC_BUCKET must be different');
      }
    }

    const credentials = {
      accessKeyId: this.configService.get<string>('S3_ACCESS_KEY') ?? '',
      secretAccessKey: this.configService.get<string>('S3_SECRET_KEY') ?? '',
    };
    const region = this.configService.get<string>('S3_REGION');
    const clientOpts = (endpoint: string) => ({
      region,
      endpoint: endpoint || undefined,
      forcePathStyle: true as const,
      credentials,
    });

    this.internalClient = new S3Client(clientOpts(this.internalEndpoint));
    this.presignClient = new S3Client(clientOpts(this.publicEndpoint));
  }

  /** Upload ke bucket yang diizinkan; mengembalikan ref `s3://bucket/...`. */
  async uploadObject(
    bucket: string,
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<string> {
    this.assertAllowedBucket(bucket);
    await this.internalClient.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    return this.buildStorageRef(bucket, key);
  }

  async resolveAccessUrl(storedValue: string): Promise<string> {
    const parsed = this.extractBucketAndKey(storedValue);
    if (!parsed) {
      return storedValue;
    }
    return getSignedUrl(
      this.presignClient,
      new GetObjectCommand({
        Bucket: parsed.bucket,
        Key: parsed.key,
      }),
      { expiresIn: this.presignedTtlSeconds },
    );
  }

  /** Hapus objek S3 dari nilai tersimpan (ref internal `s3://...` atau URL legacy). */
  async deleteByStoredValue(storedValue: string): Promise<void> {
    if (!storedValue) {
      return;
    }
    const parsed = this.extractBucketAndKey(storedValue);
    if (!parsed) {
      return;
    }
    await this.internalClient.send(
      new DeleteObjectCommand({
        Bucket: parsed.bucket,
        Key: parsed.key,
      }),
    );
  }

  private allowedBuckets(): string[] {
    return [this.privateBucket, this.publicBucket].filter(
      (b, i, arr) => b && arr.indexOf(b) === i,
    );
  }

  private assertAllowedBucket(bucket: string): void {
    if (!this.allowedBuckets().includes(bucket)) {
      throw new BadRequestException('Invalid S3 bucket');
    }
  }

  private buildStorageRef(bucket: string, key: string): string {
    return `s3://${bucket}/${encodeURIComponent(key)}`;
  }

  private extractBucketAndKey(
    storedValue: string,
  ): { bucket: string; key: string } | null {
    if (!storedValue) {
      return null;
    }
    const s3Scheme = 's3://';
    if (storedValue.startsWith(s3Scheme)) {
      const rest = storedValue.slice(s3Scheme.length);
      const slash = rest.indexOf('/');
      if (slash <= 0 || slash >= rest.length - 1) {
        return null;
      }
      const bucket = rest.slice(0, slash);
      const encodedKey = rest.slice(slash + 1);
      if (!this.allowedBuckets().includes(bucket)) {
        return null;
      }
      const key = encodedKey ? decodeURIComponent(encodedKey) : null;
      if (!key) {
        return null;
      }
      return { bucket, key };
    }

    const bases = [this.internalEndpoint, this.publicEndpoint]
      .map((b) => b.replace(/\/+$/, ''))
      .filter((b, i, arr) => b && arr.indexOf(b) === i);
    for (const base of bases) {
      for (const bucket of this.allowedBuckets()) {
        const legacyBaseUrl = `${base}/${bucket}/`;
        if (storedValue.startsWith(legacyBaseUrl)) {
          return {
            bucket,
            key: decodeURIComponent(storedValue.slice(legacyBaseUrl.length)),
          };
        }
      }
    }
    return null;
  }

  private getPresignedTtlSeconds(): number {
    const raw = this.configService.get<string>(
      'S3_PRESIGNED_EXPIRES_IN_SECONDS',
    );
    const parsed = raw ? Number.parseInt(raw, 10) : NaN;
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
    return 900;
  }
}
