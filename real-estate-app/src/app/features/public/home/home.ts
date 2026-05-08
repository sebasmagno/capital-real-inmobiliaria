import { Component, inject, signal, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropertyService, Property } from '../../../core/services/property';
import { ConfigService } from '../../../core/services/config';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private router = inject(Router);
  private propertyService = inject(PropertyService);
  private configService = inject(ConfigService);
  private title = inject(Title);
  private meta = inject(Meta);
  
  searchQuery = signal('');
  featuredProperties = signal<Property[]>([]);
  apiUrl = environment.apiUrl;

  ngOnInit() {
    this.updateSEO();
    this.propertyService.getFeaturedProperties().subscribe(res => {
      if (res.success) {
        // Filtramos localmente para destacar solo las 'featured' y máximo 3
        const featured = res.data.filter(p => p.featured).slice(0, 3);
        this.featuredProperties.set(featured);
      }
    });
  }

  private updateSEO() {
    const name = this.configService.settings().companyName;
    this.title.setTitle(`${name} | Encuentra tu hogar perfecto`);
    this.meta.updateTag({ name: 'description', content: `Explora las mejores propiedades en venta y alquiler con ${name}. Casas, apartamentos y locales exclusivos en las mejores ubicaciones.` });
    this.meta.updateTag({ property: 'og:title', content: `${name} - Tu próxima propiedad` });
    this.meta.updateTag({ property: 'og:description', content: 'Busca y encuentra la propiedad ideal para ti con nuestro buscador inteligente.' });
    this.meta.updateTag({ property: 'og:image', content: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9' });
  }

  onSearch() {
    this.router.navigate(['/propiedades'], { 
      queryParams: { location: this.searchQuery() } 
    });
  }
}
