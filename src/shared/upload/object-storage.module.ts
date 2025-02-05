import { Module } from '@nestjs/common';
import { ObjectStorageService } from './object-storage.service';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  controllers: [UploadController],
  providers: [ObjectStorageService, UploadService],
  exports: [ObjectStorageService],
})
export class ObjectStorageModule {}
