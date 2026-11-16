import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private dom = inject(DOCUMENT);

  private readonly SITE_NAME = 'CAPITAL REAL INMOBILIARIA';
  private readonly BASE_URL = 'https://www.capitalrealinmobiliaria.com';
  private readonly DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9';

  setPageSEO(config: SeoConfig): void {
    const fullTitle = config.title.includes(this.SITE_NAME)
      ? config.title
      : `${config.title} | ${this.SITE_NAME}`;

    const canonicalUrl = config.url
      ? config.url.startsWith('http')
        ? config.url
        : `${this.BASE_URL}${config.url.startsWith('/') ? config.url : '/' + config.url}`
      : this.BASE_URL;

    const ogImage = config.image || this.DEFAULT_IMAGE;

    // 1. Título y Descripción estándar
    this.titleService.setTitle(fullTitle);
    this.metaService.updateTag({ name: 'description', content: config.description });
    
    if (config.keywords) {
      this.metaService.updateTag({ name: 'keywords', content: config.keywords });
    }

    // 2. Canonical URL
    this.updateCanonicalUrl(canonicalUrl);

    // 3. Open Graph (Facebook, WhatsApp, LinkedIn)
    this.metaService.updateTag({ property: 'og:site_name', content: this.SITE_NAME });
    this.metaService.updateTag({ property: 'og:title', content: fullTitle });
    this.metaService.updateTag({ property: 'og:description', content: config.description });
    this.metaService.updateTag({ property: 'og:url', content: canonicalUrl });
    this.metaService.updateTag({ property: 'og:image', content: ogImage });
    this.metaService.updateTag({ property: 'og:type', content: config.type || 'website' });

    // 4. Twitter Cards
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: fullTitle });
    this.metaService.updateTag({ name: 'twitter:description', content: config.description });
    this.metaService.updateTag({ name: 'twitter:image', content: ogImage });
  }

  updateCanonicalUrl(url: string): void {
    let link: HTMLLinkElement | null = this.dom.querySelector("link[rel='canonical']");
    if (!link) {
      link = this.dom.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.dom.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  setJsonLd(schema: object, id: string = 'structured-data-jsonld'): void {
    let script: HTMLScriptElement | null = this.dom.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = this.dom.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      this.dom.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema, null, 2);
  }

  removeJsonLd(id: string = 'structured-data-jsonld'): void {
    const script = this.dom.getElementById(id);
    if (script && script.parentNode) {
      script.parentNode.removeChild(script);
    }
  }
}
