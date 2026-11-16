import { Component, inject, signal, input, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PropertyService, Property } from '../../../core/services/property';
import { LeadService } from '../../../core/services/lead';
import { ToastService } from '../../../core/services/toast.service';
import { ConfigService } from '../../../core/services/config';
import { SeoService } from '../../../core/services/seo.service';
import { environment } from '../../../../environments/environment';
import { PropertyMap } from '../../../shared/components/property-map/property-map';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, PropertyMap],
  templateUrl: './property-detail.html',
  styleUrl: './property-detail.css'
})
export class PropertyDetail implements OnDestroy {
  private propertyService = inject(PropertyService);
  private leadService = inject(LeadService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  public configService = inject(ConfigService);
  private seoService = inject(SeoService);
  private sanitizer = inject(DomSanitizer);
  
  // Recibimos el ID directamente del Router mediante un input de señal
  id = input.required<string>();
  
  property = signal<Property | null>(null);
  selectedImageIndex = signal<number | null>(null);
  isSending = signal(false);
  inquirySent = signal(false);
  apiUrl = environment.apiUrl;
  minDate = new Date().toISOString().split('T')[0];

  contactForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    preferredDate: [''],
    message: ['Hola, me gustaría tener más información sobre esta propiedad...', [Validators.required]]
  });

  constructor() {
    // Reaccionamos automáticamente cuando el ID cambia
    effect(() => {
      const currentId = this.id();
      this.loadProperty(currentId);
    });
  }

  getSafeVideoEmbedUrl(rawUrl?: string | null): SafeResourceUrl | null {
    if (!rawUrl || !rawUrl.trim()) return null;
    const url = rawUrl.trim();
    let embedUrl = url;

    // Convertir URL de YouTube estándar o corta a formato embed
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/);
    if (ytMatch && ytMatch[1]) {
      embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  getSafeVirtualTourUrl(rawUrl?: string | null): SafeResourceUrl | null {
    if (!rawUrl || !rawUrl.trim()) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl.trim());
  }

  printTechnicalSheet() {
    window.print();
  }

  shareProperty() {
    const p = this.property();
    const shareUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        this.toastService.success('¡Enlace de la ficha copiado al portapapeles!');
      });
    } else if (p) {
      this.toastService.info(`Comparte: ${shareUrl}`);
    }
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

  ngOnDestroy(): void {
    this.seoService.removeJsonLd('property-detail-jsonld');
  }

  private updateSEO(p: Property) {
    const formattedPrice = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(p.price);

    const refCode = p.code ? ` (Ref: ${p.code})` : '';
    const title = `${p.title} en ${p.status} en ${p.location}${refCode}`;
    const description = `${p.type} en ${p.status} en ${p.location}. ${p.bedrooms} habitaciones, ${p.bathrooms} baños, ${p.area} m² área. Precio: ${formattedPrice}. ¡Agenda tu visita con CAPITAL REAL!`;
    const keywords = `${p.type} en ${p.status} pereira, inmuebles en ${p.location}, casas apartamentos pereira, capital real inmobiliaria`;
    const url = `/propiedades/${p.id}`;

    let imageUrl = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9';
    if (p.images && p.images.length > 0) {
      imageUrl = p.images[0].url.startsWith('http') ? p.images[0].url : this.apiUrl.replace('/api', '') + p.images[0].url;
    }

    this.seoService.setPageSEO({
      title,
      description,
      keywords,
      url,
      image: imageUrl,
      type: 'product'
    });

    // Inyectar Schema.org JSON-LD para Google Rich Results
    const allImages = p.images?.map(img => img.url.startsWith('http') ? img.url : this.apiUrl.replace('/api', '') + img.url) || [imageUrl];
    const schemaType = p.type === 'Apartamento' ? 'Apartment' : (p.type === 'Casa' ? 'SingleFamilyResidence' : 'RealEstateListing');

    this.seoService.setJsonLd({
      '@context': 'https://schema.org',
      '@type': schemaType,
      'name': p.title,
      'description': p.description || description,
      'url': `https://www.capitalrealinmobiliaria.com/propiedades/${p.id}`,
      'image': allImages,
      'numberOfBedrooms': p.bedrooms,
      'numberOfBathroomsTotal': p.bathrooms,
      'floorSize': {
        '@type': 'QuantitativeValue',
        'value': p.area,
        'unitCode': 'MTK'
      },
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': p.location,
        'addressRegion': 'Risaralda',
        'addressCountry': 'CO'
      },
      ...(p.latitude && p.longitude ? {
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': p.latitude,
          'longitude': p.longitude
        }
      } : {}),
      'offers': {
        '@type': 'Offer',
        'price': p.price,
        'priceCurrency': 'COP',
        'availability': 'https://schema.org/InStock',
        'validFrom': p.createdAt
      }
    }, 'property-detail-jsonld');
  }

  sendInquiry() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.toastService.error('Por favor, completa todos los campos requeridos correctamente.');
      return;
    }

    const formData = this.contactForm.value;
    const p = this.property();

    if (!p) return;

    this.isSending.set(true);

    this.leadService.createLead({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
      preferredDate: formData.preferredDate || null,
      propertyId: p.id,
      source: 'WEB_PROPIEDAD'
    }).subscribe({
      next: () => {
        this.isSending.set(false);
        this.inquirySent.set(true);
        this.toastService.success(
          formData.preferredDate
            ? '¡Solicitud y agenda de visita registradas con éxito!'
            : '¡Solicitud registrada! Nuestro asesor te contactará pronto.'
        );
        this.contactForm.reset({
          name: '',
          email: '',
          phone: '',
          preferredDate: '',
          message: 'Hola, me gustaría tener más información sobre esta propiedad...'
        });
      },
      error: (err) => {
        this.isSending.set(false);
        this.toastService.error(err.error?.error || 'No se pudo enviar la solicitud. Intenta de nuevo.');
      }
    });
  }

  contactViaWhatsApp() {
    const p = this.property();
    const companyPhone = this.configService.settings().phone;

    if (!p) return;

    // Limpiamos el teléfono (quitamos espacios, guiones, etc)
    const cleanPhone = companyPhone.replace(/\D/g, '');
    
    let message = '';
    const formData = this.contactForm.value;

    // Si el usuario completó datos en el formulario, registramos también el Lead en el CRM
    if (formData.name && (formData.email || formData.phone)) {
      this.leadService.createLead({
        name: formData.name,
        email: formData.email || 'sin-correo@whatsapp.local',
        phone: formData.phone || '',
        message: formData.message || `Contacto vía WhatsApp por ${p.title}`,
        preferredDate: formData.preferredDate || null,
        propertyId: p.id,
        source: 'WHATSAPP_PROPIEDAD'
      }).subscribe({ error: () => {} });
    }

    const rawMessage = formData.message?.trim();
    const customMessage = rawMessage || 'Hola, me interesa recibir más información sobre esta propiedad.';
    
    let messageText = `Hola, me interesa la propiedad: *${p.title}*`;
    if (p.code) {
      messageText += ` (Ref: ${p.code})`;
    }
    messageText += `\nUbicación: ${p.location}`;

    if (formData.name?.trim()) {
      messageText = `Hola, mi nombre es *${formData.name.trim()}*.\n` + messageText;
    }

    if (formData.preferredDate) {
      messageText += `\nFecha tentativa de visita: ${formData.preferredDate}`;
    }

    messageText += `\n\nMensaje: ${customMessage}`;

    if (formData.phone?.trim() || formData.email?.trim()) {
      messageText += `\n\nMis datos de contacto:`;
      if (formData.phone?.trim()) messageText += `\n- Tel: ${formData.phone.trim()}`;
      if (formData.email?.trim()) messageText += `\n- Email: ${formData.email.trim()}`;
    }

    message = encodeURIComponent(messageText);

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
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
