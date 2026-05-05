import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import { describe, it, expect, jest } from 'bun:test';
import { UploadService } from './upload.service.js';
import { S3StorageService } from './s3-storage.service.js';
import { FileUpload } from 'graphql-upload-ts';

describe('UploadService', () => {
  describe('saveAvatarFromUpload', () => {
    const TEST_USER_ID = 'test-user-id';

    const attachmentPath =
      '/Users/the-black-pearl/.cursor/projects/Users-the-black-pearl-Repositories-pres-api/assets/1705297922096-f8b480fd-9b35-41c6-aeb3-a1811cb89abd.png';

    it('should save avatar from multipart stream locally and return URL', async () => {
      if (!fs.existsSync(attachmentPath)) {
        console.warn('Attachment file not found, skipping avatar test.');
        return;
      }

      const fileBuffer = fs.readFileSync(attachmentPath);

      const upload = {
        mimetype: 'image/jpeg',
        filename: 'avatar.jpg',
        encoding: '7bit',
        createReadStream: () => Readable.from([fileBuffer]),
      } as FileUpload;

      const configService: any = {
        get: (key: string) => {
          if (key === 'UPLOAD_DISK') return 'local';
          if (key === 'DOCUMENT_UPLOAD_MAX_MB') return '5';
          return undefined;
        },
      };

      const s3StorageService = {
        uploadObject: jest.fn(),
      } as unknown as S3StorageService;

      const uploadService = new UploadService(configService, s3StorageService);

      const url = await uploadService.saveAvatarFromUpload(
        upload,
        TEST_USER_ID,
      );

      expect(url).toBe(`/uploads/avatars/${TEST_USER_ID}.jpg`);

      const savedPath = path.join(
        process.cwd(),
        'uploads',
        'avatars',
        `${TEST_USER_ID}.jpg`,
      );
      expect(fs.existsSync(savedPath)).toBe(true);
    });
  });
});
