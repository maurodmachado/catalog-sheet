const { formatearFecha, formatearHora, calcularPrecioOferta } = require('../utils');

describe('Utility Functions', () => {
  describe('formatearFecha', () => {
    it('should format date correctly', () => {
      const mockDate = new Date('2025-01-15T10:30:00');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const result = formatearFecha();
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
      
      global.Date.mockRestore();
    });
  });

  describe('formatearHora', () => {
    it('should format time correctly', () => {
      const mockDate = new Date('2025-01-15T10:30:45');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const result = formatearHora();
      expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
      
      global.Date.mockRestore();
    });
  });

  describe('calcularPrecioOferta', () => {
    it('should calculate percentage discount correctly', () => {
      const precioOriginal = 100;
      const oferta = '20%';
      const resultado = calcularPrecioOferta(precioOriginal, oferta);
      expect(resultado).toBe(80);
    });

    it('should calculate fixed price correctly', () => {
      const precioOriginal = 100;
      const oferta = '75';
      const resultado = calcularPrecioOferta(precioOriginal, oferta);
      expect(resultado).toBe(75);
    });

    it('should return null for invalid offer', () => {
      const precioOriginal = 100;
      const oferta = 'invalid';
      const resultado = calcularPrecioOferta(precioOriginal, oferta);
      expect(resultado).toBeNull();
    });

    it('should return null when no offer', () => {
      const precioOriginal = 100;
      const oferta = '';
      const resultado = calcularPrecioOferta(precioOriginal, oferta);
      expect(resultado).toBeNull();
    });

    it('should handle zero price', () => {
      const precioOriginal = 0;
      const oferta = '50%';
      const resultado = calcularPrecioOferta(precioOriginal, oferta);
      expect(resultado).toBe(0);
    });
  });
}); 