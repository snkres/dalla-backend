import { Module } from '@nestjs/common';
import { ProjectFeedbackService } from './project-feedback.service';
import { PostgresPrismaService } from '@/config/prisma/postgres.services';

@Module({
  providers: [PostgresPrismaService, ProjectFeedbackService],
})
export class ProjectFeedbackModule {}
