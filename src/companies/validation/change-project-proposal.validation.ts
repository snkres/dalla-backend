import { ProposalStatus } from '@/prisma/postgres';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class ChangeProjectProposalValidation {
  @IsEnum(ProposalStatus)
  @IsNotEmpty()
  status: ProposalStatus;
}
