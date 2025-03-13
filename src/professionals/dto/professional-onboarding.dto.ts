import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { ProfessionalExperienceDto } from './professional-experience.dto';
import { ProfessionalEducationDto } from './professional-education.dto';
import { Type } from 'class-transformer';

class MetaDto {
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsNumber()
  @IsOptional()
  yearsOfExperience?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @IsObject()
  @IsNotEmpty()
  @IsOptional()
  socialLinks?: Map<string, string>;

  @IsObject()
  @IsOptional()
  languages?: Map<string, string>;

  @IsNumber()
  @IsOptional()
  hourlyRate?: number;

  @IsString()
  @IsOptional()
  successRate?: string;

  @IsString()
  @IsOptional()
  totalEarned?: string;

  @IsString()
  @IsOptional()
  availability?: string;

  @IsString()
  @IsOptional()
  projectCompletion?: string;

  @IsNumber()
  @IsOptional()
  projectsCompleted?: number;

  @IsNumber()
  @IsOptional()
  weeklyAvailability?: number;

  @IsString()
  @IsOptional()
  employmentType?: string;
}

export class ProfessionalOnboardingDto {
  @IsString()
  @IsOptional()
  headline: string;

  @IsEnum(['Male', 'Female'])
  @IsOptional()
  gender?: 'Male' | 'Female';

  @IsString()
  @IsOptional()
  bio: string;

  @IsUrl()
  avatar: string;

  @IsObject()
  @ValidateNested()
  @Type(() => MetaDto)
  @IsOptional()
  meta?: MetaDto;

  @IsString()
  @IsOptional()
  resume: string;

  @IsArray()
  @IsObject({ each: true })
  @ValidateNested()
  @Type(() => ProfessionalExperienceDto)
  @IsOptional()
  experience: ProfessionalExperienceDto[];

  @IsArray()
  @IsObject({ each: true })
  @ValidateNested()
  @Type(() => ProfessionalEducationDto)
  @IsOptional()
  education: ProfessionalEducationDto[];
}
