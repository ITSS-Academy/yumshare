import { createReducer, on } from '@ngrx/store';
import { ChatState } from './chat.state';
import * as ChatActions from './chat.actions';

export const initialState: ChatState = {
  // Chat lists
  chats: null,
  isLoading: false,
  error: null,

  // Current chat
  currentChat: null,
  currentChatMessages: null,
  currentChatLoading: false,
  currentChatError: null,

  // Message operations
  isSendingMessage: false,
  sendMessageError: null,

  // Unread counts
  unreadCounts: {}
};

export const chatReducer = createReducer(
  initialState,

  // Load Chats
  on(ChatActions.loadChats, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(ChatActions.loadChatsSuccess, (state, { chats }) => ({
    ...state,
    chats,
    isLoading: false,
    error: null
  })),

  on(ChatActions.loadChatsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Create Chat
  on(ChatActions.createChat, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(ChatActions.createChatSuccess, (state, { chat }) => ({
    ...state,
    isLoading: false,
    error: null,
    currentChat: chat
  })),

  on(ChatActions.createChatFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Load Current Chat
  on(ChatActions.loadCurrentChat, (state) => ({
    ...state,
    currentChatLoading: true,
    currentChatError: null
  })),

  on(ChatActions.loadCurrentChatSuccess, (state, { chat }) => ({
    ...state,
    currentChat: chat,
    currentChatLoading: false,
    currentChatError: null
  })),

  on(ChatActions.loadCurrentChatFailure, (state, { error }) => ({
    ...state,
    currentChatLoading: false,
    currentChatError: error
  })),

  // Load Chat Messages
  on(ChatActions.loadChatMessages, (state) => ({
    ...state,
    currentChatLoading: true,
    currentChatError: null
  })),

  on(ChatActions.loadChatMessagesSuccess, (state, { messages }) => ({
    ...state,
    currentChatMessages: messages,
    currentChatLoading: false,
    currentChatError: null
  })),

  on(ChatActions.loadChatMessagesFailure, (state, { error }) => ({
    ...state,
    currentChatLoading: false,
    currentChatError: error
  })),

  // Send Message
  on(ChatActions.sendMessage, (state) => ({
    ...state,
    isSendingMessage: true,
    sendMessageError: null
  })),

  on(ChatActions.sendMessageSuccess, (state, { message }) => ({
    ...state,
    isSendingMessage: false,
    sendMessageError: null,
    currentChatMessages: state.currentChatMessages 
      ? [...state.currentChatMessages, message]
      : [message]
  })),

  on(ChatActions.sendMessageFailure, (state, { error }) => ({
    ...state,
    isSendingMessage: false,
    sendMessageError: error
  })),

  // Mark Message as Read
  on(ChatActions.markMessageAsReadSuccess, (state, { messageId }) => ({
    ...state,
    currentChatMessages: state.currentChatMessages?.map(message =>
      message.id === messageId ? { ...message, is_read: true } : message
    ) || null
  })),

  // Mark Chat as Read
  on(ChatActions.markChatAsReadSuccess, (state, { chatId }) => ({
    ...state,
    unreadCounts: {
      ...state.unreadCounts,
      [chatId]: 0
    }
  })),

  // Add Message to Current Chat (for real-time updates)
  on(ChatActions.addMessageToCurrentChat, (state, { message }) => ({
    ...state,
    currentChatMessages: state.currentChatMessages 
      ? [...state.currentChatMessages, message]
      : [message]
  })),

  // Update Unread Count
  on(ChatActions.updateUnreadCount, (state, { chatId, count }) => ({
    ...state,
    unreadCounts: {
      ...state.unreadCounts,
      [chatId]: count
    }
  })),

  // Clear Current Chat
  on(ChatActions.clearCurrentChat, (state) => ({
    ...state,
    currentChat: null,
    currentChatMessages: null,
    currentChatLoading: false,
    currentChatError: null
  })),

  // Clear Chat State
  on(ChatActions.clearChatState, () => initialState)
);
