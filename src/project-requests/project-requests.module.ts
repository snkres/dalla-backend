import { Module } from '@nestjs/common';
import { ProjectRequestsService } from './project-requests.service';
import { PostgresPrismaService } from '@/config/prisma/postgres.services';

@Module({
  providers: [ProjectRequestsService, PostgresPrismaService],
  exports: [ProjectRequestsService],
})
export class ProjectRequestsModule {}
