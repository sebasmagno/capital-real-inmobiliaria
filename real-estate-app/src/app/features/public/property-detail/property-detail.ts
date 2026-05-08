import { Component, inject, signal, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Title, Meta } from '@angular/platform-browser';
import { PropertyService, Property } from '../../../core/services/property';
import { ToastService } from '../../../core/services/toast.service';
import { ConfigService } from '../../../core/services/config';
import { environment } from '../../../../environments/environment';

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
  private titleService = inject(Title);
  private metaService = inject(Meta);
  
  // Recibimos el ID directamente del Router mediante un input de señal
  id = input.required<string>();
  
  property = signal<Property | null>(null);
  selectedImageIndex = signal<number | null>(null);
  isSending = signal(false);
  apiUrl = environment.apiUrl;

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
          this.updateSEO(res.data);
        }
      },
      error: (err) => console.error('Error cargando propiedad', err)
    });
  }

  private updateSEO(p: Property) {
    const title = `${p.title} en ${p.location} | CAPITAL REAL`;
    const description = `${p.type} en ${p.status} con ${p.bedrooms} habitaciones y ${p.bathrooms} baños. Precio: ${p.price}.`;
    
    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });
    
    // Open Graph
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    if (p.images && p.images.length > 0) {
      const imageUrl = p.images[0].url.startsWith('http') ? p.images[0].url : this.apiUrl.replace('/api', '') + p.images[0].url;
      this.metaService.updateTag({ property: 'og:image', content: imageUrl });
    }
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

  contactViaWhatsApp() {
    const p = this.property();
    const companyPhone = this.configService.settings().phone;

    if (!p) return;

    // Limpiamos el teléfono (quitamos espacios, guiones, etc)
    const cleanPhone = companyPhone.replace(/\D/g, '');
    
    let message = '';
    const formData = this.contactForm.value;

    // Si el formulario es válido, enviamos mensaje completo. 
    // Si no, enviamos uno genérico para no bloquear al usuario.
    if (this.contactForm.valid) {
      message = encodeURIComponent(
        `Hola, mi nombre es ${formData.name}.\n` +
        `Me interesa la propiedad: *${p.title}*\n` +
        `Ubicación: ${p.location}\n` +
        `Mensaje: ${formData.message}\n` +
        `Mis datos:\n` +
        `- Email: ${formData.email}\n` +
        `- Teléfono: ${formData.phone}`
      );
    } else {
      message = encodeURIComponent(
        `Hola, me interesa la propiedad: *${p.title}*\n` +
        `Ubicación: ${p.location}\n\n` +
        `Me gustaría recibir más información.`
      );
    }

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;

    // Abrimos WhatsApp en una nueva pestaña
    window.open(whatsappUrl, '_blank');
    
    this.toastService.success('Abriendo WhatsApp...');
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
