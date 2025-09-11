import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, timer, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { AuthState } from '../../ngrx/auth/auth.state';
import { take, switchMap, filter, timeout, catchError } from 'rxjs/operators';

export const authInterceptor = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const store = inject(Store<{auth: AuthState}>);
  
  // Define public endpoints that don't require authentication
  const publicEndpoints = [
    '/categories',           // HomeComponent - load categories
    '/recipes',              // HomeComponent - load recipes, SearchComponent - search
    '/recipes/search'        // SearchComponent - search recipes
  ];
  
  // Define endpoints that require authentication
  const protectedEndpoints = [
    '/recipes/:id/check-edit-permission'
  ];
  
  // Check if this is a public endpoint
  const isPublicEndpoint = publicEndpoints.some(endpoint => 
    request.url.includes(endpoint)
  );
  
  // Check if this is a protected endpoint
  const isProtectedEndpoint = protectedEndpoints.some(endpoint => 
    request.url.includes('/check-edit-permission') // Check for the actual endpoint pattern
  );
  
  // Debug log for specific endpoints if needed
  if (request.url.includes('check-edit-permission')) {
    // Debug logging for check-edit-permission endpoint
  }
  
  // If it's a public endpoint, proceed without authentication
  if (isPublicEndpoint) {
    return next(request);
  }
  
  // For protected endpoints, require authentication
  if (isProtectedEndpoint) {
    return store.select('auth').pipe(
      take(1),
      switchMap(authState => {
        const hasToken = !!(authState.idToken && authState.idToken.length > 0);
        if (!hasToken) {
          // Return the request without token - let the backend handle the 401
          return next(request);
        }
        
        const authReq = request.clone({
          setHeaders: {
            Authorization: authState.idToken // Gửi token trực tiếp, không có Bearer
          }
        });
        return next(authReq);
      })
    );
  }
  
  // For other endpoints, try to add token if available
  return store.select('auth').pipe(
    take(1),
    switchMap(authState => {
      if (authState.idToken && authState.idToken.length > 0) {
        const authReq = request.clone({
          setHeaders: {
            Authorization: `Bearer ${authState.idToken}`
          }
        });
        return next(authReq);
      }
      return next(request);
    })
  );
};
