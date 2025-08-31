import { Chat } from '../../models/chat.model';
import { ChatMessage } from '../../models/chat-message.model';
import { PaginatedResponse } from '../../models/paginated-response.model';

export interface ChatState {
  // Chat lists
  chats: PaginatedResponse<Chat> | null;
  isLoading: boolean;
  error: string | null;

  // Current chat
  currentChat: Chat | null;
  currentChatMessages: ChatMessage[] | null;
  currentChatLoading: boolean;
  currentChatError: string | null;

  // Message operations
  isSendingMessage: boolean;
  sendMessageError: string | null;

  // Unread counts
  unreadCounts: { [chatId: string]: number };
}
