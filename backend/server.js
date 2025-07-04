const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configurar Google Sheets API
const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json', // Archivo JSON de la cuenta de servicio
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

// ID de tu hoja de Google (lo necesitarás cambiar)
const SPREADSHEET_ID = process.env.SPREADSHEET_ID || 'TU_SPREADSHEET_ID_AQUI';
const RANGE = 'A:F'; // Columnas A a F (Nombre, Categoria, Precio, Oferta, Descripcion, Imagen)

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

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API funcionando correctamente' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`API disponible en http://localhost:${PORT}/api/productos`);
}); 