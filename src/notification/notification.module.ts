import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationProcessor } from './notification.processor';
import { WebsocketModule } from '../websocket/websocket.module';
import { JWTService } from '@/shared/auth/miscs/jwt';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notifications',
    }),
    WebsocketModule,
  ],
  providers: [NotificationService, NotificationProcessor, JWTService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
