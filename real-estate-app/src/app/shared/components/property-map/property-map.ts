import {
  Component,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  input,
  output,
  effect,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { Property } from '../../../core/services/property';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-property-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <div #mapContainer [class]="heightClass() + ' w-full z-0'"></div>

      @if (isSearchingLocation()) {
        <div class="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl shadow-md border border-slate-200 flex items-center gap-2 text-xs font-bold text-slate-700">
          <div class="w-3.5 h-3.5 rounded-full border-2 border-primary-600 border-t-transparent animate-spin"></div>
          <span>Localizando en el mapa...</span>
        </div>
      }

      @if (mode() === 'picker') {
        <div class="bg-slate-900 text-white px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2">
          <span class="flex items-center gap-1.5 text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-primary-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            Haz clic en el mapa o arrastra el marcador para fijar la ubicación exacta
          </span>
          @if (currentLat() !== null && currentLng() !== null) {
            <span class="font-mono text-[11px] bg-slate-800 px-2.5 py-0.5 rounded text-primary-300">
              {{ currentLat() | number:'1.5-5' }}, {{ currentLng() | number:'1.5-5' }}
            </span>
          }
        </div>
      }
    </div>
  `
})
export class PropertyMap implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  mode = input<'single' | 'catalog' | 'picker'>('single');
  latitude = input<number | null | undefined>(null);
  longitude = input<number | null | undefined>(null);
  title = input<string>('');
  locationText = input<string>('');
  price = input<number | null>(null);
  properties = input<Property[]>([]);
  heightClass = input<string>('h-80');

  coordinatesChange = output<{ lat: number; lng: number }>();

  isSearchingLocation = signal(false);
  currentLat = signal<number | null>(null);
  currentLng = signal<number | null>(null);

  private map: L.Map | null = null;
  private singleMarker: L.Marker | null = null;
  private catalogLayerGroup: L.LayerGroup | null = null;
  private apiUrl = environment.apiUrl.replace('/api', '');

  // Coordenadas base por defecto: Pereira, Risaralda, Colombia
  private readonly DEFAULT_LAT = 4.8133;
  private readonly DEFAULT_LNG = -75.6961;

  constructor() {
    effect(() => {
      const currentMode = this.mode();
      const lat = this.latitude();
      const lng = this.longitude();
      const loc = this.locationText();
      const props = this.properties();

      if (!this.map) return;

      if (currentMode === 'catalog') {
        this.renderCatalogMarkers(props);
      } else {
        this.updateSingleOrPickerView(lat, lng, loc);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private initMap(): void {
    const initialLat = this.latitude() ?? this.DEFAULT_LAT;
    const initialLng = this.longitude() ?? this.DEFAULT_LNG;

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [initialLat, initialLng],
      zoom: 14,
      scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(this.map);

    this.catalogLayerGroup = L.layerGroup().addTo(this.map);

    if (this.mode() === 'picker') {
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.setPickerMarker(e.latlng.lat, e.latlng.lng, true);
      });
    }

    setTimeout(() => {
      this.map?.invalidateSize();
      if (this.mode() === 'catalog') {
        this.renderCatalogMarkers(this.properties());
      } else {
        this.updateSingleOrPickerView(this.latitude(), this.longitude(), this.locationText());
      }
    }, 150);
  }

  private createPinIcon(label?: string): L.DivIcon {
    const badgeHtml = label
      ? `<div style="background:#0f172a;color:#ffffff;font-weight:800;font-size:11px;padding:4px 9px;border-radius:9999px;border:2px solid #ffffff;box-shadow:0 4px 12px rgba(15,23,42,0.35);white-space:nowrap;display:inline-flex;align-items:center;gap:4px;">
           <span style="width:7px;height:7px;border-radius:9999px;background:#3b82f6;display:inline-block;"></span>
           ${label}
         </div>`
      : `<div style="width:36px;height:36px;background:#0f172a;border:3px solid #ffffff;border-radius:9999px;box-shadow:0 6px 16px rgba(15,23,42,0.4);display:flex;align-items:center;justify-content:center;color:#ffffff;">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" style="width:18px;height:18px;">
             <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
             <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
           </svg>
         </div>`;

    return L.divIcon({
      className: 'custom-capital-real-pin',
      html: badgeHtml,
      iconSize: label ? [100, 32] : [36, 36],
      iconAnchor: label ? [50, 16] : [18, 36],
      popupAnchor: [0, -24]
    });
  }

  private updateSingleOrPickerView(
    lat: number | null | undefined,
    lng: number | null | undefined,
    locText: string
  ): void {
    if (!this.map) return;

    if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
      if (this.mode() === 'picker') {
        this.setPickerMarker(lat, lng, false);
      } else {
        this.setSingleMarker(lat, lng);
      }
      return;
    }

    // Si estamos en modo detalle ('single') y la propiedad no tiene coordenadas guardadas aún, geocodificamos su ubicación textual
    if (this.mode() === 'single' && locText && locText.trim().length > 2) {
      this.geocodeLocation(locText, false);
    } else if (this.mode() === 'picker' && !this.singleMarker) {
      this.setPickerMarker(this.DEFAULT_LAT, this.DEFAULT_LNG, false);
    }
  }

  private setSingleMarker(lat: number, lng: number): void {
    if (!this.map) return;
    this.currentLat.set(lat);
    this.currentLng.set(lng);

    if (this.singleMarker) {
      this.singleMarker.setLatLng([lat, lng]);
    } else {
      this.singleMarker = L.marker([lat, lng], {
        icon: this.createPinIcon()
      }).addTo(this.map);
    }

    if (this.title()) {
      this.singleMarker.bindPopup(
        `<div style="font-family:sans-serif;padding:2px;">
          <strong style="font-size:13px;color:#0f172a;display:block;">${this.title()}</strong>
          <span style="font-size:11px;color:#64748b;">${this.locationText()}</span>
        </div>`
      );
    }

    this.map.setView([lat, lng], 15);
  }

  private setPickerMarker(lat: number, lng: number, emitChange: boolean): void {
    if (!this.map) return;
    const roundedLat = Number(lat.toFixed(6));
    const roundedLng = Number(lng.toFixed(6));

    this.currentLat.set(roundedLat);
    this.currentLng.set(roundedLng);

    if (this.singleMarker) {
      this.singleMarker.setLatLng([roundedLat, roundedLng]);
    } else {
      this.singleMarker = L.marker([roundedLat, roundedLng], {
        icon: this.createPinIcon(),
        draggable: true
      }).addTo(this.map);

      this.singleMarker.on('dragend', () => {
        const pos = this.singleMarker!.getLatLng();
        const rLat = Number(pos.lat.toFixed(6));
        const rLng = Number(pos.lng.toFixed(6));
        this.currentLat.set(rLat);
        this.currentLng.set(rLng);
        this.coordinatesChange.emit({ lat: rLat, lng: rLng });
      });
    }

    this.map.panTo([roundedLat, roundedLng]);

    if (emitChange) {
      this.coordinatesChange.emit({ lat: roundedLat, lng: roundedLng });
    }
  }

  /** Método público para buscar dirección con Nominatim (OpenStreetMap) */
  searchAddress(query: string): void {
    if (!query || query.trim().length < 2) return;
    this.geocodeLocation(query.trim(), this.mode() === 'picker');
  }

  private geocodeLocation(query: string, emitPickerChange: boolean): void {
    this.isSearchingLocation.set(true);
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;

    fetch(url, {
      headers: { 'Accept-Language': 'es' }
    })
      .then((res) => res.json())
      .then((results) => {
        this.isSearchingLocation.set(false);
        if (Array.isArray(results) && results.length > 0) {
          const foundLat = parseFloat(results[0].lat);
          const foundLng = parseFloat(results[0].lon);
          if (!isNaN(foundLat) && !isNaN(foundLng)) {
            if (this.mode() === 'picker') {
              this.map?.setView([foundLat, foundLng], 15);
              this.setPickerMarker(foundLat, foundLng, emitPickerChange);
            } else {
              this.setSingleMarker(foundLat, foundLng);
            }
          }
        }
      })
      .catch(() => {
        this.isSearchingLocation.set(false);
      });
  }

  private renderCatalogMarkers(properties: Property[]): void {
    if (!this.map || !this.catalogLayerGroup) return;

    this.catalogLayerGroup.clearLayers();
    if (!properties || properties.length === 0) return;

    const bounds: L.LatLngTuple[] = [];

    properties.forEach((prop, index) => {
      // Si una propiedad antigua no tiene coordenadas aún, generamos una posición cercana a Pereira para visualización
      const lat =
        prop.latitude != null && !isNaN(prop.latitude)
          ? prop.latitude
          : this.DEFAULT_LAT + ((index % 5) - 2) * 0.008;
      const lng =
        prop.longitude != null && !isNaN(prop.longitude)
          ? prop.longitude
          : this.DEFAULT_LNG + (((index * 3) % 5) - 2) * 0.009;

      bounds.push([lat, lng]);

      const formattedPrice = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
      }).format(prop.price);

      const rawImg = prop.images?.[0]?.url;
      const imgUrl = rawImg
        ? rawImg.startsWith('http')
          ? rawImg
          : `${this.apiUrl}${rawImg}`
        : '/uploads/placeholder.jpg';

      const marker = L.marker([lat, lng], {
        icon: this.createPinIcon(formattedPrice)
      });

      const popupContent = `
        <div style="width:210px;font-family:sans-serif;">
          <img src="${imgUrl}" alt="${prop.title}" style="width:100%;height:110px;object-fit:cover;border-radius:10px;margin-bottom:8px;" />
          <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:#2563eb;margin-bottom:2px;">
            ${prop.type} • En ${prop.status}
          </div>
          <div style="font-size:13px;font-weight:700;color:#0f172a;line-height:1.25;margin-bottom:4px;">
            ${prop.title}
          </div>
          <div style="font-size:11px;color:#64748b;margin-bottom:6px;">
            ${prop.location}
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid #f1f5f9;padding-top:6px;">
            <strong style="font-size:13px;color:#0f172a;">${formattedPrice}</strong>
            <a href="/propiedades/${prop.id}" style="font-size:11px;font-weight:700;color:#2563eb;text-decoration:none;">
              Ver detalle →
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      this.catalogLayerGroup!.addLayer(marker);
    });

    if (bounds.length === 1) {
      this.map.setView(bounds[0], 14);
    } else if (bounds.length > 1) {
      this.map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15 });
    }
  }
}
