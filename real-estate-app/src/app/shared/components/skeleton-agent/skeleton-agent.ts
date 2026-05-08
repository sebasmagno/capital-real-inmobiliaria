import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-agent',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center animate-pulse">
      <div class="w-32 h-32 rounded-full bg-slate-200 mb-6"></div>
      <div class="h-6 bg-slate-200 rounded-md w-3/4 mb-2"></div>
      <div class="h-4 bg-slate-100 rounded-md w-1/2 mb-6"></div>
      <div class="w-full space-y-3">
        <div class="h-10 bg-slate-50 rounded-xl w-full"></div>
        <div class="h-10 bg-slate-50 rounded-xl w-full"></div>
      </div>
    </div>
  `
})
export class SkeletonAgent {}
