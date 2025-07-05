#!/bin/bash

echo "🔐 Configuración de Variables de Entorno"
echo "========================================"
echo ""

# Verificar si ya existe el archivo .env
if [ -f ".env" ]; then
    echo "⚠️  El archivo .env ya existe."
    read -p "¿Deseas sobrescribirlo? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Configuración cancelada."
        exit 1
    fi
fi

echo ""
echo "📝 Configurando credenciales de administrador..."
echo ""

# Solicitar credenciales
read -p "Usuario de administrador (default: admin): " admin_user
admin_user=${admin_user:-admin}

read -s -p "Contraseña de administrador (default: admin123): " admin_password
echo
admin_password=${admin_password:-admin123}

read -p "ID de Google Sheets (default: TU_SPREADSHEET_ID_AQUI): " spreadsheet_id
spreadsheet_id=${spreadsheet_id:-TU_SPREADSHEET_ID_AQUI}

read -p "Puerto del servidor (default: 3001): " port
port=${port:-3001}

read -p "URL del frontend (default: http://localhost:3000): " frontend_url
frontend_url=${frontend_url:-http://localhost:3000}

# Crear archivo .env
cat > .env << EOF
# Credenciales de administrador
ADMIN_USER=$admin_user
ADMIN_PASSWORD=$admin_password

# Configuración de Google Sheets
SPREADSHEET_ID=$spreadsheet_id

# Configuración del servidor
PORT=$port
NODE_ENV=development

# URL del frontend (para CORS)
FRONTEND_URL=$frontend_url
EOF

echo ""
echo "✅ Archivo .env creado exitosamente!"
echo ""
echo "📋 Configuración actual:"
echo "   Usuario: $admin_user"
echo "   Contraseña: ${admin_password:0:3}***"
echo "   Puerto: $port"
echo "   Frontend: $frontend_url"
echo ""
echo "🔒 Recuerda:"
echo "   - El archivo .env está en .gitignore"
echo "   - Nunca subas este archivo al repositorio"
echo "   - Cambia las credenciales regularmente"
echo ""
echo "🚀 Para iniciar el servidor: npm start" 