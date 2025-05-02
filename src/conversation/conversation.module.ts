import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { PrismaModule } from '@/config/prisma.module';
import { JWTService } from '@/shared/auth/miscs/jwt';

@Module({
  providers: [ConversationService, JWTService],
  controllers: [ConversationController],
  exports: [ConversationService],
  imports: [PrismaModule],
})
export class ConversationModule {}
