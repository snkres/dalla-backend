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
import { UpdateProfessionalExperienceDto } from './professional-experience.dto';
import { UpdateProfessionalEducationDto } from './professional-education.dto';

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
  @Type(() => UpdateProfessionalExperienceDto)
  @IsOptional()
  experience: UpdateProfessionalExperienceDto[];

  @IsArray()
  @IsObject({ each: true })
  @ValidateNested()
  @Type(() => UpdateProfessionalEducationDto)
  @IsOptional()
  education: UpdateProfessionalEducationDto[];
}
