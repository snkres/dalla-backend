import { SubmissionStatus } from '@/prisma/postgres';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReviewMilestoneSubmissionValidation {
  @IsEnum(SubmissionStatus)
  @IsNotEmpty()
  status: SubmissionStatus;

  @IsString()
  @IsOptional()
  comments?: string;
}
