import { useRef, useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import Marco from '../components/Marco.jsx';
import Icono from '../components/Icono.jsx';
import useAparicion from '../hooks/useAparicion.js';
import '../styles/acceso.css';
import '../styles/formulario.css';

export function AccesoEncargado({ onIngresar, aviso }) {
  const [usuario, setUsuario] = useState(''); const [contrasena, setContrasena] = useState('');
  const [campos, setCampos] = useState({}); const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false); const bloqueo = useRef(false);
  const [hasta, setHasta] = useState(0); const [ahora, setAhora] = useState(Date.now());
  const formulario = useRef(null); const mensaje = useRef(null);
  const espera = Math.max(0, Math.ceil((hasta - ahora) / 1000));
  useEffect(() => { if (!hasta) return; const timer = setInterval(() => setAhora(Date.now()), 1000); return () => clearInterval(timer); }, [hasta]);
  async function enviar(evento) {
    evento.preventDefault(); if (bloqueo.current || espera) return;
    const errores = {};
    if (!usuario.trim()) errores.usuario = 'Ingresa tu usuario'; if (!contrasena) errores.contrasena = 'Ingresa tu contraseña';
    setCampos(errores); setError('');
    if (Object.keys(errores).length) { formulario.current.elements[Object.keys(errores)[0]].focus(); return; }
    bloqueo.current = true; setOcupado(true);
    try { await api('/api/sesion', { method: 'POST', body: { usuario: usuario.trim(), contrasena } }); setContrasena(''); onIngresar(); }
    catch (e) {
      setCampos(e.campos || {});
      setError(e.status === 401 ? 'No pudimos iniciar sesión. Revisa tus datos e inténtalo de nuevo' : e.status === 429 ? 'Espera unos minutos antes de volver a intentarlo' : 'No pudimos iniciar sesión. Inténtalo de nuevo');
      if (e.status === 429) { const instante = Date.now(); setAhora(instante); setHasta(instante + (e.espera || 60) * 1000); }
      requestAnimationFrame(() => mensaje.current?.focus());
    } finally { bloqueo.current = false; setOcupado(false); }
  }
  return <section className="acceso-panel" aria-labelledby="titulo-acceso"><span className="acceso-icono"><Icono nombre="candado" size={25} /></span><span className="etiqueta texto-suave">ESPACIO DEL ENCARGADO</span><h1 id="titulo-acceso">Bienvenido de nuevo.</h1><p className="texto-suave">Ingresa para mantener tu catálogo al día.</p>
    {aviso && <p className="aviso" role="status">{aviso}</p>}
    {error && <p className="aviso error" role="alert" tabIndex={-1} ref={mensaje}>{error}{espera > 0 && <span className="espera-acceso">Podrás reintentar en {espera} s.</span>}</p>}
    <form ref={formulario} onSubmit={enviar} noValidate>
      <div className="campo"><label htmlFor="usuario">Usuario</label><input id="usuario" name="usuario" autoComplete="username" value={usuario} onChange={e => setUsuario(e.target.value)} aria-invalid={!!campos.usuario} aria-describedby={campos.usuario ? 'error-usuario' : undefined} />{campos.usuario && <span id="error-usuario" className="error-campo">{campos.usuario}</span>}</div>
      <div className="campo"><label htmlFor="contrasena">Contraseña</label><input id="contrasena" name="contrasena" type="password" autoComplete="current-password" value={contrasena} onChange={e => setContrasena(e.target.value)} aria-invalid={!!campos.contrasena} aria-describedby={campos.contrasena ? 'error-contrasena' : undefined} />{campos.contrasena && <span id="error-contrasena" className="error-campo">{campos.contrasena}</span>}</div>
      <button className="acceso-enviar" disabled={ocupado || espera > 0}>{ocupado ? 'Iniciando sesión…' : 'Iniciar sesión'}<Icono nombre="flecha" size={18} /></button>
    </form><a className="acceso-volver" href="/">← Volver al catálogo</a>
  </section>;
}
export default function IniciarSesion() {
  const pagina = useRef(null); useAparicion(pagina, null, true, 'acceso');
  useEffect(() => { const c = new AbortController(); api('/api/sesion', { signal: c.signal }).then(d => { if (d.autenticado) location.replace('/encargado'); }).catch(() => {}); return () => c.abort(); }, []);
  return <Marco gestion><main ref={pagina} id="contenido" tabIndex={-1} className="contenedor acceso-pagina"><AccesoEncargado onIngresar={() => location.assign('/encargado')} /></main></Marco>;
}
