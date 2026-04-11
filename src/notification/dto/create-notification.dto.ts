import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { NotificationType } from '@/prisma/postgres';

export class CreateNotificationDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class CreateEventNotificationDto extends CreateNotificationDto {
  type?: NotificationType;
}

export class CreateMessageNotificationDto extends CreateNotificationDto {
  type?: NotificationType;
}
