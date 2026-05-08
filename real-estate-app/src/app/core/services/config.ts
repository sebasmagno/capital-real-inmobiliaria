import { Injectable, inject, signal } from '@angular/core';
import { AdminService } from './admin';

export interface CompanySettings {
  companyName: string;
  contactEmail: string;
  phone: string;
  address: string;
  logoUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  businessHours: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private adminService = inject(AdminService);
  
  settings = signal<CompanySettings>({
    companyName: 'CAPITAL REAL INMOBILIARIA',
    contactEmail: 'info@capitalreal.com',
    phone: '+57 300 000 0000',
    address: 'Pereira, Risaralda, Colombia',
    businessHours: 'Lunes a Viernes, 9am - 6pm'
  });

  loadSettings() {
    this.adminService.getPublicSettings().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.settings.set(res.data);
        }
      },
      error: (err) => console.error('Error loading global settings:', err)
    });
  }
}
