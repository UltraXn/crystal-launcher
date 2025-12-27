# 🛡️ Staff Hub (Centro de Administración)

El **Staff Hub** es el panel centralizado diseñado para que el equipo de CrystalTides gestione las operaciones internas del servidor de forma eficiente y visual.

## 📋 Tablero Kanban (Gestión de Tareas)

Ubicación: `/admin` -> **Staff Hub**

El sistema utiliza `@hello-pangea/dnd` para proporcionar una experiencia interactiva de arrastrar y soltar (Drag & Drop).

### Funcionalidades:

- **Columnas Dinámicas**: Las tareas se organizan en estados (Pendiente, En Proceso, Revisión, Completado).
- **Gestión de Tareas**:
  - **Creación**: Permite añadir tareas con título, descripción y etiquetas de prioridad.
  - **Edición**: Se pueden actualizar los detalles de la tarea en cualquier momento.
  - **Priorización**: Etiquetas de color para identificar urgencias (Baja, Media, Alta, Crítica).
- **Persistencia**: Todos los movimientos se guardan en tiempo real en la base de datos de Supabase.

## 📌 Staff Notes (Muro de Notas)

Un espacio de comunicación asíncrona dentro del panel administrativo.

### Funcionalidades:

- **Notas Adhesivas**: Permite dejar mensajes rápidos o recordatorios para otros miembros del Staff.
- **Autoría**: Cada nota muestra quién la creó y cuándo.
- **Limpieza**: Opción de eliminar notas obsoletas para mantener el muro organizado.

## 🔐 Seguridad y Acceso

- **Autorización**: Solo los usuarios con el rol `ADMIN` o `STAFF` en su perfil de Supabase pueden acceder a esta sección.
- **Middleware**: El backend utiliza un interceptor de roles para evitar que usuarios regulares vean o modifiquen datos internos.

---

_Documentación generada el 25 de diciembre de 2025._
