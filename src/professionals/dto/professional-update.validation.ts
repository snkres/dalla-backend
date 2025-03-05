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
import { Transform, Type } from 'class-transformer';
import { ProfessionalExperienceDto } from './professional-experience.dto';
import { ProfessionalEducationDto } from './professional-education.dto';

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

  @IsObject()
  @IsNotEmpty()
  socialLinks: Map<string, string>;
}

export class ProfessionalUpdateValidation {
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
  @IsOptional()
  avatar: string;

  @IsObject()
  @ValidateNested()
  @Type(() => MetaDto)
  @IsOptional()
  meta: MetaDto;

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
