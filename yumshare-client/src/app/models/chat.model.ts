import { User } from './user.model';
import { ChatMessage } from '../models/chat-message.model';

export interface Chat {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: Date;
  updated_at: Date;
  
  // Relations
  user1?: User;
  user2?: User;
  messages?: ChatMessage[];
}
export interface CreateChatDto {
  user1_id: string;
  user2_id: string;
}

export interface CreateMessageDto {
  chat_id: string;
  sender_id: string;
  content: string;
}