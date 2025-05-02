import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { Conversation, Message } from '@/prisma/postgres';
import { PaginationDto } from '@/shared/dto/pagination.dto';
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  pagination,
  PageNumberPaginationMeta,
} from 'prisma-extension-pagination';

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

  async getConversation(
    id: string,
    options: PaginationDto,
  ): Promise<{
    conversation: Conversation;
    messages: { data: Message[]; paginationMeta: PageNumberPaginationMeta };
  }> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    const [messages, paginationMeta] = await this.prisma
      .$extends(
        pagination({
          pages: {
            includePageCount: true,
          },
        }),
      )
      .message.paginate({
        where: {
          conversationId: conversation.id,
        },
        orderBy: { createdAt: 'asc' },
      })
      .withPages(options);

    return {
      conversation,
      messages: {
        data: messages,
        paginationMeta,
      },
    };
  }

  async getUserConversations(
    userId: string,
    options: PaginationDto,
  ): Promise<{
    conversations: Conversation[];
    paginationMeta: PageNumberPaginationMeta;
  }> {
    const [conversations, paginationMeta] = await this.prisma
      .$extends(
        pagination({
          pages: {
            includePageCount: true,
          },
        }),
      )
      .conversation.paginate({
        where: {
          OR: [{ initiatorId: userId }, { participantId: userId }],
        },
        orderBy: { updatedAt: 'desc' },
      })
      .withPages(options);
    return {
      conversations,
      paginationMeta,
    };
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
