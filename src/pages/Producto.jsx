import { useEffect, useState } from 'react';
import Marco from '../components/Marco.jsx';
import ImagenProducto from '../components/ImagenProducto.jsx';
import BotonWhatsApp from '../components/BotonWhatsApp.jsx';
import { api } from '../lib/api.js';
import { formatearPrecio } from '../lib/precio.js';
import '../styles/productos.css';
import '../styles/producto.css';

export default function Producto({ id }) {
  const [datos, setDatos] = useState(null);
  const [estado, setEstado] = useState('cargando');
  const [intento, setIntento] = useState(0);
  useEffect(() => {
    const controlador = new AbortController();
    setEstado('cargando');
    api(`/api/productos/${encodeURIComponent(id)}`, { signal: controlador.signal })
      .then(data => { setDatos(data); setEstado('listo'); document.title = `${data.producto.nombre} · JM-STORE`; })
      .catch(error => {
        if (error.name !== 'AbortError') {
          setDatos(null); setEstado([400, 404].includes(error.status) ? 'ausente' : 'error');
          document.title = 'Producto no disponible · JM-STORE';
        }
      });
    return () => controlador.abort();
  }, [id, intento]);
  return <Marco><main id="contenido" tabIndex={-1} className="contenedor ficha-pagina">
    <a className="ficha-volver" href="/#catalogo">Volver al catálogo</a>
    {estado === 'cargando' && <p role="status">Cargando producto…</p>}
    {estado === 'ausente' && <section className="estado-catalogo"><h1>Producto no disponible</h1><p>El producto ya no está disponible</p></section>}
    {estado === 'error' && <section className="estado-catalogo estado-error" role="alert"><h1>No pudimos cargar el producto</h1><p>Inténtalo de nuevo</p><button onClick={() => setIntento(i => i + 1)}>Reintentar</button></section>}
    {estado === 'listo' && <section className="ficha-producto" aria-labelledby="ficha-titulo">
      <ImagenProducto src={datos.producto.imagenUrl} alt={datos.producto.nombre} variante="ficha" fetchPriority="high" />
      <div className="ficha-datos"><span className="etiqueta">JM-STORE · PRODUCTO</span><h1 id="ficha-titulo">{datos.producto.nombre}</h1>
        <p className="ficha-descripcion">{datos.producto.descripcion}</p>
        <p className="ficha-precio">{formatearPrecio(datos.producto.precioCentimos)}</p>
        <BotonWhatsApp producto={datos.producto} whatsapp={datos.whatsapp} />
      </div>
    </section>}
  </main></Marco>;
}
