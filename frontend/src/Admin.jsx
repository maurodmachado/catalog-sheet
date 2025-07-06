import { useState, useEffect, useRef } from 'react';

export default function Admin() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [logueado, setLogueado] = useState(false);
  const [error, setError] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  // --- Estados para la interfaz de ventas ---
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState('1');
  const [carrito, setCarrito] = useState([]);
  const [formaPago, setFormaPago] = useState({ efectivo: '', transferencia: '', pos: '' });
  const [cliente, setCliente] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [errorProductos, setErrorProductos] = useState('');
  const [errorPago, setErrorPago] = useState('');
  const [loadingVenta, setLoadingVenta] = useState(false);

  // --- Estados para caja ---
  const [caja, setCaja] = useState(null);
  const [loadingCaja, setLoadingCaja] = useState(false);
  const [turno, setTurno] = useState('Mañana');
  const [empleadoCaja, setEmpleadoCaja] = useState('');
  const [errorCaja, setErrorCaja] = useState('');
  const [mensajeCaja, setMensajeCaja] = useState('');
  const [montoApertura, setMontoApertura] = useState('30000');
  const [montoCierre, setMontoCierre] = useState('30000');

  // --- Estados para gestión de ventas ---
  const [ventas, setVentas] = useState([]);
  const [loadingVentas, setLoadingVentas] = useState(false);
  const [errorVentas, setErrorVentas] = useState('');
  const [eliminandoVenta, setEliminandoVenta] = useState(null);
  const [mostrarGestionVentas, setMostrarGestionVentas] = useState(false);

  // --- Estados para gestión de cajas ---
  const [cajas, setCajas] = useState([]);
  const [loadingCajas, setLoadingCajas] = useState(false);
  const [errorCajas, setErrorCajas] = useState('');
  const [eliminandoCaja, setEliminandoCaja] = useState(null);
  const [mostrarGestionCajas, setMostrarGestionCajas] = useState(false);

  // --- Estados para gestión de stock ---
  const [productosStock, setProductosStock] = useState([]);
  const [productosBajoStock, setProductosBajoStock] = useState([]);
  const [loadingStock, setLoadingStock] = useState(false);
  const [errorStock, setErrorStock] = useState('');
  const [productoSeleccionadoStock, setProductoSeleccionadoStock] = useState(null);
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [cantidadAgregar, setCantidadAgregar] = useState('');
  const [editandoStock, setEditandoStock] = useState(false);
  const [busquedaStock, setBusquedaStock] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [ordenStock, setOrdenStock] = useState('asc');
  const [mostrarSinStock, setMostrarSinStock] = useState(true);
  const [mostrarGestionStock, setMostrarGestionStock] = useState(false);


  
  // --- Estados para edición masiva de precios ---
  const [mostrarEdicionMasiva, setMostrarEdicionMasiva] = useState(false);
  const [porcentajeMasivo, setPorcentajeMasivo] = useState('');
  const [editandoMasivamente, setEditandoMasivamente] = useState(false);
  const [alcanceEdicionMasiva, setAlcanceEdicionMasiva] = useState('filtrados'); // 'filtrados', 'todos'

  // --- Estados para reportes ---
  const [metricas, setMetricas] = useState(null);
  const [loadingMetricas, setLoadingMetricas] = useState(false);
  const [errorMetricas, setErrorMetricas] = useState('');
  const [mostrarReportes, setMostrarReportes] = useState(false);
  const [reporteVentas, setReporteVentas] = useState([]);
  const [loadingReporteVentas, setLoadingReporteVentas] = useState(false);
  const [productosVendidos, setProductosVendidos] = useState([]);
  const [loadingProductosVendidos, setLoadingProductosVendidos] = useState(false);
  
  // --- Estados para filtros de reportes ---
  const [filtroMes, setFiltroMes] = useState(String(new Date().getMonth() + 1)); // Mes actual (1-12)
  const [filtroAnio, setFiltroAnio] = useState(String(new Date().getFullYear())); // Año actual
  const [filtroEmpleado, setFiltroEmpleado] = useState('');



  // --- Estado para mostrar todos los productos ---
  const [mostrarTodosProductos, setMostrarTodosProductos] = useState(false);

  // --- Referencia para el contenedor de búsqueda ---
  const searchContainerRef = useRef(null);


  // --- Estados para notificaciones y modales ---
  const [notificacion, setNotificacion] = useState(null);
  const [modalConfirmacion, setModalConfirmacion] = useState(null);

  // --- Login persistente con localStorage ---
  useEffect(() => {
    if (localStorage.getItem('adminLogueado') === '1') {
      setLogueado(true);
    }
  }, []);



  const handleLogin = async (e) => {
    e.preventDefault();
    setLoadingLogin(true);
    try {
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setLogueado(true);
        setError('');
        localStorage.setItem('adminLogueado', '1');
        localStorage.setItem('adminUsuario', data.usuario);
      } else {
        setError(data.message || 'Usuario o contraseña incorrectos');
      }
    } catch (err) {
      setError('Error de conexión. Verifica que el servidor esté funcionando.');
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleLogout = () => {
    setLogueado(false);
    setUsuario('');
    setPassword('');
    localStorage.removeItem('adminLogueado');
    localStorage.removeItem('adminUsuario');
  };

  // --- Función de utilidad para peticiones con delay ---
  const fetchWithDelay = async (url, options = {}) => {
    // Agregar un pequeño delay para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!res.ok) {
      if (res.status === 429) {
        throw new Error('Demasiadas peticiones. Intenta de nuevo en unos segundos.');
      }
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    
    return res;
  };

  // --- Función para cargar productos desde la API ---
  const cargarProductos = async () => {
    setLoadingProductos(true);
    setErrorProductos('');
    try {
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';
      const res = await fetchWithDelay(`${API_URL}/productos`);
      const data = await res.json();
      setProductos(data);
    } catch (err) {
      setErrorProductos('No se pudieron cargar los productos');
    } finally {
      setLoadingProductos(false);
    }
  };

  // --- Cargar productos al iniciar sesión ---
  useEffect(() => {
    if (!logueado) return;
    cargarProductos();
  }, [logueado]);

  // --- Manejar clic fuera del dropdown de búsqueda ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setMostrarTodosProductos(false);
        setBusqueda('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // --- Calcular total ---
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
  const formatearPrecio = (precio) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(precio);
  const cantidadNum = Number(cantidad);
  const totalVenta = carrito.reduce((acc, p) => acc + (p.oferta && calcularPrecioOferta(p.precio, p.oferta) !== null ? calcularPrecioOferta(p.precio, p.oferta) : p.precio) * p.cantidad, 0);
  const totalPago = Number(formaPago.efectivo) + Number(formaPago.transferencia) + Number(formaPago.pos);

  // --- Funciones para notificaciones y modales ---
  const mostrarNotificacion = (mensaje, tipo = 'info') => {
    setNotificacion({ mensaje, tipo, id: Date.now() });
    setTimeout(() => setNotificacion(null), 4000);
  };

  const mostrarConfirmacion = (titulo, mensaje, onConfirm) => {
    setModalConfirmacion({ titulo, mensaje, onConfirm });
  };

  // --- Validar total de métodos de pago
  useEffect(() => {
    if (totalPago > totalVenta) {
      setErrorPago('El total de los métodos de pago no puede superar el total de la venta.');
    } else {
      setErrorPago('');
    }
  }, [totalPago, totalVenta]);

  // --- Agregar producto al carrito ---
  const agregarAlCarrito = () => {
    if (!productoSeleccionado || cantidad < 1) return;
    
    // Convertir cantidad a número para evitar concatenación
    const cantidadNum = Number(cantidad);
    
    // Validar stock
    const stock = productoSeleccionado.stock !== undefined && productoSeleccionado.stock !== '' && !isNaN(Number(productoSeleccionado.stock)) ? Number(productoSeleccionado.stock) : Infinity;
    if (stock <= 0) {
      mostrarNotificacion('No se puede agregar un producto sin stock', 'error');
      return;
    }
    if (cantidadNum > stock) {
      mostrarNotificacion('No hay suficiente stock disponible', 'error');
      return;
    }
    
    const existe = carrito.find(p => p.id === productoSeleccionado.id);
    if (existe) {
      // Asegurar que ambas cantidades sean números para sumar correctamente
      const cantidadExistente = Number(existe.cantidad);
      const nuevaCantidad = cantidadExistente + cantidadNum;
      
      if (nuevaCantidad > stock) {
        mostrarNotificacion('No hay suficiente stock disponible', 'error');
        return;
      }
      setCarrito(carrito.map(p => p.id === productoSeleccionado.id ? { ...p, cantidad: nuevaCantidad } : p));
      mostrarNotificacion(`✅ ${productoSeleccionado.nombre} actualizado en el carrito (${nuevaCantidad} unidades)`, 'success');
    } else {
      setCarrito([...carrito, { ...productoSeleccionado, cantidad: cantidadNum }]);
      mostrarNotificacion(`✅ ${productoSeleccionado.nombre} agregado al carrito (${cantidadNum} unidades)`, 'success');
    }
    setProductoSeleccionado(null);
    setCantidad('1');
  };

  // --- Quitar producto del carrito ---
  const quitarDelCarrito = (id) => {
    setCarrito(carrito.filter(p => p.id !== id));
  };

  const handleGenerarVenta = async () => {
    if (carrito.length === 0 || totalPago !== totalVenta || totalPago > totalVenta) return;
    
    console.log('=== GENERANDO VENTA ===');
    console.log('Carrito:', carrito);
    console.log('Total venta:', totalVenta);
    console.log('Forma de pago:', formaPago);
    
    setLoadingVenta(true);
    try {
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';
      const ventaData = {
        productos: carrito.map(p => p.nombre),
        cantidades: carrito.map(p => p.cantidad),
        total: totalVenta,
        efectivo: Number(formaPago.efectivo) || 0,
        transferencia: Number(formaPago.transferencia) || 0,
        pos: Number(formaPago.pos) || 0,
        cliente,
        observaciones
      };
      
      console.log('Enviando venta al servidor:', ventaData);
      
      const res = await fetchWithDelay(`${API_URL}/ventas`, {
        method: 'POST',
        body: JSON.stringify(ventaData)
      });
      
      console.log('Respuesta del servidor:', res.status, res.statusText);
      
      const result = await res.json();
      console.log('Venta registrada exitosamente:', result);
      
      // Mostrar notificación de éxito
      mostrarNotificacion('✅ Venta registrada correctamente', 'success');
      
      // Recargar productos para actualizar stock
      console.log('Recargando productos...');
      await cargarProductos();
      
      // Limpiar formulario
      setCarrito([]);
      setFormaPago({ efectivo: '', transferencia: '', pos: '' });
      setCliente('');
      setObservaciones('');
      
      // Recargar estado de caja
      console.log('Recargando estado de caja...');
      await cargarCaja();
      
      console.log('✅ Venta completada exitosamente');
    } catch (err) {
      console.error('❌ Error al registrar venta:', err);
      mostrarNotificacion(`❌ Error al registrar venta: ${err.message}`, 'error');
    } finally {
      setLoadingVenta(false);
    }
  };

  // Handlers para autocompletar el total en un método de pago
  const handlePagoClick = (metodo) => {
    setFormaPago({
      efectivo: metodo === 'efectivo' ? String(totalVenta) : '',
      transferencia: metodo === 'transferencia' ? String(totalVenta) : '',
      pos: metodo === 'pos' ? String(totalVenta) : ''
    });
  };

  // --- Consultar estado de caja al iniciar sesión y tras cada venta ---
  const cargarCaja = async () => {
    console.log('=== CARGANDO ESTADO DE CAJA ===');
    setLoadingCaja(true);
    try {
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';
      console.log('Consultando estado de caja en:', `${API_URL}/caja/estado`);
      
      const res = await fetchWithDelay(`${API_URL}/caja/estado`);
      console.log('Respuesta del servidor:', res.status, res.statusText);
      
      const data = await res.json();
      console.log('Estado de caja recibido:', data);
      
      setCaja(data);
      console.log('✅ Estado de caja actualizado en frontend');
    } catch (err) {
      console.error('❌ Error al cargar estado de caja:', err);
      setCaja(null);
    } finally {
      setLoadingCaja(false);
    }
  };

  useEffect(() => {
    if (!logueado) return;
    cargarCaja();
  }, [logueado]);

  // --- Abrir caja ---
  const handleAbrirCaja = async () => {
    if (!empleadoCaja) { setErrorCaja('Ingrese el nombre del empleado'); return; }
    if (!turno) { setErrorCaja('Seleccione el turno'); return; }
    if (!montoApertura || isNaN(Number(montoApertura))) { setErrorCaja('Ingrese un monto de apertura válido'); return; }
    setLoadingCaja(true); setErrorCaja(''); setMensajeCaja('');
    try {
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';
      const res = await fetch(`${API_URL}/caja/abrir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turno, empleado: empleadoCaja, montoApertura })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al abrir caja');
      }
              setMensajeCaja('🔓 Caja abierta');
      setEmpleadoCaja('');
      setCaja({ abierta: true, turno, empleado: empleadoCaja });
    } catch (err) {
      setErrorCaja(err.message || 'No se pudo abrir la caja');
    } finally {
      setLoadingCaja(false);
    }
  };

  // --- Cerrar caja ---
  const handleCerrarCaja = async () => {
    setLoadingCaja(true); setErrorCaja(''); setMensajeCaja('');
    try {
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';
      const res = await fetch(`${API_URL}/caja/cerrar`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ montoCierre: Number(montoCierre) || 30000 })
      });
      if (!res.ok) throw new Error('Error al cerrar caja');
              setMensajeCaja('🔒 Caja cerrada');
      setCaja({ abierta: false });
    } catch (err) {
      setErrorCaja('No se pudo cerrar la caja');
    } finally {
      setLoadingCaja(false);
    }
  };

  // --- Cargar empleados desde la API ---
  const [empleados, setEmpleados] = useState([]);
  useEffect(() => {
    if (!logueado) return;
    const cargarEmpleados = async () => {
      try {
        const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';
        const res = await fetchWithDelay(`${API_URL}/empleados`);
        const data = await res.json();
        // Asegurar que data sea un array
        if (Array.isArray(data)) {
          setEmpleados(data);
        } else {
          console.warn('Empleados no es un array:', data);
          setEmpleados([]);
        }
      } catch (err) {
        console.error('Error al cargar empleados:', err);
        setEmpleados([]);
      }
    };
    cargarEmpleados();
  }, [logueado]);

  // --- Funciones para gestión de ventas ---
  const cargarVentas = async () => {
    setLoadingVentas(true);
    setErrorVentas('');
    try {
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';
      const res = await fetchWithDelay(`${API_URL}/ventas?t=${Date.now()}`, {
        cache: 'no-cache'
      });
      const data = await res.json();
      console.log('Ventas cargadas:', data.length, 'ventas');
      console.log('Datos de ventas:', JSON.stringify(data, null, 2));
      setVentas(data);
    } catch (err) {
        console.log(err)
      console.error('Error completo al cargar ventas:', err);
      setErrorVentas(`No se pudieron cargar las ventas: ${err.message}`);
    } finally {
      setLoadingVentas(false);
    }
  };

  const eliminarVenta = async (idVenta) => {
    mostrarConfirmacion(
      'Eliminar Venta',
      '¿Estás seguro de que quieres eliminar esta venta? Esta acción no se puede deshacer.',
      async () => {
        setEliminandoVenta(idVenta);
        try {
          const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';
          const res = await fetch(`${API_URL}/ventas/${idVenta}`, {
            method: 'DELETE'
          });
          
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
            console.error('Error al eliminar venta:', res.status, errorData);
            throw new Error(errorData.error || `Error ${res.status} al eliminar venta`);
          }
          
          const result = await res.json();
          console.log('Venta eliminada exitosamente:', result);
          mostrarNotificacion(`✅ Venta eliminada correctamente. Total eliminado: $${result.totalEliminado}`, 'success');
          
          // Recargar ventas, productos (para actualizar stock) y caja
          if (mostrarGestionVentas) {
            console.log('Recargando ventas después de eliminar...');
            await cargarVentas();
          }
          await cargarProductos(); // Actualizar stock después de eliminar venta
          await cargarCaja();
        } catch (err) {
          console.error('Error completo al eliminar venta:', err);
          mostrarNotificacion(`❌ Error: ${err.message}`, 'error');
        } finally {
          setEliminandoVenta(null);
        }
      }
    );
  };

  useEffect(() => {
    if (mostrarGestionVentas) {
      cargarVentas();
    }
    // eslint-disable-next-line
  }, [mostrarGestionVentas]);

  // --- Funciones para gestión de cajas ---
  const cargarCajas = async () => {
    setLoadingCajas(true);
    setErrorCajas('');
    try {
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';
      const res = await fetch(`${API_URL}/cajas?t=${Date.now()}`, {
        cache: 'no-cache'
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error al cargar cajas:', res.status, errorText);
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      const data = await res.json();
      console.log('Cajas cargadas:', data.length, 'cajas');
      setCajas(data);
    } catch (err) {
      console.error('Error completo al cargar cajas:', err);
      setErrorCajas(`No se pudieron cargar las cajas: ${err.message}`);
    } finally {
      setLoadingCajas(false);
    }
  };

  const eliminarCaja = async (idCaja) => {
    mostrarConfirmacion(
      'Eliminar Caja',
      '¿Estás seguro de que quieres eliminar esta caja? Esta acción no se puede deshacer.',
      async () => {
        setEliminandoCaja(idCaja);
        try {
          const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';
          const res = await fetch(`${API_URL}/cajas/${idCaja}`, {
            method: 'DELETE'
          });
          
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
            console.error('Error al eliminar caja:', res.status, errorData);
            throw new Error(errorData.error || `Error ${res.status} al eliminar caja`);
          }
          
          const result = await res.json();
          console.log('Caja eliminada exitosamente:', result);
          mostrarNotificacion(`✅ Caja eliminada correctamente. Total: $${result.cajaEliminada.total}`, 'success');
          
          // Recargar cajas
          if (mostrarGestionCajas) {
            console.log('Recargando cajas después de eliminar...');
            await cargarCajas();
          }
        } catch (err) {
          console.error('Error completo al eliminar caja:', err);
          mostrarNotificacion(`❌ Error: ${err.message}`, 'error');
        } finally {
          setEliminandoCaja(null);
        }
      }
    );
  };

  useEffect(() => {
    if (mostrarGestionCajas) {
      cargarCajas();
    }
    // eslint-disable-next-line
  }, [mostrarGestionCajas]);

  // --- Funciones para reportes ---
  const cargarMetricas = async () => {
    setLoadingMetricas(true);
    setErrorMetricas('');
    try {
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';
      
      // Construir parámetros de filtro
      const params = new URLSearchParams();
      if (filtroMes) params.append('mes', filtroMes);
      if (filtroAnio) params.append('anio', filtroAnio);
      if (filtroEmpleado) params.append('empleado', filtroEmpleado);
      
      const res = await fetch(`${API_URL}/reportes/metricas?${params.toString()}`);
      if (!res.ok) throw new Error('Error al cargar métricas');
      const data = await res.json();
      setMetricas(data);
    } catch (err) {
      setErrorMetricas('No se pudieron cargar las métricas');
    } finally {
      setLoadingMetricas(false);
    }
  };

  const cargarReporteVentas = async () => {
    setLoadingReporteVentas(true);
    try {
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';
      const res = await fetch(`${API_URL}/reportes/ventas`);
      if (!res.ok) throw new Error('Error al cargar reporte de ventas');
      const data = await res.json();
      setReporteVentas(data);
    } catch (err) {
      mostrarNotificacion('❌ Error al cargar reporte de ventas', 'error');
    } finally {
      setLoadingReporteVentas(false);
    }
  };

  const cargarProductosVendidos = async () => {
    setLoadingProductosVendidos(true);
    setErrorProductosVendidos('');
    try {
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';
      const res = await fetch(`${API_URL}/reportes/productos-vendidos?t=${Date.now()}`, {
        cache: 'no-cache'
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error al cargar productos vendidos:', res.status, errorText);
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      const data = await res.json();
      console.log('Productos vendidos cargados:', data.length, 'productos');
      setProductosVendidos(data);
    } catch (err) {
      console.error('Error completo al cargar productos vendidos:', err);
      setErrorProductosVendidos(`No se pudieron cargar los productos vendidos: ${err.message}`);
    } finally {
      setLoadingProductosVendidos(false);
    }
  };

  // --- Funciones para gestión de stock ---
  const cargarStock = async () => {
    console.log('=== CARGANDO PRODUCTOS DE STOCK ===');
    setLoadingStock(true);
    setErrorStock('');
    try {
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';
      const res = await fetchWithDelay(`${API_URL}/stock?t=${Date.now()}`, {
        cache: 'no-cache'
      });
      
      const data = await res.json();
      console.log('Productos de stock cargados:', data.length, 'productos');
      console.log('Datos actualizados:', data.map(p => ({ id: p.id, nombre: p.nombre, precio: p.precio })));
      
      // Forzar actualización del estado
      setProductosStock(data);
      
      // También cargar productos con bajo stock
      await cargarProductosBajoStock();
    } catch (err) {
      console.error('Error completo al cargar stock:', err);
      setErrorStock(`No se pudieron cargar los productos de stock: ${err.message}`);
    } finally {
      setLoadingStock(false);
    }
  };

  const cargarProductosBajoStock = async () => {
    try {
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';
      const res = await fetchWithDelay(`${API_URL}/stock/bajo-stock?t=${Date.now()}`, {
        cache: 'no-cache'
      });
      
      const data = await res.json();
      console.log('Productos con bajo stock:', data.length, 'productos');
      setProductosBajoStock(data);
    } catch (err) {
      console.error('Error al cargar productos con bajo stock:', err);
    }
  };

  const seleccionarProductoStock = (producto) => {
    console.log('Producto seleccionado para edición:', producto);
    setProductoSeleccionadoStock(producto);
    setNuevoPrecio(String(producto.precio));
    setNuevaCategoria(producto.categoria);
    setNuevaDescripcion(producto.descripcion);
    setCantidadAgregar('');
    setEditandoStock(false);
  };

  const actualizarProductoStock = async () => {
    if (!productoSeleccionadoStock) return;
    
    console.log('=== ACTUALIZANDO PRODUCTO DE STOCK ===');
    setEditandoStock(true);
    
    try {
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';
      const updateData = {};
      
      if (nuevoPrecio !== String(productoSeleccionadoStock.precio)) {
        updateData.precio = Number(nuevoPrecio);
      }
      if (nuevaCategoria !== productoSeleccionadoStock.categoria) {
        updateData.categoria = nuevaCategoria;
      }
      if (nuevaDescripcion !== productoSeleccionadoStock.descripcion) {
        updateData.descripcion = nuevaDescripcion;
      }
      
      if (Object.keys(updateData).length === 0) {
        mostrarNotificacion('No hay cambios para guardar', 'info');
        return;
      }
      
      console.log('Datos a actualizar:', updateData);
      
      // Actualizar producto - usar el index correcto (producto.id - 1)
      const res = await fetch(`${API_URL}/stock/${productoSeleccionadoStock.id - 1}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || `Error ${res.status}`);
      }
      
      const result = await res.json();
      console.log('Producto actualizado exitosamente:', result);
      mostrarNotificacion('✅ Producto actualizado correctamente', 'success');
      
      // Recargar stock
      await cargarStock();
      
      // Limpiar formulario
      setProductoSeleccionadoStock(null);
      setNuevoPrecio('');
      setNuevaCategoria('');
      setNuevaDescripcion('');
    } catch (err) {
      console.error('Error al actualizar producto:', err);
      mostrarNotificacion(`❌ Error: ${err.message}`, 'error');
    } finally {
      setEditandoStock(false);
    }
  };

  const agregarStock = async () => {
    if (!productoSeleccionadoStock || !cantidadAgregar || cantidadAgregar <= 0) {
      mostrarNotificacion('Por favor ingresa una cantidad válida', 'error');
      return;
    }

    setEditandoStock(true);
    try {
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';
      const res = await fetch(`${API_URL}/stock/${productoSeleccionadoStock.id - 1}/agregar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad: Number(cantidadAgregar) })
      });
      
      const data = await res.json();
      
      if (data.ok) {
        mostrarNotificacion(`✅ ${data.message}`, 'success');
        setCantidadAgregar('');
        setProductoSeleccionadoStock(null);
        cargarStock();
        cargarProductosBajoStock();
      } else {
        mostrarNotificacion(data.error || 'Error al agregar stock', 'error');
      }
    } catch (err) {
      mostrarNotificacion('Error de conexión', 'error');
    } finally {
      setEditandoStock(false);
    }
  };

  // --- Funciones para filtrar y ordenar productos de stock ---
  const obtenerProductosFiltrados = () => {
    let productosFiltrados = [...productosStock];
    
    // Filtrar por búsqueda
    if (busquedaStock) {
      productosFiltrados = productosFiltrados.filter(producto =>
        producto.nombre.toLowerCase().includes(busquedaStock.toLowerCase()) ||
        producto.categoria.toLowerCase().includes(busquedaStock.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(busquedaStock.toLowerCase())
      );
    }
    
    // Filtrar por categoría
    if (categoriaFiltro) {
      productosFiltrados = productosFiltrados.filter(producto =>
        producto.categoria === categoriaFiltro
      );
    }
    
    // Filtrar por stock (mostrar/ocultar productos sin stock)
    if (!mostrarSinStock) {
      productosFiltrados = productosFiltrados.filter(producto => 
        producto.stock > 0
      );
    }
    
    // Ordenar por stock
    productosFiltrados.sort((a, b) => {
      if (ordenStock === 'asc') {
        return a.stock - b.stock;
      } else {
        return b.stock - a.stock;
      }
    });
    
    return productosFiltrados;
  };

  const obtenerCategoriasUnicas = () => {
    const categorias = productosStock.map(p => p.categoria).filter(Boolean);
    return [...new Set(categorias)].sort();
  };

  // --- Función para redondeo inteligente de precios ---
  const redondearPrecioInteligente = (precio) => {
    // Si el precio es menor a 1000, redondear a múltiplos de 100
    if (precio < 1000) {
      return Math.round(precio / 100) * 100;
    }
    
    // Si el precio es mayor o igual a 1000, redondear a múltiplos de 100
    // pero con lógica especial para números como 1996 -> 2000, 1945 -> 1900
    const centenas = Math.floor(precio / 100);
    const decenas = Math.floor((precio % 100) / 10);
    const unidades = precio % 10;
    
    // Si las decenas son 9 y las unidades son 5 o más, subir a la siguiente centena
    if (decenas === 9 && unidades >= 5) {
      return (centenas + 1) * 100;
    }
    
    // Si las decenas son 4 y las unidades son 5 o más, subir a la siguiente centena
    if (decenas === 4 && unidades >= 5) {
      return (centenas + 1) * 100;
    }
    
    // En otros casos, redondear a la centena más cercana
    return Math.round(precio / 100) * 100;
  };

  // --- Función para obtener productos según alcance de edición masiva ---
  const obtenerProductosParaEdicionMasiva = () => {
    let productos = [...productosStock];
    
    // Aplicar filtros según el alcance
    switch (alcanceEdicionMasiva) {
      case 'filtrados':
        // Aplicar filtros de búsqueda y categoría del panel
        if (busquedaStock) {
          productos = productos.filter(producto =>
            producto.nombre.toLowerCase().includes(busquedaStock.toLowerCase()) ||
            producto.categoria.toLowerCase().includes(busquedaStock.toLowerCase()) ||
            producto.descripcion.toLowerCase().includes(busquedaStock.toLowerCase())
          );
        }
        if (categoriaFiltro) {
          productos = productos.filter(producto => producto.categoria === categoriaFiltro);
        }
        break;
      case 'todos':
        // Usar todos los productos sin filtros
        break;
      default:
        // Por defecto usar productos filtrados
        if (busquedaStock) {
          productos = productos.filter(producto =>
            producto.nombre.toLowerCase().includes(busquedaStock.toLowerCase()) ||
            producto.categoria.toLowerCase().includes(busquedaStock.toLowerCase()) ||
            producto.descripcion.toLowerCase().includes(busquedaStock.toLowerCase())
          );
        }
        if (categoriaFiltro) {
          productos = productos.filter(producto => producto.categoria === categoriaFiltro);
        }
        break;
    }
    
    // Ordenar por ID para mantener orden consistente
    productos.sort((a, b) => a.id - b.id);
    
    return productos;
  };

  // --- Función para edición masiva de precios ---
  const aplicarEdicionMasiva = async () => {
    if (!porcentajeMasivo || porcentajeMasivo === '0') {
      mostrarNotificacion('Por favor ingresa un porcentaje válido', 'error');
      return;
    }

    const porcentaje = parseFloat(porcentajeMasivo);
    if (isNaN(porcentaje)) {
      mostrarNotificacion('Por favor ingresa un porcentaje válido', 'error');
      return;
    }

    setEditandoMasivamente(true);
    try {
      const productosAActualizar = obtenerProductosParaEdicionMasiva();

      console.log(`📋 Productos a actualizar: ${productosAActualizar.length}`);
      productosAActualizar.forEach((p, index) => {
        console.log(`  ${index + 1}. ID: ${p.id}, Nombre: ${p.nombre}, Precio: ${p.precio}`);
      });

      if (productosAActualizar.length === 0) {
        mostrarNotificacion('No hay productos para actualizar con los criterios seleccionados', 'error');
        setEditandoMasivamente(false);
        return;
      }

      let actualizados = 0;
      let errores = 0;

      for (const producto of productosAActualizar) {
        try {
          // Calcular nuevo precio con porcentaje
          const nuevoPrecio = producto.precio * (1 + porcentaje / 100);
          
          // Aplicar redondeo inteligente
          const precioRedondeado = redondearPrecioInteligente(nuevoPrecio);
          
          console.log(`🔄 Actualizando producto ${producto.id} (${producto.nombre}): ${producto.precio} → ${precioRedondeado}`);
          console.log(`📊 Datos del producto: ID=${producto.id}, Fila=${producto.fila}, Index=${producto.id - 1}`);
          
          // Actualizar producto - usar el index correcto (producto.id - 1)
          const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';
          console.log(`🌐 URL de la petición: ${API_URL}/stock/${producto.id - 1}`);
          
          const res = await fetch(`${API_URL}/stock/${producto.id - 1}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ precio: precioRedondeado })
          });
          
          if (res.ok) {
            actualizados++;
            console.log(`✅ Producto ${producto.id} actualizado exitosamente`);
          } else {
            errores++;
            console.log(`❌ Error actualizando producto ${producto.id}: ${res.status}`);
          }
          
          // Agregar delay entre peticiones para evitar rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (err) {
          errores++;
          console.log(`❌ Error en producto ${producto.id}:`, err);
        }
      }

      // Mostrar resultado
      if (actualizados > 0) {
        const alcanceTexto = alcanceEdicionMasiva === 'todos' ? 'todos los productos' : 'productos filtrados';
        mostrarNotificacion(`✅ ${actualizados} productos actualizados (${alcanceTexto})${errores > 0 ? `, ${errores} errores` : ''}`, 'success');
        setPorcentajeMasivo('');
        setMostrarEdicionMasiva(false);
        
        // Pequeña pausa para asegurar que el backend termine de procesar
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Forzar recarga completa de stock
        console.log('🔄 Recargando stock después de edición masiva...');
        await cargarStock();
        await cargarProductosBajoStock();
        console.log('✅ Stock recargado exitosamente');
        
        // Forzar re-render del componente con un delay adicional
        setTimeout(() => {
          setProductosStock(prevStock => [...prevStock]);
          console.log('🔄 Forzando actualización visual de productos...');
          
          // Mostrar notificación de éxito
          mostrarNotificacion(`✅ Edición masiva completada: ${actualizados} productos actualizados con ${porcentaje}% de cambio`, 'exito');
        }, 300);
      } else {
        mostrarNotificacion('❌ No se pudo actualizar ningún producto', 'error');
      }
    } catch (err) {
      mostrarNotificacion('Error de conexión', 'error');
    } finally {
      setEditandoMasivamente(false);
    }
  };

  useEffect(() => {
    if (mostrarGestionStock) {
      cargarStock();
    }
  }, [mostrarGestionStock]);

  // Cargar reportes cuando se muestra la vista
  useEffect(() => {
    if (mostrarReportes) {
      cargarMetricas();
      cargarReporteVentas();
      cargarProductosVendidos();
    }
  }, [mostrarReportes]);

  // Recargar métricas cuando cambian los filtros
  useEffect(() => {
    if (mostrarReportes) {
      cargarMetricas();
    }
  }, [filtroMes, filtroAnio, filtroEmpleado]);

  // --- Render ---
  if (!logueado) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <form onSubmit={handleLogin} style={{ background: 'white', padding: '2.5rem 2rem', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', minWidth: 320 }}>
          <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#1e293b' }}>ALNORTEGROW</h2>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: 6, color: '#64748b', fontWeight: 600 }}>Usuario</label>
            <input type="text" value={usuario} onChange={e => setUsuario(e.target.value)} autoFocus required style={{ width: '100%', padding: '0.7rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '1rem' }} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: 6, color: '#64748b', fontWeight: 600 }}>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '0.7rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '1rem' }} />
          </div>
          {error && <div style={{ color: '#dc2626', marginBottom: 12, textAlign: 'center', fontWeight: 600 }}>{error}</div>}
          <button type="submit" disabled={loadingLogin} style={{ width: '100%', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#1e293b', border: 'none', padding: '0.9rem', borderRadius: 10, fontSize: '1.1rem', fontWeight: 700, cursor: loadingLogin ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(251,191,36,0.10)', opacity: loadingLogin ? 0.7 : 1 }}>
            {loadingLogin ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', marginBottom: 24 }}>
        {/* Usuario logueado y botón salir */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '0.7rem 1.5rem', marginBottom: 16 }}>
          <span style={{ fontWeight: 700, color: '#1e293b', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span role="img" aria-label="usuario">👤</span> {localStorage.getItem('adminUsuario') || usuario || 'Admin'}
          </span>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, fontSize: 16, cursor: 'pointer', padding: '0.3rem 1rem', borderRadius: 8, transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='#fee2e2'} onMouseOut={e => e.currentTarget.style.background='none'}>
            Salir
          </button>
        </div>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        maxWidth: 1200,
        margin: '0 auto',
        gap: 32,
        alignItems: 'flex-start',
        position: 'relative',
        flexWrap: 'wrap',
      }}>
        {/* Panel de caja flotante a la izquierda */}
        <div style={{
          minWidth: 320,
          maxWidth: 340,
          background: 'white',
          borderRadius: 16,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          padding: '2rem 1.5rem',
          position: 'sticky',
          top: 32,
          flex: '0 0 340px',
          zIndex: 2,
          marginBottom: 32,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h2 style={{ color: '#1e293b', fontWeight: 800, marginBottom: 0 }}>Panel de Caja</h2>
          </div>
          {/* Resumen de caja */}
          <div style={{ background: '#f8fafc', borderRadius: 12, padding: '1rem 1.2rem', marginBottom: 18, border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, color: '#64748b', marginBottom: 4 }}>Monto inicial caja:</div>
            <div style={{ fontWeight: 800, color: '#1e293b', fontSize: 18, marginBottom: 10 }}>$ {caja && caja.montoApertura ? caja.montoApertura : '30000'}</div>
            <div style={{ fontWeight: 700, color: '#64748b', marginBottom: 4 }}>Total Efectivo ganado:</div>
            <div style={{ fontWeight: 800, color: '#059669', fontSize: 18, marginBottom: 8 }}>$ {caja && caja.totales ? caja.totales.efectivo : 0}</div>
            <div style={{ fontWeight: 700, color: '#64748b', marginBottom: 4 }}>Total Transferencia ganado:</div>
            <div style={{ fontWeight: 800, color: '#0ea5e9', fontSize: 18, marginBottom: 8 }}>$ {caja && caja.totales ? caja.totales.transferencia : 0}</div>
            <div style={{ fontWeight: 700, color: '#64748b', marginBottom: 4 }}>Total POS ganado:</div>
            <div style={{ fontWeight: 800, color: '#f59e0b', fontSize: 18, marginBottom: 8 }}>$ {caja && caja.totales ? caja.totales.pos : 0}</div>
            <div style={{ fontWeight: 700, color: '#64748b', marginBottom: 4 }}>Total vendido:</div>
            <div style={{ fontWeight: 800, color: '#1e293b', fontSize: 18 }}>$ {caja && caja.totalVendido ? caja.totalVendido : 0}</div>
          </div>
          {/* Estado de caja y controles */}
          {loadingCaja ? <div style={{ color: '#64748b', marginBottom: 16 }}>Cargando estado de caja...</div> : (
            caja && caja.abierta ? (
              <div style={{ marginBottom: 24 }}>
                <div style={{ color: '#059669', fontWeight: 700, marginBottom: 8 }}>🔓 Caja abierta ({caja.turno}, {caja.empleado})</div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>Monto cierre:</span>
                  <input type="text" value={montoCierre} onChange={e => { if (/^\d*$/.test(e.target.value)) setMontoCierre(e.target.value); }} style={{ padding: '0.7rem 1rem', borderRadius: 8, border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '1rem', width: 120 }} />
                  <button onClick={handleCerrarCaja} style={{ background: 'linear-gradient(135deg, #ef4444, #f87171)', color: '#fff', border: 'none', padding: '0.7rem 1.2rem', borderRadius: 10, fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginBottom: 8 }}>🔒 Cerrar caja</button>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: 24 }}>
                <div style={{ color: '#64748b', fontWeight: 600, marginBottom: 8 }}>🔒 Caja cerrada</div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 220 }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', width: 120, textAlign: 'left' }}>🕣 Turno</span>
                    <select value={turno} onChange={e => setTurno(e.target.value)} style={{ padding: '0.7rem 1rem', borderRadius: 8, border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '1rem', width: 145, height: '2.8rem', textAlign: 'center'}}>
                      <option value="Mañana">Mañana</option>
                      <option value="Tarde">Tarde</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 220 }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', width: 120, textAlign: 'left' }}>👤 Empleado</span>
                    <select value={empleadoCaja} onChange={e => setEmpleadoCaja(e.target.value)} style={{ padding: '0.7rem 1rem', borderRadius: 8, border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '1rem', width: 145, height: '2.8rem', textAlign: 'center' }}>
                      <option value="">Seleccionar</option>
                      {empleados.map(emp => <option key={emp} value={emp}>{emp}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 220 }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', width: 120, textAlign: 'left' }}>💵 Monto inicial</span>
                    <input type="text" value={montoApertura} onChange={e => { if (/^\d*$/.test(e.target.value)) setMontoApertura(e.target.value); }} style={{ padding: '0.7rem 1rem', borderRadius: 8, border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '1rem', width: 145, height: '2.8rem', textAlign:'center' }} />
                  </div>
                  <button onClick={handleAbrirCaja} style={{ background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff', border: 'none', padding: '0.7rem 1.2rem', borderRadius: 10, fontWeight: 700, fontSize: '1rem', cursor: 'pointer', height: '2.8rem' }}>🔓 Abrir caja</button>
                </div>
              </div>
            )
          )}
          {errorCaja && <div style={{ color: '#dc2626', fontWeight: 600, marginBottom: 8 }}>{errorCaja}</div>}
                          {mensajeCaja && <div style={{ color: mensajeCaja.startsWith('🔓') ? '#059669' : mensajeCaja.startsWith('🔒') ? '#64748b' : '#dc2626', fontWeight: 700, marginBottom: 12 }}>{mensajeCaja}</div>}
        </div>
        {/* Sección de ventas a la derecha */}
        <div style={{
          flex: 1,
          minWidth: 340,
          background: 'white',
          borderRadius: 16,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          padding: '2.5rem 2rem',
        }}>
          {/* Botones de navegación */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            <button 
              onClick={() => { setMostrarGestionVentas(false); setMostrarGestionCajas(false); setMostrarReportes(false); setMostrarGestionStock(false); }}
              style={{ 
                background: (!mostrarGestionVentas && !mostrarGestionCajas && !mostrarReportes && !mostrarGestionStock) ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : '#f1f5f9', 
                color: (!mostrarGestionVentas && !mostrarGestionCajas && !mostrarReportes && !mostrarGestionStock) ? '#1e293b' : '#64748b',
                border: 'none', 
                padding: '0.7rem 1.2rem', 
                borderRadius: 10, 
                fontWeight: 700, 
                fontSize: '1rem', 
                cursor: 'pointer' 
              }}
            >
              🛒 Nueva Venta
            </button>
            <button 
              onClick={() => { setMostrarGestionVentas(true); setMostrarGestionCajas(false); setMostrarReportes(false); setMostrarGestionStock(false); }}
              style={{ 
                background: mostrarGestionVentas ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : '#f1f5f9', 
                color: mostrarGestionVentas ? '#1e293b' : '#64748b',
                border: 'none', 
                padding: '0.7rem 1.2rem', 
                borderRadius: 10, 
                fontWeight: 700, 
                fontSize: '1rem', 
                cursor: 'pointer' 
              }}
            >
              📋 Gestionar Ventas
            </button>
            <button 
              onClick={() => { setMostrarGestionVentas(false); setMostrarGestionCajas(true); setMostrarReportes(false); setMostrarGestionStock(false); }}
              style={{ 
                background: mostrarGestionCajas ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : '#f1f5f9', 
                color: mostrarGestionCajas ? '#1e293b' : '#64748b',
                border: 'none', 
                padding: '0.7rem 1.2rem', 
                borderRadius: 10, 
                fontWeight: 700, 
                fontSize: '1rem', 
                cursor: 'pointer' 
              }}
            >
              💰 Gestionar Cajas
            </button>
            <button 
              onClick={() => { setMostrarGestionVentas(false); setMostrarGestionCajas(false); setMostrarReportes(false); setMostrarGestionStock(true); }}
              style={{ 
                background: mostrarGestionStock ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : '#f1f5f9', 
                color: mostrarGestionStock ? '#1e293b' : '#64748b',
                border: 'none', 
                padding: '0.7rem 1.2rem', 
                borderRadius: 10, 
                fontWeight: 700, 
                fontSize: '1rem', 
                cursor: 'pointer' 
              }}
            >
              📦 Gestionar Stock
            </button>
            <button 
              onClick={() => { setMostrarGestionVentas(false); setMostrarGestionCajas(false); setMostrarReportes(true); setMostrarGestionStock(false); }}
              style={{ 
                background: mostrarReportes ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : '#f1f5f9', 
                color: mostrarReportes ? '#1e293b' : '#64748b',
                border: 'none', 
                padding: '0.7rem 1.2rem', 
                borderRadius: 10, 
                fontWeight: 700, 
                fontSize: '1rem', 
                cursor: 'pointer' 
              }}
            >
              📊 Reportes
            </button>
          </div>

          {mostrarGestionVentas ? (
            // Vista de gestión de ventas
            <div>
              <h2 style={{ color: '#1e293b', fontWeight: 800, marginBottom: 24 }}>📋 Gestión de Ventas</h2>
              
              {loadingVentas ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Cargando ventas...</div>
              ) : errorVentas ? (
                <div style={{ color: '#dc2626', textAlign: 'center', padding: '2rem' }}>{errorVentas}</div>
              ) : ventas.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No hay ventas registradas</div>
              ) : (
                <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  {ventas.map((venta, index) => (
                    <div key={venta.id} style={{ 
                      border: '1px solid #e2e8f0', 
                      borderRadius: 12, 
                      padding: '1.5rem', 
                      marginBottom: 16,
                      background: '#f8fafc'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 18, color: '#1e293b', marginBottom: 4 }}>
                            Venta #{index + 1} - ID: {venta.id}
                          </div>
                          <div style={{ color: '#64748b', fontSize: 14 }}>
                            {venta.fecha} {venta.hora}
                          </div>
                          {venta.vendedor && (
                            <div style={{ color: '#059669', fontSize: 14, fontWeight: 600, marginTop: 4 }}>
                              👤 Vendedor: {venta.vendedor}
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 800, fontSize: 20, color: '#059669', marginBottom: 4 }}>
                            ${venta.total.toFixed(2)}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>
                            {venta.productos.length} producto{venta.productos.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      
                      {/* Productos */}
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Productos:</div>
                        {venta.productos.map((producto, idx) => (
                          <div key={idx} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            padding: '0.5rem 0',
                            borderBottom: idx < venta.productos.length - 1 ? '1px solid #e2e8f0' : 'none'
                          }}>
                            <span>{producto.nombre} x{producto.cantidad}</span>
                            <span style={{ fontWeight: 600 }}>${typeof producto.subtotal === "number" ? producto.subtotal.toFixed(2) : Number(producto.subtotal || 0).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Métodos de pago */}
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Métodos de pago:</div>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                          {venta.efectivo > 0 && (
                            <span style={{ background: '#dcfce7', color: '#166534', padding: '0.3rem 0.8rem', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                              Efectivo: ${venta.efectivo.toFixed(2)}
                            </span>
                          )}
                          {venta.transferencia > 0 && (
                            <span style={{ background: '#dbeafe', color: '#1e40af', padding: '0.3rem 0.8rem', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                              Transferencia: ${venta.transferencia.toFixed(2)}
                            </span>
                          )}
                          {venta.pos > 0 && (
                            <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.3rem 0.8rem', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                              POS: ${venta.pos.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Observaciones */}
                      {venta.observaciones && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Observaciones:</div>
                          <div style={{ fontSize: 14, color: '#475569' }}>{venta.observaciones}</div>
                        </div>
                      )}
                      
                      {/* Botón eliminar */}
                      <div style={{ textAlign: 'right' }}>
                        <button 
                          onClick={() => eliminarVenta(venta.id)}
                          disabled={eliminandoVenta === venta.id}
                          style={{ 
                            background: eliminandoVenta === venta.id ? '#f1f5f9' : 'linear-gradient(135deg, #ef4444, #f87171)', 
                            color: eliminandoVenta === venta.id ? '#64748b' : '#fff',
                            border: 'none', 
                            padding: '0.7rem 1.2rem', 
                            borderRadius: 10, 
                            fontWeight: 700, 
                            fontSize: '1rem', 
                            cursor: eliminandoVenta === venta.id ? 'not-allowed' : 'pointer' 
                          }}
                        >
                          {eliminandoVenta === venta.id ? 'Eliminando...' : '🗑️ Eliminar Venta'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : mostrarGestionCajas ? (
            // Vista de gestión de cajas
            <div>
              <h2 style={{ color: '#1e293b', fontWeight: 800, marginBottom: 24 }}>💰 Gestión de Cajas</h2>
              
              {loadingCajas ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Cargando cajas...</div>
              ) : errorCajas ? (
                <div style={{ color: '#dc2626', textAlign: 'center', padding: '2rem' }}>{errorCajas}</div>
              ) : cajas.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No hay cajas registradas</div>
              ) : (
                <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  {cajas.map((caja, index) => (
                    <div key={caja.id} style={{ 
                      border: '1px solid #e2e8f0', 
                      borderRadius: 12, 
                      padding: '1.5rem', 
                      marginBottom: 16,
                      background: '#f8fafc'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 18, color: '#1e293b', marginBottom: 4 }}>
                            Caja #{index + 1} - {caja.turno}
                          </div>
                          <div style={{ color: '#64748b', fontSize: 14 }}>
                            {caja.fechaApertura} {caja.horaApertura} - {caja.empleado}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 800, fontSize: 20, color: '#059669', marginBottom: 4 }}>
                            ${((caja.efectivo || 0) + (caja.transferencia || 0) + (caja.pos || 0)).toFixed(2)}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>
                            {caja.cantidadVentas || 0} venta{(caja.cantidadVentas || 0) !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      
                      {/* Detalles de la caja */}
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Detalles:</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                          <div>
                            <span style={{ fontWeight: 600, color: '#64748b' }}>Monto apertura:</span>
                            <span style={{ marginLeft: 8, fontWeight: 700 }}>${(caja.montoApertura || 0).toFixed(2)}</span>
                          </div>
                          <div>
                            <span style={{ fontWeight: 600, color: '#64748b' }}>Monto cierre:</span>
                            <span style={{ marginLeft: 8, fontWeight: 700 }}>${(caja.montoCierre || 0).toFixed(2)}</span>
                          </div>
                          <div>
                            <span style={{ fontWeight: 600, color: '#64748b' }}>Total vendido:</span>
                            <span style={{ marginLeft: 8, fontWeight: 700 }}>${((caja.efectivo || 0) + (caja.transferencia || 0) + (caja.pos || 0)).toFixed(2)}</span>
                          </div>
                          <div>
                            <span style={{ fontWeight: 600, color: '#64748b' }}>Productos vendidos:</span>
                            <span style={{ marginLeft: 8, fontWeight: 700 }}>{caja.cantidadProductos || 0}</span>
                          </div>
                          <div>
                            <span style={{ fontWeight: 600, color: '#64748b' }}>Cierre:</span>
                            <span style={{ marginLeft: 8, fontWeight: 700 }}>{caja.fechaCierre} {caja.horaCierre}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Métodos de pago */}
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Métodos de pago:</div>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                          {(caja.efectivo || 0) > 0 && (
                            <span style={{ background: '#dcfce7', color: '#166534', padding: '0.3rem 0.8rem', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                              Efectivo: ${(caja.efectivo || 0).toFixed(2)}
                            </span>
                          )}
                          {(caja.transferencia || 0) > 0 && (
                            <span style={{ background: '#dbeafe', color: '#1e40af', padding: '0.3rem 0.8rem', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                              Transferencia: ${(caja.transferencia || 0).toFixed(2)}
                            </span>
                          )}
                          {(caja.pos || 0) > 0 && (
                            <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.3rem 0.8rem', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                              POS: ${(caja.pos || 0).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Observaciones */}
                      {caja.observaciones && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Observaciones:</div>
                          <div style={{ fontSize: 14, color: '#475569' }}>{caja.observaciones}</div>
                        </div>
                      )}
                      
                      {/* Botón eliminar */}
                      <div style={{ textAlign: 'right' }}>
                        <button 
                          onClick={() => eliminarCaja(caja.id)}
                          disabled={eliminandoCaja === caja.id}
                          style={{ 
                            background: eliminandoCaja === caja.id ? '#f1f5f9' : 'linear-gradient(135deg, #ef4444, #f87171)', 
                            color: eliminandoCaja === caja.id ? '#64748b' : '#fff',
                            border: 'none', 
                            padding: '0.7rem 1.2rem', 
                            borderRadius: 10, 
                            fontWeight: 700, 
                            fontSize: '1rem', 
                            cursor: eliminandoCaja === caja.id ? 'not-allowed' : 'pointer' 
                          }}
                        >
                          {eliminandoCaja === caja.id ? 'Eliminando...' : '🗑️ Eliminar Caja'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : mostrarReportes ? (
            // Vista de reportes
            <div>
              <h2 style={{ color: '#1e293b', fontWeight: 800, marginBottom: 24 }}>📊 Panel de Reportes</h2>
              
              {/* Filtros de reportes */}
              <div style={{ 
                background: 'white', 
                border: '1px solid #e2e8f0', 
                borderRadius: 16, 
                padding: '1.5rem', 
                marginBottom: 32 
              }}>
                <h3 style={{ color: '#1e293b', fontWeight: 700, marginBottom: 16 }}>🔍 Filtros</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 16, alignItems: 'end' }}>
                  {/* Filtro por mes */}
                  <div>
                    <label style={{ fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>📅 Mes</label>
                    <select 
                      value={filtroMes} 
                      onChange={(e) => setFiltroMes(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '0.7rem', 
                        borderRadius: 8, 
                        border: '1px solid #cbd5e1', 
                        fontSize: '1rem',
                        background: 'white'
                      }}
                    >
                      <option value="">Todos</option>
                      <option value="1">Enero</option>
                      <option value="2">Febrero</option>
                      <option value="3">Marzo</option>
                      <option value="4">Abril</option>
                      <option value="5">Mayo</option>
                      <option value="6">Junio</option>
                      <option value="7">Julio</option>
                      <option value="8">Agosto</option>
                      <option value="9">Septiembre</option>
                      <option value="10">Octubre</option>
                      <option value="11">Noviembre</option>
                      <option value="12">Diciembre</option>
                    </select>
                  </div>
                  
                  {/* Filtro por año */}
                  <div>
                    <label style={{ fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>📅 Año</label>
                    <select 
                      value={filtroAnio} 
                      onChange={(e) => setFiltroAnio(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '0.7rem', 
                        borderRadius: 8, 
                        border: '1px solid #cbd5e1', 
                        fontSize: '1rem',
                        background: 'white'
                      }}
                    >
                      <option value="">Todos</option>
                      <option value="2023">2023</option>
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                    </select>
                  </div>
                  
                  {/* Filtro por empleado */}
                  <div>
                    <label style={{ fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>👤 Empleado</label>
                    <select 
                      value={filtroEmpleado} 
                      onChange={(e) => setFiltroEmpleado(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '0.7rem', 
                        borderRadius: 8, 
                        border: '1px solid #cbd5e1', 
                        fontSize: '1rem',
                        background: 'white'
                      }}
                    >
                      <option value="">Todos</option>
                      {empleados.map(empleado => (
                        <option key={empleado} value={empleado}>{empleado}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Botón limpiar filtros */}
                  <button 
                    onClick={() => {
                      setFiltroMes('');
                      setFiltroAnio('');
                      setFiltroEmpleado('');
                    }}
                    style={{ 
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)', 
                      color: 'white',
                      border: 'none', 
                      padding: '0.7rem 1.2rem', 
                      borderRadius: 8, 
                      fontWeight: 700, 
                      fontSize: '1rem', 
                      cursor: 'pointer',
                      height: 'fit-content',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    🗑️ Limpiar Filtros
                  </button>
                </div>
              </div>
              
              {loadingMetricas ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Cargando métricas...</div>
              ) : errorMetricas ? (
                <div style={{ color: '#dc2626', textAlign: 'center', padding: '2rem' }}>{errorMetricas}</div>
              ) : metricas ? (
                <div>
                  {/* Métricas principales */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 32 }}>
                    {/* Total de ventas */}
                    <div style={{ background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', padding: '1.5rem', borderRadius: 16, textAlign: 'center' }}>
                      <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Total de Ventas</div>
                      <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>{formatearPrecio(metricas.ventas.total)}</div>
                      <div style={{ fontSize: 14, opacity: 0.9 }}>{metricas.ventas.cantidad} ventas</div>
                    </div>
                    
                    {/* Promedio por venta */}
                    <div style={{ background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', color: 'white', padding: '1.5rem', borderRadius: 16, textAlign: 'center' }}>
                      <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Promedio por Venta</div>
                      <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>{formatearPrecio(metricas.ventas.promedioPorVenta)}</div>
                      <div style={{ fontSize: 14, opacity: 0.9 }}>por venta</div>
                    </div>
                    
                    {/* Total de cajas */}
                    <div style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', color: 'white', padding: '1.5rem', borderRadius: 16, textAlign: 'center' }}>
                      <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Cajas Cerradas</div>
                      <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>{metricas.cajas.total}</div>
                      <div style={{ fontSize: 14, opacity: 0.9 }}>turnos completados</div>
                    </div>
                    
                    {/* Productos vendidos */}
                    <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7)', color: 'white', padding: '1.5rem', borderRadius: 16, textAlign: 'center' }}>
                      <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Productos Vendidos</div>
                      <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>{metricas.ventas.productosVendidos}</div>
                      <div style={{ fontSize: 14, opacity: 0.9 }}>unidades totales</div>
                    </div>
                  </div>

                  {/* Métodos de pago */}
                  <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.5rem', marginBottom: 32 }}>
                    <h3 style={{ color: '#1e293b', fontWeight: 700, marginBottom: 16 }}>Métodos de Pago</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                      <div style={{ textAlign: 'center', padding: '1rem', background: '#dcfce7', borderRadius: 12 }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#166534', marginBottom: 4 }}>{formatearPrecio(metricas.ventas.efectivo)}</div>
                        <div style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>Efectivo</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '1rem', background: '#dbeafe', borderRadius: 12 }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#1e40af', marginBottom: 4 }}>{formatearPrecio(metricas.ventas.transferencia)}</div>
                        <div style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>Transferencia</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '1rem', background: '#fef3c7', borderRadius: 12 }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>{formatearPrecio(metricas.ventas.pos)}</div>
                        <div style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>POS</div>
                      </div>
                    </div>
                  </div>

                  {/* Top productos vendidos */}
                  <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.5rem', marginBottom: 32 }}>
                    <h3 style={{ color: '#1e293b', fontWeight: 700, marginBottom: 16 }}>Top 10 Productos Más Vendidos</h3>
                    {metricas.topProductos.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No hay datos de productos vendidos</div>
                    ) : (
                      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                        {metricas.topProductos.map((producto, index) => (
                          <div key={producto.producto} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            padding: '0.8rem 0',
                            borderBottom: index < metricas.topProductos.length - 1 ? '1px solid #e2e8f0' : 'none'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ 
                                background: index < 3 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : '#f1f5f9', 
                                color: index < 3 ? '#1e293b' : '#64748b',
                                width: 32, 
                                height: 32, 
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontWeight: 700,
                                fontSize: 14
                              }}>
                                {index + 1}
                              </div>
                              <span style={{ fontWeight: 600, color: '#1e293b' }}>{producto.producto}</span>
                            </div>
                            <div style={{ fontWeight: 700, color: '#059669', fontSize: 18 }}>{producto.cantidad} unidades</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Top días con más ventas */}
                  <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.5rem', marginBottom: 32 }}>
                    <h3 style={{ color: '#1e293b', fontWeight: 700, marginBottom: 16 }}>Top 7 Días con Más Ventas</h3>
                    {metricas.topDias.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No hay datos de ventas por día</div>
                    ) : (
                      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                        {metricas.topDias.map((dia, index) => (
                          <div key={dia.dia} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            padding: '0.8rem 0',
                            borderBottom: index < metricas.topDias.length - 1 ? '1px solid #e2e8f0' : 'none'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ 
                                background: index < 3 ? 'linear-gradient(135deg, #0ea5e9, #3b82f6)' : '#f1f5f9', 
                                color: index < 3 ? 'white' : '#64748b',
                                width: 32, 
                                height: 32, 
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontWeight: 700,
                                fontSize: 14
                              }}>
                                {index + 1}
                              </div>
                              <span style={{ fontWeight: 600, color: '#1e293b' }}>{dia.dia}</span>
                            </div>
                            <div style={{ fontWeight: 700, color: '#0ea5e9', fontSize: 18 }}>{formatearPrecio(dia.total)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Estadísticas de productos */}
                  <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.5rem', marginBottom: 32 }}>
                    <h3 style={{ color: '#1e293b', fontWeight: 700, marginBottom: 16 }}>Estadísticas de Productos</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                      <div style={{ textAlign: 'center', padding: '1rem', background: '#f0f9ff', borderRadius: 12 }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#0ea5e9', marginBottom: 4 }}>{metricas.productos.total}</div>
                        <div style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>Total Productos</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '1rem', background: '#fef3c7', borderRadius: 12 }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b', marginBottom: 4 }}>{metricas.productos.stockTotal}</div>
                        <div style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>Stock Total</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '1rem', background: '#fef2f2', borderRadius: 12 }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444', marginBottom: 4 }}>{metricas.productos.sinStock}</div>
                        <div style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>🚫 Sin Stock</div>
                      </div>
                    </div>
                  </div>

                  {/* Cajas por empleado */}
                  <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.5rem', marginBottom: 32 }}>
                    <h3 style={{ color: '#1e293b', fontWeight: 700, marginBottom: 16 }}>Cajas por Empleado</h3>
                    {Object.keys(metricas.cajas.porEmpleado).length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No hay datos de cajas por empleado</div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                        {Object.entries(metricas.cajas.porEmpleado).map(([empleado, cantidad]) => (
                          <div key={empleado} style={{ 
                            textAlign: 'center', 
                            padding: '1rem', 
                            background: '#f0fdf4', 
                            borderRadius: 12,
                            border: '1px solid #dcfce7'
                          }}>
                            <div style={{ fontSize: 24, fontWeight: 800, color: '#059669', marginBottom: 4 }}>{cantidad}</div>
                            <div style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>{empleado}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Productos por categoría */}
                  <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.5rem' }}>
                    <h3 style={{ color: '#1e293b', fontWeight: 700, marginBottom: 16 }}>Productos por Categoría</h3>
                    {Object.keys(metricas.productos.porCategoria).length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No hay datos de productos por categoría</div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                        {Object.entries(metricas.productos.porCategoria).map(([categoria, cantidad]) => (
                          <div key={categoria} style={{ 
                            textAlign: 'center', 
                            padding: '1rem', 
                            background: '#faf5ff', 
                            borderRadius: 12,
                            border: '1px solid #e9d5ff'
                          }}>
                            <div style={{ fontSize: 24, fontWeight: 800, color: '#8b5cf6', marginBottom: 4 }}>{cantidad}</div>
                            <div style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>{categoria}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No hay métricas disponibles</div>
              )}
            </div>
          ) : mostrarGestionStock ? (
            // Vista de gestión de stock
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ color: '#1e293b', fontWeight: 800, margin: 0 }}>📦 Gestionar Stock</h2>
                <button 
                  onClick={cargarStock}
                  disabled={loadingStock}
                  style={{ 
                    background: loadingStock ? '#f1f5f9' : 'linear-gradient(135deg, #0ea5e9, #3b82f6)', 
                    color: loadingStock ? '#64748b' : '#fff',
                    border: 'none', 
                    padding: '0.7rem 1.2rem', 
                    borderRadius: 10, 
                    fontWeight: 700, 
                    fontSize: '1rem', 
                    cursor: loadingStock ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  {loadingStock ? '🔄 Cargando...' : '🔄 Recargar'}
                </button>
              </div>
              
              {/* Alertas de bajo stock */}
              {productosBajoStock.length > 0 && (
                <div style={{ 
                  background: '#fef2f2', 
                  border: '1px solid #fecaca', 
                  borderRadius: 12, 
                  padding: '1rem', 
                  marginBottom: 24 
                }}>
                  <div style={{ fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>
                    ⚠️ Productos con bajo stock ({productosBajoStock.length}):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {productosBajoStock.map(producto => (
                      <span key={producto.id} style={{ 
                        background: '#fecaca', 
                        color: '#dc2626', 
                        padding: '0.3rem 0.8rem', 
                        borderRadius: 6, 
                        fontSize: 12, 
                        fontWeight: 600 
                      }}>
                        {producto.nombre} ({producto.stock})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Filtros y búsqueda */}
              <div style={{ 
                background: '#f8fafc', 
                borderRadius: 12, 
                padding: '1.5rem', 
                marginBottom: 24,
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 24 }}>
                  {/* Búsqueda */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <label style={{ display: 'block', fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
                      🔍 Buscar producto
                    </label>
                    <input 
                      type="text" 
                      value={busquedaStock} 
                      onChange={e => setBusquedaStock(e.target.value)} 
                      placeholder="Nombre, categoría o descripción" 
                      style={{ 
                        width: '100%', 
                        padding: '0.7rem', 
                        borderRadius: 8, 
                        border: '1px solid #cbd5e1', 
                        fontSize: '1rem',
                        background: 'white'
                      }}
                    />
                  </div>

                  {/* Categoría */}
                  <div style={{ minWidth: 120 }}>
                    <label style={{ display: 'block', fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
                      📂 Categoría
                    </label>
                    <select 
                      value={categoriaFiltro} 
                      onChange={e => setCategoriaFiltro(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '0.7rem', 
                        borderRadius: 8, 
                        border: '1px solid #cbd5e1', 
                        fontSize: '1rem',
                        background: 'white'
                      }}
                    >
                      <option value="">Todas</option>
                      {[...new Set(productosStock.map(p => p.categoria))].map(categoria => (
                        <option key={categoria} value={categoria}>{categoria}</option>
                      ))}
                    </select>
                  </div>

                  {/* Ordenamiento */}
                  <div style={{ minWidth: 150 }}>
                    <label style={{ display: 'block', fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
                      📊 Ordenar por stock
                    </label>
                    <select 
                      value={ordenStock} 
                      onChange={e => setOrdenStock(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '0.7rem', 
                        borderRadius: 8, 
                        border: '1px solid #cbd5e1', 
                        fontSize: '1rem',
                        background: 'white'
                      }}
                    >
                      <option value="asc">Menor a mayor</option>
                      <option value="desc">Mayor a menor</option>
                    </select>
                  </div>
                  
                  {/* Botón mostrar/ocultar sin stock compacto */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', marginLeft: 6 }}>
                    <label style={{ display: 'block', fontWeight: 600, color: '#64748b', marginBottom: 6, visibility: 'hidden' }}>
                      🚫 Sin stock
                    </label>
                    <button 
                      onClick={() => setMostrarSinStock(!mostrarSinStock)}
                      style={{ 
                        padding: '0.7rem', 
                        borderRadius: 8, 
                        border: '1px solid #cbd5e1',
                        fontSize: '1.2rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: mostrarSinStock ? '#fca5a5' : 'white',
                        color: mostrarSinStock ? '#dc2626' : '#6b7280',
                        width: 44,
                        height: 44,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      title={mostrarSinStock ? "Ocultar productos sin stock" : "Mostrar productos sin stock"}
                    >
                      🚫
                    </button>
                  </div>
                </div>

                {/* Edición masiva */}
                <div style={{ 
                  marginTop: 16, 
                  paddingTop: 16, 
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}>
                  
                  <button 
                    onClick={() => setMostrarEdicionMasiva(!mostrarEdicionMasiva)}
                    style={{ 
                      background: mostrarEdicionMasiva ? '#64748b' : 'linear-gradient(135deg, #0ea5e9, #3b82f6)', 
                      color: '#fff', 
                      border: 'none', 
                      padding: '0.7rem 1.2rem', 
                      borderRadius: 8, 
                      fontWeight: 700, 
                      fontSize: '0.9rem', 
                      cursor: 'pointer',
                      minWidth: 120
                    }}
                  >
                    {mostrarEdicionMasiva ? '❌ Cancelar' : '📈 Edición Masiva'}
                  </button>
                  
                  {mostrarEdicionMasiva && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          Edición masiva de precios
                        </span>
                        <input 
                          type="number" 
                          value={porcentajeMasivo} 
                          onChange={e => {
                            const value = e.target.value;
                            // Limitar a 3 caracteres máximo (incluyendo signo -)
                            if (value.length <= 3) {
                              setPorcentajeMasivo(value);
                            }
                          }}
                          placeholder="" 
                          maxLength={3}
                          min="-99"
                          max="99"
                          style={{ 
                            width: '50px',
                            padding: '0.5rem', 
                            borderRadius: 6, 
                            border: '1px solid #cbd5e1', 
                            fontSize: '0.9rem',
                            textAlign: 'center'
                          }} 
                        />
                        <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>% a</span>
                      </div>

                      {/* Selector de alcance simplificado */}
                      <select 
                        value={alcanceEdicionMasiva} 
                        onChange={e => setAlcanceEdicionMasiva(e.target.value)}
                        style={{ 
                          padding: '0.5rem 0.8rem', 
                          borderRadius: 6, 
                          border: '1px solid #cbd5e1', 
                          fontSize: '0.9rem',
                          background: 'white',
                          minWidth: 140
                        }}
                      >
                        <option value="filtrados">Productos filtrados</option>
                        <option value="todos">Todos los productos</option>
                      </select>
                      
                      <button 
                        onClick={aplicarEdicionMasiva}
                        disabled={editandoMasivamente || !porcentajeMasivo}
                        style={{ 
                          background: editandoMasivamente || !porcentajeMasivo ? '#9ca3af' : 'linear-gradient(135deg, #059669, #10b981)', 
                          color: '#fff', 
                          border: 'none', 
                          padding: '0.5rem 1rem', 
                          borderRadius: 6, 
                          fontWeight: 700, 
                          fontSize: '0.9rem', 
                          cursor: editandoMasivamente || !porcentajeMasivo ? 'not-allowed' : 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {editandoMasivamente ? '⏳ Aplicando...' : '✅ Aplicar'}
                      </button>
                    </>
                  )}
                </div>
                
                {mostrarEdicionMasiva && (
                  <div style={{ 
                    marginTop: 12, 
                    padding: '0.8rem', 
                    background: '#fef3c7', 
                    border: '1px solid #f59e0b', 
                    borderRadius: 8,
                    fontSize: '0.9rem',
                    color: '#92400e'
                  }}>
                    <strong>💡 Información:</strong> La edición masiva aplicará el porcentaje según el alcance seleccionado y redondeará los precios inteligentemente.
                    {alcanceEdicionMasiva === 'filtrados' && ' Se aplicará solo a los productos que coincidan con los filtros actuales.'}
                    {alcanceEdicionMasiva === 'todos' && ' Se aplicará a TODOS los productos del sistema.'}
                    {alcanceEdicionMasiva === 'filtrados' && categoriaFiltro && ` Para editar por categoría, usa el filtro de categoría arriba y selecciona "Productos filtrados".`}
                  </div>
                )}

                {/* Listado de productos */}
                {loadingStock ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', marginTop: 24 }}>Cargando productos...</div>
                ) : errorStock ? (
                  <div style={{ color: '#dc2626', textAlign: 'center', padding: '2rem', marginTop: 24 }}>{errorStock}</div>
                ) : productosStock.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', marginTop: 24 }}>No hay productos registrados</div>
                ) : (
                  <div style={{ maxHeight: '70vh', overflowY: 'auto', marginTop: 24 }}>
                    {obtenerProductosFiltrados().map((producto, index) => (
                      <div key={producto.id} style={{ 
                        border: '1px solid #e2e8f0', 
                        borderRadius: 12, 
                        padding: '1rem', 
                        marginBottom: 12,
                        background: producto.stock < 5 ? '#fef2f2' : '#f8fafc',
                        borderLeft: producto.stock < 5 ? '4px solid #dc2626' : '4px solid #e2e8f0'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 16, color: '#1e293b', marginBottom: 2 }}>
                              {producto.nombre}
                            </div>
                            <div style={{ color: '#64748b', fontSize: 13, marginBottom: 2 }}>
                              📂 {producto.categoria || 'Sin categoría'}
                            </div>
                            {producto.descripcion && (
                              <div style={{ color: '#64748b', fontSize: 12, fontStyle: 'italic' }}>
                                {producto.descripcion}
                              </div>
                            )}
                          </div>
                          <div style={{ textAlign: 'right', marginLeft: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 800, fontSize: 18, color: '#059669', marginBottom: 2 }}>
                                {formatearPrecio(producto.precio)}
                              </div>
                              <div style={{ 
                                fontSize: 13, 
                                fontWeight: 600,
                                color: producto.stock < 5 ? '#dc2626' : producto.stock < 10 ? '#f59e0b' : '#059669',
                                background: producto.stock < 5 ? '#fecaca' : producto.stock < 10 ? '#fef3c7' : '#dcfce7',
                                padding: '0.2rem 0.6rem',
                                borderRadius: 6,
                                display: 'inline-block'
                              }}>
                                📦 {producto.stock} unidades
                                {producto.stock < 5 && ' ⚠️'}
                              </div>
                            </div>
                            
                            {/* Botón de editar compacto */}
                            <button 
                              onClick={() => seleccionarProductoStock(producto)}
                              style={{ 
                                background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', 
                                color: '#fff', 
                                border: 'none', 
                                padding: '0.5rem', 
                                borderRadius: 8, 
                                fontWeight: 700, 
                                fontSize: '1rem', 
                                cursor: 'pointer',
                                width: 40,
                                height: 40,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Editar producto"
                            >
                              ✏️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Mensaje si no hay resultados */}
                    {obtenerProductosFiltrados().length === 0 && (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        No se encontraron productos con los filtros aplicados
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
              ) : (
            // Vista de nueva venta
            caja && caja.abierta ? (
              <>
                <h2 style={{ color: '#1e293b', fontWeight: 800, marginBottom: 24 }}>🛒 Nueva Venta</h2>
                
                {/* Filtro de búsqueda en la parte superior */}
                <div ref={searchContainerRef} style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <label style={{ fontWeight: 600, color: '#64748b', flex: 1 }}>🔍 Buscar producto</label>
                    <button
                      type="button"
                      onClick={() => setMostrarSinStock(!mostrarSinStock)}
                      style={{
                        background: mostrarSinStock ? '#dc2626' : '#f3f4f6',
                        color: mostrarSinStock ? 'white' : '#374151',
                        border: '1px solid #d1d5db',
                        padding: '0.5rem 0.8rem',
                        borderRadius: 6,
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                      title={mostrarSinStock ? 'Ocultar productos sin stock' : 'Mostrar productos sin stock'}
                    >
                      🚫 {mostrarSinStock ? 'Ocultar sin stock' : 'Mostrar sin stock'}
                    </button>
                  </div>
                  <input 
                    type="text" 
                    value={busqueda} 
                    onChange={e => setBusqueda(e.target.value)} 
                    onFocus={() => {
                      if (!busqueda) {
                        setMostrarTodosProductos(true);
                      }
                    }}
                    placeholder="Nombre o categoría" 
                    style={{ 
                      width: '100%', 
                      padding: '0.8rem', 
                      borderRadius: 8, 
                      border: '1px solid #cbd5e1', 
                      fontSize: '1rem',
                      background: 'white',
                      cursor: 'text'
                    }} 
                  />
                  {loadingProductos && <div style={{ color: '#64748b', marginTop: 8 }}>Cargando productos...</div>}
                  {errorProductos && <div style={{ color: '#dc2626', marginTop: 8 }}>{errorProductos}</div>}
                  
                  {/* Dropdown de resultados de búsqueda */}
                  {(busqueda || mostrarTodosProductos) && (
                    <div style={{ 
                      background: 'white', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: 8, 
                      marginTop: 8, 
                      maxHeight: 200, 
                      overflowY: 'auto',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      zIndex: 10,
                      position: 'relative'
                    }}>
                      {(busqueda ? productos.filter(p => {
                          const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.categoria.toLowerCase().includes(busqueda.toLowerCase());
                          const tieneStock = p.stock === undefined || p.stock === '' || !isNaN(Number(p.stock)) && Number(p.stock) > 0;
                          return coincideBusqueda && (mostrarSinStock || tieneStock);
                        }) : productos.filter(p => {
                          const tieneStock = p.stock === undefined || p.stock === '' || !isNaN(Number(p.stock)) && Number(p.stock) > 0;
                          return mostrarSinStock || tieneStock;
                        }).sort((a, b) => {
                          // Ordenar por productos más vendidos
                          const aVentas = productosVendidos.find(pv => pv.nombre === a.nombre)?.cantidad || 0;
                          const bVentas = productosVendidos.find(pv => pv.nombre === b.nombre)?.cantidad || 0;
                          return bVentas - aVentas; // Orden descendente (más vendidos primero)
                        }))
                        .slice(0, 10)
                        .map(p => (
                        <div 
                          key={p.id} 
                          style={{ 
                            padding: '0.8rem 1rem', 
                            cursor: 'pointer', 
                            borderBottom: '1px solid #e2e8f0', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 12,
                            transition: 'background-color 0.2s'
                          }} 
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          onClick={() => { setProductoSeleccionado(p); setBusqueda(''); setMostrarTodosProductos(false); }}
                        >
                          <span style={{ fontWeight: 600, flex: 1 }}>
                            {p.nombre} 
                            <span style={{ color: '#64748b', fontWeight: 400 }}>
                              ({p.stock !== undefined && p.stock !== '' ? p.stock : '∞'})
                            </span>
                          </span>
                          <span style={{ color: '#f59e0b', fontWeight: 500, fontSize: 13 }}>{p.categoria}</span>
                          <span style={{ color: '#059669', fontWeight: 700 }}>{formatearPrecio(p.oferta && calcularPrecioOferta(p.precio, p.oferta) !== null ? calcularPrecioOferta(p.precio, p.oferta) : p.precio)}</span>
                        </div>
                      ))}
                      {(busqueda ? productos.filter(p => {
                          const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.categoria.toLowerCase().includes(busqueda.toLowerCase());
                          const tieneStock = p.stock === undefined || p.stock === '' || !isNaN(Number(p.stock)) && Number(p.stock) > 0;
                          return coincideBusqueda && (mostrarSinStock || tieneStock);
                        }) : productos.filter(p => {
                          const tieneStock = p.stock === undefined || p.stock === '' || !isNaN(Number(p.stock)) && Number(p.stock) > 0;
                          return mostrarSinStock || tieneStock;
                        })).length === 0 && (
                        <div style={{ padding: '1rem', color: '#64748b', textAlign: 'center' }}>
                          {!mostrarSinStock && productos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.categoria.toLowerCase().includes(busqueda.toLowerCase())).some(p => !(p.stock === undefined || p.stock === '' || !isNaN(Number(p.stock)) && Number(p.stock) > 0)) 
                            ? 'No hay resultados con stock disponible. Usa el botón 🚫 para ver productos sin stock.' 
                            : 'No hay resultados'}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Producto seleccionado y controles */}
                {productoSeleccionado && (
                  <div style={{ 
                    background: '#f8fafc', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: 12, 
                    padding: 20, 
                    marginBottom: 24,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20
                  }}>
                    {/* Imagen del producto */}
                    <div style={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: 8, 
                      overflow: 'hidden',
                      background: '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {productoSeleccionado.imagen ? (
                        <img 
                          src={productoSeleccionado.imagen} 
                          alt={productoSeleccionado.nombre}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover' 
                          }}
                        />
                      ) : (
                        <span style={{ color: '#64748b', fontSize: 24 }}>📦</span>
                      )}
                    </div>
                    
                    {/* Información del producto */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{productoSeleccionado.nombre}</div>
                      <div style={{ color: '#f59e0b', fontWeight: 500, marginBottom: 8 }}>{productoSeleccionado.categoria}</div>
                      <div style={{ color: '#059669', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
                        {formatearPrecio(productoSeleccionado.oferta && calcularPrecioOferta(productoSeleccionado.precio, productoSeleccionado.oferta) !== null ? calcularPrecioOferta(productoSeleccionado.precio, productoSeleccionado.oferta) : productoSeleccionado.precio)}
                      </div>
                      <div style={{ color: '#64748b', fontSize: 13 }}>Stock: {productoSeleccionado.stock || '∞'}</div>
                    </div>
                    
                    {/* Controles de cantidad y agregar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div>
                        <label style={{ fontWeight: 600, color: '#64748b', marginRight: 8, fontSize: 14 }}>Cantidad</label>
                        <input 
                          type="text" 
                          min={1} 
                          max={productoSeleccionado.stock || 99} 
                          value={cantidad} 
                          onChange={e => { if (/^\d*$/.test(e.target.value)) setCantidad(e.target.value); }} 
                          style={{ 
                            width: 80, 
                            padding: '0.6rem', 
                            borderRadius: 6, 
                            border: '1px solid #cbd5e1', 
                            fontSize: '1rem',
                            textAlign: 'center'
                          }} 
                        />
                      </div>
                      <button 
                        onClick={agregarAlCarrito} 
                        disabled={productoSeleccionado && productoSeleccionado.stock !== undefined && productoSeleccionado.stock !== '' && !isNaN(Number(productoSeleccionado.stock)) && Number(productoSeleccionado.stock) <= 0}
                        style={{ 
                          background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', 
                          color: '#1e293b', 
                          border: 'none', 
                          padding: '0.8rem 1.5rem', 
                          borderRadius: 10, 
                          fontWeight: 700, 
                          fontSize: '1rem', 
                          cursor: (productoSeleccionado && productoSeleccionado.stock !== undefined && productoSeleccionado.stock !== '' && !isNaN(Number(productoSeleccionado.stock)) && Number(productoSeleccionado.stock) <= 0) ? 'not-allowed' : 'pointer',
                          minWidth: 120
                        }}
                      >
                        ➕ Agregar
                      </button>
                    </div>
                    
                    {productoSeleccionado && productoSeleccionado.stock !== undefined && productoSeleccionado.stock !== '' && !isNaN(Number(productoSeleccionado.stock)) && Number(productoSeleccionado.stock) <= 0 && (
                      <div style={{ color: '#dc2626', fontWeight: 600, fontSize: 14 }}>🚫 Sin stock</div>
                    )}
                  </div>
                )}
                {/* Carrito / Resumen de venta */}
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ color: '#1e293b', fontWeight: 700, marginBottom: 16 }}>🛍️ Productos en la venta</h3>
                  {carrito.length === 0 ? (
                    <div style={{ 
                      color: '#64748b', 
                      textAlign: 'center', 
                      padding: '2rem',
                      background: '#f8fafc',
                      borderRadius: 12,
                      border: '2px dashed #cbd5e1'
                    }}>
                      No hay productos en la venta.
                    </div>
                  ) : (
                    <>
                      {/* Productos en formato horizontal */}
                      <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 12, 
                        marginBottom: 20,
                        maxHeight: 200,
                        overflowY: 'auto'
                      }}>
                        {carrito.map(p => {
                          const precio = p.oferta && calcularPrecioOferta(p.precio, p.oferta) !== null ? calcularPrecioOferta(p.precio, p.oferta) : p.precio;
                          return (
                            <div key={p.id} style={{ 
                              background: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: 12,
                              padding: 12,
                              minWidth: 200,
                              maxWidth: 250,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}>
                              {/* Imagen pequeña */}
                              <div style={{ 
                                width: 50, 
                                height: 50, 
                                borderRadius: 6, 
                                overflow: 'hidden',
                                background: '#e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                {p.imagen ? (
                                  <img 
                                    src={p.imagen} 
                                    alt={p.nombre}
                                    style={{ 
                                      width: '100%', 
                                      height: '100%', 
                                      objectFit: 'cover' 
                                    }}
                                  />
                                ) : (
                                  <span style={{ color: '#64748b', fontSize: 16 }}>📦</span>
                                )}
                              </div>
                              
                              {/* Información del producto */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ 
                                  fontWeight: 600, 
                                  fontSize: 14, 
                                  marginBottom: 2,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {p.nombre}
                                </div>
                                <div style={{ 
                                  color: '#f59e0b', 
                                  fontWeight: 500, 
                                  fontSize: 12, 
                                  marginBottom: 4 
                                }}>
                                  {p.categoria}
                                </div>
                                <div style={{ 
                                  color: '#059669', 
                                  fontWeight: 700, 
                                  fontSize: 13 
                                }}>
                                  {formatearPrecio(precio)}
                                </div>
                                <div style={{ 
                                  color: '#64748b', 
                                  fontSize: 12,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8
                                }}>
                                  <span>×{p.cantidad}</span>
                                  <span style={{ fontWeight: 600 }}>
                                    {formatearPrecio(precio * p.cantidad)}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Botón quitar */}
                              <button 
                                onClick={() => quitarDelCarrito(p.id)} 
                                style={{ 
                                  background: '#ef4444', 
                                  color: '#fff', 
                                  border: 'none', 
                                  borderRadius: 6, 
                                  padding: '0.4rem 0.6rem', 
                                  fontWeight: 700, 
                                  cursor: 'pointer',
                                  fontSize: 12,
                                  flexShrink: 0
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Total */}
                      <div style={{ 
                        textAlign: 'right', 
                        fontWeight: 800, 
                        fontSize: 20, 
                        color: '#059669',
                        background: '#f0fdf4',
                        padding: '1rem',
                        borderRadius: 12,
                        border: '1px solid #dcfce7'
                      }}>
                        Total: {formatearPrecio(totalVenta)}
                      </div>
                    </>
                  )}
                </div>
                {/* Formas de pago */}
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ color: '#1e293b', fontWeight: 700, marginBottom: 12 }}>💳 Formas de pago</h3>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div>
                      <label style={{ fontWeight: 600, color: '#64748b', marginRight: 8, cursor: 'pointer' }} onMouseDown={() => handlePagoClick('efectivo')}>💵 Efectivo</label>
                      <input type="text" min={0} value={formaPago.efectivo} onChange={e => { if (/^\d*$/.test(e.target.value)) setFormaPago({ ...formaPago, efectivo: e.target.value }); }} style={{ width: 100, padding: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '1rem' }} />
                    </div>
                    <div>
                      <label style={{ fontWeight: 600, color: '#64748b', marginRight: 8, cursor: 'pointer' }} onMouseDown={() => handlePagoClick('transferencia')}>🏦 Transferencia</label>
                      <input type="text" min={0} value={formaPago.transferencia} onChange={e => { if (/^\d*$/.test(e.target.value)) setFormaPago({ ...formaPago, transferencia: e.target.value }); }} style={{ width: 100, padding: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '1rem' }} />
                    </div>
                    <div>
                      <label style={{ fontWeight: 600, color: '#64748b', marginRight: 8, cursor: 'pointer' }} onMouseDown={() => handlePagoClick('pos')}>💳 POS</label>
                      <input type="text" min={0} value={formaPago.pos} onChange={e => { if (/^\d*$/.test(e.target.value)) setFormaPago({ ...formaPago, pos: e.target.value }); }} style={{ width: 100, padding: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '1rem' }} />
                    </div>
                  </div>
                  <div style={{ color: '#64748b', marginTop: 8, fontSize: 13 }}>El total de las formas de pago debe coincidir con el total de la venta.</div>
                  <div style={{ 
                    marginTop: 8, 
                    padding: '0.5rem', 
                    borderRadius: 6, 
                    fontSize: 13, 
                    fontWeight: 600,
                    background: totalPago === totalVenta && totalVenta > 0 ? '#f0fdf4' : totalPago > totalVenta ? '#fef2f2' : '#f8fafc',
                    color: totalPago === totalVenta && totalVenta > 0 ? '#059669' : totalPago > totalVenta ? '#dc2626' : '#64748b',
                    border: `1px solid ${totalPago === totalVenta && totalVenta > 0 ? '#dcfce7' : totalPago > totalVenta ? '#fecaca' : '#e2e8f0'}`
                  }}>
                    💰 Total pagos: {formatearPrecio(totalPago)} | 🛒 Total venta: {formatearPrecio(totalVenta)}
                    {totalPago !== totalVenta && totalVenta > 0 && (
                      <span style={{ marginLeft: 8 }}>
                        {totalPago > totalVenta ? '❌ Excede el total' : `⚠️ Falta ${formatearPrecio(totalVenta - totalPago)}`}
                      </span>
                    )}
                  </div>
                </div>
                {/* Cliente y observaciones */}
                <div style={{ marginBottom: 24, display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontWeight: 600, color: '#64748b', marginRight: 8 }}>👤 Cliente</label>
                    <input type="text" value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Nombre del cliente (opcional)" style={{ width: '100%', padding: '0.7rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '1rem' }} />
                  </div>
                  <div style={{ flex: 2 }}>
                    <label style={{ fontWeight: 600, color: '#64748b', marginRight: 8 }}>📝 Observaciones</label>
                    <input type="text" value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="Observaciones (opcional)" style={{ width: '100%', padding: '0.7rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '1rem' }} />
                  </div>
                </div>
                {/* Botón para generar venta */}
                {errorPago && <div style={{ color: '#dc2626', fontWeight: 600, marginBottom: 8 }}>{errorPago}</div>}
                <button
                  disabled={carrito.length === 0 || totalPago !== totalVenta || totalPago > totalVenta || !!errorPago || loadingVenta}
                  onClick={handleGenerarVenta}
                  style={{ 
                    width: '100%', 
                    background: (carrito.length === 0 || totalPago !== totalVenta || totalPago > totalVenta || !!errorPago || loadingVenta) 
                      ? '#9ca3af' 
                      : 'linear-gradient(135deg, #059669, #10b981)', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '1.1rem', 
                    borderRadius: 12, 
                    fontSize: '1.2rem', 
                    fontWeight: 800, 
                    cursor: (carrito.length === 0 || totalPago !== totalVenta || totalPago > totalVenta || !!errorPago || loadingVenta) ? 'not-allowed' : 'pointer', 
                    boxShadow: (carrito.length === 0 || totalPago !== totalVenta || totalPago > totalVenta || !!errorPago || loadingVenta) 
                      ? '0 2px 8px rgba(156,163,175,0.10)' 
                      : '0 2px 8px rgba(16,185,129,0.10)', 
                    marginTop: 12,
                    opacity: (carrito.length === 0 || totalPago !== totalVenta || totalPago > totalVenta || !!errorPago || loadingVenta) ? 0.6 : 1,
                    transition: 'all 0.3s ease'
                  }}
                >
                  {loadingVenta ? 'Registrando venta...' : '✅ Generar venta'}
                </button>
              </>
            ) : (
              <div style={{ 
                color: '#64748b', 
                fontWeight: 600, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: 200,
                fontSize: '1.1rem'
              }}>
                Debe abrir la caja para registrar ventas.
              </div>
            )
          )}
        </div>
      </div>

      {/* Notificación flotante */}
      {notificacion && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          background: notificacion.tipo === 'error' ? '#ef4444' : notificacion.tipo === 'success' ? '#10b981' : '#3b82f6',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: 12,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          zIndex: 1000,
          maxWidth: 400,
          fontWeight: 600,
          fontSize: '1rem',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {notificacion.mensaje}
        </div>
      )}

      {/* Modal de confirmación */}
      {modalConfirmacion && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: '2rem',
            maxWidth: 500,
            width: '90%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ color: '#1e293b', fontWeight: 800, marginBottom: 16, fontSize: '1.5rem' }}>
              {modalConfirmacion.titulo}
            </h3>
            <p style={{ color: '#64748b', marginBottom: 24, fontSize: '1.1rem', lineHeight: 1.5 }}>
              {modalConfirmacion.mensaje}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setModalConfirmacion(null)}
                style={{
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  padding: '0.8rem 1.5rem',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  modalConfirmacion.onConfirm();
                  setModalConfirmacion(null);
                }}
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #f87171)',
                  color: 'white',
                  border: 'none',
                  padding: '0.8rem 1.5rem',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición de stock */}
      {productoSeleccionadoStock && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: '2rem',
            maxWidth: 600,
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ color: '#1e293b', fontWeight: 800, fontSize: '1.5rem' }}>
                ✏️ Editar Producto: {productoSeleccionadoStock.nombre}
              </h3>
              <button
                onClick={() => setProductoSeleccionadoStock(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#64748b',
                  fontWeight: 'bold'
                }}
              >
                ×
              </button>
            </div>

            {/* Información actual del producto */}
            <div style={{ 
              background: '#f8fafc', 
              padding: '1rem', 
              borderRadius: 12, 
              marginBottom: 24,
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontWeight: 600, color: '#64748b', marginBottom: 8 }}>📊 Estado Actual:</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>Stock actual:</span>
                  <span style={{ 
                    marginLeft: 8, 
                    fontWeight: 700, 
                    color: productoSeleccionadoStock.stock < 5 ? '#dc2626' : '#059669',
                    fontSize: '1.1rem'
                  }}>
                    {productoSeleccionadoStock.stock} unidades
                  </span>
                </div>
                <div>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>Precio actual:</span>
                  <span style={{ marginLeft: 8, fontWeight: 700, color: '#059669', fontSize: '1.1rem' }}>
                    {formatearPrecio(productoSeleccionadoStock.precio)}
                  </span>
                </div>
              </div>
            </div>

            {/* Formulario de edición */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ color: '#1e293b', fontWeight: 700, marginBottom: 16 }}>🔧 Modificar Datos:</h4>
              
              {/* Agregar stock */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontWeight: 600, color: '#64748b', marginBottom: 8, display: 'block' }}>
                  ➕ Agregar Stock:
                </label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <input
                    type="number"
                    min="1"
                    value={cantidadAgregar}
                    onChange={e => setCantidadAgregar(e.target.value)}
                    placeholder="Cantidad a agregar"
                    style={{ 
                      flex: 1,
                      padding: '0.7rem', 
                      borderRadius: 8, 
                      border: '1px solid #cbd5e1', 
                      fontSize: '1rem' 
                    }}
                  />
                  <button
                    onClick={agregarStock}
                    disabled={!cantidadAgregar || Number(cantidadAgregar) <= 0 || editandoStock}
                    style={{
                      background: (!cantidadAgregar || Number(cantidadAgregar) <= 0 || editandoStock) 
                        ? '#9ca3af' 
                        : 'linear-gradient(135deg, #059669, #10b981)',
                      color: 'white',
                      border: 'none',
                      padding: '0.7rem 1.2rem',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: '1rem',
                      cursor: (!cantidadAgregar || Number(cantidadAgregar) <= 0 || editandoStock) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {editandoStock ? 'Agregando...' : '➕ Agregar'}
                  </button>
                </div>
              </div>

              {/* Modificar precio */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontWeight: 600, color: '#64748b', marginBottom: 8, display: 'block' }}>
                  💰 Precio Unitario:
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={nuevoPrecio}
                  onChange={e => setNuevoPrecio(e.target.value)}
                  placeholder="Nuevo precio"
                  style={{ 
                    width: '100%',
                    padding: '0.7rem', 
                    borderRadius: 8, 
                    border: '1px solid #cbd5e1', 
                    fontSize: '1rem' 
                  }}
                />
              </div>

              {/* Modificar categoría */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontWeight: 600, color: '#64748b', marginBottom: 8, display: 'block' }}>
                  📂 Categoría:
                </label>
                <input
                  type="text"
                  value={nuevaCategoria}
                  onChange={e => setNuevaCategoria(e.target.value)}
                  placeholder="Nueva categoría"
                  style={{ 
                    width: '100%',
                    padding: '0.7rem', 
                    borderRadius: 8, 
                    border: '1px solid #cbd5e1', 
                    fontSize: '1rem' 
                  }}
                />
              </div>

              {/* Modificar descripción */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontWeight: 600, color: '#64748b', marginBottom: 8, display: 'block' }}>
                  📝 Descripción:
                </label>
                <textarea
                  value={nuevaDescripcion}
                  onChange={e => setNuevaDescripcion(e.target.value)}
                  placeholder="Nueva descripción"
                  rows="3"
                  style={{ 
                    width: '100%',
                    padding: '0.7rem', 
                    borderRadius: 8, 
                    border: '1px solid #cbd5e1', 
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setProductoSeleccionadoStock(null)}
                style={{
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  padding: '0.8rem 1.5rem',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={actualizarProductoStock}
                disabled={editandoStock}
                style={{
                  background: editandoStock 
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
                  color: 'white',
                  border: 'none',
                  padding: '0.8rem 1.5rem',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: editandoStock ? 'not-allowed' : 'pointer'
                }}
              >
                {editandoStock ? 'Guardando...' : '💾 Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
} 