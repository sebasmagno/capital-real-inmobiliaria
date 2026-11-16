import { Component, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../../../core/services/config';
import { LeadService } from '../../../core/services/lead';
import { ToastService } from '../../../core/services/toast.service';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-contact',
  imports: [FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact implements OnInit {
  configService = inject(ConfigService);
  private leadService = inject(LeadService);
  private toastService = inject(ToastService);
  private seoService = inject(SeoService);
  
  nombre = signal('');
  apellidos = signal('');
  email = signal('');
  telefono = signal('');
  mensaje = signal('');
  isSending = signal(false);
  enviado = signal(false);

  ngOnInit(): void {
    this.seoService.setPageSEO({
      title: 'Contacto y Ubicación | CAPITAL REAL INMOBILIARIA Pereira',
      description: 'Ponte en contacto con CAPITAL REAL INMOBILIARIA en Pereira. Asesoría para compra, venta y arriendo de propiedades. Visítanos o comunícate vía WhatsApp.',
      keywords: 'contacto inmobiliaria pereira, oficina capital real, telefono inmobiliaria pereira',
      url: '/contacto'
    });
  }

  private buildFullName(): string {
    return `${this.nombre().trim()} ${this.apellidos().trim()}`.trim();
  }

  private buildMessageBody(): string {
    return `Hola, mi nombre es ${this.buildFullName()}.\n\nMi correo es: ${this.email()}\nTeléfono: ${this.telefono() || 'No especificado'}\n\nMensaje:\n${this.mensaje()}`;
  }

  enviarFormulario() {
    if (!this.nombre().trim() || (!this.email().trim() && !this.telefono().trim()) || !this.mensaje().trim()) {
      this.toastService.error('Completa tu nombre, un medio de contacto (correo o teléfono) y tu mensaje.');
      return;
    }

    this.isSending.set(true);
    this.leadService.createLead({
      name: this.buildFullName(),
      email: this.email().trim() || 'sin-correo@contacto.local',
      phone: this.telefono().trim(),
      message: this.mensaje().trim(),
      source: 'WEB_CONTACTO'
    }).subscribe({
      next: () => {
        this.isSending.set(false);
        this.enviado.set(true);
        this.toastService.success('¡Mensaje enviado correctamente! Nuestro equipo te contactará pronto.');
        this.nombre.set('');
        this.apellidos.set('');
        this.email.set('');
        this.telefono.set('');
        this.mensaje.set('');
      },
      error: (err) => {
        this.isSending.set(false);
        this.toastService.error(err.error?.error || 'Error al enviar el mensaje.');
      }
    });
  }

  enviarPorWhatsApp() {
    if (this.nombre().trim() && this.mensaje().trim()) {
      this.leadService.createLead({
        name: this.buildFullName(),
        email: this.email().trim() || 'sin-correo@whatsapp.local',
        phone: this.telefono().trim(),
        message: this.mensaje().trim(),
        source: 'WHATSAPP_CONTACTO'
      }).subscribe({ error: () => {} });
    }

    const phone = this.configService.settings().phone.replace(/\D/g, '');
    const numero = phone || '573000000000'; 
    const texto = encodeURIComponent(this.buildMessageBody());
    window.open(`https://wa.me/${numero}?text=${texto}`, '_blank');
  }
}
