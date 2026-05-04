import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  imports: [FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  nombre = signal('');
  apellidos = signal('');
  email = signal('');
  mensaje = signal('');

  private buildMessageBody(): string {
    return `Hola, mi nombre es ${this.nombre()} ${this.apellidos()}.\n\nMi correo es: ${this.email()}\n\nMensaje:\n${this.mensaje()}`;
  }

  enviarPorWhatsApp() {
    const numero = '34900123456'; // Número de ejemplo de la app
    const texto = encodeURIComponent(this.buildMessageBody());
    window.open(`https://wa.me/${numero}?text=${texto}`, '_blank');
  }

  enviarPorCorreo() {
    const destinatario = 'info@capitalreal.com';
    const asunto = encodeURIComponent(`Nuevo mensaje de contacto de ${this.nombre()}`);
    const cuerpo = encodeURIComponent(this.buildMessageBody());
    window.location.href = `mailto:${destinatario}?subject=${asunto}&body=${cuerpo}`;
  }
}
