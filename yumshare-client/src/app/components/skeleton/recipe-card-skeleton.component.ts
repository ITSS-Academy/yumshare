import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardContent } from "@angular/material/card";
import { ShareModule } from "../../shares/share.module";

@Component({
  selector: 'app-recipe-card-skeleton',
  standalone: true,
  imports: [CommonModule, MatCardContent, ShareModule],
  template: `
    <mat-card class="recipe-card-skeleton" appearance="outlined">
      <!-- Image skeleton -->
      <div class="image-skeleton skeleton"></div>

      <!-- Content skeleton -->
      <mat-card-content class="content-skeleton">
        <!-- Title skeleton -->
        <div class="title-skeleton skeleton"></div>

        <!-- Description skeleton -->
        <div class="description-skeleton">
          <div class="line-skeleton skeleton"></div>
          <div class="line-skeleton skeleton"></div>
          <div class="line-skeleton skeleton" style="width: 60%;"></div>
        </div>

        <!-- Rating skeleton -->
        <div class="rating-skeleton">
          <div class="star-skeleton skeleton"></div>
          <div class="star-skeleton skeleton"></div>
          <div class="star-skeleton skeleton"></div>
          <div class="star-skeleton skeleton"></div>
          <div class="star-skeleton skeleton"></div>
        </div>
      </mat-card-content>

      <!-- Footer skeleton -->
      <mat-card-actions class="footer-skeleton">
        <div class="user-info-skeleton">
          <div class="avatar-skeleton skeleton"></div>
          <div class="username-skeleton skeleton"></div>
        </div>
        <div class="actions-skeleton">
          <div class="icon-skeleton skeleton"></div>
          <div class="icon-skeleton skeleton"></div>
        </div>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .recipe-card-skeleton {
      max-width: 275px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
    }

    .skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 4px;
    }

    @keyframes loading {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }

    .image-skeleton {
      height: 200px;
      width: 100%;
      padding: 16px 16px 0px 16px;
      margin-bottom: 12px;
    }

    .content-skeleton {
      padding: 0 16px;
    }

    .title-skeleton {
      height: 18px;
      width: 80%;
      margin-bottom: 8px;
    }

    .description-skeleton {
      margin-bottom: 12px;
    }

    .line-skeleton {
      height: 14px;
      width: 100%;
      margin-bottom: 6px;
    }

    .rating-skeleton {
      display: flex;
      gap: 4px;
      margin-bottom: 12px;
    }

    .star-skeleton {
      width: 20px;
      height: 20px;
      border-radius: 2px;
    }

    .footer-skeleton {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px 12px;
      border-top: 1px solid #eee;
    }

    .user-info-skeleton {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .avatar-skeleton {
      width: 30px;
      height: 30px;
      border-radius: 50%;
    }

    .username-skeleton {
      width: 80px;
      height: 13px;
    }

    .actions-skeleton {
      display: flex;
      gap: 12px;
    }

    .icon-skeleton {
      width: 20px;
      height: 20px;
      border-radius: 2px;
    }

    /* Dark mode support */
    .dark .skeleton {
      background: linear-gradient(90deg, #424242 25%, #616161 50%, #424242 75%);
      background-size: 200% 100%;
    }
  `]
})
export class RecipeCardSkeletonComponent {}
