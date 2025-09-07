import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Notification } from '../../models/notification.model';
import { Store } from '@ngrx/store';
import { AuthState } from '../../ngrx/auth/auth.state';
import { selectCurrentUser } from '../../ngrx/auth/auth.selectors';
// 
export interface CreateNotificationDto {
  user_id: string;
  type: string;
  content: string;
  metadata?: {
    recipe_id?: string;
    comment_id?: string;
    follower_id?: string;
    [key: string]: any;
  };
}

export interface UpdateNotificationDto {
  is_read?: boolean;
  content?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = environment.apiUrl;
  private notificationCountSubject = new BehaviorSubject<number>(0);
  private messageCountSubject = new BehaviorSubject<number>(0);
  public notificationCount$ = this.notificationCountSubject.asObservable();
  public messageCount$ = this.messageCountSubject.asObservable();

  constructor(
    private http: HttpClient,
    private store: Store<{ auth: AuthState }>
  ) {}

  /**
   * Lấy tất cả notifications của user hiện tại
   */
  getUserNotifications(): Observable<Notification[]> {
    return new Observable(observer => {
      this.store.select(selectCurrentUser).subscribe(user => {
        if (user && user.uid) {
          this.http.get<Notification[]>(`${this.apiUrl}/notifications/user/${user.uid}`).pipe(
            tap(notifications => {
              // Count only non-message notifications
              const unreadCount = notifications.filter(n => !n.is_read && n.type !== 'message').length;
              const messageCount = notifications.filter(n => !n.is_read && n.type === 'message').length;
              this.notificationCountSubject.next(unreadCount);
              this.messageCountSubject.next(messageCount);
            })
          ).subscribe({
            next: (notifications) => observer.next(notifications),
            error: (error) => observer.error(error)
          });
        } else {
          observer.next([]);
        }
      });
    });
  }

  /**
   * Lấy notification theo ID
   */
  getNotificationById(id: string): Observable<Notification> {
    return this.http.get<Notification>(`${this.apiUrl}/notifications/${id}`);
  }

  /**
   * Tạo notification mới
   */
  createNotification(data: CreateNotificationDto): Observable<Notification> {
    return this.http.post<Notification>(`${this.apiUrl}/notifications`, data);
  }

  /**
   * Cập nhật notification (chủ yếu để đánh dấu đã đọc)
   */
  updateNotification(id: string, data: UpdateNotificationDto): Observable<Notification> {
    return this.http.put<Notification>(`${this.apiUrl}/notifications/${id}`, data);
  }

  /**
   * Đánh dấu notification đã đọc
   */
  markAsRead(id: string): Observable<Notification> {
    return this.http.put<Notification>(`${this.apiUrl}/notifications/${id}/read`, {}).pipe(
      tap(() => {
        // Decrease count by 1 when marking as read
        const currentCount = this.notificationCountSubject.value;
        this.notificationCountSubject.next(Math.max(0, currentCount - 1));
      })
    );
  }

  /**
   * Đánh dấu tất cả notifications đã đọc
   */
  markAllAsRead(): Observable<Notification[]> {
    return this.http.put<Notification[]>(`${this.apiUrl}/notifications/mark-all-read`, {}).pipe(
      tap(() => {
        // Set count to 0 when marking all as read
        this.notificationCountSubject.next(0);
      })
    );
  }

  /**
   * Xóa notification
   */
  deleteNotification(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/notifications/${id}`);
  }

  /**
   * Xóa tất cả notifications đã đọc
   */
  deleteReadNotifications(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/notifications/delete-read`);
  }

  /**
   * Lấy notification count hiện tại
   */
  getCurrentNotificationCount(): number {
    return this.notificationCountSubject.value;
  }

  /**
   * Cập nhật notification count thủ công
   */
  updateNotificationCount(count: number): void {
    this.notificationCountSubject.next(count);
  }

  /**
   * Refresh notification count by reloading from server
   */
  refreshNotificationCount(): void {
    this.store.select(selectCurrentUser).subscribe(user => {
      if (user && user.uid) {
        this.http.get<Notification[]>(`${this.apiUrl}/notifications/user/${user.uid}`).subscribe({
          next: (notifications) => {
            // Count only non-message notifications
            const unreadCount = notifications.filter(n => !n.is_read && n.type !== 'message').length;
            const messageCount = notifications.filter(n => !n.is_read && n.type === 'message').length;
            this.notificationCountSubject.next(unreadCount);
            this.messageCountSubject.next(messageCount);
          },
          error: (err) => {
            console.error('Error refreshing notification count:', err);
          }
        });
      }
    });
  }
}
