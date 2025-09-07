import { createReducer, on } from '@ngrx/store';
import { FavoriteState, initialFavoriteState } from './favorite.state';
import * as FavoriteActions from './favorite.actions';
import { Favorite } from '../../models';

export const favoriteReducer = createReducer(
  initialFavoriteState,

  // Load User Favorites
  on(FavoriteActions.loadUserFavorites, (state, { userId }) => ({
    ...state,
    currentUserId: userId,
    paginatedFavoritesLoading: true,
    paginatedFavoritesError: null,
  })),

  on(FavoriteActions.loadUserFavoritesSuccess, (state, { response }) => ({
    ...state,
    paginatedFavorites: response,
    favorites: response.data,
    paginatedFavoritesLoading: false,
    paginatedFavoritesError: null,
  })),

  on(FavoriteActions.loadUserFavoritesFailure, (state, { error }) => ({
    ...state,
    paginatedFavoritesLoading: false,
    paginatedFavoritesError: error,
  })),

  // Load All User Favorites
  on(FavoriteActions.loadAllUserFavorites, (state, { userId }) => ({
    ...state,
    currentUserId: userId,
    favoritesLoading: true,
    favoritesError: null,
  })),

  on(FavoriteActions.loadAllUserFavoritesSuccess, (state, { favorites }) => ({
    ...state,
    favorites,
    favoritesLoading: false,
    favoritesError: null,
  })),

  on(FavoriteActions.loadAllUserFavoritesFailure, (state, { error }) => ({
    ...state,
    favoritesLoading: false,
    favoritesError: error,
  })),

  // Add to Favorites
  on(FavoriteActions.addToFavorites, (state) => ({
    ...state,
    operationLoading: true,
    operationError: null,
  })),

  on(FavoriteActions.addToFavoritesSuccess, (state, { favorite }) => ({
    ...state,
    favorites: [...state.favorites, favorite],
    favoriteStatus: {
      ...state.favoriteStatus,
      [favorite.recipe_id]: true,
    },
    favoriteCount: state.favoriteCount + 1,
    operationLoading: false,
    operationError: null,
  })),

  on(FavoriteActions.addToFavoritesFailure, (state, { error }) => ({
    ...state,
    operationLoading: false,
    operationError: error,
  })),

  // Remove from Favorites
  on(FavoriteActions.removeFromFavorites, (state) => ({
    ...state,
    operationLoading: true,
    operationError: null,
  })),

  on(FavoriteActions.removeFromFavoritesSuccess, (state, { userId, recipeId }) => ({
    ...state,
    favorites: state.favorites.filter(fav => fav.recipe_id !== recipeId),
    favoriteStatus: {
      ...state.favoriteStatus,
      [recipeId]: false,
    },
    favoriteCount: Math.max(0, state.favoriteCount - 1),
    operationLoading: false,
    operationError: null,
  })),

  on(FavoriteActions.removeFromFavoritesFailure, (state, { error }) => ({
    ...state,
    operationLoading: false,
    operationError: error,
  })),

  // Toggle Favorite
  on(FavoriteActions.toggleFavorite, (state, { recipeId }) => ({
    ...state,
    toggleLoading: {
      ...state.toggleLoading,
      [recipeId]: true,
    },
    toggleError: {
      ...state.toggleError,
      [recipeId]: null,
    },
  })),

  on(FavoriteActions.toggleFavoriteSuccess, (state, { userId, recipeId, isAdded }) => {
    const newFavorites = isAdded
      ? [...state.favorites, { id: '', user_id: userId, recipe_id: recipeId, created_at: new Date() } as Favorite]
      : state.favorites.filter(fav => fav.recipe_id !== recipeId);

    return {
      ...state,
      favorites: newFavorites,
      favoriteStatus: {
        ...state.favoriteStatus,
        [recipeId]: isAdded,
      },
      favoriteCount: isAdded ? state.favoriteCount + 1 : Math.max(0, state.favoriteCount - 1),
      toggleLoading: {
        ...state.toggleLoading,
        [recipeId]: false,
      },
      toggleError: {
        ...state.toggleError,
        [recipeId]: null,
      },
    };
  }),

  on(FavoriteActions.toggleFavoriteFailure, (state, { error, recipeId }) => ({
    ...state,
    toggleLoading: {
      ...state.toggleLoading,
      [recipeId]: false,
    },
    toggleError: {
      ...state.toggleError,
      [recipeId]: error,
    },
  })),

  // Check Favorite Status
  on(FavoriteActions.checkFavoriteStatus, (state, { recipeId }) => ({
    ...state,
    favoriteStatusLoading: {
      ...state.favoriteStatusLoading,
      [recipeId]: true,
    },
    favoriteStatusError: {
      ...state.favoriteStatusError,
      [recipeId]: null,
    },
  })),

  on(FavoriteActions.checkFavoriteStatusSuccess, (state, { recipeId, isFavorite }) => ({
    ...state,
    favoriteStatus: {
      ...state.favoriteStatus,
      [recipeId]: isFavorite,
    },
    favoriteStatusLoading: {
      ...state.favoriteStatusLoading,
      [recipeId]: false,
    },
    favoriteStatusError: {
      ...state.favoriteStatusError,
      [recipeId]: null,
    },
  })),

  on(FavoriteActions.checkFavoriteStatusFailure, (state, { error, recipeId }) => ({
    ...state,
    favoriteStatusLoading: {
      ...state.favoriteStatusLoading,
      [recipeId]: false,
    },
    favoriteStatusError: {
      ...state.favoriteStatusError,
      [recipeId]: error,
    },
  })),

  // Load Favorite Count
  on(FavoriteActions.loadFavoriteCount, (state) => ({
    ...state,
    favoriteCountLoading: true,
    favoriteCountError: null,
  })),

  on(FavoriteActions.loadFavoriteCountSuccess, (state, { count }) => ({
    ...state,
    favoriteCount: count,
    favoriteCountLoading: false,
    favoriteCountError: null,
  })),

  on(FavoriteActions.loadFavoriteCountFailure, (state, { error }) => ({
    ...state,
    favoriteCountLoading: false,
    favoriteCountError: error,
  })),

  // Check Has Favorites
  on(FavoriteActions.checkHasFavorites, (state) => ({
    ...state,
    favoriteCountLoading: true,
    favoriteCountError: null,
  })),

  on(FavoriteActions.checkHasFavoritesSuccess, (state, { hasFavorites }) => ({
    ...state,
    favoriteCount: hasFavorites ? 1 : 0, // Simplified for hasFavorites check
    favoriteCountLoading: false,
    favoriteCountError: null,
  })),

  on(FavoriteActions.checkHasFavoritesFailure, (state, { error }) => ({
    ...state,
    favoriteCountLoading: false,
    favoriteCountError: error,
  })),

  // Get User Favorite Recipe IDs
  on(FavoriteActions.getUserFavoriteRecipeIds, (state) => ({
    ...state,
    favoritesLoading: true,
    favoritesError: null,
  })),

  on(FavoriteActions.getUserFavoriteRecipeIdsSuccess, (state, { recipeIds }) => {
    // Update favorite status for all recipe IDs
    const newFavoriteStatus = { ...state.favoriteStatus };
    recipeIds.forEach(recipeId => {
      newFavoriteStatus[recipeId] = true;
    });

    return {
      ...state,
      favoriteStatus: newFavoriteStatus,
      favoritesLoading: false,
      favoritesError: null,
    };
  }),

  on(FavoriteActions.getUserFavoriteRecipeIdsFailure, (state, { error }) => ({
    ...state,
    favoritesLoading: false,
    favoritesError: error,
  })),

  // Set Current User
  on(FavoriteActions.setCurrentUser, (state, { userId }) => ({
    ...state,
    currentUserId: userId,
  })),

  // Clear Current User
  on(FavoriteActions.clearCurrentUser, (state) => ({
    ...state,
    currentUserId: null,
  })),

  // Clear Favorite State
  on(FavoriteActions.clearFavoriteState, () => initialFavoriteState),

  // Clear Favorites List
  on(FavoriteActions.clearFavoritesList, (state) => ({
    ...state,
    favorites: [],
    paginatedFavorites: null,
    favoriteCount: 0,
  })),

  // Clear Favorite Status
  on(FavoriteActions.clearFavoriteStatus, (state, { recipeId }) => {
    if (recipeId) {
      const newFavoriteStatus = { ...state.favoriteStatus };
      const newFavoriteStatusLoading = { ...state.favoriteStatusLoading };
      const newFavoriteStatusError = { ...state.favoriteStatusError };
      const newToggleLoading = { ...state.toggleLoading };
      const newToggleError = { ...state.toggleError };

      delete newFavoriteStatus[recipeId];
      delete newFavoriteStatusLoading[recipeId];
      delete newFavoriteStatusError[recipeId];
      delete newToggleLoading[recipeId];
      delete newToggleError[recipeId];

      return {
        ...state,
        favoriteStatus: newFavoriteStatus,
        favoriteStatusLoading: newFavoriteStatusLoading,
        favoriteStatusError: newFavoriteStatusError,
        toggleLoading: newToggleLoading,
        toggleError: newToggleError,
      };
    } else {
      return {
        ...state,
        favoriteStatus: {},
        favoriteStatusLoading: {},
        favoriteStatusError: {},
        toggleLoading: {},
        toggleError: {},
      };
    }
  }),

  // Clear Operation Error
  on(FavoriteActions.clearOperationError, (state) => ({
    ...state,
    operationError: null,
  })),

  // Clear Toggle Error
  on(FavoriteActions.clearToggleError, (state, { recipeId }) => ({
    ...state,
    toggleError: {
      ...state.toggleError,
      [recipeId]: null,
    },
  })),
);
