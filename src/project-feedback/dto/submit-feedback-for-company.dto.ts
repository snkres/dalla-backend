import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class SubmitFeedbackForCompanyDto {
  @IsInt()
  @Min(0)
  @Max(5)
  stars: number;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  comment?: string;
}
