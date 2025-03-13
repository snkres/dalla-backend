import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { PlatformAuthModule } from '@/shared/auth/platform/auth.module';
import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { ProjectService } from '@/projects/projects.service';
import { JWTService } from '@/shared/auth/miscs/jwt';
import { ProposalsModule } from '@/proposals/proposals.module';

@Module({
  imports: [PlatformAuthModule, ProposalsModule],
  controllers: [CompanyController],
  providers: [
    CompanyService,
    ProjectService,
    PostgresPrismaService,
    JWTService,
  ],
})
export class CompanyModule {}
