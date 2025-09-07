import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FavoriteState } from './favorite.state';

// Feature selector
export const selectFavoriteState = createFeatureSelector<FavoriteState>('favorite');

// Basic selectors
export const selectFavorites = createSelector(
  selectFavoriteState,
  (state) => state.favorites
);

export const selectFavoritesLoading = createSelector(
  selectFavoriteState,
  (state) => state.favoritesLoading
);

export const selectFavoritesError = createSelector(
  selectFavoriteState,
  (state) => state.favoritesError
);

export const selectPaginatedFavorites = createSelector(
  selectFavoriteState,
  (state) => state.paginatedFavorites
);

export const selectPaginatedFavoritesLoading = createSelector(
  selectFavoriteState,
  (state) => state.paginatedFavoritesLoading
);

export const selectPaginatedFavoritesError = createSelector(
  selectFavoriteState,
  (state) => state.paginatedFavoritesError
);

export const selectFavoriteCount = createSelector(
  selectFavoriteState,
  (state) => state.favoriteCount
);

export const selectFavoriteCountLoading = createSelector(
  selectFavoriteState,
  (state) => state.favoriteCountLoading
);

export const selectFavoriteCountError = createSelector(
  selectFavoriteState,
  (state) => state.favoriteCountError
);

export const selectCurrentUserId = createSelector(
  selectFavoriteState,
  (state) => state.currentUserId
);

export const selectOperationLoading = createSelector(
  selectFavoriteState,
  (state) => state.operationLoading
);

export const selectOperationError = createSelector(
  selectFavoriteState,
  (state) => state.operationError
);

// Favorite status selectors
export const selectFavoriteStatus = createSelector(
  selectFavoriteState,
  (state) => state.favoriteStatus
);

export const selectFavoriteStatusLoading = createSelector(
  selectFavoriteState,
  (state) => state.favoriteStatusLoading
);

export const selectFavoriteStatusError = createSelector(
  selectFavoriteState,
  (state) => state.favoriteStatusError
);

export const selectToggleLoading = createSelector(
  selectFavoriteState,
  (state) => state.toggleLoading
);

export const selectToggleErrorState = createSelector(
  selectFavoriteState,
  (state) => state.toggleError
);

// Parameterized selectors
export const selectIsRecipeFavorite = (recipeId: string) => createSelector(
  selectFavoriteStatus,
  (favoriteStatus) => favoriteStatus[recipeId] || false
);

export const selectIsRecipeFavoriteLoading = (recipeId: string) => createSelector(
  selectFavoriteStatusLoading,
  (favoriteStatusLoading) => favoriteStatusLoading[recipeId] || false
);

export const selectRecipeFavoriteError = (recipeId: string) => createSelector(
  selectFavoriteStatusError,
  (favoriteStatusError) => favoriteStatusError[recipeId] || null
);

export const selectIsToggleLoading = (recipeId: string) => createSelector(
  selectToggleLoading,
  (toggleLoading) => toggleLoading[recipeId] || false
);

export const selectToggleError = (recipeId: string) => createSelector(
  selectToggleErrorState,
  (toggleError) => toggleError[recipeId] || null
);

// Computed selectors
export const selectHasFavorites = createSelector(
  selectFavoriteCount,
  (count) => count > 0
);

export const selectFavoritesCount = createSelector(
  selectFavorites,
  (favorites) => favorites.length
);

export const selectFavoriteRecipeIds = createSelector(
  selectFavorites,
  (favorites) => favorites.map(fav => fav.recipe_id)
);

export const selectFavoriteRecipes = createSelector(
  selectFavorites,
  (favorites) => favorites.map(fav => fav.recipe).filter(recipe => recipe !== null)
);

// Loading state selectors
export const selectIsAnyLoading = createSelector(
  selectFavoritesLoading,
  selectPaginatedFavoritesLoading,
  selectFavoriteCountLoading,
  selectOperationLoading,
  (favoritesLoading, paginatedLoading, countLoading, operationLoading) =>
    favoritesLoading || paginatedLoading || countLoading || operationLoading
);

export const selectHasAnyError = createSelector(
  selectFavoritesError,
  selectPaginatedFavoritesError,
  selectFavoriteCountError,
  selectOperationError,
  (favoritesError, paginatedError, countError, operationError) =>
    !!(favoritesError || paginatedError || countError || operationError)
);

// Combined state selectors
export const selectFavoriteListState = createSelector(
  selectFavorites,
  selectFavoritesLoading,
  selectFavoritesError,
  (favorites, loading, error) => ({
    favorites,
    loading,
    error
  })
);

export const selectPaginatedFavoriteListState = createSelector(
  selectPaginatedFavorites,
  selectPaginatedFavoritesLoading,
  selectPaginatedFavoritesError,
  (paginatedFavorites, loading, error) => ({
    paginatedFavorites,
    loading,
    error
  })
);

export const selectFavoriteCountState = createSelector(
  selectFavoriteCount,
  selectFavoriteCountLoading,
  selectFavoriteCountError,
  (count, loading, error) => ({
    count,
    loading,
    error
  })
);

export const selectOperationState = createSelector(
  selectOperationLoading,
  selectOperationError,
  (loading, error) => ({
    loading,
    error
  })
);

// Recipe-specific favorite state
export const selectRecipeFavoriteState = (recipeId: string) => createSelector(
  selectIsRecipeFavorite(recipeId),
  selectIsRecipeFavoriteLoading(recipeId),
  selectRecipeFavoriteError(recipeId),
  selectIsToggleLoading(recipeId),
  selectToggleError(recipeId),
  (isFavorite, statusLoading, statusError, toggleLoading, toggleError) => ({
    isFavorite,
    statusLoading,
    statusError,
    toggleLoading,
    toggleError,
    isLoading: statusLoading || toggleLoading,
    hasError: !!(statusError || toggleError)
  })
);

// User-specific selectors
export const selectUserFavoritesState = (userId: string) => createSelector(
  selectCurrentUserId,
  selectFavorites,
  selectFavoritesLoading,
  selectFavoritesError,
  (currentUserId, favorites, loading, error) => ({
    isCurrentUser: currentUserId === userId,
    favorites: currentUserId === userId ? favorites : [],
    loading,
    error
  })
);

// Empty state selectors
export const selectIsFavoritesEmpty = createSelector(
  selectFavorites,
  selectFavoritesLoading,
  (favorites, loading) => !loading && favorites.length === 0
);

export const selectIsPaginatedFavoritesEmpty = createSelector(
  selectPaginatedFavorites,
  selectPaginatedFavoritesLoading,
  (paginatedFavorites, loading) => !loading && (!paginatedFavorites || paginatedFavorites.data.length === 0)
);
