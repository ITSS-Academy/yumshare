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
  
  return store.select('auth').pipe(
    // Đợi cho đến khi có token hoặc user
    filter(authState => {
      const hasToken = !!(authState.idToken && authState.idToken.length > 0);
      const hasUser = !!(authState.currentUser && authState.currentUser.uid);
      return hasToken || hasUser; // Đợi ít nhất 1 trong 2
    }),
    take(1),
    switchMap(authState => {
      // console.log('🔐 Auth Interceptor - Token:', authState.idToken ? 'Present' : 'Missing');
      // console.log('🔐 Auth Interceptor - Token length:', authState.idToken?.length || 0);
      
      if (authState.idToken && authState.idToken.length > 0) {
        const authReq = request.clone({
          setHeaders: {
            Authorization: authState.idToken // Gửi token trực tiếp, không có Bearer
          }
        });
        // console.log('🔐 Auth Interceptor - Adding token to request');
        return next(authReq);
      }
      
      // console.log('🔐 Auth Interceptor - No token, proceeding without auth');
      return next(request);
    })
  );
};
