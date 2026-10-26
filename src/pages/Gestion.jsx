import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';
import { formatearPrecio } from '../lib/precio.js';
import Marco from '../components/Marco.jsx';
import Icono from '../components/Icono.jsx';
import EstadoCatalogo from '../components/EstadoCatalogo.jsx';
import FormularioProducto from '../components/FormularioProducto.jsx';
import ConfirmarEliminacion from '../components/ConfirmarEliminacion.jsx';
import { AccesoEncargado } from './IniciarSesion.jsx';
import '../styles/gestion.css';

export default function Gestion() {
  const [acceso, setAcceso] = useState('verificando'); const [visitada, setVisitada] = useState(false); const [avisoSesion, setAvisoSesion] = useState('');
  const [productos, setProductos] = useState([]); const [estadoLista, setEstadoLista] = useState('cargando'); const [actualizacionFallida, setActualizacionFallida] = useState(false);
  const [resultado, setResultado] = useState(''); const [errorCerrar, setErrorCerrar] = useState(''); const [cerrando, setCerrando] = useState(false);
  const [seleccion, setSeleccion] = useState(null); const origenEliminar = useRef(null);
  const comprobacion = useRef(0); const consulta = useRef(0); const bloqueoCerrar = useRef(false); const titulo = useRef(null);
  const verificar = useCallback(async () => {
    const numero = ++comprobacion.current; setAcceso('verificando');
    try { const d = await api('/api/sesion'); if (numero !== comprobacion.current) return; setAcceso(d.autenticado ? 'autenticado' : 'sinSesion'); if (d.autenticado) setVisitada(true); }
    catch { if (numero === comprobacion.current) setAcceso('error'); }
  }, []);
  useEffect(() => {
    verificar();
    const alVolver = () => verificar();
    window.addEventListener('focus', alVolver); window.addEventListener('pageshow', alVolver);
    return () => { comprobacion.current++; window.removeEventListener('focus', alVolver); window.removeEventListener('pageshow', alVolver); };
  }, [verificar]);
  const cargar = useCallback(async (posterior = false) => {
    const numero = ++consulta.current; setEstadoLista('cargando'); setActualizacionFallida(false);
    try { const d = await api('/api/catalogo'); if (numero !== consulta.current) return; setProductos(d.productos); setEstadoLista(d.productos.length ? 'listo' : 'vacio'); }
    catch { if (numero === consulta.current) { setEstadoLista('error'); setActualizacionFallida(posterior); } }
  }, []);
  useEffect(() => { if (acceso === 'autenticado') cargar(); }, [acceso, cargar]);
  function sesionTerminada() { comprobacion.current++; setAcceso('sinSesion'); setResultado(''); setAvisoSesion('Tu sesión terminó. Inicia sesión para continuar'); }
  function alIngresar() { setAvisoSesion(''); verificar().then(() => requestAnimationFrame(() => titulo.current?.focus())); }
  async function eliminar(producto) {
    try {
      await api(`/api/productos/${producto.id}`, { method: 'DELETE' });
      setSeleccion(null); setResultado('Producto eliminado correctamente'); cargar(true);
    } catch (e) {
      if (e.status === 401) { setSeleccion(null); sesionTerminada(); }
      else if (e.status === 404) { setSeleccion(null); setResultado('El producto ya no está disponible'); cargar(true); }
      else throw e;
    }
  }
  async function cerrarSesion() {
    if (bloqueoCerrar.current) return; bloqueoCerrar.current = true; setCerrando(true); setErrorCerrar('');
    try { await api('/api/sesion', { method: 'DELETE' }); comprobacion.current++; consulta.current++; setVisitada(false); setProductos([]); setResultado(''); location.assign('/encargado/ingresar'); }
    catch { setErrorCerrar('No pudimos confirmar el cierre de sesión. Inténtalo de nuevo'); }
    finally { bloqueoCerrar.current = false; setCerrando(false); }
  }
  return <Marco gestion><main id="contenido" tabIndex={-1} className="contenedor gestion-pagina">
    {acceso === 'verificando' && <p className="aviso" role="status">Verificando acceso…</p>}
    {acceso === 'error' && <div className="estado-catalogo" role="alert"><h1>No pudimos verificar tu acceso. Inténtalo de nuevo</h1><button onClick={verificar}>Reintentar</button></div>}
    {acceso === 'sinSesion' && <AccesoEncargado onIngresar={alIngresar} aviso={avisoSesion} />}
    {visitada && <div className="gestion-protegida" hidden={acceso !== 'autenticado'}>
      <div className="gestion-titulo"><div><span className="etiqueta texto-suave">ESPACIO DEL ENCARGADO</span><h1 ref={titulo} tabIndex={-1}>Gestión del catálogo</h1><p>Haz espacio para nuevos favoritos.</p></div><button className="boton-secundario" onClick={cerrarSesion} disabled={cerrando}><Icono nombre="salir" size={18} />{cerrando ? 'Cerrando sesión…' : 'Cerrar sesión'}</button></div>
      {errorCerrar && <p className="aviso error" role="alert">{errorCerrar}</p>}
      {resultado && <p className="aviso" role="status">{resultado}</p>}
      {actualizacionFallida && <p className="aviso error" role="alert">No pudimos actualizar el listado. Reintenta la consulta para ver los cambios.</p>}
      <div className="gestion-columnas"><FormularioProducto onIniciar={() => { setResultado(''); setActualizacionFallida(false); }} onSesionTerminada={sesionTerminada} onGuardado={() => { setResultado('Producto agregado correctamente'); cargar(true); }} />
        <section className="gestion-listado" aria-labelledby="titulo-listado"><div className="listado-titulo"><h2 id="titulo-listado" tabIndex={-1}>Productos del catálogo</h2><span className="contador">{productos.length}</span></div><EstadoCatalogo estado={estadoLista} reintentar={() => cargar(!!resultado)} />
          {estadoLista === 'listo' && <ul className="lista-gestion">{productos.map(p => <li key={p.id} className="fila-gestion"><div className="miniatura-gestion"><img src={p.imagenUrl} alt={p.nombre} onError={e => { e.currentTarget.hidden = true; }} /><span>JM.</span></div><div className="fila-texto"><h3>{p.nombre}</h3><p>{p.descripcion}</p><strong>{formatearPrecio(p.precioCentimos)}</strong></div><button className="eliminar-fila" onClick={e => { origenEliminar.current = e.currentTarget; setResultado(''); setActualizacionFallida(false); setSeleccion(p); }} aria-label={`Eliminar ${p.nombre}`}><Icono nombre="eliminar" size={16} /><span aria-hidden="true">Eliminar</span></button></li>)}</ul>}
        </section>
      </div>
      {seleccion && acceso === 'autenticado' && <ConfirmarEliminacion producto={seleccion} origen={origenEliminar.current} onCancelar={() => setSeleccion(null)} onConfirmar={eliminar} />}
    </div>}
  </main></Marco>;
}
