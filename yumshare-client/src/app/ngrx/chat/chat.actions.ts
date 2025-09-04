import { createAction, props } from '@ngrx/store';
import { Chat } from '../../models/chat.model';
import { ChatMessage } from '../../models/chat-message.model';
import { CreateChatDto, CreateMessageDto } from '../../models/chat.model';

// Load Chats
export const loadChats = createAction(
  '[Chat] Load Chats',
  props<{ userId: string; page?: number; limit?: number }>()
);

export const loadChatsSuccess = createAction(
  '[Chat] Load Chats Success',
  props<{ chats: any }>()
);

export const loadChatsFailure = createAction(
  '[Chat] Load Chats Failure',
  props<{ error: string }>()
);

// Create Chat
export const createChat = createAction(
  '[Chat] Create Chat',
  props<{ createChatDto: CreateChatDto }>()
);

export const createChatSuccess = createAction(
  '[Chat] Create Chat Success',
  props<{ chat: Chat }>()
);

export const createChatFailure = createAction(
  '[Chat] Create Chat Failure',
  props<{ error: string }>()
);

// Load Current Chat
export const loadCurrentChat = createAction(
  '[Chat] Load Current Chat',
  props<{ chatId: string }>()
);

export const loadCurrentChatSuccess = createAction(
  '[Chat] Load Current Chat Success',
  props<{ chat: Chat }>()
);

export const loadCurrentChatFailure = createAction(
  '[Chat] Load Current Chat Failure',
  props<{ error: string }>()
);

// Load Chat Messages
export const loadChatMessages = createAction(
  '[Chat] Load Chat Messages',
  props<{ chatId: string; page?: number; limit?: number }>()
);

export const loadChatMessagesSuccess = createAction(
  '[Chat] Load Chat Messages Success',
  props<{ messages: ChatMessage[] }>()
);

export const loadChatMessagesFailure = createAction(
  '[Chat] Load Chat Messages Failure',
  props<{ error: string }>()
);

// Send Message
export const sendMessage = createAction(
  '[Chat] Send Message',
  props<{ createMessageDto: CreateMessageDto }>()
);

export const sendMessageSuccess = createAction(
  '[Chat] Send Message Success',
  props<{ message: ChatMessage }>()
);

export const sendMessageFailure = createAction(
  '[Chat] Send Message Failure',
  props<{ error: string }>()
);

// Mark Message as Read
export const markMessageAsRead = createAction(
  '[Chat] Mark Message as Read',
  props<{ messageId: string }>()
);

export const markMessageAsReadSuccess = createAction(
  '[Chat] Mark Message as Read Success',
  props<{ messageId: string }>()
);

export const markMessageAsReadFailure = createAction(
  '[Chat] Mark Message as Read Failure',
  props<{ error: string }>()
);

// Mark Chat as Read
export const markChatAsRead = createAction(
  '[Chat] Mark Chat as Read',
  props<{ chatId: string }>()
);

export const markChatAsReadSuccess = createAction(
  '[Chat] Mark Chat as Read Success',
  props<{ chatId: string }>()
);

export const markChatAsReadFailure = createAction(
  '[Chat] Mark Chat as Read Failure',
  props<{ error: string }>()
);

// Add Message to Current Chat (for real-time updates)
export const addMessageToCurrentChat = createAction(
  '[Chat] Add Message to Current Chat',
  props<{ message: ChatMessage }>()
);

// Update Unread Count
export const updateUnreadCount = createAction(
  '[Chat] Update Unread Count',
  props<{ chatId: string; count: number }>()
);

// Clear Current Chat
export const clearCurrentChat = createAction('[Chat] Clear Current Chat');

// Clear Chat State
export const clearChatState = createAction('[Chat] Clear Chat State');
