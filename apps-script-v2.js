/**
 * Apps Script V2 para formatear ventas en Google Sheets
 * Versión mejorada que maneja mejor los conflictos de formato
 */

function onEdit(e) {
  // Verificar que la edición fue en la hoja "Ventas"
  if (e.source.getActiveSheet().getName() !== 'Ventas') {
    return;
  }
  
  // Ejecutar el formateo después de un pequeño delay para asegurar que los datos estén escritos
  SpreadsheetApp.flush();
  Utilities.sleep(1500);
  formatearVentasCompleto();
}

function formatearVentasCompleto() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ventas');
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return; // Solo encabezados
  
  // Limpiar TODO el formato existente para evitar conflictos
  const dataRange = sheet.getDataRange();
  dataRange.clearFormat();
  
  // Restaurar formato básico de encabezados
  const headerRange = sheet.getRange(1, 1, 1, 11);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#f8fafc');
  headerRange.setHorizontalAlignment('center');
  headerRange.setBorder(true, true, true, true, true, true);
  
  // Encontrar grupos de ventas (misma fecha y hora)
  const grupos = [];
  let grupoActual = [];
  let fechaHoraActual = null;
  
  for (let i = 1; i < data.length; i++) { // Empezar desde la fila 2 (después de encabezados)
    const row = data[i];
    const fecha = row[0];
    const hora = row[1];
    const fechaHora = fecha + '|' + hora;
    
    if (fechaHora !== fechaHoraActual) {
      if (grupoActual.length > 0) {
        grupos.push(grupoActual);
      }
      grupoActual = [i + 1]; // +1 porque las filas en Sheets empiezan en 1
      fechaHoraActual = fechaHora;
    } else {
      grupoActual.push(i + 1);
    }
  }
  
  // Agregar el último grupo
  if (grupoActual.length > 0) {
    grupos.push(grupoActual);
  }
  
  // Formatear cada grupo
  grupos.forEach(grupo => {
    formatearGrupoVentaCompleto(sheet, grupo);
  });
}

function formatearGrupoVentaCompleto(sheet, filas) {
  const primeraFila = filas[0];
  const ultimaFila = filas[filas.length - 1];
  
  // Aplicar formato básico a todas las filas del grupo
  filas.forEach(fila => {
    const range = sheet.getRange(fila, 1, 1, 11); // A:K (11 columnas)
    
    // Formato básico
    range.setFontWeight('bold');
    range.setHorizontalAlignment('center');
    range.setVerticalAlignment('middle');
    range.setBorder(true, true, true, true, true, true);
    range.setBackground('#f0f9ff'); // Azul claro
  });
  
  // Aplicar formato especial a los subtotales (columna F)
  filas.forEach(fila => {
    const subtotalCell = sheet.getRange(fila, 6);
    subtotalCell.setBackground('#fef3c7'); // Amarillo claro
    subtotalCell.setFontWeight('bold');
  });
  
  // Solo hacer merge si hay más de una fila
  if (filas.length > 1) {
    // Merge fecha (columna A)
    sheet.getRange(primeraFila, 1, filas.length, 1).merge();
    
    // Merge hora (columna B)
    sheet.getRange(primeraFila, 2, filas.length, 1).merge();
    
    // Merge total (columna G)
    sheet.getRange(primeraFila, 7, filas.length, 1).merge();
    
    // Merge efectivo (columna H)
    sheet.getRange(primeraFila, 8, filas.length, 1).merge();
    
    // Merge transferencia (columna I)
    sheet.getRange(primeraFila, 9, filas.length, 1).merge();
    
    // Merge POS (columna J)
    sheet.getRange(primeraFila, 10, filas.length, 1).merge();
    
    // Merge observaciones (columna K)
    sheet.getRange(primeraFila, 11, filas.length, 1).merge();
  }
  
  // Formato especial para el total (columna G) - SIEMPRE en la última fila
  const totalCell = sheet.getRange(ultimaFila, 7);
  totalCell.setBackground('#059669'); // Verde oscuro
  totalCell.setFontColor('#ffffff');
  totalCell.setFontWeight('bold');
  totalCell.setFontSize(12);
  
  // Formato especial para pagos (columnas H, I, J, K) - SIEMPRE en la última fila
  const pagosRange = sheet.getRange(ultimaFila, 8, 1, 4);
  pagosRange.setBackground('#dcfce7'); // Verde claro
  pagosRange.setFontWeight('bold');
}

/**
 * Función para ejecutar manualmente el formateo completo
 * Útil para formatear ventas existentes o corregir formato
 */
function formatearTodasLasVentas() {
  formatearVentasCompleto();
}

/**
 * Función para limpiar formato de toda la hoja Ventas
 * Útil para resetear el formato
 */
function limpiarFormatoVentas() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ventas');
  if (!sheet) return;
  
  const range = sheet.getDataRange();
  range.clearFormat();
  
  // Restaurar formato básico de encabezados
  const headerRange = sheet.getRange(1, 1, 1, 11);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#f8fafc');
  headerRange.setHorizontalAlignment('center');
  headerRange.setBorder(true, true, true, true, true, true);
}

/**
 * Función para formatear solo la última venta agregada
 * Útil para formateo rápido sin afectar ventas existentes
 */
function formatearUltimaVenta() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ventas');
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return; // Solo encabezados
  
  // Obtener la última fila de datos
  const ultimaFila = data.length;
  const ultimaFilaData = data[ultimaFila - 1];
  const fecha = ultimaFilaData[0];
  const hora = ultimaFilaData[1];
  
  // Encontrar todas las filas con la misma fecha y hora
  const filasDelGrupo = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === fecha && data[i][1] === hora) {
      filasDelGrupo.push(i + 1);
    }
  }
  
  if (filasDelGrupo.length > 0) {
    formatearGrupoVentaCompleto(sheet, filasDelGrupo);
  }
} 