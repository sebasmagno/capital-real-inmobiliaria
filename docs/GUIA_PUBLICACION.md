# Guía de Publicación y Cambios del Proyecto - Capital Real Inmobiliaria

Este documento resume los pasos realizados, los cambios clave en el código y las consideraciones importantes para la publicación del proyecto **Capital Real Inmobiliaria**.

## 1. Resumen del Proyecto
El proyecto consiste en una plataforma inmobiliaria full-stack con:
- **Frontend**: Angular 21 (Signals, Zoneless, Resource API).
- **Backend**: Express.js con Prisma ORM y PostgreSQL.
- **Admin Panel**: Gestión completa de propiedades y agentes con subida de imágenes.
- **Almacenamiento**: Supabase Storage para imágenes de propiedades y agentes.
- **Despliegue**: Vercel (Frontend) y entorno compatible con Node.js (Backend).

---

## 2. Hitos de Desarrollo y Publicación

### A. Rebranding y Configuración Global
- Se cambió la identidad del proyecto a **CAPITAL REAL INMOBILIARIA**.
- Implementación de un `ConfigService` centralizado que maneja el nombre de la empresa, redes sociales y datos de contacto de forma reactiva.

### B. Optimización SEO
- **Metadata Dinámica**: Configuración de etiquetas Meta para cada página (título, descripción).
- **Archivos de Indexación**: Creación de `robots.txt` y `sitemap.xml` en la carpeta `public` para mejorar el rastreo de Google.
- **Mobile First**: Refinamiento de la interfaz de búsqueda para dispositivos móviles.

### C. Modernización de Angular (v21)
- **Signals**: Uso extensivo de `signal()` y `computed()` para la gestión de estado reactiva.
- **Resource API**: Implementación del nuevo `resource()` de Angular para llamadas HTTP asíncronas más limpias.
- **Zoneless**: Configuración `provideZonelessChangeDetection()` para un rendimiento superior al eliminar `zone.js`.

### D. Infraestructura de Backend y Almacenamiento
- **Prisma ORM**: Definición de modelos para `Property`, `Agent`, `Admin` y `Settings`.
- **Supabase Storage**: Integración de un `StorageService` para subir y eliminar imágenes directamente en la nube, evitando el almacenamiento local persistente en el servidor.
- **Multer Middleware**: Procesamiento de archivos multipart para la subida de imágenes.

---

## 3. Pasos para la Publicación en Producción

### Frontend (Angular)
1. **Configurar Variables de Entorno**:
   - Asegurarse de que `environment.prod.ts` apunte a la URL de la API de producción.
2. **Build de Producción**:
   ```bash
   npm run build
   ```
3. **Despliegue en Vercel**:
   - El archivo `vercel.json` ya está configurado para manejar rutas de SPA (redirigir todo a `index.html`).

### Backend (Express)
1. **Base de Datos**:
   - Ejecutar migraciones de Prisma: `npx prisma migrate deploy`.
   - Generar cliente Prisma: `npx prisma generate`.
2. **Variables de Entorno (.env)**:
   - `DATABASE_URL`: Conexión a PostgreSQL.
   - `JWT_SECRET`: Clave secreta para tokens.
   - `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`: Credenciales de Supabase.
3. **Inicio**:
   ```bash
   npm start
   ```

---

## 4. Notas y Advertencias Importantes

> [!IMPORTANT]
> **Seguridad de Supabase**: El bucket `real-estate-uploads` debe tener políticas de acceso público (Read) para que las imágenes sean visibles en la web, pero el acceso de escritura debe estar restringido a la API.

> [!WARNING]
> **CORS**: En el backend, asegúrate de que el middleware de CORS permita el dominio donde se despliegue el frontend (ej. Vercel).

> [!NOTE]
> **Tokens de Acceso**: El sistema de administración utiliza JWT almacenados en `localStorage`. Asegúrate de que la API tenga una expiración de token configurada adecuadamente.

---

## 5. Cambios Significativos en el Código

- **`real-estate-app/src/app/core/services/config.ts`**: Centraliza la marca del sitio.
- **`real-estate-api/src/services/storageService.ts`**: Maneja la lógica de subida a Supabase.
- **`real-estate-api/prisma/schema.prisma`**: Esquema de base de datos optimizado para relaciones de propiedades y agentes.
- **`real-estate-app/src/app/app.config.ts`**: Configuración de rendimiento zoneless y fetch API.
