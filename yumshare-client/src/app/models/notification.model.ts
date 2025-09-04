import { User } from './user.model';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  content: string;
  is_read: boolean;
  created_at: Date;
  
  // Relations
  user?: User;
}
