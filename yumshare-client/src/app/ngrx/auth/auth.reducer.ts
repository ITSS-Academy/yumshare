import {AuthState} from '../auth/auth.state';
import {AuthModel} from '../../models/auth.model';
import { createReducer, on} from '@ngrx/store';
import * as AuthActions from '../auth/auth.actions';
import { User } from '../../models';

export const initialState: AuthState = {
  currentUser: <AuthModel>{},
  mineProfile: <User>{},
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
      ...state,
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
  }),

  on(AuthActions.getMineProfile, (state,{type}) =>{
    console.log(type);
    return {
      ...state,
      isLoading: true,
      error: null
    }
  }),

  on(AuthActions.getMineProfileSuccess, (state,{type,mineProfile}) =>{
    console.log(type);
    return {
      ...state,
      mineProfile: mineProfile,
      isLoading: false,
      error: null
    }
  }),

  on(AuthActions.getMineProfileFailure, (state,{type,error}) =>{
    console.log(type);
    return {
      ...state,
      isLoading: false,
      error: error
    }
  }),
  on(AuthActions.updateProfile, (state,{type}) =>{
    console.log(type);
    return {
      ...state,
      isLoading: true,
      error: null
    }
  }),
  on(AuthActions.updateProfileSuccess, (state,{type,updateProfile}) =>{
    console.log(type);
    return {
      ...state,
      mineProfile: updateProfile,
      isLoading: false,
      error: null
    }
  }),
  on(AuthActions.updateProfileFailure, (state,{type,error}) =>{
    console.log(type);
    return {
      ...state,
      isLoading: false,
      error: error
    }
  })
);