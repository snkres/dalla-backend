import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { AuthGuard } from '@/shared/auth/platform/guards/auth.guard';
import { UserTypes } from '@/shared/enums/user-types.enum';
import { CurrentCompany } from '@/shared/decorators/current-auth.decorator';
import { Company } from '@/prisma/postgres';
import { PaginationDto } from '@/shared/dto/pagination.dto';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  @UseGuards(AuthGuard(UserTypes.Company))
  async createConversation(
    @Body()
    data: {
      participantId: string;
      title: string;
    },
    @CurrentCompany() user: Company,
  ) {
    return this.conversationService.createConversation({
      initiatorId: user.id,
      participantId: data.participantId,
      title: data.title,
    });
  }

  @Get(':id')
  async getConversation(
    @Param('id') id: string,
    @Query() options: PaginationDto,
  ) {
    // Check if user has access to this conversation
    // const hasAccess = await this.conversationService.checkConversationAccess(
    //   id,
    //   req.user.id,
    // );

    // if (!hasAccess) {
    //   throw new ForbiddenException(
    //     'You do not have access to this conversation',
    //   );
    // }

    return this.conversationService.getConversation(id, options);
  }

  @Get('user/:userId')
  async getUserConversations(
    @Param('userId') userId: string,
    @Query() options: PaginationDto,
  ) {
    return this.conversationService.getUserConversations(userId, options);
  }
}
