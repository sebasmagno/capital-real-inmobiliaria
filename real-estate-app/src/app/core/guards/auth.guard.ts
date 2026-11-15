import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // En el servidor (SSR), dejamos pasar para que el navegador resuelva con su localStorage
  if (isPlatformServer(platformId)) {
    return true;
  }

  // En el navegador comprobamos autenticación y vigencia del token
  if (authService.checkAuth()) {
    return true;
  }

  // Si no está logueado o el token expiró, expulsar a la página principal pública
  authService.logout('/');
  return router.parseUrl('/');
};
