import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn = signal(!!localStorage.getItem('token'));
  currentUser = signal<any>(JSON.parse(localStorage.getItem('user') || 'null'));
  
  private router = inject(Router);
  private http = inject(HttpClient);

  login(email: string, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.http.post<any>(`${environment.apiUrl}/admin/login`, { email, password })
        .subscribe({
          next: (res) => {
            if (res.success && res.data.token) {
              localStorage.setItem('token', res.data.token);
              localStorage.setItem('user', JSON.stringify(res.data.user));
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

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }
}
