import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CommentState } from './comment.state';

export const selectCommentState = createFeatureSelector<CommentState>('comment');

// Select all comments
export const selectAllComments = createSelector(
  selectCommentState,
  (state: CommentState) => state.comments
);

// Select comments by recipe
export const selectCommentsByRecipe = createSelector(
  selectCommentState,
  (state: CommentState) => state.commentsByRecipe
);

// Select comments by user
export const selectCommentsByUser = createSelector(
  selectCommentState,
  (state: CommentState) => state.commentsByUser
);

// Select current comment
export const selectCurrentComment = createSelector(
  selectCommentState,
  (state: CommentState) => state.currentComment
);

// Select search results
export const selectCommentSearchResults = createSelector(
  selectCommentState,
  (state: CommentState) => state.searchResults
);

// Select comment counts
export const selectCommentCounts = createSelector(
  selectCommentState,
  (state: CommentState) => state.commentCounts
);

// Select loading states
export const selectCommentsLoading = createSelector(
  selectCommentState,
  (state: CommentState) => state.commentsLoading
);

export const selectCommentsByRecipeLoading = createSelector(
  selectCommentState,
  (state: CommentState) => state.commentsByRecipeLoading
);

export const selectCommentsByUserLoading = createSelector(
  selectCommentState,
  (state: CommentState) => state.commentsByUserLoading
);

export const selectCurrentCommentLoading = createSelector(
  selectCommentState,
  (state: CommentState) => state.currentCommentLoading
);

export const selectSearchLoading = createSelector(
  selectCommentState,
  (state: CommentState) => state.searchLoading
);

export const selectCommentCountsLoading = createSelector(
  selectCommentState,
  (state: CommentState) => state.commentCountsLoading
);

export const selectOperationLoading = createSelector(
  selectCommentState,
  (state: CommentState) => state.operationLoading
);

// Select error states
export const selectCommentsError = createSelector(
  selectCommentState,
  (state: CommentState) => state.commentsError
);

export const selectCommentsByRecipeError = createSelector(
  selectCommentState,
  (state: CommentState) => state.commentsByRecipeError
);

export const selectCommentsByUserError = createSelector(
  selectCommentState,
  (state: CommentState) => state.commentsByUserError
);

export const selectCurrentCommentError = createSelector(
  selectCommentState,
  (state: CommentState) => state.currentCommentError
);

export const selectSearchError = createSelector(
  selectCommentState,
  (state: CommentState) => state.searchError
);

export const selectCommentCountsError = createSelector(
  selectCommentState,
  (state: CommentState) => state.commentCountsError
);

export const selectOperationError = createSelector(
  selectCommentState,
  (state: CommentState) => state.operationError
);

// Select pagination
export const selectCommentPagination = createSelector(
  selectCommentState,
  (state: CommentState) => state.pagination
);

// Select search query
export const selectCommentSearchQuery = createSelector(
  selectCommentState,
  (state: CommentState) => state.searchQuery
);

// Select comment count by recipe
export const selectCommentCountByRecipe = createSelector(
  selectCommentCounts,
  (commentCounts: { [key: string]: number }, props: { recipeId: string }) => 
    commentCounts[`recipe_${props.recipeId}`] || 0
);

// Select comment count by user
export const selectCommentCountByUser = createSelector(
  selectCommentCounts,
  (commentCounts: { [key: string]: number }, props: { userId: string }) => 
    commentCounts[`user_${props.userId}`] || 0
);
