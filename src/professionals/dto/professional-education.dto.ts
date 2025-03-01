import {
  IsString,
  IsNotEmpty,
  ValidateIf,
  IsDateString,
} from 'class-validator';

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
  startDate: string;

  @ValidateIf(({ endDate }) => endDate !== 'present')
  @IsDateString(undefined, {
    message: 'endDate must be a valid date or "present"',
  })
  endDate: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
