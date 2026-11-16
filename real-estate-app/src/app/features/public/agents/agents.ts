import { Component, inject, OnInit, signal } from '@angular/core';
import { AdminService, User } from '../../../core/services/admin';
import { SeoService } from '../../../core/services/seo.service';
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
  private seoService = inject(SeoService);
  
  agents = signal<User[]>([]);
  isLoading = signal(true);
  apiUrl = environment.apiUrl;

  ngOnInit() {
    this.seoService.setPageSEO({
      title: 'Equipo de Asesores Inmobiliarios | CAPITAL REAL INMOBILIARIA Pereira',
      description: 'Conoce a nuestro equipo de asesores inmobiliarios expertos en Pereira y el Eje Cafetero. Te brindamos asesoría confiable para comprar, vender o arrendar tu propiedad.',
      keywords: 'asesores inmobiliarios pereira, agentes de bienes raices pereira, capital real asesores',
      url: '/agentes'
    });

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
