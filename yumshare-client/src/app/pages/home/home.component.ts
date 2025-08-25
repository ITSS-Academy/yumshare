
import { Component } from '@angular/core';

import { ShareModule } from '../../shares/share.module';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ShareModule
  
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {}
