
import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ShareModule } from '../../shares/share.module';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../login/login.component';
import { DarkModeToggleComponent } from '../dark-mode-toggle/dark-mode-toggle.component';
import { Store } from '@ngrx/store';
import { AuthState } from '../../ngrx/auth/auth.state';
import { AuthModel } from '../../models/auth.model';
import * as AuthActions from '../../ngrx/auth/auth.actions';
import { Subscription } from 'rxjs';
import { Auth } from '@angular/fire/auth';

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
  messageCount = 0;
  notificationCount = 0;

  private authSubscription: Subscription | null = null;

  constructor(
    private router: Router, 
    private dialog: MatDialog,
    private store: Store<{auth: AuthState}>,
    private auth: Auth
  ) {}

  ngOnInit() {
    this.authSubscription = this.store.select(state => state.auth).subscribe(authState => {
      if (authState.currentUser && authState.currentUser.uid) {
        this.isLoggedIn = true;
        this.currentUser = authState.currentUser;
        this.userName = authState.currentUser.displayName || '';
        this.userAvatar = authState.currentUser.photoURL || '';
        
        // Tự động đóng dialog login nếu đăng nhập thành công
        this.dialog.closeAll();
      } else {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.userName = '';
        this.userAvatar = '';
      }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  onToggleSidebar() { this.toggleSidebar.emit(); }

  onSearch() {
    if (this.searchQuery?.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
    }
  }

  onSearchInput() { /* realtime suggestions */ }

  onMessage() { /* open messages */ }
  onNotification() { /* open notifications */ }

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



  // Method to simulate login (for testing)
  // helper to simulate - có thể xóa sau khi test xong
  simulateLogin(name: string, avatar: string) {
    this.isLoggedIn = true;
    this.userName = name;
    this.userAvatar = avatar;
    this.messageCount = 3;
    this.notificationCount = 2;
  }
}
