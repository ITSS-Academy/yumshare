import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import * as FavoriteActions from './favorite.actions';
import { FavoriteService } from '../../services/favorite/favorite.service';
import { Store } from '@ngrx/store';
import { selectCurrentUserId } from './index';

// Load User Favorites Effect
export const loadUserFavorites = createEffect(
  (actions$ = inject(Actions), favoriteService = inject(FavoriteService)) => {
    return actions$.pipe(
      ofType(FavoriteActions.loadUserFavorites),
      switchMap(({ userId, queryOptions }) =>
        favoriteService.getUserFavorites(userId, queryOptions).pipe(
          map((response) => FavoriteActions.loadUserFavoritesSuccess({ response })),
          catchError((error) => of(FavoriteActions.loadUserFavoritesFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Load All User Favorites Effect
export const loadAllUserFavorites = createEffect(
  (actions$ = inject(Actions), favoriteService = inject(FavoriteService)) => {
    return actions$.pipe(
      ofType(FavoriteActions.loadAllUserFavorites),
      switchMap(({ userId }) =>
        favoriteService.getAllUserFavorites(userId).pipe(
          map((favorites) => FavoriteActions.loadAllUserFavoritesSuccess({ favorites })),
          catchError((error) => of(FavoriteActions.loadAllUserFavoritesFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Add to Favorites Effect
export const addToFavorites = createEffect(
  (actions$ = inject(Actions), favoriteService = inject(FavoriteService)) => {
    return actions$.pipe(
      ofType(FavoriteActions.addToFavorites),
      switchMap(({ userId, recipeId }) =>
        favoriteService.addToFavorites({ user_id: userId, recipe_id: recipeId }).pipe(
          map((favorite) => FavoriteActions.addToFavoritesSuccess({ favorite })),
          catchError((error) => of(FavoriteActions.addToFavoritesFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Remove from Favorites Effect
export const removeFromFavorites = createEffect(
  (actions$ = inject(Actions), favoriteService = inject(FavoriteService)) => {
    return actions$.pipe(
      ofType(FavoriteActions.removeFromFavorites),
      switchMap(({ userId, recipeId }) =>
        favoriteService.removeFromFavorites(userId, recipeId).pipe(
          map(() => FavoriteActions.removeFromFavoritesSuccess({ userId, recipeId })),
          catchError((error) => of(FavoriteActions.removeFromFavoritesFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Toggle Favorite Effect
export const toggleFavorite = createEffect(
  (actions$ = inject(Actions), favoriteService = inject(FavoriteService)) => {
    return actions$.pipe(
      ofType(FavoriteActions.toggleFavorite),
      switchMap(({ userId, recipeId }) =>
        favoriteService.toggleFavorite(userId, recipeId).pipe(
          map((isAdded) => FavoriteActions.toggleFavoriteSuccess({ userId, recipeId, isAdded })),
          catchError((error) => of(FavoriteActions.toggleFavoriteFailure({ error: error.message, recipeId })))
        )
      )
    );
  },
  { functional: true }
);

// Check Favorite Status Effect
export const checkFavoriteStatus = createEffect(
  (actions$ = inject(Actions), favoriteService = inject(FavoriteService)) => {
    return actions$.pipe(
      ofType(FavoriteActions.checkFavoriteStatus),
      switchMap(({ userId, recipeId }) =>
        favoriteService.isInFavorites(userId, recipeId).pipe(
          map((isFavorite) => FavoriteActions.checkFavoriteStatusSuccess({ recipeId, isFavorite })),
          catchError((error) => of(FavoriteActions.checkFavoriteStatusFailure({ error: error.message, recipeId })))
        )
      )
    );
  },
  { functional: true }
);

// Load Favorite Count Effect
export const loadFavoriteCount = createEffect(
  (actions$ = inject(Actions), favoriteService = inject(FavoriteService)) => {
    return actions$.pipe(
      ofType(FavoriteActions.loadFavoriteCount),
      switchMap(({ userId }) =>
        favoriteService.getFavoriteCount(userId).pipe(
          map((count) => FavoriteActions.loadFavoriteCountSuccess({ count })),
          catchError((error) => of(FavoriteActions.loadFavoriteCountFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Check Has Favorites Effect
export const checkHasFavorites = createEffect(
  (actions$ = inject(Actions), favoriteService = inject(FavoriteService)) => {
    return actions$.pipe(
      ofType(FavoriteActions.checkHasFavorites),
      switchMap(({ userId }) =>
        favoriteService.hasFavorites(userId).pipe(
          map((hasFavorites) => FavoriteActions.checkHasFavoritesSuccess({ hasFavorites })),
          catchError((error) => of(FavoriteActions.checkHasFavoritesFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Get User Favorite Recipe IDs Effect
export const getUserFavoriteRecipeIds = createEffect(
  (actions$ = inject(Actions), favoriteService = inject(FavoriteService)) => {
    return actions$.pipe(
      ofType(FavoriteActions.getUserFavoriteRecipeIds),
      switchMap(({ userId }) =>
        favoriteService.getUserFavoriteRecipeIds(userId).pipe(
          map((recipeIds) => FavoriteActions.getUserFavoriteRecipeIdsSuccess({ recipeIds })),
          catchError((error) => of(FavoriteActions.getUserFavoriteRecipeIdsFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Auto-refresh favorite count after add/remove operations
export const refreshFavoriteCountAfterOperation = createEffect(
  (actions$ = inject(Actions), store = inject(Store)) => {
    return actions$.pipe(
      ofType(
        FavoriteActions.addToFavoritesSuccess,
        FavoriteActions.removeFromFavoritesSuccess
      ),
      withLatestFrom(store.select(selectCurrentUserId)),
      switchMap(([action, userId]) => {
        if (userId) {
          return of(FavoriteActions.loadFavoriteCount({ userId }));
        }
        return of();
      })
    );
  },
  { functional: true }
);

// Logging effects for debugging
export const logFavoriteActions = createEffect(
  (actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(
        FavoriteActions.loadUserFavorites,
        FavoriteActions.addToFavorites,
        FavoriteActions.removeFromFavorites,
        FavoriteActions.toggleFavorite,
        FavoriteActions.checkFavoriteStatus,
        FavoriteActions.loadFavoriteCount
      ),
      tap((action) => {
        console.log(`Favorite Action: ${action.type}`, action);
      })
    );
  },
  { functional: true, dispatch: false }
);

// Success logging effects
export const logFavoriteSuccess = createEffect(
  (actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(
        FavoriteActions.addToFavoritesSuccess,
        FavoriteActions.removeFromFavoritesSuccess,
        FavoriteActions.toggleFavoriteSuccess
      ),
      tap((action) => {
        console.log(`Favorite Success: ${action.type}`, action);
      })
    );
  },
  { functional: true, dispatch: false }
);

// Error logging effects
export const logFavoriteErrors = createEffect(
  (actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(
        FavoriteActions.addToFavoritesFailure,
        FavoriteActions.removeFromFavoritesFailure,
        FavoriteActions.toggleFavoriteFailure,
        FavoriteActions.loadUserFavoritesFailure,
        FavoriteActions.checkFavoriteStatusFailure,
        FavoriteActions.loadFavoriteCountFailure
      ),
      tap((action) => {
        console.error(`Favorite Error: ${action.type}`, action);
      })
    );
  },
  { functional: true, dispatch: false }
);
