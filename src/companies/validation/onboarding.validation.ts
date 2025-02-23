import { CompanyProfileMeta } from '@/shared/types/company.types';
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
  @IsString({ each: true })
  @IsOptional()
  areas: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  goals: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetIndustries: string[];

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
