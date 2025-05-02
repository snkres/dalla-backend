import { Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { Status } from '@/prisma/postgres';

@Injectable()
@Processor('messages')
export class MessageProcessor {
  constructor(
    private prisma: PostgresPrismaService,
    private websocketGateway: WebsocketGateway,
  ) {}

  @Process('send')
  async handleSendMessage(job: Job<{ messageId: string }>) {
    const { messageId } = job.data;

    try {
      const message = await this.prisma.message.findUnique({
        where: { id: messageId },
        include: { conversation: true },
      });

      if (!message) {
        throw new Error(`Message ${messageId} not found`);
      }

      // Get recipient ID (the user who didn't send the message)
      const recipientId =
        message.senderId === message.conversation.initiatorId
          ? message.conversation.participantId
          : message.conversation.initiatorId;

      // Send message to recipient with conversation context
      this.websocketGateway.sendMessageToUser(recipientId, {
        ...message,
        isFromCurrentUser: false, // This helps frontend render correctly
      });

      // Update status to delivered
      await this.prisma.message.update({
        where: { id: messageId },
        data: { status: Status.Delivered },
      });

      return { success: true, messageId };
    } catch (error) {
      console.error('Error processing message:', error);
      return { success: false, error: error.message };
    }
  }
}
