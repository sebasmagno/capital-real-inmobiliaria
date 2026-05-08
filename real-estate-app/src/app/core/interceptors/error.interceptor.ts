import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocurrió un error inesperado';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        if (error.status === 401) {
          errorMessage = 'Sesión expirada o no autorizada';
        } else if (error.status === 403) {
          errorMessage = 'No tienes permisos para realizar esta acción';
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
