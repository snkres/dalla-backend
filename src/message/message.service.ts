import { Injectable, ForbiddenException } from '@nestjs/common';

import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConversationService } from '../conversation/conversation.service';
import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { Message, Prisma, Status } from '@/prisma/postgres';

@Injectable()
export class MessageService {
  constructor(
    private prisma: PostgresPrismaService,
    private conversationService: ConversationService,
    @InjectQueue('messages')
    private messagesQueue: Queue,
  ) {}

  async createMessage(data: {
    conversationId: string;
    senderId: string;
    content: string;
    meta?: Prisma.JsonValue;
  }): Promise<Message> {
    // Verify sender has access to the conversation
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: data.conversationId },
    });

    if (!conversation) {
      throw new ForbiddenException('Conversation not found');
    }

    if (
      conversation.initiatorId !== data.senderId &&
      conversation.participantId !== data.senderId
    ) {
      throw new ForbiddenException('You are not part of this conversation');
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId: data.conversationId,
        senderId: data.senderId,
        content: data.content,
        meta: data.meta,
        status: Status.Pending,
      },
    });

    // Update the conversation's updatedAt timestamp
    await this.prisma.conversation.update({
      where: { id: data.conversationId },
      data: { updatedAt: new Date() },
    });

    // Queue message for delivery
    await this.messagesQueue.add('send', {
      messageId: message.id,
    });

    return message;
  }

  async getMessagesByConversation(
    conversationId: string,
    userId: string,
  ): Promise<Message[]> {
    // Check if user has access to this conversation
    const hasAccess = await this.conversationService.checkConversationAccess(
      conversationId,
      userId,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have access to this conversation',
      );
    }

    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getMessagesByStatus(status: Status): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: { status },
    });
  }
}
