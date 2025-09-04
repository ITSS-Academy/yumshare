import { User } from './user.model';
import { Chat } from './chat.model';

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: Date;
  updated_at?: Date;
}
