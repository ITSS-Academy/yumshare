
import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ShareModule } from '../../shares/share.module';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [
    ShareModule,
    FormsModule,
    CommonModule,
    RouterModule
  ],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  // User state
  isLoggedIn = false; // Change this based on auth state
  userName = '';
  userAvatar = '';

  // Search
  searchQuery = '';

  // Notification counts
  messageCount = 0;
  notificationCount = 0;

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  constructor(private router: Router) {}

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
    }
  }

  onSearchInput() {
    // Real-time search suggestions can be implemented here
    // console.log('Search input:', this.searchQuery);
  }

  clearSearch() {
    this.searchQuery = '';
  }

  onMessage() {
    console.log('Open messages');
    // Navigate to messages page
  }

  onNotification() {
    console.log('Open notifications');
    // Navigate to notifications page
  }

  onLogin() {
    console.log('Open login dialog');
    // Open login dialog or navigate to login page
  }

  onProfile() {
    console.log('Open profile');
    this.router.navigate(['/profile'], { queryParams: { userName: this.userName } });

    // Navigate to profile page
  }

  onSettings() {
    console.log('Open settings');
    // Navigate to settings page
  }

  onLogout() {
    console.log('Logout');
    // Implement logout logic
    this.isLoggedIn = false;
    this.userName = '';
    this.userAvatar = '';
  }

  // Method to simulate login (for testing)
  simulateLogin(name: string, avatar: string) {
    this.isLoggedIn = true;
    this.userName = name;
    this.userAvatar = avatar;
    this.messageCount = 3;
    this.notificationCount = 5;
  }
}
