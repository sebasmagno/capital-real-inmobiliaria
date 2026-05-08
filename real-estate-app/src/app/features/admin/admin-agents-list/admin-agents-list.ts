import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, User } from '../../../core/services/admin';
import { ToastService } from '../../../core/services/toast.service';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-agents-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-agents-list.html',
})
export class AdminAgentsList implements OnInit {
  private adminService = inject(AdminService);
  private toastService = inject(ToastService);
  
  agents = signal<User[]>([]);
  isLoading = signal(true);
  apiUrl = environment.apiUrl;

  ngOnInit() {
    this.loadAgents();
  }

  loadAgents() {
    this.adminService.getUsers().subscribe({
      next: (res) => {
        setTimeout(() => {
          if (res.success) {
            this.agents.set(res.data);
          }
          this.isLoading.set(false);
        }, 800);
      },
      error: (err) => {
        console.error('Error loading agents:', err);
        this.isLoading.set(false);
      }
    });
  }

  deleteAgent(id: string) {
    if (confirm('¿Estás seguro de eliminar este agente?')) {
      this.adminService.deleteUser(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastService.success('Agente eliminado correctamente');
            this.loadAgents();
          }
        },
        error: (err) => {
          this.toastService.error(err.error?.error || 'Error al eliminar agente');
        }
      });
    }
  }
}
