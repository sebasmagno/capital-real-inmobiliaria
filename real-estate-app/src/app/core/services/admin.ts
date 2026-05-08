import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  type: string;
  imageUrl?: string;
  phone?: string;
  bio?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalProperties: number;
  featuredCount: number;
  propertiesByStatus: { status: string; _count: { _all: number } }[];
  propertiesByType: { type: string; _count: { _all: number } }[];
  recentProperties: any[];
  monthlyDistribution: { month: string; count: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);

  getStats(): Observable<{ success: boolean; data: DashboardStats }> {
    return this.http.get<{ success: boolean; data: DashboardStats }>(`${environment.apiUrl}/admin/stats`);
  }

  getUsers(): Observable<{ success: boolean; data: User[] }> {
    return this.http.get<{ success: boolean; data: User[] }>(`${environment.apiUrl}/admin/users`);
  }

  getUserById(id: string): Observable<{ success: boolean; data: User }> {
    return this.http.get<{ success: boolean; data: User }>(`${environment.apiUrl}/admin/users/${id}`);
  }

  getPublicAgents(): Observable<{ success: boolean; data: User[] }> {
    return this.http.get<{ success: boolean; data: User[] }>(`${environment.apiUrl}/admin/public-agents`);
  }

  createUser(userData: FormData): Observable<{ success: boolean; data: User }> {
    return this.http.post<{ success: boolean; data: User }>(`${environment.apiUrl}/admin/users`, userData);
  }

  updateUser(id: string, userData: FormData): Observable<{ success: boolean; data: User }> {
    return this.http.put<{ success: boolean; data: User }>(`${environment.apiUrl}/admin/users/${id}`, userData);
  }

  deleteUser(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${environment.apiUrl}/admin/users/${id}`);
  }

  // Configuración
  getSettings(): Observable<{ success: boolean; data: any }> {
    return this.http.get<{ success: boolean; data: any }>(`${environment.apiUrl}/admin/settings`);
  }

  getPublicSettings(): Observable<{ success: boolean; data: any }> {
    return this.http.get<{ success: boolean; data: any }>(`${environment.apiUrl}/admin/settings/public`);
  }

  updateSettings(settingsData: FormData): Observable<{ success: boolean; data: any }> {
    return this.http.put<{ success: boolean; data: any }>(`${environment.apiUrl}/admin/settings`, settingsData);
  }
}
