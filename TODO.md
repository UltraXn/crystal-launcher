# Crystal Tides Launcher - Hoja de Roadmap & TODOs

## 🗺️ Fases del Proyecto
- **Fase 1 (Actual)**: Infraestructura UI. Noticias, Login (Supabase), Skin Viewer. ✅
- **Fase 2**: Game Bridge. Rust se encarga de descargar e finalizar la instalación. ✅
- **Fase 3**: Sync. Actualizaciones diferenciales de modpacks (Hash-based). ✅ (Implementado via R2/Supabase)
    - *Nota*: Se mantiene sincronización por archivo (Jars) pero con verificación final obligatoria para asegurar integridad antes de lanzar.

---

## 🧠 Integración Game-Bridge (Estabilidad del Sistema)
*El Game-Bridge (Java Agent + Rust) debe enfocarse en mantener la integridad del proceso Java, no en la jugabilidad.*
- [ ] **Session Reviver**: Refrescar el token de sesión en caliente sin reiniciar el juego si expira (evita "Invalid Session").
- [ ] **Freeze Watchdog**: Detectar bucles infinitos (juego congelado) y forzar un volcado de pila para depuración antes de cerrar.
- [ ] **Window Focus Handler**: Asegurar que la ventana del juego obtenga el foco correctamente al iniciar (evita arranque minimizado).
- [ ] **Log Tunneling Directo**: Enviar logs a la consola del launcher instantáneamente sin escribir en disco (para Live Log Viewer).

---

## 🛡️ Seguridad & Privacidad (Hardening)
- [ ] **Modo Streamer ⭐**: Switch para ocultar IP, correo y datos sensibles en la UI.
- [ ] **Alerta de VPN/Proxy**: Detectar VPNs activas antes del lanzamiento para evitar auto-bans.
- [ ] **Device Fingerprinting**: Vincular sesiones a hardware ID.
- [ ] **Integrity Check**: Verificación de hash del ejecutable.
- [ ] **Code Signing**: Firmado digital del binario.
- [ ] **Ofuscación Avanzada**: Proteger lógica interna y strings sensibles en Rust/Dart.

---

## 🦀 Motor & Optimización (Rust Core)
- [x] **Hash y Verificación de Archivos** ✅
- [x] **Extracción de Modpacks (Unzip)** ✅
- [x] **Gestor de Descargas Paralelo** ✅
- [x] **Java Runtime Manager (URGENTE)**: Descargar e instalar automáticamente versiones de Java optimizadas (GraalVM/Adoptium) al primer inicio. Adiós errores de DLL y rendimiento inconsistente. ✅
- [ ] **Network Packet Optimizer**: Ajustar TCP/IP de Windows al lanzar el juego para mejorar HitReg y reducir ping.
- [ ] **P2P LAN Updates**: Detectar otros PCs en la red local y copiar archivos a velocidad Gigabit en lugar de descargar de internet.
- [ ] **Mod Dependency Audit**: Verificar `mods.toml` antes de lanzar para alertar sobre librerías faltantes.
- [ ] **Deduplicador de Archivos (Hardlinks)**: Usar Rust para evitar duplicados entre instancias y ahorrar hasta un 60% de disco.
- [ ] **Smart Snapshots**: Backups rápidos (via hardlinks) antes de cada update para revertir en segundos.
- [ ] **CTLauncher SE (UltraLite Version)**: Una build paralela enfocada en velocidad extrema y 0 consumo de RAM (sin animaciones, sin webviews, UI nativa pura). Ideal para hardware legacy.
- [ ] **Silent Warm-up**: Iniciar verificación de archivos y pre-descarga de metadatos en segundo plano mientras el usuario navega la UI para que la sección de mods cargue instantáneamente.
- [ ] **Instance Cloner**: Botón para duplicar perfiles y probar mods.
- [/] **Detección de Hardware**: RAM/GPU detector para autoconfiguración.

---

## 🛠️ Diagnóstico & Ingeniería (Pro)
- [ ] **Live Log Viewer**: Pestaña para ver los logs de Minecraft en tiempo real desde el launcher.
- [ ] **Network Health Diagnostic**: Verificador de ruta (Supabase -> R2 -> Game Server).
- [ ] **Editor de JVM & Options Visual**: Sliders para RAM, GC y ajustes de Minecraft (FOV, Vol, etc.) sin abrir el juego.
- [ ] **Conflict Detector**: Analizar `/mods/custom/` para detectar incompatibilidades.
- [ ] **Asistente de Reparación Profunda**: Corrección de Java, configs y shaders.

---

## 🌐 Ecosistema & Cloud (Social)
- [ ] **Cloud Config Sync ⭐**: Sincronizar keybinds (options.txt) y opciones del bridge en Supabase.
- [ ] **Cloud Screenshot Backup**: Sincronización automática de capturas a la nube.
- [ ] **Gamificación & Progresión 🏆**: Insignias, horas jugadas y estadísticas (Requiere Web Bridge).
- [ ] **Discord Rich Presence (Deep Integration)**: Mostrar servidor, coordenadas o actividad actual.

---

## 🎨 Experiencia Visual & UX
- [ ] **Global Asset Cache (Prism/Carbon Style)**: Almacén central de mods (SHA1) con hardlinks a cada instancia. Ahorra GBs de disco y evita descargas redundantes.
- [ ] **Smart JVM Manager**: Implementación automática de **Aikar's Flags** (G1GC optimizado) y selección de Java 17/21 según versión de MC.
- [ ] **Integrated Optimization Suite**: Inyección de **Sodium, Lithium y ModernFix** (Mixins de bajo nivel) para corregir bugs del motor y duplicar FPS.
- [ ] **RGB Sync (Chroma/iCUE)**: Iluminación periférica reactiva (Carga, Error, Éxito).
- [ ] **Suite de Accesibilidad**: Fuente OpenDyslexic, TTS (Narrador) y Escalado de UI.
- [ ] **Mapa Dinámico Integrado (Webview)**: Dynmap/Bluemap embebido.
- [ ] **Fondos Dinámicos (Shaders)**: Partículas/Auroras reactivas al ratón.
- [ ] **Glassmorphism Profundo**: Blurs reales y bordes cinemáticos.
- [ ] **Fast-Join (Tray)**: Lanzar el juego directamente desde el icono de la bandeja del sistema, saltando noticias y UI principal. Cero fricción.

---

## 🧪 I+D Revolucionario (Black Labs)
- [ ] **Volatile RAM-Drive Mode**: Cargar instancia en RAM. Modo "Full" (>32GB) o "Assets Only" (>16GB). Carga instantánea.
- [ ] **SIMD Hyper-Hashing (Assembly)**: Uso de instrucciones de CPU (AVX2/NEON) para hashear archivos 8x más rápido durante la sincronización.

### 🦀 Deep Rust Optimizations
- [ ] **GPU Enforcer**: Inyecta `UserGpuPreferences` en el registro para que Windows JAMÁS use la gráfica integrada (iGPU) con Minecraft.
- [ ] **Packet Turbo-Mode (QoS)**: Crea una política de red efímera (`New-NetQoSPolicy`) para marcar los paquetes de Minecraft con prioridad "Realtime" en el router.
- [ ] **IO Pre-Warmer**: Un hilo de Rust lee silenciosamente los assets pesados (1GB+) al RAM del sistema *antes* de que Java los pida.

### 🧱 Workstation Grade (Xeon/Threadripper)
- [ ] **ZGC Extreme**: Habilitar `Generational ZGC` (Java 21+) automáticamente si se detectan >12 cores. Elimina el "lag de la basura" usando fuerza bruta de núcleos.
- [ ] **NUMA-Aware Injector**: Detecta si hay dual-socket/NUMA y añade `-XX:+UseNUMA` para evitar latencias de memoria cruzada.
- [ ] **Parallel World-Gen Wrapper**: Preconfigura mods como C2ME para que la generación de mundo use los 24/48 hilos disponibles.
- [ ] **Core Count Detector**: Auto-detectar (>12 cores physical) O botón manual "Workstation Mode" en ajustes.

- [ ] **Core Pinning Engine (Rust)**: Forzar afinidad de CPU en Windows para que Minecraft SOLO use los P-Cores (Intel 12th+) o 3D V-Cache Cores (AMD).
- [ ] **TCP No-Delay Injector**: Ajustes de registro (Nagle's Algorithm) aplicados temporalmente al proceso del juego para reducir latencia en PvP.

---

## 🧹 Deuda Técnica
- [ ] Estandarizar logs (Rust -> Dart Console/File).
- [ ] Manejo de Errores Integral (Rust panics -> Flutter UI).
- [ ] Optimización de memoria en el Skin Viewer 3D.
