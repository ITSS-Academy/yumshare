import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chat } from '../../../../models/chat.model';
import { User } from '../../../../models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent {
  @Input() chats: Chat[] = [];
  @Input() searchResults: User[] = [];
  @Input() showSearchResults: boolean = false;
  @Input() loading: boolean = false;
  @Input() currentUser: User | null = null;

  @Output() chatSelected = new EventEmitter<Chat>();
  @Output() userSelected = new EventEmitter<User>();
  @Output() searchQueryChanged = new EventEmitter<string>();

  searchQuery: string = '';

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

  onSearchChange() {
    this.searchQueryChanged.emit(this.searchQuery);
  }

  closeSearch() {
    this.searchQuery = '';
    this.searchQueryChanged.emit('');
  }

  onUserSelect(user: User) {
    this.userSelected.emit(user);
  }

  onChatSelect(chat: Chat) {
    this.chatSelected.emit(chat);
  }

  isActiveChat(chat: Chat): boolean {
    // This would need to be passed from parent or determined by some logic
    return false;
  }

  getOtherUser(chat: Chat): User | null {
    if (!this.currentUser) return null;
    
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
    
    if (!this.currentUser) return 'Unknown User';
    
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
    if (!chat.messages || !this.currentUser) return 0;
    return chat.messages.filter(msg => 
      msg.sender_id !== this.currentUser!.id && !msg.is_read
    ).length;
  }
}
