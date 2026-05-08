import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml, Title, Meta } from '@angular/platform-browser';
import { PropertyService, Property } from '../../../core/services/property';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SkeletonProperty } from '../../../shared/components/skeleton-property/skeleton-property';

@Component({
  selector: 'app-properties',
  imports: [CommonModule, FormsModule, RouterLink, SkeletonProperty],
  templateUrl: './properties.html',
  styleUrl: './properties.css'
})
export class Properties implements OnInit {
  private propertyService = inject(PropertyService);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  getSafeIcon(icon: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(icon);
  }

  // Filter state
  locationFilter = signal('');
  typeFilter = signal('Todos');
  priceFilter = signal('Sin Límite');

  propertyTypes = [
    { id: 'Todos', label: 'Todos', icon: '<path d="M12 2L2 19H22L12 2ZM12 6L19.53 17H4.47L12 6Z" />' },
    { id: 'Casa', label: 'Casa', icon: '<path d="M12 3L4 9V21H20V9L12 3ZM12 7.7L17 11.5V19H7V11.5L12 7.7Z" />' },
    { id: 'Apartamento', label: 'Apartamento', icon: '<path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" />' },
    { id: 'Villa', label: 'Villa', icon: '<path d="M12 3L4 9V21H20V9L12 3ZM12 7.7C13.4 7.7 14.5 8.8 14.5 10.2C14.5 11.6 13.4 12.7 12 12.7C10.6 12.7 9.5 11.6 9.5 10.2C9.5 8.8 10.6 7.7 12 7.7ZM7 19V11.5L12 7.7L17 11.5V19H7Z" />' },
    { id: 'Oficina', label: 'Oficina', icon: '<path d="M20 6H4V4H20V6ZM20 8H4V20H20V8ZM14 12H10V10H14V12Z" />' },
    { id: 'Local', label: 'Local', icon: '<path d="M12 2L2 7V12H22V7L12 2ZM4 14V20H10V14H4ZM14 14V20H20V14H14Z" />' }
  ];
  
  private locationSubject = new Subject<string>();

  // Data state
  properties = signal<Property[]>([]);
  isLoading = signal(false);
  apiUrl = environment.apiUrl;

  constructor() {
    this.route.queryParams.subscribe(params => {
      if (params['location']) {
        this.locationFilter.set(params['location']);
      }
    });

    // Debounce location search
    this.locationSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(value => {
      this.locationFilter.set(value);
    });

    effect(() => {
      // Re-fetch when filters change
      this.fetchProperties(this.locationFilter(), this.typeFilter(), this.priceFilter());
    });
  }

  onLocationChange(value: string) {
    this.locationSubject.next(value);
  }

  ngOnInit() {
    // Initial fetch triggered by effect, but we can keep ngOnInit for other logic
  }

  fetchProperties(location: string, type: string, maxPrice: string) {
    this.isLoading.set(true);
    this.propertyService.getProperties({ location, type, maxPrice }).subscribe({
      next: (res) => {
        if (res.success) {
          this.properties.set(res.data);
          this.updateSEO(location, type);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching properties', err);
        this.isLoading.set(false);
      }
    });
  }

  private updateSEO(location: string, type: string) {
    let title = 'Catálogo de Propiedades | CAPITAL REAL';
    let description = 'Explora nuestro catálogo completo de casas, apartamentos y locales comerciales.';

    if (location || type !== 'Todos') {
      title = `${type !== 'Todos' ? type : 'Propiedades'} ${location ? 'en ' + location : ''} | CAPITAL REAL`;
      description = `Encuentra las mejores opciones de ${type.toLowerCase()} ${location ? 'en ' + location : ''}. Resultados actualizados y exclusivos.`;
    }

    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
  }

  resetFilters() {
    this.locationFilter.set('');
    this.typeFilter.set('Todos');
    this.priceFilter.set('Sin Límite');
  }
}
