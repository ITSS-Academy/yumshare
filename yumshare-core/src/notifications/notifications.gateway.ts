import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: "http://localhost:4200", // Angular dev server
    credentials: true
  }
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  handleConnection(client: Socket) {
    // Client connected
  }

  handleDisconnect(client: Socket) {
    // Remove user from connected users
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() data: string | { userId: string }, @ConnectedSocket() client: Socket) {
    // Handle both formats: direct userId string or { userId: string } object
    const userId = typeof data === 'string' ? data : data.userId;
    this.connectedUsers.set(userId, client.id);
    client.join(userId);
  }

  @SubscribeMessage('leave')
  handleLeave(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    this.connectedUsers.delete(userId);
    client.leave(userId);
  }

  // Gửi notification đến user cụ thể
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(userId).emit('notification', notification);
  }

  // Gửi notification đến tất cả users
  sendNotificationToAll(notification: any) {
    this.server.emit('notification', notification);
  }

  // Kiểm tra user có online không
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  // Lấy danh sách users online
  getOnlineUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }
}
