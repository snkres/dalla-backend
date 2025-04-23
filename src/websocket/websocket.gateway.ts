import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@WebSocketGateway({
  cors: {
    origin: '*', //! need to be tightened in production
  },
})
@Injectable()
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(@Inject('REDIS_CLIENT') private readonly redisService: Redis) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (userId) {
      // Store connection in Redis
      await this.redisService.hset('user_connections', userId, client.id);

      // Join user to their room
      client.join(`user:${userId}`);
      console.log(`Client connected: ${client.id}, User: ${userId}`);
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (userId) {
      // Remove connection from Redis
      await this.redisService.hdel('user_connections', userId);
      console.log(`Client disconnected: ${client.id}, User: ${userId}`);
    }
  }

  @SubscribeMessage('join-conversation')
  handleJoinConversation(client: Socket, payload: { conversationId: string }) {
    const userId = client.handshake.query.userId as string;
    // Join a room specific to this conversation
    const roomName = `conversation:${payload.conversationId}`;
    client.join(roomName);
    console.log(`User ${userId} joined conversation room ${roomName}`);
    return {
      event: 'joined-conversation',
      data: { conversationId: payload.conversationId },
    };
  }

  @SubscribeMessage('leave-conversation')
  handleLeaveConversation(client: Socket, payload: { conversationId: string }) {
    const roomName = `conversation:${payload.conversationId}`;
    client.leave(roomName);
    return {
      event: 'left-conversation',
      data: { conversationId: payload.conversationId },
    };
  }

  // Method to send message to specific user
  sendMessageToUser(userId: string, message: any) {
    this.server.to(`user:${userId}`).emit('message', message);
  }

  // Method to broadcast message to entire conversation
  broadcastToConversation(
    conversationId: string,
    eventName: string,
    data: any,
  ) {
    this.server.to(`conversation:${conversationId}`).emit(eventName, data);
  }

  // Method to send notification to specific user
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }
}
