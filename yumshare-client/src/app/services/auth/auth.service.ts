import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Auth, signInWithPopup, GoogleAuthProvider} from '@angular/fire/auth';
import { AuthModel } from '../../models/auth.model';
import { environment } from '../../../environments/environment';
import { User } from '../../models';
import { Observable } from 'rxjs';
  
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth, private http: HttpClient) { }

  async login() {
    const credential = await signInWithPopup(this.auth, new GoogleAuthProvider());
    return credential.user
  }

  async logout() {
    await this.auth.signOut();
  }

  getCurrentUser(idToken: string) {
    //dùng header : Authorization: Bearer <idToken>
    return this.http.get<AuthModel>(`${environment.apiUrl}/users`, {
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    });
  }



  // Get current user profile
  getMineProfile(idToken: string): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/verify`, {
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    });
  }

  updateProfile(UserId: string, updateData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/users/${UserId}`, updateData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Get current user ID from token
  async getCurrentUserId(): Promise<string | null> {
    const user = this.auth.currentUser;
    return user ? user.uid : null;
  }

  // Get current user ID token
  async getCurrentIdToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    return user ? await user.getIdToken() : null;
  }

  // Upload avatar
  uploadAvatar(userId: string, formData: FormData, idToken: string): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users/${userId}/avatar`, formData, {
      headers: {
        Authorization: `Bearer ${idToken}`
        // Don't set Content-Type, let browser set it with boundary for FormData
      }
    });
  }
}