import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import Marco from '../components/Marco.jsx';
import Icono from '../components/Icono.jsx';
import TarjetaProducto from '../components/TarjetaProducto.jsx';
import EstadoCatalogo from '../components/EstadoCatalogo.jsx';
import BotonWhatsApp from '../components/BotonWhatsApp.jsx';
import '../styles/catalogo.css';

export default function Catalogo() {
  const [datos, setDatos] = useState(null);
  const [estado, setEstado] = useState('cargando');
  const [intento, setIntento] = useState(0);
  useEffect(() => {
    const controlador = new AbortController();
    setEstado('cargando');
    api('/api/catalogo', { signal: controlador.signal }).then(d => { setDatos(d); setEstado(d.productos.length ? 'listo' : 'vacio'); }).catch(e => { if (e.name !== 'AbortError') setEstado('error'); });
    return () => controlador.abort();
  }, [intento]);
  return <Marco><main id="contenido" tabIndex={-1} className="contenedor">
    <section className="hero" aria-labelledby="titulo-catalogo">
      <div className="hero-texto"><span className="etiqueta"><span className="punto" /> BIENVENIDO A JM-STORE</span><h1 id="titulo-catalogo">Tu próximo<br />favorito está <em>aquí.</em></h1><p>Descubre nuestro catálogo, elige lo que va contigo y conversemos por WhatsApp.</p><a className="boton boton-primario" href="#catalogo">Explorar el catálogo <Icono nombre="flecha" size={18} /></a><div className="hero-nota"><span /> A tu ritmo. Sin complicaciones.</div></div>
      <div className="hero-arte" aria-hidden="true"><div className="arte-circulo" /><div className="arte-arco"><span>JM<span className="arte-punto">.</span></span><small>EL ARTE DE ELEGIR</small></div><div className="arte-sello">Elige.<br />Conecta.<br /><em>Disfruta.</em></div><span className="arte-estrella">✳</span><span className="arte-pie">DETALLES QUE VAN CONTIGO</span></div>
    </section>
    <div className="pasos" aria-label="Cómo solicitar un producto">{[['01', 'Explora', 'Conoce todos los productos.'], ['02', 'Elige', 'Encuentra tu favorito.'], ['03', 'Conversemos', 'Pídelo por WhatsApp.']].map(([n, titulo, texto]) => <div className="paso" key={n}><span>{n}</span><div><strong>{titulo}</strong><p>{texto}</p></div></div>)}</div>
    <section id="catalogo" className="catalogo" aria-labelledby="titulo-productos"><div className="titulo-seccion"><div><span className="etiqueta texto-suave">DESCUBRE JM-STORE</span><h2 id="titulo-productos">Nuestro catálogo<span>.</span></h2></div>{datos && estado === 'listo' && <span className="contador">{datos.productos.length} {datos.productos.length === 1 ? 'producto' : 'productos'}</span>}</div>
      <EstadoCatalogo estado={estado} reintentar={() => setIntento(i => i + 1)} />
      {estado === 'listo' && <div className="rejilla-productos">{datos.productos.map((p, i) => <TarjetaProducto key={p.id} producto={p} indice={i} accionPedido={<BotonWhatsApp producto={p} whatsapp={datos.whatsapp} />} />)}</div>}
    </section>
  </main></Marco>;
}
