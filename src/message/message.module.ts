import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { MessageProcessor } from './message.processor';
import { WebsocketModule } from '../websocket/websocket.module';
import { ConversationModule } from '../conversation/conversation.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'messages',
    }),
    WebsocketModule,
    ConversationModule,
  ],
  providers: [MessageService, MessageProcessor],
  controllers: [MessageController],
  exports: [MessageService],
})
export class MessageModule {}
