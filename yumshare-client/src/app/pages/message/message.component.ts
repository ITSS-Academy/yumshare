import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat/chat.service';
import { Chat, CreateMessageDto } from '../../models/chat.model';
import { User } from '../../models/user.model';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { ChatMessageSkeletonComponent } from '../../components/skeleton/chat-message-skeleton.component';
import { ShareModule } from "../../shares/share.module";
import { LocalTimePipe } from '../../pipes/local-time.pipe';
import { ChatMessage } from '../../models/chat-message.model';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatMessageSkeletonComponent, ShareModule, LocalTimePipe],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent implements OnInit, OnDestroy {
  // Current user (mock - should come from auth service)
  currentUser: User = {
    id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID format
    username: 'Current User',
    email: 'current@example.com',
    avatar_url: 'https://via.placeholder.com/40',
    created_at: new Date(),
    updated_at: new Date()
  };

  // Chat data
  chats: Chat[] = [];
  selectedChat: Chat | null = null;
  messages: ChatMessage[] = [];

  // Loading states
  chatsLoading = signal(true);
  messagesLoading = signal(false);
  
  // Search
  searchQuery: string = '';
  searchResults: User[] = [];
  isSearching: boolean = false;
  
  // Message input
  newMessage: string = '';
  isTyping: boolean = false;
  typingTimeout: any;
  
  // UI states
  showSearchResults: boolean = false;
  loading: boolean = false;
  
  // Subscriptions
  private subscriptions: Subscription[] = [];

  // Responsive sidebar properties
  sidebarOpen = false;

  // Debug method to show current time
  getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleString('vi-VN', { 
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

  // Helper method to format time intelligently
  formatTime(date: Date | string): string {
    let messageDate: Date;
    
    if (typeof date === 'string') {
      // Handle ISO string format
      messageDate = new Date(date);
      
      // If the string doesn't have timezone info, assume it's UTC
      if (date.includes('T') && !date.includes('Z') && !date.includes('+')) {
        messageDate = new Date(date + 'Z');
      }
    } else {
      messageDate = date;
    }
    
    const now = new Date();
    const diffInMs = now.getTime() - messageDate.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    // Debug: Log the time conversion
    console.log('formatTime - Original:', date);
    console.log('formatTime - Converted:', messageDate);
    console.log('formatTime - Local time:', messageDate.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }));

    // Same day - show time only
    if (diffInDays < 1) {
      return messageDate.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Ho_Chi_Minh'
      });
    }
    
    // Yesterday
    if (diffInDays < 2) {
      return 'Hôm qua';
    }
    
    // Within a week
    if (diffInDays < 7) {
      return messageDate.toLocaleDateString('vi-VN', {
        weekday: 'short',
        timeZone: 'Asia/Ho_Chi_Minh'
      });
    }
    
    // Older - show date
    return messageDate.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Asia/Ho_Chi_Minh'
    });
  }

  constructor(private chatService: ChatService, private auth: Auth) {
    const uid = this.auth.currentUser?.uid;
    if (uid) {
      this.currentUser.id = uid as any;
    }

    onAuthStateChanged(this.auth, (user) => {
      if (user && user.uid !== this.currentUser.id) {
        this.currentUser.id = user.uid as any;
        // Join socket room and reload chats once identity is known
        this.joinChat();
        this.loadChats();
      }
    });
  }

  ngOnInit() {
    this.setupWebSocketListeners();
    if (this.currentUser.id) {
      this.loadChats();
      this.joinChat();
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.chatService.disconnect();
  }

  private setupWebSocketListeners() {
    // Listen for new messages
    this.subscriptions.push(
      this.chatService.newMessage$.subscribe(message => {
        if (message && this.selectedChat && message.chat_id === this.selectedChat.id) {
          console.log('Received message via WebSocket:', message);
          
          // Try to reconcile optimistic temp message sent by this client
          if (message.sender_id === this.currentUser.id) {
            const tempIndex = this.messages.findIndex(m =>
              (m as any).id?.toString().startsWith('temp-') &&
              m.content === message.content
            );
            if (tempIndex !== -1) {
              console.log('Replacing temp message with server message');
              this.messages[tempIndex] = message;
            } else if (!this.messages.some(m => m.id === message.id)) {
              console.log('Adding new message from current user');
              this.messages.push(message);
            }
          } else if (!this.messages.some(m => m.id === message.id)) {
            console.log('Adding new message from other user');
            this.messages.push(message);
          }
          
          // Update chat preview
          const chatIndex = this.chats.findIndex(c => c.id === this.selectedChat?.id);
          if (chatIndex !== -1) {
            this.chats[chatIndex].messages = [message];
            this.chats[chatIndex].updated_at = new Date();
          }
          this.scrollToBottom();
        }
      })
    );

    // Listen for typing indicators
    this.subscriptions.push(
      this.chatService.userTyping$.subscribe(data => {
        if (data && this.selectedChat && data.chatId === this.selectedChat.id) {
          // Handle typing indicator
          console.log(`${data.userId} is typing: ${data.isTyping}`);
        }
      })
    );

    // Listen for read receipts
    this.subscriptions.push(
      this.chatService.messagesRead$.subscribe(data => {
        if (data && this.selectedChat && data.chatId === this.selectedChat.id) {
          // Mark messages as read
          this.messages.forEach(msg => {
            if (msg.sender_id !== this.currentUser.id) {
              msg.is_read = true;
            }
          });
        }
      })
    );
  }

  private joinChat() {
    this.chatService.joinChat(this.currentUser.id);
  }

  private loadChats() {
    this.loading = true;
    this.chatService.getUserChats(this.currentUser.id).subscribe({
      next: (chats) => {
        this.chats = chats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading chats:', error);
        this.loading = false;
      }
    });
  }

  selectChat(chat: Chat) {
    this.selectedChat = chat;
    this.loadMessages(chat.id);
    this.markChatAsRead(chat.id);
    
    // Auto-hide sidebar on mobile
    if (window.innerWidth <= 768) {
      this.sidebarOpen = false;
    }
  }

  private loadMessages(chatId: string) {
    this.chatService.getChatMessages(chatId).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.scrollToBottom();
        
        // If this is a new chat with no messages, show a welcome message
        if (messages.length === 0 && this.selectedChat) {
          const otherUser = this.getOtherUser(this.selectedChat);
          if (otherUser) {
            console.log(`New chat started with ${otherUser.username}`);
          }
        }
      },
      error: (error) => {
        console.error('Error loading messages:', error);
      }
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedChat) return;

    const messageData: CreateMessageDto = {
      chat_id: this.selectedChat.id,
      sender_id: this.currentUser.id,
      content: this.newMessage.trim()
    };

    // Store the message content before clearing
    const messageContent = this.newMessage.trim();
    
    // Clear input immediately for better UX
    this.newMessage = '';
    this.stopTyping();

    // Create optimistic message for immediate UI feedback
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: tempId as any,
      chat_id: this.selectedChat.id,
      sender_id: this.currentUser.id,
      content: messageContent,
      is_read: true,
      created_at: new Date() as any
    } as ChatMessage;
    
    // Add optimistic message to UI immediately
    this.messages.push(optimisticMessage);
    
    // Update chat preview
    const chatIndex = this.chats.findIndex(c => c.id === this.selectedChat?.id);
    if (chatIndex !== -1) {
      this.chats[chatIndex].messages = [optimisticMessage];
      this.chats[chatIndex].updated_at = new Date();
    }
    
    // Scroll to bottom immediately
    this.scrollToBottom();

    // Check WebSocket connection before sending
    if (this.chatService.isConnected()) {
      console.log('WebSocket is connected, sending via WebSocket');
      this.chatService.sendRealTimeMessage(messageData);
    } else {
      console.log('WebSocket not connected, sending via REST API');
      this.chatService.sendMessage(messageData).subscribe({
        next: (serverMessage) => {
          // Replace temp message with server message
          const tempMessageIndex = this.messages.findIndex(m => m.id === tempId);
          if (tempMessageIndex !== -1) {
            this.messages[tempMessageIndex] = serverMessage;
            this.scrollToBottom();
          }
        },
        error: (error) => {
          console.error('Failed to send message:', error);
          // Remove temp message on error
          const tempMessageIndex = this.messages.findIndex(m => m.id === tempId);
          if (tempMessageIndex !== -1) {
            this.messages.splice(tempMessageIndex, 1);
            // Restore message to input
            this.newMessage = messageContent;
          }
        }
      });
    }
    
    // Add fallback: if no response from server after 3 seconds, try REST API (only if WebSocket was used)
    if (this.chatService.isConnected()) {
      setTimeout(() => {
        const tempMessageIndex = this.messages.findIndex(m => m.id === tempId);
        if (tempMessageIndex !== -1) {
          console.log('No WebSocket response, trying REST API fallback');
          this.chatService.sendMessage(messageData).subscribe({
            next: (serverMessage) => {
              // Replace temp message with server message
              this.messages[tempMessageIndex] = serverMessage;
              this.scrollToBottom();
            },
            error: (error) => {
              console.error('Failed to send message via REST API:', error);
              // Remove temp message on error
              this.messages.splice(tempMessageIndex, 1);
              // Restore message to input
              this.newMessage = messageContent;
            }
          });
        }
      }, 3000);
    }
  }

  private markChatAsRead(chatId: string) {
    this.chatService.markChatAsRead(chatId, this.currentUser.id).subscribe({
      next: () => {
        // Mark messages as read locally
        this.messages.forEach(msg => {
          if (msg.sender_id !== this.currentUser.id) {
            msg.is_read = true;
          }
        });
      },
      error: (error) => {
        console.error('Error marking chat as read:', error);
      }
    });
  }

  onTyping() {
    if (!this.selectedChat) return;

    if (!this.isTyping) {
      this.isTyping = true;
      this.chatService.sendTypingIndicator(this.selectedChat.id, this.currentUser.id, true);
    }

    // Clear existing timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    // Set new timeout
    this.typingTimeout = setTimeout(() => {
      this.stopTyping();
    }, 1000);
  }

  private stopTyping() {
    if (this.selectedChat && this.isTyping) {
      this.isTyping = false;
      this.chatService.sendTypingIndicator(this.selectedChat.id, this.currentUser.id, false);
    }
  }

  searchUsers() {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      this.showSearchResults = false;
      return;
    }

    this.isSearching = true;
    this.chatService.searchUsers(this.searchQuery).subscribe({
      next: (users) => {
        this.searchResults = users.filter(user => user.id !== this.currentUser.id);
        this.showSearchResults = true;
        this.isSearching = false;
      },
      error: (error) => {
        console.error('Error searching users:', error);
        this.isSearching = false;
      }
    });
  }

  startNewChat(user: User) {
    const chatData = {
      user1_id: this.currentUser.id,
      user2_id: user.id
    };

    console.log('Creating chat with data:', chatData);

    this.chatService.createChat(chatData).subscribe({
      next: (chat) => {
        // Add the new chat to the beginning of the list
        this.chats.unshift(chat);

        // Attach the other user info so UI does not show nulls
        if (chat.user1_id === this.currentUser.id) {
          (this.chats[0] as any).user2 = user;
        } else {
          (this.chats[0] as any).user1 = user;
        }
        
        // Select the new chat immediately
        this.selectChat(chat);
        
        // Hide search results and clear search query
        this.showSearchResults = false;
        this.searchQuery = '';
        
        // Show success message (optional)
        console.log(`Started new chat with ${user.username}`);
      },
      error: (error) => {
        console.error('Error creating chat:', error);
        console.error('Error details:', error.error);
        console.error('Request data:', chatData);
        
        // Show user-friendly error message
        alert(`Failed to create chat: ${error.error?.message || error.message || 'Unknown error'}`);
      }
    });
  }

  // Method to check if chat already exists between two users
  checkExistingChat(otherUserId: string): Chat | null {
    return this.chats.find(chat => 
      (chat.user1_id === this.currentUser.id && chat.user2_id === otherUserId) ||
      (chat.user1_id === otherUserId && chat.user2_id === this.currentUser.id)
    ) || null;
  }

  // Method to start chat or select existing chat
  startOrSelectChat(user: User) {
    // Check if chat already exists
    const existingChat = this.chats.find(chat => 
      (chat.user1_id === this.currentUser.id && chat.user2_id === user.id) ||
      (chat.user1_id === user.id && chat.user2_id === this.currentUser.id)
    );

    if (existingChat) {
      this.selectChat(existingChat);
    } else {
      this.startNewChat(user);
    }
  }

  getOtherUser(chat: Chat): User | null {
    if (chat.user1_id === this.currentUser.id) {
      return chat.user2 || null;
    } else {
      return chat.user1 || null;
    }
  }

  // Helpers to avoid showing "null" avatar/name
  safeAvatar(url?: string): string {
    return url && url !== 'null' && url !== 'undefined' && url.trim() !== ''
      ? url
      : 'assets/default-avatar.png';
  }

  otherUserName(chat: Chat): string {
    const otherUser = this.getOtherUser(chat);
    if (otherUser && otherUser.username && otherUser.username !== 'null') {
      return otherUser.username;
    }
    
    // Fallback: use a more descriptive name based on user ID
    const otherUserId = chat.user1_id === this.currentUser.id ? chat.user2_id : chat.user1_id;
    return `User ${otherUserId.substring(0, 8)}`;
  }

  getLastMessage(chat: Chat): string {
    if (chat.messages && chat.messages.length > 0) {
      const lastMessage = chat.messages[chat.messages.length - 1];
      return lastMessage.content.length > 30 
        ? lastMessage.content.substring(0, 30) + '...' 
        : lastMessage.content;
    }
    return 'Start a conversation';
  }

  isNewChat(chat: Chat): boolean {
    return !chat.messages || chat.messages.length === 0;
  }

  getUnreadCount(chat: Chat): number {
    if (!chat.messages) return 0;
    return chat.messages.filter(msg => 
      msg.sender_id !== this.currentUser.id && !msg.is_read
    ).length;
  }

  private scrollToBottom() {
    setTimeout(() => {
      const messageContainer = document.querySelector('.messages-container');
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    }, 100);
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // Responsive sidebar methods
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
