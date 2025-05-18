import {
  IsString,
  IsOptional,
  MaxLength,
  Validate,
  IsObject,
} from 'class-validator';

export class SubmitFeedbackForProfessionalDto {
  @IsObject()
  @IsOptional()
  @Validate(
    (value: Record<string, number>) => {
      for (const rating of Object.values(value)) {
        if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Skill ratings must be integers between 0 and 5',
    },
  )
  skillRatings: Record<string, number>;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  comment?: string;
}
