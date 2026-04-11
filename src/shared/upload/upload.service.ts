import { Injectable } from '@nestjs/common';
import { ObjectStorageService } from './object-storage.service';
import 'multer';
import { customUUID } from '../utils/unique-id';

@Injectable()
export class UploadService {
  constructor(private readonly objectStorageService: ObjectStorageService) {}

  async uploadFile(file: Express.Multer.File) {
    const { originalname } = file;
    // const ext = originalname.split('.')[1];
    const UUID = customUUID(16);

    await this.objectStorageService.uploadFile(
      file.buffer,
      UUID,
      file.mimetype,
      { 'x-amz-meta-name': originalname },
    );

    const hash = `${String(UUID)}`;
    return `${this.objectStorageService.getPublicEndpoint()}${hash}`;
  }
}
