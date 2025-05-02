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

// Import our new notification type
import { NotificationResponseDto } from '../notification/dto';

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
      // Try to get token from multiple sources
      let token: string;

      const cookies = client.handshake.headers.cookie;
      if (cookies) {
        const cookiesArray = cookies.split(';').map((cookie) => cookie.trim());
        const tokenCookie = cookiesArray.find((c) =>
          c.startsWith('access_token='),
        );
        if (tokenCookie) {
          token = tokenCookie.split('=')[1];
        }
      }

      if (!token) {
        throw new UnauthorizedException('No authentication token provided');
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.userId;

      if (!userId) {
        throw new UnauthorizedException('Invalid token: no user ID found');
      }

      // Store userId in client data for future reference
      client.data = client.data || {}; // Ensure client.data exists
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
    const userId = client.data.userId as string;

    if (userId) {
      // Remove connection from Redis
      await this.redisService.hdel('user_connections', userId);
      console.log(`Client disconnected: ${client.id}, User: ${userId}`);
    }
  }

  @SubscribeMessage('join-conversation')
  handleJoinConversation(client: Socket, payload: { conversationId: string }) {
    const userId = client.data?.userId;

    if (!userId) {
      return {
        event: 'error',
        data: { message: 'User not authenticated' },
      };
    }

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
    const userId = client.data?.userId;

    if (!userId) {
      return {
        event: 'error',
        data: { message: 'User not authenticated' },
      };
    }

    const roomName = `conversation:${payload.conversationId}`;
    client.leave(roomName);
    console.log(`User ${userId} left conversation room ${roomName}`);

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

  // Updated method with strong typing for notification
  sendNotificationToUser(
    userId: string,
    notification: NotificationResponseDto,
  ) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }
}
