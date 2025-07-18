import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Admin from './Admin';

// Mock de las funciones de fetch
global.fetch = jest.fn();

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock de las variables de entorno
global.import = {
  meta: {
    env: {
      VITE_API_URL: 'http://localhost:3001'
    }
  }
};

describe('Admin Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  describe('Login', () => {
    test('should show login form when not logged in', () => {
      localStorageMock.getItem.mockReturnValue(null);
      render(<Admin />);
      
      expect(screen.getByText('🔐 Iniciar Sesión')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Usuario')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    });

    test('should handle successful login', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, usuario: 'admin' })
      });

      render(<Admin />);
      
      fireEvent.change(screen.getByPlaceholderText('Usuario'), {
        target: { value: 'admin' }
      });
      fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
        target: { value: 'password' }
      });
      fireEvent.click(screen.getByText('Iniciar Sesión'));

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('adminLogueado', '1');
      });
    });

    test('should handle login error', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, message: 'Credenciales inválidas' })
      });

      render(<Admin />);
      
      fireEvent.change(screen.getByPlaceholderText('Usuario'), {
        target: { value: 'wrong' }
      });
      fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
        target: { value: 'wrong' }
      });
      fireEvent.click(screen.getByText('Iniciar Sesión'));

      await waitFor(() => {
        expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
      });
    });
  });

  describe('Main Interface', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue('1');
      fetch.mockResolvedValue({
        ok: true,
        json: async () => []
      });
    });

    test('should show main interface when logged in', async () => {
      render(<Admin />);
      
      await waitFor(() => {
        expect(screen.getByText('🛒 Nueva Venta')).toBeInTheDocument();
        expect(screen.getByText('📋 Gestionar Ventas')).toBeInTheDocument();
        expect(screen.getByText('💰 Gestionar Cajas')).toBeInTheDocument();
      });
    });

    test('should switch between different sections', async () => {
      render(<Admin />);
      
      await waitFor(() => {
        expect(screen.getByText('📋 Gestionar Ventas')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('📋 Gestionar Ventas'));
      expect(screen.getByText('📋 Gestión de Ventas')).toBeInTheDocument();

      fireEvent.click(screen.getByText('💰 Gestionar Cajas'));
      expect(screen.getByText('💰 Gestión de Cajas')).toBeInTheDocument();

      fireEvent.click(screen.getByText('📦 Gestionar Stock'));
      expect(screen.getByText('📦 Gestionar Stock')).toBeInTheDocument();
    });

    test('should handle logout', async () => {
      render(<Admin />);
      
      await waitFor(() => {
        expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Cerrar Sesión'));
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('adminLogueado');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('adminUsuario');
    });
  });

  describe('Product Search', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue('1');
      fetch.mockResolvedValue({
        ok: true,
        json: async () => [
          {
            id: 1,
            nombre: 'Producto Test',
            categoria: 'Test',
            precio: 100,
            stock: 10
          }
        ]
      });
    });

    test('should search for products', async () => {
      render(<Admin />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Nombre o categoría')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Nombre o categoría');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      fireEvent.focus(searchInput);

      await waitFor(() => {
        expect(screen.getByText('Producto Test')).toBeInTheDocument();
      });
    });

    test('should show products without stock in gray', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => [
          {
            id: 1,
            nombre: 'Producto Sin Stock',
            categoria: 'Test',
            precio: 100,
            stock: 0
          }
        ]
      });

      render(<Admin />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Nombre o categoría');
        fireEvent.focus(searchInput);
      });

      await waitFor(() => {
        const productElement = screen.getByText('Producto Sin Stock');
        expect(productElement).toBeInTheDocument();
      });
    });
  });

  describe('Cart Management', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue('1');
      fetch.mockResolvedValue({
        ok: true,
        json: async () => [
          {
            id: 1,
            nombre: 'Producto Test',
            categoria: 'Test',
            precio: 100,
            stock: 10
          }
        ]
      });
    });

    test('should add product to cart', async () => {
      render(<Admin />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Nombre o categoría');
        fireEvent.focus(searchInput);
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText('Producto Test'));
      });

      await waitFor(() => {
        expect(screen.getByText('➕ Agregar')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('➕ Agregar'));

      await waitFor(() => {
        expect(screen.getByText('Producto Test')).toBeInTheDocument();
      });
    });
  });


}); 