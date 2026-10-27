import { urlProducto } from '../src/lib/enlaceProducto.js';
const entidades = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escaparHtml = texto => String(texto).replace(/[&<>"']/g, caracter => entidades[caracter]);
const titulo = /<title\b[^>]*>[\s\S]*?<\/title>/gi;
const descripcion = /<meta\b[^>]*\bname\s*=\s*["']description["'][^>]*>/gi;
function cabecera(plantilla, nombre, detalle, extras = '') {
  if ((plantilla.match(titulo) || []).length !== 1 || (plantilla.match(descripcion) || []).length !== 1 || !/<\/head>/i.test(plantilla)) throw new Error('Plantilla no disponible');
  return plantilla.replace(titulo, () => `<title>${escaparHtml(nombre)}</title>`)
    .replace(descripcion, () => `<meta name="description" content="${escaparHtml(detalle)}">`)
    .replace(/<\/head>/i, () => extras + '</head>');
}
export function renderizarProductoHtml(plantilla, producto, origen) {
  const url = urlProducto(producto.id, origen);
  const imagen = new URL(`/api/productos/${encodeURIComponent(producto.id)}/imagen-social`, origen).href;
  const campos = { title: producto.nombre, type: 'website', url, image: imagen, description: producto.descripcion,
    'image:type': 'image/jpeg', 'image:width': '1200', 'image:height': '630', 'image:alt': producto.nombre,
    locale: 'es_PE', site_name: 'JM-STORE' };
  const metas = Object.entries(campos).map(([clave, valor]) => `<meta property="og:${clave}" content="${escaparHtml(valor)}">`).join('\n');
  return cabecera(plantilla, `${producto.nombre} · JM-STORE`, producto.descripcion, `<link rel="canonical" href="${escaparHtml(url)}">\n${metas}\n`);
}
export function renderizarErrorHtml(plantilla, estado) {
  const mensaje = estado === 404 ? 'El producto ya no está disponible' : 'No pudimos completar la operación. Inténtalo de nuevo';
  const contenido = `<main id="contenido"><h1>${estado === 404 ? 'Producto no disponible' : 'No pudimos cargar el producto'}</h1><p>${mensaje}</p><a href="/">Volver al catálogo</a></main>`;
  try {
    return cabecera(plantilla, 'Producto no disponible · JM-STORE', mensaje)
      .replace(/<div id=["']root["']><\/div>/, () => `<div id="root">${contenido}</div>`);
  } catch {
    return `<!doctype html><html lang="es-PE"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>JM-STORE</title></head><body>${contenido}</body></html>`;
  }
}
