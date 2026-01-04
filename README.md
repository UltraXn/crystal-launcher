# CrystalTides Launcher

Esta es la estructura base para tu launcher de Minecraft creado en C# con WPF.

## Estructura del Proyecto

### 1. CrystalTides.Core (Biblioteca de Clases)
Contiene toda la lógica de negocio, independiente de la interfaz gráfica.

- **Authentication/**: Manejo de cuentas (Microsoft, Mojang, Offline).
- **Game/**: Lógica relacionada con Minecraft.
  - **Versioning/**: Obtención de versiones (vanilla, forge, fabric).
  - **Assets/**: Descarga y validación de assets/librerías.
- **Installation/**: Lógica de instalación (descomprimir natives, crear carpetas).
- **Models/**: Clases de datos (Profile, VersionManifest, etc.).
- **Services/**: Servicios generales (Configuración, Red, Archivos).

### 2. CrystalTides.Launcher (Aplicación WPF)
La interfaz gráfica de usuario.

- **Views/**: Ventanas y páginas (Login, Home, Settings).
- **ViewModels/**: Lógica de la vista (Patrón MVVM recomendado).
- **Components/**: Controles reutilizables (Botones, Barras de carga).
- **Resources/**: Imágenes, Estilos, Diccionarios de recursos.

## Primeros Pasos

1. Abre `CrystalTidesLauncher.sln` en Visual Studio o tu IDE preferido.
2. Implementa la autenticación en `Core/Authentication`.
3. Crea el diseño en `Launcher/Views/MainWindow.xaml`.
4. Conecta la lógica usando ViewModels.

## Recomendaciones
- Usa **MVVM (Model-View-ViewModel)** para separar la UI de la lógica.
- Utiliza librerías como `CmlLib.Core` si no quieres escribir todo el núcleo del launcher desde cero, o implementa tu propia lógica en `Core`.
