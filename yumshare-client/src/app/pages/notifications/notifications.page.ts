import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationListComponent } from '../../components/notification-list/notification-list.component';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule, NotificationListComponent],
  template: `
    <div class="notifications-page">
      <div class="page-header">
        <h1>Notifications</h1>
        <p>Stay updated with your latest activities and interactions</p>
      </div>
      
      <app-notification-list></app-notification-list>
    </div>
  `,
  styles: [`
    .notifications-page {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px 16px;
    }
    
    .page-header {
      text-align: center;
      margin-bottom: 32px;
      
      h1 {
        font-size: 2.5rem;
        font-weight: 600;
        margin: 0 0 8px 0;
        color: var(--primary);
      }
      
      p {
        font-size: 1.1rem;
        color: var(--mat-text-secondary-color);
        margin: 0;
      }
    }
    
    @media (max-width: 600px) {
      .notifications-page {
        padding: 16px 8px;
      }
      
      .page-header h1 {
        font-size: 2rem;
      }
    }
  `]
})
export class NotificationsPageComponent {}
