import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateProjectSubmissionValidation {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsString({ each: true })
  media: string[];
}
