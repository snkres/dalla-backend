import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { PlatformAuthModule } from '@/shared/auth/platform/auth.module';
import { Module } from '@nestjs/common';
import { ProjectService } from './projects.service';
import { ProjectController } from './project.controller';

@Module({
  imports: [PlatformAuthModule],
  controllers: [ProjectController],
  providers: [ProjectService, PostgresPrismaService],
})
export class ProjectModule {}
