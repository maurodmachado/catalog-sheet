# Instrucciones para implementar el Apps Script en Google Sheets

## Problema resuelto
- ✅ **Cálculo del total**: Ahora suma correctamente todos los subtotales (no los precios unitarios)
- ✅ **Formateo de productos**: Todos los productos de una venta se formatean correctamente, incluyendo el del medio
- ✅ **Conflicto de formato**: Solucionado con nueva versión que limpia todo el formato antes de aplicar el nuevo

## Pasos para implementar el Apps Script

### 1. Abrir Google Sheets
1. Ve a tu Google Sheets con el catálogo
2. Asegúrate de que tienes una hoja llamada "Ventas" con las columnas: Fecha, Hora, Producto, Cantidad, Precio Unitario, Subtotal, Total, Efectivo, Transferencia, POS, Observaciones

### 2. Abrir el editor de Apps Script
1. En Google Sheets, ve a **Extensiones** > **Apps Script**
2. Se abrirá una nueva pestaña con el editor de código

### 3. Reemplazar el código existente
1. Borra todo el código que esté en el editor
2. **RECOMENDADO**: Copia y pega el código del archivo `apps-script-v2.js` (versión mejorada)
3. **ALTERNATIVO**: Si prefieres la versión original, usa `apps-script.js`
4. Guarda el proyecto (Ctrl+S o Cmd+S)

### 4. Configurar el trigger automático
1. En el editor de Apps Script, haz clic en el ícono de reloj ⏰ (Triggers)
2. Haz clic en **"Agregar trigger"**
3. Configura:
   - **Función a ejecutar**: `onEdit`
   - **Fuente del evento**: `Desde la hoja de cálculo`
   - **Tipo de evento**: `Al editar`
   - **Fallo en**: `Notificarme inmediatamente`
4. Haz clic en **"Guardar"**

### 5. Probar el formateo
1. Ve de vuelta a tu Google Sheets
2. Registra una venta con múltiples productos desde el frontend
3. Verifica que:
   - Todos los productos se formateen con el mismo estilo
   - Las celdas de fecha y hora se fusionen correctamente
   - Las celdas de total, efectivo, transferencia, POS y observaciones se fusionen correctamente
   - Los subtotales tengan fondo amarillo
   - El total tenga fondo verde oscuro
   - El total sea la suma correcta de todos los subtotales

### 6. Formatear ventas existentes (opcional)
Si ya tienes ventas sin formatear:
1. En el editor de Apps Script, selecciona la función `formatearTodasLasVentas`
2. Haz clic en el botón de play ▶️
3. Esto formateará todas las ventas existentes

## Funciones disponibles

### `onEdit(e)`
- Se ejecuta automáticamente cuando se edita la hoja "Ventas"
- Llama a `formatearVentasCompleto()` después de un pequeño delay

### `formatearVentasCompleto()` (V2)
- **Limpia todo el formato existente** para evitar conflictos
- Busca grupos de ventas con la misma fecha y hora
- Aplica formato a cada grupo de forma consistente

### `formatearVentas()` (V1)
- Busca grupos de ventas con la misma fecha y hora
- Aplica formato a cada grupo

### `formatearGrupoVenta(sheet, filas)`
- Aplica formato específico a un grupo de productos de la misma venta
- Fusiona celdas de fecha y hora
- Aplica colores y estilos diferenciados

### `formatearTodasLasVentas()`
- Función manual para formatear todas las ventas existentes
- Útil para ventas que ya están en la hoja

### `formatearUltimaVenta()` (V2)
- Formatea solo la última venta agregada
- Útil para formateo rápido sin afectar ventas existentes

### `limpiarFormatoVentas()`
- Limpia todo el formato de la hoja Ventas
- Restaura solo el formato básico de encabezados

## Estructura del formato

### Colores utilizados:
- **Fondo general**: Azul claro (`#f0f9ff`)
- **Subtotales**: Amarillo claro (`#fef3c7`)
- **Total principal**: Verde oscuro (`#059669`) con texto blanco
- **Pagos (efectivo, transferencia, POS, observaciones)**: Verde claro (`#dcfce7`)

### Características:
- ✅ Texto en negrita para toda la fila
- ✅ Centrado horizontal y vertical
- ✅ Bordes en todas las celdas
- ✅ Fusión de celdas para fecha y hora
- ✅ Fusión de celdas para total, efectivo, transferencia, POS y observaciones
- ✅ Formato especial para subtotales y total
- ✅ Diferentes colores para distinguir elementos

## Solución de problemas

### Si el formateo no funciona:
1. Verifica que el trigger esté configurado correctamente
2. Revisa la consola de Apps Script para errores
3. **V2**: Ejecuta manualmente `formatearTodasLasVentas()` (reformatea todo)
4. **V2**: O ejecuta `formatearUltimaVenta()` (solo la última venta)
5. **V1**: Ejecuta manualmente `formatearTodasLasVentas()`

### Si hay errores de permisos:
1. Acepta todos los permisos que solicite Apps Script
2. Es necesario para que pueda modificar la hoja

### Si el total sigue siendo incorrecto:
1. Verifica que el backend esté usando la corrección (línea 350 en `server.js`)
2. El total debe sumar los subtotales (columna F), no los precios unitarios (columna E)

## Notas importantes
- El Apps Script se ejecuta automáticamente cada vez que se agrega una nueva venta
- No es necesario ejecutar manualmente el formateo para ventas nuevas
- El formato se aplica a grupos de productos con la misma fecha y hora
- Los cambios en el backend ya están implementados y corregidos 