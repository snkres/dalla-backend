import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  async createConversation(
    @Body()
    data: {
      initiatorId: string;
      participantId: string;
      title: string;
      initiatorRole: string; // Use this to check if user can initiate conversations
    },
  ) {
    // Check if the initiator has the required role to start conversations
    if (data.initiatorRole !== 'support' && data.initiatorRole !== 'admin') {
      throw new ForbiddenException(
        'Only Company users can initiate conversations',
      );
    }

    return this.conversationService.createConversation({
      initiatorId: data.initiatorId,
      participantId: data.participantId,
      title: data.title,
    });
  }

  @Get(':id')
  async getConversation(@Param('id') id: string, @Request() req) {
    // Check if user has access to this conversation
    const hasAccess = await this.conversationService.checkConversationAccess(
      id,
      req.user.id,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have access to this conversation',
      );
    }

    return this.conversationService.getConversation(id);
  }

  @Get('user/:userId')
  async getUserConversations(@Param('userId') userId: string, @Request() req) {
    // Ensure users can only access their own conversations
    if (req.user.id !== userId && !req.user.isAdmin) {
      throw new ForbiddenException('You can only view your own conversations');
    }

    return this.conversationService.getUserConversations(userId);
  }
}
