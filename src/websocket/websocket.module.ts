import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { JWTService } from '@/shared/auth/miscs/jwt';

@Module({
  providers: [WebsocketGateway, JWTService],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
