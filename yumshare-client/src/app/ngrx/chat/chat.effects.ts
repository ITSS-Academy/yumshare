  // import { Injectable } from '@angular/core';
  // import { Actions, createEffect, ofType } from '@ngrx/effects';
  // import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
  // import { of } from 'rxjs';
  // import { ChatService } from '../../services/chat/chat.service';
  // import * as ChatActions from './chat.actions';

  // @Injectable()
  // export class ChatEffects {
  //   // Load Chats Effect
  //   loadChats$ = createEffect(() =>
  //     this.actions$.pipe(
  //       ofType(ChatActions.loadChats),
  //       switchMap(({ userId, page = 1, limit = 10 }) =>
  //         this.chatService.getChats(userId, page, limit).pipe(
  //           map((response) => ChatActions.loadChatsSuccess({ chats: response })),
  //           catchError((error) => of(ChatActions.loadChatsFailure({ error: error.message })))
  //         )
  //       )
  //     )
  //   );

  //   // Create Chat Effect
  //   createChat$ = createEffect(() =>
  //     this.actions$.pipe(
  //       ofType(ChatActions.createChat),
  //       switchMap(({ createChatDto }) =>
  //         this.chatService.createChat(createChatDto).pipe(
  //           map((chat) => ChatActions.createChatSuccess({ chat })),
  //           catchError((error) => of(ChatActions.createChatFailure({ error: error.message })))
  //         )
  //       )
  //     )
  //   );

  //   // Load Current Chat Effect
  //   loadCurrentChat$ = createEffect(() =>
  //     this.actions$.pipe(
  //       ofType(ChatActions.loadCurrentChat),
  //       switchMap(({ chatId }) =>
  //         this.chatService.getChat(chatId).pipe(
  //           map((chat) => ChatActions.loadCurrentChatSuccess({ chat })),
  //           catchError((error) => of(ChatActions.loadCurrentChatFailure({ error: error.message })))
  //         )
  //       )
  //     )
  //   );

  //   // Load Chat Messages Effect
  //   loadChatMessages$ = createEffect(() =>
  //     this.actions$.pipe(
  //       ofType(ChatActions.loadChatMessages),
  //       switchMap(({ chatId, page = 1, limit = 50 }) =>
  //         this.chatService.getChatMessages(chatId, page, limit).pipe(
  //           map((response) => ChatActions.loadChatMessagesSuccess({ messages: response.data || response })),
  //           catchError((error) => of(ChatActions.loadChatMessagesFailure({ error: error.message })))
  //         )
  //       )
  //     )
  //   );

  //   // Send Message Effect
  //   sendMessage$ = createEffect(() =>
  //     this.actions$.pipe(
  //       ofType(ChatActions.sendMessage),
  //       switchMap(({ createMessageDto }) =>
  //         this.chatService.sendMessage(createMessageDto).pipe(
  //           map((message) => ChatActions.sendMessageSuccess({ message })),
  //           catchError((error) => of(ChatActions.sendMessageFailure({ error: error.message })))
  //         )
  //       )
  //     )
  //   );

  //   // Mark Message as Read Effect
  //   markMessageAsRead$ = createEffect(() =>
  //     this.actions$.pipe(
  //       ofType(ChatActions.markMessageAsRead),
  //       switchMap(({ messageId }) =>
  //         this.chatService.markMessageAsRead(messageId).pipe(
  //           map(() => ChatActions.markMessageAsReadSuccess({ messageId })),
  //           catchError((error) => of(ChatActions.markMessageAsReadFailure({ error: error.message })))
  //         )
  //       )
  //     )
  //   );

  //   // Mark Chat as Read Effect
  //   markChatAsRead$ = createEffect(() =>
  //     this.actions$.pipe(
  //       ofType(ChatActions.markChatAsRead),
  //       switchMap(({ chatId }) =>
  //         this.chatService.markChatAsRead(chatId).pipe(
  //           map(() => ChatActions.markChatAsReadSuccess({ chatId })),
  //           catchError((error) => of(ChatActions.markChatAsReadFailure({ error: error.message })))
  //         )
  //       )
  //     )
  //   );

  //   // Real-time message handling effect
  //   handleNewMessage$ = createEffect(() =>
  //     this.chatService.newMessage$.pipe(
  //       map((message) => ChatActions.addMessageToCurrentChat({ message }))
  //     )
  //   );

  //   // Join chat room when loading current chat
  //   joinChatRoom$ = createEffect(() =>
  //     this.actions$.pipe(
  //       ofType(ChatActions.loadCurrentChat),
  //       tap(({ chatId }) => {
  //         // Join the chat room for real-time updates
  //         // This could be enhanced to get the current user ID from auth state
  //         console.log(`Joining chat room: ${chatId}`);
  //       })
  //     ),
  //     { dispatch: false }
  //   );

  //   // Handle send message success - send real-time message
  //   sendRealTimeMessage$ = createEffect(() =>
  //     this.actions$.pipe(
  //       ofType(ChatActions.sendMessage),
  //       tap(({ createMessageDto }) => {
  //         this.chatService.sendRealTimeMessage(createMessageDto);
  //       })
  //     ),
  //     { dispatch: false }
  //   );

  //   // Handle typing indicators
  //   handleTypingIndicator$ = createEffect(() =>
  //     this.actions$.pipe(
  //       ofType(ChatActions.loadCurrentChat),
  //       tap(({ chatId }) => {
  //         // Set up typing indicator listeners for the current chat
  //         console.log(`Setting up typing indicators for chat: ${chatId}`);
  //       })
  //     ),
  //     { dispatch: false }
  //   );

  //   constructor(
  //     private actions$: Actions,
  //     private chatService: ChatService
  //   ) {}
  // }
