import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service';
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(private readonly chatsService: ChatsService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Remove user from connected users
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        // Update user status to offline
        this.chatsService.updateUserStatus(userId, false);
        break;
      }
    }
  }

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.connectedUsers.set(data.userId, client.id);
    client.join(`user_${data.userId}`);
    
    // Update user status to online
    this.chatsService.updateUserStatus(data.userId, true);
    
    return { event: 'joined', userId: data.userId };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const message = await this.chatsService.sendMessage(createMessageDto);
      
      // Get chat participants
      const chat = await this.chatsService.getChatById(createMessageDto.chat_id);
      if (chat) {
        const recipientId = chat.user1_id === createMessageDto.sender_id 
          ? chat.user2_id 
          : chat.user1_id;

        // Emit to recipient if online
        const recipientSocketId = this.connectedUsers.get(recipientId);
        if (recipientSocketId) {
          this.server.to(recipientSocketId).emit('newMessage', message);
        }
      }

      // Emit to sender for confirmation
      client.emit('messageSent', message);

      return message;
    } catch (error) {
      client.emit('error', { message: 'Failed to send message' });
      return null;
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: { chatId: string; userId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const chat = await this.chatsService.getChatById(data.chatId);
    if (chat) {
      const recipientId = chat.user1_id === data.userId 
        ? chat.user2_id 
        : chat.user1_id;

      if (recipientId) {
        const recipientSocketId = this.connectedUsers.get(recipientId);
        if (recipientSocketId) {
          this.server.to(recipientSocketId).emit('userTyping', {
            chatId: data.chatId,
            userId: data.userId,
            isTyping: data.isTyping,
          });
        }
      }
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { chatId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.chatsService.markChatAsRead(data.chatId, data.userId);
      
      // Notify other participant
      const chat = await this.chatsService.getChatById(data.chatId);
      if (chat) {
        const recipientId = chat.user1_id === data.userId 
          ? chat.user2_id 
          : chat.user1_id;

        if (recipientId) {
          const recipientSocketId = this.connectedUsers.get(recipientId);
          if (recipientSocketId) {
            this.server.to(recipientSocketId).emit('messagesRead', {
              chatId: data.chatId,
              userId: data.userId,
            });
          }
        }
      }

      return { success: true };
    } catch (error) {
      client.emit('error', { message: 'Failed to mark messages as read' });
      return null;
    }
  }
}
