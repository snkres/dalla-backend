import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class MetaDto {
  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsString()
  @IsNotEmpty()
  achievements: string;

  @IsString()
  @IsNotEmpty()
  responsibilities: string;

  @IsString()
  @IsNotEmpty()
  employmentType: string;
}

export class ProfessionalExperienceDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  company: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @Transform(({ value }) => JSON.parse(value))
  @IsObject()
  @ValidateNested()
  @Type(() => MetaDto)
  @IsOptional()
  meta: MetaDto;

  @IsDateString()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  endDate: Date;
}
