import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { NotificationService } from './notification.service';
import {
  CreateEventNotificationDto,
  CreateMessageNotificationDto,
  NotificationResponseDto,
} from './dto';
import { Prisma } from '@/prisma/postgres';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('event')
  async createEventNotification(
    @Body() data: CreateEventNotificationDto,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.createEventNotification(data);
  }

  @Post('message')
  async createMessageNotification(
    @Body() data: CreateMessageNotificationDto,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.createMessageNotification(data);
  }

  @Get('user/:userId')
  async getNotificationsByUser(
    @Param('userId') userId: string,
  ): Promise<NotificationResponseDto[]> {
    return this.notificationService.getNotificationsByUser(userId);
  }

  @Get('user/:userId/unread')
  async getUnreadNotificationsByUser(
    @Param('userId') userId: string,
  ): Promise<NotificationResponseDto[]> {
    return this.notificationService.getUnreadNotificationsByUser(userId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string): Promise<NotificationResponseDto> {
    return this.notificationService.markAsRead(id);
  }

  @Patch('user/:userId/read-all')
  async markAllAsRead(
    @Param('userId') userId: string,
  ): Promise<Prisma.BatchPayload> {
    return this.notificationService.markAllAsRead(userId);
  }
}
