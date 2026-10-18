import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export type LeadStatus =
  | 'NUEVO'
  | 'CONTACTADO'
  | 'VISITA_AGENDADA'
  | 'EN_NEGOCIACION'
  | 'CERRADO'
  | 'DESCARTADO';

export type LeadSource =
  | 'WEB_PROPIEDAD'
  | 'WHATSAPP_PROPIEDAD'
  | 'WEB_CONTACTO'
  | 'WHATSAPP_CONTACTO';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  source: LeadSource;
  status: LeadStatus;
  preferredDate?: string | null;
  notes?: string | null;
  propertyId?: string | null;
  property?: {
    id: string;
    title: string;
    location: string;
    price?: number;
    status?: string;
    images?: { url: string }[];
  } | null;
  assignedAgentId?: string | null;
  assignedAgent?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    imageUrl?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadDto {
  name: string;
  email: string;
  phone?: string;
  message: string;
  source: LeadSource;
  preferredDate?: string | null;
  propertyId?: string | null;
}

export interface UpdateLeadDto {
  status?: LeadStatus;
  notes?: string | null;
  preferredDate?: string | null;
  assignedAgentId?: string | null;
}

export interface LeadSummary {
  TODOS: number;
  NUEVO: number;
  CONTACTADO: number;
  VISITA_AGENDADA: number;
  EN_NEGOCIACION: number;
  CERRADO: number;
  DESCARTADO: number;
  [key: string]: number;
}

export interface LeadsResponse {
  success: boolean;
  data: Lead[];
  summary: LeadSummary;
}

@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /** Señal reactiva para mostrar el badge de Leads Nuevos en el sidebar administrativo */
  newLeadsCount = signal<number>(0);

  /** Endpoint público para registrar prospecto */
  createLead(dto: CreateLeadDto): Observable<{ success: boolean; data: Lead }> {
    return this.http.post<{ success: boolean; data: Lead }>(`${this.apiUrl}/leads`, dto);
  }

  /** Endpoint admin para obtener leads con filtros */
  getLeads(filters?: {
    status?: string;
    source?: string;
    assignedAgentId?: string;
    search?: string;
  }): Observable<LeadsResponse> {
    let params = new HttpParams();
    if (filters?.status && filters.status !== 'TODOS') {
      params = params.set('status', filters.status);
    }
    if (filters?.source && filters.source !== 'TODOS') {
      params = params.set('source', filters.source);
    }
    if (filters?.assignedAgentId && filters.assignedAgentId !== 'TODOS') {
      params = params.set('assignedAgentId', filters.assignedAgentId);
    }
    if (filters?.search && filters.search.trim() !== '') {
      params = params.set('search', filters.search.trim());
    }

    return this.http
      .get<LeadsResponse>(`${this.apiUrl}/admin/leads`, { params })
      .pipe(
        tap((res) => {
          if (res.success && res.summary) {
            this.newLeadsCount.set(res.summary.NUEVO || 0);
          }
        })
      );
  }

  /** Endpoint admin para actualizar estado, notas, fecha de visita o agente */
  updateLead(id: string, dto: UpdateLeadDto): Observable<{ success: boolean; data: Lead }> {
    return this.http.patch<{ success: boolean; data: Lead }>(
      `${this.apiUrl}/admin/leads/${id}`,
      dto
    );
  }

  /** Endpoint admin para eliminar un lead */
  deleteLead(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/admin/leads/${id}`
    );
  }

  /** Actualiza silenciosamente el contador de leads nuevos para el sidebar */
  refreshNewLeadsCount(): void {
    this.getLeads().subscribe({
      error: () => {}
    });
  }
}
