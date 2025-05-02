import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import {
  CreateEventNotificationDto,
  CreateMessageNotificationDto,
  NotificationResponseDto,
} from './dto';
import { Prisma } from '@/prisma/postgres';
import { AuthGuard } from '@/shared/auth/platform/guards/auth.guard';
import { UserTypes } from '@/shared/enums/user-types.enum';
import { CurrentUnifiedAuth } from '@/shared/decorators/current-auth.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';

@Controller('notifications')
@UseGuards(AuthGuard(UserTypes.User), AuthGuard(UserTypes.Company))
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  // for Admins
  @Post('event')
  async createEventNotification(
    @Body() data: CreateEventNotificationDto,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.createEventNotification(data);
  }

  // for Admins
  @Post('message')
  async createMessageNotification(
    @Body() data: CreateMessageNotificationDto,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.createMessageNotification(data);
  }

  @Get('')
  async getNotificationsByUser(
    @CurrentUnifiedAuth() user: any,
    @Query() options: PaginationDto,
  ) {
    return this.notificationService.getNotificationsByUser(user.id, options);
  }

  @Get('unread')
  async getUnreadNotificationsByUser(
    @CurrentUnifiedAuth() user: any,
    @Query() options: PaginationDto,
  ) {
    return this.notificationService.getUnreadNotificationsByUser(
      user.id,
      options,
    );
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string): Promise<NotificationResponseDto> {
    return this.notificationService.markAsRead(id);
  }

  @Patch('read-all')
  async markAllAsRead(
    @CurrentUnifiedAuth() user: any,
  ): Promise<Prisma.BatchPayload> {
    return this.notificationService.markAllAsRead(user.id);
  }
}
