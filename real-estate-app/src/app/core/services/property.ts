import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Property {
  id: string;
  title: string;
  description?: string;
  price: number;
  location: string;
  type: string;
  status: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
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
      if (filters.maxPrice && filters.maxPrice !== 'Sin Límite') params.maxPrice = filters.maxPrice;
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
