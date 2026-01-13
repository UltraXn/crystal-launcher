# Crystaltides Roadmap & Tasks

## 📦 Infraestructura y Mantenimiento (Logros 10 Enero)

- [x] **Reorganización Masiva de Documentación**:
  - [x] Estructuración de carpeta `docs/` (architecture, components, operations, etc.).
  - [x] Script de automatización `reorganize-docs.ps1` creado y ejecutado.
  - [x] Creación de `README.md` maestro de documentación.
- [x] **Infraestructura IA (MCP)**:
  - [x] Fix crítico en `tools.yaml` (Soporte SQL Dinámico con `templateParameters`).
  - [x] Documentación de arquitectura: `Arquitectura MCP de Agente IA.md`.
- [x] **Gestión de Conocimiento (Obsidian)**:
  - [x] Extracción de Snippets clave (Rust JNI, React Query, Zod).
  - [x] Creación de Backlog de Conceptos (Game Director, TOON Integration).

## 🚀 Migración a TanStack Query (Admin Panel)

- [x] Migrar `UsersManager.tsx` a TanStack Query.
- [x] Migrar `AdminNews.tsx` a TanStack Query.
- [x] Migrar `WikiManager.tsx` a TanStack Query.
- [x] Migrar `DonationsManager.tsx` a TanStack Query.
- [x] **Traducción dinámica**:
  - [x] Actualizar `GamificationManager.tsx` para soportar campos `name_en`, `description_en`.
  - [x] Botón "Auto-Translate" en Admin para facilitar creación.
  - [x] Lógica en `Account.tsx` y `PublicProfile.tsx` para mostrar `_en` si el user tiene idioma Inglés.
  - [x] Traducción completa de preferencias de comunidad y status message (JSONs).
- [x] Migrar `GamificationManager.tsx` a TanStack Query.
- [x] Migrar `EventsManager.tsx` a TanStack Query.
- [x] Migrar `DonorsManager.tsx` a TanStack Query.
- [x] Migrar `StaffCardsManager.tsx` a TanStack Query.
- [x] Refinar tipos en `useAdminData.ts` (Payloads y Retornos).
- [x] Resolver errores de tipos y `any` en `SuggestionsManager.tsx`, `TicketsManager.tsx`, `GamificationManager.tsx`, `PollsManager.tsx` y `AuditLog.tsx`.
- [x] Documentar API en Swagger/OpenAPI (Wiki, Polls, Donations, Tickets, Suggestions, Events).
- [x] Migrar `DashboardOverview.tsx` a TanStack Query.
- [x] Migrar `SiteConfig.tsx` a TanStack Query.
- [x] Implementar validación Zod en TODAS las rutas restantes (Discord, Gacha, Logs, Settings).

## 🛡️ Seguridad y Validación

- [x] Implementar middleware de validación Zod.
- [x] Asegurar rutas de administración con `checkRole`.
- [x] Validar esquemas de Tickets y Sugerencias.
- [x] Validar esquemas de Noticias y Wiki.
- [x] Validar esquemas de Donaciones, Eventos y Logs.
- [x] Validar esquemas de Discord y Gacha.

## 📄 Documentación API

- [x] Configurar Swagger UI en `/api/docs`.
- [x] Documentar rutas de Usuarios y Perfiles.
- [x] Documentar rutas de Noticias y Wiki.
- [x] Documentar rutas de Tickets y Sugerencias.
- [x] Documentar rutas de Eventos y Donaciones.
- [x] Documentar rutas de Encuestas (Polls).

## 🎮 Launcher V2 Development (Reboot 2026)

- [ ] **Fase 1: Fundamentos y Autenticación**:
  - [x] **Project Reset**: Reinicio limpio de Flutter con soporte Windows/Android (Done).
  - [x] **Core Setup**: Configuración de `window_manager`, `.env`, y estructura base.
  - [x] **Infrastructure**:
    - [x] **Session Service**: Gestión unificada de sesiones (Invitado, Crystal, Microsoft) con persistencia local.
    - [ ] **Drift (SQLite)**: Persistencia de configuración avanzada (RAM, Java Path).
    - [ ] **Rive**: Integración para animaciones vectoriales de carga y estados "Empty".
  - [x] **Configuración (Drift)**: Implementar guardado de RAM, Java Path y Resolución. <!-- id: 71 -->
  - [x] **Logout**: Implementar botón de cerrar sesión. <!-- id: 72 -->
  - [x] **Lógica de Juego**: Implementar JavaService y ProcessRunner (Básico). <!-- id: 73 -->
  - [x] **Supabase Auth**: Implementar Login (Email/Password) y sesión persistente.
  - [x] **UI/UX Base**: Implementar Login Page con soporte Multi-Auth (Dual Login).

## 🌐 Web Client Enhancements (Profile & Account)

- [x] **Web Admin Fixes**: Corrección de traducciones y UI en Gamification/Audit.
- [x] **Profile Wall - Fix Comments Loading** <!-- id: 18 -->
  - [x] Fix "Foreign key violation" error (PGRST200) <!-- id: 19 -->
  - [x] Verify database relationships (`profile_comments` -> `profiles`) <!-- id: 20 -->
  - [x] Ensure comments load and display correctly <!-- id: 21 -->
- [x] Fix social icons in Public Profile (Discord/Twitch/etc.) <!-- id: 7 -->
- [x] Add social links (YouTube) to Account Settings <!-- id: 8 -->
- [x] Fix sidebar navigation icons (Overview -> Dashboard) <!-- id: 9 -->
- [x] Add GUI for comment deletion (Confirmation Modal) <!-- id: 23 -->
- [x] **Profile & Forum Enhancements**:
  - [x] Fix Avatar display logic in Profile Wall (Priority to Social/Session).
  - [x] Unify display names (Header & Wall) to respect 'Full Name' over Username.
  - [x] Add 'Status Message' display to Public Profile Header with local session priority.
  - [x] Refined 'Status Message' UI to Speech Bubble (below name, Shadcn style).
  - [x] Fix 401 Unauthorized when creating forum threads (added Auth header).
  - [x] Implement Profile Tooltips in Forum (Thread Header & Comments) with fresh data and 100% ProfileWall parity (Unified UI, Minecraft Nick logic, Status Message & social fields).
  - [x] **Fix Public Profile Slug**: Corregir error 404 en perfiles con espacios en el nombre (slugify).
  - [x] **Player Stats 404 Fix**: Asegurar que las estadísticas se busquen usando el Minecraft Nick o UUID correcto.
  - [x] **Donor Honor List Editor**:
    - [x] Full CRUD implementation with TanStack Query.
    - [x] Premium UI for Cards, Modals and Reordering (Drag & Drop).
    - [x] Fixed translation utility buttons and consistent premium styling.

- [x] **Internationalization**:
  - [x] Translate Achievements and Medals (Static & Dynamic support).

- [ ] **Fase 2: Lógica de Juego (Game Core)**:

  - [ ] **Microsoft Auth**: Integración de OAuth2 real (Actualmente Placeholder).
  - [ ] **Game Launching**: Lógica de descarga de assets y ejecución de Java (ProcessRunner).
  - [ ] **RAM & Settings**: Gestión de asignación de memoria y rutas de Java.

- [ ] **Fase 3: Gestión de Modpacks (Crystal Sync)**:
  - [ ] **Manifest System**: Sistema de control de versiones de mods (Hash verification).
  - [ ] **Differential Auto-Updater**: Sistema nativo de parches (reemplazo de Lua Patching) para actualizaciones delta.
  - [ ] **Integrity Check**: Validación de archivos antes de cada lanzamiento.

- [ ] **Fase 4: Pulido y Características Extra**:
  - [ ] **News Feed**: Integración con API `/news` del servidor web.
  - [ ] **Server Status**: Ping en tiempo real al servidor y visualización de jugadores.
  - [ ] **Skin Viewer**: Re-implementación del visor 3D (WebView/MineRender).

- [ ] **Fase 5: Game Bridge & Agent (Rust Core)**:
  - [ ] **Native Integration**: Compilar e integrar `apps/game-bridge/native-core` con FFI.
  - [ ] **RPC Link**: Comunicación bidireccional Launcher <-> Minecraft Client.
  - [ ] **Anti-Cheat Basics**: Validación de integridad de memoria desde el Agente.

## 🛠️ Deuda Técnica y Futuro (Pendiente)

- [x] **Auditoría de Secretos**: Verificado con `rg` que no hay secretos activos expuestos en archivos trackeados (10 Enero).
- [ ] **Infraestructura**: Integrar sistema de analítica y reporte de crasheos (DuckDB).
- [x] **Docker Optimization**: Aplicar prácticas "Lightweight" (Non-root user, Prune dev deps) en todos los Dockerfiles (10 Enero).
- [ ] **Discord**: Bridge Chat bidireccional y logs avanzados.
- [ ] Implementar Error Boundaries para el panel.
- [ ] Limpiar componentes UI de lógica de negocio (mover a hooks).
- [x] **Mantenimiento UI**: Resolver advertencias de compatibilidad CSS (`background-clip`).
