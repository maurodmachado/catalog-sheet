#!/bin/bash

echo "🔍 Diagnóstico de problemas en Render"
echo "====================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BACKEND_URL="https://catalog-sheet-backend.onrender.com"

echo -e "${BLUE}Backend URL:${NC} $BACKEND_URL"
echo ""

# Verificar diferentes endpoints
echo -e "${BLUE}1. Verificando endpoints del backend...${NC}"

# Health check
echo -n "Health check: "
if curl -s "$BACKEND_URL/api/health" > /dev/null; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ Error${NC}"
fi

# Productos
echo -n "Productos: "
if curl -s "$BACKEND_URL/api/productos" > /dev/null; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ Error${NC}"
fi

# Root path
echo -n "Root path: "
if curl -s "$BACKEND_URL/" > /dev/null; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ Error${NC}"
fi

echo ""
echo -e "${YELLOW}📋 Posibles causas del error 502:${NC}"
echo ""
echo "1. **Variables de entorno faltantes**:"
echo "   - ADMIN_USER"
echo "   - ADMIN_PASSWORD"
echo "   - SPREADSHEET_ID"
echo "   - GOOGLE_APPLICATION_CREDENTIALS_JSON"
echo "   - FRONTEND_URL"
echo ""
echo "2. **Problemas con Google Sheets API**:"
echo "   - Credenciales incorrectas"
echo "   - Spreadsheet ID incorrecto"
echo "   - Permisos insuficientes"
echo ""
echo "3. **Problemas de build**:"
echo "   - Dependencias faltantes"
echo "   - Errores de sintaxis"
echo "   - Puerto incorrecto"
echo ""
echo -e "${BLUE}🔧 Soluciones:${NC}"
echo ""
echo "1. **Verificar variables de entorno en Render**:"
echo "   - Ve a https://dashboard.render.com"
echo "   - Encuentra tu servicio 'catalog-sheet-backend'"
echo "   - Ve a 'Environment' → 'Environment Variables'"
echo "   - Verifica que todas las variables estén configuradas"
echo ""
echo "2. **Verificar logs del servicio**:"
echo "   - En el dashboard de Render, ve a 'Logs'"
echo "   - Busca errores específicos"
echo ""
echo "3. **Forzar redeploy manual**:"
echo "   - En el dashboard de Render, haz clic en 'Manual Deploy'"
echo "   - Selecciona 'Deploy latest commit'"
echo ""
echo "4. **Verificar configuración del servicio**:"
echo "   - Build Command: npm run build:backend"
echo "   - Start Command: cd backend && npm start"
echo "   - Port: 10000 (o el que esté configurado)"
echo ""
echo -e "${YELLOW}📝 Variables de entorno requeridas:${NC}"
echo "ADMIN_USER=tu_usuario"
echo "ADMIN_PASSWORD=tu_contraseña"
echo "SPREADSHEET_ID=tu_spreadsheet_id"
echo "GOOGLE_APPLICATION_CREDENTIALS_JSON={\"type\":\"service_account\",...}"
echo "FRONTEND_URL=https://alnortegrow-catalog.vercel.app"
echo "NODE_ENV=production"
echo "PORT=10000" 