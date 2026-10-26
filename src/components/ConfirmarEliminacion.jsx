import { useEffect, useRef, useState } from 'react';
import Icono from './Icono.jsx';
import '../styles/dialogo.css';

export default function ConfirmarEliminacion({ producto, origen, onCancelar, onConfirmar }) {
  const dialogo = useRef(null); const cancelar = useRef(null); const bloqueo = useRef(false);
  const [ocupado, setOcupado] = useState(false); const [error, setError] = useState('');
  useEffect(() => {
    const elemento = dialogo.current; elemento.showModal(); cancelar.current.focus();
    return () => { elemento.close(); if (origen?.isConnected) origen.focus(); else document.getElementById('titulo-listado')?.focus(); };
  }, [origen]);
  async function confirmar(evento) {
    evento.preventDefault(); if (bloqueo.current) return;
    bloqueo.current = true; setOcupado(true); setError('');
    try { await onConfirmar(producto); }
    catch { setError('No pudimos eliminar el producto. Inténtalo de nuevo'); }
    finally { bloqueo.current = false; setOcupado(false); }
  }
  function mantenerFoco(evento) {
    if (evento.key !== 'Tab') return;
    const controles = [...dialogo.current.querySelectorAll('button:not(:disabled)')];
    if (!controles.length) { evento.preventDefault(); dialogo.current.focus(); return; }
    if (evento.shiftKey && document.activeElement === controles[0]) { evento.preventDefault(); controles.at(-1).focus(); }
    else if (!evento.shiftKey && document.activeElement === controles.at(-1)) { evento.preventDefault(); controles[0].focus(); }
  }
  return <dialog ref={dialogo} tabIndex={-1} onKeyDown={mantenerFoco} className="dialogo-eliminar" aria-labelledby="titulo-eliminar" aria-describedby="detalle-eliminar" onCancel={e => { e.preventDefault(); if (!bloqueo.current) onCancelar(); }}>
    <span className="dialogo-icono"><Icono nombre="eliminar" size={25} /></span><h2 id="titulo-eliminar">¿Eliminar “{producto.nombre}”?</h2><p id="detalle-eliminar">Este producto y su imagen dejarán de aparecer en el catálogo.</p>
    {error && <p className="aviso error" role="alert">{error}</p>}
    <form onSubmit={confirmar}><div className="dialogo-acciones"><button type="button" className="boton-secundario" ref={cancelar} disabled={ocupado} onClick={onCancelar}>Cancelar</button><button className="boton-peligro" disabled={ocupado}>{ocupado ? 'Eliminando…' : 'Eliminar'}</button></div></form>
  </dialog>;
}
