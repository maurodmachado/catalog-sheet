# 🚀 Guía de Despliegue en Producción - ALNORTEGROW

## 📋 Requisitos Previos

### Software Necesario
- Node.js 18.0.0 o superior
- npm 8.0.0 o superior
- Git

### Servicios Externos
- Google Cloud Console (para Google Sheets API)
- Cuenta de Google Sheets
- Servidor o plataforma de hosting (Render, Heroku, Vercel, etc.)

---

## 🔧 Configuración de Google Sheets

### 1. Crear Proyecto en Google Cloud Console
1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear nuevo proyecto o seleccionar existente
3. Habilitar Google Sheets API
4. Crear cuenta de servicio:
   - Ir a "IAM & Admin" > "Service Accounts"
   - Crear nueva cuenta de servicio
   - Descargar archivo JSON de credenciales

### 2. Configurar Hoja de Cálculo
1. Crear nueva hoja de Google Sheets
2. Configurar las siguientes hojas:
   - **Productos**: Columnas A-G (Nombre, Categoría, Precio, Oferta, Descripción, Imagen, Stock)
   - **Ventas**: Columnas A-H (ID, Fecha, Hora, Productos, Total, Métodos de Pago, Cliente, Observaciones)
   - **Cajas**: Columnas A-G (ID, Fecha Apertura, Hora Apertura, Empleado, Turno, Monto Apertura, Estado)
   - **Empleados**: Columnas A-B (ID, Nombre)

3. Compartir la hoja con la cuenta de servicio (dar permisos de Editor)

---

## ⚙️ Configuración del Backend

### 1. Variables de Entorno
Crear archivo `.env` en la carpeta `backend/`:

```env
NODE_ENV=production
PORT=3001

# Google Sheets
SPREADSHEET_ID=tu_spreadsheet_id_aqui
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}

# Configuración de Contacto
TELEFONO=+5491112345678

# Frontend URL
FRONTEND_URL=https://tu-dominio-frontend.com

# Seguridad
RATE_LIMIT_MAX=500
RATE_LIMIT_WINDOW_MS=60000
```

### 2. Instalación de Dependencias
```bash
cd backend
npm install --production
```

### 3. Configuración de Seguridad
- Verificar que `helmet` esté configurado
- Ajustar CORS para dominios específicos
- Configurar rate limiting apropiado

---

## 🎨 Configuración del Frontend

### 1. Variables de Entorno
Crear archivo `.env` en la carpeta `frontend/`:

```env
VITE_API_URL=https://tu-dominio-backend.com
```

### 2. Instalación de Dependencias
```bash
cd frontend
npm install
```

### 3. Build de Producción
```bash
npm run build
```

---

## 🚀 Despliegue

### Opción 1: Render (Recomendado)

#### Backend
1. Conectar repositorio a Render
2. Configurar:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: Agregar todas las variables de `.env`

#### Frontend
1. Conectar repositorio a Render
2. Configurar:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**: `VITE_API_URL=https://tu-backend.onrender.com`

### Opción 2: Vercel

#### Frontend
1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático

### Opción 3: Heroku

#### Backend
1. Crear app en Heroku
2. Conectar repositorio
3. Configurar variables de entorno
4. Deploy

---

## 🔒 Configuración de Seguridad

### 1. Autenticación
- Cambiar credenciales por defecto
- Usar contraseñas fuertes
- Implementar autenticación de dos factores si es posible

### 2. CORS
- Configurar solo dominios permitidos
- No usar `*` en producción

### 3. Rate Limiting
- Ajustar límites según el tráfico esperado
- Monitorear logs de rate limiting

### 4. Headers de Seguridad
- Verificar que `helmet` esté activo
- Configurar CSP apropiadamente

---

## 📊 Monitoreo y Logs

### 1. Health Check
- Endpoint: `GET /api/health`
- Verificar regularmente el estado del servicio

### 2. Logs
- Configurar logging apropiado
- Monitorear errores y performance

### 3. Métricas
- Usar herramientas como New Relic, DataDog, etc.
- Monitorear:
  - Response times
  - Error rates
  - Memory usage
  - CPU usage

---

## 🔄 Mantenimiento

### 1. Actualizaciones
- Mantener dependencias actualizadas
- Revisar vulnerabilidades de seguridad
- Hacer backup antes de actualizaciones

### 2. Backup
- Google Sheets mantiene versiones automáticas
- Hacer backup de configuración
- Documentar cambios importantes

### 3. Escalabilidad
- Monitorear uso de recursos
- Ajustar configuración según necesidades
- Considerar CDN para archivos estáticos

---

## 🚨 Troubleshooting

### Problemas Comunes

#### Error 500 - Google Sheets
- Verificar credenciales
- Comprobar permisos de la hoja
- Verificar SPREADSHEET_ID

#### CORS Errors
- Verificar FRONTEND_URL en backend
- Comprobar configuración de CORS
- Verificar protocolo (http/https)

#### Rate Limiting
- Ajustar límites en configuración
- Verificar si hay ataques
- Monitorear logs

#### Memory Issues
- Aumentar memoria del servidor
- Optimizar queries
- Implementar caching

---

## 📞 Soporte

### Contacto
- **Empresa**: ALNORTEGROW
- **Email**: [email de soporte]
- **Teléfono**: [número de soporte]

### Documentación
- Manual de Usuario: `MANUAL_USUARIO.md`
- API Documentation: Endpoint `/api/health` para verificar estado

### Recursos
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://reactjs.org/) 