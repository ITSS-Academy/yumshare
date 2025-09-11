import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LikesState } from './likes.state';

// Feature selector
export const selectLikesState = createFeatureSelector<LikesState>('likes');

// Basic selectors
export const selectLikeCounts = createSelector(
  selectLikesState,
  (state) => state.counts
);

export const selectRecipeLikes = createSelector(
  selectLikesState,
  (state) => state.recipeLikes
);

export const selectLikedByUser = createSelector(
  selectLikesState,
  (state) => state.likedByUser
);

export const selectLikesLoading = createSelector(
  selectLikesState,
  (state) => state.loading
);

export const selectLikesError = createSelector(
  selectLikesState,
  (state) => state.error
);

// Parameterized selectors
export const selectRecipeLikeCount = (recipeId: string) => createSelector(
  selectLikeCounts,
  (counts) => counts[recipeId] ?? 0
);

export const selectLikesForRecipe = (recipeId: string) => createSelector(
  selectRecipeLikes,
  (recipeLikes) => recipeLikes[recipeId] ?? []
);

export const selectIsRecipeLikedByUser = (recipeId: string) => createSelector(
  selectLikesState,
  (state) => {
    const liked = state.likedByUser[recipeId];
    // Explicitly check for true, undefined means not checked yet
    return liked === true;
  }
);

// Computed selectors
export const selectHasLikes = createSelector(
  selectLikeCounts,
  (counts) => Object.values(counts).some(count => count > 0)
);

export const selectTotalLikes = createSelector(
  selectLikeCounts,
  (counts) => Object.values(counts).reduce((sum, count) => sum + count, 0)
);

export const selectIsAnyLikesLoading = createSelector(
  selectLikesLoading,
  (loading) => loading
);

export const selectHasAnyLikesError = createSelector(
  selectLikesError,
  (error) => !!error
);

// Combined state selectors
export const selectLikesListState = createSelector(
  selectRecipeLikes,
  selectLikesLoading,
  selectLikesError,
  (recipeLikes, loading, error) => ({
    recipeLikes,
    loading,
    error
  })
);

export const selectLikeCountState = (recipeId: string) => createSelector(
  selectRecipeLikeCount(recipeId),
  selectLikesLoading,
  selectLikesError,
  (count, loading, error) => ({
    count,
    loading,
    error
  })
);

export const selectRecipeLikeState = (recipeId: string) => createSelector(
  selectIsRecipeLikedByUser(recipeId),
  selectRecipeLikeCount(recipeId),
  selectLikesForRecipe(recipeId),
  selectLikesLoading,
  selectLikesError,
  (isLiked, count, likes, loading, error) => ({
    isLiked,
    count,
    likes,
    loading,
    error
  })
);

// Empty state selectors
export const selectIsLikesEmpty = createSelector(
  selectRecipeLikes,
  selectLikesLoading,
  (recipeLikes, loading) =>
    !loading && Object.values(recipeLikes).every(likes => !likes || likes.length === 0)
);