#!/bin/bash

echo "🚀 Forzando redeploy del backend en Render"
echo "=========================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar que tenemos las variables de entorno necesarias
if [ -z "$RENDER_TOKEN" ]; then
    echo -e "${RED}❌ Error: RENDER_TOKEN no está configurado${NC}"
    echo ""
    echo -e "${YELLOW}Para configurar RENDER_TOKEN:${NC}"
    echo "1. Ve a https://render.com/dashboard"
    echo "2. En tu cuenta, ve a 'Account Settings' → 'API Keys'"
    echo "3. Crea una nueva API key"
    echo "4. Ejecuta: export RENDER_TOKEN=tu_token_aqui"
    echo ""
    exit 1
fi

if [ -z "$RENDER_SERVICE_ID" ]; then
    echo -e "${RED}❌ Error: RENDER_SERVICE_ID no está configurado${NC}"
    echo ""
    echo -e "${YELLOW}Para encontrar RENDER_SERVICE_ID:${NC}"
    echo "1. Ve a tu servicio en Render"
    echo "2. La URL será: https://dashboard.render.com/web/srv-XXXXXXXXXXXX"
    echo "3. El ID es: srv-XXXXXXXXXXXX"
    echo "4. Ejecuta: export RENDER_SERVICE_ID=srv-XXXXXXXXXXXX"
    echo ""
    exit 1
fi

echo -e "${BLUE}Token configurado:${NC} ${RENDER_TOKEN:0:10}..."
echo -e "${BLUE}Service ID:${NC} $RENDER_SERVICE_ID"
echo ""

# Forzar redeploy
echo -e "${BLUE}Iniciando redeploy...${NC}"
RESPONSE=$(curl -s -X POST "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys" \
  -H "Authorization: Bearer $RENDER_TOKEN" \
  -H "Content-Type: application/json")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Redeploy iniciado correctamente${NC}"
    echo ""
    echo -e "${BLUE}Respuesta del servidor:${NC}"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    echo ""
    echo -e "${YELLOW}📋 Próximos pasos:${NC}"
    echo "1. Ve a https://dashboard.render.com/web/$RENDER_SERVICE_ID"
    echo "2. Monitorea el progreso del deploy"
    echo "3. Espera 2-3 minutos para que termine"
    echo "4. Ejecuta: ./check-cors.sh"
else
    echo -e "${RED}❌ Error al iniciar redeploy${NC}"
    echo "$RESPONSE"
fi 