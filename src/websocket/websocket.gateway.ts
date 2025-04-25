import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import Redis from 'ioredis';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*', //! need to be tightened in production
    credentials: true,
  },
})
@Injectable()
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject('REDIS_CLIENT') private readonly redisService: Redis,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Extract token from cookies
      const cookies = client.handshake.headers.cookie;

      if (!cookies) {
        throw new UnauthorizedException('No cookies provided');
      }

      // Parse cookies to get access token
      // Assuming your token cookie is named 'access_token'
      const cookiesArray = cookies.split(';').map((cookie) => cookie.trim());
      const tokenCookie = cookiesArray.find((c) =>
        c.startsWith('access_token='),
      );

      if (!tokenCookie) {
        throw new UnauthorizedException('Authentication token not found');
      }

      const token = tokenCookie.split('=')[1];

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub || payload.id;

      if (!userId) {
        throw new UnauthorizedException('Invalid token');
      }

      // Store userId in client data for future reference
      client.data.userId = userId;

      // Store connection in Redis
      await this.redisService.hset('user_connections', userId, client.id);

      // Join user to their room
      client.join(`user:${userId}`);
      console.log(`Client connected: ${client.id}, User: ${userId}`);
    } catch (error) {
      console.error(`Authentication failed: ${error.message}`);
      client.disconnect(true);
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
