import { createReducer, on } from '@ngrx/store';
import * as LikesActions from './likes.actions';
import { LikesState, initialLikesState } from './likes.state';
import { Like } from '../../models';

export const likesReducer = createReducer(
  initialLikesState,

  on(LikesActions.loadRecipeLikeCount, (state) => {
    return {
      ...state,
      loading: true,
      error: null,
    };
  }),
  on(LikesActions.loadRecipeLikeCountSuccess, (state, { recipeId, count }) => {
    return {
      ...state,
      counts: { ...state.counts, [recipeId]: count },
      loading: false,
    };
  }),
  on(LikesActions.loadRecipeLikeCountFailure, (state, { recipeId, error }) => {
    return {
      ...state,
      loading: false,
      error,
    };
  }),

  on(LikesActions.loadRecipeLikes, (state) => {
    return {
      ...state,
      loading: true,
      error: null,
    };
  }),
  on(LikesActions.loadRecipeLikesSuccess, (state, { recipeId, likes }) => {
    return {
      ...state,
      recipeLikes: { ...state.recipeLikes, [recipeId]: likes },
      loading: false,
    };
  }),
  on(LikesActions.loadRecipeLikesFailure, (state, { recipeId, error }) => {
    return {
      ...state,
      loading: false,
      error,
    };
  }),

  on(LikesActions.checkIfLiked, (state) => {
    return {
      ...state,
      loading: true,
      error: null,
    };
  }),
  on(LikesActions.checkIfLikedSuccess, (state, { recipeId, liked }) => {
    return {
      ...state,
      likedByUser: { ...state.likedByUser, [recipeId]: liked },
      loading: false,
    };
  }),
  on(LikesActions.checkIfLikedFailure, (state, { recipeId, error }) => {
    return {
      ...state,
      loading: false,
      error,
    };
  }),

  on(LikesActions.likeRecipe, (state) => {
    return {
      ...state,
      loading: true,
      error: null,
    };
  }),
  on(LikesActions.likeRecipeSuccess, (state, { recipeId }) => {
    const newLikedByUser = { ...state.likedByUser };
    newLikedByUser[recipeId] = true; // Explicitly set to true
    return {
      ...state,
      likedByUser: newLikedByUser,
      loading: false,
    };
  }),
  on(LikesActions.likeRecipeFailure, (state, { recipeId, error }) => {
    return {
      ...state,
      loading: false,
      error,
    };
  }),

  on(LikesActions.unlikeRecipe, (state) => {
    return {
      ...state,
      loading: true,
      error: null,
    };
  }),
  on(LikesActions.unlikeRecipeSuccess, (state, { recipeId }) => {
    const newLikedByUser = { ...state.likedByUser };
    newLikedByUser[recipeId] = false; // Explicitly set to false
    return {
      ...state,
      likedByUser: newLikedByUser,
      loading: false,
    };
  }),
  on(LikesActions.unlikeRecipeFailure, (state, { recipeId, error }) => {
    return {
      ...state,
      loading: false,
      error,
    };
  }),

  // Toggle Like
  on(LikesActions.toggleLike, (state) => {
    return {
      ...state,
      loading: true,
      error: null,
    };
  }),
  on(LikesActions.toggleLikeSuccess, (state, { userId, recipeId, liked }) => {
    const newLikedByUser = { ...state.likedByUser };
    newLikedByUser[recipeId] = liked; // Explicitly set the boolean value
    return {
      ...state,
      likedByUser: newLikedByUser,
      loading: false,
    };
  }),
  on(LikesActions.toggleLikeFailure, (state, { recipeId, error }) => {
    return {
      ...state,
      loading: false,
      error,
    };
  })
);