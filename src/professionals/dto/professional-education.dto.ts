import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class ProfessionalEducationDto {
  @IsString()
  @IsNotEmpty()
  school: string;

  @IsString()
  @IsNotEmpty()
  degree: string;

  @IsString()
  @IsNotEmpty()
  field: string;

  @IsDateString()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  endDate: Date;

  @IsString()
  @IsNotEmpty()
  description: string;
}
