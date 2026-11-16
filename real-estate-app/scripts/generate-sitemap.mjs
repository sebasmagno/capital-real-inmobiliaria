import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITEMAP_PATH = resolve(__dirname, '../public/sitemap.xml');
const BASE_URL = 'https://www.capitalrealinmobiliaria.com';
const API_URL = 'https://capital-real-inmobiliaria.onrender.com/api/properties';

async function generateSitemap() {
  console.log('[Sitemap] Fetching properties for sitemap generation...');
  const today = new Date().toISOString().split('T')[0];
  
  let properties = [];
  try {
    const res = await fetch(API_URL);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      properties = json.data;
      console.log(`[Sitemap] Successfully fetched ${properties.length} properties.`);
    }
  } catch (error) {
    console.warn('[Sitemap] Warning: Could not fetch properties from API, using fallback sitemap:', error.message);
  }

  const staticRoutes = [
    { loc: `${BASE_URL}/`, lastmod: today, changefreq: 'daily', priority: '1.0' },
    { loc: `${BASE_URL}/propiedades`, lastmod: today, changefreq: 'daily', priority: '0.9' },
    { loc: `${BASE_URL}/agentes`, lastmod: today, changefreq: 'weekly', priority: '0.7' },
    { loc: `${BASE_URL}/contacto`, lastmod: today, changefreq: 'monthly', priority: '0.6' }
  ];

  const propertyRoutes = properties.map(p => {
    const lastmod = p.updatedAt ? p.updatedAt.split('T')[0] : today;
    return {
      loc: `${BASE_URL}/propiedades/${p.id}`,
      lastmod,
      changefreq: 'weekly',
      priority: '0.8'
    };
  });

  const allRoutes = [...staticRoutes, ...propertyRoutes];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    r => `  <url>
    <loc>${r.loc}</loc>
    <lastmod>${r.lastmod}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  writeFileSync(SITEMAP_PATH, xml.trim(), 'utf-8');
  console.log(`[Sitemap] Successfully written sitemap with ${allRoutes.length} URLs to ${SITEMAP_PATH}`);
}

generateSitemap();
