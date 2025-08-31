import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Auth, signInWithPopup, GoogleAuthProvider} from '@angular/fire/auth';
import { AuthModel } from '../../models/auth.model';
import { environment } from '../../../environments/environment';
  
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
}