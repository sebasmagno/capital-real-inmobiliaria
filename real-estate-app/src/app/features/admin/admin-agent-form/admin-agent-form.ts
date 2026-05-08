import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-agent-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-agent-form.html',
})
export class AdminAgentForm implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  id = signal<string | null>(null);
  name = signal('');
  email = signal('');
  password = signal('');
  role = signal('ADMIN');
  type = signal('Agente');
  phone = signal('');
  bio = signal('');
  selectedFile: File | null = null;
  imagePreview = signal<string | null>(null);
  isSubmitting = signal(false);
  isEditMode = signal(false);
  submitted = signal(false);
  apiUrl = environment.apiUrl;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.id.set(id);
      this.isEditMode.set(true);
      this.loadUser(id);
    }
  }

  loadUser(id: string) {
    this.adminService.getUserById(id).subscribe({
      next: (res) => {
        if (res.success) {
          const user = res.data;
          this.name.set(user.name);
          this.email.set(user.email);
          this.role.set(user.role);
          this.type.set(user.type);
          this.phone.set(user.phone || '');
          this.bio.set(user.bio || '');
          if (user.imageUrl) {
            const fullImageUrl = user.imageUrl.startsWith('http') ? user.imageUrl : `${this.apiUrl.replace('/api', '')}${user.imageUrl}`;
            this.imagePreview.set(fullImageUrl);
          }
        }
      },
      error: (err) => {
        this.toastService.error('Error al cargar datos del usuario');
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    console.log('Submitting form...', { 
      name: this.name(), 
      email: this.email(), 
      isEditMode: this.isEditMode(),
      password: this.password() 
    });
    this.submitted.set(true);
    if (!this.name() || !this.email() || (!this.isEditMode() && !this.password())) {
      this.toastService.warning('Por favor, completa todos los campos obligatorios.');
      return;
    }

    this.isSubmitting.set(true);
    
    const formData = new FormData();
    formData.append('name', this.name());
    formData.append('email', this.email());
    if (this.password()) {
      formData.append('password', this.password());
    }
    formData.append('role', this.role());
    formData.append('type', this.type());
    formData.append('phone', this.phone());
    formData.append('bio', this.bio());
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    const request = this.isEditMode() 
      ? this.adminService.updateUser(this.id()!, formData)
      : this.adminService.createUser(formData);

    request.subscribe({
      next: (res) => {
        console.log('[AdminAgentForm] Response:', res);
        setTimeout(() => {
          this.isSubmitting.set(false);
          this.toastService.success(this.isEditMode() ? 'Miembro actualizado correctamente' : 'Miembro registrado correctamente');
          this.router.navigate(['/admin/agents']);
        }, 600);
      },
      error: (err) => {
        console.error('[AdminAgentForm] Error:', err);
        this.toastService.error(err.error?.error || 'Error al procesar solicitud');
        this.isSubmitting.set(false);
      }
    });
  }
}
