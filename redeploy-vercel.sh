#!/bin/bash

echo "🚀 Forzando redeploy en Vercel"
echo "=============================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Verificando configuración...${NC}"
if [ ! -f "vercel.json" ]; then
    echo -e "${RED}❌ Error: vercel.json no encontrado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ vercel.json encontrado${NC}"

echo -e "${BLUE}2. Verificando build del frontend...${NC}"
cd frontend
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build del frontend exitoso${NC}"
else
    echo -e "${RED}❌ Error en build del frontend${NC}"
    exit 1
fi
cd ..

echo -e "${BLUE}3. Verificando que Vercel CLI esté instalado...${NC}"
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI no encontrado, instalando...${NC}"
    npm install -g vercel
fi

echo -e "${GREEN}✅ Vercel CLI disponible${NC}"

echo -e "${BLUE}4. Iniciando redeploy...${NC}"
echo -e "${YELLOW}⚠️  Esto puede tomar unos minutos...${NC}"

vercel --prod --force

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Redeploy exitoso${NC}"
    echo ""
    echo -e "${BLUE}📋 Próximos pasos:${NC}"
    echo "1. Espera 1-2 minutos para que el deploy se complete"
    echo "2. Verifica que /admin funcione: https://alnortegrow-catalog.vercel.app/admin"
    echo "3. Si persiste el problema, verifica las variables de entorno en Vercel"
else
    echo -e "${RED}❌ Error en el redeploy${NC}"
    echo ""
    echo -e "${YELLOW}📋 Soluciones alternativas:${NC}"
    echo "1. Ve a https://vercel.com/dashboard"
    echo "2. Encuentra tu proyecto"
    echo "3. Haz clic en 'Redeploy'"
    echo "4. Verifica las variables de entorno"
fi 