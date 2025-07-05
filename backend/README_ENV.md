# Configuración de Variables de Entorno

## Seguridad de Credenciales

Para mejorar la seguridad del sistema, las credenciales de administrador ahora se manejan a través de variables de entorno en lugar de estar hardcodeadas en el código.

## Configuración

### 1. Crear archivo .env

Crea un archivo `.env` en la carpeta `backend/` con el siguiente contenido:

```env
# Credenciales de administrador
ADMIN_USER=tu_usuario_admin
ADMIN_PASSWORD=tu_contraseña_segura

# Configuración de Google Sheets
SPREADSHEET_ID=TU_SPREADSHEET_ID_AQUI

# Configuración del servidor
PORT=3001
NODE_ENV=development

# URL del frontend (para CORS)
FRONTEND_URL=http://localhost:3000
```

### 2. Variables de Entorno Disponibles

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `ADMIN_USER` | Usuario de administrador | `admin` |
| `ADMIN_PASSWORD` | Contraseña de administrador | `admin123` |
| `SPREADSHEET_ID` | ID de tu hoja de Google Sheets | `TU_SPREADSHEET_ID_AQUI` |
| `PORT` | Puerto del servidor | `3001` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `FRONTEND_URL` | URL del frontend para CORS | `http://localhost:3000` |

### 3. Seguridad

- **NUNCA** subas el archivo `.env` al repositorio
- El archivo `.env` ya está incluido en `.gitignore`
- Usa contraseñas fuertes y únicas
- Cambia las credenciales regularmente

### 4. Para Producción

En producción, configura las variables de entorno directamente en tu plataforma de hosting:

- **Render**: Usa la sección "Environment Variables"
- **Heroku**: Usa `heroku config:set`
- **Vercel**: Usa la sección "Environment Variables"
- **Railway**: Usa la sección "Variables"

### 5. Ejemplo de Configuración

```env
# Desarrollo local
ADMIN_USER=admin_local
ADMIN_PASSWORD=mi_contraseña_super_segura_123
SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Producción
ADMIN_USER=admin_produccion
ADMIN_PASSWORD=contraseña_muy_segura_produccion_456
SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://tu-dominio.com
```

## Beneficios

1. **Seguridad**: Las credenciales no están en el código
2. **Flexibilidad**: Fácil cambio de credenciales sin modificar código
3. **Entornos**: Diferentes credenciales para desarrollo y producción
4. **Colaboración**: Cada desarrollador puede tener sus propias credenciales
5. **Deployment**: Configuración automática en diferentes plataformas

## Notas Importantes

- Si no configuras las variables de entorno, se usarán los valores por defecto
- El sistema seguirá funcionando con las credenciales por defecto, pero no es recomendable para producción
- Recuerda reiniciar el servidor después de cambiar las variables de entorno 