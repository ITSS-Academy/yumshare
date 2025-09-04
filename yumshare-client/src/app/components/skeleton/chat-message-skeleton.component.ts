import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-message-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="message-skeleton-container">
      <!-- Received message skeleton -->
      <div class="message-item received">
        <div class="message-content">
          <div class="avatar-skeleton skeleton"></div>
          <div class="message-bubble-skeleton">
            <div class="text-line skeleton"></div>
            <div class="text-line skeleton" style="width: 70%;"></div>
          </div>
        </div>
        <div class="message-time-skeleton skeleton"></div>
      </div>

      <!-- Sent message skeleton -->
      <div class="message-item sent">
        <div class="message-content">
          <div class="message-bubble-skeleton">
            <div class="text-line skeleton"></div>
            <div class="text-line skeleton" style="width: 60%;"></div>
            <div class="text-line skeleton" style="width: 80%;"></div>
          </div>
        </div>
        <div class="message-time-skeleton skeleton"></div>
      </div>

      <!-- Another received message skeleton -->
      <div class="message-item received">
        <div class="message-content">
          <div class="avatar-skeleton skeleton"></div>
          <div class="message-bubble-skeleton">
            <div class="text-line skeleton"></div>
            <div class="text-line skeleton" style="width: 90%;"></div>
          </div>
        </div>
        <div class="message-time-skeleton skeleton"></div>
      </div>
    </div>
  `,
  styles: [`
    .message-skeleton-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
    }

    .message-item {
      display: flex;
      margin-bottom: 8px;
      animation: fadeIn 0.5s ease-in-out;
    }

    .message-item.received {
      justify-content: flex-start;
    }

    .message-item.sent {
      justify-content: flex-end;
    }

    .message-content {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      max-width: 70%;
    }

    .message-item.sent .message-content {
      flex-direction: row-reverse;
    }

    .avatar-skeleton {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .message-bubble-skeleton {
      padding: 12px 16px;
      border-radius: 18px;
      background: var(--surface, #ffffff);
      border: 1px solid var(--border, #e0e0e0);
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 120px;
    }

    .message-item.sent .message-bubble-skeleton {
      background: var(--primary, #8DC63F);
      border-color: var(--primary-dark, #7FC520);
      border-radius: 18px 18px 4px 18px;
    }

    .message-item.received .message-bubble-skeleton {
      background: var(--surface, #ffffff);
      border-color: var(--border, #e0e0e0);
      border-radius: 18px 18px 18px 4px;
    }

    .text-line {
      height: 14px;
      border-radius: 2px;
    }

    .message-time-skeleton {
      width: 60px;
      height: 12px;
      margin-top: 4px;
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

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Dark mode support */
    .dark .skeleton {
      background: linear-gradient(90deg, #424242 25%, #616161 50%, #424242 75%);
      background-size: 200% 100%;
    }

    .dark .message-item.sent .message-bubble-skeleton {
      background: var(--primary-lighter, #e8f5d8);
      border-color: var(--primary, #8DC63F);
    }
  `]
})
export class ChatMessageSkeletonComponent {}
