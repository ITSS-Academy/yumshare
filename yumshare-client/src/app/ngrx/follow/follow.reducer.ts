import { createReducer, on } from '@ngrx/store';
import * as FollowActions from './follow.actions';
import { FollowState } from './follow.state';

export const initialState: FollowState = {
  isLoading: false,
  error: null,
  unfollowSuccess: false,
  followers: null,
  following: null,
  isFollowing: null,
  followerCount: null,
  followingCount: null
};

export const followReducer = createReducer(
  initialState,

  // Follow User
  on(FollowActions.followUser, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(FollowActions.followUserSuccess, (state) => ({
    ...state,
    isLoading: false,
    error: null,
    isFollowing: true
  })),

  on(FollowActions.followUserFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Unfollow User
  on(FollowActions.unfollowUser, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(FollowActions.unfollowUserSuccess, (state, { message }) => ({
    ...state,
    isLoading: false,
    error: null,
    isFollowing: false,
    unfollowSuccess: true
  })),

  on(FollowActions.unfollowUserFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Get Followers
  on(FollowActions.getFollowers, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(FollowActions.getFollowersSuccess, (state, { followers }) => ({
    ...state,
    isLoading: false,
    error: null,
    followers
  })),

  on(FollowActions.getFollowersFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Get Following
  on(FollowActions.getFollowing, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(FollowActions.getFollowingSuccess, (state, { following }) => ({
    ...state,
    isLoading: false,
    error: null,
    following
  })),

  on(FollowActions.getFollowingFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Check Following Status
  on(FollowActions.checkFollowingStatus, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(FollowActions.checkFollowingStatusSuccess, (state, { isFollowing }) => ({
    ...state,
    isLoading: false,
    error: null,
    isFollowing
  })),

  on(FollowActions.checkFollowingStatusFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Get Follower Count
  on(FollowActions.getFollowerCount, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(FollowActions.getFollowerCountSuccess, (state, { count }) => ({
    ...state,
    isLoading: false,
    error: null,
    followerCount: count
  })),

  on(FollowActions.getFollowerCountFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Get Following Count
  on(FollowActions.getFollowingCount, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(FollowActions.getFollowingCountSuccess, (state, { count }) => ({
    ...state,
    isLoading: false,
    error: null,
    followingCount: count
  })),

  on(FollowActions.getFollowingCountFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Clear State
  on(FollowActions.clearFollowState, () => initialState),

  on(FollowActions.clearFollowData, (state) => ({
    ...state,
    followers: null,
    following: null,
    isFollowing: null,
    followerCount: null,
    followingCount: null
  }))
);
