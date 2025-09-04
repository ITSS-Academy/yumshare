import { createAction, props } from '@ngrx/store';
import { Follow } from '../../models/follow.model';
import { PaginatedResponse } from '../../models/paginated-response.model';

// Follow User Actions
export const followUser = createAction(
  '[Follow] Follow User',
  props<{ followerId: string; followingId: string }>()
);

export const followUserSuccess = createAction(
  '[Follow] Follow User Success',
  props<{ follow: Follow }>()
);

export const followUserFailure = createAction(
  '[Follow] Follow User Failure',
  props<{ error: any }>()
);

// Unfollow User Actions
export const unfollowUser = createAction(
  '[Follow] Unfollow User',
  props<{ followerId: string; followingId: string }>()
);

export const unfollowUserSuccess = createAction(
  '[Follow] Unfollow User Success',
  props<{ message: string }>()
);

export const unfollowUserFailure = createAction(
  '[Follow] Unfollow User Failure',
  props<{ error: any }>()
);

// Get Followers Actions
export const getFollowers = createAction(
  '[Follow] Get Followers',
  props<{ userId: string; page?: number; limit?: number }>()
);

export const getFollowersSuccess = createAction(
  '[Follow] Get Followers Success',
  props<{ followers: PaginatedResponse<Follow> }>()
);

export const getFollowersFailure = createAction(
  '[Follow] Get Followers Failure',
  props<{ error: any }>()
);

// Get Following Actions
export const getFollowing = createAction(
  '[Follow] Get Following',
  props<{ userId: string; page?: number; limit?: number }>()
);

export const getFollowingSuccess = createAction(
  '[Follow] Get Following Success',
  props<{ following: PaginatedResponse<Follow> }>()
);

export const getFollowingFailure = createAction(
  '[Follow] Get Following Failure',
  props<{ error: any }>()
);

// Check Following Status Actions
export const checkFollowingStatus = createAction(
  '[Follow] Check Following Status',
  props<{ followerId: string; followingId: string }>()
);

export const checkFollowingStatusSuccess = createAction(
  '[Follow] Check Following Status Success',
  props<{ isFollowing: boolean }>()
);

export const checkFollowingStatusFailure = createAction(
  '[Follow] Check Following Status Failure',
  props<{ error: any }>()
);

// Get Follower Count Actions
export const getFollowerCount = createAction(
  '[Follow] Get Follower Count',
  props<{ userId: string }>()
);

export const getFollowerCountSuccess = createAction(
  '[Follow] Get Follower Count Success',
  props<{ count: number }>()
);

export const getFollowerCountFailure = createAction(
  '[Follow] Get Follower Count Failure',
  props<{ error: any }>()
);

// Get Following Count Actions
export const getFollowingCount = createAction(
  '[Follow] Get Following Count',
  props<{ userId: string }>()
);

export const getFollowingCountSuccess = createAction(
  '[Follow] Get Following Count Success',
  props<{ count: number }>()
);

export const getFollowingCountFailure = createAction(
  '[Follow] Get Following Count Failure',
  props<{ error: any }>()
);

// Clear Follow State Actions
export const clearFollowState = createAction(
  '[Follow] Clear Follow State'
);

export const clearFollowData = createAction(
  '[Follow] Clear Follow Data'
);
