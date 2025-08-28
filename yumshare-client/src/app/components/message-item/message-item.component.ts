import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

import { MatIconModule } from '@angular/material/icon';

export interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: Date;
}

@Component({
  selector: 'app-message-item',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './message-item.component.html',
  styleUrl: './message-item.component.scss'
})
export class MessageItemComponent {
  @Input() message!: Message;
  @Input() currentUserId!: string;

  get isOwnMessage(): boolean {
    return this.message.sender.id === this.currentUserId;
  }

  get formattedTime(): string {
    return this.message.timestamp.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
