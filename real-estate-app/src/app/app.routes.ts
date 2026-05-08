import { Routes } from '@angular/router';
import { Home } from './features/public/home/home';
import { Properties } from './features/public/properties/properties';
import { PropertyDetail } from './features/public/property-detail/property-detail';
import { Agents } from './features/public/agents/agents';
import { Contact } from './features/public/contact/contact';
import { Login } from './features/admin/login/login';
import { Layout } from './features/admin/layout/layout';
import { AdminPropertiesList } from './features/admin/admin-properties-list/admin-properties-list';
import { AdminPropertyForm } from './features/admin/admin-property-form/admin-property-form';
import { Dashboard } from './features/admin/dashboard/dashboard';
import { AdminAgentsList } from './features/admin/admin-agents-list/admin-agents-list';
import { AdminAgentForm } from './features/admin/admin-agent-form/admin-agent-form';
import { AdminSettings } from './features/admin/admin-settings/admin-settings';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Home, pathMatch: 'full' },
  { path: 'propiedades', component: Properties },
  { path: 'propiedades/:id', component: PropertyDetail },
  { path: 'agentes', component: Agents },
  { path: 'contacto', component: Contact },
  
  // Admin Routes
  { path: 'login', component: Login },
  { 
    path: 'admin', 
    component: Layout,
    canActivate: [authGuard],
    children: [
      // Al entrar a /admin redirige directamente al dashboard
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'properties', component: AdminPropertiesList },
      { path: 'properties/new', component: AdminPropertyForm },
      { path: 'properties/edit/:id', component: AdminPropertyForm },
      { path: 'agents', component: AdminAgentsList },
      { path: 'agents/new', component: AdminAgentForm },
      { path: 'agents/edit/:id', component: AdminAgentForm },
      { path: 'settings', component: AdminSettings }
    ]
  },
  
  { path: '**', redirectTo: '' }
];
