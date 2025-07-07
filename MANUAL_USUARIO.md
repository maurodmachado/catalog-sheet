# 📚 Manual de Usuario - Sistema de Gestión ALNORTEGROW

## 🎯 Descripción General

El Sistema de Gestión ALNORTEGROW es una aplicación web completa para la gestión de ventas, stock, empleados y cajas. Integrado con Google Sheets como base de datos, proporciona una interfaz intuitiva para administrar todos los aspectos del negocio.

---

## 🚀 Inicio de Sesión

### Acceso al Sistema
1. Abrir el navegador y acceder a la aplicación
2. Ingresar credenciales de administrador:
   - **Usuario**: [configurado por el administrador]
   - **Contraseña**: [configurada por el administrador]
3. Hacer clic en "Iniciar Sesión"

### Cerrar Sesión
- Hacer clic en "Cerrar Sesión" en la esquina superior derecha

---

## 🛒 Nueva Venta

### Búsqueda de Productos
1. **Buscar por nombre**: Escribir el nombre del producto en el campo de búsqueda
2. **Buscar por categoría**: Escribir la categoría del producto
3. **Mostrar todos**: Hacer clic en el campo de búsqueda para ver todos los productos
4. **Filtrar sin stock**: Usar el botón "🚫 Mostrar sin stock" para incluir productos sin stock

### Agregar Productos al Carrito
1. Seleccionar un producto de la lista de búsqueda
2. Verificar la información del producto (nombre, precio, stock)
3. Ajustar la cantidad si es necesario
4. Hacer clic en "➕ Agregar"

### Gestión del Carrito
- **Ver productos**: Los productos agregados aparecen en la tabla "Productos en la venta"
- **Quitar producto**: Hacer clic en "Quitar" junto al producto deseado
- **Ver total**: El total se actualiza automáticamente

### Formas de Pago
1. **Efectivo**: Ingresar monto en efectivo
2. **Transferencia**: Ingresar monto por transferencia
3. **POS**: Ingresar monto por tarjeta
4. **Validación**: El total de pagos debe coincidir con el total de la venta

### Información del Cliente
- **Cliente**: Nombre del cliente (opcional)
- **Observaciones**: Notas adicionales sobre la venta

### Finalizar Venta
1. Verificar que el total de pagos coincida con el total de la venta
2. Hacer clic en "💳 Generar Venta"
3. Confirmar la operación

---

## 📋 Gestión de Ventas

### Ver Historial de Ventas
- Acceder a la sección "📋 Gestionar Ventas"
- Ver lista de todas las ventas realizadas
- Información mostrada:
  - ID de venta
  - Fecha y hora
  - Vendedor
  - Total
  - Cantidad de productos
  - Métodos de pago utilizados
  - Observaciones

### Eliminar Venta
1. Localizar la venta en la lista
2. Hacer clic en "Eliminar"
3. Confirmar la eliminación

---

## 💰 Gestión de Cajas

### Abrir Caja
1. Acceder a la sección "💰 Gestionar Cajas"
2. Seleccionar turno (Mañana/Tarde)
3. Seleccionar empleado
4. Ingresar monto de apertura
5. Hacer clic en "💰 Abrir Caja"

### Cerrar Caja
1. Ingresar monto de cierre
2. Hacer clic en "🔒 Cerrar Caja"
3. Verificar el resumen del turno

### Ver Historial de Cajas
- Lista de todas las cajas cerradas
- Información mostrada:
  - Fecha de apertura y cierre
  - Empleado responsable
  - Montos de apertura y cierre
  - Ventas realizadas
  - Diferencia

---

## 📦 Gestión de Stock

### Ver Productos
- Acceder a la sección "📦 Gestionar Stock"
- Ver lista de todos los productos con su stock actual
- Productos con bajo stock aparecen destacados

### Filtros Disponibles
- **Búsqueda**: Por nombre, categoría o descripción
- **Categoría**: Filtrar por categoría específica
- **Ordenamiento**: Por stock (menor a mayor o mayor a menor)
- **Sin stock**: Mostrar/ocultar productos sin stock

### Editar Producto
1. Hacer clic en el botón "✏️" junto al producto
2. Modificar:
   - Precio
   - Categoría
   - Descripción
   - Stock
3. Hacer clic en "💾 Guardar Cambios"

### Agregar Stock
1. Seleccionar producto
2. Ingresar cantidad a agregar
3. Hacer clic en "➕ Agregar Stock"

### Edición Masiva de Precios
1. Aplicar filtros para seleccionar productos
2. Hacer clic en "📈 Edición Masiva"
3. Seleccionar alcance:
   - **Productos filtrados**: Solo los productos que coinciden con los filtros
   - **Todos los productos**: Todos los productos del sistema
4. Ingresar porcentaje de ajuste
5. Hacer clic en "🔄 Aplicar Cambios"

---

## 👥 Gestión de Empleados

### Ver Empleados
- Acceder a la sección "👥 Gestionar Empleados"
- Ver lista de todos los empleados registrados

### Agregar Empleado
1. Ingresar nombre del empleado
2. Hacer clic en "➕ Agregar Empleado"

### Editar Empleado
1. Hacer clic en "✏️" junto al empleado
2. Modificar el nombre
3. Hacer clic en "💾 Guardar" o "❌ Cancelar"

---

## 📊 Reportes

### Métricas Principales
- **Total de ventas**: Monto total de ventas en el período
- **Cantidad de ventas**: Número total de ventas
- **Promedio por venta**: Ticket promedio
- **Cajas cerradas**: Número de turnos completados

### Métodos de Pago
- Desglose por efectivo, transferencia y POS
- Porcentajes y montos totales

### Productos Más Vendidos
- Top 10 productos con mayor cantidad vendida
- Información detallada de cada producto

### Estadísticas de Productos
- Total de productos en el sistema
- Stock total disponible
- Productos sin stock

### Filtros de Reportes
- **Mes**: Filtrar por mes específico
- **Año**: Filtrar por año específico
- **Empleado**: Filtrar por vendedor específico
- **Limpiar filtros**: Restablecer todos los filtros

---

## 📄 Generación de Presupuestos

### Crear Presupuesto
1. Agregar productos al carrito (ver sección "Nueva Venta")
2. Completar información del cliente y observaciones
3. Elegir entre:
   - **📄 Generar PDF**: Descargar presupuesto en PDF
   - **Enviar por WhatsApp**: Generar PDF y abrir WhatsApp Web

### Características del PDF
- **Header**: Logo y nombre de la empresa
- **Información del presupuesto**:
  - Fecha
  - Vendedor
  - Número de presupuesto
  - Cliente
- **Tabla de productos**:
  - Nombre del producto
  - Cantidad
  - Precio unitario
  - Total por producto
- **Total del presupuesto**
- **Observaciones** (si las hay)
- **Footer**: Validez de 7 días y número de contacto

### Envío por WhatsApp
1. Hacer clic en "Enviar por WhatsApp"
2. Ingresar número de teléfono (con código de país)
3. Se abre WhatsApp Web con mensaje predefinido
4. Adjuntar manualmente el PDF generado

---

## ⚙️ Configuración del Sistema

### Variables de Entorno
El sistema utiliza las siguientes variables de entorno:

#### Backend (.env)
```env
# Google Sheets
SPREADSHEET_ID=tu_spreadsheet_id
GOOGLE_APPLICATION_CREDENTIALS_JSON=tu_credencial_json

# Configuración del servidor
PORT=3001
NODE_ENV=production

# Configuración de contacto
TELEFONO=+5491112345678

# Frontend URL (para CORS)
FRONTEND_URL=https://tu-dominio.com
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
```

### Configuración de Google Sheets
1. Crear proyecto en Google Cloud Console
2. Habilitar Google Sheets API
3. Crear cuenta de servicio
4. Descargar archivo JSON de credenciales
5. Compartir la hoja de cálculo con la cuenta de servicio

---

## 🔧 Funcionalidades Técnicas

### Seguridad
- **Autenticación**: Sistema de login con credenciales
- **CORS**: Configurado para dominios específicos
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **Helmet**: Headers de seguridad HTTP

### Optimización
- **Compresión**: Respuestas comprimidas con gzip
- **Caché**: Headers de caché apropiados
- **Rate Limiting**: Límites de requests por IP

### Monitoreo
- **Health Check**: Endpoint `/api/health` para verificar estado
- **Logs**: Registro de errores y eventos importantes
- **Métricas**: Estadísticas de uso del sistema

---

## 🚨 Solución de Problemas

### Problemas Comunes

#### Error de Conexión
- Verificar que el backend esté ejecutándose
- Comprobar la URL de la API en las variables de entorno
- Verificar la conectividad de red

#### Error de Google Sheets
- Verificar que las credenciales sean correctas
- Comprobar que la hoja esté compartida con la cuenta de servicio
- Verificar que el SPREADSHEET_ID sea correcto

#### Productos no se cargan
- Verificar la estructura de la hoja de cálculo
- Comprobar que las columnas estén en el orden correcto
- Verificar permisos de lectura en Google Sheets

#### PDF no se genera
- Verificar que el directorio `temp` tenga permisos de escritura
- Comprobar que el número de teléfono esté configurado
- Verificar que los productos tengan información válida

### Logs del Sistema
- **Backend**: Los logs se muestran en la consola del servidor
- **Frontend**: Los errores se muestran en la consola del navegador
- **Errores de red**: Se muestran en la interfaz de usuario

---

## 📞 Soporte

### Información de Contacto
- **Empresa**: ALNORTEGROW
- **Sitio web**: www.alnortegrow.com.ar
- **Teléfono**: [Configurado en variables de entorno]

### Versión del Sistema
- **Versión actual**: 2.0.0
- **Última actualización**: [Fecha de la última actualización]

---

## 📝 Notas Importantes

### Mejores Prácticas
1. **Cerrar caja al final del turno**: Mantener registros precisos
2. **Verificar stock regularmente**: Evitar ventas de productos sin stock
3. **Hacer backup de datos**: Google Sheets mantiene versiones automáticas
4. **Usar filtros en reportes**: Obtener información más específica

### Limitaciones
- El sistema requiere conexión a internet para funcionar
- Los cambios en Google Sheets pueden tardar unos segundos en reflejarse
- El número máximo de productos recomendado es 10,000

### Actualizaciones
- El sistema se actualiza automáticamente al reiniciar el servidor
- Verificar regularmente las dependencias de seguridad
- Mantener las credenciales de Google Sheets actualizadas