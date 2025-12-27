# 🚀 Documentación de CI/CD - CrystalTides SMP

Este proyecto utiliza **GitHub Actions** para automatizar el ciclo de vida de desarrollo, asegurando que cada cambio sea validado, escaneado en busca de vulnerabilidades y desplegado de forma segura.

## 🛠️ Flujo de Trabajo (Workflow)

El archivo de configuración principal se encuentra en `.github/workflows/docker-publish.yml`. Este flujo se activa automáticamente en cada `push` a las ramas `main` o `master`.

### Pasos del Pipeline:

1.  **Checkout**: Descarga el código fuente del repositorio.
2.  **Login**: Se autentica en GitHub Container Registry (GHCR).
3.  **Build & Security Scan (Backend)**:
    - **Caché**: Utiliza `type=gha` para acelerar builds subsiguientes reusando capas previas.
    - Construye la imagen de Docker del servidor.
    - **Docker Scout**: Escanea la imagen buscando vulnerabilidades Críticas o Altas.
4.  **Build & Security Scan (Frontend)**:
    - **Caché**: Utiliza `type=gha` para optimizar tiempos de construcción.
    - Construye la imagen de Docker del cliente, inyectando variables de entorno necesarias.
    - **Docker Scout**: Escanea la imagen.
5.  **Push**: Si todos los escaneos pasan con éxito, las imágenes se suben a `ghcr.io/ultraxn/`.

## 🛡️ Docker Scout

Docker Scout está integrado en el pipeline para garantizar que no introduzcamos regresiones de seguridad.

- **Comando**: `cves` (analiza CVEs conocidos).
- **Severidad**: Se enfoca en `critical` y `high`.
- **Gatekeeping**: El flag `exit-code: true` asegura que el pipeline sea un "guardián" de la calidad.

## 🔑 Secretos Necesarios (GitHub Secrets)

Para que el CI/CD funcione correctamente, debes configurar los siguientes secretos en tu repositorio de GitHub (`Settings > Secrets and variables > Actions`):

| Secreto                  | Descripción                                                        |
| :----------------------- | :----------------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | URL de tu instancia de Supabase.                                   |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima de Supabase.                                         |
| `VITE_API_URL`           | URL de la API del Backend (ej: `https://api.crystaltides.net`).    |
| `DOCKERHUB_USERNAME`     | (Extra) Tu usuario de Docker Hub para evitar rate limits de Scout. |
| `DOCKERHUB_TOKEN`        | (Extra) Token de acceso personal de Docker Hub.                    |

## 📈 Recomendaciones Continuas

1.  **npm audit**: Ejecuta periódicamente `npm audit fix` localmente.
2.  **Actualización de Bases**: Mantén las imágenes base (`golang:alpine`, `node:alpine`) actualizadas en los `Dockerfile`.
3.  **Overrides**: Si una vulnerabilidad persiste en una dependencia indirecta, usa la sección `overrides` en `package.json` tal como hicimos con `glob`.

---

_Documentación generada el 25 de diciembre de 2025._
