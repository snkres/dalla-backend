import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { PlatformAuthModule } from '@/shared/auth/platform/auth.module';
import { Module } from '@nestjs/common';
import { ProfessionalsController } from './professional.controller';
import { ProfessionalsService } from './professional.service';
import { UploadService } from '@/shared/upload/upload.service';
import { ObjectStorageService } from '@/shared/upload/object-storage.service';
import { ConfigModule } from '@nestjs/config';
import { JWTService } from '@/shared/auth/miscs/jwt';
import { ProjectService } from '@/projects/projects.service';
import { ProposalsService } from '@/proposals/proposals.service';
import { CompanyService } from '@/companies/company.service';
import { NotificationModule } from '@/notification/notification.module';

@Module({
  imports: [PlatformAuthModule, ConfigModule, NotificationModule],
  providers: [
    PostgresPrismaService,
    ProfessionalsService,
    CompanyService,
    UploadService,
    ObjectStorageService,
    JWTService,
    ProjectService,
    ProposalsService,
  ],
  controllers: [ProfessionalsController],
})
export class ProfessionalModule {}
