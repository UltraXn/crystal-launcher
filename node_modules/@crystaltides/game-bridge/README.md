# 🧠 CrystalTides Agent (Game-Bridge)

Este repositorio contiene la inteligencia in-game para CrystalTides. Actúa como un puente entre el proceso Java de Minecraft y la lógica nativa de alto rendimiento.

## 🏗️ Arquitectura

El Agente utiliza un enfoque de "Doble Núcleo":

1.  **Agente Java (`java-agent`)**: Utiliza Java Instrumentation para engancharse al proceso del juego durante el inicio.
2.  **Core Nativo (`native-core`)**: Una librería en Rust de alto rendimiento a la que se accede mediante JNI (Java Native Interface) para renderizado y lógica en tiempo real.

## 📁 Estructura del Proyecto

- `java-agent/`: Proyecto Java basado en Maven. El punto de entrada es `CrystalAgent.java`.
- `native-core/`: Crate de Rust que exporta símbolos compatibles con C para JNI.
- `test-env/`: Un entorno de ejecución mínimo para probar el agente sin lanzar un cliente completo de Minecraft.

## 🚀 Empezando

### Requisitos Previos

- JDK 17 o superior
- Maven
- Rust (última versión estable) + `cargo`

### Compilación

Puedes compilar todo el stack usando los scripts del `package.json` en la raíz:

```bash
# Compilar los componentes de Java y Rust
npm run build

# O individualmente
npm run build:java
npm run build:rust
```

El proceso de compilación generará:

- `java-agent/target/game-bridge-1.0-SNAPSHOT.jar`
- `native-core/target/release/game_bridge_core.dll` (en Windows)

### Probar en el Entorno de Pruebas

La carpeta `test-env` está pre-configurada para pruebas rápidas.
Ejecuta el script de lanzamiento o usa:

```bash
java -javaagent:agent.jar com.crystaltides.test.FakeMinecraft
```

## 🔌 Integración

El Launcher se comunica con este agente inyectándolo como un `-javaagent` en los argumentos de la JVM.

```bash
java -Xmx4G -javaagent:crystal-agent.jar -cp ... net.minecraft.client.main.Main
```

## 🧬 Hoja de Ruta (Roadmap)

- [ ] **Hooks de OpenGL**: Interceptar llamadas de renderizado para elementos HUD de baja latencia.
- [ ] **Bus de Eventos**: Compartir eventos del juego (ubicación del jugador, vida) con el Launcher.
- [ ] **Presencia**: Integración de Discord Deep Presence desde dentro del proceso.

---

Parte del ecosistema CrystalTides. Separado para una modularidad con cero dependencias.
