import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FollowState } from './follow.state';

// Feature selector
export const selectFollowState = createFeatureSelector<FollowState>('follow');

// Basic selectors
export const selectIsLoading = createSelector(
  selectFollowState,
  (state) => state.isLoading
);

export const selectError = createSelector(
  selectFollowState,
  (state) => state.error
);

// Followers selectors
export const selectFollowers = createSelector(
  selectFollowState,
  (state) => state.followers
);

export const selectFollowersData = createSelector(
  selectFollowers,
  (followers) => followers?.data || []
);

export const selectFollowersPagination = createSelector(
  selectFollowers,
  (followers) => followers ? {
    total: followers.total,
    current_page: followers.current_page,
    total_pages: followers.total_pages,
    has_next: followers.has_next,
    has_prev: followers.has_prev
  } : null
);

// Following selectors
export const selectFollowing = createSelector(
  selectFollowState,
  (state) => state.following
);

export const selectFollowingData = createSelector(
  selectFollowing,
  (following) => following?.data || []
);

export const selectFollowingPagination = createSelector(
  selectFollowing,
  (following) => following ? {
    total: following.total,
    current_page: following.current_page,
    total_pages: following.total_pages,
    has_next: following.has_next,
    has_prev: following.has_prev
  } : null
);

// Following status selector
export const selectIsFollowing = createSelector(
  selectFollowState,
  (state) => state.isFollowing
);

// Count selectors
export const selectFollowerCount = createSelector(
  selectFollowState,
  (state) => state.followerCount
);

export const selectFollowingCount = createSelector(
  selectFollowState,
  (state) => state.followingCount
);

// Combined selectors
export const selectFollowData = createSelector(
  selectFollowersData,
  selectFollowingData,
  selectIsFollowing,
  selectFollowerCount,
  selectFollowingCount,
  (followers, following, isFollowing, followerCount, followingCount) => ({
    followers,
    following,
    isFollowing,
    followerCount,
    followingCount
  })
);
