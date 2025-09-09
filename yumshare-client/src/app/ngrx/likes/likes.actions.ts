import { createAction, props } from '@ngrx/store';
import {Like} from '../../models';

export const loadRecipeLikeCount = createAction(
  '[Likes] Load Recipe Like Count',
  props<{ recipeId: string }>()
);
export const loadRecipeLikeCountSuccess = createAction(
  '[Likes] Load Recipe Like Count Success',
  props<{ recipeId: string; count: number }>()
);
export const loadRecipeLikeCountFailure = createAction(
  '[Likes] Load Recipe Like Count Failure',
  props<{ recipeId: string; error: any }>()
);

export const loadRecipeLikes = createAction(
  '[Likes] Load Recipe Likes',
  props<{ recipeId: string }>()
);
export const loadRecipeLikesSuccess = createAction(
  '[Likes] Load Recipe Likes Success',
  props<{ recipeId: string; likes: Like[] }>()
);
export const loadRecipeLikesFailure = createAction(
  '[Likes] Load Recipe Likes Failure',
  props<{ recipeId: string; error: any }>()
);

export const checkIfLiked = createAction(
  '[Likes] Check If Liked',
  props<{ userId: string; recipeId: string }>()
);
export const checkIfLikedSuccess = createAction(
  '[Likes] Check If Liked Success',
  props<{ recipeId: string; liked: boolean }>()
);
export const checkIfLikedFailure = createAction(
  '[Likes] Check If Liked Failure',
  props<{ recipeId: string; error: any }>()
);

export const likeRecipe = createAction(
  '[Likes] Like Recipe',
  props<{ userId: string; recipeId: string }>()
);
export const likeRecipeSuccess = createAction(
  '[Likes] Like Recipe Success',
  props<{ recipeId: string }>()
);
export const likeRecipeFailure = createAction(
  '[Likes] Like Recipe Failure',
  props<{ recipeId: string; error: any }>()
);

export const unlikeRecipe = createAction(
  '[Likes] Unlike Recipe',
  props<{ userId: string; recipeId: string }>()
);
export const unlikeRecipeSuccess = createAction(
  '[Likes] Unlike Recipe Success',
  props<{ recipeId: string }>()
);
export const unlikeRecipeFailure = createAction(
  '[Likes] Unlike Recipe Failure',
  props<{ recipeId: string; error: any }>()
);
export const toggleLike = createAction(
  '[Likes] Toggle Like',
  props<{ userId: string; recipeId: string }>()
);

export const toggleLikeSuccess = createAction(
  '[Likes] Toggle Like Success',
  props<{ userId: string; recipeId: string; liked: boolean }>() // Thêm userId vào đây
);

export const toggleLikeFailure = createAction(
  '[Likes] Toggle Like Failure',
  props<{ recipeId: string; error: any }>()
);