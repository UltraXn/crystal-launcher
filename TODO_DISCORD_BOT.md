# CrystalBot v2.0 - Hoja de Ruta (ToDo)

## 🔄 Integración y Sincronización

- [ ] **Sincronización Bidireccional de Chat (Chat Bridge)**
  - [ ] **Discord -> Minecraft**: Permitir enviar mensajes desde un canal de staff en Discord al juego.
  - [ ] **Minecraft -> Discord**: Replicar el chat público del juego en un canal `#chat-global` (solo lectura o interactivo).

- [ ] **Sistema de Verificación (Link)**
  - [ ] Crear comando `/link` en Minecraft para generar código.
  - [ ] Crear comando slash `/verificar <code>` en Discord.
  - [ ] Sincronizar automáticamente roles (VIP, MVP, Staff) al verificar.

## 🛠️ Herramientas de Administración y Moderación

- [ ] **Sistema de Tickets Integrado**
  - [ ] Notificar en `#tickets-staff` cuando se crea/responde un ticket en la web.
  - [ ] Comandos rápidos para cerrar/gestionar tickets desde Discord (`/ticket close <id>`).

- [ ] **Moderación Cruzada Automatizada**
  - [ ] Asignar rol "Sancionado" en Discord si el usuario es baneado en el juego.
  - [ ] Alerta de evasión de ban (misma IP/Discord ID).

## 📊 Información y Estadísticas

- [ ] **Comando de Estadísticas `/stats <jugador>`**
  - [ ] Generar una "Player Card" (Embed imagen) con:
    - [ ] K/D Ratio (Asesinatos/Muertes).
    - [ ] Tiempo jugado.
    - [ ] Dinero/Balance.
    - [ ] Última conexión.

- [ ] **Canal de Estado en Vivo (Live Status)**
  - [ ] Mensaje auto-actualizable (cada 60s) en canal `#estado`.
  - [ ] Mostrar: Estado (Online/Offline), TPS, RAM usada, Lista de jugadores online.

- [ ] **Notificaciones de Eventos**
  - [ ] Anuncios automáticos en `#eventos` cuando inicie un evento en el juego (KOTH, Spleef, Torneo).

## ⚙️ Mejoras Técnicas

- [ ] **Migrar Loggers restantes**: Asegurar que todos los módulos usen el nuevo servicio de `Logger` con colores.
- [ ] **Panel de Control de Bot**: Comandos para reiniciar subsistemas del bot sin apagar el proceso (`/bot reload`).
