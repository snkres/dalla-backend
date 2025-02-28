import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateIf,
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

  @IsObject()
  @ValidateNested()
  @Type(() => MetaDto)
  @IsOptional()
  meta: MetaDto;

  @IsDateString()
  startDate: string;

  @ValidateIf(({ endDate }) => endDate !== 'present')
  @IsDateString(undefined, {
    message: 'endDate must be a valid date or "present"',
  })
  endDate: string;
}
