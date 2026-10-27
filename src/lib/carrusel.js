export function siguienteId(productos, id, paso) {
  if (!productos.length) return null;
  const indice = productos.findIndex(p => p.id === id);
  if (indice < 0) return productos[0].id;
  return productos[(indice + paso % productos.length + productos.length) % productos.length].id;
}
export function direccionGesto(dx, dy) {
  return Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.5 ? (dx < 0 ? 1 : -1) : 0;
}
