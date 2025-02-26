import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
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

  @Matches(/^(\d{4}-\d{2}-\d{2})$/, {
    message: 'Value must be a valid date string (YYYY-MM-DD)',
  })
  startDate: string;

  @IsString()
  @Matches(/^(present|\d{4}-\d{2}-\d{2})$/, {
    message: 'Value must be a valid date string (YYYY-MM-DD) or "present"',
  })
  endDate: string;
}
