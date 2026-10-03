import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  //simple
  // const token = localStorage.getItem('access_token');

  // if (token) {
  //   const authReq = req.clone({
  //     setHeaders: {
  //       Authorization: `Bearer ${token}`
  //     }
  //   });

  //   return next(authReq);
  // }

  // return next(req);

  //advanced-handeling token expiry 401 errors
  const router = inject(Router);
  const token = localStorage.getItem('access_token');
  const isAuthRequest = req.url.endsWith('/auth/login') || req.url.endsWith('/auth/register');
  const authReq = token && !isAuthRequest
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthRequest) {
        localStorage.removeItem('access_token');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
