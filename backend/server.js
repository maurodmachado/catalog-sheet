console.log('=== INICIO SERVER.JS ===', __filename);
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: 'Demasiadas requests desde esta IP, intenta de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Compresión gzip
app.use(compression());

// CORS configurado para producción
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://tu-dominio.com'] 
    : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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
  keyFile: './credentials.json', // Archivo JSON de la cuenta de servicio
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// ID de tu hoja de Google (lo necesitarás cambiar)
const SPREADSHEET_ID = process.env.SPREADSHEET_ID || 'TU_SPREADSHEET_ID_AQUI';
const RANGE = 'A:G'; // Columnas A a G (Nombre, Categoria, Precio, Oferta, Descripcion, Imagen, Stock)

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

// Funciones para formatear fecha y hora por separado
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

// Ruta para obtener todos los productos
app.get('/api/productos', async (req, res) => {
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

// Ruta para obtener productos por categoría
app.get('/api/productos/categoria/:categoria', async (req, res) => {
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

// Health check endpoint mejorado
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// --- EMPLEADOS: obtener lista desde Google Sheets ---
app.get('/api/empleados', async (req, res) => {
  try {
    const EMPLEADOS_RANGE = 'Empleados!A:A';
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: EMPLEADOS_RANGE,
    });
    const rows = response.data.values;
    if (!rows || rows.length < 2) {
      console.log('Hoja Empleados vacía o no encontrada');
      return res.json([]);
    }

    // Obtener empleados desde la fila 2 (saltar encabezado)
    const empleados = rows.slice(1).map(row => row[0]).filter(Boolean);
    console.log('Empleados obtenidos:', empleados);
    res.json(empleados);
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ error: 'Error al obtener empleados' });
  }
});

// --- AUTENTICACIÓN: endpoint para validar credenciales ---
app.post('/api/auth/login', (req, res) => {
  try {
    const { usuario, password } = req.body;
    
    // Obtener credenciales desde variables de entorno
    const ADMIN_USER = process.env.ADMIN_USER || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (usuario === ADMIN_USER && password === ADMIN_PASSWORD) {
      res.json({ 
        success: true, 
        message: 'Autenticación exitosa',
        usuario: ADMIN_USER
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Usuario o contraseña incorrectos' 
      });
    }
  } catch (error) {
    console.error('Error en autenticación:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// --- ENDPOINTS DE CAJA ---

const CAJA_FILE = path.join(__dirname, 'caja.json');

// Cargar caja persistente al iniciar
let cajaActual = null;
try {
  if (fs.existsSync(CAJA_FILE)) {
    cajaActual = JSON.parse(fs.readFileSync(CAJA_FILE, 'utf8'));
  }
} catch (e) {
  cajaActual = null;
}

function guardarCaja() {
  if (cajaActual) {
    fs.writeFileSync(CAJA_FILE, JSON.stringify(cajaActual, null, 2));
  } else if (fs.existsSync(CAJA_FILE)) {
    fs.unlinkSync(CAJA_FILE);
  }
}

// Abrir caja
app.post('/api/caja/abrir', async (req, res) => {
  try {
    const { turno, empleado, montoApertura } = req.body;
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
    res.json({ ok: true, caja: cajaActual });
  } catch (error) {
    res.status(500).json({ error: 'Error al abrir caja' });
  }
});

// Consultar estado de caja
app.get('/api/caja/estado', (req, res) => {
  if (!cajaActual) return res.json({ abierta: false });
  res.json(cajaActual);
});

// Registrar venta en caja (llamar desde /api/ventas)
function registrarVentaEnCaja(venta) {
  if (!cajaActual || !cajaActual.abierta) return;
  cajaActual.ventas.push(venta);
  cajaActual.totales.efectivo += Number(venta.efectivo || 0);
  cajaActual.totales.transferencia += Number(venta.transferencia || 0);
  cajaActual.totales.pos += Number(venta.pos || 0);
  cajaActual.cantidadVentas += 1;
  cajaActual.cantidadProductos += venta.cantidades.reduce((a, b) => a + Number(b), 0);
  cajaActual.totalVendido = (cajaActual.totalVendido || 0) + Number(venta.total || 0);
  guardarCaja();
}

// Cerrar caja
app.post('/api/caja/cerrar', async (req, res) => {
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
    res.json({ ok: true });
    cajaActual = null;
    guardarCaja();
  } catch (error) {
    res.status(500).json({ error: 'Error al cerrar caja' });
  }
});

// --- MODIFICAR /api/ventas para bloquear si caja cerrada y registrar en caja ---
app.post('/api/ventas', async (req, res) => {
  if (!cajaActual || !cajaActual.abierta) {
    return res.status(403).json({ error: 'No se puede registrar venta: la caja está cerrada' });
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
    const stockIdx = stockHeaders.findIndex(h => h.toLowerCase() === 'stock');
    
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
    res.json({ ok: true });
    registrarVentaEnCaja(req.body);
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
          const nombreIdx = stockHeaders.findIndex(h => h.toLowerCase() === 'nombre');
          const stockIdx = stockHeaders.findIndex(h => h.toLowerCase() === 'stock');
          
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
      ok: true, 
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
    console.log('Filas crudas de la hoja Caja:', JSON.stringify(rows, null, 2));
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
      ok: true, 
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
    console.log('=== INICIANDO CÁLCULO DE MÉTRICAS ===');
    
    // Obtener parámetros de filtro
    const { mes, anio, empleado } = req.query;
    console.log('Filtros aplicados:', { mes, anio, empleado });
    
    // Obtener ventas
    const VENTAS_RANGE = 'Ventas!A:N';
    console.log('Obteniendo datos de ventas...');
    const ventasResp = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: VENTAS_RANGE,
    });
    const ventasRows = ventasResp.data.values;
    console.log('Filas de ventas obtenidas:', ventasRows ? ventasRows.length : 0);

    // Obtener cajas
    const CAJA_RANGE = 'Caja!A:M';
    console.log('Obteniendo datos de cajas...');
    const cajaResp = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: CAJA_RANGE,
    });
    const cajaRows = cajaResp.data.values;
    console.log('Filas de cajas obtenidas:', cajaRows ? cajaRows.length : 0);

    // Obtener productos
    const PRODUCTOS_RANGE = 'A:G';
    console.log('Obteniendo datos de productos...');
    const productosResp = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: PRODUCTOS_RANGE,
    });
    const productosRows = productosResp.data.values;
    console.log('Filas de productos obtenidas:', productosRows ? productosRows.length : 0);

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

    console.log('Métricas calculadas exitosamente:', {
      totalVentas,
      cantidadVentas,
      totalCajas,
      totalProductos
    });
    console.log('=== FIN CÁLCULO DE MÉTRICAS ===');

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`API disponible en http://localhost:${PORT}/api/productos`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 