import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ShareModule } from '../../shared/share.module';
import { Store } from '@ngrx/store';
import { AuthState } from '../../ngrx/auth/auth.state';
import { AuthModel } from '../../models/auth.model';
import * as AuthActions from '../../ngrx/auth/auth.actions';
import * as FollowActions from '../../ngrx/follow/follow.actions';
import { Subscription } from 'rxjs';
import { Auth } from '@angular/fire/auth';
// NGX-TRANSLATE
import { TranslateService } from '@ngx-translate/core';
// import { TranslateModule } from '@ngx-translate/core';
import { TranslatePipe } from '@ngx-translate/core';
@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [
   ShareModule,
   RouterModule,
    TranslatePipe,
   
  
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
    private auth: Auth,
    private translate: TranslateService
  ) {
    translate.addLangs(['en', 'vi']);
  }
  
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
  
 switchLang(lang: string) {
    this.translate.use(lang);
  }
  async onLogout() {
    try {
      // Đăng xuất khỏi Firebase trước
      await this.auth.signOut();
      // Sau đó clear auth state và follow state
      this.store.dispatch(AuthActions.clearAuthState());
      this.store.dispatch(FollowActions.clearFollowState());
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Logout error:', error);
      // Nếu có lỗi, vẫn clear auth state và follow state
      this.store.dispatch(AuthActions.clearAuthState());
      this.store.dispatch(FollowActions.clearFollowState());
      this.router.navigate(['/home']);
    }
  }
}
