import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="position: fixed; top: 20px; right: 20px; z-index: 99999; display: flex; flex-direction: column; gap: 10px; pointer-events: none; width: 350px;">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          style="pointer-events: auto; width: 100%; padding: 16px; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 2px solid; display: flex; align-items: center; justify-content: space-between; gap: 12px; background: white;"
          [style.border-color]="toast.type === 'success' ? '#10b981' : (toast.type === 'error' ? '#ef4444' : '#3b82f6')"
        >
          <div style="display: flex; align-items: center; gap: 12px;">
            <div 
              style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;"
              [style.background-color]="toast.type === 'success' ? '#10b981' : (toast.type === 'error' ? '#ef4444' : '#3b82f6')"
            >
              @if (toast.type === 'success') {
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" style="width: 24px; height: 24px;"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              } @else if (toast.type === 'error') {
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" style="width: 24px; height: 24px;"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" style="width: 24px; height: 24px;"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
              }
            </div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-weight: bold; font-size: 14px; color: #1e293b;">{{ toast.type === 'success' ? 'Éxito' : (toast.type === 'error' ? 'Error' : 'Información') }}</span>
              <span style="font-size: 13px; color: #64748b;">{{ toast.message }}</span>
            </div>
          </div>
          <button (click)="toastService.remove(toast.id)" style="cursor: pointer; background: none; border: none; padding: 4px; color: #94a3b8;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 20px; height: 20px;"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: []
})
export class ToastComponent {
  toastService = inject(ToastService);
}
