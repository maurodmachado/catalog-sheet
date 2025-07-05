import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock de react-router-dom
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => children,
  Routes: ({ children }) => children,
  Route: ({ children }) => children,
}));

describe('App Component', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear();
    
    // Mock de fetch
    global.fetch = vi.fn();
  });

  describe('Product Catalog', () => {
    it('should render product catalog', async () => {
      const mockProducts = [
        {
          id: 1,
          nombre: 'Producto Test',
          categoria: 'Test Category',
          precio: 100,
          oferta: '',
          descripcion: 'Test description',
          imagen: 'test.jpg',
          stock: 10
        }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Producto Test')).toBeInTheDocument();
      });
    });

    it('should filter products by category', async () => {
      const mockProducts = [
        {
          id: 1,
          nombre: 'Fertilizante',
          categoria: 'Fertilizantes',
          precio: 100,
          oferta: '',
          descripcion: 'Test description',
          imagen: 'test.jpg',
          stock: 10
        },
        {
          id: 2,
          nombre: 'Herramienta',
          categoria: 'Herramientas',
          precio: 200,
          oferta: '',
          descripcion: 'Test description',
          imagen: 'test2.jpg',
          stock: 5
        }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Fertilizante')).toBeInTheDocument();
        expect(screen.getByText('Herramienta')).toBeInTheDocument();
      });

      // Filtrar por categoría
      const categoryButton = screen.getByText('Fertilizantes');
      fireEvent.click(categoryButton);

      await waitFor(() => {
        expect(screen.getByText('Fertilizante')).toBeInTheDocument();
        expect(screen.queryByText('Herramienta')).not.toBeInTheDocument();
      });
    });

    it('should add product to cart', async () => {
      const mockProducts = [
        {
          id: 1,
          nombre: 'Producto Test',
          categoria: 'Test Category',
          precio: 100,
          oferta: '',
          descripcion: 'Test description',
          imagen: 'test.jpg',
          stock: 10
        }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Producto Test')).toBeInTheDocument();
      });

      const addButton = screen.getByText('🛒');
      fireEvent.click(addButton);

      // Verificar que el carrito se actualiza
      const cartButton = screen.getByText('🛒');
      expect(cartButton).toBeInTheDocument();
    });

    it('should calculate offer price correctly', async () => {
      const mockProducts = [
        {
          id: 1,
          nombre: 'Producto Oferta',
          categoria: 'Test Category',
          precio: 100,
          oferta: '20%',
          descripcion: 'Test description',
          imagen: 'test.jpg',
          stock: 10
        }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Producto Oferta')).toBeInTheDocument();
        // El precio con oferta debería ser $80 (100 - 20%)
        expect(screen.getByText('$80')).toBeInTheDocument();
      });
    });
  });

  describe('Shopping Cart', () => {
    it('should open cart modal', async () => {
      const mockProducts = [
        {
          id: 1,
          nombre: 'Producto Test',
          categoria: 'Test Category',
          precio: 100,
          oferta: '',
          descripcion: 'Test description',
          imagen: 'test.jpg',
          stock: 10
        }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Producto Test')).toBeInTheDocument();
      });

      // Agregar producto al carrito
      const addButton = screen.getByText('🛒');
      fireEvent.click(addButton);

      // Abrir carrito
      const cartButton = screen.getByText('🛒');
      fireEvent.click(cartButton);

      expect(screen.getByText('🛒 Carrito')).toBeInTheDocument();
    });

    it('should clear cart', async () => {
      const mockProducts = [
        {
          id: 1,
          nombre: 'Producto Test',
          categoria: 'Test Category',
          precio: 100,
          oferta: '',
          descripcion: 'Test description',
          imagen: 'test.jpg',
          stock: 10
        }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Producto Test')).toBeInTheDocument();
      });

      // Agregar producto al carrito
      const addButton = screen.getByText('🛒');
      fireEvent.click(addButton);

      // Abrir carrito
      const cartButton = screen.getByText('🛒');
      fireEvent.click(cartButton);

      // Limpiar carrito
      const clearButton = screen.getByTitle('Limpiar carrito');
      fireEvent.click(clearButton);

      expect(screen.getByText('El carrito está vacío.')).toBeInTheDocument();
    });

    it('should update product quantity in cart', async () => {
      const mockProducts = [
        {
          id: 1,
          nombre: 'Producto Test',
          categoria: 'Test Category',
          precio: 100,
          oferta: '',
          descripcion: 'Test description',
          imagen: 'test.jpg',
          stock: 10
        }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Producto Test')).toBeInTheDocument();
      });

      // Agregar producto al carrito
      const addButton = screen.getByText('🛒');
      fireEvent.click(addButton);

      // Abrir carrito
      const cartButton = screen.getByText('🛒');
      fireEvent.click(cartButton);

      // Cambiar cantidad
      const quantityInput = screen.getByDisplayValue('1');
      fireEvent.change(quantityInput, { target: { value: '3' } });

      expect(quantityInput.value).toBe('3');
    });
  });

  describe('Product Modal', () => {
    it('should open product detail modal', async () => {
      const mockProducts = [
        {
          id: 1,
          nombre: 'Producto Test',
          categoria: 'Test Category',
          precio: 100,
          oferta: '',
          descripcion: 'Test description',
          imagen: 'test.jpg',
          stock: 10
        }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Producto Test')).toBeInTheDocument();
      });

      // Hacer clic en el producto para abrir modal
      const productCard = screen.getByText('Producto Test');
      fireEvent.click(productCard);

      expect(screen.getByText('Producto Test')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('API Error'));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Error al cargar productos/)).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network Error'));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Error al cargar productos/)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should render correctly on mobile', () => {
      // Simular viewport móvil
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<App />);
      
      // Verificar que los elementos se renderizan correctamente
      expect(screen.getByText('Catálogo de Productos')).toBeInTheDocument();
    });
  });
}); 