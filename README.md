# CAPITAL REAL INMOBILIARIA - Proyecto Full-Stack

Este repositorio contiene la solución completa para el portal inmobiliario de **CAPITAL REAL**. La aplicación está dividida en un backend robusto basado en Node.js y un frontend dinámico desarrollado en Angular.

## 📁 Estructura del Proyecto

*   **`real-estate-api/`**: Servidor API REST construido con Express, Prisma ORM y PostgreSQL.
*   **`real-estate-app/`**: Aplicación web SPA construida con Angular y Tailwind CSS.
*   **`docs/`**: Documentación técnica detallada y guías de instalación.

## 🚀 Inicio Rápido

Para poner en marcha el proyecto en un entorno local, sigue estos pasos:

1.  Asegúrate de tener **Node.js** y **PostgreSQL** instalados.
2.  Configura las variables de entorno en un archivo `.env` dentro de `real-estate-api/`.
3.  Instala las dependencias en ambas carpetas ejecutando `npm install`.
4.  Sincroniza la base de datos con `npx prisma migrate dev`.
5.  Inicia el servidor (`npm run dev`) y la aplicación (`npm start`).

> [!IMPORTANT]
> Para una guía detallada de instalación paso a paso, consulta el archivo [Guía de Instalación](docs/installation-guide.md).

## 🛠️ Características Principales

*   **Panel Administrativo:** Gestión completa de propiedades (CRUD) con subida de imágenes.
*   **Galería Interactiva:** Lightbox con navegación para visualizar propiedades.
*   **Seguridad:** Autenticación protegida mediante JWT (JSON Web Tokens).
*   **Diseño Premium:** Estética corporativa basada en los colores Azul Marino y Dorado de la marca.
*   **Auditoría:** Registro de acciones administrativas para mayor control.

## 📄 Documentación

Puedes encontrar más detalles sobre el diseño del sistema en:
*   [Arquitectura del Backend](docs/backend-architecture.md)
*   [Guía de Instalación](docs/installation-guide.md)

---
**Desarrollado con ❤️ para CAPITAL REAL INMOBILIARIA**
