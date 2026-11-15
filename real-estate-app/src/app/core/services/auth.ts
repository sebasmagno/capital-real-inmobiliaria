import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private http = inject(HttpClient);

  isLoggedIn = signal(false);
  currentUser = signal<any>(null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkAuth();
    }
  }

  checkAuth(): boolean {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return false;
    }
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && !this.isTokenExpired(token)) {
      this.isLoggedIn.set(true);
      try {
        this.currentUser.set(userStr ? JSON.parse(userStr) : null);
      } catch {
        this.currentUser.set(null);
      }
      return true;
    } else {
      if (token) {
        // El token existe pero ya expiró: limpiar automáticamente y devolver a la página pública
        this.logout('/');
      } else {
        this.isLoggedIn.set(false);
        this.currentUser.set(null);
      }
      return false;
    }
  }

  isTokenExpired(tokenToCheck?: string | null): boolean {
    const token = tokenToCheck !== undefined ? tokenToCheck : (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null);
    if (!token) return true;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) return false;
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  login(email: string, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.http.post<any>(`${environment.apiUrl}/admin/login`, { email, password })
        .subscribe({
          next: (res) => {
            if (res.success && res.data.token) {
              if (typeof localStorage !== 'undefined') {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
              }
              this.isLoggedIn.set(true);
              this.currentUser.set(res.data.user);
              this.router.navigate(['/admin/dashboard']);
              resolve(true);
            } else {
              reject('Error en respuesta');
            }
          },
          error: (err) => {
            console.error('Error de login:', err);
            reject(err.error?.error || 'Credenciales inválidas');
          }
        });
    });
  }

  logout(redirectTo: string = '/') {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
    this.router.navigate([redirectTo]);
  }
}
