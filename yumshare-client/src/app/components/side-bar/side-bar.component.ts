import { Component, Output, EventEmitter } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
// Removed unused Angular Material imports to prevent conflicts and reduce bundle size
import { ShareModule } from '../../shares/share.module';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [
   ShareModule,
   RouterModule
  ],
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent {
  constructor(private router: Router) {}
  
  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
