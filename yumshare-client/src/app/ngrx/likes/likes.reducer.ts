import { createReducer, on } from '@ngrx/store';
import * as LikesActions from './likes.actions';
import { LikesState, initialLikesState } from './likes.state';
import { Like } from '../../models';

export const likesReducer = createReducer(
  initialLikesState,

  on(LikesActions.loadRecipeLikeCount, (state) => {
    console.log('[LikesReducer] loadRecipeLikeCount', state);
    return {
      ...state,
      loading: true,
      error: null,
    };
  }),
  on(LikesActions.loadRecipeLikeCountSuccess, (state, { recipeId, count }) => {
    console.log('[LikesReducer] loadRecipeLikeCountSuccess', { recipeId, count });
    return {
      ...state,
      counts: { ...state.counts, [recipeId]: count },
      loading: false,
    };
  }),
  on(LikesActions.loadRecipeLikeCountFailure, (state, { recipeId, error }) => {
    console.log('[LikesReducer] loadRecipeLikeCountFailure', { recipeId, error });
    return {
      ...state,
      loading: false,
      error,
    };
  }),

  on(LikesActions.loadRecipeLikes, (state) => {
    console.log('[LikesReducer] loadRecipeLikes', state);
    return {
      ...state,
      loading: true,
      error: null,
    };
  }),
  on(LikesActions.loadRecipeLikesSuccess, (state, { recipeId, likes }) => {
    console.log('[LikesReducer] loadRecipeLikesSuccess', { recipeId, likes });
    return {
      ...state,
      recipeLikes: { ...state.recipeLikes, [recipeId]: likes },
      loading: false,
    };
  }),
  on(LikesActions.loadRecipeLikesFailure, (state, { recipeId, error }) => {
    console.log('[LikesReducer] loadRecipeLikesFailure', { recipeId, error });
    return {
      ...state,
      loading: false,
      error,
    };
  }),

  on(LikesActions.checkIfLiked, (state) => {
    console.log('[LikesReducer] checkIfLiked', state);
    return {
      ...state,
      loading: true,
      error: null,
    };
  }),
  on(LikesActions.checkIfLikedSuccess, (state, { recipeId, liked }) => {
    console.log('[LikesReducer] checkIfLikedSuccess', { recipeId, liked });
    return {
      ...state,
      likedByUser: { ...state.likedByUser, [recipeId]: liked },
      loading: false,
    };
  }),
  on(LikesActions.checkIfLikedFailure, (state, { recipeId, error }) => {
    console.log('[LikesReducer] checkIfLikedFailure', { recipeId, error });
    return {
      ...state,
      loading: false,
      error,
    };
  }),

  on(LikesActions.likeRecipe, (state) => {
    console.log('[LikesReducer] likeRecipe', state);
    return {
      ...state,
      loading: true,
      error: null,
    };
  }),
  on(LikesActions.likeRecipeSuccess, (state, { recipeId }) => {
    console.log('[LikesReducer] likeRecipeSuccess', { recipeId });
    return {
      ...state,
      likedByUser: { ...state.likedByUser, [recipeId]: true },
      loading: false,
    };
  }),
  on(LikesActions.likeRecipeFailure, (state, { recipeId, error }) => {
    console.log('[LikesReducer] likeRecipeFailure', { recipeId, error });
    return {
      ...state,
      loading: false,
      error,
    };
  }),

  on(LikesActions.unlikeRecipe, (state) => {
    console.log('[LikesReducer] unlikeRecipe', state);
    return {
      ...state,
      loading: true,
      error: null,
    };
  }),
  on(LikesActions.unlikeRecipeSuccess, (state, { recipeId }) => {
    console.log('[LikesReducer] unlikeRecipeSuccess', { recipeId });
    return {
      ...state,
      likedByUser: { ...state.likedByUser, [recipeId]: false },
      loading: false,
    };
  }),
  on(LikesActions.unlikeRecipeFailure, (state, { recipeId, error }) => {
    console.log('[LikesReducer] unlikeRecipeFailure', { recipeId, error });
    return {
      ...state,
      loading: false,
      error,
    };
  }),

  // Toggle Like
  on(LikesActions.toggleLike, (state) => {
    console.log('[LikesReducer] toggleLike', state);
    return {
      ...state,
      loading: true,
      error: null,
    };
  }),
  on(LikesActions.toggleLikeSuccess, (state, { userId, recipeId, liked }) => {
    console.log('[LikesReducer] toggleLikeSuccess', { userId, recipeId, liked });
    return {
      ...state,
      likedByUser: { ...state.likedByUser, [recipeId]: liked },
      loading: false,
    };
  }),
  on(LikesActions.toggleLikeFailure, (state, { recipeId, error }) => {
    console.log('[LikesReducer] toggleLikeFailure', { recipeId, error });
    return {
      ...state,
      loading: false,
      error,
    };
  })
);