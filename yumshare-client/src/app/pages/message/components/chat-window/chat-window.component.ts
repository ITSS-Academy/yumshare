import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Chat } from '../../../../models/chat.model';
import { User } from '../../../../models/user.model';
import { ChatMessage } from '../../../../models/chat-message.model';
import { ChatMessageSkeletonComponent } from '../../../../components/skeleton/chat-message-skeleton.component';
import { LocalTimePipe } from '../../../../pipes/local-time.pipe';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatMessageSkeletonComponent, LocalTimePipe, ScrollingModule],
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent implements AfterViewInit, OnChanges {
  @Input() chat: Chat | null = null;
  @Input() messages: ChatMessage[] = [];
  @Input() currentUser: User | null = null;
  @Input() otherUser: User | null = null;
  @Input() messagesLoading: boolean = false;

  @Output() back = new EventEmitter<void>();
  @Output() sendMessage = new EventEmitter<string>();
  @Output() typing = new EventEmitter<void>();

  newMessage: string = '';
  
  // Virtual scrolling properties
  itemSize = 100; // Height of each message item (increased for better visibility)

  @ViewChild('chatWindowContainer') chatWindowRef!: ElementRef<HTMLDivElement>;

  safeAvatar(url?: string): string {
    return url && url !== 'null' && url !== 'undefined' && url.trim() !== ''
      ? url
      : 'assets/default-avatar.png';
  }

  onBack() {
    this.back.emit();
  }

  onTyping() {
    this.typing.emit();
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage.emit(this.newMessage);
      this.newMessage = '';
      setTimeout(() => this.scrollToBottom(), 0);
    }
  }

  sendMessageHandler() {
    if (this.newMessage.trim()) {
      this.sendMessage.emit(this.newMessage);
      this.newMessage = '';
      setTimeout(() => this.scrollToBottom(), 0);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => this.scrollToBottom(), 0);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['messages']) {
      setTimeout(() => this.scrollToBottom(), 0);
    }
  }

  private scrollToBottom() {
    if (this.chatWindowRef && this.chatWindowRef.nativeElement) {
      const container = this.chatWindowRef.nativeElement.querySelector('.messages-list');
      if (container) {
        const items = container.querySelectorAll('.message-item');
        if (items.length > 0) {
          const lastItem = items[items.length - 1] as HTMLElement;
          lastItem.scrollIntoView({ behavior: 'auto', block: 'end' });
        }
      }
    }
  }

  getFallbackUserName(): string {
    if (!this.chat || !this.currentUser) return 'Unknown User';
    
    const otherUserId = this.chat.user1_id === this.currentUser.id ? this.chat.user2_id : this.chat.user1_id;
    return `User ${otherUserId.substring(0, 8)}`;
  }

  // TrackBy function for virtual scrolling performance
  trackByMessageId(index: number, message: ChatMessage): string {
    return message.id;
  }
}
