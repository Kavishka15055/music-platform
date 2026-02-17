/**
 * File: chat.gateway.ts
 * Author: Kavishka Piyumal (Antigravity)
 * Created: 2026-02-17
 * Description:
 *   WebSocket gateway for real-time chat during lessons.
 */
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { lessonId: string; userName: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.lessonId);
    this.logger.log(`${data.userName} joined room: ${data.lessonId}`);
    
    // Notify room about new user (optional)
    /*
    this.server.to(data.lessonId).emit('userJoined', {
      userName: data.userName,
      timestamp: new Date().toISOString(),
    });
    */
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { lessonId: string; userName: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.lessonId);
    this.logger.log(`${data.userName} left room: ${data.lessonId}`);
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    @MessageBody() data: { lessonId: string; sender: string; message: string; role: string },
  ) {
    const chatMessage = {
      sender: data.sender,
      message: data.message,
      role: data.role,
      timestamp: new Date().toISOString(),
    };
    
    this.server.to(data.lessonId).emit('message', chatMessage);
    this.logger.log(`Message in ${data.lessonId} from ${data.sender}: ${data.message}`);
  }
}
