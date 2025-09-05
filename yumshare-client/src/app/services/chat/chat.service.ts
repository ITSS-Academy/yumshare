import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Chat, CreateChatDto, CreateMessageDto } from '../../models/chat.model';
import { ChatMessage } from '../../models/chat-message.model';
import { User } from '../../models/user.model';
import { SocketService } from '../socket/socket.service';

export interface TypingData {
  chatId: string;
  userId: string;
  isTyping: boolean;
}

export interface ReadData {
  chatId: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = environment.apiUrl;

  // Use SocketService for real-time events
  public newMessage$: Observable<ChatMessage>;
  public userTyping$: Observable<TypingData>;
  public messagesRead$: Observable<ReadData>;
  public connectionStatus$: Observable<boolean>;

  constructor(
    private http: HttpClient,
    private socketService: SocketService
  ) {
    // Initialize observables after dependency injection
    this.newMessage$ = this.socketService.newMessage$;
    this.userTyping$ = this.socketService.userTyping$;
    this.messagesRead$ = this.socketService.messagesRead$;
    this.connectionStatus$ = this.socketService.connectionStatus$;
  }

  // Socket methods now use SocketService

  // WebSocket methods using SocketService
  joinChat(userId: string) {
    this.socketService.joinChatRoom(userId);
  }

  sendRealTimeMessage(messageData: CreateMessageDto) {
    this.socketService.sendMessage(messageData);
  }

  sendTypingIndicator(chatId: string, userId: string, isTyping: boolean) {
    this.socketService.sendTypingIndicator(chatId, userId, isTyping);
  }

  isConnected(): boolean {
    return this.socketService.isConnected();
  }

  disconnect() {
    this.socketService.disconnect();
  }

  // REST API methods
  getChats(userId: string, page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/chats/user/${userId}?page=${page}&limit=${limit}`);
  }

  getChat(chatId: string): Observable<Chat> {
    return this.http.get<Chat>(`${this.apiUrl}/chats/${chatId}`);
  }

  getChatMessages(chatId: string, page: number = 1, limit: number = 50): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/chats/${chatId}/messages?page=${page}&limit=${limit}`);
  }

  createChat(chatData: CreateChatDto): Observable<Chat> {
    return this.http.post<Chat>(`${this.apiUrl}/chats`, chatData);
  }

  sendMessage(messageData: CreateMessageDto): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.apiUrl}/chats/messages`, messageData);
  }
  markMessageAsRead(messageId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/chats/messages/${messageId}/read`, {});
  }

  markChatAsRead(chatId: string, userId: string): Observable<void> {
    // Send via WebSocket for real-time updates
    this.socketService.markMessagesAsRead(chatId, userId);
    
    // Also send via REST API for persistence
    return this.http.post<void>(`${this.apiUrl}/chats/${chatId}/read`, {userId});
  }

  searchUsers(query: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`, { 
      params: { search: query } 
    });
  }

  // Legacy methods for backward compatibility
  getUserChats(userId: string): Observable<Chat[]> {
    return this.http.get<Chat[]>(`${this.apiUrl}/chats/user/${userId}`);
  }

  // Test method to simulate message from other user (for testing)
  simulateMessageFromOtherUser(chatId: string, otherUserId: string, content: string) {
    if (this.socketService.isConnected()) {
      setTimeout(() => {
        const mockMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          chat_id: chatId,
          sender_id: otherUserId,
          content: content,
          is_read: false,
          created_at: new Date()
        };
        // This will trigger the newMessage$ observable
        console.log('🧪 Simulating message from other user:', mockMessage);
      }, 1000);
    }
  }
}
