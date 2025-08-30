import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ShareModule } from '../../shares/share.module';
import { Store } from '@ngrx/store';
import { AuthState } from '../../ngrx/auth/auth.state';
import { AuthModel } from '../../models/auth.model';
import * as AuthActions from '../../ngrx/auth/auth.actions';
import { Subscription } from 'rxjs';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [
   ShareModule,
   RouterModule
  ],
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  currentUser: AuthModel | null = null;
  private authSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private store: Store<{auth: AuthState}>,
    private auth: Auth
  ) {}
  
  ngOnInit() {
    this.authSubscription = this.store.select(state => state.auth).subscribe(authState => {
      this.isLoggedIn = !!(authState.currentUser && authState.currentUser.uid);
      this.currentUser = authState.currentUser;
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
  
  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  async onLogout() {
    try {
      // Đăng xuất khỏi Firebase trước
      await this.auth.signOut();
      // Sau đó clear auth state
      this.store.dispatch(AuthActions.clearAuthState());
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Logout error:', error);
      // Nếu có lỗi, vẫn clear auth state
      this.store.dispatch(AuthActions.clearAuthState());
      this.router.navigate(['/home']);
    }
  }
}
