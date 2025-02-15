import { Module } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { ResumesController } from './resumes.controller';

@Module({
  controllers: [ResumesController],
  providers: [ResumesService],
})
export class ResumesModule {}
