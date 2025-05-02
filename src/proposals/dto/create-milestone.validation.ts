import { IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';

export class CreateMilestoneValidation {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(\d+)\s+(day|week|month)s?$/i, {
    message:
      'Timeline must be in format: "{number} days", "{number} weeks", or "{number} months"',
  })
  timeline: string;

  @IsNumber()
  @IsNotEmpty()
  order: number;
}
