import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropertyService, Property } from '../../../core/services/property';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private router = inject(Router);
  private propertyService = inject(PropertyService);
  
  searchQuery = signal('');
  featuredProperties = signal<Property[]>([]);

  ngOnInit() {
    this.propertyService.getFeaturedProperties().subscribe(res => {
      if (res.success) {
        // Filtramos localmente para destacar solo las 'featured' y máximo 3
        const featured = res.data.filter(p => p.featured).slice(0, 3);
        this.featuredProperties.set(featured);
      }
    });
  }

  onSearch() {
    this.router.navigate(['/propiedades'], { 
      queryParams: { location: this.searchQuery() } 
    });
  }
}
