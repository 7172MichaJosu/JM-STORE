import { useEffect, useRef, useState } from 'react';
import useAparicion from '../hooks/useAparicion.js';
import { api } from '../lib/api.js';
import Marco from '../components/Marco.jsx';
import PortadaCatalogo from '../components/PortadaCatalogo.jsx';
import TarjetaProducto from '../components/TarjetaProducto.jsx';
import EstadoCatalogo from '../components/EstadoCatalogo.jsx';
import BotonWhatsApp from '../components/BotonWhatsApp.jsx';
import '../styles/catalogo.css';

export default function Catalogo() {
  const [datos, setDatos] = useState(null);
  const [estado, setEstado] = useState('cargando');
  const [intento, setIntento] = useState(0);
  const pagina = useRef(null); useAparicion(pagina, datos?.productos, estado !== 'cargando', 'catalogo');
  useEffect(() => {
    const controlador = new AbortController();
    setEstado('cargando');
    api('/api/catalogo', { signal: controlador.signal }).then(d => { setDatos(d); setEstado(d.productos.length ? 'listo' : 'vacio'); }).catch(e => { if (e.name !== 'AbortError') setEstado('error'); });
    return () => controlador.abort();
  }, [intento]);
  return <Marco><main ref={pagina} id="contenido" tabIndex={-1} className="tienda-pagina">
    <PortadaCatalogo producto={estado === 'listo' ? datos.productos[0] : null} />
    <section id="catalogo" className="catalogo contenedor" aria-labelledby="titulo-productos">
      <div className="titulo-seccion" data-aparicion-id="titulo-productos"><div><span className="etiqueta">NUESTRO CATÁLOGO</span><h2 id="titulo-productos">Productos <span>destacados</span></h2><p>Explora los productos y pide tu favorito fácilmente por WhatsApp.</p></div>
        {datos && estado === 'listo' && <span className="contador">{datos.productos.length} {datos.productos.length === 1 ? 'producto' : 'productos'}</span>}
      </div>
      <EstadoCatalogo estado={estado} reintentar={() => setIntento(i => i + 1)} />
      {estado === 'listo' && <div className="rejilla-productos">{datos.productos.map((p, i) => <TarjetaProducto key={p.id} producto={p} indice={i} accionPedido={<BotonWhatsApp producto={p} whatsapp={datos.whatsapp} />} />)}</div>}
    </section>
  </main></Marco>;
}
