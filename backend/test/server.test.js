const request = require('supertest');
const app = require('../server');
const fs = require('fs');
const path = require('path');

describe('API Tests', () => {
  let server;

  beforeAll(() => {
    server = app.listen(0); // Puerto aleatorio para tests
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('Health Check', () => {
    test('GET /api/health should return 200', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
    });
  });

  describe('Productos', () => {
    test('GET /api/productos should return array', async () => {
      const response = await request(app).get('/api/productos');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /api/productos/categoria/test should return filtered products', async () => {
      const response = await request(app).get('/api/productos/categoria/test');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Caja', () => {
    test('GET /api/caja/estado should return caja status', async () => {
      const response = await request(app).get('/api/caja/estado');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('abierta');
    });

    test('POST /api/caja/abrir should open caja', async () => {
      const cajaData = {
        turno: 'Mañana',
        empleado: 'Test User',
        montoApertura: 10000
      };
      const response = await request(app).post('/api/caja/abrir').send(cajaData);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    test('POST /api/caja/cerrar should close caja', async () => {
      const cajaData = {
        montoCierre: 15000
      };
      const response = await request(app).post('/api/caja/cerrar').send(cajaData);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Ventas', () => {
    test('GET /api/ventas should return ventas array', async () => {
      const response = await request(app).get('/api/ventas');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('POST /api/ventas should create new venta', async () => {
      // Mock caja abierta globalmente
      const cajaMock = {
        abierta: true,
        empleado: 'Juan',
        turno: 'Mañana',
        montoApertura: 1000,
        ventas: [],
        totales: { efectivo: 0, transferencia: 0, pos: 0 },
        cantidadVentas: 0,
        cantidadProductos: 0,
        totalVendido: 0
      };
      
      // Mock fs para simular caja abierta
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(cajaMock));
      
      // Mock Google Sheets para productos y stock
      const { __mockValues } = require('../__mocks__/googleapis');
      __mockValues.get
        .mockResolvedValueOnce({
          data: {
            values: [
              ['Nombre', 'Categoria', 'Precio', 'Oferta', 'Descripcion', 'Imagen', 'Stock'],
              ['Producto 1', 'Test', '100', '', 'Desc 1', 'img1.jpg', '10'],
              ['Producto 2', 'Test', '200', '', 'Desc 2', 'img2.jpg', '5']
            ]
          }
        })
        .mockResolvedValueOnce({
          data: {
            values: [
              ['Nombre', 'Precio', 'Stock'],
              ['Producto 1', '100', '10'],
              ['Producto 2', '200', '5']
            ]
          }
        });
      
      const ventaData = {
        productos: ['Producto 1', 'Producto 2'],
        cantidades: [2, 1],
        total: 300,
        efectivo: 200,
        transferencia: 100,
        pos: 0,
        cliente: 'Cliente Test',
        observaciones: 'Test sale'
      };
      const response = await request(app).post('/api/ventas').send(ventaData);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Stock', () => {
    test('GET /api/stock should return stock products', async () => {
      const response = await request(app).get('/api/stock');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /api/stock/bajo should return low stock products', async () => {
      const response = await request(app).get('/api/stock/bajo');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('PUT /api/stock/:id should update product', async () => {
      const updateData = {
        stock: 10,
        precio: 150,
        categoria: 'Test',
        descripcion: 'Test description'
      };
      const response = await request(app).put('/api/stock/1').send(updateData);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    test('POST /api/stock/:id/agregar should add stock', async () => {
      const stockData = {
        cantidad: 5
      };
      const response = await request(app).post('/api/stock/1/agregar').send(stockData);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Empleados', () => {
    test('GET /api/empleados should return empleados array', async () => {
      const response = await request(app).get('/api/empleados');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('POST /api/empleados should create new empleado', async () => {
      const empleadoData = {
        nombre: 'Nuevo Empleado'
      };
      const response = await request(app).post('/api/empleados').send(empleadoData);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    test('PUT /api/empleados/:id should update empleado', async () => {
      const empleadoData = {
        nombre: 'Empleado Actualizado'
      };
      const response = await request(app).put('/api/empleados/1').send(empleadoData);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Métricas', () => {
    test('GET /api/metricas should return metrics', async () => {
      const response = await request(app).get('/api/metricas');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('ventas');
      expect(response.body).toHaveProperty('cajas');
      expect(response.body).toHaveProperty('productos');
    });

    test('GET /api/metricas with filters should work', async () => {
      const response = await request(app).get('/api/metricas?mes=1&anio=2025&empleado=test');
      expect(response.status).toBe(200);
    });
  });

  describe('Presupuestos', () => {
    test('POST /api/presupuesto should generate PDF', async () => {
      // Mock PDFKit
      const mockPDFDocument = {
        pipe: jest.fn().mockReturnThis(),
        fontSize: jest.fn().mockReturnThis(),
        font: jest.fn().mockReturnThis(),
        fillColor: jest.fn().mockReturnThis(),
        text: jest.fn().mockReturnThis(),
        moveDown: jest.fn().mockReturnThis(),
        rect: jest.fn().mockReturnThis(),
        fill: jest.fn().mockReturnThis(),
        end: jest.fn().mockReturnThis(),
        y: 100,
        page: { width: 595 }
      };
      
      jest.mock('pdfkit', () => {
        return jest.fn().mockImplementation(() => mockPDFDocument);
      });
      
      // Mock fs
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
      jest.spyOn(fs, 'createWriteStream').mockReturnValue({
        on: jest.fn().mockImplementation(function(event, callback) {
          if (event === 'finish') {
            callback();
          }
          return this;
        })
      });
      jest.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from('fake pdf content'));
      jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});
      
      const presupuestoData = {
        productos: [
          {
            id: 1,
            nombre: 'Producto Test',
            precio: 100,
            cantidad: 2,
            categoria: 'Test'
          }
        ],
        cliente: 'Cliente Test',
        observaciones: 'Test presupuesto',
        empleado: 'Vendedor Test'
      };
      const response = await request(app).post('/api/presupuesto').send(presupuestoData);
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
    });
  });

  describe('Error Handling', () => {
    test('404 for non-existent endpoint', async () => {
      const response = await request(app).get('/api/nonexistent');
      expect(response.status).toBe(404);
    });

    test('Invalid JSON should return 400', async () => {
      const response = await request(app).post('/api/ventas')
        .set('Content-Type', 'application/json')
        .send('invalid json');
      expect(response.status).toBe(400);
    });
  });
});

describe('Utility Functions', () => {
  test('formatearFecha should return valid date', () => {
    const fecha = require('../server').formatearFecha();
    expect(typeof fecha).toBe('string');
    expect(fecha).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
  });

  test('formatearHora should return valid time', () => {
    const hora = require('../server').formatearHora();
    expect(typeof hora).toBe('string');
    expect(hora).toMatch(/^\d{1,2}:\d{2}:\d{2}$/);
  });
}); 