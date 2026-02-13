# 🚀 Crystal Launcher (V2.0)

El cliente oficial para **CrystalTides SMP**, rediseñado desde cero en **Flutter** + **Rust**.

## 🏗️ Arquitectura

El launcher sigue un diseño híbrido para maximizar rendimiento y estética:

- **Frontend**: Flutter (Dart). Renderiza la UI a 60FPS con estética "Crystal Dark".
- **Backend Core**: Rust (Crate nativo). Maneja la lógica pesada (Hash checking, Launching, Memory Mgmt).
- **Bridge**: Dart FFI (Foreign Function Interface) conecta Flutter con Rust.
- **Persistencia**:
  - **Drift (SQLite)**: Almacena configuraciones locales (RAM, rutas, resolución).
  - **Secure Storage**: Almacena tokens de sesión (JWT) de forma segura.

## 📂 Estructura de Carpetas

```
apps/launcher/
├── lib/
│   ├── layouts/     # Shells principales (MainLayout)
│   ├── pages/       # Pantallas (HomePage, SettingsPage)
│   ├── widgets/     # Componentes reusables 
│   ├── services/    # Lógica de negocio (ModService, AuthService)
│   └── models/      # Data Classes
├── native/          # Código Rust (game_bridge_core)
├── assets/
│   ├── images/      # Logos y fondos
│   └── web/         # Archivos HTML locales (Skin Viewer)
└── windows/         # Código nativo del host de Windows
```

## 🛠️ Desarrollo

### Pre-requisitos

1.  **Flutter SDK** (Channel Stable).
2.  **Rust Toolchain** (Cargo).
3.  **Visual Studio** (C++ Desktop Development workload) para compilar en Windows.

### Comandos Comunes

- `flutter pub get`: Instalar dependencias Dart.
- `flutter run -d windows`: Iniciar en modo Debug.
- `flutter build windows`: Compilar versión de producción (`.exe`).

## 🗺️ Roadmap Técnico (Resumen)

- **Instalador Nativo (Rust)**: Un único ejecutable `.exe` ligero y rápido que despliega la aplicación sin dependencias externas visibles.
- **Fase 1 (Actual)**: Infraestructura UI. Noticias, Login (Supabase), Skin Viewer.
- **Fase 2**: Game Bridge. Rust se encarga de descargar e iniciar Java.
- **Fase 3**: Sync. Actualizaciones diferenciales de modpacks (Hash-based).

## 💡 Notas de Legado


- **Rive**: Se utilizará para animaciones de carga complejas.
- **Webview**: Se utiliza exclusivamente para renderizar el Skin Viewer 3D localmente.

---

_Documentación generada el 11 de Enero de 2026._
