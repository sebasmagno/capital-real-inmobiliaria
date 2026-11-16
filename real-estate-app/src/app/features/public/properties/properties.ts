import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { PropertyService, Property } from '../../../core/services/property';
import { SeoService } from '../../../core/services/seo.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SkeletonProperty } from '../../../shared/components/skeleton-property/skeleton-property';
import { PropertyMap } from '../../../shared/components/property-map/property-map';

@Component({
  selector: 'app-properties',
  imports: [CommonModule, FormsModule, RouterLink, SkeletonProperty, PropertyMap],
  templateUrl: './properties.html',
  styleUrl: './properties.css'
})
export class Properties implements OnInit {
  private propertyService = inject(PropertyService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private seoService = inject(SeoService);

  // Filter & View state
  locationFilter = signal('');
  typeFilter = signal('Todos');
  statusFilter = signal('Todos');
  priceFilter = signal('Sin Límite');
  bedroomsFilter = signal('Todos');
  garagesFilter = signal('Todos');
  stratumFilter = signal('Todos');
  viewMode = signal<'grid' | 'split' | 'map'>('grid');
  isMobileFilterOpen = signal(false);

  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.locationFilter().trim()) count++;
    if (this.typeFilter() !== 'Todos') count++;
    if (this.statusFilter() !== 'Todos') count++;
    if (this.priceFilter() !== 'Sin Límite') count++;
    if (this.bedroomsFilter() !== 'Todos') count++;
    if (this.garagesFilter() !== 'Todos') count++;
    if (this.stratumFilter() !== 'Todos') count++;
    return count;
  });

  propertyTypes = [
    { id: 'Todos', label: 'Todos', path: 'M12 2L2 19H22L12 2ZM12 6L19.53 17H4.47L12 6Z' },
    { id: 'Casa', label: 'Casa', path: 'M12 3L4 9V21H20V9L12 3ZM12 7.7L17 11.5V19H7V11.5L12 7.7Z' },
    { id: 'Apartamento', label: 'Apartamento', path: 'M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z' },
    { id: 'Villa', label: 'Villa', path: 'M12 3L4 9V21H20V9L12 3ZM12 7.7C13.4 7.7 14.5 8.8 14.5 10.2C14.5 11.6 13.4 12.7 12 12.7C10.6 12.7 9.5 11.6 9.5 10.2C9.5 8.8 10.6 7.7 12 7.7ZM7 19V11.5L12 7.7L17 11.5V19H7Z' },
    { id: 'Oficina', label: 'Oficina', path: 'M20 6H4V4H20V6ZM20 8H4V20H20V8ZM14 12H10V10H14V12Z' },
    { id: 'Local', label: 'Local', path: 'M12 2L2 7V12H22V7L12 2ZM4 14V20H10V14H4ZM14 14V20H20V14H14Z' }
  ];
  
  private locationSubject = new Subject<string>();

  // Data state
  properties = signal<Property[]>([]);
  isLoading = signal(false);
  apiUrl = environment.apiUrl;

  navigateToProperty(propertyId: string) {
    this.router.navigate(['/propiedades', propertyId]);
  }

  constructor() {
    this.route.queryParams.subscribe(params => {
      if (params['location']) {
        this.locationFilter.set(params['location']);
      }
      if (params['status']) {
        this.statusFilter.set(params['status']);
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
      this.fetchProperties({
        location: this.locationFilter(),
        type: this.typeFilter(),
        status: this.statusFilter(),
        maxPrice: this.priceFilter(),
        minBedrooms: this.bedroomsFilter(),
        minGarages: this.garagesFilter(),
        stratum: this.stratumFilter()
      });
    });
  }

  onLocationChange(value: string) {
    this.locationSubject.next(value);
  }

  ngOnInit() {
    this.seoService.setPageSEO({
      title: 'Casas y Apartamentos en Venta y Arriendo en Pereira | CAPITAL REAL',
      description: 'Explora nuestro catálogo de casas campestres, apartamentos, lotes y locales en Pereira, Dosquebradas y el Eje Cafetero. Filtra por precio, habitaciones y sector.',
      keywords: 'propiedades pereira, venta casas pereira, arriendo apartamentos pereira, fincas eje cafetero, inmobiliaria pereira',
      url: '/propiedades'
    });
  }

  fetchProperties(filters: {
    location: string;
    type: string;
    status: string;
    maxPrice: string;
    minBedrooms: string;
    minGarages: string;
    stratum: string;
  }) {
    this.isLoading.set(true);
    this.propertyService.getProperties(filters).subscribe({
      next: (res) => {
        if (res.success) {
          this.properties.set(res.data);
          this.updateSEO(filters.location, filters.type);
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
    let title = 'Casas y Apartamentos en Venta y Arriendo en Pereira | CAPITAL REAL';
    let description = 'Explora nuestro catálogo completo de casas campestres, apartamentos y locales en Pereira y el Eje Cafetero.';

    if (location || type !== 'Todos') {
      title = `${type !== 'Todos' ? type : 'Propiedades'} ${location ? 'en ' + location : ''} | CAPITAL REAL`;
      description = `Encuentra las mejores opciones de ${type.toLowerCase()} ${location ? 'en ' + location : ''}. Resultados actualizados y exclusivos en Pereira y Eje Cafetero.`;
    }

    this.seoService.setPageSEO({
      title,
      description,
      keywords: `${type !== 'Todos' ? type.toLowerCase() : 'propiedades'}, bienes raices pereira, comprar ${type.toLowerCase()} pereira`,
      url: '/propiedades'
    });
  }

  resetFilters() {
    this.locationFilter.set('');
    this.typeFilter.set('Todos');
    this.statusFilter.set('Todos');
    this.priceFilter.set('Sin Límite');
    this.bedroomsFilter.set('Todos');
    this.garagesFilter.set('Todos');
    this.stratumFilter.set('Todos');
  }
}
