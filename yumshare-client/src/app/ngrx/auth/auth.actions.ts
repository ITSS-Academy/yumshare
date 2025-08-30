import {createAction, props} from '@ngrx/store';
import {AuthModel} from '../../models/auth.model';

export const login = createAction(
  '[Auth] Login',
)

export const loginSuccess = createAction(
  '[Auth] Login Success',
)

export const loginFailure = createAction(
  '[Auth] Login Failure', props<{error: any}>()
);

export const storeCurrentUser = createAction(
  '[Auth] Store Current User', props<{idToken: string, currentUser: AuthModel}>()
)

export const logout = createAction(
  '[Auth] Logout',
)

export const logoutSuccess = createAction(
  '[Auth] Logout Success',
)
export const logoutFailure = createAction(
  '[Auth] Logout Failure', props<{error: any}>()
);



export const clearAuthState = createAction(
  '[Auth] Clear Auth State',
)