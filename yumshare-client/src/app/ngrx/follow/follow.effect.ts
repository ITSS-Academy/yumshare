import { Actions, createEffect, ofType } from '@ngrx/effects';
import { inject } from '@angular/core';
import * as FollowActions from './follow.actions';
import { catchError, from, map, of, switchMap } from 'rxjs';
import { FollowService } from '../../services/follow/follow.service';

// Follow User Effects
export const followUserEffects = createEffect(
  (actions$ = inject(Actions), followService = inject(FollowService)) => {
    return actions$.pipe(
      ofType(FollowActions.followUser),
      switchMap((action) => 
        from(followService.followUser(action.followerId, action.followingId)).pipe(
          map((follow) => FollowActions.followUserSuccess({ follow })),
          catchError((error) => {
            console.error('Follow error:', error);
            return of(FollowActions.followUserFailure({ error: error.message }));
          })
        )
      )
    );
  },
  { functional: true }
);


// Unfollow User Effects
export const unfollowUserEffects = createEffect(
  (actions$ = inject(Actions), followService = inject(FollowService)) => {
    return actions$.pipe(
      ofType(FollowActions.unfollowUser),
      switchMap((action) =>
        from(followService.unfollowUser(action.followerId, action.followingId)).pipe(
          map((response) => FollowActions.unfollowUserSuccess({ message: response.message })),
          catchError((error) =>
            of(FollowActions.unfollowUserFailure({ error: error.message }))
          )
        )
      )
    );
  },
  { functional: true }
);

// Get Followers Effects
export const getFollowersEffects = createEffect(
  (actions$ = inject(Actions), followService = inject(FollowService)) => {
    return actions$.pipe(
      ofType(FollowActions.getFollowers),
      switchMap((action) =>
        from(followService.getFollowers(action.userId, action.page, action.limit)).pipe(
          map((followers) => FollowActions.getFollowersSuccess({ followers })),
          catchError((error) =>
            of(FollowActions.getFollowersFailure({ error: error.message }))
          )
        )
      )
    );
  },
  { functional: true }
);

// Get Following Effects
export const getFollowingEffects = createEffect(
  (actions$ = inject(Actions), followService = inject(FollowService)) => {
    return actions$.pipe(
      ofType(FollowActions.getFollowing),
      switchMap((action) =>
        from(followService.getFollowing(action.userId, action.page, action.limit)).pipe(
          map((following) => FollowActions.getFollowingSuccess({ following })),
          catchError((error) =>
            of(FollowActions.getFollowingFailure({ error: error.message }))
          )
        )
      )
    );
  },
  { functional: true }
);

// Check Following Status Effects
export const checkFollowingStatusEffects = createEffect(
  (actions$ = inject(Actions), followService = inject(FollowService)) => {
    return actions$.pipe(
      ofType(FollowActions.checkFollowingStatus),
      switchMap((action) =>
        from(followService.isFollowing(action.followerId, action.followingId)).pipe(
          map((isFollowing) => FollowActions.checkFollowingStatusSuccess({ isFollowing })),
          catchError((error) =>
            of(FollowActions.checkFollowingStatusFailure({ error: error.message }))
          )
        )
      )
    );
  },
  { functional: true }
);

// Get Follower Count Effects
export const getFollowerCountEffects = createEffect(
  (actions$ = inject(Actions), followService = inject(FollowService)) => {
    return actions$.pipe(
      ofType(FollowActions.getFollowerCount),
      switchMap((action) =>
        from(followService.getFollowerCount(action.userId)).pipe(
          map((count) => FollowActions.getFollowerCountSuccess({ count })),
          catchError((error) =>
            of(FollowActions.getFollowerCountFailure({ error: error.message }))
          )
        )
      )
    );
  },
  { functional: true }
);

// Get Following Count Effects
export const getFollowingCountEffects = createEffect(
  (actions$ = inject(Actions), followService = inject(FollowService)) => {
    return actions$.pipe(
      ofType(FollowActions.getFollowingCount),
      switchMap((action) =>
        from(followService.getFollowingCount(action.userId)).pipe(
          map((count) => FollowActions.getFollowingCountSuccess({ count })),
          catchError((error) =>
            of(FollowActions.getFollowingCountFailure({ error: error.message }))
          )
        )
      )
    );
  },
  { functional: true }
);
