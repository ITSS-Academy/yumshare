import {AuthModel} from '../../models/auth.model';

export interface AuthState {
  currentUser: AuthModel;
  idToken: string;
  isLoading: boolean;
  error: any;
}