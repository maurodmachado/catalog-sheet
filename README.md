# 🛍️ Catálogo de Productos desde Google Sheets

Una aplicación web moderna que muestra productos desde una hoja de Google Sheets con un diseño atractivo y funcional.

## ✨ Características

- 📊 **Datos desde Google Sheets**: Los productos se cargan automáticamente desde tu hoja de Google
- 🎨 **Diseño moderno**: Interfaz atractiva con gradientes y efectos hover
- 📱 **Responsive**: Se adapta perfectamente a móviles y tablets
- 🔍 **Filtros por categoría**: Filtra productos fácilmente
- 💰 **Formato de precios**: Precios formateados en pesos argentinos
- 🏷️ **Badges de oferta**: Destaca productos en oferta
- ⚡ **Carga rápida**: Optimizado para velocidad

## 🚀 Configuración Rápida

### 1. Preparar Google Sheets

1. Crea una nueva hoja de Google Sheets
2. Agrega estos encabezados en la primera fila:
   ```
   Nombre | Categoria | Precio | Oferta | Descripcion | Imagen
   ```
3. Llena algunas filas con datos de ejemplo
4. Copia el ID de la hoja (está en la URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`)

### 2. Configurar Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo
3. Habilita la **Google Sheets API**
4. Crea una cuenta de servicio y descarga el archivo JSON
5. Comparte tu hoja con el email de la cuenta de servicio

### 3. Configurar el Backend

```bash
cd backend
```

1. Copia tu archivo JSON de credenciales como `credentials.json`
2. Copia `env.example` como `.env` y configura:
   ```env
   SPREADSHEET_ID=TU_SPREADSHEET_ID_AQUI
   PORT=3001
   ```

3. Instala dependencias y ejecuta:
   ```bash
   npm install
   npm run dev
   ```

### 4. Configurar el Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📁 Estructura del Proyecto

```
catalog-sheet/
├── backend/
│   ├── server.js          # Servidor Express
│   ├── credentials.json   # Credenciales de Google (agregar manualmente)
│   ├── .env              # Variables de entorno (crear desde env.example)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # Componente principal
│   │   └── App.css       # Estilos
│   └── package.json
└── README.md
```

## 🔧 Configuración Detallada

### Google Sheets Setup

Tu hoja debe tener esta estructura:

| Nombre | Categoria | Precio | Oferta | Descripcion | Imagen |
|--------|-----------|--------|--------|-------------|--------|
| iPhone 15 | Tecnología | 1500000 | 20% OFF | El último iPhone | https://ejemplo.com/iphone.jpg |
| MacBook Pro | Tecnología | 2500000 | | Laptop profesional | https://ejemplo.com/macbook.jpg |

### Variables de Entorno

En `backend/.env`:
```env
SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
PORT=3001
```

## 🚀 Despliegue

### Railway (Recomendado)

1. Conecta tu repositorio a Railway
2. Configura las variables de entorno en Railway
3. Sube el archivo `credentials.json` como variable de entorno
4. ¡Listo! Tu app estará disponible en internet

### Vercel (Frontend)

1. Conecta el frontend a Vercel
2. Configura la URL de la API en las variables de entorno
3. Despliega automáticamente

## 📱 Uso

1. Abre la aplicación en tu navegador
2. Los productos se cargan automáticamente desde Google Sheets
3. Usa el filtro de categorías para encontrar productos específicos
4. Los productos en oferta se destacan con badges rojos

## 🛠️ Tecnologías

- **Backend**: Node.js, Express, Google Sheets API
- **Frontend**: React, Vite, CSS3
- **Despliegue**: Railway, Vercel

## 📝 Notas

- Las imágenes deben ser URLs públicas
- Los precios se formatean automáticamente en pesos argentinos
- La aplicación es completamente responsive
- Los datos se actualizan automáticamente al cambiar la hoja de Google

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. 