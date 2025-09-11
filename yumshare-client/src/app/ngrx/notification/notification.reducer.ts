import { createReducer, on } from '@ngrx/store';
import { NotificationState, initialNotificationState } from './notification.state';
import * as NotificationActions from './notification.actions';

export const notificationReducer = createReducer(
  initialNotificationState,

  // Load User Notifications
  on(NotificationActions.loadUserNotifications, (state, { userId }) => ({
    ...state,
    paginatedNotificationsLoading: true,
    paginatedNotificationsError: null,
  })),

  on(NotificationActions.loadUserNotificationsSuccess, (state, { notifications }) => ({
    ...state,
    paginatedNotifications: notifications,
    notifications: notifications.data,
    totalPages: notifications.total_pages || Math.ceil(notifications.total / state.pageSize),
    paginatedNotificationsLoading: false,
    paginatedNotificationsError: null,
  })),

  on(NotificationActions.loadUserNotificationsFailure, (state, { error }) => ({
    ...state,
    paginatedNotificationsLoading: false,
    paginatedNotificationsError: error,
  })),

  // Load All User Notifications
  on(NotificationActions.loadAllUserNotifications, (state) => ({
    ...state,
    notificationsLoading: true,
    notificationsError: null,
  })),

  on(NotificationActions.loadAllUserNotificationsSuccess, (state, { notifications }) => ({
    ...state,
    notifications,
    notificationsLoading: false,
    notificationsError: null,
  })),

  on(NotificationActions.loadAllUserNotificationsFailure, (state, { error }) => ({
    ...state,
    notificationsLoading: false,
    notificationsError: error,
  })),

  // Load Notification by ID
  on(NotificationActions.loadNotificationById, (state) => ({
    ...state,
    currentNotificationLoading: true,
    currentNotificationError: null,
  })),

  on(NotificationActions.loadNotificationByIdSuccess, (state, { notification }) => ({
    ...state,
    currentNotification: notification,
    currentNotificationLoading: false,
    currentNotificationError: null,
  })),

  on(NotificationActions.loadNotificationByIdFailure, (state, { error }) => ({
    ...state,
    currentNotificationLoading: false,
    currentNotificationError: error,
  })),

  // Load Notification Counts
  on(NotificationActions.loadNotificationCounts, (state) => ({
    ...state,
    countLoading: true,
    countError: null,
  })),

  on(NotificationActions.loadNotificationCountsSuccess, (state, { unreadCount, messageCount, totalCount }) => ({
    ...state,
    unreadCount,
    messageCount,
    totalCount,
    countLoading: false,
    countError: null,
  })),

  on(NotificationActions.loadNotificationCountsFailure, (state, { error }) => ({
    ...state,
    countLoading: false,
    countError: error,
  })),

  // Create Notification
  on(NotificationActions.createNotification, (state) => ({
    ...state,
    operationLoading: true,
    operationError: null,
  })),

  on(NotificationActions.createNotificationSuccess, (state, { notification }) => ({
    ...state,
    notifications: [notification, ...state.notifications],
    totalCount: state.totalCount + 1,
    operationLoading: false,
    operationError: null,
  })),

  on(NotificationActions.createNotificationFailure, (state, { error }) => ({
    ...state,
    operationLoading: false,
    operationError: error,
  })),

  // Update Notification
  on(NotificationActions.updateNotification, (state) => ({
    ...state,
    operationLoading: true,
    operationError: null,
  })),

  on(NotificationActions.updateNotificationSuccess, (state, { notification }) => ({
    ...state,
    notifications: state.notifications.map(n => 
      n.id === notification.id ? notification : n
    ),
    currentNotification: state.currentNotification?.id === notification.id 
      ? notification 
      : state.currentNotification,
    operationLoading: false,
    operationError: null,
  })),

  on(NotificationActions.updateNotificationFailure, (state, { error }) => ({
    ...state,
    operationLoading: false,
    operationError: error,
  })),

  // Mark as Read
  on(NotificationActions.markNotificationAsRead, (state) => ({
    ...state,
    operationLoading: true,
    operationError: null,
  })),

  on(NotificationActions.markNotificationAsReadSuccess, (state, { id }) => ({
    ...state,
    notifications: state.notifications.map(n => 
      n.id === id ? { ...n, is_read: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1),
    operationLoading: false,
    operationError: null,
  })),

  on(NotificationActions.markNotificationAsReadFailure, (state, { error }) => ({
    ...state,
    operationLoading: false,
    operationError: error,
  })),

  // Mark All as Read
  on(NotificationActions.markAllNotificationsAsRead, (state) => ({
    ...state,
    operationLoading: true,
    operationError: null,
  })),

  on(NotificationActions.markAllNotificationsAsReadSuccess, (state) => ({
    ...state,
    notifications: state.notifications.map(n => ({ ...n, is_read: true })),
    unreadCount: 0,
    operationLoading: false,
    operationError: null,
  })),

  on(NotificationActions.markAllNotificationsAsReadFailure, (state, { error }) => ({
    ...state,
    operationLoading: false,
    operationError: error,
  })),

  // Delete Notification
  on(NotificationActions.deleteNotification, (state) => ({
    ...state,
    operationLoading: true,
    operationError: null,
  })),

  on(NotificationActions.deleteNotificationSuccess, (state, { id }) => ({
    ...state,
    notifications: state.notifications.filter(n => n.id !== id),
    totalCount: Math.max(0, state.totalCount - 1),
    operationLoading: false,
    operationError: null,
  })),

  on(NotificationActions.deleteNotificationFailure, (state, { error }) => ({
    ...state,
    operationLoading: false,
    operationError: error,
  })),

  // Delete All Notifications
  on(NotificationActions.deleteAllNotifications, (state) => ({
    ...state,
    operationLoading: true,
    operationError: null,
  })),

  on(NotificationActions.deleteAllNotificationsSuccess, (state) => ({
    ...state,
    notifications: [],
    unreadCount: 0,
    messageCount: 0,
    totalCount: 0,
    operationLoading: false,
    operationError: null,
  })),

  on(NotificationActions.deleteAllNotificationsFailure, (state, { error }) => ({
    ...state,
    operationLoading: false,
    operationError: error,
  })),

  // Real-time Notifications
  on(NotificationActions.notificationReceived, (state, { notification }) => ({
    ...state,
    notifications: [notification, ...state.notifications],
    lastNotification: notification,
    totalCount: state.totalCount + 1,
    unreadCount: notification.is_read ? state.unreadCount : state.unreadCount + 1,
    messageCount: notification.type === 'message' && !notification.is_read 
      ? state.messageCount + 1 
      : state.messageCount,
  })),

  on(NotificationActions.notificationUpdated, (state, { notification }) => ({
    ...state,
    notifications: state.notifications.map(n => 
      n.id === notification.id ? notification : n
    ),
    lastNotification: notification,
  })),

  on(NotificationActions.notificationDeleted, (state, { id }) => ({
    ...state,
    notifications: state.notifications.filter(n => n.id !== id),
    totalCount: Math.max(0, state.totalCount - 1),
  })),

  // Connection Status
  on(NotificationActions.setConnectionStatus, (state, { isConnected, error }) => ({
    ...state,
    isConnected,
    connectionError: error || null,
  })),

  // Filter and Sort
  on(NotificationActions.setNotificationFilter, (state, { filter }) => ({
    ...state,
    filter: { ...state.filter, ...filter },
    currentPage: 1, // Reset to first page when filtering
  })),

  on(NotificationActions.setNotificationSort, (state, { sortBy, sortOrder }) => ({
    ...state,
    sortBy,
    sortOrder,
    currentPage: 1, // Reset to first page when sorting
  })),

  on(NotificationActions.setNotificationPagination, (state, { page, size }) => ({
    ...state,
    currentPage: page,
    pageSize: size,
  })),

  // Clear State
  on(NotificationActions.clearNotifications, (state) => ({
    ...state,
    notifications: [],
    paginatedNotifications: null,
    currentNotification: null,
    lastNotification: null,
  })),

  on(NotificationActions.clearNotificationError, (state) => ({
    ...state,
    notificationsError: null,
    paginatedNotificationsError: null,
    currentNotificationError: null,
    operationError: null,
    countError: null,
    connectionError: null,
  })),

  // Refresh Data
  on(NotificationActions.refreshNotifications, (state) => ({
    ...state,
    notificationsLoading: true,
    notificationsError: null,
  })),

  on(NotificationActions.refreshNotificationCounts, (state) => ({
    ...state,
    countLoading: true,
    countError: null,
  })),
);
