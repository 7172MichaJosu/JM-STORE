import { formatearPrecio } from './precio.js';

export function mensajeWhatsApp(producto) {
  return `Hola, JM-STORE. Me interesa este producto: ${producto.nombre}. Descripción: ${producto.descripcion}. Precio: ${formatearPrecio(producto.precioCentimos)}. ¿Podrían confirmarme su disponibilidad?`;
}
export function enlaceWhatsApp(producto, whatsapp) {
  if (!whatsapp?.disponible || !/^[1-9][0-9]{1,14}$/.test(whatsapp.destino)) return null;
  return `https://wa.me/${whatsapp.destino}?text=${encodeURIComponent(mensajeWhatsApp(producto))}`;
}
