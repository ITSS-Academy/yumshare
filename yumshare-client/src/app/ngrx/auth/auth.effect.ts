import { Actions, createEffect, ofType } from '@ngrx/effects';
import { inject } from '@angular/core';
import * as AuthActions from '../auth/auth.actions';
import { catchError, from, map, of, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';

export const authEffects = createEffect(
  (actions$ = inject(Actions), authService = inject(AuthService)) => {
    return actions$.pipe(
      ofType(AuthActions.login),
      switchMap(() =>
        from(authService.login()).pipe(
          map(() => {
            return AuthActions.loginSuccess();
          }),
          catchError((error) =>
            of(AuthActions.loginFailure({ error: error.message }))
          )
        )
      )
    );
  },
  { functional: true }
);

export const logoutEffects = createEffect(
  (actions$ = inject(Actions), authService = inject(AuthService)) => {
    return actions$.pipe(
      ofType(AuthActions.logout),
      switchMap(() =>
        from(authService.logout()).pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError((error) =>
            of(AuthActions.logoutFailure({ error: error.message }))
          )
        )
      )
    );
  },
  { functional: true }
);

export const getCurrentUserEffects = createEffect(
  (actions$ = inject(Actions), authService = inject(AuthService)) => {
    return actions$.pipe(
      ofType(AuthActions.getCurrentUser),
      switchMap((action) =>
        from(authService.getCurrentUser(action.idToken)).pipe(
          map((user) => AuthActions.getCurrentUserSuccess({ user })),
          catchError((error) =>
            of(AuthActions.getCurrentUserFailure({ error: error.message }))
          )
        )
      )
    );
  },
  { functional: true }
);

export const getMineProfileEffects = createEffect(
  (actions$ = inject(Actions), authService = inject(AuthService)) => {
    return actions$.pipe(
      ofType(AuthActions.getMineProfile),
      switchMap((action) =>
        from(authService.getMineProfile(action.idToken)).pipe(
          map((mineProfile) => AuthActions.getMineProfileSuccess({ mineProfile })),
          catchError((error) =>
            of(AuthActions.getMineProfileFailure({ error: error.message }))
          )
        )
      )
    );
  },
  { functional: true }
);

export const updateProfileEffects = createEffect(
  (actions$ = inject(Actions), authService = inject(AuthService)) => {
    return actions$.pipe(
      ofType(AuthActions.updateProfile),
      switchMap((action) =>
        from(authService.updateProfile(action.UserId, action.updateData)).pipe(
          map((updateProfile) => AuthActions.updateProfileSuccess({ updateProfile })),
          catchError((error) =>
            of(AuthActions.updateProfileFailure({ error: error.message }))
            )
          )
        )
      )
    },{ functional: true }
  );
