# Documentación Técnica: Backend CAPITAL REAL INMOBILIARIA

Este documento detalla la arquitectura, configuración y guías de expansión del servidor API desarrollado para el portal inmobiliario.

---

## 1. Stack Tecnológico y Justificación
Se ha seleccionado un stack moderno enfocado en la **seguridad, tipado fuerte y velocidad de respuesta**.

*   **Node.js & Express:** El motor de ejecución y el framework web. Elegido por su capacidad para manejar miles de conexiones asíncronas simultáneas (ideal para un portal con mucho tráfico).
*   **TypeScript:** Añade una capa de seguridad al código mediante tipos. Evita el 90% de los errores comunes de programación en tiempo de ejecución.
*   **Prisma ORM:** Actúa como puente entre el código y la base de datos PostgreSQL.
    *   *¿Por qué Prisma y no SQL puro?* Prisma garantiza que el código y la base de datos siempre estén sincronizados, genera autocompletado inteligente y previene ataques de inyección SQL de forma nativa.
*   **JWT (JSON Web Tokens):** Estándar de la industria para la autenticación sin estado (stateless). Permite que el servidor sea escalable.

---

## 2. Arquitectura del Sistema
Hemos implementado una **Arquitectura de Capas Disociadas**. A diferencia de una estructura plana donde todo está mezclado, aquí dividimos las responsabilidades:

### Capas Aplicadas:
1.  **Capa de Configuración (`/config`):** Centraliza la conexión a la DB y el logger.
2.  **Capa de Middleware (`/middlewares`):** Filtros de seguridad (Auth) y auditoría que procesan la petición antes de que toque la lógica.
3.  **Capa de Controladores (`/controllers`):** Contiene la lógica de negocio pura.
4.  **Capa de Rutas (`/routes`):** Define los puntos de acceso (API Endpoints).

---

## 3. Validación de Requisitos de un "Excelente Backend"
Para que un backend se considere de grado profesional, debe cumplir estos puntos, los cuales **ya están implementados**:

*   [x] **Seguridad Robusta:** Las contraseñas nunca se guardan en texto plano (usamos `bcrypt`). Las rutas sensibles requieren un token firmado.
*   [x] **Manejo de Errores Uniforme:** Todas las respuestas fallidas devuelven un JSON consistente con un código de error explicativo.
*   [x] **Auditoría (Logging):** Cada acción administrativa queda registrada en un log, permitiendo saber qué se modificó y cuándo.
*   [x] **Gestión de Archivos Eficiente:** Las imágenes se procesan, se les asigna un nombre único y se vinculan a la base de datos mediante relaciones de integridad.
*   [x] **Escalabilidad de Datos:** Uso de migraciones controladas para que la base de datos evolucione sin romper el sistema.

---

## 4. Guía para el Desarrollador (Cómo expandir el sistema)

### A. Cómo agregar un nuevo Endpoint
1.  **Crear la función en el Controlador:** Define qué hará el nuevo endpoint en el archivo correspondiente (ej: `propertyController.ts`).
2.  **Registrar la Ruta:**
    *   **Si es Público:** Agrégala en `publicRoutes.ts`. Cualquiera podrá verla.
    *   **Si es Administrativo:** Agrégala en `adminRoutes.ts`. El sistema le exigirá automáticamente el Token de Administrador.

### B. Cómo modificar la Base de Datos (Tablas)
Si necesitas agregar una tabla (ej: `Message` para contactos) o un campo nuevo:

1.  Edita el archivo `prisma/schema.prisma`.
2.  Define el nuevo modelo:
    ```prisma
    model Message {
      id        String   @id @default(uuid())
      name      String
      email     String
      content   String
      createdAt DateTime @default(now())
    }
    ```
3.  Ejecuta en la terminal:
    ```bash
    npx prisma migrate dev --name add_messages_table
    ```
    *Esto creará la tabla en la base de datos real y actualizará el cliente de Prisma automáticamente.*

---

## 5. Recomendaciones Finales para el Futuro
Para que el proyecto siga siendo de élite a medida que crezca, recomiendo:

1.  **Validación de Esquemas (Zod/Joi):** Implementar una capa de validación que asegure que el cliente envíe exactamente los datos requeridos antes de procesarlos.
2.  **Caché con Redis:** Para las consultas de "Propiedades Destacadas", usar caché reduciría el tiempo de carga a milisegundos.
3.  **Tests Automatizados:** Crear pruebas que verifiquen que el Login nunca deje de funcionar tras una actualización.
4.  **Rate Limiting:** Limitar el número de peticiones por minuto desde una misma IP para evitar ataques de fuerza bruta.

---
**Elaborado por:** Antigravity AI
**Fecha:** 4 de Mayo, 2026
**Cliente:** CAPITAL REAL INMOBILIARIA
