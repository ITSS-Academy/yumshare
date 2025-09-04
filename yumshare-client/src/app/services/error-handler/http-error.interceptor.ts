import { HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

export const httpErrorInterceptor = (request: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const snackBar = inject(MatSnackBar);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      handleHttpError(error, snackBar);
      return throwError(() => error);
    })
  );
};

const handleHttpError = (error: HttpErrorResponse, snackBar: MatSnackBar): void => {
  let message = 'Network error occurred. Please try again.';

  if (error.error instanceof ErrorEvent) {
    // Client-side error
    message = `Client error: ${error.error.message}`;
  } else {
    // Server-side error
    message = getServerErrorMessage(error);
  }

  showErrorSnackBar(message, snackBar);
};

const getServerErrorMessage = (error: HttpErrorResponse): string => {
  const status = error.status;

  switch (status) {
    case 400:
      return error.error?.message || 'Bad request. Please check your input.';
    case 401:
      return 'Authentication required. Please log in.';
    case 403:
      return 'Access denied. You don\'t have permission.';
    case 404:
      return 'Resource not found.';
    case 409:
      return 'Conflict occurred. Please try again.';
    case 422:
      return error.error?.message || 'Validation failed.';
    case 429:
      return 'Too many requests. Please wait and try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
      return 'Bad gateway. Please try again later.';
    case 503:
      return 'Service unavailable. Please try again later.';
    case 504:
      return 'Gateway timeout. Please try again.';
    default:
      return `Unexpected error (${status}). Please try again.`;
  }
};

const showErrorSnackBar = (message: string, snackBar: MatSnackBar): void => {
  snackBar.open(message, 'Close', {
    duration: 6000,
    panelClass: ['error-snackbar'],
    horizontalPosition: 'center',
    verticalPosition: 'top'
  });
};
