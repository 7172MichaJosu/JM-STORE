import { formatearPrecio } from './precio.js';
import { urlProducto } from './enlaceProducto.js';

export function mensajeWhatsApp(producto, origen) {
  return `Hola, JM-STORE. Me interesa este producto:\n\n📦 Producto: ${producto.nombre}\n📝 Descripción: ${producto.descripcion}\n💰 Precio: ${formatearPrecio(producto.precioCentimos)}\n🔗 Enlace: ${urlProducto(producto.id, origen)}\n\n¿Podrían confirmarme su disponibilidad?`;
}
export function enlaceWhatsApp(producto, whatsapp, origen) {
  if (!whatsapp?.disponible || !/^[1-9][0-9]{1,14}$/.test(whatsapp.destino)) return null;
  return `https://wa.me/${whatsapp.destino}?text=${encodeURIComponent(mensajeWhatsApp(producto, origen))}`;
}
