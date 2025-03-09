import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { PlatformAuthModule } from '@/shared/auth/platform/auth.module';
import { Module } from '@nestjs/common';
import { ProjectService } from './projects.service';
import { JWTService } from '@/shared/auth/miscs/jwt';

@Module({
  imports: [PlatformAuthModule],
  providers: [ProjectService, PostgresPrismaService, JWTService],
  exports: [ProjectService],
})
export class ProjectModule {}
