import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { Notification, NotificationType } from '../../models/notification.model';
import { NotificationService } from '../../services/notification/notification.service';
import { SocketService } from '../../services/socket/socket.service';
import { MessageListComponent } from '../message-list/message-list.component';
import { LocalTimePipe } from '../../pipes/local-time.pipe';
import * as NotificationActions from '../../ngrx/notification/notification.actions';
import * as NotificationSelectors from '../../ngrx/notification/notification.selectors';
import * as AuthSelectors from '../../ngrx/auth/auth.selectors';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    LocalTimePipe,
  ],
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private notificationService = inject(NotificationService);
  private socketService = inject(SocketService);
  private router = inject(Router);
  private dialogRef = inject(MatDialogRef<NotificationListComponent>);
  private translate = inject(TranslateService);
  private subscriptions: Subscription[] = [];

  // NgRx Observables
  notifications$: Observable<Notification[]>;
  messageNotifications$: Observable<Notification[]>;
  otherNotifications$: Observable<Notification[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  unreadCount$: Observable<number>;
  messageCount$: Observable<number>;
  currentUserId$: Observable<string | null>;

  constructor() {
    // Initialize observables
    this.notifications$ = this.store.select(NotificationSelectors.selectNotifications);
    this.messageNotifications$ = this.store.select(NotificationSelectors.selectMessageNotifications);
    this.otherNotifications$ = this.store.select(NotificationSelectors.selectNonMessageNotifications);
    this.loading$ = this.store.select(NotificationSelectors.selectIsAnyLoading);
    this.error$ = this.store.select(NotificationSelectors.selectNotificationsError);
    this.unreadCount$ = this.store.select(NotificationSelectors.selectUnreadCount);
    this.messageCount$ = this.store.select(NotificationSelectors.selectMessageCount);
    this.currentUserId$ = this.store.select(AuthSelectors.selectUserId);
  }

  ngOnInit(): void {
    // Only load notifications if we don't have any yet
    this.subscriptions.push(
      this.currentUserId$.subscribe(userId => {
        if (userId) {
          // Check if we already have notifications loaded
          this.subscriptions.push(
            this.notifications$.subscribe(notifications => {
              if (!notifications || notifications.length === 0) {
                this.store.dispatch(NotificationActions.loadUserNotifications({ userId }));
                this.store.dispatch(NotificationActions.loadNotificationCounts({ userId }));
              }
            })
          );
        }
      })
    );

    
    // Listen for real-time notifications (handled by effect, just show toast)
    this.subscriptions.push(
      this.socketService.notification$.subscribe(notification => {
        if (notification) {
          this.showToastNotification(notification);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }

  loadNotifications(): void {
    this.subscriptions.push(
      this.currentUserId$.subscribe(userId => {
        if (userId) {
          // Force reload notifications
          this.store.dispatch(NotificationActions.loadUserNotifications({ userId }));
          this.store.dispatch(NotificationActions.loadNotificationCounts({ userId }));
        }
      })
    );
  }

  markAsRead(notification: Notification): void {
    if (!notification.is_read) {
      this.store.dispatch(NotificationActions.markNotificationAsRead({ id: notification.id }));
    }
  }

  markAllAsRead(): void {
    this.subscriptions.push(
      this.currentUserId$.subscribe(userId => {
        if (userId) {
          this.store.dispatch(NotificationActions.markAllNotificationsAsRead({ userId }));
        }
      })
    );
  }

  deleteNotification(id: string): void {
    this.store.dispatch(NotificationActions.deleteNotification({ id }));
  }

  getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.LIKE:
        return 'favorite';
      case NotificationType.COMMENT:
        return 'comment';
      case NotificationType.FOLLOW:
        return 'person_add';
      case NotificationType.RECIPE_APPROVED:
        return 'check_circle';
      case NotificationType.RECIPE_REJECTED:
        return 'cancel';
      case NotificationType.RECIPE_SHARED:
        return 'share';
      case NotificationType.SYSTEM:
        return 'info';
      case NotificationType.MESSAGE:
        return 'message';
      default:
        return 'notifications';
    }
  }

  getNotificationColor(type: NotificationType): string {
    switch (type) {
      case NotificationType.LIKE:
        return 'accent';
      case NotificationType.COMMENT:
        return 'primary';
      case NotificationType.FOLLOW:
        return 'warn';
      case NotificationType.RECIPE_APPROVED:
        return 'primary';
      case NotificationType.RECIPE_REJECTED:
        return 'warn';
      case NotificationType.RECIPE_SHARED:
        return 'accent';
      case NotificationType.SYSTEM:
        return 'primary';
      case NotificationType.MESSAGE:
        return 'accent';
      default:
        return 'primary';
    }
  }

  getTranslatedNotificationContent(notification: Notification): string {
    const content = notification.content;
    
    // Translate common notification patterns
    if (content.includes('liked your recipe')) {
      return content.replace('liked your recipe', this.translate.instant('liked your recipe'));
    }
    if (content.includes('commented on your recipe')) {
      return content.replace('commented on your recipe', this.translate.instant('commented on your recipe'));
    }
    if (content.includes('started following you')) {
      return content.replace('started following you', this.translate.instant('started following you'));
    }
    if (content.includes('approved your recipe')) {
      return content.replace('approved your recipe', this.translate.instant('approved your recipe'));
    }
    if (content.includes('rejected your recipe')) {
      return content.replace('rejected your recipe', this.translate.instant('rejected your recipe'));
    }
    if (content.includes('shared your recipe')) {
      return content.replace('shared your recipe', this.translate.instant('shared your recipe'));
    }
    if (content.includes('sent you a message')) {
      return content.replace('sent you a message', this.translate.instant('sent you a message'));
    }
    if (content.includes('added your recipe') && content.includes('to favorites')) {
      return content.replace('added your recipe', this.translate.instant('added your recipe'))
                   .replace('to favorites', this.translate.instant('to favorites'));
    }
    
    return content;
  }

  onNotificationClick(notification: Notification): void {
    // Mark as read first
    this.markAsRead(notification);
      // Close dialog before navigation
  this.dialogRef?.close();
    
    // Navigate based on notification type
    if (notification.type === NotificationType.MESSAGE) {
      // Navigate to chat or message section
      if (notification.metadata?.['chat_id']) {
        this.router.navigate(['/chat', notification.metadata['chat_id']]);
      } else {
        this.router.navigate(['/messages']);
      }
    } else if (notification.metadata?.recipe_id) {
      this.router.navigate(['/recipe-detail', notification.metadata.recipe_id]);
    } else if (notification.metadata?.follower_id) {
      this.router.navigate(['/profile'], { 
        queryParams: { userId: notification.metadata.follower_id } 
      });
    }
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount$;
  }

  private showToastNotification(notification: Notification): void {
    // SnackBar removed as requested
  }
}
