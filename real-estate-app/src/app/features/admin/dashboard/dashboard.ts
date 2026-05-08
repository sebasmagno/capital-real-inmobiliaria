import { Component, inject, OnInit, signal } from '@angular/core';
import { AdminService, DashboardStats } from '../../../core/services/admin';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../core/services/toast.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private adminService = inject(AdminService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  
  stats = signal<DashboardStats | null>(null);
  isLoading = signal(true);
  apiUrl = environment.apiUrl.replace('/api', ''); // Base URL for images

  ngOnInit() {
    this.fetchStats();
  }

  fetchStats() {
    this.adminService.getStats().subscribe({
      next: (res) => {
        setTimeout(() => {
          if (res.success) {
            console.log('[Dashboard] Stats received:', res.data);
            this.stats.set(res.data);
          }
          this.isLoading.set(false);
        }, 800);
      },
      error: (err) => {
        console.error('Error fetching stats:', err);
        this.toastService.error('No se pudieron cargar las estadísticas del dashboard.');
        this.isLoading.set(false);
      }
    });
  }

  navigateTo(path: string) {
    console.log('[Dashboard] Navigating to:', path);
    this.router.navigate([path]);
  }

  getStatusCount(status: string): number {
    const item = this.stats()?.propertiesByStatus.find(s => s.status === status);
    return item ? item._count._all : 0;
  }

  getMaxCount(): number {
    const distribution = this.stats()?.monthlyDistribution || [];
    if (distribution.length === 0) return 0;
    return Math.max(...distribution.map(d => d.count));
  }
}
