import { Injectable, signal } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RouteLoadingService {
  private _isLoading = signal(false);
  private _loadingProgress = signal(0);

  // Public signals for components to bind to
  isLoading = this._isLoading.asReadonly();
  loadingProgress = this._loadingProgress.asReadonly();

  constructor(private router: Router) {
    this.setupRouteLoadingListener();
  }

  private setupRouteLoadingListener(): void {
    let progressInterval: any;

    this.router.events.pipe(
      filter(event =>
        event instanceof NavigationStart ||
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      )
    ).subscribe(event => {
      if (event instanceof NavigationStart) {
        this._isLoading.set(true);
        this._loadingProgress.set(0);

        // Simulate loading progress
        progressInterval = setInterval(() => {
          const current = this._loadingProgress();
          if (current < 80) {
            this._loadingProgress.set(current + Math.random() * 15);
          }
        }, 100);

      } else if (event instanceof NavigationEnd) {
        this._loadingProgress.set(100);
        setTimeout(() => {
          this._isLoading.set(false);
          this._loadingProgress.set(0);
        }, 200);

        if (progressInterval) {
          clearInterval(progressInterval);
        }

      } else if (event instanceof NavigationCancel || event instanceof NavigationError) {
        this._isLoading.set(false);
        this._loadingProgress.set(0);

        if (progressInterval) {
          clearInterval(progressInterval);
        }
      }
    });
  }

  // Method to manually set loading state (useful for data loading)
  setLoading(loading: boolean, progress?: number): void {
    this._isLoading.set(loading);
    if (progress !== undefined) {
      this._loadingProgress.set(progress);
    }
  }

  // Method to update progress manually
  updateProgress(progress: number): void {
    this._loadingProgress.set(Math.min(100, Math.max(0, progress)));
  }
}
