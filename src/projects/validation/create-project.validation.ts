import { ProjectMeta } from '@/shared/types/project.types';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
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

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  media: string[];

  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ProjectMeta)
  meta: ProjectMeta;
}
