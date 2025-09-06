import { User } from './user.model';

export enum NotificationType {
  LIKE = 'like',
  COMMENT = 'comment',
  FOLLOW = 'follow',
  RECIPE_APPROVED = 'recipe_approved',
  RECIPE_REJECTED = 'recipe_rejected',
  SYSTEM = 'system',
  RECIPE_SHARED = 'recipe_shared',
  NEW_RECIPE = 'new_recipe',
  MESSAGE = 'message'
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  content: string;
  is_read: boolean;
  created_at: Date;
  
  // Relations
  user?: User;
  
  // Additional metadata
  metadata?: {
    recipe_id?: string;
    comment_id?: string;
    follower_id?: string;
    [key: string]: any;
  };
}