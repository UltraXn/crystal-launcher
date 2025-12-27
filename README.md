# 🌊 CrystalTides SMP - Web Ecosystem

Bienvenido al repositorio oficial del ecosistema web de **CrystalTides SMP**.
Esta plataforma integral sirve como el corazón digital de nuestra comunidad, conectando el juego (Minecraft) con la web a través de herramientas avanzadas de gestión, socialización y administración.

## 🏗️ Arquitectura Monorepo

Este proyecto opera bajo una arquitectura de **Monorepo** moderna, gestionando múltiples paquetes y servicios en un solo lugar para máxima consistencia y eficiencia.

| Directorio             | Descripción                          | Tecnologías                   |
| :--------------------- | :----------------------------------- | :---------------------------- |
| **`client/`**          | Portal Web y Panel de Administración | React, Vite, TSX, CSS Modules |
| **`server/`**          | API RESTful y Webhooks               | Node.js, Express, TypeScript  |
| **`packages/shared/`** | Librería de Tipos compartida         | TypeScript Interfaces & Types |
| **`CrystalCore/`**     | Plugin de Servidor (Minecraft)       | Java 21, Paper API            |

---

## ✨ Características Principales

### 🖥️ Web Pública (Jugadores)

- **Perfiles Interactivos (`/u/usuario`)**: Visualización de usuario con renderizado de **Skin 3D en tiempo real**, vitrina de medallas y estadísticas del juego.
- **Comunidad y Foros**: Sistema completo de foros con categorías, creación de temas (Markdown/Imágenes), comentarios y encuestas integradas.
- **Gamificación**: Sistema de "Staff Cards" coleccionables, medallas y minijuegos como "KilluCoin Gacha".
- **Utilidades**: Paleta de comandos (`Ctrl + K`) para navegación rápida, tutorial interactivo para nuevos usuarios y notificaciones en tiempo real.
- **Soporte**: Módulo de Tickets y sección de Reglas interactivas.

### 🛡️ Panel de Administración (Staff Hub)

Un centro de control potente para la gestión del servidor y la comunidad:

- **Staff Hub (Gestión Interna)**:
  - **Tablero Kanban**: Gestión de tareas del equipo con Drag & Drop, etiquetas y asignaciones.
  - **Notas Rápidas**: Muro de notas adhesivas para comunicación asíncrona.
- **Configuración del Sitio (`SiteConfig`)**:
  - Gestor visual de **Broadcasts** (Alertas globales).
  - Editor del **Hero Banner** y carrusel de inicio.
  - **Gestor de Donadores**: Administración visual del muro de fama.
- **Moderación**: Herramientas para gestionar usuarios, reportes de foros y logs de auditoría.
- **Contenido**: CRUDs para Noticias, Eventos, Encuestas y Cartas del Staff.

### 🔗 Integraciones (Bridge)

- **Secure Command Bridge**: Sistema de ejecución segura de comandos RCON mediante arquitectura _Pull_, eliminando la necesidad de exponer puertos RCON.
- **Sincronización Bidireccional**: Webhooks para eventos de Minecraft -> Web y notificaciones de Foro -> Discord.
- **Autenticación Unificada**: Login seguro vinculado a cuentas del juego.

---

## 🚀 Tecnologías y Stack

- **Frontend**: [React 18](https://reactjs.org/), [Vite](https://vitejs.dev/), [Framer Motion](https://www.framer.com/motion/) (Animaciones), [Recharts](https://recharts.org/) (Estadísticas).
- **Backend**: [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [Supabase](https://supabase.com/).
- **Base de Datos**: MySQL (Datos del juego/Plugin) + Supabase (Web data).
- **Minecraft**: Java 21 + Paper API.

---

## 🛠️ Instalación y Desarrollo

### 1. Prerrequisitos

- Node.js (v18+)
- Java JDK 21 (Para CrystalCore)
- Base de datos MySQL activa

### 2. Configuración Inicial

Desde la raíz del proyecto, instala todas las dependencias del monorepo:

```bash
npm install
```

### 3. Variables de Entorno

Crea los archivos `.env` en `client/` y `server/` basándote en los `.env.example` proporcionados. Asegúrate de configurar correctamente las claves de API y la conexión a la base de datos.

### 4. Ejecución en Desarrollo

Para levantar simultáneamente el cliente y el servidor:

```bash
npm start
```

---

## 🐳 Docker & Flujo de Trabajo Seguro

El proyecto utiliza Docker para garantizar entornos consistentes y **Docker Scout** para mantener la seguridad.

### 🛠️ Comandos de Desarrollo (Docker)

```powershell
# Levantar el ecosistema completo (Front, Back, Túnel)
docker-compose up -d

# Ver logs en tiempo real (útil para debuggear)
docker logs -f crystaltides-frontend-1
```

### 🛡️ Verificación de Seguridad (Indispensable antes de subir cambios)

Para garantizar un código libre de vulnerabilidades críticas:

```powershell
# 1. Reconstruir imágenes (limpieza profunda)
docker-compose build --no-cache

# 2. Escanear imágenes en busca de CVEs (Vulnerabilidades)
docker scout cves crystaltides-frontend:latest
docker scout cves crystaltides-backend:latest
```

### 🚀 Despliegue Automatizado (CI/CD)

Cualquier cambio empujado a la rama `main` o `master` disparará automáticamente una **GitHub Action** que:

1. Construye el proyecto.
2. Ejecuta un escaneo de seguridad con **Docker Scout**.
3. **Cancela el despliegue** automáticamente si se detectan vulnerabilidades Críticas o Altas.
4. Publica las imágenes seguras en `ghcr.io`.

Para más detalles, consulta la [Documentación de CI/CD](./docs/CI_CD.md).

---

Desarrollado con 💜 y **código de alto nivel** por **Neroferno Ultranix** para la comunidad de CrystalTides SMP.
