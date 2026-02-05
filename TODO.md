# Crystal Tides Launcher - Hoja de Ruta Técnica y TODOs

## 🗺️ Fases del Proyecto
- **Fase 1 (Actual)**: Infraestructura UI. Noticias, Login (Supabase), Skin Viewer.
- **Fase 2**: Game Bridge. Rust se encarga de descargar e iniciar Java.
- **Fase 3**: Sync. Actualizaciones diferenciales de modpacks (Hash-based).

## 🦀 Migración a Rust (Rendimiento y Estabilidad)
El objetivo es mover la lógica computacional pesada y las interacciones de bajo nivel con el sistema a Rust, manteniendo Flutter/Dart estrictamente para la UI/UX.

- [ ] **Hash y Verificación de Archivos**
    - Mover el cálculo de SHA-1/MD5 de mods y assets a Rust.
    - *Por qué:* Los `Isolates` de Dart son pesados. Rust puede verificar cientos de archivos en paralelo con una huella de memoria mínima y sin congelar la UI.

- [ ] **Extracción de Modpacks (Unzip)**
    - Implementar la extracción de `.zip` usando Rust (`zip` crate o similar).
    - *Por qué:* Descomprimir modpacks grandes consume mucha CPU. Rust es significativamente más rápido y evita el efecto de "La aplicación no responde" en Windows durante la extracción.

- [ ] **Gestor de Descargas Paralelo**
    - Crear un motor de descargas en Rust usando `tokio` + `reqwest`.
    - Características: Pausar/Reanudar, contenido parcial (Range headers), conexiones simultáneas por archivo.
    - *Por qué:* Mejor control sobre los recursos de red y E/S de disco que el cliente `http` de Dart.

- [ ] **Gestión de Procesos Java**
    - Manejar los argumentos de lanzamiento de Minecraft y el monitoreo del proceso vía Rust.
    - Usar APIs de Windows (vía `winapi` o `windows-rs`) para asegurar que el proceso inicie con alta prioridad y asignación de memoria correcta.
    - Monitoreo preciso del uso de RAM en tiempo real (leyendo estadísticas de memoria del proceso directamente).

- [ ] **Detección de Hardware del Sistema**
    - Detectar RAM y GPU disponibles para autoconfigurar los argumentos de Java.

## 📱 UI/UX (Flutter/Dart)
- [ ] **Integración de Ajustes**
    - Exponer las nuevas opciones basadas en Rust en la página de Ajustes (ej: "Hilos Máximos de Descarga").
- [ ] **Indicadores de Progreso en Tiempo Real**
    - Conectar eventos de Rust (progreso de descarga, porcentaje de descompresión) a Streams de Dart para barras de progreso fluidas.

## 🧹 Deuda Técnica
- [ ] Estandarizar logs entre Dart y Rust (enviar logs de Rust a la consola/archivo de Dart).
- [ ] Manejo de Errores Integral: Asegurar que los `panics` de Rust sean capturados y mostrados elegantemente en la UI de Flutter.
