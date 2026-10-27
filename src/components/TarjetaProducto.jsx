import { formatearPrecio } from '../lib/precio.js';
import ImagenProducto from './ImagenProducto.jsx';
import '../styles/productos.css';
import { rutaProducto } from '../lib/enlaceProducto.js';

export default function TarjetaProducto({ producto, indice = 0, accionPedido }) {
  return <article className="tarjeta-producto" aria-labelledby={'producto-' + producto.id} data-aparicion-id={'producto-' + producto.id}>
    <a className="enlace-ficha-imagen" href={rutaProducto(producto.id)} aria-label={`Ver ${producto.nombre}`}>
      <ImagenProducto src={producto.imagenUrl} alt={producto.nombre} className="producto-imagen" loading={indice < 3 ? 'eager' : 'lazy'} fetchPriority={indice < 3 ? 'high' : 'auto'} />
    </a>
    <div className="producto-contenido"><h3 id={'producto-' + producto.id}>{producto.nombre}</h3><p className="producto-descripcion">{producto.descripcion}</p><p className="producto-precio">{formatearPrecio(producto.precioCentimos)}</p>{accionPedido}</div>
  </article>;
}
