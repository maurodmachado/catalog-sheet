import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import logo from './assets/logo.png'
import whatsappLogo from './assets/whatsapp-logo.png'

function App() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todos')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem('carrito')
    return guardado ? JSON.parse(guardado) : []
  })
  const [mostrarCarrito, setMostrarCarrito] = useState(false)
  const [productoDetalle, setProductoDetalle] = useState(null)
  const [busquedaNombre, setBusquedaNombre] = useState('');
  const [ordenPrecio, setOrdenPrecio] = useState('ninguno');
  const [notificacion, setNotificacion] = useState(null);
  const carritoRef = useRef(null);

  // URL de la API (usa variable de entorno en producción)
  const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api'

  useEffect(() => {
    cargarProductos()
  }, [])

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito))
  }, [carrito])

  // Cerrar carrito cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (carritoRef.current && !carritoRef.current.contains(event.target)) {
        setMostrarCarrito(false);
      }
    };

    if (mostrarCarrito) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mostrarCarrito]);

  const cargarProductos = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/productos`)
      if (!response.ok) {
        throw new Error('Error al cargar productos')
      }
      const data = await response.json()
      setProductos(data)
      
      // Extraer categorías únicas
      const categoriasUnicas = [...new Set(data.map(p => p.categoria).filter(c => c))]
      setCategorias(categoriasUnicas)
      
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  // Filtrado de productos por categoría y nombre
  let productosFiltrados = productos.filter(producto => {
    const coincideCategoria = categoriaSeleccionada === 'todos' || producto.categoria === categoriaSeleccionada;
    const coincideNombre = producto.nombre.toLowerCase().includes(busquedaNombre.toLowerCase());
    return coincideCategoria && coincideNombre;
  });

  const calcularPrecioOferta = (precioOriginal, oferta) => {
    if (!oferta) return null
    
    // Extraer el porcentaje de descuento del texto de oferta
    const match = oferta.match(/(\d+)%/)
    if (match) {
      const descuento = parseInt(match[1])
      const precioOferta = precioOriginal * (1 - descuento / 100)
      return Math.round(precioOferta)
    }
    
    // Si no hay porcentaje, intentar extraer un precio directo
    const precioMatch = oferta.match(/(\d+)/)
    if (precioMatch) {
      return parseInt(precioMatch[1])
    }
    
    return null
  }

  // Ordenar productos: primero los que tienen stock > 0, luego los sin stock, y dentro de los con stock, por categoría alfabética
  productosFiltrados = [...productosFiltrados].sort((a, b) => {
    const stockA = (a.stock === undefined || a.stock === '' || isNaN(Number(a.stock))) ? 1 : Number(a.stock);
    const stockB = (b.stock === undefined || b.stock === '' || isNaN(Number(b.stock))) ? 1 : Number(b.stock);

    // Si uno tiene stock y el otro no, el que tiene stock va primero
    if (stockA > 0 && stockB <= 0) return -1;
    if (stockB > 0 && stockA <= 0) return 1;

    // Ambos tienen stock o ambos no tienen stock
    // Si ambos tienen stock, ordenar por categoría alfabética
    if (stockA > 0 && stockB > 0) {
      if (a.categoria < b.categoria) return -1;
      if (a.categoria > b.categoria) return 1;
      return 0;
    }
    // Ambos sin stock, mantener el orden original
    return 0;
  });

  // Ordenar por precio si corresponde
  if (ordenPrecio === 'asc') {
    productosFiltrados = [...productosFiltrados].sort((a, b) => (a.oferta && calcularPrecioOferta(a.precio, a.oferta) !== null ? calcularPrecioOferta(a.precio, a.oferta) : a.precio) - (b.oferta && calcularPrecioOferta(b.precio, b.oferta) !== null ? calcularPrecioOferta(b.precio, b.oferta) : b.precio));
  } else if (ordenPrecio === 'desc') {
    productosFiltrados = [...productosFiltrados].sort((a, b) => (b.oferta && calcularPrecioOferta(b.precio, b.oferta) !== null ? calcularPrecioOferta(b.precio, b.oferta) : b.precio) - (a.oferta && calcularPrecioOferta(a.precio, a.oferta) !== null ? calcularPrecioOferta(a.precio, a.oferta) : a.precio));
  }

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio)
  }

  const obtenerIconoCategoria = (categoria) => {
    const iconos = {
      'Tecnología': '💻',
      'Tecnologia': '💻',
      'Ropa': '👕',
      'Calzado': '👟',
      'Accesorios': '👜',
      'Hogar': '🏠',
      'Deportes': '⚽',
      'Libros': '📚',
      'Juguetes': '🧸',
      'Alimentos': '🍎',
      'Bebidas': '🥤',
      'Salud': '💊',
      'Belleza': '💄',
      'Automotriz': '🚗',
      'Jardín': '🌱',
      'Mascotas': '🐕'
    }
    return iconos[categoria] || '📦'
  }

  const getImagenUrl = (url) => {
    if (!url) return '';
    // Google Drive
    const driveMatch = url.match(/https?:\/\/drive\.google\.com\/file\/d\/([\w-]+)\//);
    if (driveMatch) {
      return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
    }
    // Google Photos direct (googleusercontent.com)
    if (url.includes('googleusercontent.com')) {
      return url;
    }
    // Google Photos share link (photos.app.goo.gl)
    if (url.includes('photos.app.goo.gl')) {
      // No se puede transformar automáticamente, mostrar error
      return null;
    }
    // Otros hosts
    return url;
  };

  // Agregar producto al carrito
  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find((p) => p.id === producto.id)
      if (existe) {
        const nuevaCantidad = existe.cantidad + 1;
        return prev.map((p) =>
          p.id === producto.id ? { ...p, cantidad: nuevaCantidad } : p
        )
      } else {
        return [...prev, { ...producto, cantidad: 1 }]
      }
    })
  }

  // Quitar producto del carrito
  const quitarDelCarrito = (id) => {
    setCarrito((prev) => prev.filter((p) => p.id !== id))
  }

  // Cambiar cantidad
  const cambiarCantidad = (id, cantidad) => {
    setCarrito((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, cantidad: Math.max(1, cantidad) } : p
      )
    )
  }

  // Limpiar carrito
  const limpiarCarrito = () => {
    setCarrito([]);
  };

  // Generar mensaje de WhatsApp
  const armarMensajeWhatsApp = () => {
    let mensaje = '¡Hola! Quiero hacer un pedido:%0A%0A'
    carrito.forEach((p, i) => {
      mensaje += `${i + 1}. ${p.nombre} (${p.categoria}) x${p.cantidad} - $${p.oferta && calcularPrecioOferta(p.precio, p.oferta) !== null ? calcularPrecioOferta(p.precio, p.oferta) : p.precio}%0A`
    })
    const total = carrito.reduce(
      (acc, p) => acc + (p.oferta && calcularPrecioOferta(p.precio, p.oferta) !== null ? calcularPrecioOferta(p.precio, p.oferta) : p.precio) * p.cantidad,
      0
    )
    mensaje += `%0ATotal: $${total}`
    return mensaje
  }

  const linkWhatsApp = `https://api.whatsapp.com/send/?phone=${import.meta.env.VITE_TELEFONO}&text=${armarMensajeWhatsApp()}`

  // Cerrar modal con Escape o volver atrás
  useEffect(() => {
    if (!productoDetalle) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setProductoDetalle(null);
      }
    };
    const handlePopState = () => {
      setProductoDetalle(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);
    // Empujar un nuevo estado al historial para detectar el back en móviles
    window.history.pushState({ modal: true }, '');
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
      // Al cerrar el modal, volver el historial atrás si es necesario
      if (window.history.state && window.history.state.modal) {
        window.history.back();
      }
    };
  }, [productoDetalle]);

  const mostrarNotificacion = (mensaje, tipo = 'info') => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), 3000);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Cargando productos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error">
        <h2>⚠️ Error de Conexión</h2>
        <p>{error}</p>
        <p>Verifica que el servidor esté funcionando y las credenciales sean correctas.</p>
        <button onClick={cargarProductos}>🔄 Reintentar</button>
      </div>
    )
  }

  return (
    <div className="app">
      {/* Modal de detalle de producto */}
      {productoDetalle && (
        <div className="modal-detalle-overlay" onClick={() => setProductoDetalle(null)}>
          <div className="modal-detalle" onClick={e => e.stopPropagation()}>
            <button className="cerrar-modal" onClick={() => setProductoDetalle(null)}>✖</button>
            <div className="modal-imagen">
              {productoDetalle.imagen ? (
                getImagenUrl(productoDetalle.imagen) ? (
                  <img src={getImagenUrl(productoDetalle.imagen)} alt={productoDetalle.nombre} />
                ) : (
                  <div className="placeholder-imagen">
                    <span>⚠️ Link de Google Photos no soportado<br/>Usa el link directo de la imagen</span>
                  </div>
                )
              ) : (
                <div className="placeholder-imagen">
                  <span>📦</span>
                </div>
              )}
            </div>
            <h2>{productoDetalle.nombre}</h2>
            <p className="producto-categoria-modal">{obtenerIconoCategoria(productoDetalle.categoria)} {productoDetalle.categoria}</p>
            <div className="precio-container-modal">
              {productoDetalle.oferta && calcularPrecioOferta(productoDetalle.precio, productoDetalle.oferta) !== null ? (
                <>
                  <span className="producto-precio-original">{formatearPrecio(productoDetalle.precio)}</span>
                  <span className="producto-precio-oferta">{formatearPrecio(calcularPrecioOferta(productoDetalle.precio, productoDetalle.oferta))}</span>
                </>
              ) : (
                <span className="producto-precio">{formatearPrecio(productoDetalle.precio)}</span>
              )}
            </div>
            <p className="producto-descripcion-modal">{productoDetalle.descripcion}</p>
            <button className="agregar-carrito-btn" onClick={() => { agregarAlCarrito(productoDetalle); setProductoDetalle(null); }}>
              ➕ Agregar al carrito
            </button>
          </div>
      </div>
      )}
      <header className="header">
        <h1><img src={logo} alt="ALNORTEGROW" className="logo-header" />ALNORTEGROW</h1>
      </header>

      <main className="main">
        <button className="carrito-btn" onClick={() => setMostrarCarrito(!mostrarCarrito)}>
          🛒 Carrito ({carrito.reduce((acc, p) => acc + p.cantidad, 0)})
        </button>
        {mostrarCarrito && (
          <div className="carrito-modal" ref={carritoRef}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>🛒 Carrito</h2>
              {carrito.length > 0 && (
                <button 
                  onClick={limpiarCarrito}
                  style={{
                    backgroundColor: '#FFE6E6',
                    border: 'none',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    padding: '0.3rem',
                    borderRadius: '4px',
                    color: '#ef4444',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {e.target.style.backgroundColor = 'transparent'; e.target.style.border = "1px solid #FFE6E6"}}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#FFE6E6'}
                  title="Limpiar carrito"
                >
                  Vaciar 🛒
                </button>
              )}
            </div>
            {carrito.length === 0 ? (
              <p>El carrito está vacío.</p>
            ) : (
              <>
                <ul>
                  {carrito.map((p) => (
                    <li key={p.id}>
                      <span className="carrito-nombre"><strong>{p.nombre}</strong></span>
                      <span className="carrito-precio">${p.oferta && calcularPrecioOferta(p.precio, p.oferta) !== null ? calcularPrecioOferta(p.precio, p.oferta) : p.precio}</span>
                      <input type="number" min="1" value={p.cantidad} onChange={e => cambiarCantidad(p.id, parseInt(e.target.value))} />
                      <button onClick={() => quitarDelCarrito(p.id)}>❌</button>
                    </li>
                  ))}
                </ul>
                <a href={linkWhatsApp} target="_blank" rel="noopener noreferrer" className="finalizar-btn">
                  Finalizar pedido por WhatsApp
                </a>
              </>
            )}
          </div>
        )}
        {/* Filtro de nombre, categorías y orden */}
        <div className="filtros" style={{
          display: 'flex', 
          flexDirection: 'column',
          gap: '1rem', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '1rem 0 1.5rem 0',
          padding: '1.5rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{margin: '0', fontSize: '1.3rem', fontWeight: '600', color: '#333'}}>🔍 Filtros</h3>
          <div style={{
            display: 'flex', 
            gap: '0.8rem', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            justifyContent: 'center',
            width: '100%'
          }}>
          <div style={{
            position: 'relative', 
            width: '220px',
            minWidth: '200px',
            flex: '1 1 200px',
            maxWidth: '280px'
          }}>
            <span style={{position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888', fontSize: '1.1rem'}}>🔍</span>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={busquedaNombre}
              onChange={e => setBusquedaNombre(e.target.value)}
              className="input-busqueda-nombre"
              style={{
                width: '100%', 
                padding: '0.4rem 0.8rem 0.4rem 2rem', 
                borderRadius: '6px', 
                border: '1px solid #ccc', 
                fontSize: '1rem', 
                height: '2.4rem', 
                fontFamily: 'inherit',
                minWidth: '180px'
              }}
            />
          </div>
          <select 
            id="categoria"
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            style={{
              width: '260px',
              minWidth: '200px',
              flex: '1 1 200px',
              maxWidth: '280px',
              padding: '0.4rem 0.8rem', 
              borderRadius: '6px', 
              border: '1px solid #ccc', 
              fontSize: '1rem', 
              height: '2.4rem', 
              fontFamily: 'inherit'
            }}
          >
            <option value="todos">📦 Filtrar categoría ({productos.length})</option>
            {categorias.map(categoria => (
              <option key={categoria} value={categoria}>
                {obtenerIconoCategoria(categoria)} {categoria} ({productos.filter(p => p.categoria === categoria).length})
              </option>
            ))}
          </select>
          <select
            id="orden-precio"
            value={ordenPrecio}
            onChange={e => setOrdenPrecio(e.target.value)}
            style={{
              width: '220px',
              minWidth: '200px',
              flex: '1 1 200px',
              maxWidth: '280px',
              padding: '0.4rem 0.8rem', 
              borderRadius: '6px', 
              border: '1px solid #ccc', 
              fontSize: '1rem', 
              height: '2.4rem', 
              fontFamily: 'inherit', 
              margin: '0'
            }}
          >
            <option value="ninguno">↕️ Ordenar por precio</option>
            <option value="asc">Precio: menor a mayor</option>
            <option value="desc">Precio: mayor a menor</option>
          </select>
          </div>
        </div>

        {/* Grid de productos */}
        <div className="productos-grid">
          {productosFiltrados.length === 0 ? (
            <div className="no-productos">
              <h3>🔍 No se encontraron productos</h3>
              <p>No hay productos en la categoría "{categoriaSeleccionada}"</p>
              <button onClick={() => setCategoriaSeleccionada('todos')}>
                Ver todos los productos
              </button>
            </div>
          ) : (
            productosFiltrados.map(producto => {
              const precioOferta = calcularPrecioOferta(producto.precio, producto.oferta)
              const tieneOferta = producto.oferta && precioOferta !== null
              
              return (
                <div key={producto.id} className="producto-card" onClick={() => setProductoDetalle(producto)} style={{cursor:'pointer'}}>
                  <div className="producto-imagen">
                    {producto.imagen ? (
                      getImagenUrl(producto.imagen) ? (
                        <img
                          src={getImagenUrl(producto.imagen)}
                          alt={producto.nombre}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x300/f8fafc/64748b?text=Sin+Imagen'
                          }}
                          style={producto.stock !== undefined && producto.stock !== '' && !isNaN(Number(producto.stock)) && Number(producto.stock) <= 0 ? { filter: 'grayscale(1) brightness(0.85)' } : {}}
                        />
                      ) : (
                        <div className="placeholder-imagen">
                          <span>⚠️ Link de Google Photos no soportado<br/>Usa el link directo de la imagen</span>
                        </div>
                      )
                    ) : (
                      <div className="placeholder-imagen">
                        <span>📦</span>
                      </div>
                    )}
                    {producto.oferta && (
                      <div className="oferta-badge">
                        🔥
                      </div>
                    )}
                  </div>
                  
                  <div className="producto-info">
                    <div className="producto-header">
                      <h3 className="producto-nombre">{producto.nombre}</h3>
                      <p className="producto-categoria">
                        {obtenerIconoCategoria(producto.categoria)} {producto.categoria}
                      </p>
                    </div>
                    
                    <div className="producto-footer">
                      <div className="precio-container">
                        {((producto.stock === undefined || producto.stock === '' || isNaN(Number(producto.stock)) || Number(producto.stock) > 0)) ? (
                          tieneOferta ? (
                            <>
                              <span className="producto-precio-original">
                                {formatearPrecio(producto.precio)}
                              </span>
                              <span className="producto-precio-oferta">
                                {formatearPrecio(precioOferta)}
                              </span>
                            </>
                          ) : (
                            <span className="producto-precio">
                              {formatearPrecio(producto.precio)}
                            </span>
                          )
                        ) : (
                          <span className="producto-precio" style={{color:'#dc2626', fontWeight:800}}>🚫 Sin stock</span>
                        )}
                      </div>
                      <button className="agregar-carrito-btn" onClick={e => { e.stopPropagation(); agregarAlCarrito(producto); }}
                        disabled={producto.stock !== undefined && producto.stock !== '' && !isNaN(Number(producto.stock)) && Number(producto.stock) <= 0}
                        style={producto.stock !== undefined && producto.stock !== '' && !isNaN(Number(producto.stock)) && Number(producto.stock) <= 0 ? {opacity:0.5, cursor:'not-allowed'} : {}}>
                        ➕ Agregar al carrito
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Contador de productos */}
        <div className="contador">
          <p>
            📊 Mostrando <strong>{productosFiltrados.length}</strong> de <strong>{productos.length}</strong> productos
            {categoriaSeleccionada !== 'todos' && ` en ${categoriaSeleccionada}`}
        </p>
      </div>
      </main>
      <footer className="footer-app">
        <a href="https://instagram.com/alnortegrow" target="_blank" rel="noopener noreferrer">
          <img src={logo} alt="ALNORTEGROW" className="logo-footer" /> ALNORTEGROW
        </a>
      </footer>
      <a href={`https://www.whatsapp.com/catalog/${import.meta.env.VITE_TELEFONO}/`} className="whatsapp-float" target="_blank" rel="noopener noreferrer" title="Ver catálogo en WhatsApp">
        <img src={whatsappLogo} alt="WhatsApp" style={{width: '70%', height: '70%', objectFit: 'contain', display: 'block'}} />
      </a>

      {/* Notificación flotante */}
      {notificacion && (
        <div style={{
          position: 'fixed',
          top: 100,
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
    </div>
  )
}

export default App
