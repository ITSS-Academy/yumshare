import { createReducer, on } from '@ngrx/store';
import { CommentState, initialCommentState } from './comment.state';
import * as CommentActions from './comment.actions';

export const commentReducer = createReducer(
  initialCommentState,

  // Load Comments
  on(CommentActions.loadComments, (state) => ({
    ...state,
    commentsLoading: true,
    commentsError: null,
  })),

  on(CommentActions.loadCommentsSuccess, (state, { comments, pagination }) => ({
    ...state,
    comments,
    pagination,
    commentsLoading: false,
    commentsError: null,
  })),

  on(CommentActions.loadCommentsFailure, (state, { error }) => ({
    ...state,
    commentsLoading: false,
    commentsError: error,
  })),

  // Load Comments by Recipe
  on(CommentActions.loadCommentsByRecipe, (state) => ({
    ...state,
    commentsByRecipeLoading: true,
    commentsByRecipeError: null,
  })),

  on(CommentActions.loadCommentsByRecipeSuccess, (state, { comments, pagination }) => ({
    ...state,
    commentsByRecipe: comments,
    pagination,
    commentsByRecipeLoading: false,
    commentsByRecipeError: null,
  })),

  on(CommentActions.loadCommentsByRecipeFailure, (state, { error }) => ({
    ...state,
    commentsByRecipeLoading: false,
    commentsByRecipeError: error,
  })),

  // Load Comments by User
  on(CommentActions.loadCommentsByUser, (state) => ({
    ...state,
    commentsByUserLoading: true,
    commentsByUserError: null,
  })),

  on(CommentActions.loadCommentsByUserSuccess, (state, { comments, pagination }) => ({
    ...state,
    commentsByUser: comments,
    pagination,
    commentsByUserLoading: false,
    commentsByUserError: null,
  })),

  on(CommentActions.loadCommentsByUserFailure, (state, { error }) => ({
    ...state,
    commentsByUserLoading: false,
    commentsByUserError: error,
  })),

  // Load Comment by ID
  on(CommentActions.loadCommentById, (state) => ({
    ...state,
    currentCommentLoading: true,
    currentCommentError: null,
  })),

  on(CommentActions.loadCommentByIdSuccess, (state, { comment }) => ({
    ...state,
    currentComment: comment,
    currentCommentLoading: false,
    currentCommentError: null,
  })),

  on(CommentActions.loadCommentByIdFailure, (state, { error }) => ({
    ...state,
    currentCommentLoading: false,
    currentCommentError: error,
  })),

  // Create Comment
  on(CommentActions.createComment, (state) => ({
    ...state,
    operationLoading: true,
    operationError: null,
  })),

  on(CommentActions.createCommentSuccess, (state, { comment }) => ({
    ...state,
    comments: [comment, ...state.comments],
    commentsByRecipe: [comment, ...state.commentsByRecipe],
    commentsByUser: [comment, ...state.commentsByUser],
    operationLoading: false,
    operationError: null,
  })),

  on(CommentActions.createCommentFailure, (state, { error }) => ({
    ...state,
    operationLoading: false,
    operationError: error,
  })),

  // Update Comment
  on(CommentActions.updateComment, (state) => ({
    ...state,
    operationLoading: true,
    operationError: null,
  })),

  on(CommentActions.updateCommentSuccess, (state, { comment }) => ({
    ...state,
    comments: state.comments.map(c => c.id === comment.id ? comment : c),
    commentsByRecipe: state.commentsByRecipe.map(c => c.id === comment.id ? comment : c),
    commentsByUser: state.commentsByUser.map(c => c.id === comment.id ? comment : c),
    currentComment: state.currentComment?.id === comment.id ? comment : state.currentComment,
    operationLoading: false,
    operationError: null,
  })),

  on(CommentActions.updateCommentFailure, (state, { error }) => ({
    ...state,
    operationLoading: false,
    operationError: error,
  })),

  // Delete Comment
  on(CommentActions.deleteComment, (state) => ({
    ...state,
    operationLoading: true,
    operationError: null,
  })),

  on(CommentActions.deleteCommentSuccess, (state, { id }) => ({
    ...state,
    comments: state.comments.filter(c => c.id !== id),
    commentsByRecipe: state.commentsByRecipe.filter(c => c.id !== id),
    commentsByUser: state.commentsByUser.filter(c => c.id !== id),
    currentComment: state.currentComment?.id === id ? null : state.currentComment,
    operationLoading: false,
    operationError: null,
  })),

  on(CommentActions.deleteCommentFailure, (state, { error }) => ({
    ...state,
    operationLoading: false,
    operationError: error,
  })),

  // Search Comments
  on(CommentActions.searchComments, (state, { query }) => ({
    ...state,
    searchQuery: query,
    searchLoading: true,
    searchError: null,
  })),

  on(CommentActions.searchCommentsSuccess, (state, { comments, pagination }) => ({
    ...state,
    searchResults: comments,
    pagination,
    searchLoading: false,
    searchError: null,
  })),

  on(CommentActions.searchCommentsFailure, (state, { error }) => ({
    ...state,
    searchLoading: false,
    searchError: error,
  })),

  // Get Comment Count by Recipe
  on(CommentActions.getCommentCountByRecipe, (state) => ({
    ...state,
    commentCountsLoading: true,
    commentCountsError: null,
  })),

  on(CommentActions.getCommentCountByRecipeSuccess, (state, { recipeId, count }) => ({
    ...state,
    commentCounts: { ...state.commentCounts, [`recipe_${recipeId}`]: count },
    commentCountsLoading: false,
    commentCountsError: null,
  })),

  on(CommentActions.getCommentCountByRecipeFailure, (state, { error }) => ({
    ...state,
    commentCountsLoading: false,
    commentCountsError: error,
  })),

  // Get Comment Count by User
  on(CommentActions.getCommentCountByUser, (state) => ({
    ...state,
    commentCountsLoading: true,
    commentCountsError: null,
  })),

  on(CommentActions.getCommentCountByUserSuccess, (state, { userId, count }) => ({
    ...state,
    commentCounts: { ...state.commentCounts, [`user_${userId}`]: count },
    commentCountsLoading: false,
    commentCountsError: null,
  })),

  on(CommentActions.getCommentCountByUserFailure, (state, { error }) => ({
    ...state,
    commentCountsLoading: false,
    commentCountsError: error,
  })),

  // Set Current Comment
  on(CommentActions.setCurrentComment, (state, { comment }) => ({
    ...state,
    currentComment: comment,
  })),

  // Clear Actions
  on(CommentActions.clearCommentState, () => initialCommentState),

  on(CommentActions.clearCurrentComment, (state) => ({
    ...state,
    currentComment: null,
    currentCommentLoading: false,
    currentCommentError: null,
  })),

  on(CommentActions.clearSearchResults, (state) => ({
    ...state,
    searchQuery: '',
    searchResults: [],
    searchLoading: false,
    searchError: null,
  })),
);
