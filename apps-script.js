/**
 * Apps Script con ID de venta para formatear ventas en Google Sheets
 * Versión mejorada con identificación por ID de venta
 */

function onEdit(e) {
  const sheetName = e.source.getActiveSheet().getName();
  
  // Verificar que la edición fue en la hoja "Ventas" o "Caja"
  if (sheetName === 'Ventas') {
    console.log('onEdit activado - editando hoja Ventas');
    
    // Esperar un poco para que los datos se escriban
    SpreadsheetApp.flush();
    Utilities.sleep(2000);
    
    // Procesar ventas automáticamente
    procesarVentasAutomaticamente();
  } else if (sheetName === 'Caja') {
    console.log('onEdit activado - editando hoja Caja');
    
    // Esperar un poco para que los datos se escriban
    SpreadsheetApp.flush();
    Utilities.sleep(1000);
    
    // Aplicar formato a la hoja Caja
    formatearHojaCaja();
  }
}

/**
 * Función principal para formatear la última venta
 */
function formatearUltimaVenta() {
  console.log('Iniciando formatearUltimaVenta()');
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ventas');
  if (!sheet) {
    console.log('No se encontró la hoja Ventas');
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  console.log('Total de filas en la hoja:', data.length);
  
  if (data.length <= 1) {
    console.log('Solo hay encabezados, no hay datos');
    return;
  }
  
  // Obtener la última fila de datos
  const ultimaFila = data.length;
  const ultimaFilaData = data[ultimaFila - 1];
  console.log('Última fila de datos:', ultimaFilaData);
  
  // Generar ID de venta único si no existe
  let idVenta = ultimaFilaData[11]; // Columna L (índice 11)
  console.log('ID de venta encontrado:', idVenta);
  
  if (!idVenta) {
    // Generar ID de venta único
    idVenta = generarIdVenta();
    sheet.getRange(ultimaFila, 12).setValue(idVenta); // Columna L
    console.log('ID de venta generado:', idVenta);
    SpreadsheetApp.flush();
  }
  
  // Aplicar formato básico a la última fila
  console.log('Aplicando formato básico a la última fila...');
  const range = sheet.getRange(ultimaFila, 1, 1, 13); // A:M (13 columnas incluyendo ID y Vendedor)
  range.setFontWeight('bold');
  range.setHorizontalAlignment('center');
  range.setVerticalAlignment('middle');
  range.setBorder(true, true, true, true, true, true);
  range.setBackground('#f0f9ff'); // Azul claro
  console.log('Formato básico aplicado a fila', ultimaFila);
  
  // Aplicar formato especial al subtotal (columna F)
  const subtotalCell = sheet.getRange(ultimaFila, 6);
  subtotalCell.setBackground('#fef3c7'); // Amarillo claro
  subtotalCell.setFontWeight('bold');
  console.log('Formato de subtotal aplicado a fila', ultimaFila);
  
  // Formato especial para pagos (columnas H, I, J, K)
  const pagosRange = sheet.getRange(ultimaFila, 8, 1, 4);
  pagosRange.setBackground('#dcfce7'); // Verde claro
  pagosRange.setFontWeight('bold');
  console.log('Formato de pagos aplicado a fila', ultimaFila);
  
  // Formato especial para el total (columna G)
  const totalCell = sheet.getRange(ultimaFila, 7);
  totalCell.setBackground('#059669'); // Verde oscuro
  totalCell.setFontColor('#ffffff');
  totalCell.setFontWeight('bold');
  totalCell.setFontSize(12);
  console.log('Formato de total aplicado a fila', ultimaFila);
  
  SpreadsheetApp.flush();
  console.log('Formateo completado exitosamente');
}

/**
 * Generar UUID único para venta
 */
function generarIdVenta() {
  return Utilities.getUuid();
}

/**
 * Función para forzar merges manualmente
 */
function forzarMerges() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ventas');
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return;
  
  // Obtener la última fila de datos
  const ultimaFila = data.length;
  const ultimaFilaData = data[ultimaFila - 1];
  const idVenta = ultimaFilaData[11]; // Columna L (índice 11)
  
  if (!idVenta) {
    console.log('No hay ID de venta en la última fila');
    return;
  }
  
  // Encontrar todas las filas con el mismo ID de venta
  const filasDelGrupo = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][11] === idVenta) { // Columna L (índice 11)
      filasDelGrupo.push(i + 1);
    }
  }
  
  if (filasDelGrupo.length <= 1) {
    console.log('No es una venta de múltiples productos');
    return;
  }
  
  const primeraFila = filasDelGrupo[0];
  const ultimaFilaGrupo = filasDelGrupo[filasDelGrupo.length - 1];
  console.log('Forzando merges para venta ID:', idVenta, 'filas:', filasDelGrupo);
  
  // Deshacer merges previos
  try {
    sheet.getRange(primeraFila, 1, filasDelGrupo.length, 13).breakApart();
    console.log('Merges previos deshechos');
  } catch (e) {
    console.log('No había merges previos');
  }
  
  SpreadsheetApp.flush();
  Utilities.sleep(1000);
  
  // Aplicar merges con delays
  const columnasParaMerge = [1, 2, 7, 8, 9, 10, 11, 12, 13]; // A, B, G, H, I, J, K, L (ID), M (Vendedor)
  
  columnasParaMerge.forEach(columna => {
    try {
      sheet.getRange(primeraFila, columna, filasDelGrupo.length, 1).merge();
      console.log('Merge columna', columna, 'forzado');
      SpreadsheetApp.flush();
      Utilities.sleep(300); // Delay entre merges
    } catch (e) {
      console.log('Error forzando merge columna', columna, ':', e);
    }
  });
  
  // Aplicar formato final después de los merges
  Utilities.sleep(500);
  
  // Formato especial para pagos (columnas H, I, J, K) - SIEMPRE en la última fila
  const pagosRange = sheet.getRange(ultimaFilaGrupo, 8, 1, 4);
  pagosRange.setBackground('#dcfce7'); // Verde claro
  pagosRange.setFontWeight('bold');
  
  // Formato especial para el total (columna G) - SIEMPRE en la última fila
  const totalCell = sheet.getRange(ultimaFilaGrupo, 7);
  totalCell.setBackground('#059669'); // Verde oscuro
  totalCell.setFontColor('#ffffff');
  totalCell.setFontWeight('bold');
  totalCell.setFontSize(12);
  
  console.log('Merges forzados completados');
}

/**
 * Función para limpiar formato
 */
function limpiarFormato() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ventas');
  if (!sheet) return;
  
  const range = sheet.getDataRange();
  range.clearFormat();
  
  // Restaurar formato básico de encabezados
  const headerRange = sheet.getRange(1, 1, 1, 13);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#f8fafc');
  headerRange.setHorizontalAlignment('center');
  headerRange.setBorder(true, true, true, true, true, true);
}

/**
 * Función para debug
 */
function debug() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ventas');
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return;
  
  const ultimaFila = data.length;
  const ultimaFilaData = data[ultimaFila - 1];
  const idVenta = ultimaFilaData[11]; // Columna L (índice 11)
  
  console.log('Última fila:', ultimaFila);
  console.log('ID de venta:', idVenta);
  
  if (!idVenta) {
    console.log('No hay ID de venta en la última fila');
    return;
  }
  
  const filasDelGrupo = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][11] === idVenta) { // Columna L (índice 11)
      filasDelGrupo.push(i + 1);
    }
  }
  
  console.log('Filas del grupo:', filasDelGrupo);
  console.log('Cantidad de productos:', filasDelGrupo.length);
  
  // Mostrar datos de cada fila del grupo
  filasDelGrupo.forEach((fila, index) => {
    const rowData = data[fila - 1];
    console.log(`Fila ${fila} - Producto: ${rowData[2]}, Cantidad: ${rowData[3]}, Subtotal: ${rowData[5]}`);
  });
}

/**
 * Función para eliminar una venta completa por ID
 */
function eliminarVentaPorId(idVenta) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ventas');
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return;
  
  // Encontrar todas las filas con el ID de venta
  const filasAEliminar = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][11] === idVenta) { // Columna L (índice 11)
      filasAEliminar.push(i + 1);
    }
  }
  
  if (filasAEliminar.length === 0) {
    console.log('No se encontró la venta con ID:', idVenta);
    return;
  }
  
  console.log('Eliminando venta ID:', idVenta, 'filas:', filasAEliminar);
  
  // Eliminar filas de abajo hacia arriba para evitar problemas con índices
  filasAEliminar.reverse().forEach(fila => {
    sheet.deleteRow(fila);
  });
  
  console.log('Venta eliminada correctamente');
}

/**
 * Función para eliminar la última venta
 */
function eliminarUltimaVenta() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ventas');
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return;
  
  const ultimaFila = data.length;
  const ultimaFilaData = data[ultimaFila - 1];
  const idVenta = ultimaFilaData[11]; // Columna L (índice 11)
  
  if (!idVenta) {
    console.log('No hay ID de venta en la última fila');
    return;
  }
  
  eliminarVentaPorId(idVenta);
}

/**
 * Función de prueba para verificar el funcionamiento
 */
function probarFormato() {
  console.log('=== INICIANDO PRUEBA DE FORMATO ===');
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ventas');
  if (!sheet) {
    console.log('ERROR: No se encontró la hoja Ventas');
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  console.log('Total de filas:', data.length);
  
  if (data.length <= 1) {
    console.log('ERROR: Solo hay encabezados');
    return;
  }
  
  // Mostrar las últimas 3 filas para debug
  console.log('Últimas 3 filas:');
  for (let i = Math.max(1, data.length - 3); i < data.length; i++) {
    console.log(`Fila ${i + 1}:`, data[i]);
  }
  
  // Verificar si hay ID de venta en la última fila
  const ultimaFilaData = data[data.length - 1];
  const idVenta = ultimaFilaData[11];
  console.log('ID de venta en última fila:', idVenta);
  
  if (idVenta) {
    // Contar filas con el mismo ID
    let count = 0;
    for (let i = 1; i < data.length; i++) {
      if (data[i][11] === idVenta) {
        count++;
      }
    }
    console.log(`Filas con ID ${idVenta}: ${count}`);
  }
  
  console.log('=== FIN DE PRUEBA ===');
}

/**
 * Función para verificar si onEdit se está activando
 */
function verificarOnEdit() {
  console.log('=== VERIFICANDO ONEDIT ===');
  console.log('Esta función se ejecuta manualmente');
  console.log('Si onEdit no se activa automáticamente, usa formatearUltimaVenta()');
  console.log('=== FIN VERIFICACIÓN ===');
}

/**
 * Función para forzar el formateo de la última venta
 * Útil cuando onEdit no funciona automáticamente
 */
function formatearAhora() {
  console.log('=== FORZANDO FORMATEO MANUAL ===');
  formatearUltimaVenta();
  console.log('=== FORMATEO MANUAL COMPLETADO ===');
}

/**
 * Función para verificar el estado actual de la hoja
 */
function verificarEstado() {
  console.log('=== VERIFICANDO ESTADO ACTUAL ===');
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ventas');
  if (!sheet) {
    console.log('ERROR: No se encontró la hoja Ventas');
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  console.log('Total de filas:', data.length);
  
  if (data.length <= 1) {
    console.log('ERROR: Solo hay encabezados');
    return;
  }
  
  // Mostrar todas las filas de datos
  console.log('Todas las filas de datos:');
  for (let i = 1; i < data.length; i++) {
    const fila = data[i];
    console.log(`Fila ${i + 1}: ID=${fila[11]}, Producto=${fila[2]}, Cantidad: ${fila[3]}, Subtotal=${fila[5]}`);
  }
  
  // Agrupar por ID de venta
  const ventas = {};
  for (let i = 1; i < data.length; i++) {
    const idVenta = data[i][11];
    if (idVenta) {
      if (!ventas[idVenta]) {
        ventas[idVenta] = [];
      }
      ventas[idVenta].push(i + 1);
    }
  }
  
  console.log('Ventas encontradas:');
  Object.keys(ventas).forEach(idVenta => {
    console.log(`ID ${idVenta}: ${ventas[idVenta].length} productos en filas ${ventas[idVenta]}`);
  });
  
  console.log('=== FIN VERIFICACIÓN ===');
}

/**
 * Función para arreglar filas sin ID de venta
 */
function arreglarFilasSinId() {
  console.log('=== ARREGLANDO FILAS SIN ID ===');
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ventas');
  if (!sheet) {
    console.log('ERROR: No se encontró la hoja Ventas');
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  console.log('Total de filas:', data.length);
  
  if (data.length <= 1) {
    console.log('ERROR: Solo hay encabezados');
    return;
  }
  
  // Buscar filas sin ID
  const filasSinId = [];
  for (let i = 1; i < data.length; i++) {
    if (!data[i][11]) { // Columna L (índice 11) está vacía
      filasSinId.push(i + 1);
    }
  }
  
  console.log('Filas sin ID encontradas:', filasSinId);
  
  if (filasSinId.length === 0) {
    console.log('No hay filas sin ID');
    return;
  }
  
  // Para cada fila sin ID, verificar si es parte de una venta existente
  filasSinId.forEach(fila => {
    const filaData = data[fila - 1];
    const fecha = filaData[0];
    const hora = filaData[1];
    
    // Buscar si hay una fila anterior con la misma fecha y hora que tenga ID
    let idExistente = null;
    for (let j = fila - 2; j >= 1; j--) {
      if (data[j][11]) { // Si tiene ID
        const filaAnterior = data[j];
        // Verificar si tienen la misma fecha y hora (misma venta)
        if (filaAnterior[0] && filaAnterior[1] && 
            filaAnterior[0].getTime() === fecha.getTime() && 
            filaAnterior[1].getTime() === hora.getTime()) {
          idExistente = data[j][11];
          break;
        }
      }
    }
    
    if (idExistente) {
      // Asignar el mismo ID (misma venta)
      sheet.getRange(fila, 12).setValue(idExistente);
      console.log(`Fila ${fila}: Asignado ID existente ${idExistente} (misma venta)`);
    } else {
      // Generar nuevo ID (nueva venta)
      const nuevoId = generarIdVenta();
      sheet.getRange(fila, 12).setValue(nuevoId);
      console.log(`Fila ${fila}: Generado nuevo UUID ${nuevoId} (nueva venta)`);
    }
  });
  
  SpreadsheetApp.flush();
  console.log('=== FILAS ARREGLADAS ===');
}

/**
 * Función para formatear todas las ventas existentes
 */
function formatearTodasLasVentas() {
  console.log('=== FORMATEANDO TODAS LAS VENTAS ===');
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ventas');
  if (!sheet) {
    console.log('ERROR: No se encontró la hoja Ventas');
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  console.log('Total de filas:', data.length);
  
  if (data.length <= 1) {
    console.log('ERROR: Solo hay encabezados');
    return;
  }
  
  // Agrupar por ID de venta
  const ventas = {};
  for (let i = 1; i < data.length; i++) {
    const idVenta = data[i][11];
    if (idVenta) {
      if (!ventas[idVenta]) {
        ventas[idVenta] = [];
      }
      ventas[idVenta].push(i + 1);
    }
  }
  
  console.log('Ventas encontradas:', Object.keys(ventas).length);
  
  // Formatear cada venta
  Object.keys(ventas).forEach(idVenta => {
    const filas = ventas[idVenta];
    console.log(`Formateando venta ${idVenta} con ${filas.length} productos`);
    
    // Aplicar formato básico
    filas.forEach(fila => {
      const range = sheet.getRange(fila, 1, 1, 12);
      range.setFontWeight('bold');
      range.setHorizontalAlignment('center');
      range.setVerticalAlignment('middle');
      range.setBorder(true, true, true, true, true, true);
      range.setBackground('#f0f9ff');
    });
    
    // Aplicar formato a subtotales
    filas.forEach(fila => {
      const subtotalCell = sheet.getRange(fila, 6);
      subtotalCell.setBackground('#fef3c7');
      subtotalCell.setFontWeight('bold');
    });
    
    // Si hay múltiples productos, hacer merges
    if (filas.length > 1) {
      const primeraFila = filas[0];
      const ultimaFila = filas[filas.length - 1];
      
      console.log(`Aplicando merges para ${filas.length} productos`);
      
      const columnasParaMerge = [1, 2, 7, 8, 9, 10, 11];
      columnasParaMerge.forEach(columna => {
        try {
          sheet.getRange(primeraFila, columna, filas.length, 1).merge();
          console.log(`Merge columna ${columna} completado`);
        } catch (e) {
          console.log(`Error en merge columna ${columna}:`, e);
        }
      });
      
      // Formato final
      const pagosRange = sheet.getRange(ultimaFila, 8, 1, 4);
      pagosRange.setBackground('#dcfce7');
      pagosRange.setFontWeight('bold');
      
      const totalCell = sheet.getRange(ultimaFila, 7);
      totalCell.setBackground('#059669');
      totalCell.setFontColor('#ffffff');
      totalCell.setFontWeight('bold');
      totalCell.setFontSize(12);
      
      // Asegurar que el formato se aplique correctamente
      SpreadsheetApp.flush();
      Utilities.sleep(200);
    } else {
      // Un solo producto
      const fila = filas[0];
      const pagosRange = sheet.getRange(fila, 8, 1, 4);
      pagosRange.setBackground('#dcfce7');
      pagosRange.setFontWeight('bold');
      
      const totalCell = sheet.getRange(fila, 7);
      totalCell.setBackground('#059669');
      totalCell.setFontColor('#ffffff');
      totalCell.setFontWeight('bold');
      totalCell.setFontSize(12);
    }
  });
  
  SpreadsheetApp.flush();
  console.log('=== TODAS LAS VENTAS FORMATEADAS ===');
}

/**
 * Función para forzar el formato verde en ventas de múltiples productos
 */
function forzarFormatoVerde() {
  console.log('=== FORZANDO FORMATO VERDE ===');
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ventas');
  if (!sheet) {
    console.log('ERROR: No se encontró la hoja Ventas');
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  console.log('Total de filas:', data.length);
  
  if (data.length <= 1) {
    console.log('ERROR: Solo hay encabezados');
    return;
  }
  
  // Agrupar por ID de venta
  const ventas = {};
  for (let i = 1; i < data.length; i++) {
    const idVenta = data[i][11];
    if (idVenta) {
      if (!ventas[idVenta]) {
        ventas[idVenta] = [];
      }
      ventas[idVenta].push(i + 1);
    }
  }
  
  // Aplicar formato verde solo a ventas con múltiples productos
  Object.keys(ventas).forEach(idVenta => {
    const filas = ventas[idVenta];
    
    if (filas.length > 1) {
      console.log(`Aplicando formato verde a venta ${idVenta} con ${filas.length} productos`);
      
      const ultimaFila = filas[filas.length - 1];
      
      // Formato especial para pagos (columnas H, I, J, K)
      const pagosRange = sheet.getRange(ultimaFila, 8, 1, 4);
      pagosRange.setBackground('#dcfce7'); // Verde claro
      pagosRange.setFontWeight('bold');
      console.log(`Formato de pagos aplicado a fila ${ultimaFila}`);
      
      // Formato especial para el total (columna G)
      const totalCell = sheet.getRange(ultimaFila, 7);
      totalCell.setBackground('#059669'); // Verde oscuro
      totalCell.setFontColor('#ffffff'); // Texto blanco
      totalCell.setFontWeight('bold');
      totalCell.setFontSize(12);
      console.log(`Formato de total aplicado a fila ${ultimaFila}`);
    }
  });
  
  SpreadsheetApp.flush();
  console.log('=== FORMATO VERDE APLICADO ===');
}

/**
 * Función para copiar el ID de la última venta
 * Útil para copiar y pegar en filas adicionales de la misma venta
 */
function copiarIdUltimaVenta() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ventas');
  if (!sheet) {
    console.log('ERROR: No se encontró la hoja Ventas');
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    console.log('ERROR: Solo hay encabezados');
    return;
  }
  
  const ultimaFila = data.length;
  const ultimaFilaData = data[ultimaFila - 1];
  const idVenta = ultimaFilaData[11];
  
  if (!idVenta) {
    console.log('ERROR: No hay ID de venta en la última fila');
    return;
  }
  
  console.log('=== ID DE VENTA PARA COPIAR ===');
  console.log('ID:', idVenta);
  console.log('Copia este ID y pégalo en la columna L de las filas adicionales de la misma venta');
  console.log('=== FIN ===');
  
  // Intentar copiar al portapapeles (puede no funcionar en Apps Script)
  try {
    const ui = SpreadsheetApp.getUi();
    ui.alert('ID de Venta Copiado', 
             `ID: ${idVenta}\n\nCopia este ID y pégalo en la columna L de las filas adicionales de la misma venta.`, 
             ui.ButtonSet.OK);
  } catch (e) {
    console.log('No se pudo mostrar el diálogo, pero el ID está en los logs');
  }
}

/**
 * Función para mostrar instrucciones de uso
 */
function mostrarInstrucciones() {
  console.log('=== INSTRUCCIONES DE USO ===');
  console.log('1. Agrega la primera fila de tu venta');
  console.log('2. El sistema generará automáticamente un UUID en la columna L');
  console.log('3. Ejecuta copiarIdUltimaVenta() para obtener el ID');
  console.log('4. Copia ese ID y pégalo en la columna L de las filas adicionales');
  console.log('5. El sistema formateará automáticamente la venta completa');
  console.log('6. Para ventas de múltiples productos, se aplicarán merges automáticamente');
  console.log('=== FIN INSTRUCCIONES ===');
}

/**
 * Función para arreglar IDs de ventas múltiples
 * Asigna el mismo ID a filas con la misma fecha y hora
 */
function arreglarIdsVentasMultiples() {
  console.log('=== ARREGLANDO IDS DE VENTAS MÚLTIPLES ===');
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ventas');
  if (!sheet) {
    console.log('ERROR: No se encontró la hoja Ventas');
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  console.log('Total de filas:', data.length);
  
  if (data.length <= 1) {
    console.log('ERROR: Solo hay encabezados');
    return;
  }
  
  // Agrupar filas por fecha y hora
  const grupos = {};
  for (let i = 1; i < data.length; i++) {
    const fila = data[i];
    const fecha = fila[0];
    const hora = fila[1];
    
    if (fecha && hora) {
      const clave = `${fecha.getTime()}_${hora.getTime()}`;
      if (!grupos[clave]) {
        grupos[clave] = [];
      }
      grupos[clave].push({
        fila: i + 1,
        datos: fila,
        id: fila[11]
      });
    }
  }
  
  console.log('Grupos encontrados:', Object.keys(grupos).length);
  
  // Para cada grupo, asignar el mismo ID
  Object.keys(grupos).forEach(clave => {
    const grupo = grupos[clave];
    console.log(`Grupo ${clave}: ${grupo.length} productos`);
    
    // Encontrar el ID más común en el grupo o generar uno nuevo
    let idComun = null;
    const ids = grupo.map(item => item.id).filter(id => id);
    
    if (ids.length > 0) {
      // Usar el primer ID no vacío
      idComun = ids[0];
    } else {
      // Generar nuevo ID
      idComun = generarIdVenta();
    }
    
    console.log(`ID asignado al grupo: ${idComun}`);
    
    // Asignar el ID a todas las filas del grupo
    grupo.forEach(item => {
      if (item.id !== idComun) {
        sheet.getRange(item.fila, 12).setValue(idComun);
        console.log(`Fila ${item.fila}: Asignado ID ${idComun}`);
      }
    });
  });
  
  SpreadsheetApp.flush();
  console.log('=== IDS ARREGLADOS ===');
}

/**
 * Función para verificar y corregir IDs automáticamente
 */
function verificarYCorregirIds() {
  console.log('=== VERIFICANDO Y CORRIGIENDO IDS ===');
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ventas');
  if (!sheet) {
    console.log('ERROR: No se encontró la hoja Ventas');
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  console.log('Total de filas:', data.length);
  
  if (data.length <= 1) {
    console.log('ERROR: Solo hay encabezados');
    return;
  }
  
  // Verificar si hay inconsistencias
  const ventas = {};
  let hayInconsistencias = false;
  
  for (let i = 1; i < data.length; i++) {
    const fila = data[i];
    const fecha = fila[0];
    const hora = fila[1];
    const id = fila[11];
    
    if (fecha && hora) {
      const clave = `${fecha.getTime()}_${hora.getTime()}`;
      
      if (!ventas[clave]) {
        ventas[clave] = {
          ids: new Set(),
          filas: []
        };
      }
      
      ventas[clave].ids.add(id);
      ventas[clave].filas.push(i + 1);
      
      if (ventas[clave].ids.size > 1) {
        hayInconsistencias = true;
        console.log(`Inconsistencia encontrada en venta ${clave}: múltiples IDs`);
      }
    }
  }
  
  if (hayInconsistencias) {
    console.log('Se encontraron inconsistencias. Aplicando corrección...');
    arreglarIdsVentasMultiples();
  } else {
    console.log('No se encontraron inconsistencias en los IDs');
  }
  
  console.log('=== VERIFICACIÓN COMPLETADA ===');
}

/**
 * Función simple para aplicar merges a la última venta
 */
function aplicarMergesUltimaVenta() {
  console.log('=== APLICANDO MERGES A LA ÚLTIMA VENTA ===');
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ventas');
  if (!sheet) {
    console.log('ERROR: No se encontró la hoja Ventas');
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    console.log('ERROR: Solo hay encabezados');
    return;
  }
  
  // Obtener la última fila
  const ultimaFila = data.length;
  const ultimaFilaData = data[ultimaFila - 1];
  const idVenta = ultimaFilaData[11];
  
  if (!idVenta) {
    console.log('ERROR: No hay ID de venta en la última fila');
    return;
  }
  
  // Encontrar todas las filas con el mismo ID
  const filasConMismoId = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][11] === idVenta) {
      filasConMismoId.push(i + 1);
    }
  }
  
  console.log(`Encontradas ${filasConMismoId.length} filas con ID ${idVenta}`);
  console.log('Filas:', filasConMismoId);
  
  if (filasConMismoId.length <= 1) {
    console.log('No hay múltiples productos para hacer merge');
    return;
  }
  
  const primeraFila = filasConMismoId[0];
  const ultimaFilaGrupo = filasConMismoId[filasConMismoId.length - 1];
  
  console.log('Aplicando merges...');
  
  // Aplicar merges
  const columnasParaMerge = [1, 2, 7, 8, 9, 10, 11, 12, 13]; // A, B, G, H, I, J, K, L (ID), M (Vendedor)
  
  columnasParaMerge.forEach(columna => {
    try {
      sheet.getRange(primeraFila, columna, filasConMismoId.length, 1).merge();
      console.log(`Merge columna ${columna} completado`);
      SpreadsheetApp.flush();
    } catch (e) {
      console.log(`Error en merge columna ${columna}:`, e);
    }
  });
  
  // Aplicar formato final DESPUÉS de los merges
  Utilities.sleep(500); // Esperar a que los merges se completen
  
  // Formato para pagos (columnas H, I, J, K) - en la celda combinada
  const pagosRange = sheet.getRange(primeraFila, 8, 1, 4);
  pagosRange.setBackground('#dcfce7'); // Verde claro
  pagosRange.setFontWeight('bold');
  console.log('Formato de pagos aplicado a celda combinada');
  
  // Formato para total (columna G) - en la celda combinada
  const totalCell = sheet.getRange(primeraFila, 7);
  totalCell.setBackground('#059669'); // Verde oscuro
  totalCell.setFontColor('#ffffff'); // Texto blanco
  totalCell.setFontWeight('bold');
  totalCell.setFontSize(12);
  console.log('Formato de total aplicado a celda combinada');
  
  console.log('=== MERGES APLICADOS ===');
}

/**
 * Función para arreglar venta de múltiples productos
 * Asigna el mismo ID a filas consecutivas con la misma fecha y hora
 */
function arreglarVentaMultiplesProductos() {
  console.log('=== ARREGLANDO VENTA DE MÚLTIPLES PRODUCTOS ===');
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ventas');
  if (!sheet) {
    console.log('ERROR: No se encontró la hoja Ventas');
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    console.log('ERROR: Solo hay encabezados');
    return;
  }
  
  // Buscar la última fila con ID
  let ultimaFilaConId = null;
  let idVenta = null;
  
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][11]) { // Si tiene ID
      ultimaFilaConId = i + 1;
      idVenta = data[i][11];
      break;
    }
  }
  
  if (!idVenta) {
    console.log('ERROR: No se encontró ninguna fila con ID');
    return;
  }
  
  console.log(`Última fila con ID: ${ultimaFilaConId}, ID: ${idVenta}`);
  
  // Buscar filas consecutivas con la misma fecha y hora
  const ultimaFilaData = data[ultimaFilaConId - 1];
  const fecha = ultimaFilaData[0];
  const hora = ultimaFilaData[1];
  
  console.log(`Fecha: ${fecha}, Hora: ${hora}`);
  
  // Encontrar todas las filas con la misma fecha y hora
  const filasDelGrupo = [];
  for (let i = 1; i < data.length; i++) {
    const filaData = data[i];
    if (filaData[0] && filaData[1] && 
        filaData[0].getTime() === fecha.getTime() && 
        filaData[1].getTime() === hora.getTime()) {
      filasDelGrupo.push(i + 1);
    }
  }
  
  console.log(`Filas encontradas con misma fecha/hora: ${filasDelGrupo}`);
  
  if (filasDelGrupo.length <= 1) {
    console.log('No hay múltiples productos para esta venta');
    return;
  }
  
  // Asignar el mismo ID a todas las filas del grupo
  filasDelGrupo.forEach(fila => {
    if (data[fila - 1][11] !== idVenta) {
      sheet.getRange(fila, 12).setValue(idVenta);
      console.log(`Asignado ID ${idVenta} a fila ${fila}`);
    }
  });
  
  SpreadsheetApp.flush();
  
  // Aplicar formato básico a todas las filas del grupo
  filasDelGrupo.forEach(fila => {
    const range = sheet.getRange(fila, 1, 1, 12);
    range.setFontWeight('bold');
    range.setHorizontalAlignment('center');
    range.setVerticalAlignment('middle');
    range.setBorder(true, true, true, true, true, true);
    range.setBackground('#f0f9ff');
    
    // Formato de subtotal
    const subtotalCell = sheet.getRange(fila, 6);
    subtotalCell.setBackground('#fef3c7');
    subtotalCell.setFontWeight('bold');
  });
  
  // Aplicar merges
  const primeraFila = filasDelGrupo[0];
  const ultimaFila = filasDelGrupo[filasDelGrupo.length - 1];
  
  console.log('Aplicando merges...');
  const columnasParaMerge = [1, 2, 7, 8, 9, 10, 11]; // A, B, G, H, I, J, K
  
  columnasParaMerge.forEach(columna => {
    try {
      sheet.getRange(primeraFila, columna, filasDelGrupo.length, 1).merge();
      console.log(`Merge columna ${columna} completado`);
      SpreadsheetApp.flush();
    } catch (e) {
      console.log(`Error en merge columna ${columna}:`, e);
    }
  });
  
  // Formato final DESPUÉS de los merges
  Utilities.sleep(500); // Esperar a que los merges se completen
  
  // Formato para pagos (columnas H, I, J, K) - en la celda combinada
  const pagosRange = sheet.getRange(primeraFila, 8, 1, 4);
  pagosRange.setBackground('#dcfce7'); // Verde claro
  pagosRange.setFontWeight('bold');
  console.log('Formato de pagos aplicado a celda combinada');
  
  // Formato para total (columna G) - en la celda combinada
  const totalCell = sheet.getRange(primeraFila, 7);
  totalCell.setBackground('#059669'); // Verde oscuro
  totalCell.setFontColor('#ffffff'); // Texto blanco
  totalCell.setFontWeight('bold');
  totalCell.setFontSize(12);
  console.log('Formato de total aplicado a celda combinada');
  
  console.log('=== VENTA DE MÚLTIPLES PRODUCTOS ARREGLADA ===');
}

/**
 * Función principal que procesa ventas automáticamente
 */
function procesarVentasAutomaticamente() {
  console.log('=== PROCESANDO VENTAS AUTOMÁTICAMENTE ===');
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ventas');
  if (!sheet) {
    console.log('ERROR: No se encontró la hoja Ventas');
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    console.log('ERROR: Solo hay encabezados');
    return;
  }
  
  // Agrupar filas por fecha y hora
  const grupos = {};
  for (let i = 1; i < data.length; i++) {
    const fila = data[i];
    const fecha = fila[0];
    const hora = fila[1];
    
    if (fecha && hora) {
      const clave = `${fecha.getTime()}_${hora.getTime()}`;
      if (!grupos[clave]) {
        grupos[clave] = [];
      }
      grupos[clave].push({
        fila: i + 1,
        datos: fila,
        id: fila[11]
      });
    }
  }
  
  console.log(`Encontrados ${Object.keys(grupos).length} grupos de ventas`);
  
  // Procesar cada grupo
  Object.keys(grupos).forEach(clave => {
    const grupo = grupos[clave];
    console.log(`Procesando grupo con ${grupo.length} productos`);
    
    // Verificar si ya tiene ID
    const idsExistentes = grupo.map(item => item.id).filter(id => id);
    
    if (idsExistentes.length === 0) {
      // No hay IDs, generar uno nuevo
      const nuevoId = generarIdVenta();
      console.log(`Generando nuevo ID: ${nuevoId}`);
      
      grupo.forEach(item => {
        sheet.getRange(item.fila, 12).setValue(nuevoId);
        console.log(`Asignado ID ${nuevoId} a fila ${item.fila}`);
      });
      
      // Aplicar formato básico
      grupo.forEach(item => {
        const range = sheet.getRange(item.fila, 1, 1, 12);
        range.setFontWeight('bold');
        range.setHorizontalAlignment('center');
        range.setVerticalAlignment('middle');
        range.setBorder(true, true, true, true, true, true);
        range.setBackground('#f0f9ff');
        
        const subtotalCell = sheet.getRange(item.fila, 6);
        subtotalCell.setBackground('#fef3c7');
        subtotalCell.setFontWeight('bold');
      });
      
    } else if (idsExistentes.length < grupo.length) {
      // Algunas filas tienen ID, otras no
      const idComun = idsExistentes[0];
      console.log(`Usando ID existente: ${idComun}`);
      
      grupo.forEach(item => {
        if (!item.id) {
          sheet.getRange(item.fila, 12).setValue(idComun);
          console.log(`Asignado ID ${idComun} a fila ${item.fila}`);
        }
      });
    }
    
    // Si hay múltiples productos, aplicar merges
    if (grupo.length > 1) {
      console.log(`Aplicando merges para ${grupo.length} productos`);
      
      const primeraFila = grupo[0].fila;
      const ultimaFila = grupo[grupo.length - 1].fila;
      
      // Aplicar merges
      const columnasParaMerge = [1, 2, 7, 8, 9, 10, 11, 12, 13]; // A, B, G, H, I, J, K, L (ID), M (Vendedor)
      
      columnasParaMerge.forEach(columna => {
        try {
          sheet.getRange(primeraFila, columna, grupo.length, 1).merge();
          console.log(`Merge columna ${columna} completado`);
          SpreadsheetApp.flush();
        } catch (e) {
          console.log(`Error en merge columna ${columna}:`, e);
        }
      });
      
      // Formato final en la última fila DESPUÉS de los merges
      Utilities.sleep(500); // Esperar a que los merges se completen
      
      // Formato para pagos (columnas H, I, J, K) - en la celda combinada
      const pagosRange = sheet.getRange(primeraFila, 8, 1, 4);
      pagosRange.setBackground('#dcfce7'); // Verde claro
      pagosRange.setFontWeight('bold');
      console.log('Formato de pagos aplicado a celda combinada');
      
      // Formato para total (columna G) - en la celda combinada
      const totalCell = sheet.getRange(primeraFila, 7);
      totalCell.setBackground('#059669'); // Verde oscuro
      totalCell.setFontColor('#ffffff'); // Texto blanco
      totalCell.setFontWeight('bold');
      totalCell.setFontSize(12);
      console.log('Formato de total aplicado a celda combinada');
      
    } else {
      // Un solo producto
      const fila = grupo[0].fila;
      const pagosRange = sheet.getRange(fila, 8, 1, 4);
      pagosRange.setBackground('#dcfce7');
      pagosRange.setFontWeight('bold');
      
      const totalCell = sheet.getRange(fila, 7);
      totalCell.setBackground('#059669');
      totalCell.setFontColor('#ffffff');
      totalCell.setFontWeight('bold');
      totalCell.setFontSize(12);
    }
  });
  
  SpreadsheetApp.flush();
  
  // Registrar en caja
  // actualizarCaja(ultimaVenta.total, ultimaVenta.efectivo, ultimaVenta.transferencia, ultimaVenta.pos); // COMENTADO: Solo debe registrar al cerrar caja
  
  console.log('=== PROCESAMIENTO AUTOMÁTICO COMPLETADO ===');
}

/**
 * Función para registrar la última venta en la caja
 */
function registrarVentaEnCaja() {
  console.log('=== REGISTRANDO VENTA EN CAJA ===');
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ventas');
  if (!sheet) {
    console.log('ERROR: No se encontró la hoja Ventas');
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    console.log('No hay ventas para registrar');
    return;
  }
  
  // Buscar la última venta procesada (con ID)
  let ultimaVenta = null;
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][11]) { // Si tiene ID
      const idVenta = data[i][11];
      
      // Agrupar todos los productos de esta venta
      let total = 0;
      let efectivo = 0;
      let transferencia = 0;
      let pos = 0;
      let fecha = data[i][0];
      let hora = data[i][1];
      
      for (let j = 1; j < data.length; j++) {
        if (data[j][11] === idVenta) {
          total += data[j][6] || 0;
          efectivo += data[j][7] || 0;
          transferencia += data[j][8] || 0;
          pos += data[j][9] || 0;
        }
      }
      
      ultimaVenta = {
        id: idVenta,
        fecha: fecha,
        hora: hora,
        total: total,
        efectivo: efectivo,
        transferencia: transferencia,
        pos: pos
      };
      break;
    }
  }
  
  if (ultimaVenta) {
    console.log(`Registrando venta ${ultimaVenta.id}:`);
    console.log(`Total: $${ultimaVenta.total}`);
    console.log(`Efectivo: $${ultimaVenta.efectivo}`);
    console.log(`Transferencia: $${ultimaVenta.transferencia}`);
    console.log(`POS: $${ultimaVenta.pos}`);
    
    // Actualizar caja
    // actualizarCaja(-totalVenta, -efectivoVenta, -transferenciaVenta, -posVenta); // COMENTADO: Solo debe registrar al cerrar caja
  } else {
    console.log('No se encontró una venta válida para registrar');
  }
}

/**
 * Función para obtener listado de ventas para la caja
 */
function obtenerListadoVentas() {
  console.log('=== OBTENIENDO LISTADO DE VENTAS ===');
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ventas');
  if (!sheet) {
    console.log('ERROR: No se encontró la hoja Ventas');
    return [];
  }
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    console.log('No hay ventas registradas');
    return [];
  }
  
  // Agrupar ventas por ID
  const ventas = {};
  for (let i = 1; i < data.length; i++) {
    const fila = data[i];
    const idVenta = fila[11]; // Columna L
    
    if (idVenta) {
      if (!ventas[idVenta]) {
        ventas[idVenta] = {
          id: idVenta,
          fecha: fila[0],
          hora: fila[1],
          productos: [],
          total: 0,
          efectivo: 0,
          transferencia: 0,
          pos: 0,
          filas: []
        };
      }
      
      // Agregar producto
      ventas[idVenta].productos.push({
        nombre: fila[2],
        cantidad: fila[3],
        precio: fila[4],
        subtotal: fila[5]
      });
      
      // Sumar totales
      ventas[idVenta].total += fila[6] || 0;
      ventas[idVenta].efectivo += fila[7] || 0;
      ventas[idVenta].transferencia += fila[8] || 0;
      ventas[idVenta].pos += fila[9] || 0;
      ventas[idVenta].filas.push(i + 1);
    }
  }
  
  const listado = Object.values(ventas);
  console.log(`Encontradas ${listado.length} ventas`);
  
  // Mostrar listado en consola
  listado.forEach((venta, index) => {
    console.log(`\nVenta ${index + 1}:`);
    console.log(`ID: ${venta.id}`);
    console.log(`Fecha: ${venta.fecha}`);
    console.log(`Hora: ${venta.hora}`);
    console.log(`Productos: ${venta.productos.length}`);
    console.log(`Total: $${venta.total}`);
    console.log(`Efectivo: $${venta.efectivo}`);
    console.log(`Transferencia: $${venta.transferencia}`);
    console.log(`POS: $${venta.pos}`);
    console.log(`Filas: ${venta.filas.join(', ')}`);
  });
  
  return listado;
}

/**
 * Función para eliminar una venta específica
 */
function eliminarVenta(idVenta) {
  console.log(`=== ELIMINANDO VENTA ${idVenta} ===`);
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ventas');
  if (!sheet) {
    console.log('ERROR: No se encontró la hoja Ventas');
    return false;
  }
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    console.log('No hay ventas para eliminar');
    return false;
  }
  
  // Encontrar filas con el ID de venta
  const filasAEliminar = [];
  let totalVenta = 0;
  let efectivoVenta = 0;
  let transferenciaVenta = 0;
  let posVenta = 0;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][11] === idVenta) {
      filasAEliminar.push(i + 1);
      totalVenta += data[i][6] || 0;
      efectivoVenta += data[i][7] || 0;
      transferenciaVenta += data[i][8] || 0;
      posVenta += data[i][9] || 0;
    }
  }
  
  if (filasAEliminar.length === 0) {
    console.log(`No se encontró la venta con ID ${idVenta}`);
    return false;
  }
  
  console.log(`Eliminando ${filasAEliminar.length} filas: ${filasAEliminar.join(', ')}`);
  console.log(`Total de la venta: $${totalVenta}`);
  console.log(`Efectivo: $${efectivoVenta}`);
  console.log(`Transferencia: $${transferenciaVenta}`);
  console.log(`POS: $${posVenta}`);
  
  // Eliminar filas de abajo hacia arriba para evitar problemas con índices
  filasAEliminar.reverse().forEach(fila => {
    sheet.deleteRow(fila);
  });
  
  // Actualizar caja
  // actualizarCaja(-totalVenta, -efectivoVenta, -transferenciaVenta, -posVenta); // COMENTADO: Solo debe registrar al cerrar caja
  
  console.log('=== VENTA ELIMINADA EXITOSAMENTE ===');
  return true;
}

/**
 * Función para actualizar la caja
 */
function actualizarCaja(total, efectivo, transferencia, pos) {
  console.log('=== ACTUALIZANDO CAJA ===');
  
  // Buscar hoja de caja o crear una nueva
  let sheetCaja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Caja');
  if (!sheetCaja) {
    sheetCaja = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Caja');
    console.log('Hoja Caja creada');
    
    // Crear encabezados
    sheetCaja.getRange(1, 1, 1, 5).setValues([['Fecha', 'Hora', 'Total', 'Efectivo', 'Transferencia', 'POS', 'Operación']]);
    sheetCaja.getRange(1, 1, 1, 7).setFontWeight('bold');
    sheetCaja.getRange(1, 1, 1, 7).setBackground('#f8fafc');
  }
  
  const ahora = new Date();
  const operacion = total > 0 ? 'Venta' : 'Eliminación';
  
  // Agregar registro
  const ultimaFila = sheetCaja.getLastRow() + 1;
  sheetCaja.getRange(ultimaFila, 1, 1, 7).setValues([
    [ahora, ahora, total, efectivo, transferencia, pos, operacion]
  ]);
  
  // Calcular totales
  calcularTotalesCaja();
  
  console.log(`Caja actualizada: Total=${total}, Efectivo=${efectivo}, Transferencia=${transferencia}, POS=${pos}`);
}

/**
 * Función para calcular totales de la caja
 */
function calcularTotalesCaja() {
  console.log('=== CALCULANDO TOTALES DE CAJA ===');
  
  const sheetCaja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Caja');
  if (!sheetCaja) {
    console.log('No existe hoja Caja');
    return;
  }
  
  const data = sheetCaja.getDataRange().getValues();
  if (data.length <= 1) {
    console.log('No hay movimientos en caja');
    return;
  }
  
  let totalGeneral = 0;
  let totalEfectivo = 0;
  let totalTransferencia = 0;
  let totalPos = 0;
  
  // Sumar todos los movimientos
  for (let i = 1; i < data.length; i++) {
    totalGeneral += data[i][2] || 0;
    totalEfectivo += data[i][3] || 0;
    totalTransferencia += data[i][4] || 0;
    totalPos += data[i][5] || 0;
  }
  
  // Buscar o crear sección de totales
  let filaTotales = data.length + 2;
  
  // Agregar línea separadora
  sheetCaja.getRange(filaTotales - 1, 1, 1, 7).setBackground('#e5e7eb');
  
  // Agregar totales
  sheetCaja.getRange(filaTotales, 1, 1, 7).setValues([
    ['TOTALES', '', totalGeneral, totalEfectivo, totalTransferencia, totalPos, '']
  ]);
  
  // Formatear totales
  const rangeTotales = sheetCaja.getRange(filaTotales, 1, 1, 7);
  rangeTotales.setFontWeight('bold');
  rangeTotales.setBackground('#059669');
  rangeTotales.setFontColor('#ffffff');
  
  console.log(`Totales calculados: Total=${totalGeneral}, Efectivo=${totalEfectivo}, Transferencia=${totalTransferencia}, POS=${totalPos}`);
}

/**
 * Función para mostrar resumen de caja actual
 */
function mostrarResumenCaja() {
  console.log('=== RESUMEN DE CAJA ===');
  
  const sheetCaja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Caja');
  if (!sheetCaja) {
    console.log('No existe hoja Caja. Ejecuta alguna venta primero.');
    return;
  }
  
  const data = sheetCaja.getDataRange().getValues();
  if (data.length <= 1) {
    console.log('No hay movimientos en caja');
    return;
  }
  
  let totalGeneral = 0;
  let totalEfectivo = 0;
  let totalTransferencia = 0;
  let totalPos = 0;
  let ventas = 0;
  let eliminaciones = 0;
  
  // Calcular totales
  for (let i = 1; i < data.length; i++) {
    const fila = data[i];
    const total = fila[2] || 0;
    const operacion = fila[6];
    
    totalGeneral += total;
    totalEfectivo += fila[3] || 0;
    totalTransferencia += fila[4] || 0;
    totalPos += fila[5] || 0;
    
    if (operacion === 'Venta') {
      ventas++;
    } else if (operacion === 'Eliminación') {
      eliminaciones++;
    }
  }
  
  console.log(`📊 RESUMEN DE CAJA:`);
  console.log(`💰 Total General: $${totalGeneral.toFixed(2)}`);
  console.log(`💵 Efectivo: $${totalEfectivo.toFixed(2)}`);
  console.log(`🏦 Transferencia: $${totalTransferencia.toFixed(2)}`);
  console.log(`💳 POS: $${totalPos.toFixed(2)}`);
  console.log(`📈 Ventas registradas: ${ventas}`);
  console.log(`🗑️ Eliminaciones: ${eliminaciones}`);
  console.log(`📋 Total movimientos: ${data.length - 1}`);
  
  // Mostrar últimas 5 operaciones
  console.log(`\n🕒 ÚLTIMAS 5 OPERACIONES:`);
  const ultimasOperaciones = data.slice(-5);
  ultimasOperaciones.forEach((fila, index) => {
    if (index === 0) return; // Saltar encabezados
    const fecha = fila[0];
    const total = fila[2];
    const operacion = fila[6];
    console.log(`${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()} - ${operacion}: $${total.toFixed(2)}`);
  });
  
  console.log('=== FIN RESUMEN ===');
}

/**
 * Función para eliminar venta de forma interactiva
 */
function eliminarVentaInteractiva() {
  console.log('=== ELIMINACIÓN INTERACTIVA DE VENTA ===');
  
  const ventas = obtenerListadoVentas();
  if (ventas.length === 0) {
    console.log('No hay ventas para eliminar');
    return;
  }
  
  console.log('\n📋 VENTAS DISPONIBLES PARA ELIMINAR:');
  ventas.forEach((venta, index) => {
    console.log(`${index + 1}. ID: ${venta.id}`);
    console.log(`   Fecha: ${venta.fecha} ${venta.hora}`);
    console.log(`   Productos: ${venta.productos.length}`);
    console.log(`   Total: $${venta.total.toFixed(2)}`);
    console.log(`   Efectivo: $${venta.efectivo.toFixed(2)} | Transferencia: $${venta.transferencia.toFixed(2)} | POS: $${venta.pos.toFixed(2)}`);
    console.log('');
  });
  
  console.log('💡 Para eliminar una venta, usa: eliminarVenta("ID_DE_LA_VENTA")');
  console.log('   Ejemplo: eliminarVenta("abc123-def456")');
  console.log('=== FIN LISTADO ===');
}

/**
 * Función para mostrar menú de gestión de caja
 */
function mostrarMenuCaja() {
  console.log('=== MENÚ DE GESTIÓN DE CAJA ===');
  console.log('1. obtenerListadoVentas() - Ver todas las ventas');
  console.log('2. eliminarVentaInteractiva() - Ver ventas para eliminar');
  console.log('3. eliminarVenta("ID_VENTA") - Eliminar venta específica');
  console.log('4. mostrarResumenCaja() - Ver resumen de caja');
  console.log('5. calcularTotalesCaja() - Recalcular totales');
  console.log('6. registrarVentaEnCaja() - Registrar última venta manualmente');
  console.log('7. arreglarVentasSinId() - Arreglar ventas con filas sin ID');
  console.log('8. mostrarMenuCaja() - Mostrar este menú');
  console.log('=== FIN MENÚ ===');
}

/**
 * Función para arreglar ventas existentes que tienen filas sin ID
 */
function arreglarVentasSinId() {
  console.log('=== ARREGLANDO VENTAS SIN ID ===');
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ventas');
  if (!sheet) {
    console.log('ERROR: No se encontró la hoja Ventas');
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    console.log('No hay datos para procesar');
    return;
  }
  
  // Buscar filas con ID undefined y asignar el ID de la fila anterior
  let ventasArregladas = 0;
  
  for (let i = 2; i < data.length; i++) {
    const idActual = data[i][11];
    const idAnterior = data[i-1][11];
    
    if (!idActual && idAnterior) {
      // Esta fila no tiene ID pero la anterior sí
      sheet.getRange(i + 1, 12).setValue(idAnterior);
      console.log(`Asignado ID ${idAnterior} a fila ${i + 1}`);
      ventasArregladas++;
    }
  }
  
  SpreadsheetApp.flush();
  console.log(`=== ARREGLO COMPLETADO: ${ventasArregladas} filas arregladas ===`);
}

/**
 * Función para aplicar formato automáticamente a la hoja Caja
 * Se ejecuta cuando se agrega una nueva fila
 */
function formatearHojaCaja() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Caja');
  if (!sheet) {
    console.log('No se encontró la hoja Caja');
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  console.log('Total de filas en la hoja Caja:', data.length);
  
  if (data.length <= 1) {
    console.log('Solo hay encabezados en la hoja Caja');
    return;
  }
  
  // Obtener la última fila de datos
  const ultimaFila = data.length;
  const ultimaFilaData = data[ultimaFila - 1];
  
  // Verificar que la última fila tenga datos (no esté vacía)
  if (!ultimaFilaData[0]) {
    console.log('La última fila está vacía');
    return;
  }
  
  console.log('Aplicando formato a la última fila de Caja...');
  
  // Aplicar formato: fondo verde y negrita
  const range = sheet.getRange(ultimaFila, 1, 1, 13); // A:M (13 columnas)
  range.setBackground('#dcfce7'); // Mismo verde que Ventas
  range.setFontWeight('bold');
  
  SpreadsheetApp.flush();
  console.log('Formato aplicado a la fila', ultimaFila, 'de la hoja Caja');
}

/**
 * Trigger automático para formatear la hoja Caja cuando se edita
 */
function onEditCaja(e) {
  // Verificar que la edición fue en la hoja "Caja"
  if (e.source.getActiveSheet().getName() !== 'Caja') {
    return;
  }
  
  console.log('onEdit activado - editando hoja Caja');
  
  // Esperar un poco para que los datos se escriban
  SpreadsheetApp.flush();
  Utilities.sleep(1000);
  
  // Aplicar formato a la hoja Caja
  formatearHojaCaja();
}

/**
 * Función para aplicar formato manualmente a toda la hoja Caja
 */
function formatearTodaHojaCaja() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Caja');
  if (!sheet) {
    console.log('No se encontró la hoja Caja');
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  console.log('Total de filas en la hoja Caja:', data.length);
  
  if (data.length <= 1) {
    console.log('Solo hay encabezados en la hoja Caja');
    return;
  }
  
  // Aplicar formato a todas las filas de datos (desde la fila 2)
  for (let i = 1; i < data.length; i++) {
    const fila = data[i];
    
    // Verificar que la fila tenga datos
    if (fila[0]) {
      const range = sheet.getRange(i + 1, 1, 1, 13); // A:M (13 columnas)
      range.setBackground('#dcfce7'); // Mismo verde que Ventas
      range.setFontWeight('bold');
      console.log(`Formato aplicado a fila ${i + 1}`);
    }
  }
  
  SpreadsheetApp.flush();
  console.log('Formato aplicado a toda la hoja Caja');
}

/**
 * Función para actualizar ventas existentes con el campo vendedor
 * Basado en la caja correspondiente por fecha y hora
 */
function actualizarVentasConVendedor() {
  console.log('=== ACTUALIZANDO VENTAS CON VENDEDOR ===');
  
  const ventasSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ventas');
  const cajaSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Caja');
  
  if (!ventasSheet || !cajaSheet) {
    console.log('ERROR: No se encontraron las hojas Ventas o Caja');
    return;
  }
  
  const ventasData = ventasSheet.getDataRange().getValues();
  const cajaData = cajaSheet.getDataRange().getValues();
  
  if (ventasData.length <= 1) {
    console.log('No hay ventas para actualizar');
    return;
  }
  
  if (cajaData.length <= 1) {
    console.log('No hay datos de caja para usar como referencia');
    return;
  }
  
  // Crear mapa de cajas por fecha y hora
  const cajasPorFecha = {};
  for (let i = 1; i < cajaData.length; i++) {
    const fila = cajaData[i];
    if (fila[0] && fila[1] && fila[5]) { // Fecha apertura, hora apertura, empleado
      const fechaApertura = fila[0];
      const horaApertura = fila[1];
      const empleado = fila[5];
      const fechaCierre = fila[2];
      const horaCierre = fila[3];
      
      // Crear clave única para la caja
      const clave = `${fechaApertura}_${horaApertura}`;
      cajasPorFecha[clave] = {
        empleado: empleado,
        fechaApertura: fechaApertura,
        horaApertura: horaApertura,
        fechaCierre: fechaCierre,
        horaCierre: horaCierre
      };
    }
  }
  
  console.log('Cajas encontradas:', Object.keys(cajasPorFecha).length);
  
  // Actualizar ventas con vendedor
  let ventasActualizadas = 0;
  
  for (let i = 1; i < ventasData.length; i++) {
    const fila = ventasData[i];
    const fecha = fila[0];
    const hora = fila[1];
    const vendedorActual = fila[12]; // Columna M
    
    // Si ya tiene vendedor, saltar
    if (vendedorActual) {
      continue;
    }
    
    // Buscar caja correspondiente
    let cajaEncontrada = null;
    for (const clave in cajasPorFecha) {
      const caja = cajasPorFecha[clave];
      
      // Verificar si la venta está dentro del período de la caja
      if (fecha === caja.fechaApertura && hora >= caja.horaApertura) {
        // Si la caja tiene fecha de cierre, verificar que la venta sea antes del cierre
        if (caja.fechaCierre) {
          if (fecha === caja.fechaCierre && hora <= caja.horaCierre) {
            cajaEncontrada = caja;
            break;
          } else if (fecha < caja.fechaCierre) {
            cajaEncontrada = caja;
            break;
          }
        } else {
          // Si no tiene fecha de cierre, usar esta caja
          cajaEncontrada = caja;
          break;
        }
      }
    }
    
    if (cajaEncontrada) {
      // Asignar vendedor
      ventasSheet.getRange(i + 1, 13).setValue(cajaEncontrada.empleado); // Columna M
      console.log(`Fila ${i + 1}: Asignado vendedor ${cajaEncontrada.empleado}`);
      ventasActualizadas++;
    } else {
      console.log(`Fila ${i + 1}: No se encontró caja correspondiente para ${fecha} ${hora}`);
    }
  }
  
  SpreadsheetApp.flush();
  console.log(`=== ACTUALIZACIÓN COMPLETADA: ${ventasActualizadas} ventas actualizadas ===`);
} 