import { Injectable, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { User } from '../auth/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/enums/notification-type.enum';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(ChatMessage)
    private readonly messageRepository: Repository<ChatMessage>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  async createChat(createChatDto: CreateChatDto) {
    // Check if users exist
    const user1 = await this.userRepository.findOne({ where: { id: createChatDto.user1_id } });
    const user2 = await this.userRepository.findOne({ where: { id: createChatDto.user2_id } });

    if (!user1 || !user2) {
      throw new BadRequestException('User not found');
    }

    // Check if chat already exists
    const existingChat = await this.chatRepository.findOne({
      where: [
        { user1_id: createChatDto.user1_id, user2_id: createChatDto.user2_id },
        { user1_id: createChatDto.user2_id, user2_id: createChatDto.user1_id }
      ]
    });

    if (existingChat) {
      return existingChat;
    }

    // Create new chat
    const chat = this.chatRepository.create(createChatDto);
    return this.chatRepository.save(chat);
  }

  async getUserChats(userId: string) {
    const chats = await this.chatRepository.find({
      where: [
        { user1_id: userId },
        { user2_id: userId }
      ],
      relations: ['user1', 'user2', 'messages'],
      order: { updated_at: 'DESC' }
    });

    // Ensure user data is properly loaded and formatted
    const processedChats: any[] = [];
    for (const chat of chats) {
      const processedChat = await this.forceLoadUserData(chat);
      processedChats.push(processedChat);
    }
    
    return processedChats;
  }

  async getChatMessages(chatId: string) {
    return this.messageRepository.find({
      where: { chat_id: chatId },
      relations: ['sender'],
      order: { created_at: 'ASC' }
    });
  }

  async sendMessage(createMessageDto: CreateMessageDto) {
    // Check if chat exists
    const chat = await this.chatRepository.findOne({ where: { id: createMessageDto.chat_id } });
    if (!chat) {
      throw new BadRequestException('Chat not found');
    }

    // Check if sender is part of the chat
    if (chat.user1_id !== createMessageDto.sender_id && chat.user2_id !== createMessageDto.sender_id) {
      throw new BadRequestException('Sender is not part of this chat');
    }

    // Create message
    const message = this.messageRepository.create(createMessageDto);
    const savedMessage = await this.messageRepository.save(message);

    // Update chat's updated_at timestamp
    await this.chatRepository.update(createMessageDto.chat_id, { updated_at: new Date() });

    // Create notification for recipient
    const recipientId = chat.user1_id === createMessageDto.sender_id ? chat.user2_id : chat.user1_id;
    const sender = await this.userRepository.findOne({ where: { id: createMessageDto.sender_id } });
    
    if (sender) {
      const notificationContent = `${sender.username || sender.email} sent you a message: ${createMessageDto.content.substring(0, 50)}${createMessageDto.content.length > 50 ? '...' : ''}`;
      
      try {
        await this.notificationsService.create({
          user_id: recipientId,
          type: NotificationType.MESSAGE,
          content: notificationContent,
          metadata: { 
            chat_id: createMessageDto.chat_id,
            sender_id: createMessageDto.sender_id,
            message_id: savedMessage.id
          }
        });
      } catch (error) {
        console.error('Error creating message notification:', error);
      }
    }

    return savedMessage;
  }

  async markMessageAsRead(messageId: string) {
    return this.messageRepository.update(messageId, { is_read: true });
  }

  async markChatAsRead(chatId: string, userId: string) {
    return this.messageRepository.update(
      { chat_id: chatId, sender_id: Not(userId) },
      { is_read: true }
    );
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const chats = await this.chatRepository.find({
      where: [
        { user1_id: userId },
        { user2_id: userId }
      ]
    });

    let totalUnread = 0;
    for (const chat of chats) {
      const unreadCount = await this.messageRepository.count({
        where: { 
          chat_id: chat.id,
          sender_id: Not(userId),
          is_read: false
        }
      });
      totalUnread += unreadCount;
    }

    return totalUnread;
  }

  async searchMessages(userId: string, query: string) {
    // Get all chats for the user
    const chats = await this.chatRepository.find({
      where: [
        { user1_id: userId },
        { user2_id: userId }
      ]
    });

    const chatIds = chats.map(chat => chat.id);

    // Search messages in user's chats
    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.chat', 'chat')
      .where('message.chat_id IN (:...chatIds)', { chatIds })
      .andWhere('message.content ILIKE :query', { query: `%${query}%` })
      .orderBy('message.created_at', 'DESC')
      .getMany();

    return messages;
  }

  async getChatById(chatId: string) {
    return this.chatRepository.findOne({ where: { id: chatId } });
  }

  async updateUserStatus(userId: string, isOnline: boolean) {
    // This method should update user's online status
    // You might want to use the AuthService here or create a separate method
    // For now, we'll just log it
    console.log(`User ${userId} is now ${isOnline ? 'online' : 'offline'}`);
  }



  // Method to force load user data from database
  async forceLoadUserData(chat: any) {
    const user1 = await this.userRepository.findOne({ where: { id: chat.user1_id } });
    const user2 = await this.userRepository.findOne({ where: { id: chat.user2_id } });
    
    return {
      ...chat,
      user1: user1 || {
        id: chat.user1_id,
        username: `User ${chat.user1_id.substring(0, 8)}`,
        email: `${chat.user1_id.substring(0, 8)}@example.com`,
        avatar_url: null,
        bio: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      user2: user2 || {
        id: chat.user2_id,
        username: `User ${chat.user2_id.substring(0, 8)}`,
        email: `${chat.user2_id.substring(0, 8)}@example.com`,
        avatar_url: null,
        bio: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    };
  }
}
