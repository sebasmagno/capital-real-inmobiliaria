import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PropertyService, Property } from '../../../core/services/property';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-properties-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-properties-list.html',
  styleUrl: './admin-properties-list.css'
})
export class AdminPropertiesList implements OnInit {
  private propertyService = inject(PropertyService);
  private toastService = inject(ToastService);
  
  properties = signal<Property[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.loadProperties();
  }

  loadProperties() {
    this.isLoading.set(true);
    // Para la vista administrativa pedimos todas las propiedades sin filtro por ahora
    this.propertyService.getProperties().subscribe({
      next: (res) => {
        setTimeout(() => {
          if (res.success) {
            this.properties.set(res.data);
          }
          this.isLoading.set(false);
        }, 800);
      },
      error: (err) => {
        console.error('Error cargando propiedades', err);
        this.isLoading.set(false);
      }
    });
  }

  deleteProperty(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar esta propiedad? Esta acción no se puede deshacer.')) {
      this.propertyService.deleteProperty(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastService.success('Propiedad eliminada correctamente');
            this.properties.update(props => props.filter(p => p.id !== id));
          }
        },
        error: (err) => {
          this.toastService.error('Hubo un error al eliminar la propiedad');
        }
      });
    }
  }
}
