import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../../../core/services/config';

@Component({
  selector: 'app-contact',
  imports: [FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  configService = inject(ConfigService);
  
  nombre = signal('');
  apellidos = signal('');
  email = signal('');
  mensaje = signal('');

  private buildMessageBody(): string {
    return `Hola, mi nombre es ${this.nombre()} ${this.apellidos()}.\n\nMi correo es: ${this.email()}\n\nMensaje:\n${this.mensaje()}`;
  }

  enviarPorWhatsApp() {
    // Remove non-numeric characters from phone for WhatsApp link
    const phone = this.configService.settings().phone.replace(/\D/g, '');
    const numero = phone || '573000000000'; 
    const texto = encodeURIComponent(this.buildMessageBody());
    window.open(`https://wa.me/${numero}?text=${texto}`, '_blank');
  }

  enviarPorCorreo() {
    const destinatario = this.configService.settings().contactEmail || 'info@capitalreal.com';
    const asunto = encodeURIComponent(`Nuevo mensaje de contacto de ${this.nombre()}`);
    const cuerpo = encodeURIComponent(this.buildMessageBody());
    window.location.href = `mailto:${destinatario}?subject=${asunto}&body=${cuerpo}`;
  }
}
