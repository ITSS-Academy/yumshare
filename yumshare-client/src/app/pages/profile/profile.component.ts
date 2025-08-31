import { Component } from '@angular/core';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { SideBarComponent } from '../../components/side-bar/side-bar.component';
import { ShareModule } from '../../shares/share.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DeleteConfirmDialogComponent } from '../../components/delete-confirm-dialog/delete-confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

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
  showDialog = false;
  introduce = "I’m master chef";
  avatarUrl: string | null = 'https://via.placeholder.com/80';
  activeTab: 'followers' | 'following' = 'followers';
  followers: any[] = [
    { name: 'John Doe', avatar: 'https://via.placeholder.com/40', bio: 'Software Engineer' },
    { name: 'Jane Smith', avatar: 'https://via.placeholder.com/40', bio: 'Graphic Designer' },
    { name: 'Emily Johnson', avatar: 'https://via.placeholder.com/40', bio: 'Content Creator' }
  ];
  following: any[] = [
    { name: 'Alice Brown', avatar: 'https://via.placeholder.com/40', bio: 'Photographer' },
    { name: 'Bob Davis', avatar: 'https://via.placeholder.com/40', bio: 'Entrepreneur' }
  ];

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      name: ['Michael Wilson', Validators.required],
      location: ['Ho chi Minh, Vietnam'],
      email: ['michaelwilson12@gmail.com', [Validators.required, Validators.email]],
      phone: ['(+84)123456789']
    });
  }

  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.avatarUrl = URL.createObjectURL(file);
    }
  }

  deleteAccount() {
    this.showDialog = false;
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
      phone: '(+84)123456789'
    });
    this.avatarUrl = 'https://via.placeholder.com/80';
  }

  setActiveTab(tab: 'followers' | 'following') {
    this.activeTab = tab;
  }
}
