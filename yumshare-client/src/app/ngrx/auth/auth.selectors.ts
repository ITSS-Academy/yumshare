import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

// Select current user
export const selectCurrentUser = createSelector(
  selectAuthState,
  (state: AuthState) => state.currentUser
);

// Select mine profile
export const selectMineProfile = createSelector(
  selectAuthState,
  (state: AuthState) => state.mineProfile
);

// Select loading state
export const selectAuthLoading = createSelector(
  selectAuthState,
  (state: AuthState) => state.isLoading
);

// Select error state
export const selectAuthError = createSelector(
  selectAuthState,
  (state: AuthState) => state.error
);

// Select id token
export const selectIdToken = createSelector(
  selectAuthState,
  (state: AuthState) => state.idToken
);

// Select is authenticated
export const selectIsAuthenticated = createSelector(
  selectCurrentUser,
  (user) => !!user
);

// Select user ID
export const selectUserId = createSelector(
  selectCurrentUser,
  (user) => user?.uid
);

// Select username/display name
export const selectUsername = createSelector(
  selectCurrentUser,
  (user) => user?.displayName
);

// Select user email
export const selectUserEmail = createSelector(
  selectCurrentUser,
  (user) => user?.email
);

// Select user avatar
export const selectUserAvatar = createSelector(
  selectCurrentUser,
  (user) => user?.photoURL
);

// Select full name
export const selectUserFullName = createSelector(
  selectCurrentUser,
  (user) => user?.displayName
);

// Select mine profile username
export const selectMineProfileUsername = createSelector(
  selectMineProfile,
  (profile) => profile?.username
);

// Select mine profile avatar
export const selectMineProfileAvatar = createSelector(
  selectMineProfile,
  (profile) => profile?.avatar_url
);

// Select mine profile email
export const selectMineProfileEmail = createSelector(
  selectMineProfile,
  (profile) => profile?.email
);

// Select is authenticated based on mine profile
export const selectIsAuthenticatedByProfile = createSelector(
  selectMineProfile,
  (profile) => !!(profile && profile.id)
);