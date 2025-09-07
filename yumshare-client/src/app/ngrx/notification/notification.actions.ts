import { createAction, props } from '@ngrx/store';
import { Notification } from '../../models/notification.model';
import { PaginatedResponse } from '../../models/paginated-response.model';

// Load User Notifications
export const loadUserNotifications = createAction(
  '[Notification] Load User Notifications',
  props<{ 
    userId: string;
    page?: number;
    size?: number;
    filter?: any;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }>()
);

export const loadUserNotificationsSuccess = createAction(
  '[Notification] Load User Notifications Success',
  props<{ notifications: PaginatedResponse<Notification> }>()
);

export const loadUserNotificationsFailure = createAction(
  '[Notification] Load User Notifications Failure',
  props<{ error: string }>()
);

// Load All User Notifications (without pagination)
export const loadAllUserNotifications = createAction(
  '[Notification] Load All User Notifications',
  props<{ userId: string }>()
);

export const loadAllUserNotificationsSuccess = createAction(
  '[Notification] Load All User Notifications Success',
  props<{ notifications: Notification[] }>()
);

export const loadAllUserNotificationsFailure = createAction(
  '[Notification] Load All User Notifications Failure',
  props<{ error: string }>()
);

// Load Notification by ID
export const loadNotificationById = createAction(
  '[Notification] Load Notification by ID',
  props<{ id: string }>()
);

export const loadNotificationByIdSuccess = createAction(
  '[Notification] Load Notification by ID Success',
  props<{ notification: Notification }>()
);

export const loadNotificationByIdFailure = createAction(
  '[Notification] Load Notification by ID Failure',
  props<{ error: string }>()
);

// Load Notification Counts
export const loadNotificationCounts = createAction(
  '[Notification] Load Notification Counts',
  props<{ userId: string }>()
);

export const loadNotificationCountsSuccess = createAction(
  '[Notification] Load Notification Counts Success',
  props<{ 
    unreadCount: number;
    messageCount: number;
    totalCount: number;
  }>()
);

export const loadNotificationCountsFailure = createAction(
  '[Notification] Load Notification Counts Failure',
  props<{ error: string }>()
);

// Create Notification
export const createNotification = createAction(
  '[Notification] Create Notification',
  props<{ 
    user_id: string;
    notification_type: string;
    content: string;
    metadata?: any;
  }>()
);

export const createNotificationSuccess = createAction(
  '[Notification] Create Notification Success',
  props<{ notification: Notification }>()
);

export const createNotificationFailure = createAction(
  '[Notification] Create Notification Failure',
  props<{ error: string }>()
);

// Update Notification
export const updateNotification = createAction(
  '[Notification] Update Notification',
  props<{ 
    id: string;
    updates: {
      is_read?: boolean;
      content?: string;
    };
  }>()
);

export const updateNotificationSuccess = createAction(
  '[Notification] Update Notification Success',
  props<{ notification: Notification }>()
);

export const updateNotificationFailure = createAction(
  '[Notification] Update Notification Failure',
  props<{ error: string }>()
);

// Mark as Read
export const markNotificationAsRead = createAction(
  '[Notification] Mark Notification as Read',
  props<{ id: string }>()
);

export const markNotificationAsReadSuccess = createAction(
  '[Notification] Mark Notification as Read Success',
  props<{ id: string }>()
);

export const markNotificationAsReadFailure = createAction(
  '[Notification] Mark Notification as Read Failure',
  props<{ error: string }>()
);

// Mark All as Read
export const markAllNotificationsAsRead = createAction(
  '[Notification] Mark All Notifications as Read',
  props<{ userId: string }>()
);

export const markAllNotificationsAsReadSuccess = createAction(
  '[Notification] Mark All Notifications as Read Success',
  props<{ userId: string }>()
);

export const markAllNotificationsAsReadFailure = createAction(
  '[Notification] Mark All Notifications as Read Failure',
  props<{ error: string }>()
);

// Delete Notification
export const deleteNotification = createAction(
  '[Notification] Delete Notification',
  props<{ id: string }>()
);

export const deleteNotificationSuccess = createAction(
  '[Notification] Delete Notification Success',
  props<{ id: string }>()
);

export const deleteNotificationFailure = createAction(
  '[Notification] Delete Notification Failure',
  props<{ error: string }>()
);

// Delete All Notifications
export const deleteAllNotifications = createAction(
  '[Notification] Delete All Notifications',
  props<{ userId: string }>()
);

export const deleteAllNotificationsSuccess = createAction(
  '[Notification] Delete All Notifications Success',
  props<{ userId: string }>()
);

export const deleteAllNotificationsFailure = createAction(
  '[Notification] Delete All Notifications Failure',
  props<{ error: string }>()
);

// Real-time Notifications
export const notificationReceived = createAction(
  '[Notification] Notification Received',
  props<{ notification: Notification }>()
);

export const notificationUpdated = createAction(
  '[Notification] Notification Updated',
  props<{ notification: Notification }>()
);

export const notificationDeleted = createAction(
  '[Notification] Notification Deleted',
  props<{ id: string }>()
);

// Connection Status
export const setConnectionStatus = createAction(
  '[Notification] Set Connection Status',
  props<{ isConnected: boolean; error?: string }>()
);

// Filter and Sort
export const setNotificationFilter = createAction(
  '[Notification] Set Filter',
  props<{ filter: any }>()
);

export const setNotificationSort = createAction(
  '[Notification] Set Sort',
  props<{ sortBy: 'created_at' | 'type' | 'is_read'; sortOrder: 'ASC' | 'DESC' }>()
);

export const setNotificationPagination = createAction(
  '[Notification] Set Pagination',
  props<{ page: number; size: number }>()
);

// Clear State
export const clearNotifications = createAction(
  '[Notification] Clear Notifications'
);

export const clearNotificationError = createAction(
  '[Notification] Clear Error'
);

// Refresh Data
export const refreshNotifications = createAction(
  '[Notification] Refresh Notifications',
  props<{ userId: string }>()
);

export const refreshNotificationCounts = createAction(
  '[Notification] Refresh Notification Counts',
  props<{ userId: string }>()
);
