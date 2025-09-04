import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Chat, CreateChatDto, CreateMessageDto } from '../../models/chat.model';
import { ChatMessage } from '../../models/chat-message.model';
import { User } from '../../models/user.model';

export interface TypingData {
  chatId: string;
  userId: string;
  isTyping: boolean;
}

export interface ReadData {
  chatId: string;
  userId: string;
  messageIds: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = environment.apiUrl;
  private socket: any;
  private connected = false;

  // Observables for real-time events
  public newMessage$ = new Subject<ChatMessage>();
  public userTyping$ = new Subject<TypingData>();
  public messagesRead$ = new Subject<ReadData>();
  public connectionStatus$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.initializeSocket();
  }

  private initializeSocket() {
    // Mock WebSocket implementation - replace with actual Socket.IO
    this.socket = {
      connected: false,
      emit: (event: string, data: any) => {
        console.log('Socket emit:', event, data);
        // Don't simulate server response for send_message to prevent duplicates
        // Real server response will come from REST API
      },
      on: (event: string, callback: Function) => {
        console.log('Socket listening for:', event);
      },
      connect: () => {
        this.connected = true;
        this.connectionStatus$.next(true);
        console.log('Socket connected');
      },
      disconnect: () => {
        this.connected = false;
        this.connectionStatus$.next(false);
        console.log('Socket disconnected');
      }
    };

    // Auto-connect
    this.socket.connect();
  }

  // WebSocket methods
  joinChat(userId: string) {
    if (this.socket) {
      this.socket.emit('join_chat', { userId });
    }
  }

  sendRealTimeMessage(messageData: CreateMessageDto) {
    if (this.socket && this.connected) {
      // Don't emit mock message for current user's messages
      // This prevents duplicate messages since we already have the server response
      console.log('WebSocket send_message (mock - no duplicate):', messageData.content);
    } else {
      console.warn('WebSocket not connected, message will be sent via REST API only');
    }
  }

  sendTypingIndicator(chatId: string, userId: string, isTyping: boolean) {
    if (this.socket) {
      this.socket.emit('typing', { chatId, userId, isTyping });
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
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

  // Test method to simulate message from other user
  simulateMessageFromOtherUser(chatId: string, otherUserId: string, content: string) {
    if (this.socket && this.connected) {
      setTimeout(() => {
        const mockMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          chat_id: chatId,
          sender_id: otherUserId,
          content: content,
          is_read: false,
          created_at: new Date()
        };
        this.newMessage$.next(mockMessage);
      }, 1000);
    }
  }
}
