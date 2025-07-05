# 📋 Catálogo de Productos - Sistema de Ventas

Sistema completo de catálogo de productos y gestión de ventas integrado con Google Sheets como backend de datos.

## 🚀 Características

### Frontend (React + Vite)
- **Catálogo de productos** con filtros por categoría
- **Carrito de compras** con gestión de cantidades
- **Sistema de ofertas** con cálculo automático de descuentos
- **Diseño responsive** para móviles y desktop
- **Interfaz intuitiva** con emojis y animaciones

### Backend (Node.js + Express)
- **API RESTful** completa
- **Integración con Google Sheets** para datos
- **Sistema de caja** con apertura/cierre
- **Gestión de ventas** con múltiples métodos de pago
- **Reportes y métricas** en tiempo real
- **Autenticación de administradores**

### Panel de Administración
- **Gestión de productos** (CRUD completo)
- **Control de caja** y turnos
- **Reportes detallados** con filtros
- **Métricas de negocio** en tiempo real
- **Gestión de empleados**

## 🛠️ Tecnologías

- **Frontend**: React 19, Vite, CSS3
- **Backend**: Node.js, Express, Google Sheets API
- **Base de Datos**: Google Sheets
- **Testing**: Jest, Vitest, Testing Library
- **Deployment**: Docker, Nginx
- **CI/CD**: GitHub Actions

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm 8+
- Cuenta de Google Cloud con Sheets API habilitada

### Desarrollo Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/catalog-sheet.git
cd catalog-sheet
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp env.example .env
# Editar .env con tus credenciales de Google
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

### Variables de Entorno Requeridas

```env
# Google Sheets API
SPREADSHEET_ID=tu_spreadsheet_id_aqui
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}

# Servidor
NODE_ENV=development
PORT=3001

# Frontend
VITE_API_URL=http://localhost:3001
```

## 🧪 Testing

### Ejecutar Tests
```bash
# Todos los tests
npm test

# Tests del backend
npm run test:backend

# Tests del frontend
npm run test:frontend

# Tests con coverage
npm run test:coverage
```

### Cobertura de Tests
- **Backend**: 70%+ (líneas, funciones, branches)
- **Frontend**: Componentes principales y utilidades
- **E2E**: Flujos críticos de usuario

## 🚀 Despliegue

### Despliegue Automatizado

Usa nuestro script de despliegue automatizado:

```bash
./deploy.sh
```

Este script te guiará a través de las opciones de despliegue disponibles.

### Variables de Entorno Requeridas

**⚠️ IMPORTANTE**: Configura estas variables en tu plataforma de despliegue:

```env
# Credenciales de administrador
ADMIN_USER=tu_usuario_admin
ADMIN_PASSWORD=tu_contraseña_segura

# Google Sheets API
SPREADSHEET_ID=tu_spreadsheet_id_aqui
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}

# Servidor
NODE_ENV=production
PORT=3001

# Frontend
FRONTEND_URL=https://tu-dominio.com
```

### Docker (Recomendado)

1. **Configurar variables de entorno**
```bash
cp backend/env.example backend/.env
# Editar backend/.env con tus credenciales
```

2. **Ejecutar con Docker Compose**
```bash
docker-compose up -d
```

3. **Solo backend**
```bash
docker-compose up backend
```

### Plataformas de Despliegue

#### Render
1. **Conectar repositorio** en Render
2. **Configurar variables de entorno**:
   - `ADMIN_USER`
   - `ADMIN_PASSWORD`
   - `SPREADSHEET_ID`
   - `GOOGLE_APPLICATION_CREDENTIALS_JSON`
   - `FRONTEND_URL`
3. **Build Command**: `npm run build:backend`
4. **Start Command**: `cd backend && npm start`

#### Railway
1. **Instalar Railway CLI**:
```bash
npm install -g @railway/cli
```

2. **Conectar proyecto**:
```bash
railway login
railway init
```

3. **Configurar variables de entorno** en el dashboard de Railway
4. **Desplegar**:
```bash
railway up
```

#### Vercel
1. **Instalar Vercel CLI**:
```bash
npm install -g vercel
```

2. **Configurar variables de entorno** en el dashboard de Vercel
3. **Desplegar**:
```bash
vercel --prod
```

#### Heroku
1. **Crear aplicación**:
```bash
heroku create catalog-sheet-app
```

2. **Configurar variables de entorno**:
```bash
heroku config:set NODE_ENV=production
heroku config:set ADMIN_USER=tu_usuario
heroku config:set ADMIN_PASSWORD=tu_contraseña
heroku config:set SPREADSHEET_ID=tu_id
heroku config:set GOOGLE_APPLICATION_CREDENTIALS_JSON=tu_json
```

3. **Desplegar**:
```bash
git push heroku main
```

### Configuración de Seguridad

1. **Cambiar credenciales por defecto**:
   - Edita `backend/.env` con credenciales seguras
   - Nunca uses las credenciales por defecto en producción

2. **Configurar CORS**:
   - Ajusta `FRONTEND_URL` en las variables de entorno
   - Para desarrollo: `http://localhost:3000`
   - Para producción: `https://tu-dominio.com`

3. **Google Sheets API**:
   - Asegúrate de que las credenciales tengan permisos de lectura/escritura
   - Comparte la hoja con la cuenta de servicio

### Monitoreo y Logs

- **Health Check**: `GET /api/health`
- **Logs**: Revisa los logs de tu plataforma de despliegue
- **Métricas**: El sistema incluye métricas automáticas en `/api/metricas`

## 📊 Estructura del Proyecto

```