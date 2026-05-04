import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PropertyService, Property } from '../../../core/services/property';

@Component({
  selector: 'app-property-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './property-detail.html',
  styleUrl: './property-detail.css'
})
export class PropertyDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private propertyService = inject(PropertyService);
  
  property = signal<Property | null>(null);
  selectedImageIndex = signal<number | null>(null);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadProperty(id);
      }
    });
  }

  loadProperty(id: string) {
    this.propertyService.getPropertyById(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.property.set(res.data);
        }
      },
      error: (err) => {
        console.error('Error cargando propiedad', err);
      }
    });
  }

  openLightbox(index: number) {
    this.selectedImageIndex.set(index);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
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
