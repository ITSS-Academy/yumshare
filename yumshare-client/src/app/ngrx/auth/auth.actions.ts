import {createAction, props} from '@ngrx/store';
import {AuthModel} from '../../models/auth.model';
import { User } from '../../models';

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

export const getCurrentUser = createAction(
  '[Auth] Get Current User',
  props<{idToken: string}>()
)

export const getCurrentUserSuccess = createAction(
  '[Auth] Get Current User Success',
  props<{user: AuthModel}>()
)
export const getCurrentUserFailure = createAction(
  '[Auth] Get Current User Failure',
  props<{error: any}>()
)

export const getMineProfile = createAction(
  '[Auth] Get Mine Profile',
  props<{idToken: string}>()
)
export const getMineProfileSuccess = createAction(
  '[Auth] Get Mine Profile Success',
  props<{mineProfile: User}>()
)
export const getMineProfileFailure = createAction(
  '[Auth] Get Mine Profile Failure',
  props<{error: any}>()
)

export const updateProfile = createAction(
  '[Auth] Update Profile',
  props<{UserId: string, updateData: Partial<User>}>()
)
export const updateProfileSuccess = createAction(
  '[Auth] Update Profile Success',
  props<{updateProfile: User}>()
)
export const updateProfileFailure = createAction(
  '[Auth] Update Profile Failure',
  props<{error: any}>()
)

