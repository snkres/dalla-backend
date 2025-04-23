import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { Notifications, NotificationType, Prisma } from '@/prisma/postgres';

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PostgresPrismaService,
    @InjectQueue('notifications')
    private notificationsQueue: Queue,
  ) {}

  async createEventNotification(data: {
    userId: string;
    title: string;
    content: string;
    metadata?: Prisma.JsonValue;
  }): Promise<Notifications> {
    const notification = await this.prisma.notifications.create({
      data: {
        ...data,
        type: NotificationType.EVENT,
      },
    });

    // Queue notification for delivery
    await this.notificationsQueue.add('send', {
      notificationId: notification.id,
    });

    return notification;
  }

  async getNotificationsByUser(userId: string): Promise<Notifications[]> {
    return this.prisma.notifications.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUnreadNotificationsByUser(userId: string): Promise<Notifications[]> {
    return this.prisma.notifications.findMany({
      where: {
        userId,
        isRead: false,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string): Promise<Notifications> {
    return this.prisma.notifications.update({
      where: { id },
      data: { isRead: true },
    });
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
