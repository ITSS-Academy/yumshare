import { Component } from '@angular/core';
import {NavBarComponent} from '../../components/nav-bar/nav-bar.component';
import {SideBarComponent} from '../../components/side-bar/side-bar.component';
import {ShareModule} from '../../shares/share.module';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DeleteConfirmDialogComponent} from '../../components/delete-confirm-dialog/delete-confirm-dialog.component';
import {MatDialog} from '@angular/material/dialog';

// import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  imports: [
    NavBarComponent,
    SideBarComponent,
    ShareModule

  ],
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  profileForm: FormGroup;
  showPassword = false;
  introduce = "I’m master chef";

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      name: ['Michael Wilson', Validators.required],
      location: ['Ho chi Minh, Vietnam'],
      email: ['michaelwilson12@gmail.com', [Validators.required, Validators.email]],
      language: ['Vietnam'],
      password: ['******************', Validators.required],
      phone: ['(+84)123456789']
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  editIntroduce() {
    const newIntro = prompt("Enter your introduce:", this.introduce);
    if (newIntro !== null) {
      this.introduce = newIntro;
    }
  }

  onSubmit() {
    if (this.profileForm.valid) {
      console.log(this.profileForm.value);
      alert('Profile saved!');
    }
  }

  onCancel() {
    this.profileForm.reset({
      name: 'Michael Wilson',
      location: 'Ho chi Minh, Vietnam',
      email: 'michaelwilson12@gmail.com',
      language: 'Vietnam',
      password: '******************',
      phone: '(+84)123456789'
    });
  }

}
