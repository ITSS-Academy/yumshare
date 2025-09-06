import { NotificationType } from '../enums/notification-type.enum';

export class CreateNotificationDto {
  user_id: string;
  type: NotificationType;
  content: string;
  metadata?: any;
  is_read?: boolean;
} 