import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { PlatformAuthModule } from '@/shared/auth/platform/auth.module';
import { Module } from '@nestjs/common';
import { ProfessionalsController } from './professional.controller';
import { ProfessionalsService } from './professional.service';
import { UploadService } from '@/shared/upload/upload.service';
import { ObjectStorageService } from '@/shared/upload/object-storage.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PlatformAuthModule, ConfigModule],
  providers: [
    PostgresPrismaService,
    ProfessionalsService,
    UploadService,
    ObjectStorageService,
  ],
  controllers: [ProfessionalsController],
})
export class ProfessionalModule {}
