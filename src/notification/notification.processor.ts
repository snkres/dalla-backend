import { Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { NotificationResponseDto } from './dto';

interface SendNotificationJobData {
  notificationId: string;
}

@Injectable()
@Processor('notifications')
export class NotificationProcessor {
  constructor(
    private prisma: PostgresPrismaService,
    private websocketGateway: WebsocketGateway,
  ) {}

  @Process('send')
  async handleSendNotification(job: Job<SendNotificationJobData>) {
    const { notificationId } = job.data;

    try {
      const notification = await this.prisma.notifications.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        throw new Error(`Notification ${notificationId} not found`);
      }

      // Send notification to user
      this.websocketGateway.sendNotificationToUser(
        notification.userId,
        notification as NotificationResponseDto,
      );

      return { success: true, notificationId };
    } catch (error) {
      console.error('Error processing notification:', error);
      return { success: false, error: error.message };
    }
  }
}
