# Presupuesto y Costos de Producción: CAPITAL REAL INMOBILIARIA

Este documento detalla los costos operativos estimados para mantener la plataforma funcionando a nivel profesional (24/7 y con dominio propio).

---

## 1. Comparativa de Servicios (Prueba vs. Producción)

| Servicio | Opción Gratuita (Pruebas) | Opción Profesional (Producción) | Costo Estimado |
| :--- | :--- | :--- | :--- |
| **Backend (Render/Railway)** | El servidor se duerme tras 15 min. Carga inicial lenta. | Servidor siempre encendido. Respuesta instantánea. | **$7.00 USD / mes** |
| **Base de Datos (Supabase)** | Hasta 500MB de datos. Suficiente para iniciar. | Plan Pro para mayor almacenamiento y backups. | **$0.00 a $25.00 USD** |
| **Frontend (Vercel)** | Plan Hobby. Muy potente y rápido. | Plan Hobby es suficiente para PYMES. | **$0.00 USD** |
| **Dominio (.com)** | URL genérica (ej: `capital-real.vercel.app`) | Dominio propio (ej: `capitalreal.com`) | **$1.00 USD / mes** (pago anual) |

---

## 2. Presupuesto Mensual Estimado (Nivel Inicial Pro)

Para lanzar la aplicación de forma que los clientes tengan una experiencia fluida, este es el gasto mínimo recomendado:

1.  **Servidor API (Render Starter):** $7.00
2.  **Base de Datos (Supabase Free):** $0.00
3.  **Hosting Web (Vercel Free):** $0.00
4.  **Mantenimiento de Dominio:** $1.25 (Prorrateado de $15/año)

**TOTAL MENSUAL:** **$8.25 USD**  
*(Aprox. 33,000 - 35,000 Pesos Colombianos según TRM)*

---

## 3. ¿Cuándo escalar los costos?

Debes considerar aumentar tu presupuesto solo cuando ocurra lo siguiente:
*   **Almacenamiento:** Si superas las 500-1000 propiedades con múltiples fotos en alta resolución (Pasar a Supabase Pro).
*   **Tráfico masivo:** Si tienes más de 50,000 visitas al mes (Vercel Pro).
*   **Equipo de trabajo:** Si necesitas que más de 2 desarrolladores gestionen el despliegue (Planes de equipo en Render/Vercel).

---

## 4. Recomendaciones para el Dominio

Para la imagen corporativa de **CAPITAL REAL**, te recomiendo adquirir un dominio en:
*   **Namecheap** o **Cloudflare:** Suelen ser los más económicos para dominios `.com` (aprox $10-12 USD/año).
*   **Mi.com.co:** Si prefieres un dominio local `.com.co` o `.co` (aprox $15-20 USD/año).

---
**Análisis realizado por:** Antigravity AI
**Fecha:** 4 de Mayo, 2026
**Estatus:** Recomendación de Lanzamiento Inicial
