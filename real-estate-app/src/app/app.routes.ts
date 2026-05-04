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
      // Al entrar a /admin redirige directamente al listado de propiedades
      { path: '', redirectTo: 'properties', pathMatch: 'full' },
      { path: 'properties', component: AdminPropertiesList },
      { path: 'properties/new', component: AdminPropertyForm },
      { path: 'properties/edit/:id', component: AdminPropertyForm }
    ]
  },
  
  { path: '**', redirectTo: '' }
];
