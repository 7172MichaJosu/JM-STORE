import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';
import Icono from './Icono.jsx';
import '../styles/formulario.css';

export default function FormularioProducto({ onGuardado, onSesionTerminada, onIniciar }) {
  const [datos, setDatos] = useState({ nombre: '', descripcion: '', precio: '' });
  const [archivo, setArchivo] = useState(null); const [preview, setPreview] = useState(null); const [utilizable, setUtilizable] = useState(false);
  const [campos, setCampos] = useState({}); const [error, setError] = useState(''); const [ocupado, setOcupado] = useState(false);
  const bloqueo = useRef(false); const formulario = useRef(null); const entradaArchivo = useRef(null); const mensaje = useRef(null);
  useEffect(() => {
    setUtilizable(false); if (!archivo) { setPreview(null); return; }
    const url = URL.createObjectURL(archivo); setPreview(url); return () => URL.revokeObjectURL(url);
  }, [archivo]);
  function cambiar(evento) { setDatos(d => ({ ...d, [evento.target.name]: evento.target.value })); }
  function validar() {
    const errores = {}; const bytes = texto => new TextEncoder().encode(texto).length;
    for (const [campo, limite, requerido] of [['nombre', 4096, 'Ingresa un nombre'], ['descripcion', 32768, 'Ingresa una descripción']]) {
      if (!datos[campo].trim()) errores[campo] = requerido;
      else if (bytes(datos[campo].trim()) > limite) errores[campo] = `${campo === 'nombre' ? 'El nombre' : 'La descripción'} supera el límite de ${limite === 4096 ? '4' : '32'} KiB`;
    }
    const partes = /^([0-9]+)(?:[.,]([0-9]{1,2}))?$/.exec(datos.precio.trim());
    const centimos = partes ? BigInt(partes[1]) * 100n + BigInt((partes[2] || '').padEnd(2, '0')) : 0n;
    if (!partes || centimos <= 0n || centimos > 9007199254740991n) errores.precio = 'Ingresa un precio mayor que cero con hasta dos decimales';
    if (!archivo || !utilizable || archivo.size > 10485760 || !['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type)) errores.imagen = 'Selecciona una imagen válida';
    return errores;
  }
  function enfocarErrores(errores) {
    requestAnimationFrame(() => {
      const campo = ['nombre', 'descripcion', 'imagen', 'precio'].find(k => errores[k]);
      if (campo) formulario.current?.elements[campo]?.focus(); else mensaje.current?.focus();
    });
  }
  async function enviar(evento) {
    evento.preventDefault(); if (bloqueo.current) return;
    onIniciar?.();
    const errores = validar(); setCampos(errores); setError('');
    if (Object.keys(errores).length) { enfocarErrores(errores); return; }
    bloqueo.current = true; setOcupado(true);
    const body = new FormData(); for (const [k, v] of Object.entries(datos)) body.append(k, v.trim()); body.append('imagen', archivo);
    try {
      const producto = await api('/api/productos', { method: 'POST', body });
      setDatos({ nombre: '', descripcion: '', precio: '' }); setArchivo(null); setCampos({}); entradaArchivo.current.value = '';
      onGuardado(producto);
    } catch (e) {
      if (e.status === 401) onSesionTerminada();
      else { setCampos(e.campos || {}); setError('No pudimos guardar el producto. Inténtalo de nuevo'); enfocarErrores(e.campos || {}); }
    } finally { bloqueo.current = false; setOcupado(false); }
  }
  const ayuda = (campo, id) => `${id}${campos[campo] ? ` error-${campo}` : ''}`;
  return <section className="formulario-panel" aria-labelledby="titulo-agregar"><div className="titulo-panel"><span className="panel-icono"><Icono nombre="mas" /></span><div><h2 id="titulo-agregar">Agregar producto</h2><p>Un nuevo favorito para tu catálogo.</p></div></div>
    {error && <p className="aviso error" role="alert" tabIndex={-1} ref={mensaje}>{error}</p>}
    <form onSubmit={enviar} ref={formulario} noValidate aria-busy={ocupado}>
      <div className="campo"><label htmlFor="nombre">Nombre</label><input id="nombre" name="nombre" value={datos.nombre} onChange={cambiar} aria-describedby={ayuda('nombre', 'ayuda-nombre')} aria-invalid={!!campos.nombre} /><span id="ayuda-nombre" className="ayuda">Máximo 4 KiB de texto.</span>{campos.nombre && <span className="error-campo" id="error-nombre">{campos.nombre}</span>}</div>
      <div className="campo"><label htmlFor="descripcion">Descripción</label><textarea id="descripcion" name="descripcion" rows={4} value={datos.descripcion} onChange={cambiar} aria-describedby={ayuda('descripcion', 'ayuda-descripcion')} aria-invalid={!!campos.descripcion} /><span id="ayuda-descripcion" className="ayuda">Describe el producto. Máximo 32 KiB de texto.</span>{campos.descripcion && <span className="error-campo" id="error-descripcion">{campos.descripcion}</span>}</div>
      <div className="campo"><label htmlFor="imagen" id="etiqueta-imagen">Imagen</label><div className="archivo-control"><Icono nombre="imagen" size={28} /><span><strong>{archivo ? 'Cambiar imagen' : 'Elegir imagen del dispositivo'}</strong><small>{archivo ? 'Imagen seleccionada' : 'Tu producto, en una imagen'}</small></span><input id="imagen" name="imagen" type="file" accept="image/jpeg,image/png,image/webp" ref={entradaArchivo} aria-labelledby="etiqueta-imagen" aria-describedby={ayuda('imagen', 'ayuda-imagen')} aria-invalid={!!campos.imagen} onChange={e => { setArchivo(e.target.files?.[0] || null); setCampos(c => ({ ...c, imagen: undefined })); }} /></div><span id="ayuda-imagen" className="ayuda">JPEG, PNG o WebP estático; máximo 10 MiB y 25 millones de píxeles. Conservaremos una copia.</span>{preview && <img className="vista-previa" src={preview} alt="Vista previa de la imagen seleccionada" onLoad={e => setUtilizable(e.target.naturalWidth * e.target.naturalHeight <= 25000000)} onError={() => { setUtilizable(false); setCampos(c => ({ ...c, imagen: 'Selecciona una imagen válida' })); }} />}{campos.imagen && <span className="error-campo" id="error-imagen">{campos.imagen}</span>}</div>
      <div className="campo"><label htmlFor="precio">Precio (S/)</label><input id="precio" name="precio" inputMode="decimal" value={datos.precio} onChange={cambiar} placeholder="49.90" aria-describedby={ayuda('precio', 'ayuda-precio')} aria-invalid={!!campos.precio} /><span id="ayuda-precio" className="ayuda">Usa hasta dos decimales, sin separadores de miles.</span>{campos.precio && <span className="error-campo" id="error-precio">{campos.precio}</span>}</div>
      <button className="guardar-producto" disabled={ocupado}><Icono nombre="mas" size={18} />{ocupado ? 'Guardando…' : 'Guardar producto'}</button>
    </form>
  </section>;
}
