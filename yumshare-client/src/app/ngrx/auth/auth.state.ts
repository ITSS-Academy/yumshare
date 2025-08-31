import { User } from '../../models';
import {AuthModel} from '../../models/auth.model';

export interface AuthState {
  currentUser: AuthModel;
  mineProfile: User;
  
  idToken: string;
  isLoading: boolean;
  error: any;
}