import { createAction, props } from '@ngrx/store';
import { Favorite } from '../../models/favorite.model';
import { PaginatedResponse } from '../../models/paginated-response.model';
import { QueryOptions } from '../../services/favorite/favorite.service';

// Load User Favorites
export const loadUserFavorites = createAction(
  '[Favorite] Load User Favorites',
  props<{ userId: string; queryOptions?: QueryOptions }>()
);

export const loadUserFavoritesSuccess = createAction(
  '[Favorite] Load User Favorites Success',
  props<{ response: PaginatedResponse<Favorite> }>()
);

export const loadUserFavoritesFailure = createAction(
  '[Favorite] Load User Favorites Failure',
  props<{ error: string }>()
);

// Load All User Favorites (without pagination)
export const loadAllUserFavorites = createAction(
  '[Favorite] Load All User Favorites',
  props<{ userId: string }>()
);

export const loadAllUserFavoritesSuccess = createAction(
  '[Favorite] Load All User Favorites Success',
  props<{ favorites: Favorite[] }>()
);

export const loadAllUserFavoritesFailure = createAction(
  '[Favorite] Load All User Favorites Failure',
  props<{ error: string }>()
);

// Add to Favorites
export const addToFavorites = createAction(
  '[Favorite] Add to Favorites',
  props<{ userId: string; recipeId: string }>()
);

export const addToFavoritesSuccess = createAction(
  '[Favorite] Add to Favorites Success',
  props<{ favorite: Favorite }>()
);

export const addToFavoritesFailure = createAction(
  '[Favorite] Add to Favorites Failure',
  props<{ error: string }>()
);

// Remove from Favorites
export const removeFromFavorites = createAction(
  '[Favorite] Remove from Favorites',
  props<{ userId: string; recipeId: string }>()
);

export const removeFromFavoritesSuccess = createAction(
  '[Favorite] Remove from Favorites Success',
  props<{ userId: string; recipeId: string }>()
);

export const removeFromFavoritesFailure = createAction(
  '[Favorite] Remove from Favorites Failure',
  props<{ error: string }>()
);

// Toggle Favorite
export const toggleFavorite = createAction(
  '[Favorite] Toggle Favorite',
  props<{ userId: string; recipeId: string }>()
);

export const toggleFavoriteSuccess = createAction(
  '[Favorite] Toggle Favorite Success',
  props<{ userId: string; recipeId: string; isAdded: boolean }>()
);

export const toggleFavoriteFailure = createAction(
  '[Favorite] Toggle Favorite Failure',
  props<{ error: string; recipeId: string }>()
);

// Check if Recipe is in Favorites
export const checkFavoriteStatus = createAction(
  '[Favorite] Check Favorite Status',
  props<{ userId: string; recipeId: string }>()
);

export const checkFavoriteStatusSuccess = createAction(
  '[Favorite] Check Favorite Status Success',
  props<{ recipeId: string; isFavorite: boolean }>()
);

export const checkFavoriteStatusFailure = createAction(
  '[Favorite] Check Favorite Status Failure',
  props<{ error: string; recipeId: string }>()
);

// Load Favorite Count
export const loadFavoriteCount = createAction(
  '[Favorite] Load Favorite Count',
  props<{ userId: string }>()
);

export const loadFavoriteCountSuccess = createAction(
  '[Favorite] Load Favorite Count Success',
  props<{ count: number }>()
);

export const loadFavoriteCountFailure = createAction(
  '[Favorite] Load Favorite Count Failure',
  props<{ error: string }>()
);

// Check if User has Favorites
export const checkHasFavorites = createAction(
  '[Favorite] Check Has Favorites',
  props<{ userId: string }>()
);

export const checkHasFavoritesSuccess = createAction(
  '[Favorite] Check Has Favorites Success',
  props<{ hasFavorites: boolean }>()
);

export const checkHasFavoritesFailure = createAction(
  '[Favorite] Check Has Favorites Failure',
  props<{ error: string }>()
);

// Get User Favorite Recipe IDs
export const getUserFavoriteRecipeIds = createAction(
  '[Favorite] Get User Favorite Recipe IDs',
  props<{ userId: string }>()
);

export const getUserFavoriteRecipeIdsSuccess = createAction(
  '[Favorite] Get User Favorite Recipe IDs Success',
  props<{ recipeIds: string[] }>()
);

export const getUserFavoriteRecipeIdsFailure = createAction(
  '[Favorite] Get User Favorite Recipe IDs Failure',
  props<{ error: string }>()
);

// Set Current User
export const setCurrentUser = createAction(
  '[Favorite] Set Current User',
  props<{ userId: string }>()
);

// Clear Current User
export const clearCurrentUser = createAction('[Favorite] Clear Current User');

// Clear Favorite State
export const clearFavoriteState = createAction('[Favorite] Clear Favorite State');

// Clear Favorites List
export const clearFavoritesList = createAction('[Favorite] Clear Favorites List');

// Clear Favorite Status
export const clearFavoriteStatus = createAction(
  '[Favorite] Clear Favorite Status',
  props<{ recipeId?: string }>() // If no recipeId provided, clear all
);

// Clear Operation Error
export const clearOperationError = createAction('[Favorite] Clear Operation Error');

// Clear Toggle Error
export const clearToggleError = createAction(
  '[Favorite] Clear Toggle Error',
  props<{ recipeId: string }>()
);
