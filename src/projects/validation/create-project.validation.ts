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

  @IsString()
  @IsNotEmpty()
  // @IsExist('Company', 'id') // The companyId validation was moved to the service due to weird dependency issues
  companyId: string;

  @IsObject()
  @IsNotEmpty()
  meta: ProjectMeta;
}
