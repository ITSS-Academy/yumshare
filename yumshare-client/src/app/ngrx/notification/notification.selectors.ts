import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NotificationState } from './notification.state';
import { Notification, NotificationType } from '../../models/notification.model';

export const selectNotificationState = createFeatureSelector<NotificationState>('notification');

// Basic Selectors
export const selectNotifications = createSelector(
  selectNotificationState,
  (state: NotificationState) => state.notifications
);

export const selectPaginatedNotifications = createSelector(
  selectNotificationState,
  (state: NotificationState) => state.paginatedNotifications
);

export const selectCurrentNotification = createSelector(
  selectNotificationState,
  (state: NotificationState) => state.currentNotification
);

// Loading Selectors
export const selectNotificationsLoading = createSelector(
  selectNotificationState,
  (state: NotificationState) => state.notificationsLoading
);

export const selectPaginatedNotificationsLoading = createSelector(
  selectNotificationState,
  (state: NotificationState) => state.paginatedNotificationsLoading
);

export const selectCurrentNotificationLoading = createSelector(
  selectNotificationState,
  (state: NotificationState) => state.currentNotificationLoading
);

export const selectOperationLoading = createSelector(
  selectNotificationState,
  (state: NotificationState) => state.operationLoading
);

export const selectCountLoading = createSelector(
  selectNotificationState,
  (state: NotificationState) => state.countLoading
);

// Error Selectors
export const selectNotificationsError = createSelector(
  selectNotificationState,
  (state: NotificationState) => state.notificationsError
);

export const selectPaginatedNotificationsError = createSelector(
  selectNotificationState,
  (state: NotificationState) => state.paginatedNotificationsError
);

export const selectCurrentNotificationError = createSelector(
  selectNotificationState,
  (state: NotificationState) => state.currentNotificationError
);

export const selectOperationError = createSelector(
  selectNotificationState,
  (state: NotificationState) => state.operationError
);

export const selectCountError = createSelector(
  selectNotificationState,
  (state: NotificationState) => state.countError
);

export const selectConnectionError = createSelector(
  selectNotificationState,
  (state: NotificationState) => state.connectionError
);

// Count Selectors
export const selectUnreadCount = createSelector(
  selectNotificationState,
  (state: NotificationState) => state.unreadCount
);

export const selectMessageCount = createSelector(
  selectNotificationState,
  (state: NotificationState) => state.messageCount
);

export const selectTotalCount = createSelector(
  selectNotificationState,
  (state: NotificationState) => state.totalCount
);

// Connection Selectors
export const selectIsConnected = createSelector(
  selectNotificationState,
  (state: NotificationState) => state.isConnected
);

export const selectLastNotification = createSelector(
  selectNotificationState,
  (state: NotificationState) => state.lastNotification
);

// Filter and Sort Selectors
export const selectNotificationFilter = createSelector(
  selectNotificationState,
  (state: NotificationState) => state.filter
);

export const selectNotificationSort = createSelector(
  selectNotificationState,
  (state: NotificationState) => ({
    sortBy: state.sortBy,
    sortOrder: state.sortOrder
  })
);

export const selectNotificationPagination = createSelector(
  selectNotificationState,
  (state: NotificationState) => ({
    currentPage: state.currentPage,
    pageSize: state.pageSize,
    totalPages: state.totalPages
  })
);

// Computed Selectors
export const selectUnreadNotifications = createSelector(
  selectNotifications,
  (notifications: Notification[]) => notifications?.filter(n => !n.is_read) || []
);

export const selectReadNotifications = createSelector(
  selectNotifications,
  (notifications: Notification[]) => notifications?.filter(n => n.is_read) || []
);

export const selectMessageNotifications = createSelector(
  selectNotifications,
  (notifications: Notification[]) => notifications?.filter(n => n.type === NotificationType.MESSAGE) || []
);

export const selectNonMessageNotifications = createSelector(
  selectNotifications,
  (notifications: Notification[]) => notifications?.filter(n => n.type !== NotificationType.MESSAGE) || []
);

export const selectUnreadMessageCount = createSelector(
  selectMessageNotifications,
  (messageNotifications: Notification[]) => messageNotifications?.filter(n => !n.is_read).length || 0
);

export const selectUnreadNonMessageCount = createSelector(
  selectNonMessageNotifications,
  (nonMessageNotifications: Notification[]) => nonMessageNotifications?.filter(n => !n.is_read).length || 0
);

// Filtered Notifications
export const selectFilteredNotifications = createSelector(
  selectNotifications,
  selectNotificationFilter,
  (notifications: Notification[], filter) => {
    let filtered = [...notifications];

    // Filter by type
    if (filter.type) {
      filtered = filtered.filter(n => n.type === filter.type);
    }

    // Filter by read status
    if (filter.isRead !== undefined) {
      filtered = filtered.filter(n => n.is_read === filter.isRead);
    }

    // Filter by date range
    if (filter.dateRange) {
      const { start, end } = filter.dateRange;
      filtered = filtered.filter(n => {
        const notificationDate = new Date(n.created_at);
        return notificationDate >= start && notificationDate <= end;
      });
    }

    return filtered;
  }
);

// Sorted Notifications
export const selectSortedNotifications = createSelector(
  selectFilteredNotifications,
  selectNotificationSort,
  (notifications: Notification[], sort) => {
    return [...notifications].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sort.sortBy) {
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'is_read':
          aValue = a.is_read ? 1 : 0;
          bValue = b.is_read ? 1 : 0;
          break;
        default:
          aValue = a[sort.sortBy as keyof Notification];
          bValue = b[sort.sortBy as keyof Notification];
      }

      if (sort.sortOrder === 'ASC') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }
);

// Paginated Notifications
export const selectPaginatedNotificationsData = createSelector(
  selectSortedNotifications,
  selectNotificationPagination,
  (notifications: Notification[], pagination) => {
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return notifications.slice(startIndex, endIndex);
  }
);

// Notification by Type
export const selectNotificationsByType = createSelector(
  selectNotifications,
  (notifications: Notification[]) => {
    return notifications.reduce((acc, notification) => {
      if (!acc[notification.type]) {
        acc[notification.type] = [];
      }
      acc[notification.type].push(notification);
      return acc;
    }, {} as Record<string, Notification[]>);
  }
);

// Recent Notifications (last 24 hours)
export const selectRecentNotifications = createSelector(
  selectNotifications,
  (notifications: Notification[]) => {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    return notifications.filter(n => 
      new Date(n.created_at) > oneDayAgo
    );
  }
);

// Has Notifications
export const selectHasNotifications = createSelector(
  selectNotifications,
  (notifications: Notification[]) => notifications.length > 0
);

export const selectHasUnreadNotifications = createSelector(
  selectUnreadCount,
  (unreadCount: number) => unreadCount > 0
);

// Loading States
export const selectIsAnyLoading = createSelector(
  selectNotificationsLoading,
  selectPaginatedNotificationsLoading,
  selectCurrentNotificationLoading,
  selectOperationLoading,
  selectCountLoading,
  (notificationsLoading, paginatedLoading, currentLoading, operationLoading, countLoading) => 
    notificationsLoading || paginatedLoading || currentLoading || operationLoading || countLoading
);

// Error States
export const selectHasAnyError = createSelector(
  selectNotificationsError,
  selectPaginatedNotificationsError,
  selectCurrentNotificationError,
  selectOperationError,
  selectCountError,
  selectConnectionError,
  (notificationsError, paginatedError, currentError, operationError, countError, connectionError) => 
    !!(notificationsError || paginatedError || currentError || operationError || countError || connectionError)
);
