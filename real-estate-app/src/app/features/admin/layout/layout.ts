import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ConfigService } from '../../../core/services/config';
import { LeadService } from '../../../core/services/lead';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit {
  public authService = inject(AuthService);
  public configService = inject(ConfigService);
  public leadService = inject(LeadService);
  apiUrl = environment.apiUrl;

  ngOnInit() {
    this.configService.loadSettings();
    this.leadService.refreshNewLeadsCount();
  }

  onLogout() {
    this.authService.logout();
  }
}
