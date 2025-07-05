#!/bin/bash

echo "🔧 Verificando y solucionando problemas de routing"
echo "================================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

FRONTEND_URL="https://alnortegrow-catalog.vercel.app"
BACKEND_URL="https://catalog-sheet-backend.onrender.com"

echo -e "${BLUE}Frontend URL:${NC} $FRONTEND_URL"
echo -e "${BLUE}Backend URL:${NC} $BACKEND_URL"
echo ""

# Verificar rutas del frontend
echo -e "${BLUE}1. Verificando rutas del frontend...${NC}"

# Verificar página principal
if curl -s "$FRONTEND_URL" > /dev/null; then
    echo -e "${GREEN}✅ Página principal (/) funciona${NC}"
else
    echo -e "${RED}❌ Página principal (/) no funciona${NC}"
fi

# Verificar ruta /admin
if curl -s "$FRONTEND_URL/admin" > /dev/null; then
    echo -e "${GREEN}✅ Ruta /admin funciona${NC}"
else
    echo -e "${RED}❌ Ruta /admin no funciona${NC}"
fi

# Verificar API del backend
echo -e "${BLUE}2. Verificando API del backend...${NC}"
if curl -s "$BACKEND_URL/api/health" > /dev/null; then
    echo -e "${GREEN}✅ API del backend responde${NC}"
else
    echo -e "${RED}❌ API del backend no responde${NC}"
fi

echo ""
echo -e "${YELLOW}📋 Soluciones para problemas de routing:${NC}"
echo ""
echo -e "${BLUE}Para Vercel:${NC}"
echo "1. Verifica que vercel.json esté en la raíz del proyecto"
echo "2. Asegúrate de que las rutas estén configuradas correctamente"
echo "3. Haz redeploy: vercel --prod"
echo ""
echo -e "${BLUE}Para verificar la configuración:${NC}"
echo "cat vercel.json"
echo ""
echo -e "${BLUE}Para forzar redeploy:${NC}"
echo "vercel --prod --force"
echo ""
echo -e "${YELLOW}🔧 Configuración actual de vercel.json:${NC}"
cat vercel.json 