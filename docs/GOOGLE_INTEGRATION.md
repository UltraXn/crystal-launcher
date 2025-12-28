# 📅 Guía de Configuración: Google Calendar Integration

Sigue estos pasos para obtener las credenciales necesarias (Service Account) y conectar tu calendario.

## Paso 1: Crear Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/).
2. Arriba a la izquierda, haz clic en el selector de proyectos y selecciona **"Proyecto Nuevo"**.
3. Ponle un nombre (ej: `CrystalTides-Calendar`) y dale a **Crear**.
4. Asegúrate de tener ese proyecto seleccionado.

## Paso 2: Habilitar la Google Calendar API

1. En el menú lateral (hamburguesa), ve a **"APIs y servicios"** -> **"Biblioteca"**.acá=
2. En el buscador escribe: `Google Calendar API`.
3. Haz clic en el resultado y pulsa el botón azul **"Habilitar"**.

## Paso 3: Crear la Service Account (El "Robot")

1. En el menú lateral, ve a **"IAM y administración"** -> **"Cuentas de servicio"**.
2. Arriba, pulsa **"+ CREAR CUENTA DE SERVICIO"**.
3. **Nombre**: Ponle algo como `calendar-bot`.
4. Pulsa **"Crear y continuar"**.
5. En "Otorgar acceso", selecciona el rol **"Propietario"** (Basic -> Owner) o "Editor" para asegurar permisos (aunque para Calendar es suficiente con que exista, el permiso real se da en el Calendario mismo).
6. Pulsa **"Listo"**.

## Paso 4: Obtener la "Llave" (JSON)

1. En la lista de cuentas de servicio, haz clic en el **email** de la cuenta que acabas de crear (ej: `calendar-bot@...`).
2. Ve a la pestaña **"Claves"** (Keys).
3. Pulsa **"Agregar clave"** -> **"Crear clave nueva"**.
4. Selecciona **JSON** y pulsa **Crear**.
5. **¡Se descargará un archivo a tu PC!** 📥

## Paso 5: Conectar todo

1. **Renombra** ese archivo descargado a `service-account.json`.
2. **Muévelo** a la carpeta `server/` de tu proyecto (`f:\Portafolio\crystaltides\server\service-account.json`).
   - _Alternativa_: Copia el contenido del JSON.
3. **Comparte el Calendario**:
   - Abre ese archivo JSON y copia el **`client_email`**.
   - Ve a Google Calendar -> Configuración de tu calendario -> **Compartir con personas específicas**.
   - Pega el email y dale permiso: **"Realizar cambios en eventos"**.

## Paso 6: Configurar Servidor

Si pusiste el archivo como `server/service-account.json`, asegúrate de que tu código lo lea (en `googleCalendarService.ts` a veces se configura para buscar ruta automática o variables de entorno).

_Si prefieres usar variables de entorno (.env):_
Copia el contenido del archivo JSON en tu `.env` (es más complejo por los saltos de línea en la clave privada). **Lo más fácil por ahora es poner el archivo JSON en la carpeta `server/` con el nombre `google-credentials.json` (o como lo tengas configurado).**

> **Nota**: Verifica en `server/services/googleCalendarService.ts` qué nombre de archivo está esperando o si espera variables.
