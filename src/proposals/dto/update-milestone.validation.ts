import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateMilestoneValidation } from './create-milestone.validation';

export class UpdateMilestoneValidation extends CreateMilestoneValidation {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  id: string;
}
