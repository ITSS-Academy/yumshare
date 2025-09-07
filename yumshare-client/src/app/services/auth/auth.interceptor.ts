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
  
  // Check if this is a public endpoint
  const isPublicEndpoint = publicEndpoints.some(endpoint => 
    request.url.includes(endpoint)
  );
  
  // If it's a public endpoint, proceed without authentication
  if (isPublicEndpoint) {
    console.log('🔓 Auth Interceptor - Public endpoint, proceeding without auth:', request.url);
    return next(request);
  }
  
  // For protected endpoints, require authentication
  return store.select('auth').pipe(
    // Đợi cho đến khi có token hoặc user
    filter(authState => {
      const hasToken = !!(authState.idToken && authState.idToken.length > 0);
      const hasUser = !!(authState.currentUser && authState.currentUser.uid);
      return hasToken || hasUser; // Đợi ít nhất 1 trong 2
    }),
    take(1),
    switchMap(authState => {
      console.log('🔐 Auth Interceptor - Protected endpoint, checking auth:', request.url);
      
      if (authState.idToken && authState.idToken.length > 0) {
        const authReq = request.clone({
          setHeaders: {
            Authorization: authState.idToken // Gửi token trực tiếp, không có Bearer
          }
        });
        console.log('🔐 Auth Interceptor - Adding token to protected request');
        return next(authReq);
      }
      
      console.log('🔐 Auth Interceptor - No token for protected endpoint, proceeding without auth');
      return next(request);
    })
  );
};
