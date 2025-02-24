export interface ProjectMeta {
  budget: number;
  duration: string;
}

export enum ProjectStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'InProgress',
  CLOSED = 'Closed',
  COMPLETED = 'Completed',
}

export enum RequestStatus {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
}
