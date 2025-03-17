import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { PlatformAuthModule } from '@/shared/auth/platform/auth.module';
import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { ProjectService } from '@/projects/projects.service';
import { JWTService } from '@/shared/auth/miscs/jwt';
import { ProposalsModule } from '@/proposals/proposals.module';
import { ProfessionalsService } from '@/professionals/professional.service';
import { UploadService } from '@/shared/upload/upload.service';
import { ObjectStorageService } from '@/shared/upload/object-storage.service';

@Module({
  imports: [PlatformAuthModule, ProposalsModule],
  controllers: [CompanyController],
  providers: [
    CompanyService,
    ProfessionalsService,
    ProjectService,
    PostgresPrismaService,
    JWTService,
    UploadService,
    ObjectStorageService,
  ],
})
export class CompanyModule {}
