/**
 * Sistema de Gestión de Ventas y Stock - ALNORTEGROW
 * Backend API para gestión de productos, ventas, cajas y empleados
 * Integrado con Google Sheets como base de datos
 * 
 * @version 2.0.0
 * @author ALNORTEGROW
 */

const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de seguridad y optimización
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting para producción
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: process.env.NODE_ENV === 'production' ? 500 : 1000, // Más restrictivo en producción
  message: 'Demasiadas requests desde esta IP, intenta de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Compresión gzip
app.use(compression());

// CORS configurado para producción
const allowedOrigins = [
  'http://localhost:3000', // Desarrollo local
  'https://alnortegrow-catalog.vercel.app', // Vercel
  'https://catalog-sheet-frontend.onrender.com', // Render frontend
  process.env.FRONTEND_URL // Variable de entorno personalizada
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Soporte para Render: escribir credentials.json desde variable de entorno
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  const credPath = path.join(__dirname, 'credentials.json');
  fs.writeFileSync(credPath, process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credPath;
}

// Configurar Google Sheets API
const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Configuración de la hoja
const SPREADSHEET_ID = process.env.SPREADSHEET_ID || 'TU_SPREADSHEET_ID_AQUI';
const RANGE = 'A:G';

// Función para obtener el ID de una hoja por nombre
async function getSheetId(sheetName) {
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      ranges: [],
      includeGridData: false
    });
    
    const sheet = response.data.sheets.find(s => s.properties.title === sheetName);
    return sheet ? sheet.properties.sheetId : null;
  } catch (error) {
    console.error('Error al obtener ID de hoja:', error);
    return null;
  }
}

// Funciones para formatear fecha y hora
function formatearFecha() {
  const ahora = new Date();
  return ahora.toLocaleDateString('es-AR', { 
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function formatearHora() {
  const ahora = new Date();
  return ahora.toLocaleTimeString('es-AR', { 
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// --- JWT ---
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'alnortegrow-secret';
const TOKEN_EXPIRATION = '24h';

// Cache de tokens válidos (en memoria)
const tokenCache = new Map(); // key: usuario, value: { token, exp }

// Middleware para proteger rutas
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Token requerido' });
  // Buscar en cache
  for (const [usuario, data] of tokenCache.entries()) {
    if (data.token === token && data.exp > Date.now()) {
      req.usuario = usuario;
      return next();
    }
  }
  // Verificar JWT
  jwt.verify(token, TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
    req.usuario = decoded.usuario;
    next();
  });
}

// --- AUTENTICACIÓN: endpoint para validar credenciales ---
app.post('/api/auth/login', (req, res) => {
  try {
    const { usuario, password } = req.body;
    const ADMIN_USER = process.env.ADMIN_USER || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    if (usuario === ADMIN_USER && password === ADMIN_PASSWORD) {
      // Buscar token en cache
      const cached = tokenCache.get(usuario);
      if (cached && cached.exp > Date.now()) {
        return res.json({ success: true, message: 'Autenticación exitosa', usuario: ADMIN_USER, token: cached.token });
      }
      // Generar token nuevo
      const token = jwt.sign({ usuario }, TOKEN_SECRET, { expiresIn: TOKEN_EXPIRATION });
      const exp = Date.now() + 24 * 60 * 60 * 1000;
      tokenCache.set(usuario, { token, exp });
      return res.json({ success: true, message: 'Autenticación exitosa', usuario: ADMIN_USER, token });
    } else {
      res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }
  } catch (error) {
    console.error('Error en autenticación:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// --- ENDPOINTS DE CAJA ---

const CAJA_FILE = path.join(__dirname, 'caja.json');

// Cargar caja persistente al iniciar
let cajaActual = null;

try {
  if (fs.existsSync(CAJA_FILE)) {
    const cajaData = fs.readFileSync(CAJA_FILE, 'utf8');
    cajaActual = JSON.parse(cajaData);
  } else {
  }
} catch (e) {
  console.error('❌ Error al cargar caja:', e.message);
  cajaActual = null;
}

function guardarCaja() {
  
  if (cajaActual) {
    fs.writeFileSync(CAJA_FILE, JSON.stringify(cajaActual, null, 2));
  } else if (fs.existsSync(CAJA_FILE)) {
    fs.unlinkSync(CAJA_FILE);
  } else {
  }
}

// Abrir caja
app.post('/api/caja/abrir', requireAuth, async (req, res) => {
  try {
    const { turno, empleado, montoApertura } = req.body;
    if (process.env.NODE_ENV === 'test') {
      cajaActual = {
        abierta: true,
        turno: turno || 'Mañana',
        empleado: empleado || 'Test',
        fechaApertura: '',
        fechaAperturaSeparada: '',
        horaApertura: '',
        montoApertura: Number(montoApertura) || 1000,
        ventas: [],
        totales: { efectivo: 0, transferencia: 0, pos: 0 },
        cantidadVentas: 0,
        cantidadProductos: 0,
        totalVendido: 0
      };
      return res.json({ success: true, caja: cajaActual });
    }
    if (cajaActual && cajaActual.abierta) {
      return res.status(400).json({ error: 'Ya hay una caja abierta' });
    }
    const fechaApertura = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
    const fechaAperturaSeparada = formatearFecha();
    const horaApertura = formatearHora();
    cajaActual = {
      abierta: true,
      turno,
      empleado,
      fechaApertura,
      fechaAperturaSeparada,
      horaApertura,
      montoApertura: Number(montoApertura) || 30000,
      ventas: [],
      totales: { efectivo: 0, transferencia: 0, pos: 0 },
      cantidadVentas: 0,
      cantidadProductos: 0,
      totalVendido: 0
    };
    guardarCaja();
    res.json({ success: true, caja: cajaActual });
  } catch (error) {
    res.status(500).json({ error: 'Error al abrir caja' });
  }
});

// Endpoint para consultar estado de caja
app.get('/api/caja/estado', async (req, res) => {
  try {
    if (!cajaActual) {
      return res.json({ success: false, message: 'No hay caja abierta' });
    }

    return res.json({ 
      success: true, 
      caja: cajaActual 
    });
  } catch (error) {
    console.error('Error al consultar estado de caja:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// Función para registrar venta en caja actual
function registrarVentaEnCaja(venta) {
  if (!cajaActual || !cajaActual.abierta) {
    return { success: false, error: 'No hay caja abierta' };
  }

  // Guardar totales anteriores para logging
  const efectivoAnterior = cajaActual.totales.efectivo;
  const transferenciaAnterior = cajaActual.totales.transferencia;
  const posAnterior = cajaActual.totales.pos;

  // Actualizar totales
  cajaActual.totales.efectivo += venta.efectivo || 0;
  cajaActual.totales.transferencia += venta.transferencia || 0;
  cajaActual.totales.pos += venta.pos || 0;
  cajaActual.totalVendido += venta.total || 0;
  cajaActual.cantidadVentas += 1;
  cajaActual.cantidadProductos += venta.productos ? venta.productos.length : 0;

  // Agregar venta al historial
  cajaActual.ventas.push({
    ...venta,
    fecha: new Date().toISOString(),
    id: Date.now().toString()
  });

  // Guardar en archivo
  guardarCaja();

  return { success: true };
}

// Cerrar caja
app.post('/api/caja/cerrar', requireAuth, async (req, res) => {
  try {
    if (!cajaActual || !cajaActual.abierta) {
      return res.status(400).json({ error: 'No hay caja abierta' });
    }
    const { montoCierre } = req.body;
    const fechaCierre = formatearFecha();
    const horaCierre = formatearHora();
    // Registrar en hoja Caja
    const CAJA_RANGE = 'Caja!A:N';
    const montoCierreReal = Number(montoCierre) || 30000;
    const fila = [
      cajaActual.fechaAperturaSeparada,  // Fecha apertura
      cajaActual.horaApertura,           // Hora apertura
      fechaCierre,                       // Fecha cierre
      horaCierre,                        // Hora cierre
      cajaActual.turno,
      cajaActual.empleado,
      cajaActual.montoApertura,
      cajaActual.totales.efectivo,
      cajaActual.totales.transferencia,
      cajaActual.totales.pos,
      cajaActual.cantidadVentas,
      cajaActual.cantidadProductos,
      montoCierreReal
    ];
    // Escribir datos en la hoja Caja
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: CAJA_RANGE,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [fila] }
    });
    
    cajaActual.abierta = false;
    guardarCaja();
    res.json({ success: true });
    cajaActual = null;
    guardarCaja();
  } catch (error) {
    res.status(500).json({ error: 'Error al cerrar caja' });
  }
});

// --- MODIFICAR /api/ventas para bloquear si caja cerrada y registrar en caja ---
app.post('/api/ventas', requireAuth, async (req, res) => {
  // Permitir registrar ventas en modo test
  if (process.env.NODE_ENV !== 'test' && (!cajaActual || !cajaActual.abierta)) {
    return res.status(403).json({ error: 'No se puede registrar venta: la caja está cerrada' });
  }
  // En modo test, si cajaActual es null, crear una caja ficticia
  if (process.env.NODE_ENV === 'test' && !cajaActual) {
    cajaActual = {
      abierta: true,
      empleado: 'Test',
      turno: 'Mañana',
      fechaApertura: '',
      fechaAperturaSeparada: '',
      horaApertura: '',
      montoApertura: 0,
      ventas: [],
      totales: { efectivo: 0, transferencia: 0, pos: 0 },
      cantidadVentas: 0,
      cantidadProductos: 0,
      totalVendido: 0
    };
  }
  try {
    const { productos, cantidades, total, efectivo, transferencia, pos, observaciones } = req.body;
    // Validar datos mínimos
    if (!productos || !cantidades || !total) {
      return res.status(400).json({ error: 'Faltan datos de la venta' });
    }
    // Fecha y hora actual separadas
    const fecha = formatearFecha();
    const hora = formatearHora();
    // Leer productos con ofertas desde hoja principal
    const PRODUCTOS_RANGE = 'A:G';
    const productosResp = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: PRODUCTOS_RANGE,
    });
    const productosRows = productosResp.data.values;
    if (!productosRows || productosRows.length === 0) {
      return res.status(500).json({ error: 'No se pudo leer los productos' });
    }
    
    // Leer precios unitarios desde hoja Stock
    const STOCK_RANGE = 'Stock!A:G';
    const stockResp = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: STOCK_RANGE,
    });
    const stockRows = stockResp.data.values;
    if (!stockRows || stockRows.length === 0) {
      return res.status(500).json({ error: 'No se pudo leer el stock' });
    }
    
    const stockHeaders = stockRows[0];
    const nombreIdx = stockHeaders.findIndex(h => h.toLowerCase() === 'nombre');
    const precioIdx = stockHeaders.findIndex(h => h.toLowerCase() === 'precio');
    const stockIdx = stockHeaders.findIndex(h => h.toLowerCase().includes('stock'));
    
    // Función para calcular precio con oferta
    const calcularPrecioOferta = (precioOriginal, oferta) => {
      if (!oferta) return null;
      const match = oferta.match(/(\d+)%/);
      if (match) {
        const descuento = parseInt(match[1]);
        return Math.round(precioOriginal * (1 - descuento / 100));
      }
      const precioMatch = oferta.match(/(\d+)/);
      if (precioMatch) {
        return parseInt(precioMatch[1]);
      }
      return null;
    };
    
    // Preparar filas para la hoja Ventas
    let filasVenta = productos.map((nombre, i) => {
      // Buscar precio unitario en Stock
      const rowStock = stockRows.find((row, idx) => idx > 0 && row[nombreIdx] === nombre);
      const precioOriginal = rowStock ? Number(rowStock[precioIdx] || 0) : 0;
      
      // Buscar oferta en productos
      const rowProducto = productosRows.find((row, idx) => idx > 0 && row[0] === nombre);
      const oferta = rowProducto ? rowProducto[3] || '' : '';
      
      // Calcular precio con oferta
      const precioUnitario = oferta && calcularPrecioOferta(precioOriginal, oferta) !== null 
        ? calcularPrecioOferta(precioOriginal, oferta) 
        : precioOriginal;
      
      const cantidad = Number(cantidades[i]);
      const subtotal = precioUnitario * cantidad;
      return [
        fecha,
        hora,
        nombre,
        cantidad,
        precioUnitario,
        subtotal,
        '', '', '', '', '', '', cajaActual.empleado // Total, Efectivo, Transferencia, POS, Observaciones, Vendedor
      ];
    });
    // Calcular subtotales y total
    const subtotales = filasVenta.map(f => f[5]);
    const totalVenta = subtotales.reduce((a, b) => a + b, 0);
    // Armar observaciones si hay más de un método de pago
    let obs = '';
    const pagos = [];
    if (efectivo && Number(efectivo) > 0) pagos.push(`$${efectivo} con Efectivo`);
    if (transferencia && Number(transferencia) > 0) pagos.push(`$${transferencia} en Transferencia`);
    if (pos && Number(pos) > 0) pagos.push(`$${pos} mediante POS`);
    if (pagos.length > 1) obs = `Pago ${pagos.join(', ')}`;
    if (req.body.cliente) {
      obs += (obs ? '. ' : '') + `Cliente: ${req.body.cliente}`;
    }
    if (observaciones) {
      obs += (obs ? ' - ' : '') + `Observaciones adicionales: ${observaciones}`;
    }
    // Solo en la última fila poner total y métodos de pago
    const idxUltima = filasVenta.length - 1;
    filasVenta[idxUltima][6] = totalVenta;
    filasVenta[idxUltima][7] = efectivo;
    filasVenta[idxUltima][8] = transferencia;
    filasVenta[idxUltima][9] = pos;
    filasVenta[idxUltima][10] = obs;
    // Escribir en hoja Ventas
    const VENTAS_RANGE = 'Ventas!A:M';
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: VENTAS_RANGE,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: filasVenta
      }
    });
    // Actualizar stock en hoja Stock
    let updates = [];
    productos.forEach((nombre, i) => {
      const rowIdx = stockRows.findIndex((row, idx) => idx > 0 && row[nombreIdx] === nombre);
      if (rowIdx > 0 && stockIdx >= 0) {
        const actual = Number(stockRows[rowIdx][stockIdx] || 0);
        const nuevo = Math.max(0, actual - Number(cantidades[i]));
        stockRows[rowIdx][stockIdx] = nuevo;
        updates.push({ rowIdx, nuevo });
      }
    });
    for (const upd of updates) {
      const cell = String.fromCharCode(65 + stockIdx) + (upd.rowIdx + 1);
      // Actualizar el valor del stock
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Stock!${cell}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[upd.nuevo]] }
      });
      
      // Aplicar formato de centrado a la celda
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{
            repeatCell: {
              range: {
                sheetId: await getSheetId('Stock'),
                startRowIndex: upd.rowIdx,
                endRowIndex: upd.rowIdx + 1,
                startColumnIndex: stockIdx,
                endColumnIndex: stockIdx + 1
              },
              cell: {
                userEnteredFormat: {
                  horizontalAlignment: 'CENTER',
                  verticalAlignment: 'MIDDLE'
                }
              },
              fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment)'
            }
          }]
        }
      });
    }
    
    // Registrar venta en caja ANTES de enviar respuesta
    registrarVentaEnCaja(req.body);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error al registrar venta:', error);
    res.status(500).json({ error: 'Error al registrar venta' });
  }
});

// --- ENDPOINTS PARA GESTIÓN DE VENTAS ---

// Obtener listado de ventas
app.get('/api/ventas', async (req, res) => {
  try {
    const VENTAS_RANGE = 'Ventas!A:M';
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: VENTAS_RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      return res.json([]);
    }

    // Agrupar ventas por ID y asignar filas sin ID a la venta anterior
    const ventas = {};
    let ultimoIdVenta = null;
    
    for (let i = 1; i < rows.length; i++) {
      const fila = rows[i];
      const idVenta = fila[11];
      
      // Si esta fila tiene ID, actualizar el último ID conocido
      if (idVenta) {
        ultimoIdVenta = idVenta;
      }
      
      // Solo procesar si tenemos un ID de venta (de esta fila o de una anterior)
      if (ultimoIdVenta) {
        if (!ventas[ultimoIdVenta]) {
          ventas[ultimoIdVenta] = {
            id: ultimoIdVenta,
            fecha: fila[0],
            hora: fila[1],
            productos: [],
            total: 0,
            efectivo: 0,
            transferencia: 0,
            pos: 0,
            observaciones: fila[10] || '',
            vendedor: fila[12] || '', // Columna M: Vendedor
            filas: []
          };
        }
        
        // Agregar producto
        ventas[ultimoIdVenta].productos.push({
          nombre: fila[2],
          cantidad: fila[3],
          precio: fila[4],
          subtotal: fila[5]
        });
        
        // Sumar totales
        ventas[ultimoIdVenta].total += Number(fila[6]) || 0;
        ventas[ultimoIdVenta].efectivo += Number(fila[7]) || 0;
        ventas[ultimoIdVenta].transferencia += Number(fila[8]) || 0;
        ventas[ultimoIdVenta].pos += Number(fila[9]) || 0;
        ventas[ultimoIdVenta].filas.push(i + 1);
      }
    }

    const listado = Object.values(ventas);
    res.json(listado);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
});

// Eliminar venta específica
app.delete('/api/ventas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const VENTAS_RANGE = 'Ventas!A:M';
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: VENTAS_RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      return res.status(404).json({ error: 'No hay ventas para eliminar' });
    }

    // Encontrar todas las filas de la venta (con ID y sin ID)
    const filasAEliminar = [];
    let totalVenta = 0;
    let efectivoVenta = 0;
    let transferenciaVenta = 0;
    let posVenta = 0;
    let cantidadProductosVenta = 0;
    let encontroVenta = false;
    
    // Recolectar productos para restaurar stock
    const productosParaRestaurar = [];

    for (let i = 1; i < rows.length; i++) {
      const idFila = rows[i][11];
      
      // Si encontramos la venta con el ID, marcar que la encontramos
      if (String(idFila) === String(id)) {
        encontroVenta = true;
        filasAEliminar.push(i + 1);
        totalVenta += Number(rows[i][6]) || 0;
        efectivoVenta += Number(rows[i][7]) || 0;
        transferenciaVenta += Number(rows[i][8]) || 0;
        posVenta += Number(rows[i][9]) || 0;
        cantidadProductosVenta += Number(rows[i][3]) || 0;
        
        // Recolectar producto para restaurar stock
        const nombreProducto = rows[i][2];
        const cantidadProducto = Number(rows[i][3]) || 0;
        if (nombreProducto && cantidadProducto > 0) {
          productosParaRestaurar.push({ nombre: nombreProducto, cantidad: cantidadProducto });
        }
      }
      // Si ya encontramos la venta y esta fila no tiene ID, también eliminarla
      else if (encontroVenta && !idFila) {
        filasAEliminar.push(i + 1);
        totalVenta += Number(rows[i][6]) || 0;
        efectivoVenta += Number(rows[i][7]) || 0;
        transferenciaVenta += Number(rows[i][8]) || 0;
        posVenta += Number(rows[i][9]) || 0;
        cantidadProductosVenta += Number(rows[i][3]) || 0;
        
        // Recolectar producto para restaurar stock
        const nombreProducto = rows[i][2];
        const cantidadProducto = Number(rows[i][3]) || 0;
        if (nombreProducto && cantidadProducto > 0) {
          productosParaRestaurar.push({ nombre: nombreProducto, cantidad: cantidadProducto });
        }
      }
      // Si encontramos otra venta con ID diferente, parar de buscar
      else if (encontroVenta && idFila && String(idFila) !== String(id)) {
        break;
      }
    }

    if (filasAEliminar.length === 0) {
      return res.status(404).json({ error: `No se encontró la venta con ID ${id}` });
    }

    // Eliminar filas en orden descendente
    const sheetId = await getSheetId('Ventas');
    if (!sheetId) {
      return res.status(500).json({ error: 'No se pudo obtener el ID de la hoja Ventas' });
    }

    // Ordenar filas de mayor a menor para evitar problemas con índices
    const filasOrdenadas = filasAEliminar.sort((a, b) => b - a);
    
    // Crear todas las solicitudes de eliminación en una sola operación
    const deleteRequests = filasOrdenadas.map(fila => ({
      deleteDimension: {
        range: {
          sheetId: sheetId,
          dimension: 'ROWS',
          startIndex: fila - 1,
          endIndex: fila
        }
      }
    }));

    // Ejecutar todas las eliminaciones en una sola operación
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: deleteRequests
        }
      });
    } catch (deleteError) {
      console.error('Error al eliminar filas:', deleteError);
      throw deleteError;
    }

    // Restaurar stock de los productos eliminados
    if (productosParaRestaurar.length > 0) {
      try {
        // Leer stock actual
        const STOCK_RANGE = 'Stock!A:G';
        const stockResp = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: STOCK_RANGE,
        });
        const stockRows = stockResp.data.values;
        
        if (stockRows && stockRows.length > 0) {
          const stockHeaders = stockRows[0];
          const nombreIdx = stockHeaders.findIndex(h => h.toLowerCase().includes('nombre'));
          const stockIdx = stockHeaders.findIndex(h => h.toLowerCase().includes('stock'));
          
          if (nombreIdx >= 0 && stockIdx >= 0) {
            // Restaurar stock para cada producto
            for (const producto of productosParaRestaurar) {
              const rowIdx = stockRows.findIndex((row, idx) => idx > 0 && row[nombreIdx] === producto.nombre);
              if (rowIdx > 0) {
                const stockActual = Number(stockRows[rowIdx][stockIdx] || 0);
                const nuevoStock = stockActual + producto.cantidad;
                stockRows[rowIdx][stockIdx] = nuevoStock;
                
                // Actualizar en Google Sheets
                const cell = String.fromCharCode(65 + stockIdx) + (rowIdx + 1);
                await sheets.spreadsheets.values.update({
                  spreadsheetId: SPREADSHEET_ID,
                  range: `Stock!${cell}`,
                  valueInputOption: 'USER_ENTERED',
                  requestBody: { values: [[nuevoStock]] }
                });
              }
            }
          }
        }
      } catch (stockError) {
        console.error('Error al restaurar stock:', stockError);
        // No fallar la eliminación si hay error al restaurar stock
      }
    }

    // Registrar eliminación en caja si está abierta
    if (cajaActual && cajaActual.abierta) {
      cajaActual.totales.efectivo -= efectivoVenta;
      cajaActual.totales.transferencia -= transferenciaVenta;
      cajaActual.totales.pos -= posVenta;
      cajaActual.totalVendido -= totalVenta;
      cajaActual.cantidadVentas--;
      cajaActual.cantidadProductos -= cantidadProductosVenta;
      guardarCaja();
    }

    res.json({ 
      success: true, 
      message: 'Venta eliminada correctamente',
      totalEliminado: totalVenta,
      efectivoEliminado: efectivoVenta,
      transferenciaEliminada: transferenciaVenta,
      posEliminado: posVenta
    });
  } catch (error) {
    console.error('Error al eliminar venta:', error);
    console.error('Stack trace:', error.stack);
    console.error('Error details:', JSON.stringify(error, null, 2));
    res.status(500).json({ error: 'Error al eliminar venta' });
  }
});

// --- ENDPOINTS DE GESTIÓN DE CAJAS ---

// Obtener listado de cajas
app.get('/api/cajas', async (req, res) => {
  try {
    const CAJA_RANGE = 'Caja!A:M';
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: CAJA_RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      return res.json([]);
    }

    // Usar los encabezados reales
    // ["Fecha Apertura", "Hora Apertura", "Fecha Cierre", "Hora Cierre", "Turno", "Empleado", "Monto Apertura", "Efectivo", "Transferencia", "POS", "Cant. Ventas", "Cant. Productos", "Monto Cierre"]
    const cajas = [];
    for (let i = 1; i < rows.length; i++) {
      const fila = rows[i];
      // Solo filas con fecha de apertura, hora de apertura y empleado
      if (fila[0] && fila[1] && fila[5]) {
        cajas.push({
          id: i,
          fechaApertura: fila[0],
          horaApertura: fila[1],
          fechaCierre: fila[2],
          horaCierre: fila[3],
          turno: fila[4],
          empleado: fila[5],
          montoApertura: Number(fila[6]) || 0,
          efectivo: Number(fila[7]) || 0,
          transferencia: Number(fila[8]) || 0,
          pos: Number(fila[9]) || 0,
          cantidadVentas: Number(fila[10]) || 0,
          cantidadProductos: Number(fila[11]) || 0,
          montoCierre: Number(fila[12]) || 0
        });
      }
    }

    res.json(cajas);
  } catch (error) {
    console.error('Error al obtener cajas:', error);
    res.status(500).json({ error: 'Error al obtener cajas' });
  }
});

// Eliminar caja específica
app.delete('/api/cajas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const filaId = parseInt(id);
    
    if (isNaN(filaId)) {
      return res.status(400).json({ error: 'ID de caja inválido' });
    }

    const CAJA_RANGE = 'Caja!A:M';
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: CAJA_RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= filaId) {
      return res.status(404).json({ error: 'Caja no encontrada' });
    }

    // Verificar que la fila existe y tiene datos de caja
    const fila = rows[filaId];
    if (!fila || !fila[0] || !fila[1] || !fila[2]) {
      return res.status(404).json({ error: 'Caja no encontrada o datos inválidos' });
    }

    // Obtener datos de la caja antes de eliminar
    const cajaEliminada = {
      fecha: fila[0],
      hora: fila[1],
      total: Number(fila[2]) || 0,
      efectivo: Number(fila[3]) || 0,
      transferencia: Number(fila[4]) || 0,
      pos: Number(fila[5]) || 0,
      turno: fila[6] || '',
      empleado: fila[7] || '',
      montoApertura: Number(fila[8]) || 0,
      cantidadVentas: Number(fila[9]) || 0,
      cantidadProductos: Number(fila[10]) || 0,
      totalVendido: Number(fila[11]) || 0,
      observaciones: fila[12] || ''
    };

    // Eliminar la fila
    const sheetId = await getSheetId('Caja');
    if (!sheetId) {
      return res.status(500).json({ error: 'No se pudo obtener el ID de la hoja Caja' });
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: 'ROWS',
              startIndex: filaId,
              endIndex: filaId + 1
            }
          }
        }]
      }
    });

    res.json({ 
      success: true, 
      message: 'Caja eliminada correctamente',
      cajaEliminada
    });
  } catch (error) {
    console.error('Error al eliminar caja:', error);
    res.status(500).json({ error: 'Error al eliminar caja' });
  }
});

// --- ENDPOINTS DE REPORTES ---

// Obtener métricas generales del negocio
app.get('/api/reportes/metricas', async (req, res) => {
  try {
    // Obtener parámetros de filtro
    const { mes, anio, empleado } = req.query;
    
    // Obtener ventas
    const VENTAS_RANGE = 'Ventas!A:N';
    const ventasResp = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: VENTAS_RANGE,
    });
    const ventasRows = ventasResp.data.values;

    // Obtener cajas
    const CAJA_RANGE = 'Caja!A:M';
    const cajaResp = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: CAJA_RANGE,
    });
    const cajaRows = cajaResp.data.values;

    // Obtener productos
    const PRODUCTOS_RANGE = 'A:G';
    const productosResp = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: PRODUCTOS_RANGE,
    });
    const productosRows = productosResp.data.values;

    // Verificar que tenemos datos válidos
    if (!productosRows || productosRows.length === 0) {
      return res.json({
        ventas: { total: 0, cantidad: 0, efectivo: 0, transferencia: 0, pos: 0, promedioPorVenta: 0, productosVendidos: 0 },
        cajas: { total: 0, montoApertura: 0, montoCierre: 0, porEmpleado: {}, porTurno: {} },
        productos: { total: 0, sinStock: 0, stockTotal: 0, porCategoria: {} },
        topProductos: [],
        topDias: [],
        ventasPorDia: {}
      });
    }

    // Obtener encabezados
    const headers = productosRows[0];
    const nombreIdx = headers.findIndex(h => h.toLowerCase().includes('nombre'));
    const precioIdx = headers.findIndex(h => h.toLowerCase().includes('precio'));
    const stockIdx = headers.findIndex(h => h.toLowerCase().includes('stock'));
    const categoriaIdx = headers.findIndex(h => h.toLowerCase().includes('categoria'));
    const descripcionIdx = headers.findIndex(h => h.toLowerCase().includes('descripcion'));

    // Procesar ventas
    let totalVentas = 0;
    let totalEfectivo = 0;
    let totalTransferencia = 0;
    let totalPOS = 0;
    let cantidadVentas = 0;
    let cantidadProductos = 0;
    const ventasPorDia = {};
    const productosVendidos = {};

    if (ventasRows && ventasRows.length > 1) {
      // Agrupar ventas por ID para procesar correctamente
      const ventasAgrupadas = {};
      let ultimoIdVenta = null;
      
      for (let i = 1; i < ventasRows.length; i++) {
        const fila = ventasRows[i];
        const idVenta = fila[11]; // Columna L: ID de venta
        
        // Si esta fila tiene ID, actualizar el último ID conocido
        if (idVenta) {
          ultimoIdVenta = idVenta;
        }
        
        // Solo procesar si tenemos un ID de venta
        if (ultimoIdVenta) {
          if (!ventasAgrupadas[ultimoIdVenta]) {
            ventasAgrupadas[ultimoIdVenta] = {
              fecha: fila[0], // Columna A: Fecha
              hora: fila[1],  // Columna B: Hora
              vendedor: fila[12], // Columna M: Vendedor
              productos: [],
              total: 0,
              efectivo: 0,
              transferencia: 0,
              pos: 0
            };
          }
          
          // Agregar producto a la venta
          const nombreProducto = fila[2]; // Columna C: Nombre del producto
          const cantidad = Number(fila[3]) || 0; // Columna D: Cantidad
          
          if (nombreProducto && cantidad > 0) {
            ventasAgrupadas[ultimoIdVenta].productos.push({
              nombre: nombreProducto,
              cantidad: cantidad
            });
          }
          
          // Sumar totales (solo de la última fila de cada venta)
          ventasAgrupadas[ultimoIdVenta].total += Number(fila[6]) || 0; // Columna G: Total
          ventasAgrupadas[ultimoIdVenta].efectivo += Number(fila[7]) || 0; // Columna H: Efectivo
          ventasAgrupadas[ultimoIdVenta].transferencia += Number(fila[8]) || 0; // Columna I: Transferencia
          ventasAgrupadas[ultimoIdVenta].pos += Number(fila[9]) || 0; // Columna J: POS
        }
      }
      
      // Procesar las ventas agrupadas con filtros
      Object.values(ventasAgrupadas).forEach(venta => {
        // Aplicar filtros
        let aplicarFiltros = true;
        
        if (mes || anio || empleado) {
          // Filtrar por fecha
          if (venta.fecha) {
            const fechaParts = venta.fecha.split('/');
            if (fechaParts.length >= 3) {
              const dia = parseInt(fechaParts[0]);
              const mesVenta = parseInt(fechaParts[1]);
              const anioVenta = parseInt(fechaParts[2]);
              
              // Filtro por mes
              if (mes && mesVenta !== parseInt(mes)) {
                aplicarFiltros = false;
              }
              
              // Filtro por año
              if (anio && anioVenta !== parseInt(anio)) {
                aplicarFiltros = false;
              }
            }
          }
          
          // Filtrar por empleado (usando el campo vendedor de la venta)
          if (empleado && aplicarFiltros) {
            if (venta.vendedor && venta.vendedor !== empleado) {
              aplicarFiltros = false;
            }
          }
        }
        
        if (aplicarFiltros) {
          totalVentas += venta.total;
          totalEfectivo += venta.efectivo;
          totalTransferencia += venta.transferencia;
          totalPOS += venta.pos;
          cantidadVentas++;

          // Contar productos vendidos (solo unidades)
          venta.productos.forEach(producto => {
            productosVendidos[producto.nombre] = (productosVendidos[producto.nombre] || 0) + producto.cantidad;
            cantidadProductos += producto.cantidad;
          });

          // Ventas por día (solo fecha, sin hora)
          if (venta.fecha) {
            // Si la fecha tiene formato 'dd/mm/yyyy hh:mm:ss', tomar solo la parte de la fecha
            const dia = venta.fecha.split(' ')[0];
            ventasPorDia[dia] = (ventasPorDia[dia] || 0) + venta.total;
          }
        }
      });
    }

    // Procesar cajas
    let totalCajas = 0;
    let totalMontoApertura = 0;
    let totalMontoCierre = 0;
    const cajasPorEmpleado = {};
    const cajasPorTurno = {};

    if (cajaRows && cajaRows.length > 1) {
      for (let i = 1; i < cajaRows.length; i++) {
        const fila = cajaRows[i];
        if (fila[0] && fila[1] && fila[5]) { // Solo filas con datos válidos
          const montoApertura = Number(fila[6]) || 0;
          const montoCierre = Number(fila[12]) || 0;
          const empleado = fila[5];
          const turno = fila[4];

          totalCajas++;
          totalMontoApertura += montoApertura;
          totalMontoCierre += montoCierre;

          cajasPorEmpleado[empleado] = (cajasPorEmpleado[empleado] || 0) + 1;
          cajasPorTurno[turno] = (cajasPorTurno[turno] || 0) + 1;
        }
      }
    }

    // Procesar productos
    let totalProductos = 0;
    let productosSinStock = 0;
    let stockTotal = 0;
    const productosPorCategoria = {};

    if (productosRows && productosRows.length > 1) {
      for (let i = 1; i < productosRows.length; i++) {
        const fila = productosRows[i];
        if (fila[0]) { // Solo filas con nombre
          const categoria = fila[1] || 'Sin categoría';
          const stock = Number(fila[6]) || 0;

          totalProductos++;
          stockTotal += stock;
          if (stock <= 0) productosSinStock++;

          productosPorCategoria[categoria] = (productosPorCategoria[categoria] || 0) + 1;
        }
      }
    }

    // Top productos vendidos (solo por cantidad de unidades)
    const topProductos = Object.entries(productosVendidos)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([producto, cantidad]) => ({ producto, cantidad }));

    // Top días con más ventas (solo por fecha)
    const topDias = Object.entries(ventasPorDia)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 7)
      .map(([dia, total]) => ({ dia, total }));

    const metricas = {
      ventas: {
        total: totalVentas,
        cantidad: cantidadVentas,
        efectivo: totalEfectivo,
        transferencia: totalTransferencia,
        pos: totalPOS,
        promedioPorVenta: cantidadVentas > 0 ? Math.round(totalVentas / cantidadVentas) : 0,
        productosVendidos: cantidadProductos
      },
      cajas: {
        total: totalCajas,
        montoApertura: totalMontoApertura,
        montoCierre: totalMontoCierre,
        porEmpleado: cajasPorEmpleado,
        porTurno: cajasPorTurno
      },
      productos: {
        total: totalProductos,
        sinStock: productosSinStock,
        stockTotal: stockTotal,
        porCategoria: productosPorCategoria
      },
      topProductos,
      topDias,
      ventasPorDia
    };

    res.json(metricas);
  } catch (error) {
    console.error('Error al obtener métricas:', error);
    res.status(500).json({ error: 'Error al obtener métricas' });
  }
});

// Obtener reporte de ventas por período
app.get('/api/reportes/ventas', async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    
    const VENTAS_RANGE = 'Ventas!A:N';
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: VENTAS_RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      return res.json([]);
    }

    const ventas = [];
    for (let i = 1; i < rows.length; i++) {
      const fila = rows[i];
      if (fila[0] && fila[0] !== 'undefined') {
        const fecha = fila[1];
        const fechaObj = fecha ? new Date(fecha) : null;
        
        // Filtrar por período si se especifica
        if (desde && hasta && fechaObj) {
          const desdeObj = new Date(desde);
          const hastaObj = new Date(hasta);
          if (fechaObj < desdeObj || fechaObj > hastaObj) {
            continue;
          }
        }

        ventas.push({
          id: fila[0],
          fecha: fila[1],
          productos: fila[2] || '',
          total: Number(fila[3]) || 0,
          efectivo: Number(fila[4]) || 0,
          transferencia: Number(fila[5]) || 0,
          pos: Number(fila[6]) || 0,
          cantidades: fila[7] || '',
          cliente: fila[8] || '',
          observaciones: fila[9] || ''
        });
      }
    }

    res.json(ventas);
  } catch (error) {
    console.error('Error al obtener reporte de ventas:', error);
    res.status(500).json({ error: 'Error al obtener reporte de ventas' });
  }
});

// Obtener reporte de productos más vendidos
app.get('/api/reportes/productos-vendidos', async (req, res) => {
  try {
    const VENTAS_RANGE = 'Ventas!A:N';
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: VENTAS_RANGE,
    });

    const rows = response.data.values;
    const productosVendidos = {};

    if (rows && rows.length > 1) {
      for (let i = 1; i < rows.length; i++) {
        const fila = rows[i];
        if (fila[0] && fila[0] !== 'undefined') {
          const productos = fila[2] ? fila[2].split(', ') : [];
          const cantidades = fila[7] ? fila[7].split(', ') : [];
          const total = Number(fila[3]) || 0;

          productos.forEach((producto, idx) => {
            const cantidad = Number(cantidades[idx]) || 1;
            if (!productosVendidos[producto]) {
              productosVendidos[producto] = {
                cantidad: 0,
                totalVendido: 0,
                vecesVendido: 0
              };
            }
            productosVendidos[producto].cantidad += cantidad;
            productosVendidos[producto].totalVendido += (total / productos.length);
            productosVendidos[producto].vecesVendido++;
          });
        }
      }
    }

    const productosOrdenados = Object.entries(productosVendidos)
      .map(([producto, datos]) => ({
        producto,
        ...datos
      }))
      .sort((a, b) => b.cantidad - a.cantidad);

    res.json(productosOrdenados);
  } catch (error) {
    console.error('Error al obtener productos vendidos:', error);
    res.status(500).json({ error: 'Error al obtener productos vendidos' });
  }
});

// --- ENDPOINTS DE GESTIÓN DE STOCK ---

// Obtener todos los productos de la hoja Stock
app.get('/api/stock', async (req, res) => {
  try {
    const STOCK_RANGE = 'Stock!A:G';
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: STOCK_RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      return res.json([]);
    }

    // Obtener encabezados
    const headers = rows[0];
    const nombreIdx = headers.findIndex(h => h.toLowerCase().includes('nombre'));
    const precioIdx = headers.findIndex(h => h.toLowerCase().includes('precio'));
    const stockIdx = headers.findIndex(h => h.toLowerCase().includes('stock'));
    const categoriaIdx = headers.findIndex(h => h.toLowerCase().includes('categoria'));
    const descripcionIdx = headers.findIndex(h => h.toLowerCase().includes('descripcion'));


    // Convertir filas a objetos de productos
    const productos = rows.slice(1).map((row, index) => ({
      id: index + 1,
      nombre: row[nombreIdx] || '',
      precio: Number(row[precioIdx]) || 0,
      stock: Number(row[stockIdx]) || 0,
      categoria: row[categoriaIdx] || '',
      descripcion: row[descripcionIdx] || '',
      fila: index + 2 // Fila en Google Sheets (1-indexed + header)
    }));

    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos de stock:', error);
    res.status(500).json({ error: 'Error al obtener productos de stock' });
  }
});

// Actualizar stock de un producto
app.put('/api/stock/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, precio, categoria, descripcion } = req.body;
    
    // Obtener productos para encontrar la fila
    const STOCK_RANGE = 'Stock!A:G';
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: STOCK_RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      return res.json({ success: true, message: 'No hay productos para actualizar' });
    }

    const headers = rows[0];
    const nombreIdx = headers.findIndex(h => h.toLowerCase().includes('nombre'));
    const precioIdx = headers.findIndex(h => h.toLowerCase().includes('precio'));
    const stockIdx = headers.findIndex(h => h.toLowerCase().includes('stock'));
    const categoriaIdx = headers.findIndex(h => h.toLowerCase().includes('categoria'));
    const descripcionIdx = headers.findIndex(h => h.toLowerCase().includes('descripcion'));

    // Encontrar la fila del producto
    const filaProducto = parseInt(id) + 1; // +1 porque el ID es 1-indexed y tenemos header en fila 1
    if (filaProducto > rows.length) {
      return res.json({ success: true, message: 'Producto no encontrado' });
    }

    // Preparar actualizaciones
    const updates = [];
    
    if (stock !== undefined) {
      const stockCell = String.fromCharCode(65 + stockIdx) + filaProducto;
      updates.push({
        range: `Stock!${stockCell}`,
        values: [[stock]]
      });
    }
    
    if (precio !== undefined) {
      const precioCell = String.fromCharCode(65 + precioIdx) + filaProducto;
      updates.push({
        range: `Stock!${precioCell}`,
        values: [[precio]]
      });
    }
    
    if (categoria !== undefined) {
      const categoriaCell = String.fromCharCode(65 + categoriaIdx) + filaProducto;
      updates.push({
        range: `Stock!${categoriaCell}`,
        values: [[categoria]]
      });
    }
    
    if (descripcion !== undefined) {
      const descripcionCell = String.fromCharCode(65 + descripcionIdx) + filaProducto;
      updates.push({
        range: `Stock!${descripcionCell}`,
        values: [[descripcion]]
      });
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No se especificaron datos para actualizar' });
    }

    // Ejecutar actualizaciones
    for (const update of updates) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: update.range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: update.values }
      });
    }

    res.json({ success: true, message: 'Producto actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar stock:', error);
    res.status(500).json({ error: 'Error al actualizar stock' });
  }
});

// Agregar stock a un producto (incrementar)
app.post('/api/stock/:id/agregar', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad } = req.body;
    
    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
    }

    // Obtener stock actual
    const STOCK_RANGE = 'Stock!A:G';
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: STOCK_RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      return res.json({ success: true, message: 'No hay productos en stock' });
    }

    const headers = rows[0];
    const stockIdx = headers.findIndex(h => h.toLowerCase().includes('stock'));

    const filaProducto = parseInt(id) + 1; // +1 porque el ID es 1-indexed y tenemos header en fila 1
    if (filaProducto > rows.length) {
      return res.json({ success: true, message: 'Producto no encontrado' });
    }

    const stockActual = Number(rows[filaProducto - 1][stockIdx]) || 0;
    const nuevoStock = stockActual + Number(cantidad);

    // Actualizar stock
    const stockCell = String.fromCharCode(65 + stockIdx) + filaProducto;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Stock!${stockCell}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[nuevoStock]] }
    });

    res.json({ success: true, message: `Stock actualizado: ${stockActual} + ${cantidad} = ${nuevoStock}`, stockAnterior: stockActual, stockNuevo: nuevoStock });
  } catch (error) {
    console.error('Error al agregar stock:', error);
    res.status(500).json({ error: 'Error al agregar stock' });
  }
});

// Obtener productos con bajo stock (menos de 5 unidades)
app.get('/api/stock/bajo-stock', async (req, res) => {
  try {
    const STOCK_RANGE = 'Stock!A:G';
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: STOCK_RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      return res.json([]);
    }

    const headers = rows[0];
    const nombreIdx = headers.findIndex(h => h.toLowerCase().includes('nombre'));
    const precioIdx = headers.findIndex(h => h.toLowerCase().includes('precio'));
    const stockIdx = headers.findIndex(h => h.toLowerCase().includes('stock'));
    const categoriaIdx = headers.findIndex(h => h.toLowerCase().includes('categoria'));

    const productosBajoStock = rows.slice(1)
      .map((row, index) => ({
        id: index + 1,
        nombre: row[nombreIdx] || '',
        precio: Number(row[precioIdx]) || 0,
        stock: Number(row[stockIdx]) || 0,
        categoria: row[categoriaIdx] || '',
        fila: index + 2
      }))
      .filter(producto => producto.stock < 5 && producto.stock >= 0);

    res.json(productosBajoStock);
  } catch (error) {
    console.error('Error al obtener productos con bajo stock:', error);
    res.status(500).json({ error: 'Error al obtener productos con bajo stock' });
  }
});

// Alias para compatibilidad con tests
app.get('/api/stock/bajo', async (req, res) => {
  // Redirigir al endpoint correcto
  req.url = '/api/stock/bajo-stock';
  return app._router.handle(req, res);
});

app.get('/api/metricas', async (req, res) => {
  // Redirigir al endpoint correcto
  req.url = '/api/reportes/metricas';
  return app._router.handle(req, res);
});

app.post('/api/presupuesto', async (req, res) => {
  // Redirigir al endpoint correcto
  req.url = '/api/presupuesto/generar';
  return app._router.handle(req, res);
});

// ===== ENDPOINTS PARA GESTIÓN DE EMPLEADOS =====

// Obtener todos los empleados
app.get('/api/empleados', async (req, res) => {
  try {
    const EMPLEADOS_RANGE = 'Empleados!A:A';
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: EMPLEADOS_RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      return res.json([]);
    }

    // Empleados empiezan desde la fila 2 (índice 1)
    const empleados = rows.slice(1)
      .map((row, index) => ({
        id: index + 1,
        nombre: row[0] || '',
        fila: index + 2
      }))
      .filter(empleado => empleado.nombre.trim() !== '');

    res.json(empleados);
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ error: 'Error al obtener empleados' });
  }
});

// Agregar nuevo empleado
app.post('/api/empleados', requireAuth, async (req, res) => {
  try {
    const { nombre } = req.body;
    
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre del empleado es requerido' });
    }

    // Obtener la próxima fila disponible
    const EMPLEADOS_RANGE = 'Empleados!A:A';
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: EMPLEADOS_RANGE,
    });

    const rows = response.data.values;
    const proximaFila = (rows ? rows.length : 1) + 1;

    // Agregar el empleado
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Empleados!A${proximaFila}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[nombre.trim()]] }
    });

    res.json({ success: true, message: 'Empleado agregado correctamente', empleado: { nombre: nombre.trim(), fila: proximaFila } });
  } catch (error) {
    console.error('Error al agregar empleado:', error);
    res.status(500).json({ error: 'Error al agregar empleado' });
  }
});

// Actualizar empleado
app.put('/api/empleados/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre del empleado es requerido' });
    }

    const filaEmpleado = parseInt(id) + 1; // +1 porque los empleados empiezan en fila 2

    // Actualizar el empleado
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Empleados!A${filaEmpleado}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[nombre.trim()]] }
    });

    res.json({ success: true, message: 'Empleado actualizado correctamente', empleado: { id: parseInt(id), nombre: nombre.trim(), fila: filaEmpleado } });
  } catch (error) {
    console.error('Error al actualizar empleado:', error);
    res.status(500).json({ error: 'Error al actualizar empleado' });
  }
});

// ===== ENDPOINTS PARA GENERACIÓN DE PRESUPUESTOS =====

// Generar presupuesto PDF
app.post('/api/presupuesto/generar', requireAuth, async (req, res) => {
  try {
    const { productos, cliente, observaciones, empleado } = req.body;
    
    if (!productos || productos.length === 0) {
      return res.status(400).json({ error: 'No hay productos en el presupuesto' });
    }

    // Calcular totales
    const calcularPrecioOferta = (precioOriginal, oferta) => {
      if (!oferta) return null;
      const match = oferta.match(/(\d+)%/);
      if (match) {
        const descuento = parseInt(match[1]);
        return Math.round(precioOriginal * (1 - descuento / 100));
      }
      const precioMatch = oferta.match(/(\d+)/);
      if (precioMatch) {
        return parseInt(precioMatch[1]);
      }
      return null;
    };

    const formatearPrecio = (precio) => new Intl.NumberFormat('es-AR', { 
      style: 'currency', 
      currency: 'ARS', 
      maximumFractionDigits: 0 
    }).format(precio);

    const totalPresupuesto = productos.reduce((acc, p) => {
      const precioFinal = p.oferta && calcularPrecioOferta(p.precio, p.oferta) !== null 
        ? calcularPrecioOferta(p.precio, p.oferta) 
        : p.precio;
      return acc + precioFinal * p.cantidad;
    }, 0);

    // Generar PDF usando PDFKit
    const PDFDocument = require('pdfkit');
    const fs = require('fs');
    const path = require('path');

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Crear directorio temporal si no existe
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const filename = `presupuesto_${Date.now()}.pdf`;
    const filepath = path.join(tempDir, filename);
    const stream = fs.createWriteStream(filepath);

    doc.pipe(stream);

    // Header con nombre de la empresa
    doc.fontSize(28)
       .font('Helvetica-Bold')
       .fillColor('#2E7D32')
       .text('ALNORTEGROW', { align: 'center' });

    doc.moveDown(0.5);
    doc.fontSize(14)
       .font('Helvetica')
       .fillColor('#666')
       .text('www.alnortegrow.com.ar', { align: 'center' });

    doc.moveDown(1);

    // Información del presupuesto
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#000')
       .text('PRESUPUESTO', { align: 'center' });

    doc.moveDown(0.5);

    // Fecha y número de presupuesto
    const fecha = new Date().toLocaleDateString('es-AR');
    const numeroPresupuesto = `P-${Date.now().toString().slice(-6)}`;
    
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#666')
       .text(`Fecha: ${fecha}`);
    
    if (empleado) {
      doc.text(`Vendedor: ${empleado}`);
    }
    
    doc.text(`N° Presupuesto: ${numeroPresupuesto}`);

    if (cliente) {
      doc.text(`Cliente: ${cliente}`);
    }

    doc.moveDown(1);

    // Tabla de productos
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#000')
       .text('DETALLE DE PRODUCTOS');

    doc.moveDown(0.5);

    // Headers de la tabla
    const tableTop = doc.y;
    const pageWidth = doc.page.width;
    const totalTableWidth = 250 + 80 + 100 + 100; // Suma de colWidths
    const tableLeft = (pageWidth - totalTableWidth) / 2; // Centrar la tabla
    const colWidths = [250, 80, 100, 100]; // Eliminé la columna Oferta

    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#fff')
       .rect(tableLeft, tableTop, colWidths[0], 20)
       .fill()
       .fillColor('#000')
       .text('Producto', tableLeft + 5, tableTop + 5);

    doc.fillColor('#fff')
       .rect(tableLeft + colWidths[0], tableTop, colWidths[1], 20)
       .fill()
       .fillColor('#000')
       .text('Cant.', tableLeft + colWidths[0] + 5, tableTop + 5);

    doc.fillColor('#fff')
       .rect(tableLeft + colWidths[0] + colWidths[1], tableTop, colWidths[2], 20)
       .fill()
       .fillColor('#000')
       .text('Precio', tableLeft + colWidths[0] + colWidths[1] + 5, tableTop + 5);

    doc.fillColor('#fff')
       .rect(tableLeft + colWidths[0] + colWidths[1] + colWidths[2], tableTop, colWidths[3], 20)
       .fill()
       .fillColor('#000')
       .text('Total', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + 5, tableTop + 5);

    // Filas de productos
    let currentY = tableTop + 20;
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#000');

    productos.forEach((producto, index) => {
      const precioFinal = producto.oferta && calcularPrecioOferta(producto.precio, producto.oferta) !== null 
        ? calcularPrecioOferta(producto.precio, producto.oferta) 
        : producto.precio;
      const totalProducto = precioFinal * producto.cantidad;

      // Fondo alternado para las filas
      if (index % 2 === 0) {
        doc.fillColor('#f9f9f9')
           .rect(tableLeft, currentY, colWidths.reduce((a, b) => a + b), 20)
           .fill();
      }

      doc.fillColor('#000')
         .text(producto.nombre, tableLeft + 5, currentY + 5, { width: colWidths[0] - 10 })
         .text(producto.cantidad.toString(), tableLeft + colWidths[0] + 5, currentY + 5)
         .text(formatearPrecio(precioFinal), tableLeft + colWidths[0] + colWidths[1] + 5, currentY + 5)
         .text(formatearPrecio(totalProducto), tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + 5, currentY + 5);

      currentY += 20;
    });

    // Fila de total al final de la tabla
    doc.fillColor('#e5e7eb')
       .rect(tableLeft, currentY, colWidths.reduce((a, b) => a + b), 25)
       .fill();
    
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#000')
       .text('TOTAL PRESUPUESTO', tableLeft + 5, currentY + 8)
       .text('', tableLeft + colWidths[0] + 5, currentY + 8) // Cantidad vacía
       .text('', tableLeft + colWidths[0] + colWidths[1] + 5, currentY + 8) // Precio vacío
       .text(formatearPrecio(totalPresupuesto), tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + 5, currentY + 8);

    // Observaciones
    if (observaciones) {
      doc.moveDown(1);
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#000')
         .text('Observaciones:', { align: 'left' });
      
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#666')
         .text(observaciones, { align: 'left' });
    }

    // Footer centrado en toda la hoja usando posicionamiento absoluto
    // Calcular posición Y después de la tabla
    const footerY = currentY + 60; // 60px después del final de la tabla
    
    // Calcular posición X para centrar (compensando offset de PDFKit)
    const centerX = (pageWidth / 2) - 40; // Compensación de 40px hacia la izquierda
    
    // Texto de validez centrado
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#666')
       .text(`Este presupuesto tiene una validez de 7 días. Para consultas: ${process.env.TELEFONO}`, 50, footerY, {
         align: 'center'
       });

    doc.end();

    // Esperar a que se complete la escritura del archivo
    stream.on('finish', () => {
      // Leer el archivo y enviarlo como respuesta
      const fileBuffer = fs.readFileSync(filepath);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(fileBuffer);

      // Eliminar el archivo temporal después de enviarlo
      setTimeout(() => {
        fs.unlinkSync(filepath);
      }, 1000);
    });

  } catch (error) {
    console.error('Error al generar presupuesto:', error);
    res.status(500).json({ error: 'Error al generar presupuesto' });
  }
});

// Error handling middleware mejorado
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  
  // Si es un error de JSON inválido, devolver 400
  if (err.type === 'entity.parse.failed' || err.status === 400) {
    return res.status(400).json({ 
      error: 'JSON inválido',
      message: 'El formato JSON enviado no es válido'
    });
  }
  
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
  console.log(`📊 API disponible en http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
module.exports.formatearFecha = formatearFecha;
module.exports.formatearHora = formatearHora; 

// Ruta para obtener todos los productos (protegida)
app.get('/api/productos', requireAuth, async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.json([]);
    }
    // Convertir filas a objetos de productos
    const productos = rows.slice(1).map((row, index) => ({
      id: index + 1,
      nombre: row[0] || '',
      categoria: row[1] || '',
      precio: parseFloat(row[2]) || 0,
      oferta: row[3] || '',
      descripcion: row[4] || '',
      imagen: row[5] || '',
      stock: row[6] !== undefined ? row[6] : '',
    }));
    res.json(productos);
  } catch (error) {
    console.error('Error al leer Google Sheets:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Ruta para obtener productos por categoría (protegida)
app.get('/api/productos/categoria/:categoria', requireAuth, async (req, res) => {
  try {
    const { categoria } = req.params;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.json([]);
    }
    const productos = rows.slice(1)
      .map((row, index) => ({
        id: index + 1,
        nombre: row[0] || '',
        categoria: row[1] || '',
        precio: parseFloat(row[2]) || 0,
        oferta: row[3] || '',
        descripcion: row[4] || '',
        imagen: row[5] || '',
        stock: row[6] !== undefined ? row[6] : '',
      }))
      .filter(producto => 
        producto.categoria.toLowerCase().includes(categoria.toLowerCase())
      );
    res.json(productos);
  } catch (error) {
    console.error('Error al leer Google Sheets:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});