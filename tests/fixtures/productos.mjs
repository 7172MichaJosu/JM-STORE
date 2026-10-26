export const productosReferencia = [
  { nombre: 'Taza & café + plato', descripcion: 'Cerámica, color azul', precio: '49.90', precioCentimos: 4990 },
  { nombre: 'Lámpara de mesa', descripcion: 'Luz cálida para tus espacios.', precio: '89', precioCentimos: 8900 },
  { nombre: 'Bolso de algodón', descripcion: 'Cómodo y ligero para todos los días.', precio: '35,50', precioCentimos: 3550 },
];
export const textoLargo = 'Diseño peruano & detalles + color.\n'.repeat(60) + '<script>texto visible</script>' + 'L'.repeat(300);
export function veinteProductos() {
  return Array.from({ length: 20 }, (_, i) => ({
    ...(productosReferencia[i] ?? { nombre: i < 5 ? 'Nombre repetido' : `Producto de prueba ${i + 1}`, descripcion: i === 5 ? textoLargo : 'Un detalle para disfrutar cada día.', precio: '29.90', precioCentimos: 2990 }),
  }));
}
