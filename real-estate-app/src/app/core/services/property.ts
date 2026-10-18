import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Property {
  id: string;
  code?: string | null;
  title: string;
  description?: string;
  price: number;
  adminFee?: number | null;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  type: string;
  status: string;
  propertyCondition?: string | null;
  bedrooms: number;
  bathrooms: number;
  garages?: number | null;
  area: number;
  builtArea?: number | null;
  stratum?: number | null;
  floor?: number | null;
  yearBuilt?: number | null;
  amenities?: string[];
  videoUrl?: string | null;
  virtualTourUrl?: string | null;
  featured: boolean;
  images: { url: string }[];
  agent: { id: string, name: string, email: string };
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/properties`;

  getFeaturedProperties(): Observable<ApiResponse<Property[]>> {
    return this.http.get<ApiResponse<Property[]>>(`${this.apiUrl}`);
  }

  getProperties(filters?: any): Observable<ApiResponse<Property[]>> {
    let params: any = {};
    
    if (filters) {
      if (filters.location) params.location = filters.location;
      if (filters.type && filters.type !== 'Todos') params.type = filters.type;
      if (filters.status && filters.status !== 'Todos') params.status = filters.status;
      if (filters.maxPrice && filters.maxPrice !== 'Sin Límite') params.maxPrice = filters.maxPrice;
      if (filters.minBedrooms && filters.minBedrooms !== 'Todos') params.minBedrooms = filters.minBedrooms;
      if (filters.minBathrooms && filters.minBathrooms !== 'Todos') params.minBathrooms = filters.minBathrooms;
      if (filters.minGarages && filters.minGarages !== 'Todos') params.minGarages = filters.minGarages;
      if (filters.stratum && filters.stratum !== 'Todos') params.stratum = filters.stratum;
    }

    return this.http.get<ApiResponse<Property[]>>(this.apiUrl, { params });
  }

  getPropertyById(id: string): Observable<ApiResponse<Property>> {
    return this.http.get<ApiResponse<Property>>(`${this.apiUrl}/${id}`);
  }

  // Rutas administrativas
  createProperty(formData: FormData): Observable<ApiResponse<Property>> {
    return this.http.post<ApiResponse<Property>>(`${environment.apiUrl}/admin/properties`, formData);
  }

  updateProperty(id: string, formData: FormData): Observable<ApiResponse<Property>> {
    return this.http.put<ApiResponse<Property>>(`${environment.apiUrl}/admin/properties/${id}`, formData);
  }

  deleteProperty(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${environment.apiUrl}/admin/properties/${id}`);
  }
}
