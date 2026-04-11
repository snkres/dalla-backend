import { ProjectStatus } from '@/prisma/postgres';
import { IsNumber, IsString } from 'class-validator';

export class ProjectMeta {
  @IsNumber()
  budget: number;

  @IsString()
  duration: string;
}

export interface FilterProjectsOptions {
  assigned?: boolean;
  status?: ProjectStatus;
}
