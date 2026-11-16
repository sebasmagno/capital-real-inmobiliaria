import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropertyService, Property } from '../../../core/services/property';
import { ConfigService } from '../../../core/services/config';
import { SeoService } from '../../../core/services/seo.service';
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
  private seoService = inject(SeoService);
  
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
    const settings = this.configService.settings();
    const companyName = settings.companyName || 'CAPITAL REAL INMOBILIARIA';

    this.seoService.setPageSEO({
      title: `Inmobiliaria en Pereira | Venta y Arriendo de Casas y Apartamentos | ${companyName}`,
      description: `Portal inmobiliario líder en Pereira, Risaralda y el Eje Cafetero. Especialistas en venta y arriendo de casas, apartamentos, lotes campestres y locales comerciales con respaldo y confianza.`,
      keywords: `inmobiliaria pereira, casas en venta pereira, apartamentos en venta pereira, arriendos pereira, bienes raices eje cafetero, capital real inmobiliaria`,
      url: '/',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9'
    });

    // Inyectar Schema.org RealEstateAgent estructurado
    this.seoService.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'RealEstateAgent',
      '@id': 'https://www.capitalrealinmobiliaria.com/#organization',
      'name': companyName,
      'alternateName': 'Capital Real',
      'url': 'https://www.capitalrealinmobiliaria.com',
      'logo': 'https://www.capitalrealinmobiliaria.com/favicon.ico',
      'image': 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
      'description': 'Portal inmobiliario líder en la gestión de propiedades exclusivas en Pereira y el Eje Cafetero.',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': settings.address || 'Calle 19 8-34 Edificio Corporación Financiera Piso 14 Oficina 16',
        'addressLocality': 'Pereira',
        'addressRegion': 'Risaralda',
        'postalCode': '660001',
        'addressCountry': 'CO'
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': 4.8133,
        'longitude': -75.6961
      },
      'telephone': settings.phone || '+57 333 2212144',
      'email': settings.contactEmail || 'capitalrealinmobiliaria@gmail.com',
      'priceRange': '$$',
      'areaServed': [
        { '@type': 'City', 'name': 'Pereira' },
        { '@type': 'City', 'name': 'Dosquebradas' },
        { '@type': 'AdministrativeArea', 'name': 'Risaralda' },
        { '@type': 'AdministrativeArea', 'name': 'Eje Cafetero' }
      ]
    }, 'realestate-agent-jsonld');
  }

  onSearch() {
    this.router.navigate(['/propiedades'], { 
      queryParams: { location: this.searchQuery() } 
    });
  }
}

