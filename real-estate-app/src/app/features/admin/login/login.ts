import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);

  email = signal('');
  password = signal('');
  errorMessage = signal('');
  isLoading = signal(false);

  async onLogin() {
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Por favor completa todos los campos.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      await this.authService.login(this.email(), this.password());
    } catch (err: any) {
      this.errorMessage.set(err);
    } finally {
      this.isLoading.set(false);
    }
  }
}
