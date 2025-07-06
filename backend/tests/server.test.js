jest.mock('googleapis');
const { google, __mockValues } = require('googleapis');
const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');

// Mock de dotenv
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

// Mock de fs para caja.json
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

// Importar el servidor después de los mocks
const app = require('../server');

beforeAll(() => {
  fs.existsSync.mockImplementation(() => true);
  fs.readFileSync.mockImplementation(() => JSON.stringify({
    abierta: true,
    empleado: 'Juan',
    turno: 'Mañana',
    montoApertura: 1000,
    ventas: [],
    totales: { efectivo: 0, transferencia: 0, pos: 0 },
    cantidadVentas: 0,
    cantidadProductos: 0,
    totalVendido: 0
  }));
});

describe('API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/productos', () => {
    it('should return empty array when no products', async () => {
      __mockValues.get.mockResolvedValue({
        data: { values: [] }
      });

      const response = await request(app).get('/api/productos');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return products array', async () => {
      __mockValues.get.mockResolvedValue({
        data: {
          values: [
            ['Nombre', 'Categoria', 'Precio', 'Oferta', 'Descripcion', 'Imagen', 'Stock'],
            ['Producto 1', 'Categoria 1', '100', '', 'Desc 1', 'img1.jpg', '10'],
            ['Producto 2', 'Categoria 2', '200', '10%', 'Desc 2', 'img2.jpg', '5']
          ]
        }
      });

      const response = await request(app).get('/api/productos');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('nombre', 'Producto 1');
      expect(response.body[0]).toHaveProperty('precio', 100);
    });

    it('should handle API errors', async () => {
      __mockValues.get.mockRejectedValue(new Error('API Error'));

      const response = await request(app).get('/api/productos');
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/productos/categoria/:categoria', () => {
    it('should filter products by category', async () => {
      __mockValues.get.mockResolvedValue({
        data: {
          values: [
            ['Nombre', 'Categoria', 'Precio', 'Oferta', 'Descripcion', 'Imagen', 'Stock'],
            ['Producto 1', 'Fertilizantes', '100', '', 'Desc 1', 'img1.jpg', '10'],
            ['Producto 2', 'Herramientas', '200', '10%', 'Desc 2', 'img2.jpg', '5'],
            ['Producto 3', 'Fertilizantes', '150', '', 'Desc 3', 'img3.jpg', '8']
          ]
        }
      });

      const response = await request(app).get('/api/productos/categoria/fertilizantes');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body.every(p => p.categoria.toLowerCase().includes('fertilizantes'))).toBe(true);
    });
  });

  describe('GET /api/empleados', () => {
    it('should return employees list', async () => {
      __mockValues.get.mockResolvedValue({
        data: {
          values: [
            ['Empleado'],
            ['Juan'],
            ['María'],
            ['Pedro']
          ]
        }
      });

      const response = await request(app).get('/api/empleados');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(['Juan', 'María', 'Pedro']);
    });

    it('should return empty array when no employees', async () => {
      __mockValues.get.mockResolvedValue({
        data: { values: [['Empleado']] }
      });

      const response = await request(app).get('/api/empleados');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /api/caja/abrir', () => {
    beforeEach(() => {
      fs.existsSync.mockReturnValue(false);
    });

    it('should open cash register successfully', async () => {
      const cajaData = {
        turno: 'Mañana',
        empleado: 'Juan',
        montoApertura: '1000'
      };

      const response = await request(app)
        .post('/api/caja/abrir')
        .send(cajaData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('ok', true);
      expect(response.body).toHaveProperty('caja');
      expect(response.body.caja).toHaveProperty('abierta', true);
      expect(response.body.caja).toHaveProperty('empleado', 'Juan');
      expect(response.body.caja).toHaveProperty('turno', 'Mañana');
    });

    it('should prevent opening if already open', async () => {
      // Simular caja ya abierta
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        abierta: true,
        empleado: 'Juan'
      }));

      const cajaData = {
        turno: 'Tarde',
        empleado: 'María',
        montoApertura: '1000'
      };

      const response = await request(app)
        .post('/api/caja/abrir')
        .send(cajaData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/caja/cerrar', () => {
    beforeEach(() => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        abierta: true,
        empleado: 'Juan',
        turno: 'Mañana',
        montoApertura: 1000
      }));
    });

    it('should close cash register successfully', async () => {
      const response = await request(app).post('/api/caja/cerrar');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('ok', true);
    });
  });

  describe('GET /api/caja/estado', () => {
    it('should return cash register status', async () => {
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
      const existsSpy = jest.spyOn(fs, 'existsSync').mockImplementation(() => true);
      const readSpy = jest.spyOn(fs, 'readFileSync').mockImplementation(() => JSON.stringify(cajaMock));
      const response = await request(app).get('/api/caja/estado');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('abierta', true);
      expect(response.body).toHaveProperty('empleado', 'Juan');
      expect(response.body).toHaveProperty('turno', 'Mañana');
      expect(response.body).toHaveProperty('montoApertura', 1000);
      existsSpy.mockRestore();
      readSpy.mockRestore();
    });

    it('should return false abierta when no cash register', async () => {
      fs.existsSync.mockReturnValue(false);

      const response = await request(app).get('/api/caja/estado');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('abierta', false);
    });
  });

  describe('POST /api/ventas', () => {
    it('should create sale successfully', async () => {
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
      const existsSpy = jest.spyOn(fs, 'existsSync').mockImplementation(() => true);
      const readSpy = jest.spyOn(fs, 'readFileSync').mockImplementation(() => JSON.stringify(cajaMock));
      __mockValues.append.mockResolvedValue({
        data: { updates: { updatedRows: 1 } }
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
      const response = await request(app)
        .post('/api/ventas')
        .send(ventaData);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      existsSpy.mockRestore();
      readSpy.mockRestore();
    });

    it('should prevent sale when cash register is closed', async () => {
      fs.readFileSync.mockReturnValue(JSON.stringify({
        abierta: false
      }));

      const ventaData = {
        productos: ['Producto 1'],
        cantidades: [1],
        total: 100,
        efectivo: 100
      };

      const response = await request(app)
        .post('/api/ventas')
        .send(ventaData);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/ventas/:id', () => {
    it('should delete sale successfully', async () => {
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
      const existsSpy = jest.spyOn(fs, 'existsSync').mockImplementation(() => true);
      const readSpy = jest.spyOn(fs, 'readFileSync').mockImplementation(() => JSON.stringify(cajaMock));
      __mockValues.get.mockResolvedValue({
        data: {
          values: [
            ['ID', 'Fecha', 'Productos', 'Total'],
            ['otro-id', '2025-01-01', 'Producto 1', '100'],
            ['test-id', '2025-01-01', 'Producto 1', '100']
          ]
        }
      });
      __mockValues.batchUpdate.mockResolvedValue({});
      const response = await request(app).delete('/api/ventas/test-id');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      existsSpy.mockRestore();
      readSpy.mockRestore();
    });
  });

  describe('GET /api/reportes/metricas', () => {
    it('should return metrics data', async () => {
      __mockValues.get
        .mockResolvedValueOnce({
          data: {
            values: [
              ['ID', 'Fecha', 'Productos', 'Total', 'Efectivo', 'Transferencia', 'POS', 'Cantidades'],
              ['1', '2025-01-01', 'Producto 1, Producto 2', '300', '200', '100', '0', '2, 1']
            ]
          }
        })
        .mockResolvedValueOnce({
          data: {
            values: [
              ['Fecha Apertura', 'Empleado', 'Turno'],
              ['2025-01-01', 'Juan', 'Mañana']
            ]
          }
        })
        .mockResolvedValueOnce({
          data: {
            values: [
              ['Nombre', 'Categoria', 'Precio', 'Stock'],
              ['Producto 1', 'Categoria 1', '100', '10']
            ]
          }
        });

      const response = await request(app).get('/api/reportes/metricas');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('ventas');
      expect(response.body).toHaveProperty('cajas');
      expect(response.body).toHaveProperty('productos');
    });
  });

  describe('Error handling', () => {
    it('should handle 404 errors', async () => {
      const response = await request(app).get('/api/nonexistent');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/ventas')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect([400, 500]).toContain(response.status);
    });
  });
}); 

  describe('Error handling', () => {
    it('should handle 404 errors', async () => {
      const response = await request(app).get('/api/nonexistent');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/ventas')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect([400, 500]).toContain(response.status);
    });
  });
}); 