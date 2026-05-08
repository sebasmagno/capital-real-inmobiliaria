import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin';
import { ConfigService } from '../../../core/services/config';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-settings.html',
})
export class AdminSettings implements OnInit {
  private adminService = inject(AdminService);
  private configService = inject(ConfigService);
  private toastService = inject(ToastService);

  companyName = signal('');
  contactEmail = signal('');
  phone = signal('');
  address = signal('');
  facebookUrl = signal('');
  instagramUrl = signal('');
  twitterUrl = signal('');
  businessHours = signal('');
  
  selectedFile: File | null = null;
  logoPreview = signal<string | null>(null);
  isSaving = signal(false);
  isLoading = signal(true);
  apiUrl = environment.apiUrl;

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.adminService.getSettings().subscribe({
      next: (res) => {
        setTimeout(() => {
          if (res.success && res.data) {
            const s = res.data;
            this.companyName.set(s.companyName);
            this.contactEmail.set(s.contactEmail);
            this.phone.set(s.phone);
            this.address.set(s.address);
            this.facebookUrl.set(s.facebookUrl || '');
            this.instagramUrl.set(s.instagramUrl || '');
            this.twitterUrl.set(s.twitterUrl || '');
            this.businessHours.set(s.businessHours || 'Lunes a Viernes, 9am - 6pm');
            if (s.logoUrl) {
              const fullLogoUrl = s.logoUrl.startsWith('http') ? s.logoUrl : `${this.apiUrl}${s.logoUrl}`;
              this.logoPreview.set(fullLogoUrl);
            }
          }
          this.isLoading.set(false);
        }, 800);
      },
      error: (err) => {
        this.isLoading.set(false);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  saveSettings() {
    this.isSaving.set(true);
    
    const formData = new FormData();
    formData.append('companyName', this.companyName());
    formData.append('contactEmail', this.contactEmail());
    formData.append('phone', this.phone());
    formData.append('address', this.address());
    formData.append('facebookUrl', this.facebookUrl());
    formData.append('instagramUrl', this.instagramUrl());
    formData.append('twitterUrl', this.twitterUrl());
    formData.append('businessHours', this.businessHours());
    
    if (this.selectedFile) {
      formData.append('logo', this.selectedFile);
    }

    this.adminService.updateSettings(formData).subscribe({
      next: (res) => {
        setTimeout(() => {
          if (res.success) {
            this.configService.loadSettings();
            this.toastService.success('Configuración guardada correctamente');
          }
          this.isSaving.set(false);
        }, 600);
      },
      error: (err) => {
        this.toastService.error('Error al guardar la configuración');
        this.isSaving.set(false);
      }
    });
  }
}
