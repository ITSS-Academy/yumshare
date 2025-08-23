import { Component, HostBinding, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideBarComponent } from './components/side-bar/side-bar.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SideBarComponent, NavBarComponent, CommonModule, MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  @HostBinding('class.sidebar-mini') isMini = false;

  constructor() {
    this.updateSidebarMode();
  }

  @HostListener('window:resize') onResize() {
    this.updateSidebarMode();
  }

  private updateSidebarMode() {
    this.isMini = window.innerWidth < 768;
  }
}