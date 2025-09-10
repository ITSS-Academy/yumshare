import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ShareModule } from '../../shares/share.module';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../login/login.component';
import { NotificationListComponent } from '../notification-list/notification-list.component';
import { MessageListComponent } from '../message-list/message-list.component';
import { DarkModeToggleComponent } from '../dark-mode-toggle/dark-mode-toggle.component';
import { Store } from '@ngrx/store';
import { AuthState } from '../../ngrx/auth/auth.state';
import { AuthModel } from '../../models/auth.model';
import * as AuthActions from '../../ngrx/auth/auth.actions';
import { Subscription } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { NotificationService } from '../../services/notification/notification.service';
// NGX-TRANSLATE
import { TranslateService } from '@ngx-translate/core';
import { TranslatePipe } from '@ngx-translate/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [
    ShareModule,
    FormsModule,
    CommonModule,
    RouterModule,
    TranslatePipe,
    MatSlideToggleModule
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

  currentLang = 'en';

  private authSubscription: Subscription | null = null;
  private notificationCountSubscription: Subscription | null = null;

  constructor(
    private router: Router, 
    private dialog: MatDialog,
    private store: Store<{auth: AuthState}>,
    private auth: Auth,
    private notificationService: NotificationService,
    public translate: TranslateService // public để dùng trong template
  ) {
    translate.addLangs(['en', 'vi']);
    // Use getCurrentLang() and getFallbackLang() as recommended
    this.currentLang = translate.getCurrentLang() || translate.getFallbackLang() || 'en';
  }

  ngOnInit() {
    this.authSubscription = this.store.select(state => state.auth).subscribe(authState => {
      if (authState.currentUser && authState.currentUser.uid) {
        this.isLoggedIn = true;
        this.currentUser = authState.currentUser;
        this.userName = authState.currentUser.displayName || '';
        this.userAvatar = authState.currentUser.photoURL || '';
        this.dialog.closeAll();
        this.loadNotificationCount();
        this.subscribeToNotificationCount();
      } else {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.userName = '';
        this.userAvatar = '';
        this.notificationCount = 0;
        if (this.notificationCountSubscription) {
          this.notificationCountSubscription.unsubscribe();
          this.notificationCountSubscription = null;
        }
      }
    });

    // Cập nhật currentLang khi đổi ngôn ngữ ở nơi khác
    this.translate.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.notificationCountSubscription) {
      this.notificationCountSubscription.unsubscribe();
    }
  }

  onToggleSidebar() { this.toggleSidebar.emit(); }

  onSearch() {
    if (this.searchQuery?.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
    }
  }

  switchLang(lang: string) {
    this.translate.use(lang);
    this.currentLang = lang;
  }

  onSearchInput() { /* realtime suggestions */ }

  onMessage() {
    if (this.isLoggedIn && this.currentUser?.uid) {
      this.dialog.open(MessageListComponent, {
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
      dialogRef.afterClosed().subscribe(() => {
        this.loadNotificationCount();
      });
    } else {
      this.openLogin();
    }
  }

  openLogin() {
    if (!this.isLoggedIn) {
      this.dialog.open(LoginComponent, { panelClass: 'custom-dialog', autoFocus: false });
    }
  }

  async onLogout() {
    try {
      await this.auth.signOut();
      this.store.dispatch(AuthActions.clearAuthState());
    } catch (error) {
      console.error('Logout error:', error);
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

  private loadNotificationCount(): void {
    if (this.currentUser?.uid) {
      this.notificationService.getUserNotifications().subscribe({
        next: (notifications) => {
          this.notificationCount = notifications.filter(n => !n.is_read && n.type !== 'message').length;
          this.messageCount = notifications.filter(n => !n.is_read && n.type === 'message').length;
        },
        error: (err) => {
          console.error('Error loading notification count:', err);
          this.notificationCount = 0;
          this.messageCount = 0;
        }
      });
    }
  }

  private subscribeToNotificationCount(): void {
    this.notificationCountSubscription = this.notificationService.notificationCount$.subscribe(
      count => {
        this.notificationCount = count;
      }
    );
    this.notificationService.messageCount$.subscribe(
      count => {
        this.messageCount = count;
      }
    );
  }

  onSettings() {
    // Navigate to settings page
  }

  // Method to simulate login (for testing)
  simulateLogin(name: string, avatar: string) {
    this.isLoggedIn = true;
    this.userName = name;
    this.userAvatar = avatar;
    this.messageCount = 3;
    this.notificationCount = 2;
  }
}