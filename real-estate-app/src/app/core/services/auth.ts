import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn = signal(!!localStorage.getItem('token'));
  
  private router = inject(Router);
  private http = inject(HttpClient);

  login(email: string, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.http.post<any>(`${environment.apiUrl}/admin/login`, { email, password })
        .subscribe({
          next: (res) => {
            if (res.success && res.data.token) {
              localStorage.setItem('token', res.data.token);
              this.isLoggedIn.set(true);
              this.router.navigate(['/admin/properties']);
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

  logout() {
    localStorage.removeItem('token');
    this.isLoggedIn.set(false);
    this.router.navigate(['/']);
  }
}
