# Profile Management Guide

## Tổng quan

Hệ thống quản lý profile đã được tích hợp vào component `ProfileComponent` hiện có với các tính năng mới để binding dữ liệu `getMineProfile` và cho phép người dùng sửa đổi thông tin profile.

## Các tính năng mới đã tích hợp

### 1. AuthService Extensions

#### Methods cơ bản:
- `getMineProfile(idToken: string)`: Lấy thông tin profile hiện tại
- `updateProfile(idToken: string, updateData: Partial<User>)`: Cập nhật toàn bộ profile
- `updateAvatar(idToken: string, avatarUrl: string)`: Cập nhật avatar
- `updateBio(idToken: string, bio: string)`: Cập nhật bio
- `updateUsername(idToken: string, username: string)`: Cập nhật username

#### Helper methods (tự động lấy token):
- `getCurrentUserProfile()`: Lấy profile với token tự động
- `updateCurrentUserProfile(updateData)`: Cập nhật profile với token tự động
- `updateCurrentUserAvatar(avatarUrl)`: Cập nhật avatar với token tự động
- `updateCurrentUserBio(bio)`: Cập nhật bio với token tự động
- `updateCurrentUserUsername(username)`: Cập nhật username với token tự động

### 2. NgRx Actions

#### Actions mới:
```typescript
// Update Profile
updateProfile({idToken, updateData})
updateProfileSuccess({updatedProfile})
updateProfileFailure({error})

// Update Avatar
updateAvatar({idToken, avatarUrl})
updateAvatarSuccess({updatedProfile})
updateAvatarFailure({error})

// Update Bio
updateBio({idToken, bio})
updateBioSuccess({updatedProfile})
updateBioFailure({error})

// Update Username
updateUsername({idToken, username})
updateUsernameSuccess({updatedProfile})
updateUsernameFailure({error})

// Get User by ID
getUserById({userId})
getUserByIdSuccess({user})
getUserByIdFailure({error})

// Search Users
searchUsers({searchTerm})
searchUsersSuccess({users})
searchUsersFailure({error})
```

### 3. NgRx Effects

Tất cả actions mới đều có effects tương ứng để xử lý async operations.

### 4. NgRx Reducers

State được cập nhật tự động khi các actions thành công.

## Tích hợp vào ProfileComponent

### Các tính năng đã thêm:

1. **Auto-load profile**: Tự động load profile khi component khởi tạo
2. **Real-time binding**: Form được cập nhật với dữ liệu thực từ backend
3. **Auto-save avatar**: Avatar được lưu tự động khi upload
4. **Auto-save bio**: Bio được lưu tự động khi edit
5. **Form validation**: Validation và error handling
6. **Loading states**: Hiển thị trạng thái loading
7. **Error handling**: Hiển thị lỗi và success messages
8. **Cancel functionality**: Reset form về dữ liệu gốc

### Cách hoạt động:

```typescript
// Trong ProfileComponent
export class ProfileComponent implements OnInit {
  // NgRx Observables
  mineProfile$: Observable<User>;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;

  ngOnInit() {
    this.loadProfile(); // Tự động load profile
    this.subscribeToProfileChanges(); // Subscribe để cập nhật UI
  }

  async loadProfile() {
    const idToken = await this.authService.getCurrentIdToken();
    if (idToken) {
      this.store.dispatch(AuthActions.getMineProfile({ idToken }));
    }
  }

  // Auto-save khi thay đổi avatar
  onAvatarChange(event: Event) {
    // ... xử lý file
    this.updateAvatar(this.avatarUrl); // Auto-save
  }

  // Auto-save khi edit bio
  editIntroduce() {
    const newIntro = prompt("Enter your introduce:", this.introduce);
    if (newIntro !== null) {
      this.introduce = newIntro;
      this.updateBio(newIntro); // Auto-save
    }
  }

  // Save toàn bộ form
  async onSubmit() {
    if (this.profileForm.valid) {
      const updateData: Partial<User> = {
        username: this.profileForm.value.name,
        email: this.profileForm.value.email,
        phone: this.profileForm.value.phone,
        bio: this.introduce
      };
      
      this.store.dispatch(AuthActions.updateProfile({ 
        idToken, 
        updateData 
      }));
    }
  }
}
```

### Template Updates:

```html
<!-- Loading State -->
@if (isLoading$ | async) {
  <div class="loading-state">
    <p>Loading profile...</p>
  </div>
}

<!-- Error State -->
@if (error$ | async; as error) {
  <div class="error-state">
    <p>Error: {{ error }}</p>
  </div>
}

<!-- Profile Content -->
@if (!(isLoading$ | async)) {
  <!-- Form với disabled state khi loading -->
  <button type="submit" [disabled]="profileForm.invalid || (isLoading$ | async)">
    Save
  </button>
}
```

## Cách sử dụng trong component khác

### 1. Trong Component khác

```typescript
import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { AuthService } from '../../services/auth/auth.service';
import * as AuthActions from '../../ngrx/auth/auth.actions';

@Component({...})
export class OtherComponent {
  private authService = inject(AuthService);
  private store = inject(Store);

  // Lấy profile hiện tại
  async loadProfile() {
    const idToken = await this.authService.getCurrentIdToken();
    if (idToken) {
      this.store.dispatch(AuthActions.getMineProfile({ idToken }));
    }
  }

  // Cập nhật profile
  async updateProfile(updateData: Partial<User>) {
    const idToken = await this.authService.getCurrentIdToken();
    if (idToken) {
      this.store.dispatch(AuthActions.updateProfile({ 
        idToken, 
        updateData 
      }));
    }
  }

  // Sử dụng helper method
  async updateAvatar(avatarUrl: string) {
    try {
      const observable = await this.authService.updateCurrentUserAvatar(avatarUrl);
      observable.subscribe({
        next: (updatedUser) => {
          console.log('Avatar updated:', updatedUser);
        },
        error: (error) => {
          console.error('Update failed:', error);
        }
      });
    } catch (error) {
      console.error('No token available');
    }
  }
}
```

### 2. Subscribe to State Changes

```typescript
export class MyComponent {
  mineProfile$ = this.store.select(state => state.auth.mineProfile);
  isLoading$ = this.store.select(state => state.auth.isLoading);
  error$ = this.store.select(state => state.auth.error);

  constructor(private store: Store) {}
}
```

### 3. Template Binding

```html
<div *ngIf="mineProfile$ | async as profile">
  <h2>{{ profile.username }}</h2>
  <p>{{ profile.bio }}</p>
  <img [src]="profile.avatar_url" alt="Avatar">
</div>

<div *ngIf="isLoading$ | async" class="loading">
  Loading...
</div>

<div *ngIf="error$ | async as error" class="error">
  {{ error }}
</div>
```

## Backend Endpoints

Các endpoints cần thiết trên backend:

```
GET /users/verify - Lấy profile hiện tại
PUT /users/profile - Cập nhật profile
PUT /users/avatar - Cập nhật avatar
PUT /users/bio - Cập nhật bio
PUT /users/username - Cập nhật username
GET /users/:id - Lấy user theo ID
GET /users?search=term - Tìm kiếm users
```

## Lưu ý

1. Tất cả requests đều cần `Authorization: Bearer <idToken>` header
2. Helper methods tự động lấy token từ Firebase Auth
3. State được cập nhật tự động qua NgRx
4. Error handling được tích hợp sẵn
5. Loading states được quản lý tự động
6. ProfileComponent đã được tích hợp đầy đủ các tính năng mới

## Ví dụ hoàn chỉnh

Xem file `ProfileComponent` để có ví dụ hoàn chỉnh về cách sử dụng tất cả các tính năng đã được tích hợp.
