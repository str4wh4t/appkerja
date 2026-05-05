import { Module } from '@nestjs/common';
import { S3StorageService } from './s3-storage.service.js';
import { UploadService } from './upload.service.js';

@Module({
  providers: [S3StorageService, UploadService],
  exports: [S3StorageService, UploadService],
})
export class StorageModule {}
