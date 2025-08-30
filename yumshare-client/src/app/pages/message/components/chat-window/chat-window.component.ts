import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Message, MessageItemComponent } from '../../../../components/message-item';
import { FormsModule } from '@angular/forms';
import {MatButton, MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  imports: [
    MessageItemComponent,
    FormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatInput
  ],
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent {
  @Input() user: any;
  @Output() back = new EventEmitter<void>();
  currentUserId = 'me';

  messages: Message[] = [
    {
      id: '1',
      content: 'Xin chào!',
      sender: { id: 'u1', name: 'Nguyễn Văn A', avatar: '' },
      timestamp: new Date()
    },
    {
      id: '2',
      content: 'Chào bạn, khỏe không?',
      sender: { id: 'me', name: 'Tôi', avatar: '' },
      timestamp: new Date()
    }
  ];

  newMessage = '';

  sendMessage() {
    if (this.newMessage.trim()) {
      this.messages.push({
        id: (this.messages.length + 1).toString(),
        content: this.newMessage,
        sender: { id: this.currentUserId, name: 'Tôi', avatar: '' },
        timestamp: new Date()
      });
      this.newMessage = '';
    }
  }

  onBack() {
    this.back.emit();
  }
}
