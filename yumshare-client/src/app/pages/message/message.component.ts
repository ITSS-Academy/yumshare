import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat/chat.service';
import { Chat, CreateMessageDto } from '../../models/chat.model';
import { User } from '../../models/user.model';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { ChatMessageSkeletonComponent } from '../../components/skeleton/chat-message-skeleton.component';
import { ShareModule } from '../../shares/share.module';
import { LocalTimePipe } from '../../pipes/local-time.pipe';
import { ChatMessage } from '../../models/chat-message.model';
import { UserListComponent } from './components/user-list/user-list.component';
import { ChatWindowComponent } from './components/chat-window/chat-window.component';
import {FooterComponent} from '../../components/footer/footer.component';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, FormsModule, ShareModule, UserListComponent, ChatWindowComponent, FooterComponent],
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit, OnDestroy {
  // Current user (mock - should come from auth service)
  currentUser: User = {
    id: '550e8400-e29b-41d4-a716-446655440000',
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
  isTyping: boolean = false;
  typingTimeout: any;

  // Track optimistic messages to avoid duplicates
  private optimisticMessageIds = new Set<string>();

  // Polling for new messages
  private pollingInterval: any;
  private lastMessageId: string | null = null;

  // UI states
  showSearchResults: boolean = false;
  loading: boolean = false;

  // Subscriptions
  private subscriptions: Subscription[] = [];

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
      messageDate = new Date(date);
      if (date.includes('T') && !date.includes('Z') && !date.includes('+')) {
        messageDate = new Date(date + 'Z');
      }
    } else {
      messageDate = date;
    }

    const now = new Date();
    const diffInMs = now.getTime() - messageDate.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInDays < 1) {
      return messageDate.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Ho_Chi_Minh'
      });
    }

    if (diffInDays < 2) {
      return 'Hôm qua';
    }

    if (diffInDays < 7) {
      return messageDate.toLocaleDateString('vi-VN', {
        weekday: 'short',
        timeZone: 'Asia/Ho_Chi_Minh'
      });
    }

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
    this.stopPolling();
  }

  private setupWebSocketListeners() {
    // Listen for new messages
    this.subscriptions.push(
      this.chatService.newMessage$.subscribe(message => {
        console.log('WebSocket received message:', {
          id: message.id,
          content: message.content,
          sender_id: message.sender_id,
          isCurrentUser: message.sender_id === this.currentUser.id,
          currentMessagesCount: this.messages.length
        });

        if (message && this.selectedChat && message.chat_id === this.selectedChat?.id) {
          // Check if message already exists by ID first
          const existingMessageById = this.messages.find(m => m.id === message.id);
          if (existingMessageById) {
            console.log('Message already exists by ID, skipping:', message.id);
            return;
          }

          // For current user's messages, only handle if it's not from optimistic update
          if (message.sender_id === this.currentUser.id) {
            // Check if this is a duplicate of an optimistic message we're tracking
            const isOptimisticDuplicate = Array.from(this.optimisticMessageIds).some(tempId => {
              const tempMessage = this.messages.find(m => m.id === tempId);
              return tempMessage &&
                     tempMessage.content === message.content &&
                     tempMessage.sender_id === message.sender_id;
            });

            if (isOptimisticDuplicate) {
              console.log('Skipping duplicate of optimistic message:', message.content);
              return;
            }

            // Check if we already have this message by content and sender (within 5 seconds)
            const duplicateByContent = this.messages.find(m =>
              m.content === message.content &&
              m.sender_id === message.sender_id &&
              Math.abs(new Date(m.created_at).getTime() - new Date(message.created_at).getTime()) < 5000
            );
            if (duplicateByContent) {
              console.log('Skipping duplicate message by content:', message.content);
              return;
            }

            // Only add if it's a new message from current user (shouldn't happen with current setup)
            console.log('Adding new message from current user via WebSocket:', message.id);
            this.messages.push(message);
          } else {
            // Add message from other user
            this.messages.push(message);
            console.log('Added message from other user:', message.id);
          }

          // Update chat list
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

    // Start polling for new messages
    this.startPolling();
  }

  private loadMessages(chatId: string) {
    this.chatService.getChatMessages(chatId).subscribe({
      next: (messages) => {
        this.messages = messages;

        // Set last message ID for polling
        if (messages && messages.length > 0) {
          this.lastMessageId = messages[messages.length - 1].id as string;
        }

        this.scrollToBottom();

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



  private markChatAsRead(chatId: string) {
    this.chatService.markChatAsRead(chatId, this.currentUser.id).subscribe({
      next: () => {
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

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

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

    this.chatService.createChat(chatData).subscribe({
      next: (chat) => {
        this.chats.unshift(chat);
        if (chat.user1_id === this.currentUser.id) {
          (this.chats[0] as any).user2 = user;
        } else {
          (this.chats[0] as any).user1 = user;
        }
        this.selectChat(chat);
        this.showSearchResults = false;
        this.searchQuery = '';
      },
      error: (error) => {
        console.error('Error creating chat:', error);
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
      const messageContainer = document.querySelector('.chat-messages');
      if (messageContainer) {
        (messageContainer as HTMLElement).scrollTop = (messageContainer as HTMLElement).scrollHeight;
      }
    }, 100);
  }

  private startPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = setInterval(() => {
      if (this.selectedChat) {
        this.pollForNewMessages();
      }
    }, 3000); // Poll every 3 seconds
  }

  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  private pollForNewMessages() {
    if (!this.selectedChat) return;

    this.chatService.getChatMessages(this.selectedChat.id).subscribe({
      next: (messages) => {
        if (messages && messages.length > 0) {
          const latestMessage = messages[messages.length - 1];

          // Check if we have new messages
          if (this.lastMessageId !== latestMessage.id) {
            // Update messages if there are new ones
            this.messages = messages;
            this.lastMessageId = latestMessage.id;
            this.scrollToBottom();
            console.log('Polling: Found new messages, updated UI');
          }
        }
      },
      error: (error) => {
        console.error('Polling error:', error);
      }
    });
  }


  // Handle message sending from child component
  handleSendMessage(messageContent: string) {
    console.log('handleSendMessage called with:', messageContent);

    if (!messageContent.trim() || !this.selectedChat) return;

    const messageData: CreateMessageDto = {
      chat_id: this.selectedChat.id,
      sender_id: this.currentUser.id,
      content: messageContent.trim()
    };

    this.stopTyping();

    // Create optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: tempId as any,
      chat_id: this.selectedChat.id,
      sender_id: this.currentUser.id,
      content: messageContent.trim(),
      is_read: true,
      created_at: new Date() as any
    } as ChatMessage;

    // Track this optimistic message
    this.optimisticMessageIds.add(tempId);
    console.log('Added optimistic message:', tempId, 'Total optimistic messages:', this.optimisticMessageIds.size);

    // Add optimistic message to UI immediately
    this.messages.push(optimisticMessage);
    console.log('Added optimistic message to UI. Total messages:', this.messages.length);

    // Update chat list
    const chatIndex = this.chats.findIndex(c => c.id === this.selectedChat?.id);
    if (chatIndex !== -1) {
      this.chats[chatIndex].messages = [optimisticMessage];
      this.chats[chatIndex].updated_at = new Date();
    }
    this.scrollToBottom();

    // Send message via REST API (primary method)
    console.log('Sending message via REST API...');
    this.chatService.sendMessage(messageData).subscribe({
      next: (serverMessage) => {
        console.log('REST API response received:', serverMessage.id);

        // Replace optimistic message with server message
        const tempMessageIndex = this.messages.findIndex(m => m.id === tempId);
        if (tempMessageIndex !== -1) {
          // Update optimistic message properties without changing object reference
          Object.assign(this.messages[tempMessageIndex], {
            id: serverMessage.id,
            created_at: serverMessage.created_at,
            is_read: serverMessage.is_read
          });

          this.optimisticMessageIds.delete(tempId);
          console.log('Updated optimistic message with server data. Total messages:', this.messages.length);

          // Update chat list with server message
          if (chatIndex !== -1) {
            this.chats[chatIndex].messages = [this.messages[tempMessageIndex]];
          }

          this.scrollToBottom();
        } else {
          console.warn('Optimistic message not found for replacement:', tempId);
        }

        // Don't send via WebSocket since we already have the server message
        // WebSocket is only for real-time updates from other users
      },
      error: (error) => {
        console.error('Failed to send message:', error);
        // Remove optimistic message
        const tempMessageIndex = this.messages.findIndex(m => m.id === tempId);
        if (tempMessageIndex !== -1) {
          this.messages.splice(tempMessageIndex, 1);
          this.optimisticMessageIds.delete(tempId);
          console.log('Removed optimistic message due to error. Total messages:', this.messages.length);
        }
      }
    });
  }
}
