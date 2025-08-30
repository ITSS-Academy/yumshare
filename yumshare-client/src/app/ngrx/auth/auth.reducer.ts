import {AuthState} from '../auth/auth.state';
import {AuthModel} from '../../models/auth.model';
import { createReducer, on} from '@ngrx/store';
import * as AuthActions from '../auth/auth.actions';

export const initialState: AuthState = {
  currentUser: <AuthModel>{},
  idToken: '',
  isLoading: false,
  error: null
}

export const authReducer = createReducer(
  initialState,

  on(AuthActions.login, (state,{type}) =>{
    console.log(type);
    return {
      ...state,
      isLoading: true,
      error: null
    }
  }),

  on(AuthActions.storeCurrentUser, (state,{idToken,currentUser,type}) =>{
    console.log(type);
    return {
      ...state,
      currentUser: currentUser,
      idToken: idToken,
      isLoading: false,
      error: null
    }
  }),

  on(AuthActions.loginFailure, (state,{type, error}) =>{
    console.log(type);
    console.log(error)
    return {
      ...state,
      isLoading: false,
      error: error
    }
  }),

  on(AuthActions.loginSuccess, (state,{type}) =>{
    console.log(type);
    return {
      ...state,
      isLoading: false,
      error: null
    }
  }),

  on(AuthActions.logout, (state,{type}) =>{
    console.log(type);
    return {
      ...state,
      isLoading: true,
      error: null
    }
  }),

  on(AuthActions.logoutSuccess, (state,{type}) =>{
    console.log(type);
    return {
      currentUser: <AuthModel>{},
      idToken: '',
      isLoading: false,
      error: null
    }
  }),

  on(AuthActions.logoutFailure, (state, {error, type}) => {
    console.log(type);
    return {
      ...state,
      isLoading: false,
      error: error
    }
  }),

  on(AuthActions.clearAuthState, (state,{type})=>{
    console.log(type);
    return {
      ...state,
      currentUser: <AuthModel>{},
      idToken: '',
      isLoading: false,
      error: null
    }
  })
);