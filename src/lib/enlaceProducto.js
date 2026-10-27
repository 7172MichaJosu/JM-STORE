export function rutaProducto(id) {
  if (typeof id !== 'string' || !id) throw new TypeError('Producto inválido');
  return `/productos/${encodeURIComponent(id)}`;
}
export function urlProducto(id, origen) {
  const url = new URL(origen);
  if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origen || url.username || url.password) throw new TypeError('Origen inválido');
  return new URL(rutaProducto(id), url).href;
}
