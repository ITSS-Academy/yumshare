import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { SideBarComponent } from '../../components/side-bar/side-bar.component';
import { LoadingComponent } from '../../components/loading/loading.component';
import { ShareModule } from '../../shared/share.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DeleteConfirmDialogComponent } from '../../components/delete-confirm-dialog/delete-confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { AuthService } from '../../services/auth/auth.service';
import { FollowService } from '../../services/follow/follow.service';
import { User } from '../../models';
import { AuthState } from '../../ngrx/auth/auth.state';
import { FollowState } from '../../ngrx/follow/follow.state';
import * as AuthActions from '../../ngrx/auth/auth.actions';
import * as FollowActions from '../../ngrx/follow/follow.actions';
import * as FollowSelectors from '../../ngrx/follow/follow.selectors';
import { TranslatePipe } from '@ngx-translate/core';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  imports: [
    ShareModule,
    LoadingComponent,
    ScrollingModule,
    TranslatePipe
  ],
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private followService = inject(FollowService);
  private store = inject(Store<{ auth: AuthState; follow: FollowState }>);
  private snackBar = inject(MatSnackBar);

  // Virtual scrolling properties
  followItemSize = 60; // Height of each follow item

  // NgRx Observables
  mineProfile$: Observable<User>;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;

  // Follow Observables
  followers$!: Observable<any>;
  following$!: Observable<any>;
  followerCount$!: Observable<number | null>;
  followingCount$!: Observable<number | null>;
  followIsLoading$!: Observable<boolean>;
  followError$!: Observable<string | null>;

  // Form and UI state
  profileForm: FormGroup;
  showDialog = false;
  introduce = "I'm master chef";
  avatarUrl: string | null = 'https://via.placeholder.com/80';
  activeTab: 'followers' | 'following' = 'followers';
  currentUserId: string | null = null;
  isEditingBio = false;
  isUploadingAvatar = false;

  // Pagination state
  currentFollowersPage = 1;
  currentFollowingPage = 1;
  hasMoreFollowers = true;
  hasMoreFollowing = true;
  isLoadingMore = false;

  // Subscriptions management
  private subscriptions: Subscription[] = [];
  


  constructor(private fb: FormBuilder) {
    // Initialize NgRx observables
    this.mineProfile$ = this.store.select(state => state.auth.mineProfile);
    this.isLoading$ = this.store.select(state => state.auth.isLoading);
    this.error$ = this.store.select(state => state.auth.error);

    // Initialize Follow observables
    this.followers$ = this.store.select(FollowSelectors.selectFollowersData);
    this.following$ = this.store.select(FollowSelectors.selectFollowingData);
    this.followerCount$ = this.store.select(FollowSelectors.selectFollowerCount);
    this.followingCount$ = this.store.select(FollowSelectors.selectFollowingCount);
    this.followIsLoading$ = this.store.select(FollowSelectors.selectIsLoading);
    this.followError$ = this.store.select(FollowSelectors.selectError);

    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      location: ['Ho chi Minh, Vietnam'],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });
  }
 

  async ngOnInit() {
    this.loadProfile();
    this.subscribeToProfileChanges();
    await this.getCurrentUserId();
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];

    //clear auth state
    // this.store.dispatch(AuthActions.clearAuthState());
    
    // Clear follow state
    this.store.dispatch(FollowActions.clearFollowState());
  }
  async loadProfile() {
    try {
      const idToken = await this.authService.getCurrentIdToken();
      if (idToken) {
        this.store.dispatch(AuthActions.getMineProfile({ idToken }));
      }
    } catch (error) {
      this.showError('Failed to load profile');
    }
  }

  private async getCurrentUserId() {
    const firebaseUid = await this.authService.getCurrentUserId();
    
    try {
      const idToken = await this.authService.getCurrentIdToken();
      if (idToken) {
        return new Promise<void>((resolve) => {
          const profileSubscription = this.authService.getMineProfile(idToken).subscribe({
            next: (profile) => {
              if (profile && profile.id) {
                this.currentUserId = profile.id;
                setTimeout(() => this.loadFollowData(), 100);
              } else {
                this.currentUserId = firebaseUid;
                if (this.currentUserId) {
                  setTimeout(() => this.loadFollowData(), 100);
                }
              }
              resolve();
            },
            error: (error) => {
              this.currentUserId = firebaseUid;
              if (this.currentUserId) {
                setTimeout(() => this.loadFollowData(), 100);
              }
              resolve();
            }
          });
          
          // Add subscription to array (will be cleaned up in ngOnDestroy)
          this.subscriptions.push(profileSubscription);
        });
      } else {
        this.currentUserId = firebaseUid;
        if (this.currentUserId) {
          setTimeout(() => this.loadFollowData(), 100);
        }
      }
    } catch (error) {
      this.currentUserId = firebaseUid;
      if (this.currentUserId) {
        setTimeout(() => this.loadFollowData(), 100);
      }
    }
  }

  private subscribeToProfileChanges() {
    // Subscribe to profile changes
    const profileSubscription = this.mineProfile$.subscribe(profile => {
      if (profile && Object.keys(profile).length > 0) {
        // Update form with real profile data
        this.profileForm.patchValue({
          name: profile.username || '',
          email: profile.email || '',
          location: 'Ho chi Minh, Vietnam',
          phone: profile.phone || ''
        });

        // Update avatar and bio
        if (profile.avatar_url) {
          this.avatarUrl = profile.avatar_url;
        }
        this.introduce = profile.bio || "I'm master chef";

        // Set currentUserId and load follow data when profile is loaded
        if (profile.id && !this.currentUserId) {
          this.currentUserId = profile.id;
          setTimeout(() => this.loadFollowData(), 100);
        }
      }
    });

    // Subscribe to auth errors
    const authErrorSubscription = this.error$.subscribe(error => {
      if (error) {
        this.showError(error);
      }
    });

    // Subscribe to follow errors
    const followErrorSubscription = this.followError$.subscribe(error => {
      if (error) {
        this.showError(error);
      }
    });

    // Add all subscriptions to the array
    this.subscriptions.push(profileSubscription, authErrorSubscription, followErrorSubscription);
  }

  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.showError('Please select a valid image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        this.showError('Image size must be less than 5MB');
        return;
      }
      
      // Show preview immediately
      this.avatarUrl = URL.createObjectURL(file);
      
      // Upload avatar
      this.uploadAvatar(file);
    }
  }

  onSelectAvatar() {
    const input = document.getElementById('avatar-input') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  private async uploadAvatar(file: File) {
    this.isUploadingAvatar = true;
    const formData = new FormData();
    formData.append('avatar', file);
    
    try {
      // Get current user ID and token
      const idToken = await this.authService.getCurrentIdToken();
      if (!idToken) {
        this.showError('Authentication required. Please login again.');
        this.isUploadingAvatar = false;
        return;
      }

      this.mineProfile$.subscribe(profile => {
        if (profile?.id) {
          this.authService.uploadAvatar(profile.id, formData, idToken).subscribe({
            next: (updatedUser) => {
              // Update the profile in store
              this.store.dispatch(AuthActions.updateProfileSuccess({ updateProfile: updatedUser }));
              this.showSuccess('Avatar updated successfully');
              this.isUploadingAvatar = false;
            },
            error: (error) => {
              console.error('Avatar upload error:', error);
              this.showError('Failed to upload avatar. Please try again.');
              // Reset to original avatar on error
              this.mineProfile$.subscribe(profile => {
                this.avatarUrl = profile?.avatar_url || 'https://via.placeholder.com/80';
              });
              this.isUploadingAvatar = false;
            }
          });
        }
      }).unsubscribe();
    } catch (error) {
      console.error('Error getting auth token:', error);
      this.showError('Authentication error. Please login again.');
      this.isUploadingAvatar = false;
    }
  }

  deleteAccount() {
    this.showDialog = false;
    // TODO: Implement delete account functionality
    this.showSuccess('Account deletion requested');
  }

  toggleBioEdit() {
    this.isEditingBio = !this.isEditingBio;
    if (this.isEditingBio) {
      // Focus on the textarea when enabling edit mode
      setTimeout(() => {
        const textarea = document.querySelector('.bio-input') as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
        }
      }, 100);
    }
  }

  startEditBio() {
    this.isEditingBio = true;
  }

  stopEditBio() {
    // Keep editing mode active when clicking on the textarea
    // Only disable when clicking outside or pressing escape
  }

  // Handle keyboard events for bio editing
  onBioKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.isEditingBio = false;
    }
  }

  private updateBio(newBio: string) {
    if (this.currentUserId) {
      const updateData: Partial<User> = {
        bio: newBio
      };
      this.store.dispatch(AuthActions.updateProfile({ UserId: this.currentUserId, updateData }));
      // Success message will be shown when NGRX success action is dispatched
    }
  }

  // Method to handle bio changes (can be called when bio is updated separately)
  onBioChange() {
    // Bio will be updated when form is submitted
    // This method can be used for real-time updates if needed
  }

  onSubmit() {
    if (this.profileForm.valid && this.currentUserId) {
      const formValue = this.profileForm.value;
      
      // Prepare update data - only include fields that exist in User model
      const updateData: Partial<User> = {
        username: formValue.name,
        email: formValue.email,
        phone: formValue.phone,
        bio: this.introduce,
        avatar_url: this.avatarUrl || undefined
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof User] === undefined || updateData[key as keyof User] === null) {
          delete updateData[key as keyof User];
        }
      });

      // Dispatch update action
      this.store.dispatch(AuthActions.updateProfile({ 
        UserId: this.currentUserId, 
        updateData 
      }));

      // Success message will be shown when NGRX success action is dispatched
    } else {
      this.showError('Please fill in all required fields');
    }
  }

  onCancel() {
    // Reset form to current profile data
    this.mineProfile$.subscribe(profile => {
      if (profile && Object.keys(profile).length > 0) {
        this.profileForm.patchValue({
          name: profile.username || '',
          email: profile.email || '',
          location: 'Ho chi Minh, Vietnam',
          phone: profile.phone || ''
        });
      } else {
        this.profileForm.reset({
          name: '',
          location: 'Ho chi Minh, Vietnam',
          email: '',
          phone: ''
        });
      }
    });

    // Reset avatar and bio
    this.mineProfile$.subscribe(profile => {
      if (profile && profile.avatar_url) {
        this.avatarUrl = profile.avatar_url;
      } else {
        this.avatarUrl = 'https://via.placeholder.com/80';
      }
      
      // Always use profile bio, fallback to default if empty
      this.introduce = profile?.bio || "I'm master chef";
    });
  }

  setActiveTab(tab: 'followers' | 'following') {
    this.activeTab = tab;
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }

  // Follow methods
  private loadFollowData() {
    if (this.currentUserId) {
      // Load follower count
      this.store.dispatch(FollowActions.getFollowerCount({
        userId: this.currentUserId
      }));

      // Load following count
      this.store.dispatch(FollowActions.getFollowingCount({
        userId: this.currentUserId
      }));

      // Load followers
      this.store.dispatch(FollowActions.getFollowers({
        userId: this.currentUserId,
        page: 1,
        limit: 10
      }));

      // Load following
      this.store.dispatch(FollowActions.getFollowing({
        userId: this.currentUserId,
        page: 1,
        limit: 10
      }));
    }
  }

  // Method to load followers when tab is clicked
  loadFollowers() {
    if (this.currentUserId) {
      this.currentFollowersPage = 1;
      this.hasMoreFollowers = true;
      this.store.dispatch(FollowActions.getFollowers({
        userId: this.currentUserId,
        page: 1,
        limit: 10
      }));
    }
  }

  // Method to load following when tab is clicked
  loadFollowing() {
    if (this.currentUserId) {
      this.currentFollowingPage = 1;
      this.hasMoreFollowing = true;
      this.store.dispatch(FollowActions.getFollowing({
        userId: this.currentUserId,
        page: 1,
        limit: 10
      }));
    }
  }

  // Method to load more followers
  loadMoreFollowers() {
    if (this.currentUserId && this.hasMoreFollowers && !this.isLoadingMore) {
      this.isLoadingMore = true;
      this.currentFollowersPage++;
      this.store.dispatch(FollowActions.getFollowers({
        userId: this.currentUserId,
        page: this.currentFollowersPage,
        limit: 10
      }));
    }
  }

  // Method to load more following
  loadMoreFollowing() {
    if (this.currentUserId && this.hasMoreFollowing && !this.isLoadingMore) {
      this.isLoadingMore = true;
      this.currentFollowingPage++;
      this.store.dispatch(FollowActions.getFollowing({
        userId: this.currentUserId,
        page: this.currentFollowingPage,
        limit: 10
      }));
    }
  }

  // Method to follow a user
  followUser(targetUserId: string) {
    if (this.currentUserId) {
      this.store.dispatch(FollowActions.followUser({
        followerId: this.currentUserId,
        followingId: targetUserId
      }));
      
      // Reload following count after follow (wait for API call to complete)
      setTimeout(() => {
        this.store.dispatch(FollowActions.getFollowingCount({
          userId: this.currentUserId!
        }));
      }, 500); // Wait 0.5 seconds for follow to complete
    }
  }

  // Method to unfollow a user
  unfollowUser(targetUserId: string) {
    if (this.currentUserId) {
      this.store.dispatch(FollowActions.unfollowUser({
        followerId: this.currentUserId,
        followingId: targetUserId
      }));
      
      // Reload following list and count after unfollow (wait for API call to complete)
      setTimeout(() => {
        if (this.activeTab === 'following') {
          this.loadFollowing();
        }
        // Also reload following count
        this.store.dispatch(FollowActions.getFollowingCount({
          userId: this.currentUserId!
        }));
      }, 500); // Wait 0.5 seconds for unfollow to complete
    }
  }

  // TrackBy functions for virtual scrolling performance
  trackByFollowId(index: number, follow: any): string {
    return follow.id || `${index}-${follow.follower?.id || follow.following?.id}`;
  }
}