import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Chat,  CreateChatDto, CreateMessageDto } from '../../models/chat.model';
import { User } from '../../models/user.model';
import { ChatMessage } from '../../models/chat-message.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: Socket;
  private apiUrl = environment.apiUrl || 'http://localhost:3000';
  
  // BehaviorSubjects for real-time updates
  public newMessage$ = new BehaviorSubject<ChatMessage | null>(null);
  public userTyping$ = new BehaviorSubject<{chatId: string, userId: string, isTyping: boolean} | null>(null);
  public messagesRead$ = new BehaviorSubject<{chatId: string, userId: string} | null>(null);

  constructor(private http: HttpClient) {
    this.socket = io(this.apiUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    this.socket.on('newMessage', (message: ChatMessage) => {
      console.log('Received newMessage event:', message);
      this.newMessage$.next(message);
    });

    // Also receive confirmation for the sender
    this.socket.on('messageSent', (message: ChatMessage) => {
      console.log('Received messageSent event:', message);
      this.newMessage$.next(message);
    });

    this.socket.on('userTyping', (data: {chatId: string, userId: string, isTyping: boolean}) => {
      this.userTyping$.next(data);
    });

    this.socket.on('messagesRead', (data: {chatId: string, userId: string}) => {
      this.messagesRead$.next(data);
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });
  }

  // REST APIs
  createChat(createChatDto: CreateChatDto): Observable<Chat> {
    return this.http.post<Chat>(`${this.apiUrl}/chats`, createChatDto);
  }

  getUserChats(userId: string): Observable<Chat[]> {
    return this.http.get<Chat[]>(`${this.apiUrl}/chats/user/${userId}`);
  }

  getChatMessages(chatId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/chats/${chatId}/messages`);
  }

  sendMessage(createMessageDto: CreateMessageDto): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.apiUrl}/chats/messages`, createMessageDto);
  }

  markChatAsRead(chatId: string, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/chats/${chatId}/read`, { userId });
  }

  getUnreadMessageCount(userId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/chats/unread/${userId}`);
  }

  searchMessages(userId: string, query: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/chats/search/${userId}?q=${query}`);
  }

  // User APIs
  searchUsers(query: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users?search=${query}`);
  }

  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${userId}`);
  }

  // WebSocket methods
  joinChat(userId: string) {
    this.socket.emit('join', { userId });
  }

  sendRealTimeMessage(message: CreateMessageDto) {
    console.log('Sending message via WebSocket:', message);
    this.socket.emit('sendMessage', message);
  }

  sendTypingIndicator(chatId: string, userId: string, isTyping: boolean) {
    this.socket.emit('typing', { chatId, userId, isTyping });
  }

  markAsRead(chatId: string, userId: string) {
    this.socket.emit('markAsRead', { chatId, userId });
  }

  // Check connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
