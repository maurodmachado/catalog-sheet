#!/bin/bash

echo "🛍️ Configurando Catálogo de Productos desde Google Sheets"
echo "=================================================="

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js primero."
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd backend
npm install
cd ..

# Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
cd frontend
npm install
cd ..

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Copia tu archivo JSON de credenciales de Google como 'backend/credentials.json'"
echo "2. Copia 'backend/env.example' como 'backend/.env' y configura tu SPREADSHEET_ID"
echo "3. Comparte tu hoja de Google con el email de la cuenta de servicio"
echo "4. Ejecuta 'cd backend && npm run dev' para iniciar el servidor"
echo "5. Ejecuta 'cd frontend && npm run dev' para iniciar el frontend"
echo ""
echo "📖 Lee el README.md para instrucciones detalladas" 