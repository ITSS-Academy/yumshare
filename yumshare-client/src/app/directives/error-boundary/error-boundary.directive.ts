import { Directive, Input, TemplateRef, ViewContainerRef, ComponentRef, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Directive({
  selector: '[errorBoundary]',
  standalone: true
})
export class ErrorBoundaryDirective {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private snackBar = inject(MatSnackBar);

  // Error state
  hasError = signal(false);
  errorMessage = signal('');

  @Input() set errorBoundary(error: any) {
    if (error) {
      this.handleError(error);
    } else {
      this.clearError();
    }
  }

  private handleError(error: any): void {
    console.error('Error Boundary caught error:', error);

    this.hasError.set(true);
    this.errorMessage.set(error.message || 'An error occurred');

    // Clear previous content
    this.viewContainer.clear();

    // Create error template
    const errorTemplate = `
      <div class="error-boundary" style="
        padding: 16px;
        margin: 16px 0;
        border: 1px solid var(--error, #f44336);
        border-radius: 8px;
        background-color: var(--error-light, #ffebee);
        color: var(--error-dark, #c62828);
        text-align: center;
      ">
        <mat-icon style="font-size: 48px; width: 48px; height: 48px; margin-bottom: 8px;">
          error_outline
        </mat-icon>
        <h3 style="margin: 8px 0; font-size: 18px;">Something went wrong</h3>
        <p style="margin: 8px 0; opacity: 0.8;">${this.errorMessage()}</p>
        <button mat-raised-button color="primary" style="margin-top: 12px;" (click)="retry()">
          Try Again
        </button>
      </div>
    `;

    // Create embedded view with error template
    const context = {
      $implicit: error,
      errorMessage: this.errorMessage(),
      retry: () => this.retry()
    };

    this.viewContainer.createEmbeddedView(this.templateRef, context);
  }

  private clearError(): void {
    this.hasError.set(false);
    this.errorMessage.set('');
    this.viewContainer.clear();
  }

  private retry(): void {
    this.clearError();
    // Re-render the original template
    this.viewContainer.createEmbeddedView(this.templateRef);

    this.snackBar.open('Retrying...', '', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}
