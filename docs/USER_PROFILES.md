# 👤 Perfiles y Estadísticas de Jugador

Los perfiles públicos en CrystalTides son la carta de presentación de cada jugador, unificando su identidad web con sus logros dentro del servidor de Minecraft.

## 🎨 Visualización de Skin (Preview 3D)

Una de las características premium del frontend es el **Renderizado 3D Interactivo**:

- **Tecnología**: Utiliza `skinview3d` (basado en Three.js).
- **Funcionalidad**: Los usuarios pueden rotar, hacer zoom y ver animaciones de sus propias skins de Minecraft directamente en el navegador.
- **Sincronización**: La skin se recupera automáticamente desde los servidores de Mojang usando el nombre de usuario del jugador.

## 📊 Estadísticas del Juego (In-Game Stats)

El backend consulta las bases de datos del servidor de Minecraft (MySQL) para mostrar datos en tiempo real:

- **Combate**: Kills totales, Muertes, Ratio K/D.
- **Actividad**: Tiempo total de juego, fecha de última conexión.
- **Economía**: Saldo actual de KilluCoins y dinero de la economía `Vault`.
- **Progresión**: Bloques minados/colocados (vía logs de CoreProtect).

## 🎖️ Vitrina de Medallas

Los jugadores pueden coleccionar medallas por méritos especiales (Veterano, Ganador de Eventos, Donador, etc.):

- Las medallas son asignadas por los Administradores desde el Staff Hub.
- Cada medalla tiene un icono único y una descripción que aparece al pasar el cursor (Tooltip).

## ⚙️ Personalización Web

Además de los datos del juego, el perfil permite:

- **Biografía**: Un espacio de texto libre para que el usuario se presente.
- **Redes Sociales**: Enlaces configurables a Discord, YouTube, Twitter, etc.
- **Privacidad**: Opción para ocultar ciertas estadísticas si el usuario lo desea.

---

_Documentación generada el 25 de diciembre de 2025._
