/**
 * Utilidades para el backend
 */

/**
 * Formatea una fecha en formato DD/MM/YYYY
 * @param {Date} fecha - Fecha a formatear
 * @returns {string} Fecha formateada
 */
function formatearFecha(fecha = new Date()) {
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const año = fecha.getFullYear();
  return `${dia}/${mes}/${año}`;
}

/**
 * Formatea una hora en formato HH:MM
 * @param {Date} fecha - Fecha con hora a formatear
 * @returns {string} Hora formateada
 */
function formatearHora(fecha = new Date()) {
  const hora = String(fecha.getHours()).padStart(2, '0');
  const minutos = String(fecha.getMinutes()).padStart(2, '0');
  const segundos = String(fecha.getSeconds()).padStart(2, '0');
  return `${hora}:${minutos}:${segundos}`;
}

/**
 * Calcula el precio con oferta aplicada
 * @param {number} precioOriginal - Precio original del producto
 * @param {string} oferta - Oferta en formato "X%" o número
 * @returns {number} Precio con oferta aplicada
 */
function calcularPrecioOferta(precioOriginal, oferta) {
  if (!oferta || oferta === '') {
    return null;
  }
  if (oferta.includes('%')) {
    const porcentaje = parseFloat(oferta.replace('%', ''));
    if (isNaN(porcentaje)) {
      return null;
    }
    return precioOriginal * (1 - porcentaje / 100);
  }
  const descuento = parseFloat(oferta);
  if (isNaN(descuento)) {
    return null;
  }
  return descuento;
}

/**
 * Genera un ID único para ventas
 * @returns {string} ID único
 */
function generarIdVenta() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `venta_${timestamp}_${random}`;
}

/**
 * Valida que un email tenga formato correcto
 * @param {string} email - Email a validar
 * @returns {boolean} true si es válido
 */
function validarEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Formatea un número como moneda
 * @param {number} cantidad - Cantidad a formatear
 * @param {string} moneda - Código de moneda (default: 'ARS')
 * @returns {string} Cantidad formateada
 */
function formatearMoneda(cantidad, moneda = 'ARS') {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: moneda
  }).format(cantidad);
}

/**
 * Sanitiza un string para evitar inyección de código
 * @param {string} texto - Texto a sanitizar
 * @returns {string} Texto sanitizado
 */
function sanitizarTexto(texto) {
  if (typeof texto !== 'string') {
    return '';
  }
  return texto
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .trim();
}

module.exports = {
  formatearFecha,
  formatearHora,
  calcularPrecioOferta,
  generarIdVenta,
  validarEmail,
  formatearMoneda,
  sanitizarTexto
}; 
 * Utilidades para el backend
 */

/**
 * Formatea una fecha en formato DD/MM/YYYY
 * @param {Date} fecha - Fecha a formatear
 * @returns {string} Fecha formateada
 */
function formatearFecha(fecha = new Date()) {
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const año = fecha.getFullYear();
  return `${dia}/${mes}/${año}`;
}

/**
 * Formatea una hora en formato HH:MM
 * @param {Date} fecha - Fecha con hora a formatear
 * @returns {string} Hora formateada
 */
function formatearHora(fecha = new Date()) {
  const hora = String(fecha.getHours()).padStart(2, '0');
  const minutos = String(fecha.getMinutes()).padStart(2, '0');
  const segundos = String(fecha.getSeconds()).padStart(2, '0');
  return `${hora}:${minutos}:${segundos}`;
}

/**
 * Calcula el precio con oferta aplicada
 * @param {number} precioOriginal - Precio original del producto
 * @param {string} oferta - Oferta en formato "X%" o número
 * @returns {number} Precio con oferta aplicada
 */
function calcularPrecioOferta(precioOriginal, oferta) {
  if (!oferta || oferta === '') {
    return null;
  }
  if (oferta.includes('%')) {
    const porcentaje = parseFloat(oferta.replace('%', ''));
    if (isNaN(porcentaje)) {
      return null;
    }
    return precioOriginal * (1 - porcentaje / 100);
  }
  const descuento = parseFloat(oferta);
  if (isNaN(descuento)) {
    return null;
  }
  return descuento;
}

/**
 * Genera un ID único para ventas
 * @returns {string} ID único
 */
function generarIdVenta() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `venta_${timestamp}_${random}`;
}

/**
 * Valida que un email tenga formato correcto
 * @param {string} email - Email a validar
 * @returns {boolean} true si es válido
 */
function validarEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Formatea un número como moneda
 * @param {number} cantidad - Cantidad a formatear
 * @param {string} moneda - Código de moneda (default: 'ARS')
 * @returns {string} Cantidad formateada
 */
function formatearMoneda(cantidad, moneda = 'ARS') {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: moneda
  }).format(cantidad);
}

/**
 * Sanitiza un string para evitar inyección de código
 * @param {string} texto - Texto a sanitizar
 * @returns {string} Texto sanitizado
 */
function sanitizarTexto(texto) {
  if (typeof texto !== 'string') {
    return '';
  }
  return texto
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .trim();
}

module.exports = {
  formatearFecha,
  formatearHora,
  calcularPrecioOferta,
  generarIdVenta,
  validarEmail,
  formatearMoneda,
  sanitizarTexto
}; 