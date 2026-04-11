import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { Status } from '@/prisma/postgres';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async createMessage(
    @Body()
    data: {
      conversationId: string;
      senderId: string;
      content: string;
      meta?: any;
    },
    @Request() req,
  ) {
    // Verify the sender ID matches the authenticated user
    if (req.user.id !== data.senderId) {
      throw new ForbiddenException('You can only send messages as yourself');
    }

    return this.messageService.createMessage(data);
  }

  @Get('conversation/:conversationId')
  async getMessagesByConversation(
    @Param('conversationId') conversationId: string,
    @Request() req,
  ) {
    return this.messageService.getMessagesByConversation(
      conversationId,
      req.user.id,
    );
  }

  @Get('status/:status')
  async getMessagesByStatus(@Param('status') status: Status) {
    // This should probably be admin-only
    return this.messageService.getMessagesByStatus(status);
  }
}
