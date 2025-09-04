import { createAction, props } from '@ngrx/store';
import { Comment } from '../../models/comment.model';
import { CreateCommentDto, UpdateCommentDto, CommentQueryParams } from '../../services/comment.service';

// Load Comments
export const loadComments = createAction(
  '[Comment] Load Comments',
  props<{ params?: CommentQueryParams }>()
);

export const loadCommentsSuccess = createAction(
  '[Comment] Load Comments Success',
  props<{ comments: Comment[]; pagination: any }>()
);

export const loadCommentsFailure = createAction(
  '[Comment] Load Comments Failure',
  props<{ error: string }>()
);

// Load Comments by Recipe
export const loadCommentsByRecipe = createAction(
  '[Comment] Load Comments by Recipe',
  props<{ recipeId: string; params?: CommentQueryParams }>()
);

export const loadCommentsByRecipeSuccess = createAction(
  '[Comment] Load Comments by Recipe Success',
  props<{ comments: Comment[]; pagination: any }>()
);

export const loadCommentsByRecipeFailure = createAction(
  '[Comment] Load Comments by Recipe Failure',
  props<{ error: string }>()
);

// Load Comments by User
export const loadCommentsByUser = createAction(
  '[Comment] Load Comments by User',
  props<{ userId: string; params?: CommentQueryParams }>()
);

export const loadCommentsByUserSuccess = createAction(
  '[Comment] Load Comments by User Success',
  props<{ comments: Comment[]; pagination: any }>()
);

export const loadCommentsByUserFailure = createAction(
  '[Comment] Load Comments by User Failure',
  props<{ error: string }>()
);

// Load Comment by ID
export const loadCommentById = createAction(
  '[Comment] Load Comment by ID',
  props<{ id: string }>()
);

export const loadCommentByIdSuccess = createAction(
  '[Comment] Load Comment by ID Success',
  props<{ comment: Comment }>()
);

export const loadCommentByIdFailure = createAction(
  '[Comment] Load Comment by ID Failure',
  props<{ error: string }>()
);

// Create Comment
export const createComment = createAction(
  '[Comment] Create Comment',
  props<{ commentData: CreateCommentDto }>()
);

export const createCommentSuccess = createAction(
  '[Comment] Create Comment Success',
  props<{ comment: Comment }>()
);

export const createCommentFailure = createAction(
  '[Comment] Create Comment Failure',
  props<{ error: string }>()
);

// Update Comment
export const updateComment = createAction(
  '[Comment] Update Comment',
  props<{ id: string; commentData: UpdateCommentDto }>()
);

export const updateCommentSuccess = createAction(
  '[Comment] Update Comment Success',
  props<{ comment: Comment }>()
);

export const updateCommentFailure = createAction(
  '[Comment] Update Comment Failure',
  props<{ error: string }>()
);

// Delete Comment
export const deleteComment = createAction(
  '[Comment] Delete Comment',
  props<{ id: string }>()
);

export const deleteCommentSuccess = createAction(
  '[Comment] Delete Comment Success',
  props<{ id: string }>()
);

export const deleteCommentFailure = createAction(
  '[Comment] Delete Comment Failure',
  props<{ error: string }>()
);

// Search Comments
export const searchComments = createAction(
  '[Comment] Search Comments',
  props<{ query: string; params?: CommentQueryParams }>()
);

export const searchCommentsSuccess = createAction(
  '[Comment] Search Comments Success',
  props<{ comments: Comment[]; pagination: any }>()
);

export const searchCommentsFailure = createAction(
  '[Comment] Search Comments Failure',
  props<{ error: string }>()
);

// Get Comment Count
export const getCommentCountByRecipe = createAction(
  '[Comment] Get Comment Count by Recipe',
  props<{ recipeId: string }>()
);

export const getCommentCountByRecipeSuccess = createAction(
  '[Comment] Get Comment Count by Recipe Success',
  props<{ recipeId: string; count: number }>()
);

export const getCommentCountByRecipeFailure = createAction(
  '[Comment] Get Comment Count by Recipe Failure',
  props<{ error: string }>()
);

export const getCommentCountByUser = createAction(
  '[Comment] Get Comment Count by User',
  props<{ userId: string }>()
);

export const getCommentCountByUserSuccess = createAction(
  '[Comment] Get Comment Count by User Success',
  props<{ userId: string; count: number }>()
);

export const getCommentCountByUserFailure = createAction(
  '[Comment] Get Comment Count by User Failure',
  props<{ error: string }>()
);

// Set Current Comment
export const setCurrentComment = createAction(
  '[Comment] Set Current Comment',
  props<{ comment: Comment | null }>()
);

// Clear Comment State
export const clearCommentState = createAction('[Comment] Clear Comment State');

// Clear Current Comment
export const clearCurrentComment = createAction('[Comment] Clear Current Comment');

// Clear Search Results
export const clearSearchResults = createAction('[Comment] Clear Search Results');
