import { ApplicationConfig, provideZoneChangeDetection, ErrorHandler } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { GlobalErrorHandler } from './services/error-handler/global-error-handler.service';
import { httpErrorInterceptor } from './services/error-handler/http-error.interceptor';
import { authInterceptor } from './services/auth/auth.interceptor';

import { routes } from './app.routes';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { authReducer } from './ngrx/auth/auth.reducer';
import { followReducer } from './ngrx/follow/follow.reducer';
import { chatReducer } from './ngrx/chat/chat.reducer';
import * as authEffects from './ngrx/auth/auth.effects';
import * as followEffects from '../app/ngrx/follow/follow.effect';
import * as recipeEffects from './ngrx/recipe/recipe.effects';
import * as categoryEffects from './ngrx/category/category.effects';
import * as commentEffects from './ngrx/comment/comment.effects';
import * as likesEffects from './ngrx/likes/likes.effects';
import * as favoriteEffects from './ngrx/favorite/favorite.effects';
import * as notificationEffects from './ngrx/notification/notification.effects';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideClientHydration } from '@angular/platform-browser';
import { recipeReducer } from '../app/ngrx/recipe/recipe.reducer';
import { categoryReducer } from './ngrx/category/category.reducer';
import { commentReducer } from './ngrx/comment/comment.reducer';
import { favoriteReducer } from './ngrx/favorite/favorite.reducer';
import { notificationReducer } from './ngrx/notification/notification.reducer';

import { likesReducer } from './ngrx/likes/likes.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withEnabledBlockingInitialNavigation(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      })
    ),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        httpErrorInterceptor
      ])
    ),

    provideEffects([
      authEffects,
      followEffects,
      recipeEffects,
      categoryEffects,
      commentEffects,
      likesEffects,
      favoriteEffects, notificationEffects,// <-- Thêm likesEffects vào đây
    ]),

    provideStore({
      auth: authReducer,
      follow: followReducer,
      chat: chatReducer,
      recipe: recipeReducer,
      category: categoryReducer,
      comment: commentReducer,
      likes: likesReducer,
      favorite: favoriteReducer,
      notification: notificationReducer,
    }),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'recipe-cook-af395',
        appId: '1:313640689578:web:59afeb0d276035f05195d3',
        storageBucket: 'recipe-cook-af395.firebasestorage.app',
        apiKey: 'AIzaSyAKrQhd9JSMPBmUU281pf4juQGJJMJj0BU',
        authDomain: 'recipe-cook-af395.firebaseapp.com',
        messagingSenderId: '313640689578',
      })
    ),
    provideAuth(() => getAuth()),
    provideAnimationsAsync(),
    provideClientHydration(),
    // Temporarily disabled to avoid error spam
    // {
    //   provide: ErrorHandler,
    //   useClass: GlobalErrorHandler
    // },
  ],
};