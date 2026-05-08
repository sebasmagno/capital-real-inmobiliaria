import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-property',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col h-full animate-pulse">
      <div class="relative h-56 bg-slate-200"></div>
      <div class="p-5 flex flex-col flex-grow space-y-4">
        <div class="h-8 bg-slate-200 rounded-md w-1/2"></div>
        <div class="h-6 bg-slate-200 rounded-md w-3/4"></div>
        <div class="h-4 bg-slate-100 rounded-md w-full"></div>
        <div class="pt-4 border-t border-slate-50 flex justify-between">
          <div class="h-4 bg-slate-100 rounded-md w-10"></div>
          <div class="h-4 bg-slate-100 rounded-md w-10"></div>
          <div class="h-4 bg-slate-100 rounded-md w-10"></div>
        </div>
      </div>
    </div>
  `
})
export class SkeletonProperty {}
