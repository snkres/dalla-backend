import { Injectable } from '@nestjs/common';
import { ObjectStorageService } from './object-storage.service';
import 'multer';

@Injectable()
export class UploadService {
  constructor(private readonly objectStorageService: ObjectStorageService) {}

  async uploadFile(file: Express.Multer.File) {
    const { originalname } = file;
    const UUID = crypto.randomUUID().split('-')[2];

    await this.objectStorageService.uploadFile(
      file.buffer,
      originalname + UUID,
      file.mimetype,
      { 'x-amz-meta-logo': originalname },
    );

    const hash = `${String(originalname + UUID)}`;
    return `${this.objectStorageService.getCdnEndpoint()}${hash}`;
  }
}
