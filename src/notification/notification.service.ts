import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { NotificationType, Prisma } from '@/prisma/postgres';
import {
  CreateEventNotificationDto,
  CreateMessageNotificationDto,
  CreateNotificationDto,
  NotificationResponseDto,
} from './dto';

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PostgresPrismaService,
    @InjectQueue('notifications')
    private notificationsQueue: Queue,
  ) {}

  async createNotification(
    data: CreateNotificationDto,
  ): Promise<NotificationResponseDto> {
    const notification = await this.prisma.notifications.create({
      data: {
        userId: data.userId,
        title: data.title,
        content: data.content,
        type: data.type || NotificationType.EVENT,
        metadata: data.metadata as Prisma.JsonValue,
      },
    });

    // Queue notification for delivery
    await this.notificationsQueue.add('send', {
      notificationId: notification.id,
    });

    return notification as NotificationResponseDto;
  }

  async createEventNotification(
    data: CreateEventNotificationDto,
  ): Promise<NotificationResponseDto> {
    return this.createNotification({
      ...data,
      type: NotificationType.EVENT,
    });
  }

  async createMessageNotification(
    data: CreateMessageNotificationDto,
  ): Promise<NotificationResponseDto> {
    return this.createNotification({
      ...data,
      type: NotificationType.MESSAGE,
    });
  }

  async getNotificationsByUser(
    userId: string,
  ): Promise<NotificationResponseDto[]> {
    return this.prisma.notifications.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }) as Promise<NotificationResponseDto[]>;
  }

  async getUnreadNotificationsByUser(
    userId: string,
  ): Promise<NotificationResponseDto[]> {
    return this.prisma.notifications.findMany({
      where: {
        userId,
        isRead: false,
      },
      orderBy: { createdAt: 'desc' },
    }) as Promise<NotificationResponseDto[]>;
  }

  async markAsRead(id: string): Promise<NotificationResponseDto> {
    return this.prisma.notifications.update({
      where: { id },
      data: { isRead: true },
    }) as Promise<NotificationResponseDto>;
  }

  async markAllAsRead(userId: string): Promise<Prisma.BatchPayload> {
    return this.prisma.notifications.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }
}
