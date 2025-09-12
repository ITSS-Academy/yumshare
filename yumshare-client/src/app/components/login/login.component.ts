import { Component } from '@angular/core';
import { ShareModule } from '../../shared/share.module';
import { trigger, transition, style, animate } from '@angular/animations';
import { Store } from '@ngrx/store';
import { AuthState } from '../../ngrx/auth/auth.state';
import * as AuthActions from '../../ngrx/auth/auth.actions';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ShareModule, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  animations: [
    trigger('dialogAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('250ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.8)' }))
      ])
    ])
  ]
})
export class LoginComponent {
  constructor(
    private store: Store<{auth: AuthState}>,
    private dialogRef: MatDialogRef<LoginComponent>
  ) {}

  onGoogleLogin() {
    this.store.dispatch(AuthActions.login());
    // Dialog sẽ tự động đóng khi user Login thành công
    // thông qua auth state change trong app.component.ts
  }
}
