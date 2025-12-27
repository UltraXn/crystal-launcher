# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar turbo globalmente
RUN npm install -g turbo

# Copiar archivos de definición de workspaces
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Instalar todas las dependencias (necesario para el build de turbo)
RUN npm install

# Copiar el resto del código
COPY . .

# Construir solo el servidor usando Turbo
RUN turbo run build --filter=crystaltides-server...

# Stage 2: Production
FROM node:22-alpine

WORKDIR /app

# En modo monorepo, a veces es más seguro copiar lo que ya se instaló en builder 
# o hacer un prune. Para simplificar y asegurar que funciona:
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server/package*.json ./server/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/dist ./dist
# If you have any other files needed at runtime (like .env or config files), 
# they should be handled via volumes or COPY here if they are static.
# Note: .env is usually passed via docker-compose env_file or volumes.

EXPOSE 3001

CMD ["node", "dist/index.js"]
