# Guía de Instalación: CAPITAL REAL INMOBILIARIA

Esta guía detalla los pasos necesarios para instalar y ejecutar el proyecto completo (Frontend y Backend) en un computador nuevo, ya sea Windows o macOS.

---

## 1. Requisitos Previos (Software a instalar)

Antes de comenzar, asegúrate de tener instaladas las siguientes herramientas:

1.  **Node.js (Versión 18 o superior):** [Descargar aquí](https://nodejs.org/)
2.  **PostgreSQL (Base de datos):** [Descargar aquí](https://www.postgresql.org/download/)
    *   *Nota: Durante la instalación de Postgres, asegúrate de recordar la contraseña que asignes al usuario 'postgres'.*
3.  **Visual Studio Code (Recomendado):** [Descargar aquí](https://code.visualstudio.com/)
4.  **Git (Opcional, para clonar el repositorio):** [Descargar aquí](https://git-scm.com/)

---

## 2. Configuración del Backend (`real-estate-api`)

El backend es el corazón que maneja los datos y la lógica.

1.  **Entrar a la carpeta:** Abre una terminal y navega hasta `real-estate-api`.
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Configurar Variables de Entorno:**
    *   Crea un archivo llamado `.env` en la raíz de la carpeta `real-estate-api`.
    *   Copia y pega lo siguiente, ajustando tus credenciales de Postgres:
        ```env
        DATABASE_URL="postgresql://USUARIO:PASSWORD@localhost:5432/capital_real_db?schema=public"
        JWT_SECRET="clave_secreta_muy_segura"
        PORT=3000
        ```
4.  **Preparar la Base de Datos (Prisma):**
    *   Crea la base de datos y las tablas:
        ```bash
        npx prisma migrate dev --name init
        ```
    *   Carga los datos iniciales (Administrador y Propiedades de prueba):
        ```bash
        npx ts-node src/seed.ts
        ```
5.  **Ejecutar el servidor:**
    ```bash
    npm run dev
    ```

---

## 3. Configuración del Frontend (`real-estate-app`)

La interfaz visual construida en Angular.

1.  **Entrar a la carpeta:** Abre una terminal y navega hasta `real-estate-app`.
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Ejecutar la aplicación:**
    ```bash
    npm start
    ```
    *La aplicación estará disponible en `http://localhost:4200`.*

---

## 4. Notas Específicas por Sistema Operativo

### En Windows:
*   Usa **PowerShell** o **Git Bash** para ejecutar los comandos.
*   Si tienes problemas con la ejecución de scripts, abre PowerShell como administrador y ejecuta: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`.

### En macOS:
*   Si recibes errores de permisos al instalar dependencias, evita usar `sudo`. Es mejor usar un gestor como `nvm` o corregir los permisos de la carpeta `/usr/local/lib/node_modules`.

---

## 5. Resumen de Comandos de Uso Diario

| Acción | Comando (Carpeta) |
| :--- | :--- |
| Iniciar Backend | `npm run dev` (en real-estate-api) |
| Iniciar Frontend | `npm start` (en real-estate-app) |
| Ver Base de Datos | `npx prisma studio` (en real-estate-api) |

---
**Documentación generada por:** Antigravity AI
**Proyecto:** CAPITAL REAL INMOBILIARIA
