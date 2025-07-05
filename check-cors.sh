#!/bin/bash

echo "🔍 Verificando configuración de CORS"
echo "===================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# URLs a verificar
BACKEND_URL="https://catalog-sheet-backend.onrender.com"
FRONTEND_URL="https://alnortegrow-catalog.vercel.app"

echo -e "${BLUE}Backend URL:${NC} $BACKEND_URL"
echo -e "${BLUE}Frontend URL:${NC} $FRONTEND_URL"
echo ""

# Verificar que el backend responde
echo -e "${BLUE}1. Verificando que el backend responde...${NC}"
if curl -s "$BACKEND_URL/api/health" > /dev/null; then
    echo -e "${GREEN}✅ Backend responde correctamente${NC}"
else
    echo -e "${RED}❌ Backend no responde${NC}"
    exit 1
fi

# Verificar CORS con curl
echo -e "${BLUE}2. Verificando configuración de CORS...${NC}"
CORS_RESPONSE=$(curl -s -I -H "Origin: $FRONTEND_URL" "$BACKEND_URL/api/health" 2>/dev/null)

if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✅ Headers de CORS encontrados${NC}"
    echo "$CORS_RESPONSE" | grep "Access-Control-Allow-Origin"
else
    echo -e "${RED}❌ Headers de CORS no encontrados${NC}"
fi

# Verificar que el frontend puede acceder al backend
echo -e "${BLUE}3. Verificando acceso desde frontend...${NC}"
FRONTEND_ACCESS=$(curl -s -H "Origin: $FRONTEND_URL" "$BACKEND_URL/api/productos" 2>/dev/null)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend puede acceder al backend${NC}"
else
    echo -e "${RED}❌ Frontend no puede acceder al backend${NC}"
fi

echo ""
echo -e "${YELLOW}📋 Pasos para solucionar problemas de CORS:${NC}"
echo "1. Verifica que FRONTEND_URL esté configurado en Render:"
echo "   $FRONTEND_URL"
echo ""
echo "2. Verifica que VITE_API_URL esté configurado en Vercel:"
echo "   $BACKEND_URL"
echo ""
echo "3. Si el problema persiste, reinicia el backend en Render"
echo ""
echo -e "${BLUE}🔧 Comandos útiles:${NC}"
echo "curl -H 'Origin: $FRONTEND_URL' $BACKEND_URL/api/health"
echo "curl -H 'Origin: $FRONTEND_URL' $BACKEND_URL/api/productos" 