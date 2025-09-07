import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Notification, NotificationType } from '../../models/notification.model';
import { NotificationService } from '../../services/notification/notification.service';
import { SocketService } from '../../services/socket/socket.service';
import { MessageListComponent } from '../message-list/message-list.component';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  loading = false;
  error: string | null = null;
  private subscription = new Subscription();

  // Getter để lấy các thông báo message
  get messageNotifications(): Notification[] {
    return this.notifications.filter(n => n.type === NotificationType.MESSAGE);
  }

  // Getter để lấy các thông báo không phải message
  get otherNotifications(): Notification[] {
    return this.notifications.filter(n => n.type !== NotificationType.MESSAGE);
  }

  constructor(
    private notificationService: NotificationService,
    private socketService: SocketService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<NotificationListComponent>
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    
    // Listen for real-time notifications
    this.subscription.add(
      this.socketService.notification$.subscribe(notification => {
        if (notification) {
          this.notifications.unshift(notification);
          this.showToastNotification(notification);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadNotifications(): void {
    this.loading = true;
    this.error = null;
    
    this.subscription.add(
      this.notificationService.getUserNotifications().subscribe({
        next: (data) => {
          this.notifications = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load notifications';
          this.loading = false;
          console.error('Error loading notifications:', err);
        }
      })
    );
  }

  markAsRead(notification: Notification): void {
    if (!notification.is_read) {
      this.subscription.add(
        this.notificationService.markAsRead(notification.id).subscribe({
          next: () => {
            notification.is_read = true;
            // Refresh notification count to update nav-bar badge
            this.notificationService.refreshNotificationCount();
          },
          error: (err) => {
            console.error('Error marking notification as read:', err);
          }
        })
      );
    }
  }

  markAllAsRead(): void {
    this.subscription.add(
      this.notificationService.markAllAsRead().subscribe({
        next: () => {
          this.notifications.forEach(n => n.is_read = true);
          // Refresh notification count to update nav-bar badge
          this.notificationService.refreshNotificationCount();
        },
        error: (err) => {
          console.error('Error marking all notifications as read:', err);
        }
      })
    );
  }

  deleteNotification(id: string): void {
    this.subscription.add(
      this.notificationService.deleteNotification(id).subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id !== id);
          // Refresh notification count to update nav-bar badge
          this.notificationService.refreshNotificationCount();
        },
        error: (err) => {
          console.error('Error deleting notification:', err);
        }
      })
    );
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

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.is_read).length;
  }

  private showToastNotification(notification: Notification): void {
    const icon = this.getNotificationIcon(notification.type);
    const message = notification.content;
    
    this.snackBar.open(message, 'View', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['notification-toast', 'unread-notification']
    }).onAction().subscribe(() => {
      this.onNotificationClick(notification);
    });
  }
}
