import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, tap, withLatestFrom, filter } from 'rxjs/operators';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { NotificationService } from '../../services/notification/notification.service';
import { SocketService } from '../../services/socket/socket.service';
import * as NotificationActions from './notification.actions';
import * as NotificationSelectors from './notification.selectors';
import { AuthState } from '../auth/auth.state';
import * as AuthSelectors from '../auth/auth.selectors';

// Load User Notifications Effect
export const loadUserNotificationsEffect = createEffect(
  (actions$ = inject(Actions), notificationService = inject(NotificationService)) => {
    return actions$.pipe(
      ofType(NotificationActions.loadUserNotifications),
      switchMap(({ userId, page = 1, size = 20, filter = {}, sortBy = 'created_at', sortOrder = 'DESC' }) =>
        notificationService.getUserNotificationsPaginated(userId, page, size, filter, sortBy, sortOrder).pipe(
          map((notifications) => NotificationActions.loadUserNotificationsSuccess({ notifications })),
          catchError((error) => of(NotificationActions.loadUserNotificationsFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Load All User Notifications Effect
export const loadAllUserNotificationsEffect = createEffect(
  (actions$ = inject(Actions), notificationService = inject(NotificationService)) => {
    return actions$.pipe(
      ofType(NotificationActions.loadAllUserNotifications),
      switchMap(({ userId }) =>
        notificationService.getUserNotifications().pipe(
          map((notifications) => NotificationActions.loadAllUserNotificationsSuccess({ notifications })),
          catchError((error) => of(NotificationActions.loadAllUserNotificationsFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Load Notification by ID Effect
export const loadNotificationByIdEffect = createEffect(
  (actions$ = inject(Actions), notificationService = inject(NotificationService)) => {
    return actions$.pipe(
      ofType(NotificationActions.loadNotificationById),
      switchMap(({ id }) =>
        notificationService.getNotificationById(id).pipe(
          map((notification) => NotificationActions.loadNotificationByIdSuccess({ notification })),
          catchError((error) => of(NotificationActions.loadNotificationByIdFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Load Notification Counts Effect
export const loadNotificationCountsEffect = createEffect(
  (actions$ = inject(Actions), notificationService = inject(NotificationService)) => {
    return actions$.pipe(
      ofType(NotificationActions.loadNotificationCounts),
      switchMap(({ userId }) =>
        notificationService.getNotificationCounts(userId).pipe(
          map((counts) => NotificationActions.loadNotificationCountsSuccess({
            unreadCount: counts.unreadCount,
            messageCount: counts.messageCount,
            totalCount: counts.totalCount
          })),
          catchError((error) => of(NotificationActions.loadNotificationCountsFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Create Notification Effect
export const createNotificationEffect = createEffect(
  (actions$ = inject(Actions), notificationService = inject(NotificationService)) => {
    return actions$.pipe(
      ofType(NotificationActions.createNotification),
      switchMap(({ user_id, type, content, metadata }) =>
        notificationService.createNotification({ user_id, type, content, metadata }).pipe(
          map((notification) => NotificationActions.createNotificationSuccess({ notification })),
          catchError((error) => of(NotificationActions.createNotificationFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Update Notification Effect
export const updateNotificationEffect = createEffect(
  (actions$ = inject(Actions), notificationService = inject(NotificationService)) => {
    return actions$.pipe(
      ofType(NotificationActions.updateNotification),
      switchMap(({ id, updates }) =>
        notificationService.updateNotification(id, updates).pipe(
          map((notification) => NotificationActions.updateNotificationSuccess({ notification })),
          catchError((error) => of(NotificationActions.updateNotificationFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Mark Notification as Read Effect
export const markNotificationAsReadEffect = createEffect(
  (actions$ = inject(Actions), notificationService = inject(NotificationService)) => {
    return actions$.pipe(
      ofType(NotificationActions.markNotificationAsRead),
      switchMap(({ id }) =>
        notificationService.markAsRead(id).pipe(
          map(() => NotificationActions.markNotificationAsReadSuccess({ id })),
          catchError((error) => of(NotificationActions.markNotificationAsReadFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Mark All Notifications as Read Effect
export const markAllNotificationsAsReadEffect = createEffect(
  (actions$ = inject(Actions), notificationService = inject(NotificationService)) => {
    return actions$.pipe(
      ofType(NotificationActions.markAllNotificationsAsRead),
      switchMap(({ userId }) =>
        notificationService.markAllAsRead(userId).pipe(
          map(() => NotificationActions.markAllNotificationsAsReadSuccess({ userId })),
          catchError((error) => of(NotificationActions.markAllNotificationsAsReadFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Delete Notification Effect
export const deleteNotificationEffect = createEffect(
  (actions$ = inject(Actions), notificationService = inject(NotificationService)) => {
    return actions$.pipe(
      ofType(NotificationActions.deleteNotification),
      switchMap(({ id }) =>
        notificationService.deleteNotification(id).pipe(
          map(() => NotificationActions.deleteNotificationSuccess({ id })),
          catchError((error) => of(NotificationActions.deleteNotificationFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Delete All Notifications Effect
export const deleteAllNotificationsEffect = createEffect(
  (actions$ = inject(Actions), notificationService = inject(NotificationService)) => {
    return actions$.pipe(
      ofType(NotificationActions.deleteAllNotifications),
      switchMap(({ userId }) =>
        notificationService.deleteAllNotifications(userId).pipe(
          map(() => NotificationActions.deleteAllNotificationsSuccess({ userId })),
          catchError((error) => of(NotificationActions.deleteAllNotificationsFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Real-time Notification Effects
export const realTimeNotificationEffect = createEffect(
  (actions$ = inject(Actions), socketService = inject(SocketService), store = inject(Store)) => {
    return actions$.pipe(
      ofType(NotificationActions.loadUserNotificationsSuccess),
      tap(() => {
        // Listen for real-time notifications
        socketService.notification$.subscribe(notification => {
          if (notification) {
            store.dispatch(NotificationActions.notificationReceived({ notification }));
          }
        });
      })
    );
  },
  { functional: true, dispatch: false }
);

// Auto-load notifications when user logs in
export const autoLoadNotificationsEffect = createEffect(
  (actions$ = inject(Actions), store = inject(Store)) => {
    return actions$.pipe(
      ofType('[Auth] Login Success', '[Auth] Load User Success'),
      withLatestFrom(store.select(AuthSelectors.selectUserId)),
      filter(([action, userId]) => !!userId),
      switchMap(([action, userId]) => [
        NotificationActions.loadUserNotifications({ userId: userId! }),
        NotificationActions.loadNotificationCounts({ userId: userId! })
      ])
    );
  },
  { functional: true }
);

// Clear notifications when user logs out
export const clearNotificationsOnLogoutEffect = createEffect(
  (actions$ = inject(Actions), store = inject(Store)) => {
    return actions$.pipe(
      ofType('[Auth] Logout Success'),
      map(() => NotificationActions.clearNotifications())
    );
  },
  { functional: true }
);

// Refresh notifications when filter/sort changes
export const refreshNotificationsOnFilterChangeEffect = createEffect(
  (actions$ = inject(Actions), store = inject(Store)) => {
    return actions$.pipe(
      ofType(
        NotificationActions.setNotificationFilter,
        NotificationActions.setNotificationSort,
        NotificationActions.setNotificationPagination
      ),
      withLatestFrom(store.select(AuthSelectors.selectUserId)),
      filter(([action, userId]) => !!userId),
      switchMap(([action, userId]) => 
        of(NotificationActions.loadUserNotifications({ userId: userId! }))
      )
    );
  },
  { functional: true }
);

// Update counts after operations
export const updateCountsAfterOperationEffect = createEffect(
  (actions$ = inject(Actions), store = inject(Store)) => {
    return actions$.pipe(
      ofType(
        NotificationActions.markNotificationAsReadSuccess,
        NotificationActions.markAllNotificationsAsReadSuccess,
        NotificationActions.deleteNotificationSuccess,
        NotificationActions.deleteAllNotificationsSuccess,
        NotificationActions.notificationReceived
      ),
      withLatestFrom(store.select(AuthSelectors.selectUserId)),
      filter(([action, userId]) => !!userId),
      map(([action, userId]) => 
        NotificationActions.loadNotificationCounts({ userId: userId! })
      )
    );
  },
  { functional: true }
);

// Connection status effect
export const connectionStatusEffect = createEffect(
  (actions$ = inject(Actions), socketService = inject(SocketService)) => {
    return actions$.pipe(
      ofType(NotificationActions.loadUserNotificationsSuccess),
      tap(() => {
        // Monitor socket connection status
        socketService.connectionStatus$.subscribe(isConnected => {
          if (isConnected) {
            // Store.dispatch(NotificationActions.setConnectionStatus({ isConnected: true }));
          } else {
            // Store.dispatch(NotificationActions.setConnectionStatus({ 
            //   isConnected: false, 
            //   error: 'Socket disconnected'
            // }));
          }
        });
      })
    );
  },
  { functional: true, dispatch: false }
);
