import { formatearPrecio } from '../lib/precio.js';
import ImagenProducto from './ImagenProducto.jsx';
import '../styles/productos.css';

export default function TarjetaProducto({ producto, indice = 0, accionPedido }) {
  return <article className="tarjeta-producto" aria-labelledby={'producto-' + producto.id} data-aparicion-id={'producto-' + producto.id}>
    <ImagenProducto src={producto.imagenUrl} alt={producto.nombre} className="producto-imagen" loading={indice < 3 ? 'eager' : 'lazy'} fetchPriority={indice < 3 ? 'high' : 'auto'} />
    <div className="producto-contenido"><h3 id={'producto-' + producto.id}>{producto.nombre}</h3><p className="producto-descripcion">{producto.descripcion}</p><p className="producto-precio">{formatearPrecio(producto.precioCentimos)}</p>{accionPedido}</div>
  </article>;
}
