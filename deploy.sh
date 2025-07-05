#!/bin/bash

echo "🚀 Iniciando despliegue de Catalog Sheet"
echo "========================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    log_error "No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

# Verificar que existe el archivo .env en backend
if [ ! -f "backend/.env" ]; then
    log_warning "No se encontró backend/.env"
    log_info "Creando archivo .env desde env.example..."
    cp backend/env.example backend/.env
    log_warning "Por favor, edita backend/.env con tus credenciales antes de continuar"
    read -p "¿Deseas continuar con el despliegue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Despliegue cancelado. Edita backend/.env y ejecuta el script nuevamente."
        exit 1
    fi
fi

# Instalar dependencias
log_info "Instalando dependencias..."
npm run install
if [ $? -ne 0 ]; then
    log_error "Error al instalar dependencias"
    exit 1
fi
log_success "Dependencias instaladas"

# Construir proyecto
log_info "Construyendo proyecto..."
npm run build
if [ $? -ne 0 ]; then
    log_error "Error al construir el proyecto"
    exit 1
fi
log_success "Proyecto construido"

# Verificar que el backend funciona
log_info "Verificando que el backend funciona..."
cd backend
npm start &
BACKEND_PID=$!
sleep 5

# Verificar health check
if curl -s http://localhost:3001/api/health > /dev/null; then
    log_success "Backend funcionando correctamente"
else
    log_error "Backend no responde correctamente"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Detener backend
kill $BACKEND_PID 2>/dev/null
cd ..

# Mostrar opciones de despliegue
echo ""
log_info "Opciones de despliegue disponibles:"
echo "1. Docker Compose (local)"
echo "2. Render (cloud)"
echo "3. Railway (cloud)"
echo "4. Vercel (cloud)"
echo "5. Manual (configurar manualmente)"
echo ""

read -p "Selecciona una opción (1-5): " choice

case $choice in
    1)
        log_info "Desplegando con Docker Compose..."
        docker-compose up -d
        if [ $? -eq 0 ]; then
            log_success "Desplegado con Docker Compose"
            log_info "Frontend: http://localhost:3000"
            log_info "Backend: http://localhost:3001"
        else
            log_error "Error en el despliegue con Docker Compose"
        fi
        ;;
    2)
        log_info "Desplegando en Render..."
        log_warning "Asegúrate de tener configuradas las variables de entorno en Render:"
        echo "  - ADMIN_USER"
        echo "  - ADMIN_PASSWORD"
        echo "  - SPREADSHEET_ID"
        echo "  - GOOGLE_APPLICATION_CREDENTIALS_JSON"
        echo ""
        log_info "Subiendo a Render..."
        git add .
        git commit -m "Deploy: Actualización con variables de entorno"
        git push
        log_success "Código subido a Render"
        log_info "Configura las variables de entorno en el dashboard de Render"
        ;;
    3)
        log_info "Desplegando en Railway..."
        log_warning "Asegúrate de tener configuradas las variables de entorno en Railway:"
        echo "  - ADMIN_USER"
        echo "  - ADMIN_PASSWORD"
        echo "  - SPREADSHEET_ID"
        echo "  - GOOGLE_APPLICATION_CREDENTIALS_JSON"
        echo ""
        log_info "Instalando Railway CLI..."
        npm install -g @railway/cli
        railway login
        railway up
        log_success "Desplegado en Railway"
        ;;
    4)
        log_info "Desplegando en Vercel..."
        log_warning "Asegúrate de tener configuradas las variables de entorno en Vercel:"
        echo "  - ADMIN_USER"
        echo "  - ADMIN_PASSWORD"
        echo "  - SPREADSHEET_ID"
        echo "  - GOOGLE_APPLICATION_CREDENTIALS_JSON"
        echo ""
        log_info "Instalando Vercel CLI..."
        npm install -g vercel
        vercel --prod
        log_success "Desplegado en Vercel"
        ;;
    5)
        log_info "Configuración manual:"
        echo ""
        echo "1. Sube el código a tu repositorio"
        echo "2. Configura las variables de entorno en tu plataforma:"
        echo "   - ADMIN_USER"
        echo "   - ADMIN_PASSWORD"
        echo "   - SPREADSHEET_ID"
        echo "   - GOOGLE_APPLICATION_CREDENTIALS_JSON"
        echo "   - FRONTEND_URL"
        echo ""
        echo "3. Configura el build command: npm run build:backend"
        echo "4. Configura el start command: cd backend && npm start"
        echo ""
        log_success "Instrucciones mostradas"
        ;;
    *)
        log_error "Opción inválida"
        exit 1
        ;;
esac

echo ""
log_success "¡Despliegue completado!"
echo ""
log_info "Recuerda:"
echo "  - Configurar las variables de entorno en tu plataforma"
echo "  - Cambiar las credenciales por defecto"
echo "  - Configurar el dominio personalizado si es necesario"
echo ""
log_info "Documentación: backend/README_ENV.md" 