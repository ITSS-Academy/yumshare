import { Notification } from '../../models/notification.model';
import { PaginatedResponse } from '../../models/paginated-response.model';

export interface NotificationState {
  // Notifications List
  notifications: Notification[];
  notificationsLoading: boolean;
  notificationsError: string | null;

  // Paginated Notifications
  paginatedNotifications: PaginatedResponse<Notification> | null;
  paginatedNotificationsLoading: boolean;
  paginatedNotificationsError: string | null;

  // Notification Counts
  unreadCount: number;
  messageCount: number;
  totalCount: number;
  countLoading: boolean;
  countError: string | null;

  // Individual Notification Operations
  currentNotification: Notification | null;
  currentNotificationLoading: boolean;
  currentNotificationError: string | null;

  // CRUD Operations
  operationLoading: boolean;
  operationError: string | null;

  // Real-time Updates
  lastNotification: Notification | null;
  isConnected: boolean;
  connectionError: string | null;

  // Filtering and Sorting
  filter: {
    type?: string;
    isRead?: boolean;
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  sortBy: 'created_at' | 'type' | 'is_read';
  sortOrder: 'ASC' | 'DESC';

  // Pagination
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export const initialNotificationState: NotificationState = {
  // Notifications List
  notifications: [],
  notificationsLoading: false,
  notificationsError: null,

  // Paginated Notifications
  paginatedNotifications: null,
  paginatedNotificationsLoading: false,
  paginatedNotificationsError: null,

  // Notification Counts
  unreadCount: 0,
  messageCount: 0,
  totalCount: 0,
  countLoading: false,
  countError: null,

  // Individual Notification Operations
  currentNotification: null,
  currentNotificationLoading: false,
  currentNotificationError: null,

  // CRUD Operations
  operationLoading: false,
  operationError: null,

  // Real-time Updates
  lastNotification: null,
  isConnected: false,
  connectionError: null,

  // Filtering and Sorting
  filter: {},
  sortBy: 'created_at',
  sortOrder: 'DESC',

  // Pagination
  currentPage: 1,
  pageSize: 20,
  totalPages: 0,
};
