# 🗺️ CrystalTides SMP - Admin & Web Master Plan

Este documento centraliza el roadmap completo del proyecto, organizando las tareas `Por Hacer`, `En Progreso` y los módulos ya `Completados`.

## 🟢 Completado (Módulos Listos)

### ✅ Gestión y Staff

- [x] **Staff Hub**: Kanban Board y Notas Adhesivas.
- [x] **Gestión de Contenido**: Noticias, Eventos, Encuestas (CRUDs).
- [x] **Staff Cards Manager**: Constructor de cartas de presentación.
- [x] **Semáforo de Reclutamiento**: Widget de estado.

### ✅ Web Pública

- [x] **Página `/staff`**: Visualización del equipo.
- [x] **Perfil Público**: Skin 3D y Medallas.
- [x] **Buscador Global**: Command Palette (`Ctrl + K`).
- [x] **KilluCoin Gacha**: Minijuego con backend seguro y entrega asíncrona (MySQL).

### ✅ Funcionalidades Core

- [x] **Foros**: Categorías, Markdown, Comentarios.
- [x] **Encuestas**: Votaciones integradas.
- [x] **Notificaciones**: Centro de avisos en navbar.
- [x] **Seguridad**: Roles centralizados, Middleware de Auth, Docker Scout.
- [x] **Integraciones**: Webhooks de Discord y Minecraft, Consola Segura (Pterodactyl).
- [x] **Internacionalización**: Panel Admin Bilingüe (ES/EN).

---

## 🚧 En Progreso y Pendientes (Roadmap)

### 🚨 Prioridad: Infraestructura

- [x] **Rate Limiting**: Protección Anti-Spam en rutas críticas.
- [x] **Cabeceras de Seguridad**: Implementar Helmet.js.
- [x] **Validación Backend**: Esquemas estrictos (Zod/Joi).

### 🚨 Alta Prioridad: Calidad de Código

- [x] **Inferencia de tipos en Frontend**: Reutilizar esquemas Zod en React (react-hook-form).
  - [x] Admin Noticias (`NewsForm` refactorizado)
  - [x] Login/Register
  - [x] Tickets
    - [x] Crear esquema Zod para tickets (`client/src/schemas/ticket.ts`)
    - [x] Refactorizar formulario de tickets con react-hook-form
  - [x] Perfil de Usuario
    - [x] Crear esquema Zod para usuario (`client/src/schemas/user.ts`)
    - [x] Refactorizar formulario de edición de perfil con react-hook-form
  - [x] Sugerencias (Nuevo)
    - [x] Crear esquema y refactorizar formulario.

### ⚙️ Configuración del Sitio (Fase 1)

- [x] **Broadcast & Hero Manager**: Gestores de alertas y banner.
- [ ] **Debug Hero Slides**: Revisar funcionalidad de carrusel (Baja Prioridad).
- [x] **Gestor de Donadores**: Carrusel dinámico.
- [x] **Reglas Interactivas (Editor)**: Página `/rules` dinámica con gestión desde el panel.
- [x] **Editor de Políticas**: `/privacy` y `/tos`.

### 👤 Perfiles y Social (Fase 6)

- [x] **Perfiles Avanzados**: Estadísticas reales y personalización (Bio/Redes).
- [x] **Muro de Comentarios**: Mensajes en perfiles.
- [x] **Selector de Avatar**: Opción para elegir entre Avatar Web (Discord) o Skin de Minecraft.
- [x] **Wiki / Gamepedia**: Sección de guías.

### 🎨 UX/UI y Diseño

- [ ] **Verificación de Dispositivos**: Revisar diseño responsivo en Tablet y Móvil (Web y Admin). (En progreso: Fixed Navbar mobile name & Support buttons).

### 🔗 Integración Profunda (Fase 8)

- [ ] **Sincronización de Rangos**: MC <-> Discord.
- [ ] **Requisito de Cuenta Vinculada**: Para tickets o gacha.
- [ ] **Integración Economía Real**: Vault bidireccional.

### 🏗️ Mantenimiento Profesional (Fase 7)

- [ ] **Configuración Unificada**: ESLint/Prettier compartido.

- [ ] **Turborepo**: Pipeline de build optimizado.
- [ ] **Mapa Dinámico**: Integración de Dynmap.

---

## 🚀 Notas de Mantenimiento

- [ ] **Higiene de Dependencias**: `npm audit fix` regular.
- [ ] **Monitoreo de Imágenes Base**.
- [x] **Overrides de Seguridad**: `package.json` protegido.

> Última actualización: 26 de Diciembre, 2025
