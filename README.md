# 🦋 CrystalTides Launcher

Un launcher de Minecraft modular y de alto rendimiento construido con **Flutter** y **Rust**. Inspirado en la estética de Lunar Client, diseñado para el ecosistema CrystalTides.

## 🏗️ Arquitectura

El launcher sigue una arquitectura de procesos desacoplada:

- **UI en Flutter**: Una interfaz premium basada en glassmorphism para la gestión del juego y ajustes.
- **Puente Nativo (Rust)**: Backend de alto rendimiento que maneja criptografía, bases de datos locales (SQLite) y parches en caliente.
- **Motor de Minecraft (Engine)**: Una capa de orquestación personalizada para la gestión de versiones y descarga de activos.

## 🚀 Características Clave

### ⚡ Descubrimiento Híbrido de Activos (Alta Velocidad)

El `MinecraftEngine` implementa una estrategia de **Descubrimiento Primero** para maximizar la eficiencia:

- **Reutilización Estándar**: Detecta automáticamente tu carpeta `%APPDATA%\.minecraft` (Windows) y las rutas del directorio personal en macOS/Linux.
- **Cero Redundancia**: Si los activos o librerías ya existen en tu instalación estándar de Minecraft, el launcher los **clona o enlaza** en lugar de descargarlos de nuevo.
- **Aislamiento**: Los archivos personalizados de CrystalTides se mantienen separados, asegurando que tu instalación vanilla permanezca intacta.

### 🧠 Integración con Game-Bridge

Inyecta de forma fluida el [Agente Crystal](https://github.com/UltraXn/crystal-agent) en procesos reales de Minecraft para HUDs y lógica dentro del juego.

### 🎨 UI/UX Premium

- **Glassmorphism**: Estética moderna de cristal esmerilado con animaciones a 60FPS.
- **Navegación con Estado**: Interfaz basada en barra lateral con integración profunda para ajustes y progreso de lanzamiento.
- **Animaciones Rive**: Gráficos vectoriales interactivos para una sensación de interfaz "viva".

## 📁 Estructura del Proyecto

- `lib/`: Código fuente de Flutter.
  - `services/`: Lógica central (MinecraftEngine, LaunchService, DownloadService).
  - `ui/`: Páginas y widgets personalizados.
  - `data/`: Persistencia basada en Drift.
- `native/`: El crate de Rust para el puente nativo.
- `windows/`: Corredor C++ específico de Windows y configuración de FFI.

## 🛠️ Desarrollo

### Requisitos Previos

- Flutter SDK 3.3x o superior
- Toolchain de Rust
- Visual Studio con "Desarrollo de escritorio con C++" (para compilación en Windows)

### Compilación del Core Nativo

Antes de ejecutar la app de Flutter, compila el código de Rust:

```bash
cd native
cargo build --release
```

### Ejecución de la Aplicación

```bash
flutter run -d windows
```

---

Construyendo la próxima generación de infraestructura para Minecraft. Impulsado por Rust y Flutter.
