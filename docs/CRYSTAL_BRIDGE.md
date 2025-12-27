# 🌉 CrystalBridge: Integración Web-Minecraft

**CrystalBridge** es la arquitectura propietaria de CrystalTides que permite la comunicación bidireccional entre el ecosistema Web (JavaScript/Node.js) y el Servidor de Minecraft (Java/Paper).

## 🛡️ ¿Por qué no usamos RCON?

El protocolo RCON estándar de Minecraft tiene limitaciones de seguridad:

1. Requiere abrir puertos adicionales en el firewall.
2. Es vulnerable a ataques de fuerza bruta.
3. Requiere que el servidor esté online en el momento exacto del comando.

**CrystalBridge** soluciona esto mediante el patrón "Inbox" (Bandeja de Entrada) o Cola de Comandos.

## ⚙️ Funcionamiento Técnico

### 1. Generación del Comando (Web)

Cuando un evento ocurre en la web (ej: un usuario gana un premio en el Gacha), el backend de Node.js inserta un registro en la tabla `web_pending_commands` de la base de datos MySQL (Server DB).

### 2. Sincronización (Plugin CrystalCore)

El plugin de Java instalado en el servidor de Minecraft actúa como un "consumidor":

- Realiza un pooling (consulta) a la tabla cada X segundos.
- Descarga los comandos pendientes para el servidor actual.
- Los ejecuta como consola del servidor.

### 3. Confirmación de Entrega

Una vez ejecutado el comando, el plugin actualiza el registro en la MySQL marcándolo como `processed = 1` e incluye un `processed_at` con el timestamp.

## 🚀 Ventajas del Sistema

- **Seguridad Máxima**: No hay canales de entrada abiertos al servidor de Minecraft. Solo el servidor consulta a la base de datos (Outbound).
- **Asincronía**: Si el servidor de Minecraft se reinicia o está offline, el comando se queda en la cola y se ejecuta automáticamente en cuanto el servidor vuelve a estar online.
- **Trazabilidad**: Tenemos un historial completo en MySQL de cada comando enviado desde la web y el momento exacto de su ejecución in-game.

---

_Documentación generada el 25 de diciembre de 2025._
