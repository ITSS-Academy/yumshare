import { Component } from '@angular/core';
import {ChatWindowComponent} from './components/chat-window/chat-window.component';
import {UserListComponent} from './components/user-list/user-list.component';
import {NgClass, NgIf} from '@angular/common';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  imports: [
    ChatWindowComponent,
    UserListComponent,
    NgIf,
    NgClass
  ],
  styleUrls: ['./message.component.scss']
})
export class MessageComponent {
  users = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    name: 'User ' + (i + 1),
    avatar: 'https://i.pravatar.cc/40?img=' + (i + 1),
    lastMessage: 'Tin nhắn gần nhất...',
    time: `${i + 1} giờ trước`
  }));

  selectedUser: any = null;

  onUserSelected(user: any) {
    this.selectedUser = user;
  }
}
