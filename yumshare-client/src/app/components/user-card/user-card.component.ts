import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface UserCardData {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  isFollowing: boolean;
}

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-card">
      <div class="user-avatar">
        <img 
          [src]="user.avatar" 
          [alt]="user.name"
          (error)="onAvatarError($event)"
          class="avatar-image"
        >
      </div>
      <div class="user-info">
        <h4 class="user-name">{{ user.name }}</h4>
        <p class="user-bio">{{ user.bio }}</p>
      </div>
      <div class="user-actions" *ngIf="showFollowButton">
        <button 
          class="follow-btn"
          [class.following]="user.isFollowing"
          (click)="onFollowToggle()"
        >
          {{ user.isFollowing ? 'Following' : 'Follow' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .user-card {
      display: flex;
      align-items: center;
      padding: 12px;
      border-radius: 8px;
      background: var(--surface-color);
      border: 1px solid var(--border-color);
      transition: all 0.2s ease;
    }

    .user-card:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }

    .user-avatar {
      margin-right: 12px;
    }

    .avatar-image {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-info {
      flex: 1;
    }

    .user-name {
      margin: 0 0 4px 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .user-bio {
      margin: 0;
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.4;
    }

    .user-actions {
      margin-left: 12px;
    }

    .follow-btn {
      padding: 6px 12px;
      border-radius: 16px;
      border: 1px solid var(--primary-color);
      background: transparent;
      color: var(--primary-color);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .follow-btn:hover {
      background: var(--primary-color);
      color: white;
    }

    .follow-btn.following {
      background: var(--primary-color);
      color: white;
    }

    .follow-btn.following:hover {
      background: var(--error-color);
      border-color: var(--error-color);
    }
  `]
})
export class UserCardComponent {
  @Input() user!: UserCardData;
  @Input() showFollowButton: boolean = true;

  onAvatarError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiNFNUU3RUIiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTIgMTJDMTRuMjEgMCAyNC0xMy4yIDI0LTEzLjJTMjIgMTIgMTIgMTJDMTAuMzQgMTIgMCAxMy4yIDAgMTMuMlM5LjY2IDEyIDEyIDEyWiIgZmlsbD0iIzk5OTk5OSIvPgo8cGF0aCBkPSJNMTIgMTJDMTAuMzQgMTIgMCAxMy4yIDAgMTMuMlM5LjY2IDEyIDEyIDEyQzE0LjIxIDEyIDI0IDEzLjIgMjQgMTMuMlMxMy42NiAxMiAxMiAxMloiIGZpbGw9IiM5OTk5OTkiLz4KPC9zdmc+Cjwvc3ZnPgo=';
  }

  onFollowToggle() {
    this.user.isFollowing = !this.user.isFollowing;
  }
}
