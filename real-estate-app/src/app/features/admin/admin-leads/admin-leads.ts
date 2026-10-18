import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  LeadService,
  Lead,
  LeadStatus,
  LeadSummary
} from '../../../core/services/lead';
import { AdminService, User } from '../../../core/services/admin';
import { ToastService } from '../../../core/services/toast.service';
import { ConfigService } from '../../../core/services/config';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-leads',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-leads.html',
  styleUrl: './admin-leads.css'
})
export class AdminLeads implements OnInit {
  private leadService = inject(LeadService);
  private adminService = inject(AdminService);
  private toastService = inject(ToastService);
  public configService = inject(ConfigService);

  leads = signal<Lead[]>([]);
  agents = signal<User[]>([]);
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);

  summary = signal<LeadSummary>({
    TODOS: 0,
    NUEVO: 0,
    CONTACTADO: 0,
    VISITA_AGENDADA: 0,
    EN_NEGOCIACION: 0,
    CERRADO: 0,
    DESCARTADO: 0
  });

  // Filtros
  selectedStatus = signal<string>('TODOS');
  selectedSource = signal<string>('TODOS');
  selectedAgentId = signal<string>('TODOS');
  searchQuery = signal<string>('');

  // Drawer de detalle/seguimiento
  activeLead = signal<Lead | null>(null);
  editStatus = signal<LeadStatus>('NUEVO');
  editAgentId = signal<string>('');
  editPreferredDate = signal<string>('');
  editNotes = signal<string>('');

  apiUrl = environment.apiUrl.replace('/api', '');

  readonly statusOptions: { value: LeadStatus; label: string; badgeClass: string; dotClass: string }[] = [
    { value: 'NUEVO', label: 'Nuevo', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200', dotClass: 'bg-blue-600' },
    { value: 'CONTACTADO', label: 'Contactado', badgeClass: 'bg-sky-50 text-sky-700 border-sky-200', dotClass: 'bg-sky-500' },
    { value: 'VISITA_AGENDADA', label: 'Visita Agendada', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200', dotClass: 'bg-purple-600' },
    { value: 'EN_NEGOCIACION', label: 'En Negociación', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200', dotClass: 'bg-amber-500' },
    { value: 'CERRADO', label: 'Cerrado / Ganado', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotClass: 'bg-emerald-600' },
    { value: 'DESCARTADO', label: 'Descartado', badgeClass: 'bg-slate-100 text-slate-600 border-slate-200', dotClass: 'bg-slate-400' }
  ];

  ngOnInit(): void {
    this.loadAgents();
    this.loadLeads();
  }

  loadAgents(): void {
    this.adminService.getUsers().subscribe({
      next: (res) => {
        if (res.success) {
          this.agents.set(res.data);
        }
      },
      error: () => {}
    });
  }

  loadLeads(): void {
    this.isLoading.set(true);
    this.leadService
      .getLeads({
        status: this.selectedStatus(),
        source: this.selectedSource(),
        assignedAgentId: this.selectedAgentId(),
        search: this.searchQuery()
      })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.leads.set(res.data);
            this.summary.set(res.summary);
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.toastService.error('No se pudieron cargar los prospectos.');
          this.isLoading.set(false);
        }
      });
  }

  filterByStatus(status: string): void {
    this.selectedStatus.set(status);
    this.loadLeads();
  }

  onFilterChange(): void {
    this.loadLeads();
  }

  clearFilters(): void {
    this.selectedStatus.set('TODOS');
    this.selectedSource.set('TODOS');
    this.selectedAgentId.set('TODOS');
    this.searchQuery.set('');
    this.loadLeads();
  }

  quickStatusChange(lead: Lead, newStatus: LeadStatus): void {
    this.leadService.updateLead(lead.id, { status: newStatus }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success(`Estado actualizado a "${this.getStatusLabel(newStatus)}"`);
          this.loadLeads();
          if (this.activeLead()?.id === lead.id) {
            this.activeLead.set(res.data);
            this.editStatus.set(res.data.status);
          }
        }
      },
      error: () => {
        this.toastService.error('No se pudo actualizar el estado del lead.');
      }
    });
  }

  openLeadDrawer(lead: Lead): void {
    this.activeLead.set(lead);
    this.editStatus.set(lead.status);
    this.editAgentId.set(lead.assignedAgentId || '');
    this.editNotes.set(lead.notes || '');
    if (lead.preferredDate) {
      this.editPreferredDate.set(lead.preferredDate.split('T')[0]);
    } else {
      this.editPreferredDate.set('');
    }
  }

  closeLeadDrawer(): void {
    this.activeLead.set(null);
  }

  saveLeadFollowUp(): void {
    const current = this.activeLead();
    if (!current) return;

    this.isSaving.set(true);
    this.leadService
      .updateLead(current.id, {
        status: this.editStatus(),
        assignedAgentId: this.editAgentId() || null,
        preferredDate: this.editPreferredDate() || null,
        notes: this.editNotes().trim() || null
      })
      .subscribe({
        next: (res) => {
          this.isSaving.set(false);
          if (res.success) {
            this.toastService.success('Seguimiento del prospecto guardado correctamente.');
            this.activeLead.set(res.data);
            this.loadLeads();
          }
        },
        error: () => {
          this.isSaving.set(false);
          this.toastService.error('Error al guardar el seguimiento.');
        }
      });
  }

  deleteLead(lead: Lead): void {
    if (!confirm(`¿Estás seguro de eliminar el registro de "${lead.name}"?`)) {
      return;
    }

    this.leadService.deleteLead(lead.id).subscribe({
      next: () => {
        this.toastService.success('Prospecto eliminado.');
        if (this.activeLead()?.id === lead.id) {
          this.closeLeadDrawer();
        }
        this.loadLeads();
      },
      error: () => {
        this.toastService.error('No se pudo eliminar el prospecto.');
      }
    });
  }

  openWhatsAppToLead(lead: Lead): void {
    if (!lead.phone) {
      this.toastService.error('Este prospecto no registró número telefónico.');
      return;
    }
    const cleanPhone = lead.phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`;
    const propInfo = lead.property ? ` sobre la propiedad *${lead.property.title}*` : '';
    const msg = encodeURIComponent(
      `Hola ${lead.name}, te saluda el equipo de *${this.configService.settings().companyName}*. Recibimos tu solicitud${propInfo} y queremos brindarte toda la información que necesitas.`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${msg}`, '_blank');
  }

  getStatusBadgeClass(status: LeadStatus): string {
    return (
      this.statusOptions.find((s) => s.value === status)?.badgeClass ||
      'bg-slate-100 text-slate-700 border-slate-200'
    );
  }

  getStatusLabel(status: LeadStatus): string {
    return this.statusOptions.find((s) => s.value === status)?.label || status;
  }

  getSourceLabel(source: string): string {
    switch (source) {
      case 'WEB_PROPIEDAD':
        return 'Web Propiedad';
      case 'WHATSAPP_PROPIEDAD':
        return 'WhatsApp Propiedad';
      case 'WEB_CONTACTO':
        return 'Web Contacto';
      case 'WHATSAPP_CONTACTO':
        return 'WhatsApp Contacto';
      default:
        return source;
    }
  }

  isWhatsAppSource(source: string): boolean {
    return source.includes('WHATSAPP');
  }

  getPropertyImageUrl(lead: Lead): string {
    const imgUrl = lead.property?.images?.[0]?.url;
    if (!imgUrl) return '/uploads/placeholder.jpg';
    return imgUrl.startsWith('http') ? imgUrl : `${this.apiUrl}${imgUrl}`;
  }
}
