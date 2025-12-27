# 🏛️ Sistema de Foros y Comunidad

El foro de CrystalTides es el núcleo social de la comunidad, permitiendo la comunicación estructurada entre jugadores y el equipo administrativo.

## 🗂️ Estructura del Foro

El contenido se organiza mediante una jerarquía de etiquetas y categorías:

- **Anuncios**: Solo lectura para usuarios regulares, usado por el Staff para noticias oficiales.
- **General**: Charlas sobre el servidor.
- **Sugerencias**: Sistema donde los jugadores proponen ideas.
- **Soporte/Reportes**: Espacio para ayuda técnica.

## 🖋️ Creación de Contenido

- **Editor Rich Text**: Soporte nativo para **Markdown**, permitiendo formatear textos, listas y enlaces.
- **Imágenes**: Integración con almacenamiento en la nube (vía Supabase Storage) para subir capturas de pantalla y evidencias.
- **Encuestas**: Posibilidad de adjuntar una votación a cualquier tema para sondear la opinión de la comunidad.

## 💬 Interacción Social

- **Respuestas**: Hilos de conversación dinámicos.
- **Likes/Reacciones**: Sistema simple para valorar el contenido.
- **Notificaciones**: Los usuarios reciben alertas en su campana de notificaciones cuando alguien responde a su tema.

## 🛡️ Herramientas de Moderación (Staff)

Los moderadores cuentan con acciones rápidas para mantener el orden:

- **Pin (Anclar)**: Mantiene un tema en la parte superior de la categoría.
- **Lock (Cerrar)**: Impide que se sigan añadiendo comentarios a un hilo.
- **Delete (Eliminar)**: Borrado lógico de contenido inapropiado.
- **Report System**: Los usuarios pueden reportar mensajes, los cuales aparecen en una cola de revisión dentro del Staff Hub.

## 🤖 Integración con Discord

Cada vez que se crea un tema nuevo en categorías críticas (como Anuncios o Sugerencias), un **Webhook** envía automáticamente un resumen al servidor de Discord para maximizar el alcance de la publicación.

---

_Documentación generada el 25 de diciembre de 2025._
