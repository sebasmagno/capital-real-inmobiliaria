import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PropertyService } from '../../../core/services/property';
import { ToastService } from '../../../core/services/toast.service';
import { PropertyMap } from '../../../shared/components/property-map/property-map';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-property-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PropertyMap],
  templateUrl: './admin-property-form.html',
  styleUrl: './admin-property-form.css'
})
export class AdminPropertyForm implements OnInit {
  @ViewChild(PropertyMap) propertyMap?: PropertyMap;

  private fb = inject(FormBuilder);
  private propertyService = inject(PropertyService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private sanitizer = inject(DomSanitizer);

  propertyForm: FormGroup;
  isEditMode = signal(false);
  propertyId = signal<string | null>(null);
  
  isSaving = signal(false);
  isLoadingData = signal(false);
  
  selectedFiles: File[] = [];
  imagePreviews = signal<string[]>([]);
  existingImages = signal<{ url: string }[]>([]);
  apiUrl = environment.apiUrl;
  
  propertyTypes = [
    { id: 'Apartamento', label: 'Apartamento', icon: '<path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" />' },
    { id: 'Casa', label: 'Casa', icon: '<path d="M12 3L4 9V21H20V9L12 3ZM12 7.7C13.4 7.7 14.5 8.8 14.5 10.2C14.5 11.6 13.4 12.7 12 12.7C10.6 12.7 9.5 11.6 9.5 10.2C9.5 8.8 10.6 7.7 12 7.7ZM7 19V11.5L12 7.7L17 11.5V19H7Z" />' },
    { id: 'Apartaestudio', label: 'Apartaestudio', icon: '<path d="M3 13V3H21V13M3 17V21H21V17M11 7H13M11 9H13M11 11H13" />' },
    { id: 'Edificio', label: 'Edificio', icon: '<path d="M3 21V3H11V7H15V3H21V21H17V17H13V21H11V17H7V21H3Z" />' },
    { id: 'Oficina', label: 'Oficina', icon: '<path d="M20 6H4V4H20V6ZM20 8H4V20H20V8ZM14 12H10V10H14V12Z" />' },
    { id: 'Local', label: 'Local', icon: '<path d="M12 2L2 7V12H22V7L12 2ZM4 14V20H10V14H4ZM14 14V20H20V14H14Z" />' },
    { id: 'Local Comercial', label: 'Local Comercial', icon: '<path d="M12 2L2 7V12H22V7L12 2ZM4 14V20H10V14H4ZM14 14V20H20V14H14Z" />' },
    { id: 'Consultorio', label: 'Consultorio', icon: '<path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM18 13H13V18H11V13H6V11H11V6H13V11H18V13Z" />' },
    { id: 'Lote', label: 'Lote', icon: '<path d="M23 12L12 1L1 12H23ZM12 21.27L13 20H11L12 21.27Z" />' },
    { id: 'Lote Rural', label: 'Lote Rural', icon: '<path d="M23 12L12 1L1 12H23ZM12 21.27L13 20H11L12 21.27Z" />' },
    { id: 'Lote Urbano', label: 'Lote Urbano', icon: '<path d="M23 12L12 1L1 12H23ZM12 21.27L13 20H11L12 21.27Z" />' },
    { id: 'Finca', label: 'Finca', icon: '<path d="M12 3L4 9V21H9V14H15V21H20V9L12 3Z" />' },
    { id: 'Bodega', label: 'Bodega', icon: '<path d="M2 20H22V4H2V20ZM4 6H20V18H4V6Z" />' },
    { id: 'Parqueadero', label: 'Parqueadero', icon: '<path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V21C3 21.55 3.45 22 4 22H5C5.55 22 6 21.55 6 21V20H18V21C18 21.55 18.45 22 19 22H20C20.55 22 21 21.55 21 21V12L18.92 6.01ZM6.85 7H17.15L18.22 10.21H5.78L6.85 7ZM19 18H5V12H19V18Z" />' },
    { id: 'Depósito', label: 'Depósito', icon: '<path d="M20 13H4V11H20V13ZM20 17H4V15H20V17ZM20 21H4V19H20V21ZM20 9H4V5H20V9Z" />' },
    { id: 'Suite', label: 'Suite', icon: '<path d="M7 13V11H17V13H7ZM7 17V15H17V17H7ZM7 9V7H17V9H7Z" />' },
    { id: 'Casa Campestre', label: 'Casa Campestre', icon: '<path d="M12 3L4 9V21H20V9L12 3ZM12 7.7L17 11.5V19H7V11.5L12 7.7Z" />' }
  ];

  propertyStatuses = [
    { id: 'Venta', label: 'Venta', icon: '<path d="M12 2L2 19H22L12 2ZM12 6L19.53 17H4.47L12 6ZM11 10V14H13V10H11ZM11 15V17H13V15H11Z" />' },
    { id: 'Alquiler', label: 'Alquiler', icon: '<path d="M19 13V11H17V13H19ZM19 17V15H17V17H19ZM19 9V7H17V9H19ZM15 13V11H5V13H15ZM15 17V15H5V17H15ZM15 9V7H5V9H15Z" />' }
  ];

  propertyConditions = [
    'Para estrenar',
    'Sobre planos',
    'Excelente',
    'Remodelado',
    'Para remodelar'
  ];

  availableAmenities = [
    'Piscina',
    'Gimnasio',
    'Seguridad 24/7',
    'Ascensor',
    'Balcón / Terraza',
    'Zona BBQ',
    'Salón Social',
    'Parque Infantil',
    'Zonas Verdes',
    'Pet Friendly',
    'Planta Eléctrica',
    'Cuarto Útil / Depósito',
    'Jacuzzi / Turco',
    'Cancha Deportiva',
    'Domótica',
    'Aire Acondicionado',
    'Vista Panorámica',
    'Chimenea',
    'Cocina Isla / Abierta',
    'Parqueadero Visitantes'
  ];

  selectedAmenities = signal<string[]>([]);
  customAmenityInput = signal('');

  toggleAmenity(amenity: string) {
    const current = this.selectedAmenities();
    if (current.includes(amenity)) {
      this.selectedAmenities.set(current.filter(a => a !== amenity));
    } else {
      this.selectedAmenities.set([...current, amenity]);
    }
  }

  addCustomAmenity(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (!this.selectedAmenities().includes(trimmed)) {
      this.selectedAmenities.set([...this.selectedAmenities(), trimmed]);
    }
    this.customAmenityInput.set('');
  }

  selectType(typeId: string) {
    this.propertyForm.get('type')?.setValue(typeId);
  }

  selectStatus(statusId: string) {
    this.propertyForm.get('status')?.setValue(statusId);
  }

  getSafeIcon(icon: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(icon);
  }

  onCoordinatesSelected(coords: { lat: number; lng: number }) {
    this.propertyForm.patchValue({
      latitude: coords.lat,
      longitude: coords.lng
    });
  }

  locateOnMap() {
    const loc = this.propertyForm.get('location')?.value;
    if (!loc || loc.trim().length < 2) {
      this.toastService.warning('Escribe primero una ciudad o dirección en el campo Ubicación.');
      return;
    }
    this.propertyMap?.searchAddress(loc);
  }

  constructor() {
    this.propertyForm = this.fb.group({
      code: [''],
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: [''],
      price: ['', [Validators.required, Validators.min(1)]],
      adminFee: [null],
      location: ['', Validators.required],
      latitude: [null],
      longitude: [null],
      type: ['Casa', Validators.required],
      status: ['Venta', Validators.required],
      propertyCondition: ['Excelente'],
      bedrooms: [1, [Validators.required, Validators.min(0)]],
      bathrooms: [1, [Validators.required, Validators.min(0)]],
      garages: [1, [Validators.min(0)]],
      area: ['', [Validators.required, Validators.min(1)]],
      builtArea: [null],
      stratum: [null],
      floor: [null],
      yearBuilt: [null],
      videoUrl: [''],
      virtualTourUrl: [''],
      featured: [false]
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode.set(true);
        this.propertyId.set(id);
        this.loadPropertyData(id);
      }
    });
  }

  loadPropertyData(id: string) {
    this.isLoadingData.set(true);
    this.propertyService.getPropertyById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.propertyForm.patchValue({
            code: res.data.code ?? '',
            title: res.data.title,
            description: res.data.description,
            price: res.data.price,
            adminFee: res.data.adminFee ?? null,
            location: res.data.location,
            latitude: res.data.latitude ?? null,
            longitude: res.data.longitude ?? null,
            type: res.data.type,
            status: res.data.status,
            propertyCondition: res.data.propertyCondition ?? 'Excelente',
            bedrooms: res.data.bedrooms,
            bathrooms: res.data.bathrooms,
            garages: res.data.garages ?? 0,
            area: res.data.area,
            builtArea: res.data.builtArea ?? null,
            stratum: res.data.stratum ?? null,
            floor: res.data.floor ?? null,
            yearBuilt: res.data.yearBuilt ?? null,
            videoUrl: res.data.videoUrl ?? '',
            virtualTourUrl: res.data.virtualTourUrl ?? '',
            featured: res.data.featured
          });
          this.selectedAmenities.set(Array.isArray(res.data.amenities) ? res.data.amenities : []);
          if (res.data.images) {
            this.existingImages.set(res.data.images);
          }
        }
        this.isLoadingData.set(false);
      },
      error: (err) => {
        this.toastService.error('No se pudo cargar la información de la propiedad.');
        this.isLoadingData.set(false);
      }
    });
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFiles = Array.from(event.target.files);
      
      const previews: string[] = [];
      this.selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          previews.push(e.target.result);
          if (previews.length === this.selectedFiles.length) {
            this.imagePreviews.set(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeSelectedFile(index: number) {
    this.selectedFiles.splice(index, 1);
    const currentPreviews = [...this.imagePreviews()];
    currentPreviews.splice(index, 1);
    this.imagePreviews.set(currentPreviews);
  }

  onSubmit() {
    if (this.propertyForm.invalid) {
      this.propertyForm.markAllAsTouched();
      this.toastService.warning('Por favor, completa los campos requeridos.');
      return;
    }

    this.isSaving.set(true);

    const formData = new FormData();
    const formValues = this.propertyForm.value;

    Object.keys(formValues).forEach(key => {
      const val = formValues[key];
      if (val !== null && val !== undefined) {
        formData.append(key, String(val));
      } else {
        formData.append(key, '');
      }
    });

    formData.append('amenities', JSON.stringify(this.selectedAmenities()));

    if (this.selectedFiles.length > 0) {
      this.selectedFiles.forEach(file => {
        formData.append('images', file);
      });
    }

    if (this.isEditMode() && this.propertyId()) {
      this.propertyService.updateProperty(this.propertyId()!, formData).subscribe({
        next: (res) => {
          console.log('[AdminPropertyForm] Update response:', res);
          setTimeout(() => {
            this.isSaving.set(false);
            // Mostramos el toast si la respuesta existe (asumimos éxito si no hay error)
            this.toastService.success('Propiedad actualizada correctamente');
            this.router.navigate(['/admin']);
          }, 600);
        },
        error: (err) => {
          console.error('[AdminPropertyForm] Update error:', err);
          this.isSaving.set(false);
          this.toastService.error(err.error?.error || 'Error al actualizar la propiedad');
        }
      });
    } else {
      if (this.selectedFiles.length === 0) {
        this.toastService.warning('Debes seleccionar al menos una imagen');
        this.isSaving.set(false);
        return;
      }

      this.propertyService.createProperty(formData).subscribe({
        next: (res) => {
          console.log('[AdminPropertyForm] Create response:', res);
          setTimeout(() => {
            this.isSaving.set(false);
            this.toastService.success('Propiedad publicada correctamente');
            this.router.navigate(['/admin']);
          }, 600);
        },
        error: (err) => {
          console.error('[AdminPropertyForm] Create error:', err);
          this.isSaving.set(false);
          this.toastService.error(err.error?.error || 'Error al crear la propiedad');
        }
      });
    }
  }
}
