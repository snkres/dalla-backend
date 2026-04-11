import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsEnum,
  ValidateIf,
  ValidateNested,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProposalType } from '@/prisma/postgres';
import { CreateMilestoneValidation } from './create-milestone.validation';

export class CreateProposalValidation {
  @IsEnum(ProposalType)
  @IsNotEmpty()
  type: ProposalType;

  @IsString()
  @IsNotEmpty()
  description: string;

  @ValidateIf((o) => o.type === ProposalType.AllInOne)
  @IsNumber()
  @IsNotEmpty()
  price?: number;

  @ValidateIf((o) => o.type === ProposalType.AllInOne)
  @IsString()
  @IsNotEmpty()
  timeline?: string;

  @IsArray()
  @IsString({ each: true })
  media: string[];

  @IsArray()
  @IsString({ each: true })
  relevantProjects: string[];

  @ValidateIf((o) => o.type === ProposalType.MilestoneBased)
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateMilestoneValidation)
  milestones?: CreateMilestoneValidation[];
}
