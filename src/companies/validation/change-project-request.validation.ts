import { RequestStatus } from '@/prisma/postgres';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class ChangeProjectRequestValidation {
  @IsEnum(RequestStatus)
  @IsNotEmpty()
  status: RequestStatus;
}
