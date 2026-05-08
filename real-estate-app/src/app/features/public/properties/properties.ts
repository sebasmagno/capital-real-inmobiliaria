import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
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

  // Filter state
  locationFilter = signal('');
  typeFilter = signal('Todos');
  priceFilter = signal('Sin Límite');
  
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
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching properties', err);
        this.isLoading.set(false);
      }
    });
  }

  resetFilters() {
    this.locationFilter.set('');
    this.typeFilter.set('Todos');
    this.priceFilter.set('Sin Límite');
  }
}
