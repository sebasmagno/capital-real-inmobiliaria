import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<Toast[]>([]);
  private counter = 0;

  show(message: string, type: ToastType = 'info') {
    console.log(`[ToastService] Showing ${type}: ${message}`);
    const id = this.counter++;
    const toast: Toast = { id, message, type };
    
    this.toasts.update(t => [...t, toast]);
    console.log(`[ToastService] Active toasts:`, this.toasts());

    // Auto-remove after 4 seconds
    setTimeout(() => {
      this.remove(id);
    }, 4000);
  }

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error');
  }

  warning(message: string) {
    this.show(message, 'warning');
  }

  info(message: string) {
    this.show(message, 'info');
  }

  remove(id: number) {
    console.log(`[ToastService] Removing toast ${id}`);
    this.toasts.update(t => t.filter(x => x.id !== id));
  }
}
