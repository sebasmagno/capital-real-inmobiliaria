# Guía de Despliegue Gratis (Producción)

Esta guía explica cómo poner tu proyecto en internet sin costo alguno utilizando los mejores servicios de 2026.

---

## 🚀 Estrategia de Hosting

### 1. Base de Datos (PostgreSQL) - [Supabase](https://supabase.com/)
Supabase es la opción más sólida para tener PostgreSQL gratis.
1.  Crea un proyecto en Supabase.
2.  Ve a `Project Settings` > `Database`.
3.  Copia la `Connection string` (Transaction mode).
4.  Úsala en el archivo `.env` de tu backend como `DATABASE_URL`.

### 2. Backend (API Node.js) - [Render](https://render.com/)
Render permite desplegar servidores Express de forma sencilla.
1.  Crea un nuevo `Web Service`.
2.  Conecta tu repositorio de GitHub.
3.  Selecciona la carpeta `real-estate-api`.
4.  Configura las `Environment Variables` con tu `DATABASE_URL` de Supabase y tu `JWT_SECRET`.
5.  *Nota: El nivel gratuito entra en "sleep" tras 15 min de inactividad.*

### 3. Frontend (Angular) - [Vercel](https://vercel.com/)
Vercel es el estándar de oro para aplicaciones frontend.
1.  Importa tu repositorio de GitHub en Vercel.
2.  Selecciona la carpeta `real-estate-app`.
3.  Vercel detectará automáticamente que es Angular.
4.  Configura una variable de entorno `API_URL` que apunte a la URL que te dio Render.
5.  ¡Haz clic en Deploy!

---

## 🛠️ Checklist de Producción

*   [ ] **CORS:** Asegúrate de que el backend permita peticiones desde la URL de Vercel.
*   [ ] **SSL/HTTPS:** Todos estos servicios lo incluyen por defecto.
*   [ ] **Prisma Client:** En producción, recuerda ejecutar `npx prisma generate` antes del build.
*   [ ] **Environment:** Cambia `http://localhost:3000` por la URL real en los servicios de Angular.

---
**Guía preparada por:** Antigravity AI
**Proyecto:** CAPITAL REAL INMOBILIARIA
