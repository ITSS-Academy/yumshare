
import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ShareModule } from '../../shared/share.module';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../login/login.component';
import { NotificationListComponent } from '../notification-list/notification-list.component';
import { MessageListComponent } from '../message-list/message-list.component';
import { DarkModeToggleComponent } from '../dark-mode-toggle/dark-mode-toggle.component';
import { Store } from '@ngrx/store';
import { AuthState } from '../../ngrx/auth/auth.state';
import { AuthModel } from '../../models/auth.model';
import * as AuthActions from '../../ngrx/auth/auth.actions';
import { Subscription, Observable } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { NotificationService } from '../../services/notification/notification.service';
import * as NotificationSelectors from '../../ngrx/notification/notification.selectors';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [
    ShareModule,
    FormsModule,
    CommonModule,
    RouterModule,
    // DarkModeToggleComponent
  ],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();

  isLoggedIn = false;
  userName = '';
  userAvatar = '';
  currentUser: AuthModel | null = null;

  searchQuery = '';
  showSuggestions = false;
  messageCount$!: Observable<number>;
  notificationCount$!: Observable<number>;

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router, 
    private dialog: MatDialog,
    private store: Store<{auth: AuthState}>,
    private auth: Auth
  ) {
    // Initialize observables
    this.messageCount$ = this.store.select(NotificationSelectors.selectMessageCount);
    this.notificationCount$ = this.store.select(NotificationSelectors.selectUnreadCount);
  }

  ngOnInit() {
    this.subscriptions.push(
      this.store.select(state => state.auth).subscribe(authState => {
        if (authState.currentUser && authState.currentUser.uid) {
          this.isLoggedIn = true;
          this.currentUser = authState.currentUser;
          this.userName = authState.currentUser.displayName || '';
          this.userAvatar = authState.currentUser.photoURL || '';
          
          // Tự động đóng dialog login nếu Login thành công
          this.dialog.closeAll();
          
          // Notification counts are now handled by NgRx observables
        } else {
          this.isLoggedIn = false;
          this.currentUser = null;
          this.userName = '';
          this.userAvatar = '';
        }
      })
    );

    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }

  onToggleSidebar() { this.toggleSidebar.emit(); }

  onSearch() {
    if (this.searchQuery?.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
      this.showSuggestions = false;
    }
  }

  onSearchInput() {
    // Show suggestions when typing
    this.showSuggestions = this.searchQuery.length > 0;
  }

  clearSearch() {
    this.searchQuery = '';
    this.showSuggestions = false;
  }

  quickSearch(term: string) {
    this.searchQuery = term;
    this.onSearch();
  }

  onSearchFocus() {
    this.showSuggestions = true;
  }

  onSearchBlur() {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  private setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      // Ctrl+K to focus search
      if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('.search input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
      
      // Escape to clear search
      if (event.key === 'Escape' && this.searchQuery) {
        this.clearSearch();
      }
    });
  }

  onMessage() {
    if (this.isLoggedIn && this.currentUser?.uid) {
      const dialogRef = this.dialog.open(MessageListComponent, {
        width: '600px',
        maxWidth: '90vw',
        maxHeight: '80vh',
        panelClass: 'message-dialog'
      });
    } else {
      this.openLogin();
    }
  }
  
  onNotification() {
    if (this.isLoggedIn && this.currentUser?.uid) {
      const dialogRef = this.dialog.open(NotificationListComponent, {
        width: '600px',
        maxWidth: '90vw',
        maxHeight: '80vh',
        panelClass: 'notification-dialog'
      });
      
      // Notification counts are now handled by NgRx
    } else {
      this.openLogin();
    }
  }

  // Click behavior: if logged in go to profile, else open login dialog
  openLogin() {
    if (!this.isLoggedIn) {
      this.dialog.open(LoginComponent, { panelClass: 'custom-dialog', autoFocus: false });
    }
  }



  async onLogout() {
    try {
      // Đăng xuất khỏi Firebase trước
      await this.auth.signOut();
      // Sau đó clear auth state
      this.store.dispatch(AuthActions.clearAuthState());
    } catch (error) {
      console.error('Logout error:', error);
      // Nếu có lỗi, vẫn clear auth state
      this.store.dispatch(AuthActions.clearAuthState());
    }
  }


  onAddRecipe() {
    if (this.isLoggedIn) {
      this.router.navigate(['/add-recipe']);
    } else {
      this.openLogin();
    }
  }

  onLogin() {
    // Open login dialog or navigate to login page
  }

  onProfile() {
    this.router.navigate(['/profile'], { queryParams: { userName: this.userName } });
  }

  // Notification counts are now handled by NgRx observables

  onSettings() {
    // Navigate to settings page
  }



  // Method to simulate login (for testing)
  // helper to simulate - có thể xóa sau khi test xong
  simulateLogin(name: string, avatar: string) {
    this.isLoggedIn = true;
    this.userName = name;
    this.userAvatar = avatar;
    // Notification counts are now handled by NgRx
  }
}
