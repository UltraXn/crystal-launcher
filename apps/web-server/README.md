# ⚡ Servidor Web CrystalTides (Backend)

La API backend principal para la plataforma **CrystalTides SMP**. Maneja la autenticación, procesamiento de datos del juego, pagos e integraciones con servicios externos (Discord, Twitch, Minecraft).

## 🏗️ Stack Tecnológico

- **Runtime**: Node.js
- **Framework**: Express / Custom (TypeScript)
- **Base de Datos**: Supabase (PostgreSQL) y MySQL (Datos del Juego)
- **Autenticación**: Supabase Auth
- **Integraciones**:
  - Google Calendar (Eventos)
  - Pterodactyl (Control del Servidor)
  - Twitch API (Clips y Auth)

## 📂 Estructura del Proyecto

- `controllers/`: Manejadores de peticiones.
- `routes/`: Definición de endpoints de la API.
- `services/`: Lógica de negocio y clientes de API externos.
- `middleware/`: Capas de autenticación y validación.
- `schemas/`: Esquemas de validación Zod.

## 🚀 Comenzando

### Prerrequisitos

- Node.js 18+
- npm o pnpm

### Instalación

```bash
npm install
```

### Variables de Entorno

Mira `.env.example` para las claves de configuración requeridas. Necesitarás credenciales para Supabase, Google Cloud y Twitch.

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev
```

### Build

```bash
npm run build
```
