import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification } from '../../models/notification.model';
import { ChatMessage } from '../../models/chat-message.model';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket;
  
  // Notification events
  private notificationSubject = new BehaviorSubject<Notification | null>(null);
  public notification$ = this.notificationSubject.asObservable();

  // Chat events
  private newMessageSubject = new Subject<ChatMessage>();
  public newMessage$ = this.newMessageSubject.asObservable();
  
  private userTypingSubject = new Subject<{chatId: string, userId: string, isTyping: boolean}>();
  public userTyping$ = this.userTypingSubject.asObservable();
  
  private messagesReadSubject = new Subject<{chatId: string, userId: string}>();
  public messagesRead$ = this.messagesReadSubject.asObservable();

  // Connection status
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket(): void {
    this.socket = io(environment.apiUrl, {
      transports: ['websocket'],
      autoConnect: false
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to server');
      this.connectionStatusSubject.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      this.connectionStatusSubject.next(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.connectionStatusSubject.next(false);
    });

    this.socket.on('notification', (notification: Notification) => {
      console.log('🔔 Received notification:', notification);
      this.notificationSubject.next(notification);
    });

    // Chat events
    this.socket.on('newMessage', (message: ChatMessage) => {
      console.log('💬 Received new message:', message);
      this.newMessageSubject.next(message);
    });

    this.socket.on('userTyping', (data: {chatId: string, userId: string, isTyping: boolean}) => {
      console.log('⌨️ User typing:', data);
      this.userTypingSubject.next(data);
    });

    this.socket.on('messagesRead', (data: {chatId: string, userId: string}) => {
      console.log('👁️ Messages read:', data);
      this.messagesReadSubject.next(data);
    });
  }

  connect(): void {
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  disconnect(): void {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  joinUserRoom(userId: string): void {
    if (this.socket.connected) {
      this.socket.emit('join', userId);
      console.log(`👤 User ${userId} joined notification room`);
    } else {
      console.warn('Socket not connected, cannot join room');
    }
  }

  joinChatRoom(userId: string): void {
    if (this.socket.connected) {
      this.socket.emit('join', { userId });
      console.log(`💬 User ${userId} joined chat room`);
    } else {
      console.warn('Socket not connected, cannot join chat room');
    }
  }

  leaveUserRoom(userId: string): void {
    if (this.socket.connected) {
      this.socket.emit('leave', userId);
      console.log(`👋 User ${userId} left room`);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  // Listen for specific events
  on(event: string, callback: (...args: any[]) => void): void {
    this.socket.on(event, callback);
  }

  // Emit events
  emit(event: string, data?: any): void {
    this.socket.emit(event, data);
  }

  // Remove event listeners
  off(event: string, callback?: (...args: any[]) => void): void {
    this.socket.off(event, callback);
  }

  // Chat-specific methods
  sendMessage(messageData: any): void {
    if (this.socket.connected) {
      this.socket.emit('sendMessage', messageData);
      console.log('📤 Sent message via WebSocket:', messageData.content);
    } else {
      console.warn('Socket not connected, cannot send message');
    }
  }

  sendTypingIndicator(chatId: string, userId: string, isTyping: boolean): void {
    if (this.socket.connected) {
      this.socket.emit('typing', { chatId, userId, isTyping });
      console.log('⌨️ Sent typing indicator:', { chatId, userId, isTyping });
    }
  }

  markMessagesAsRead(chatId: string, userId: string): void {
    if (this.socket.connected) {
      this.socket.emit('markAsRead', { chatId, userId });
      console.log('👁️ Marked messages as read:', { chatId, userId });
    }
  }
}
