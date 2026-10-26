import { useState } from 'react';
import { formatearPrecio } from '../lib/precio.js';
import Icono from './Icono.jsx';
import '../styles/productos.css';

export default function TarjetaProducto({ producto, indice = 0, accionPedido }) {
  const [fallo, setFallo] = useState(false);
  return <article className="tarjeta-producto" aria-labelledby={`producto-${producto.id}`}>
    <div className="producto-imagen">
      {fallo ? <div className="imagen-faltante"><Icono nombre="imagen" size={36} /><span>Imagen no disponible</span></div> : <img src={producto.imagenUrl} alt={producto.nombre} loading={indice < 3 ? 'eager' : 'lazy'} fetchPriority={indice < 3 ? 'high' : 'auto'} onError={() => setFallo(true)} />}
      <span className="producto-marca" aria-hidden="true">JM.</span>
    </div>
    <div className="producto-contenido"><h3 id={`producto-${producto.id}`}>{producto.nombre}</h3><p className="producto-descripcion">{producto.descripcion}</p><p className="producto-precio">{formatearPrecio(producto.precioCentimos)}</p>{accionPedido}</div>
  </article>;
}
