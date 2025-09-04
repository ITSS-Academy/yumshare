import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DarkModeService {
  private readonly THEME_KEY = 'yumshare-theme';
  private readonly DARK_CLASS = 'dark';

  // Signal-based state management (Angular 17+)
  private _isDarkMode = signal<boolean>(this.loadThemeFromStorage());

  // Observable for backward compatibility
  private darkModeSubject = new BehaviorSubject<boolean>(this._isDarkMode());
  darkMode$ = this.darkModeSubject.asObservable();

  // Computed signal for reactive updates
  isDarkMode = computed(() => this._isDarkMode());

  constructor() {
    this.applyTheme(this._isDarkMode());
  }

  toggleDarkMode(): void {
    const newValue = !this._isDarkMode();
    this._isDarkMode.set(newValue);
    this.darkModeSubject.next(newValue);
    this.saveThemeToStorage(newValue);
    this.applyTheme(newValue);
  }

  setDarkMode(enabled: boolean): void {
    if (this._isDarkMode() !== enabled) {
      this._isDarkMode.set(enabled);
      this.darkModeSubject.next(enabled);
      this.saveThemeToStorage(enabled);
      this.applyTheme(enabled);
    }
  }

  private loadThemeFromStorage(): boolean {
    try {
      const stored = localStorage.getItem(this.THEME_KEY);
      if (stored) {
        return JSON.parse(stored);
      }

      // Check system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  }

  private saveThemeToStorage(isDark: boolean): void {
    try {
      localStorage.setItem(this.THEME_KEY, JSON.stringify(isDark));
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }

  private applyTheme(isDark: boolean): void {
    const documentElement = document.documentElement;

    if (isDark) {
      documentElement.classList.add(this.DARK_CLASS);
    } else {
      documentElement.classList.remove(this.DARK_CLASS);
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#1a1a1a' : '#ffffff');
    }
  }

  // Listen to system theme changes
  initSystemThemeListener(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    mediaQuery.addEventListener('change', (event) => {
      // Only auto-switch if user hasn't set a preference
      const hasUserPreference = localStorage.getItem(this.THEME_KEY) !== null;

      if (!hasUserPreference) {
        this.setDarkMode(event.matches);
      }
    });
  }
}
