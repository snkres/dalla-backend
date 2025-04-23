import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { PrismaModule } from '@/config/prisma.module';

@Module({
  providers: [ConversationService],
  controllers: [ConversationController],
  exports: [ConversationService],
  imports: [PrismaModule],
})
export class ConversationModule {}
