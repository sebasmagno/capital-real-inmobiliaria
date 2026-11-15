import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocurrió un error inesperado';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        if (error.status === 401) {
          errorMessage = 'Sesión expirada o no autorizada. Redirigiendo a la página principal...';
          // Limpiar datos de autenticación caducados
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
          // Redirigir a la página principal pública
          router.navigate(['/']);
        } else if (error.status === 403) {
          errorMessage = 'No tienes permisos para realizar esta acción';
          if (req.url.includes('/api/admin')) {
            if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }
            router.navigate(['/']);
          }
        } else if (error.status === 404) {
          errorMessage = 'El recurso solicitado no fue encontrado';
        } else {
          errorMessage = error.error?.error || error.message || errorMessage;
        }
      }

      toastService.error(errorMessage);
      return throwError(() => error);
    })
  );
};
