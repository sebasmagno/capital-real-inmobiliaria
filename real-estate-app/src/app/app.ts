import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { AuthService } from './core/services/auth';
import { ConfigService } from './core/services/config';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ToastService } from './core/services/toast.service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  authService = inject(AuthService);
  configService = inject(ConfigService);
  toastService = inject(ToastService);
  private router = inject(Router);
  
  showPublicUI = signal(true);
  apiUrl = 'http://localhost:3000';
  currentYear = new Date().getFullYear();

  constructor() {
    this.configService.loadSettings();
    this.toastService.success('Sistema de Notificaciones Activo');
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects;
      this.showPublicUI.set(!url.includes('/admin') && !url.includes('/login'));
    });
  }
}
