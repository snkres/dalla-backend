import { IsString, IsNotEmpty, Matches } from 'class-validator';

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

  @IsString()
  @Matches(/^(\d{4}-\d{2}-\d{2})$/, {
    message: 'Value must be a valid date string (YYYY-MM-DD)',
  })
  startDate: string;

  @IsString()
  @Matches(/^(present|\d{4}-\d{2}-\d{2})$/, {
    message: 'Value must be a valid date string (YYYY-MM-DD) or "present"',
  })
  endDate: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
