import {
  ArrayNotEmpty,
  IsArray,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { CreateProposalValidation } from './create-proposal.validation';
import { ProposalType } from '@/prisma/postgres';
import { Type } from 'class-transformer';
import { UpdateMilestoneValidation } from './update-milestone.validation';

export class ModifyProposalValidation extends CreateProposalValidation {
  @ValidateIf((o) => o.type === ProposalType.MilestoneBased)
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UpdateMilestoneValidation)
  milestones?: UpdateMilestoneValidation[];
}
