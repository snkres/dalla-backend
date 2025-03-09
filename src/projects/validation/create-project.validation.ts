import { ProjectMeta } from '@/shared/types/project.types';
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class createProjectValidation {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  scope: string;

  @IsString()
  @IsOptional()
  jobTitle: string;

  @IsString()
  @IsOptional()
  deliverables: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  skills: string[];

  @IsObject()
  @IsNotEmpty()
  meta: ProjectMeta;
}
