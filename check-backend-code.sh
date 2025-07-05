#!/bin/bash

echo "🔍 Verificando código del backend"
echo "================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Verificando estructura del proyecto...${NC}"
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ No se encuentra el directorio 'backend'${NC}"
    exit 1
fi

if [ ! -f "backend/package.json" ]; then
    echo -e "${RED}❌ No se encuentra 'backend/package.json'${NC}"
    exit 1
fi

if [ ! -f "backend/server.js" ]; then
    echo -e "${RED}❌ No se encuentra 'backend/server.js'${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Estructura del proyecto correcta${NC}"
echo ""

echo -e "${BLUE}2. Verificando package.json...${NC}"
if grep -q '"start"' backend/package.json; then
    echo -e "${GREEN}✅ Script 'start' encontrado${NC}"
else
    echo -e "${RED}❌ Script 'start' no encontrado en package.json${NC}"
fi

if grep -q '"build"' backend/package.json; then
    echo -e "${GREEN}✅ Script 'build' encontrado${NC}"
else
    echo -e "${YELLOW}⚠️  Script 'build' no encontrado (puede ser opcional)${NC}"
fi

echo ""

echo -e "${BLUE}3. Verificando server.js...${NC}"
if grep -q "process.env.PORT" backend/server.js; then
    echo -e "${GREEN}✅ Puerto configurado correctamente${NC}"
else
    echo -e "${RED}❌ Puerto no configurado correctamente${NC}"
fi

if grep -q "process.env.SPREADSHEET_ID" backend/server.js; then
    echo -e "${GREEN}✅ SPREADSHEET_ID configurado${NC}"
else
    echo -e "${RED}❌ SPREADSHEET_ID no configurado${NC}"
fi

if grep -q "process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON" backend/server.js; then
    echo -e "${GREEN}✅ GOOGLE_APPLICATION_CREDENTIALS_JSON configurado${NC}"
else
    echo -e "${RED}❌ GOOGLE_APPLICATION_CREDENTIALS_JSON no configurado${NC}"
fi

echo ""

echo -e "${BLUE}4. Verificando dependencias...${NC}"
if [ -f "backend/package-lock.json" ]; then
    echo -e "${GREEN}✅ package-lock.json encontrado${NC}"
else
    echo -e "${YELLOW}⚠️  package-lock.json no encontrado${NC}"
fi

if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✅ node_modules encontrado${NC}"
else
    echo -e "${YELLOW}⚠️  node_modules no encontrado (se instalará en deploy)${NC}"
fi

echo ""

echo -e "${BLUE}5. Verificando sintaxis de JavaScript...${NC}"
cd backend
if node -c server.js 2>/dev/null; then
    echo -e "${GREEN}✅ Sintaxis de server.js correcta${NC}"
else
    echo -e "${RED}❌ Error de sintaxis en server.js${NC}"
    node -c server.js
fi

# Verificar otros archivos JS
for file in *.js; do
    if [ -f "$file" ] && [ "$file" != "server.js" ]; then
        if node -c "$file" 2>/dev/null; then
            echo -e "${GREEN}✅ Sintaxis de $file correcta${NC}"
        else
            echo -e "${RED}❌ Error de sintaxis en $file${NC}"
            node -c "$file"
        fi
    fi
done

cd ..

echo ""

echo -e "${BLUE}6. Verificando configuración de Render...${NC}"
if [ -f "render.yaml" ]; then
    echo -e "${GREEN}✅ render.yaml encontrado${NC}"
    if grep -q "catalog-sheet-backend" render.yaml; then
        echo -e "${GREEN}✅ Servicio catalog-sheet-backend configurado${NC}"
    else
        echo -e "${RED}❌ Servicio catalog-sheet-backend no encontrado en render.yaml${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  render.yaml no encontrado${NC}"
fi

echo ""

echo -e "${BLUE}7. Verificando variables de entorno requeridas...${NC}"
required_vars=("ADMIN_USER" "ADMIN_PASSWORD" "SPREADSHEET_ID" "GOOGLE_APPLICATION_CREDENTIALS_JSON" "FRONTEND_URL")
missing_vars=()

for var in "${required_vars[@]}"; do
    if grep -q "process.env.$var" backend/server.js; then
        echo -e "${GREEN}✅ $var está siendo usado en el código${NC}"
    else
        echo -e "${YELLOW}⚠️  $var no está siendo usado en el código${NC}"
        missing_vars+=("$var")
    fi
done

echo ""

echo -e "${BLUE}8. Verificando endpoints...${NC}"
if grep -q "/api/health" backend/server.js; then
    echo -e "${GREEN}✅ Endpoint /api/health encontrado${NC}"
else
    echo -e "${RED}❌ Endpoint /api/health no encontrado${NC}"
fi

if grep -q "/api/productos" backend/server.js; then
    echo -e "${GREEN}✅ Endpoint /api/productos encontrado${NC}"
else
    echo -e "${RED}❌ Endpoint /api/productos no encontrado${NC}"
fi

echo ""

echo -e "${BLUE}📋 Resumen de verificación:${NC}"
echo ""

if [ ${#missing_vars[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ Todas las variables de entorno están siendo usadas${NC}"
else
    echo -e "${YELLOW}⚠️  Variables no encontradas en el código:${NC}"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
fi

echo ""
echo -e "${BLUE}🔧 Próximos pasos recomendados:${NC}"
echo ""
echo "1. **Verificar variables de entorno en Render Dashboard**"
echo "2. **Revisar logs del servicio en Render**"
echo "3. **Forzar redeploy manual**"
echo "4. **Verificar credenciales de Google Sheets**"
echo ""
echo -e "${GREEN}✅ Si todo el código está correcto, el problema está en Render${NC}"
echo "   - Variables de entorno faltantes"
echo "   - Credenciales de Google Sheets incorrectas"
echo "   - Problemas de configuración del servicio" 