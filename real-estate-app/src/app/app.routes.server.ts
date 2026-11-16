import { RenderMode, ServerRoute, PrerenderFallback } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'propiedades',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'agentes',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'contacto',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'propiedades/:id',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client,
    async getPrerenderParams() {
      try {
        const res = await fetch('https://capital-real-inmobiliaria.onrender.com/api/properties');
        const json = (await res.json()) as { success: boolean; data: any[] };
        if (json.success && Array.isArray(json.data)) {
          return json.data.map((p: any) => ({ id: String(p.id) }));
        }
      } catch (e) {
        console.warn('Failed to fetch properties for prerendering:', e);
      }
      return [];
    }
  },
  {
    path: 'admin/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'login',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];

