import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DarkModeService } from '../../services/dark-mode/dark-mode.service';

@Component({
  selector: 'app-dark-mode-toggle',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <button
      mat-icon-button
      [matTooltip]="tooltipText()"
      (click)="toggleDarkMode()"
      class="dark-mode-toggle"
      [attr.aria-label]="ariaLabelText()"
    >
      <mat-icon>{{ iconName() }}</mat-icon>
    </button>
  `,
  styles: [`
    .dark-mode-toggle {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 50%;
    }

    .dark-mode-toggle:hover {
      background-color: var(--surface-hover);
      transform: scale(1.1);
    }

    .dark-mode-toggle mat-icon {
      transition: transform 0.3s ease;
    }

    .dark-mode-toggle:active mat-icon {
      transform: scale(0.9);
    }
  `]
})
export class DarkModeToggleComponent {
  private darkModeService = inject(DarkModeService);

  // Computed signals for reactive updates
  isDarkMode = computed(() => this.darkModeService.isDarkMode());

  iconName = computed(() => this.isDarkMode() ? 'light_mode' : 'dark_mode');

  tooltipText = computed(() =>
    this.isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode'
  );

  ariaLabelText = computed(() =>
    this.isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode'
  );

  toggleDarkMode(): void {
    this.darkModeService.toggleDarkMode();
  }
}
