#!/bin/bash

echo "🔧 Solucionando error 502 en Render"
echo "==================================="
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

# Verificar estado actual
echo -e "${BLUE}1. Verificando estado actual...${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/health")
echo "Status code: $response"

if [ "$response" = "502" ]; then
    echo -e "${RED}❌ Error 502 confirmado${NC}"
    echo ""
    echo -e "${YELLOW}📋 Causas comunes del error 502:${NC}"
    echo ""
    echo "1. **Variables de entorno faltantes o incorrectas**"
    echo "2. **Problemas con Google Sheets API**"
    echo "3. **Errores en el código del backend**"
    echo "4. **Problemas de configuración en Render**"
    echo "5. **El servicio no se ha desplegado correctamente**"
    echo ""
    
    echo -e "${BLUE}🔧 Soluciones paso a paso:${NC}"
    echo ""
    echo -e "${YELLOW}Paso 1: Verificar variables de entorno en Render${NC}"
    echo "1. Ve a https://dashboard.render.com"
    echo "2. Encuentra tu servicio 'catalog-sheet-backend'"
    echo "3. Ve a 'Environment' → 'Environment Variables'"
    echo "4. Verifica que estas variables estén configuradas:"
    echo "   - ADMIN_USER"
    echo "   - ADMIN_PASSWORD"
    echo "   - SPREADSHEET_ID"
    echo "   - GOOGLE_APPLICATION_CREDENTIALS_JSON"
    echo "   - FRONTEND_URL"
    echo "   - NODE_ENV=production"
    echo "   - PORT=10000"
    echo ""
    
    echo -e "${YELLOW}Paso 2: Verificar logs del servicio${NC}"
    echo "1. En el dashboard de Render, ve a 'Logs'"
    echo "2. Busca errores específicos como:"
    echo "   - 'Cannot find module'"
    echo "   - 'Invalid credentials'"
    echo "   - 'Port already in use'"
    echo "   - 'Spreadsheet not found'"
    echo ""
    
    echo -e "${YELLOW}Paso 3: Forzar redeploy manual${NC}"
    echo "1. En el dashboard de Render, haz clic en 'Manual Deploy'"
    echo "2. Selecciona 'Deploy latest commit'"
    echo "3. Espera a que termine el deploy"
    echo ""
    
    echo -e "${YELLOW}Paso 4: Verificar configuración del servicio${NC}"
    echo "Build Command: npm run build:backend"
    echo "Start Command: cd backend && npm start"
    echo "Port: 10000 (o el que esté configurado)"
    echo ""
    
    echo -e "${YELLOW}Paso 5: Verificar Google Sheets API${NC}"
    echo "1. Verifica que el SPREADSHEET_ID sea correcto"
    echo "2. Verifica que las credenciales de Google Sheets sean válidas"
    echo "3. Verifica que el spreadsheet tenga los permisos correctos"
    echo ""
    
    echo -e "${BLUE}📝 Comandos útiles para diagnóstico:${NC}"
    echo ""
    echo "# Verificar si el backend responde"
    echo "curl -I $BACKEND_URL/api/health"
    echo ""
    echo "# Verificar logs en tiempo real (si tienes acceso)"
    echo "render logs --service catalog-sheet-backend --follow"
    echo ""
    echo "# Verificar variables de entorno (si tienes acceso)"
    echo "render env list --service catalog-sheet-backend"
    echo ""
    
    echo -e "${YELLOW}⚠️  Acciones inmediatas recomendadas:${NC}"
    echo ""
    echo "1. **Ir al dashboard de Render AHORA**"
    echo "2. **Verificar las variables de entorno**"
    echo "3. **Revisar los logs del servicio**"
    echo "4. **Forzar un redeploy manual**"
    echo ""
    
    echo -e "${GREEN}✅ Después de hacer los cambios:${NC}"
    echo "1. Espera 2-3 minutos para que el deploy termine"
    echo "2. Ejecuta: ./diagnose-render.sh"
    echo "3. Si persiste el problema, revisa los logs"
    echo ""
    
else
    echo -e "${GREEN}✅ El backend está funcionando correctamente${NC}"
    echo "Status code: $response"
fi

echo ""
echo -e "${BLUE}🔗 Enlaces útiles:${NC}"
echo "Dashboard Render: https://dashboard.render.com"
echo "Documentación Render: https://render.com/docs/troubleshooting-deploys#502-bad-gateway"
echo "Google Sheets API: https://developers.google.com/sheets/api" 