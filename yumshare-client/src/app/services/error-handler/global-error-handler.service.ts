import { ErrorHandler, Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandler implements ErrorHandler {
  private snackBar = inject(MatSnackBar);

  handleError(error: any): void {
    console.error('Global Error Handler:', error);

    // Don't show snackbar for certain types of errors to avoid spam
    if (this.shouldIgnoreError(error)) {
      this.logError(error);
      return;
    }

    let message = 'An unexpected error occurred. Please try again.';

    if (error instanceof HttpErrorResponse) {
      message = this.getHttpErrorMessage(error);
    } else if (error instanceof Error) {
      message = error.message;
    }

    // Show user-friendly error message
    this.showErrorSnackBar(message);

    // In production, you would send error to logging service
    this.logError(error);
  }

  private shouldIgnoreError(error: any): boolean {
    // Ignore common Angular template errors that are not user-facing
    if (error?.message?.includes('newCollection[Symbol.iterator]')) {
      return true;
    }
    
    // Ignore network errors that are already handled
    if (error?.message?.includes('Network Error')) {
      return true;
    }

    // Ignore errors from specific components or services
    if (error?.stack?.includes('add-recipe.component')) {
      return true;
    }

    return false;
  }

  private getHttpErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication failed. Please log in again.';
      case 403:
        return 'Access denied. You don\'t have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'Conflict occurred. Please try again.';
      case 422:
        return 'Validation failed. Please check your input.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return `Network error (${error.status}). Please check your connection.`;
    }
  }

  private showErrorSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  private logError(error: any): void {
    // In production, send to error logging service like Sentry, LogRocket, etc.
    const errorData = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // For development, just log to console (but limit spam)
    if (!this.shouldIgnoreError(error)) {
      console.error('Error logged:', errorData);
    }

    // Example: Send to logging service
    // this.loggingService.logError(errorData);
  }
}
