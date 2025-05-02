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
import { AuthGuard } from '@/shared/auth/platform/guards/auth.guard';
import { CurrentUnifiedAuth } from '@/shared/decorators/current-auth.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';
import { ResponseUtil } from '@/shared/utils/response.util';

@Controller('notifications')
@UseGuards(AuthGuard())
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
    const notifications = await this.notificationService.getNotificationsByUser(
      user.id,
      options,
    );
    return ResponseUtil.success(
      notifications,
      'Notifications fetched successfully',
    );
  }

  @Get('unread')
  async getUnreadNotificationsByUser(
    @CurrentUnifiedAuth() user: any,
    @Query() options: PaginationDto,
  ) {
    const notifications =
      await this.notificationService.getUnreadNotificationsByUser(
        user.id,
        options,
      );
    return ResponseUtil.success(
      notifications,
      'Unread notifications fetched successfully',
    );
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    const notification = await this.notificationService.markAsRead(id);
    return ResponseUtil.success(
      notification,
      'Notification marked as read successfully',
    );
  }

  @Patch('read-all')
  async markAllAsRead(@CurrentUnifiedAuth() user: any) {
    const result = await this.notificationService.markAllAsRead(user.id);
    return ResponseUtil.success(
      result,
      'All notifications marked as read successfully',
    );
  }
}
