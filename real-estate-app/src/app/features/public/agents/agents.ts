import { Component, inject, OnInit, signal } from '@angular/core';
import { AdminService, User } from '../../../core/services/admin';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';

import { SkeletonAgent } from '../../../shared/components/skeleton-agent/skeleton-agent';

@Component({
  selector: 'app-agents',
  standalone: true,
  imports: [CommonModule, SkeletonAgent],
  templateUrl: './agents.html',
  styleUrl: './agents.css',
})
export class Agents implements OnInit {
  private adminService = inject(AdminService);
  
  agents = signal<User[]>([]);
  isLoading = signal(true);
  apiUrl = environment.apiUrl;

  ngOnInit() {
    this.adminService.getPublicAgents().subscribe({
      next: (res) => {
        if (res.success) {
          this.agents.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading public agents:', err);
        this.isLoading.set(false);
      }
    });
  }
}
