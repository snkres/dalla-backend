import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { PlatformAuthModule } from '@/shared/auth/platform/auth.module';
import { Module } from '@nestjs/common';
import { ProjectService } from './projects.service';

@Module({
  imports: [PlatformAuthModule],
  providers: [ProjectService, PostgresPrismaService],
  exports: [ProjectService],
})
export class ProjectModule {}
