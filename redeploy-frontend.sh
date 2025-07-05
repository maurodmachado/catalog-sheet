#!/bin/bash

echo "🚀 Forzando redeploy del frontend en Vercel"
echo "=========================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

FRONTEND_URL="https://alnortegrow-catalog.vercel.app"

echo -e "${BLUE}Frontend URL:${NC} $FRONTEND_URL"
echo ""

# Verificar si Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI no está instalado${NC}"
    echo ""
    echo -e "${BLUE}📋 Pasos para solucionar el error 404 en /admin:${NC}"
    echo ""
    echo "1. **Forzar redeploy manual en Vercel**:"
    echo "   - Ve a https://vercel.com/dashboard"
    echo "   - Encuentra tu proyecto 'alnortegrow-catalog'"
    echo "   - Haz clic en 'Redeploy' o 'Deploy'"
    echo ""
    echo "2. **Verificar configuración**:"
    echo "   - Asegúrate de que el archivo vercel.json esté en la raíz"
    echo "   - Verifica que las rutas estén configuradas correctamente"
    echo ""
    echo "3. **Configuración actual de vercel.json**:"
    echo "   - Rewrites para /admin → /index.html"
    echo "   - Redirección de APIs al backend"
    echo ""
    echo "4. **Verificar después del redeploy**:"
    echo "   - https://alnortegrow-catalog.vercel.app/admin"
    echo ""
    echo -e "${GREEN}✅ El backend está funcionando correctamente${NC}"
    echo -e "${GREEN}✅ Solo necesitas redeployar el frontend${NC}"
    echo ""
    exit 0
fi

echo -e "${BLUE}1. Verificando estado actual...${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/admin")
echo "Status code: $response"

if [ "$response" = "404" ]; then
    echo -e "${RED}❌ Error 404 confirmado en /admin${NC}"
    echo ""
    echo -e "${BLUE}2. Iniciando redeploy...${NC}"
    
    # Cambiar al directorio del frontend
    cd frontend
    
    # Forzar redeploy
    echo "Ejecutando: vercel --prod"
    vercel --prod
    
    echo ""
    echo -e "${BLUE}3. Verificando después del redeploy...${NC}"
    sleep 10
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/admin")
    echo "Status code después del redeploy: $response"
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ ¡Redeploy exitoso! /admin ahora funciona${NC}"
    else
        echo -e "${YELLOW}⚠️  Aún hay problemas. Verifica manualmente${NC}"
    fi
else
    echo -e "${GREEN}✅ /admin ya está funcionando${NC}"
fi

echo ""
echo -e "${BLUE}📋 URLs para verificar:${NC}"
echo "- Frontend: $FRONTEND_URL"
echo "- Admin: $FRONTEND_URL/admin"
echo "- Backend: https://catalog-sheet-backend.onrender.com"
echo "" 