import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ProfessionalExperienceDto } from './professional-experience.dto';
import { ProfessionalEducationDto } from './professional-education.dto';
import { Transform, Type } from 'class-transformer';

class MetaDto {
  @IsPhoneNumber()
  phone: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsNumber()
  yearsOfExperience: number;

  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsArray()
  @IsArray({ each: true })
  @MinLength(2)
  @MaxLength(2)
  socialLinks: string[];
}

export class ProfessionalOnboardingDto {
  @IsString()
  @IsNotEmpty()
  headline: string;

  @IsEnum(['Male', 'Female'])
  @IsOptional()
  gender?: 'Male' | 'Female';

  @IsString()
  @IsOptional()
  bio: string;

  @IsObject()
  avatar: Express.Multer.File;

  @Transform(({ value }) => JSON.parse(value))
  @IsObject()
  @ValidateNested()
  @Type(() => MetaDto)
  @IsOptional()
  meta: MetaDto;

  @IsString()
  @IsOptional()
  resume: string;

  @IsNumber()
  @IsOptional()
  percentage: number;

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
