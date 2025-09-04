import { User } from './user.model';

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: Date;
  
  // Relations
  follower?: User;
  following?: User;
}
