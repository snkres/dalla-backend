import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { PlatformAuthModule } from '@/shared/auth/platform/auth.module';
import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { ProjectService } from '@/projects/projects.service';
import { ProjectRequestsModule } from '@/project-requests/project-requests.module';

@Module({
  imports: [PlatformAuthModule, ProjectRequestsModule],
  controllers: [CompanyController],
  providers: [CompanyService, ProjectService, PostgresPrismaService],
})
export class CompanyModule {}
