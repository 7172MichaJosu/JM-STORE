import { useEffect, useRef } from 'react';
import useCarrusel from '../hooks/useCarrusel.js';
import { direccionGesto } from '../lib/carrusel.js';
import { rutaProducto } from '../lib/enlaceProducto.js';
import { formatearPrecio } from '../lib/precio.js';
import ImagenProducto from './ImagenProducto.jsx';
import Icono from './Icono.jsx';
import '../styles/carrusel.css';

export default function CarruselProductos({ productos }) {
  const { idActivo, reducido, seleccionar, pausar, mover } = useCarrusel(productos);
  const gesto = useRef(null);
  const franja = useRef(null);
  const bloquearClick = useRef(false);
  const indice = productos.findIndex(p => p.id === idActivo);
  const producto = productos[indice];
  useEffect(() => {
    const lista = franja.current;
    const boton = lista?.querySelector('[aria-current="true"]');
    if (!boton) return;
    const b = boton.getBoundingClientRect(), l = lista.getBoundingClientRect();
    if (b.left < l.left) lista.scrollLeft -= l.left - b.left;
    else if (b.right > l.right) lista.scrollLeft += b.right - l.right;
  }, [idActivo]);
  if (!producto) return null;
  const comenzar = e => {
    if (e.pointerType === 'mouse' || !e.isPrimary || e.target.closest('a, button')) return;
    gesto.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    bloquearClick.current = false;
    pausar('tacto', true);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { }
  };
  const terminar = (e, cancelar = false) => {
    const inicio = gesto.current;
    if (!inicio || inicio.id !== e.pointerId) return;
    const paso = cancelar ? 0 : direccionGesto(e.clientX - inicio.x, e.clientY - inicio.y);
    if (paso) { mover(paso); bloquearClick.current = true; }
    gesto.current = null; pausar('tacto', false);
  };
  return <div className="carrusel" role="region" aria-label="Productos del catálogo" aria-roledescription="carrusel" data-activo={idActivo}
    onPointerEnter={e => { if (e.pointerType === 'mouse') pausar('puntero', true); }}
    onPointerLeave={e => { if (e.pointerType === 'mouse') pausar('puntero', false); }}
    onFocusCapture={() => pausar('foco', true)}
    onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) pausar('foco', false); }}
    onPointerDownCapture={e => { if (e.pointerType === 'touch') pausar('tacto', true); }}
    onPointerUpCapture={() => pausar('tacto', false)}
    onPointerCancelCapture={() => pausar('tacto', false)}>
    <div className="carrusel-cabecera">
      <span className="carrusel-contador">Producto {indice + 1} de {productos.length}</span>
      {productos.length > 1 && <div className="carrusel-flechas">
        <button className="carrusel-flecha" aria-label="Producto anterior" onClick={() => mover(-1)}><Icono nombre="anterior" /></button>
        <button className="carrusel-flecha" aria-label="Producto siguiente" onClick={() => mover(1)}><Icono nombre="flecha" /></button>
      </div>}
    </div>
    <div className="carrusel-superficie" onPointerDown={comenzar} onPointerUp={e => terminar(e)} onPointerCancel={e => terminar(e, true)}
      onLostPointerCapture={e => terminar(e, true)}
      onClickCapture={e => { if (bloquearClick.current) { e.preventDefault(); e.stopPropagation(); bloquearClick.current = false; } }}>
      <div className={'hero-producto carrusel-foto' + (reducido ? ' sin-transicion' : '')} key={idActivo}>
        <ImagenProducto variante="portada" src={producto.imagenUrl} alt={producto.nombre} fetchPriority="high" draggable={false} />
      </div>
    </div>
    <div className="carrusel-datos"><h2><a className="carrusel-nombre" href={rutaProducto(producto.id)}>{producto.nombre}</a></h2><p>{formatearPrecio(producto.precioCentimos)}</p></div>
    {productos.length > 1 && <div className="carrusel-miniaturas" ref={franja} aria-label="Seleccionar producto">
      {productos.map(p => <button key={p.id} className="carrusel-miniatura" data-producto={p.id} aria-label={`Ver ${p.nombre}`} aria-current={p.id === idActivo ? 'true' : undefined}
        onPointerEnter={e => { if (e.pointerType === 'mouse') seleccionar(p.id); }} onClick={() => seleccionar(p.id)}>
        <ImagenProducto variante="miniatura" src={p.imagenUrl} alt="" loading="lazy" />
      </button>)}
    </div>}
  </div>;
}
