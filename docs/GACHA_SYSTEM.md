# 🎰 KilluCoin Gacha

El **KilluCoin Gacha** es el minijuego principal de gamificación en la web de CrystalTides, diseñado para recompensar la fidelidad de los usuarios con premios dentro del juego.

## 🕹️ Experiencia de Usuario (UX)

- **Interfaz Visual**: Un sistema de apertura de cajas con animaciones matemáticas suaves (CSS Transitions + JS).
- **Acceso**: Requiere que el usuario esté logueado.
- **Limitación**: El sistema impone un **Cooldown de 24 horas** por usuario para mantener la economía del servidor equilibrada.

## 🛠️ Integración Técnica

El sistema funciona mediante una orquestación de tres capas:

1.  **Frontend (React)**:

    - Valida visualmente si el usuario tiene disponible su tirada diaria.
    - Envía una petición `POST` segura al backend.
    - Renderiza el premio obtenido tras la validación.

2.  **Backend (Node.js/Express)**:

    - **Servicio**: `gachaService.ts`.
    - **Lógica**:
      - Recupera la lista de premios y sus probabilidades desde Supabase.
      - Ejecuta un algoritmo de RNG (Random Number Generation) basado en pesos.
      - Verifica en la base de datos que el usuario no haya tirado en las últimas 24h.
      - Registra el drop en `gacha_history`.

3.  **Entrega (CrystalBridge)**:
    - Tras generar el premio, el backend inserta el comando de entrega correspondiente (ej: `give {player} diamond 64`) en la cola de **CrystalBridge**.
    - El jugador recibe sus items la próxima vez que entre al servidor.

## 💎 Configuración de Premios

Los premios se gestionan desde Supabase y se dividen por rareza:

- **Común** (Ej: Comida, Carbón) - Alta probabilidad.
- **Raro** (Ej: Lingotes de hierro, Oro) - Probabilidad media.
- **Épico** (Ej: Diamantes, Herramientas encantadas) - Baja probabilidad.
- **Legendario** (Ej: Llaves de crates, Items custom) - Probabilidad mínima.

---

_Documentación generada el 25 de diciembre de 2025._
