import {Component, Input, OnInit, OnDestroy, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { Notification, NotificationType } from '../../models/notification.model';
import { NotificationService } from '../../services/notification/notification.service';
import { SocketService } from '../../services/socket/socket.service';
import { TranslatePipe } from '@ngx-translate/core';
import {TranslateService, _} from "@ngx-translate/core";
import {take} from 'rxjs/operators';
import { LocalTimePipe } from '../../pipes/local-time.pipe';
import { AuthState } from '../../ngrx/auth/auth.state';
import { selectCurrentUser } from '../../ngrx/auth/auth.selectors';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    LocalTimePipe
  ],
  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.scss'
})
export class MessageListComponent implements OnInit, OnDestroy {
  @Input() notifications: Notification[] = [];
  loading = false;
  error: string | null = null;
  private subscription = new Subscription();
  private translate = inject(TranslateService);


  constructor(
    private notificationService: NotificationService,
    private socketService: SocketService,
    private router: Router,
    private dialogRef: MatDialogRef<MessageListComponent>,
    private store: Store<{ auth: AuthState }>
  ) {}

  ngOnInit(): void {
    if (this.notifications.length === 0) {
      this.loadMessageNotifications();
    }

    // Listen for real-time message notifications
    this.subscription.add(
      this.socketService.notification$.subscribe(notification => {
        if (notification && notification.type === NotificationType.MESSAGE) {
          this.notifications.unshift(notification);
          this.showToastNotification(notification);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadMessageNotifications(): void {
    this.loading = true;
    this.error = null;

    this.subscription.add(
      this.notificationService.getUserNotifications().subscribe({
        next: (data) => {
          this.translate.get(_('sent_you_a_message')).pipe(take(1)).subscribe((res: string) => {
            this.notifications = data
              .filter(n => n.type === NotificationType.MESSAGE)
              .map(n => ({
                ...n,
                content: n.content.replace('sent you a message', res)
              }));
            this.loading = false;
            console.log('Loaded message notifications:', this.notifications);
          });
        },
        error: (err) => {
          this.error = this.translate.instant('Failed to load messages');
          this.loading = false;
          console.error(this.translate.instant('Error loading message notifications'), err);
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
            // Reload notification count to update nav-bar badge
            this.notificationService.refreshNotificationCount();
          },
          error: (err) => {
            console.error('Error marking message as read:', err);
          }
        })
      );
    }
  }

  markAllAsRead(): void {
    // Get current user ID from auth state
    this.subscription.add(
      this.store.select(selectCurrentUser).subscribe(user => {
        if (user?.uid) {
          this.subscription.add(
            this.notificationService.markAllAsRead(user.uid).subscribe({
              next: () => {
                this.notifications.forEach(n => n.is_read = true);
                // Reload notification count to update nav-bar badge
                this.notificationService.refreshNotificationCount();
              },
              error: (err) => {
                console.error('Error marking all messages as read:', err);
              }
            })
          );
        }
      })
    );
  }

  deleteNotification(id: string): void {
    this.subscription.add(
      this.notificationService.deleteNotification(id).subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id !== id);
          // Reload notification count to update nav-bar badge
          this.notificationService.refreshNotificationCount();
        },
        error: (err) => {
          console.error('Error deleting message:', err);
        }
      })
    );
  }

  onMessageClick(notification: Notification): void {
    // Mark as read first
    this.markAsRead(notification);
    // Close dialog before navigation
    this.dialogRef?.close();

    // Navigate to chat
    if (notification.metadata?.['chat_id']) {
      this.router.navigate(['/chat', notification.metadata['chat_id']]);
    } else {
      this.router.navigate(['/messages']);
    }
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.is_read).length;
  }

  private showToastNotification(notification: Notification): void {
    // SnackBar removed as requested
  }
}
