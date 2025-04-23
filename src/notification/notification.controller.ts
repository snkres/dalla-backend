import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('event')
  async createEventNotification(
    @Body()
    data: {
      userId: string;
      title: string;
      content: string;
      metadata?: any;
    },
  ) {
    return this.notificationService.createEventNotification(data);
  }

  @Get('user/:userId')
  async getNotificationsByUser(@Param('userId') userId: string) {
    return this.notificationService.getNotificationsByUser(userId);
  }

  @Get('user/:userId/unread')
  async getUnreadNotificationsByUser(@Param('userId') userId: string) {
    return this.notificationService.getUnreadNotificationsByUser(userId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

  @Patch('user/:userId/read-all')
  async markAllAsRead(@Param('userId') userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }
}
