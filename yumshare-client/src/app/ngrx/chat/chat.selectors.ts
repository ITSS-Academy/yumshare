import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ChatState } from './chat.state';

// Feature selector
export const selectChatState = createFeatureSelector<ChatState>('chat');

// Basic selectors
export const selectIsLoading = createSelector(
  selectChatState,
  (state) => state.isLoading
);

export const selectError = createSelector(
  selectChatState,
  (state) => state.error
);

// Chat lists selectors
export const selectChats = createSelector(
  selectChatState,
  (state) => state.chats
);

export const selectChatsData = createSelector(
  selectChats,
  (chats) => chats?.data || []
);

export const selectChatsPagination = createSelector(
  selectChats,
  (chats) => chats ? {
    total: chats.total,
    current_page: chats.current_page,
    total_pages: chats.total_pages,
    has_next: chats.has_next,
    has_prev: chats.has_prev
  } : null
);

// Current chat selectors
export const selectCurrentChat = createSelector(
  selectChatState,
  (state) => state.currentChat
);

export const selectCurrentChatMessages = createSelector(
  selectChatState,
  (state) => state.currentChatMessages
);

export const selectCurrentChatLoading = createSelector(
  selectChatState,
  (state) => state.currentChatLoading
);

export const selectCurrentChatError = createSelector(
  selectChatState,
  (state) => state.currentChatError
);

// Message operations selectors
export const selectIsSendingMessage = createSelector(
  selectChatState,
  (state) => state.isSendingMessage
);

export const selectSendMessageError = createSelector(
  selectChatState,
  (state) => state.sendMessageError
);

// Unread counts selectors
export const selectUnreadCounts = createSelector(
  selectChatState,
  (state) => state.unreadCounts
);

export const selectUnreadCountForChat = createSelector(
  selectUnreadCounts,
  (unreadCounts, chatId: string) => unreadCounts[chatId] || 0
);

export const selectTotalUnreadCount = createSelector(
  selectUnreadCounts,
  (unreadCounts) => Object.values(unreadCounts).reduce((total, count) => total + count, 0)
);

// Combined selectors
export const selectChatData = createSelector(
  selectChatsData,
  selectCurrentChat,
  selectCurrentChatMessages,
  selectIsLoading,
  selectCurrentChatLoading,
  (chats, currentChat, currentChatMessages, isLoading, currentChatLoading) => ({
    chats,
    currentChat,
    currentChatMessages,
    isLoading,
    currentChatLoading
  })
);

// Chat with unread count
export const selectChatsWithUnreadCount = createSelector(
  selectChatsData,
  selectUnreadCounts,
  (chats, unreadCounts) => chats.map(chat => ({
    ...chat,
    unreadCount: unreadCounts[chat.id] || 0
  }))
);
