import { CompanyProfileMeta } from '@/shared/types/company.types';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class OnboardingValidation {
  @IsString()
  @IsOptional()
  location: string;

  @IsArray()
  @IsObject({ each: true })
  @Type(() => ListObject)
  @IsOptional()
  areas: ListObject[];

  @IsArray()
  @IsObject({ each: true })
  @Type(() => ListObject)
  @IsOptional()
  goals: ListObject[];

  @IsArray()
  @IsObject({ each: true })
  @Type(() => ListObject)
  @IsOptional()
  targetIndustries: ListObject[];

  @IsUrl()
  @IsOptional()
  website: string;

  @IsString()
  @IsOptional()
  headline: string;

  @IsString()
  @IsOptional()
  bio: string;

  @IsString()
  @IsOptional()
  logo: string;

  @IsObject()
  @IsOptional()
  meta: CompanyProfileMeta;
}

export class ListObject {
  @IsString()
  name: string;

  @IsString()
  description: string;
}
