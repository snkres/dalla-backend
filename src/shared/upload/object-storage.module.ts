import { Module } from '@nestjs/common';
import { ObjectStorageService } from './object-storage.service';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { PlatformAuthModule } from '../auth/platform/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { JWTService } from '../auth/miscs/jwt';

@Module({
  imports: [PlatformAuthModule, ConfigModule],
  controllers: [UploadController],
  providers: [
    ObjectStorageService,
    UploadService,
    PostgresPrismaService,
    JWTService,
  ],
  exports: [ObjectStorageService],
})
export class ObjectStorageModule {}
