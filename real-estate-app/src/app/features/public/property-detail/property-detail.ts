import { Component, inject, signal, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { PropertyService, Property } from '../../../core/services/property';
import { ToastService } from '../../../core/services/toast.service';
import { ConfigService } from '../../../core/services/config';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './property-detail.html',
  styleUrl: './property-detail.css'
})
export class PropertyDetail {
  private propertyService = inject(PropertyService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  public configService = inject(ConfigService);
  
  // Recibimos el ID directamente del Router mediante un input de señal
  id = input.required<string>();
  
  property = signal<Property | null>(null);
  selectedImageIndex = signal<number | null>(null);
  isSending = signal(false);

  contactForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    message: ['Hola, me gustaría tener más información sobre esta propiedad...', [Validators.required]]
  });

  constructor() {
    // Reaccionamos automáticamente cuando el ID cambia
    effect(() => {
      const currentId = this.id();
      this.loadProperty(currentId);
    });
  }

  private loadProperty(id: string) {
    this.propertyService.getPropertyById(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.property.set(res.data);
        }
      },
      error: (err) => console.error('Error cargando propiedad', err)
    });
  }

  sendInquiry() {
    if (this.contactForm.invalid) {
      this.toastService.error('Por favor, completa todos los campos correctamente.');
      return;
    }

    const formData = this.contactForm.value;
    const p = this.property();
    const companyEmail = this.configService.settings().contactEmail;

    if (!p) return;

    this.isSending.set(true);
    
    // Construimos el enlace mailto
    const subject = encodeURIComponent(`Interés en Propiedad: ${p.title}`);
    const body = encodeURIComponent(
      `Hola, mi nombre es ${formData.name}.\n\n` +
      `Estoy interesado en la propiedad "${p.title}" ubicada en ${p.location}.\n\n` +
      `Mensaje: ${formData.message}\n\n` +
      `Mis datos de contacto:\n` +
      `- Email: ${formData.email}\n` +
      `- Teléfono: ${formData.phone}\n\n` +
      `Espero su respuesta. Saludos.`
    );

    const mailtoLink = `mailto:${companyEmail}?subject=${subject}&body=${body}`;

    // Simulamos un pequeño proceso visual antes de abrir el correo
    setTimeout(() => {
      this.isSending.set(false);
      
      // Abrimos el cliente de correo del usuario
      window.location.href = mailtoLink;

      this.toastService.success('Abriendo tu aplicación de correo...');
      
      this.contactForm.reset({
        name: '',
        email: '',
        phone: '',
        message: 'Hola, me gustaría tener más información sobre esta propiedad...'
      });
    }, 800);
  }

  openLightbox(index: number) {
    this.selectedImageIndex.set(index);
    document.body.style.overflow = 'hidden'; 
  }

  closeLightbox() {
    this.selectedImageIndex.set(null);
    document.body.style.overflow = 'auto';
  }

  nextImage(event: Event) {
    event.stopPropagation();
    const p = this.property();
    if (!p || !p.images) return;
    
    const currentIndex = this.selectedImageIndex();
    if (currentIndex !== null) {
      const nextIndex = (currentIndex + 1) % p.images.length;
      this.selectedImageIndex.set(nextIndex);
    }
  }

  prevImage(event: Event) {
    event.stopPropagation();
    const p = this.property();
    if (!p || !p.images) return;
    
    const currentIndex = this.selectedImageIndex();
    if (currentIndex !== null) {
      const prevIndex = (currentIndex - 1 + p.images.length) % p.images.length;
      this.selectedImageIndex.set(prevIndex);
    }
  }
}
