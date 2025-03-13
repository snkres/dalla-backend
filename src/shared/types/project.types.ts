import { IsNumber, IsString } from 'class-validator';

export class ProjectMeta {
  @IsNumber()
  budget: number;

  @IsString()
  duration: string;
}

export enum ProjectStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'InProgress',
  CLOSED = 'Closed',
  COMPLETED = 'Completed',
}

export enum ProposalStatus {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
}
