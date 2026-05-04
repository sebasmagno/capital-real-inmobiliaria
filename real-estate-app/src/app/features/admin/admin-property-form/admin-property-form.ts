import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PropertyService } from '../../../core/services/property';

@Component({
  selector: 'app-admin-property-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-property-form.html',
  styleUrl: './admin-property-form.css'
})
export class AdminPropertyForm implements OnInit {
  private fb = inject(FormBuilder);
  private propertyService = inject(PropertyService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  propertyForm: FormGroup;
  isEditMode = signal(false);
  propertyId = signal<string | null>(null);
  
  isSaving = signal(false);
  isLoadingData = signal(false);
  
  selectedFiles: File[] = [];
  imagePreviews = signal<string[]>([]);
  existingImages = signal<{ url: string }[]>([]);
  errorMessage = signal('');

  constructor() {
    this.propertyForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: [''],
      price: ['', [Validators.required, Validators.min(1)]],
      location: ['', Validators.required],
      type: ['Casa', Validators.required],
      status: ['Venta', Validators.required],
      bedrooms: [1, [Validators.required, Validators.min(0)]],
      bathrooms: [1, [Validators.required, Validators.min(0)]],
      area: ['', [Validators.required, Validators.min(1)]],
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
            title: res.data.title,
            description: res.data.description,
            price: res.data.price,
            location: res.data.location,
            type: res.data.type,
            status: res.data.status,
            bedrooms: res.data.bedrooms,
            bathrooms: res.data.bathrooms,
            area: res.data.area,
            featured: res.data.featured
          });
          if (res.data.images) {
            this.existingImages.set(res.data.images);
          }
        }
        this.isLoadingData.set(false);
      },
      error: (err) => {
        console.error('Error al cargar propiedad', err);
        this.errorMessage.set('No se pudo cargar la información de la propiedad.');
        this.isLoadingData.set(false);
      }
    });
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFiles = Array.from(event.target.files);
      
      // Generar previsualizaciones
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
    
    // Si borramos todos, limpiar input (esto se hace automáticamente al no haber archivos, pero es bueno ser explícito)
    if (this.selectedFiles.length === 0) {
      // Necesitaríamos ViewChild para limpiar el input, pero por ahora con limpiar el array basta
    }
  }

  onSubmit() {
    if (this.propertyForm.invalid) {
      this.propertyForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    const formData = new FormData();
    const formValues = this.propertyForm.value;

    Object.keys(formValues).forEach(key => {
      formData.append(key, formValues[key]);
    });

    if (this.selectedFiles.length > 0) {
      this.selectedFiles.forEach(file => {
        formData.append('images', file);
      });
    }

    if (this.isEditMode() && this.propertyId()) {
      this.propertyService.updateProperty(this.propertyId()!, formData).subscribe({
        next: (res) => {
          this.isSaving.set(false);
          if (res.success) {
            this.router.navigate(['/admin']);
          }
        },
        error: (err) => {
          this.isSaving.set(false);
          this.errorMessage.set(err.error?.error || 'Error al actualizar la propiedad');
        }
      });
    } else {
      // Create new
      if (this.selectedFiles.length === 0) {
        this.errorMessage.set('Debes seleccionar al menos una imagen');
        this.isSaving.set(false);
        return;
      }

      this.propertyService.createProperty(formData).subscribe({
        next: (res) => {
          this.isSaving.set(false);
          if (res.success) {
            this.router.navigate(['/admin']);
          }
        },
        error: (err) => {
          this.isSaving.set(false);
          this.errorMessage.set(err.error?.error || 'Error al crear la propiedad');
        }
      });
    }
  }
}
