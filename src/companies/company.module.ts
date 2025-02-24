import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { PlatformAuthModule } from '@/shared/auth/platform/auth.module';
import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { ProjectService } from '@/projects/projects.service';

@Module({
  imports: [PlatformAuthModule],
  controllers: [CompanyController],
  providers: [CompanyService, ProjectService, PostgresPrismaService],
})
export class CompanyModule {}
