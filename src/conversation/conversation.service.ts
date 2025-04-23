import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { Conversation } from '@/prisma/postgres';
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class ConversationService {
  constructor(private prisma: PostgresPrismaService) {}

  async createConversation(data: {
    initiatorId: string;
    participantId: string;
    title: string;
  }): Promise<Conversation> {
    // Check if conversation already exists
    const existingConversation = await this.prisma.conversation.findFirst({
      where: {
        OR: [
          { initiatorId: data.initiatorId, participantId: data.participantId },
          { initiatorId: data.participantId, participantId: data.initiatorId },
        ],
      },
    });

    if (existingConversation) {
      throw new ForbiddenException(
        'Conversation between these users already exists',
      );
    }

    return this.prisma.conversation.create({
      data,
    });
  }

  async getConversation(id: string): Promise<Conversation> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: { messages: true },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    return conversation;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.prisma.conversation.findMany({
      where: {
        OR: [{ initiatorId: userId }, { participantId: userId }],
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async checkConversationAccess(
    conversationId: string,
    userId: string,
  ): Promise<boolean> {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ initiatorId: userId }, { participantId: userId }],
      },
    });

    return !!conversation;
  }
}
