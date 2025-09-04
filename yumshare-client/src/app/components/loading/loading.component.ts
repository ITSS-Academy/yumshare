import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatIconModule],
  template: `
    <div class="loading-container" [ngClass]="size">
      <!-- Spinner -->
      <div class="spinner-wrapper">
        <mat-spinner
          [diameter]="spinnerDiameter"
          [strokeWidth]="strokeWidth"
          class="loading-spinner">
        </mat-spinner>
      </div>

      <!-- Loading text -->
      @if (showText) {
        <div class="loading-text">
          <span>{{ message }}</span>
          @if (showDots) {
            <div class="loading-dots">
              <span>.</span><span>.</span><span>.</span>
            </div>
          }
        </div>
      }

      <!-- Progress bar for route loading -->
      @if (showProgress) {
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="progressValue"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      min-height: 120px;
    }

    .loading-container.small {
      padding: 12px;
      min-height: 60px;
    }

    .loading-container.large {
      padding: 48px;
      min-height: 200px;
    }

    .spinner-wrapper {
      margin-bottom: 16px;
    }

    .loading-spinner {
      --mdc-circular-progress-active-indicator-color: var(--primary, #8DC63F);
    }

    .loading-text {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--text-primary, #333);
      font-size: 14px;
      font-weight: 500;
      text-align: center;
    }

    .loading-dots {
      display: flex;
      gap: 2px;
      margin-left: 4px;
    }

    .loading-dots span {
      animation: dots 1.4s infinite ease-in-out both;
    }

    .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
    .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
    .loading-dots span:nth-child(3) { animation-delay: 0s; }

    @keyframes dots {
      0%, 80%, 100% {
        transform: scale(0);
        opacity: 0.5;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }

    .progress-bar {
      width: 100%;
      max-width: 300px;
      height: 4px;
      background-color: var(--surface-variant, #f5f5f5);
      border-radius: 2px;
      overflow: hidden;
      margin-top: 16px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--primary, #8DC63F), var(--primary-light, #a8d88f));
      border-radius: 2px;
      transition: width 0.3s ease;
    }

    /* Dark mode support */
    .dark .loading-container {
      --mdc-circular-progress-active-indicator-color: var(--primary, #8DC63F);
    }

    .dark .loading-text {
      color: var(--text-primary, #e0e0e0);
    }

    .dark .progress-bar {
      background-color: var(--surface-variant, #424242);
    }

    /* Accessibility */
    @media (prefers-reduced-motion: reduce) {
      .loading-dots span {
        animation: none;
      }

      .progress-fill {
        transition: none;
      }
    }
  `]
})
export class LoadingComponent {
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() message: string = 'Loading';
  @Input() showText: boolean = true;
  @Input() showDots: boolean = true;
  @Input() showProgress: boolean = false;
  @Input() progressValue: number = 0;

  get spinnerDiameter(): number {
    switch (this.size) {
      case 'small': return 32;
      case 'large': return 64;
      default: return 48;
    }
  }

  get strokeWidth(): number {
    switch (this.size) {
      case 'small': return 3;
      case 'large': return 6;
      default: return 4;
    }
  }
}
