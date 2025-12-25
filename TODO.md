# 🗺️ CrystalTides SMP - Admin & Web Master Plan

Este documento centraliza el roadmap completo del proyecto, incluyendo lo ya completado y las nuevas funcionalidades aprobadas.

## 🟢 Estado Actual (Completado)

### 1. Herramientas de Staff (Staff Hub) 🛡️

- **Kanban Board**: Tablero de tareas con Drag & Drop (`/admin` -> Staff Hub).
- **Staff Notes**: Muro de notas adhesivas para comunicación interna.

### 2. Gestión de Contenido Básico

- **Noticias, Eventos, Encuestas**: CRUDs básicos funcionales.

---

## 🟡 Próximos Pasos (Roadmap Aprobado)

### Fase 1: Configuración del Sitio (`SiteConfig`) ⚙️

Herramientas para que los Admins controlen la web pública sin tocar código.

- [x] **Broadcast Manager**: Sistema de alertas globales (barra superior).
- [x] **Hero Banner Manager**: Gestor del carrusel de la página de inicio (Imágenes, Textos).
- [ ] 🚧 **Gestor de Donadores**: Carrusel de donadores dinámico (Skin, Texto, Rangos, Rango default Donador).
- [x] **Reglas Interactivas**: Editor visual para la página `/rules`.

### Fase 2: Gamificación y Usuarios 👥

Mejoras para retención de usuarios y gestión de rangos.

- [x] **Sistema de Medallas**:
  - Panel para crear medallas (Icono, Título).
  - Asignación manual a usuarios.
- [x] **Staff Cards Manager**: Constructor visual de las cartas de presentación del equipo.
- [x] **Semáforo de Reclutamiento**: Widget para indicar estado de postulaciones.

### Fase 3: Web Pública y Utilidades 🌐

Nuevas secciones para los jugadores.

- [x] **Página `/staff`**: Visualización de las Staff Cards creadas.
- [x] **Perfil Público (`/u/usuario`)**:
  - Skin 3D interactiva (Preview renderizada).
  - Vitrina de Medallas ganadas.
- [x] **Command Palette**: Buscador global (`Ctrl + K`) para navegar rápido.
- [ ] **Mapa Dinámico (Dynmap)**: Integración del mapa en vivo (Plugin ya instalado).
- [x] **KilluCoin Gacha**: Minijuego visual de apertura de cajas.
  - [x] Integración Backend: Cooldown diario y validación segura (`gachaService`).
  - [x] Integración Premios: **CrystalBridge Inbox** (Cola MySQL para entrega asíncrona in-game).
  - [x] Historial de Drops: Registro completo en base de datos.
  - [ ] _Futuro: Integrar economía real (Vault) bidireccional._

### Fase 4: Mejoras de Calidad de Vida (UI/UX) ✨

- [x] **Centro de Notificaciones**: Avisos en la barra de navegación web.
- [x] **Tutorial Interactivo**: Guía para nuevos usuarios sobre las funcionalidades de la web.
- [x] **Botón para retroceder en el tutorial del inicio**: Permitir a los usuarios volver al paso anterior.

### Fase 5: Comunidad y Foros 🏛️

Transformación de la web en un centro social para los jugadores.

- [x] **Sistema de Foros (Core)**:
  - Categorías (Anuncios, General, Soporte, Off-topic).
  - Creación de temas con soporte para Markdown e Imágenes.
  - Sistema de comentarios y respuestas.
- [x] **Moderación de Foro**:
  - Herramientas para Admins: Pin, Lock.
  - Reporte de mensajes (Pendiente).
  - [ ] **Buzón de Sugerencias**: Agregar botón "Acciones Disciplinarias" para gestión de usuarios.
- [x] **Encuestas Integradas**: Votaciones oficiales vinculadas a temas del foro.

### Fase 6: Perfiles y Social 👤

- [x] **Perfiles Avanzados**:
  - [x] **Refactorización API Stats**: Servicio optimizado (`playerStatsService`) con arquitectura de 3 capas.
  - Integración real de estadísticas de juego (Kills, Deaths, Tiempo de juego, Economía).
  - Personalización de perfil (Bio, Enlaces sociales).
- [ ] **Muro de comentarios en perfiles**.
- [ ] **Wiki / Gamepedia**:
  - Sección informativa autogestionada para guías del servidor.

### Fase 7: Estructura Profesional (Monorepo) 🏗️

- [x] **Migración a Workspaces**: Configuración de `npm workspaces` en el root.
- [x] **Paquete Shared**: Creación de `@crystaltides/shared` para compartir tipos TS entre Front y Back.
- [ ] **Configuración Unificada**: Compartir reglas de ESLint y Prettier.
- [ ] **Turborepo**: Integración para builds ultra-rápidas.

### Fase 8: Integración Total (MC + Discord) 🔗

- [x] **Discord Webhooks**: Notificaciones automáticas de nuevos temas del foro.
- [x] **Minecraft Webhooks**: Endpoint para recibir eventos del juego (ej. Logros, Muertes).
- [x] **Secure Command Bridge**: Backend (`bridgeRoutes`, `commandService`) y Frontend (`SecureConsole.tsx`) listos.
- [x] **API First**: Migración de lógica insegura (RCON Legacy) a API Pterodactyl HTTP seguras.
- [ ] **Sincronización de Rangos**: Sistema para vincular rangos de Minecraft con roles de Discord.

### Fase 9: Internacionalización (i18n) Admin 🌍

- [ ] **Toggle Idioma Admin**: Agregar botones de Español/Inglés en el panel de administración.
- [ ] **Traducción Panel Admin**: Implementar soporte multiidioma completo en todas las secciones administrativas.

---

> [!IMPORTANT]
> Este documento se actualizará a medida que completemos cada módulo.
