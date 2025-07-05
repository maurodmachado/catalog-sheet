# Multi-stage build para optimizar el tamaño de la imagen
FROM node:18-alpine AS base

# Instalar dependencias del sistema
RUN apk add --no-cache git

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Instalar dependencias
RUN npm ci --only=production
RUN cd backend && npm ci --only=production
RUN cd frontend && npm ci

# Etapa de build del frontend
FROM base AS frontend-build
WORKDIR /app/frontend
COPY frontend/ .
RUN npm run build

# Etapa de build del backend
FROM base AS backend-build
WORKDIR /app/backend
COPY backend/ .
RUN npm run build

# Etapa de producción
FROM node:18-alpine AS production

# Instalar dependencias de producción
RUN apk add --no-cache dumb-init

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY --from=base /app/package*.json ./
COPY --from=base /app/backend/package*.json ./backend/

# Instalar solo dependencias de producción
RUN npm ci --only=production --ignore-scripts
RUN cd backend && npm ci --only=production --ignore-scripts

# Copiar código compilado
COPY --from=backend-build /app/backend ./backend
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Copiar archivos estáticos y configuración
COPY apps-script.js ./
COPY README.md ./
COPY .env.example ./

# Cambiar propietario de los archivos
RUN chown -R nextjs:nodejs /app

# Cambiar al usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3001

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando de inicio
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"] 