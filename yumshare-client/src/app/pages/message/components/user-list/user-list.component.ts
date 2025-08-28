import { Component, Input, Output, EventEmitter } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  imports: [
    FormsModule,
    NgForOf
  ],
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent {
  @Input() users: any[] = [];
  @Output() userSelected = new EventEmitter<any>();

  searchTerm = '';

  get filteredUsers() {
    return this.users.filter(u =>
      u.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  selectUser(user: any) {
    this.userSelected.emit(user);
  }
}
