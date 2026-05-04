# Auditoría de Frontend: Angular 21 (Mayo 2026)

Se confirma que el proyecto utiliza **Angular 21.2.0**. A continuación, el análisis de las funcionalidades aplicadas y las que se pueden modernizar para aprovechar al máximo esta versión:

## ✅ Funcionalidades de Angular 21 Ya Aplicadas:
1.  **Signals:** Manejo de estado reactivo mediante signals (`signal()`, `set()`, `update()`).
2.  **Control Flow Nativo:** Uso de `@if`, `@for` y `@empty` en lugar de directivas estructurales (`*ngIf`, `*ngFor`).
3.  **Standalone Components:** Todos los componentes son independientes (sin `NgModule`).
4.  **Tailwind CSS 4.x:** Integración con la versión más reciente de Tailwind para el diseño.

## 🚀 Mejoras de Angular 21 a Implementar:

### 1. Resource API (Carga de Datos Moderna)
*   **Antes:** Usar `HttpClient.subscribe()` en `ngOnInit`.
*   **Angular 21:** Usar el nuevo `resource()` o `rxResource()`. Estas APIs están diseñadas para signals, manejando automáticamente estados de carga, error y recarga sin suscripciones manuales.

### 2. Component Input Binding (Router)
*   **Antes:** Inyectar `ActivatedRoute` para obtener el ID de la URL.
*   **Angular 21:** Configurar el router con `withComponentInputBinding()` para recibir los parámetros de la URL directamente como inputs de señal (`input.required()`).

### 3. Signal-Based Components
*   **Mejora:** Eliminar el ciclo de vida `OnInit` tradicional en favor de `resource()` y `effect()`, logrando un código puramente declarativo y "Zoneless" (sin necesidad de Zone.js para detectar cambios).

### 4. Optimized Image Loading (`NgOptimizedImage`)
*   **Mejora:** Asegurar que todas las imágenes de alta resolución usen la directiva optimizada de Angular para precarga automática y prevención de LCP (Largest Contentful Paint) deficiente.

---
**Plan de Acción:** Procederé a refactorizar el componente `PropertyDetail` para demostrar el uso de `Resource API` y `Inputs` de señal de Angular 21.
