import { inject } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import * as LikesActions from './likes.actions';
import { LikesApiService } from '../../services/likes/likes.service';
import { withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { selectIsRecipeLikedByUser } from './likes.selectors';
import { take } from 'rxjs/operators';
import { switchMap } from 'rxjs/operators';

export const loadRecipeLikeCount$ = createEffect(
  (actions$ = inject(Actions), api = inject(LikesApiService)) =>
    actions$.pipe(
      ofType(LikesActions.loadRecipeLikeCount),
      mergeMap(({ recipeId }) =>
        api.getLikeCount(recipeId).pipe(
          map((count: number) =>
            LikesActions.loadRecipeLikeCountSuccess({ recipeId, count })
          ),
          catchError((error) =>
            of(LikesActions.loadRecipeLikeCountFailure({ recipeId, error }))
          )
        )
      )
    ),
  { functional: true }
);

export const loadRecipeLikes$ = createEffect(
  (actions$ = inject(Actions), api = inject(LikesApiService)) =>
    actions$.pipe(
      ofType(LikesActions.loadRecipeLikes),
      mergeMap(({ recipeId }) =>
        api.getRecipeLikes(recipeId).pipe(
          map((likes) =>
            LikesActions.loadRecipeLikesSuccess({ recipeId, likes })
          ),
          catchError((error) =>
            of(LikesActions.loadRecipeLikesFailure({ recipeId, error }))
          )
        )
      )
    ),
  { functional: true }
);

export const checkIfLiked$ = createEffect(
  (actions$ = inject(Actions), api = inject(LikesApiService)) =>
    actions$.pipe(
      ofType(LikesActions.checkIfLiked),
      mergeMap(({ userId, recipeId }) =>
        api.checkIfLiked(userId, recipeId).pipe(
          map((liked: boolean) =>
            LikesActions.checkIfLikedSuccess({ recipeId, liked })
          ),
          catchError((error) =>
            of(LikesActions.checkIfLikedFailure({ recipeId, error }))
          )
        )
      )
    ),
  { functional: true }
);

export const likeRecipe$ = createEffect(
  (actions$ = inject(Actions), api = inject(LikesApiService)) =>
    actions$.pipe(
      ofType(LikesActions.likeRecipe),
      mergeMap(({ userId, recipeId }) =>
        api.likeRecipe(userId, recipeId).pipe(
          map(() =>
            LikesActions.likeRecipeSuccess({ recipeId })
          ),
          catchError((error) =>
            of(LikesActions.likeRecipeFailure({ recipeId, error }))
          )
        )
      )
    ),
  { functional: true }
);

export const unlikeRecipe$ = createEffect(
  (actions$ = inject(Actions), api = inject(LikesApiService)) =>
    actions$.pipe(
      ofType(LikesActions.unlikeRecipe),
      mergeMap(({ userId, recipeId }) =>
        api.unlikeRecipe(userId, recipeId).pipe(
          map(() =>
            LikesActions.unlikeRecipeSuccess({ recipeId })
          ),
          catchError((error) =>
            of(LikesActions.unlikeRecipeFailure({ recipeId, error }))
          )
        )
      )
    ),
  { functional: true }
);
import { from } from 'rxjs';
// ...existing imports...

export const toggleLike$ = createEffect(
  (actions$ = inject(Actions), api = inject(LikesApiService)) =>
    actions$.pipe(
      ofType(LikesActions.toggleLike),
      switchMap(({ userId, recipeId }) =>
        api.toggleLike(userId, recipeId).pipe(
          switchMap((liked: boolean) =>
            from([
              LikesActions.toggleLikeSuccess({ userId, recipeId, liked }),
              LikesActions.loadRecipeLikeCount({ recipeId })
            ])
          ),
          catchError((error) =>
            of(LikesActions.toggleLikeFailure({ error: error.message || 'Toggle like failed', recipeId }))
          )
        )
      )
    ),
  { functional: true }
);