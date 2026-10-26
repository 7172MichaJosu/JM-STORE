export function formatearPrecio(centimos) {
  if (!Number.isSafeInteger(centimos) || centimos <= 0) throw new RangeError('Precio inválido');
  const entero = BigInt(centimos);
  return `S/ ${entero / 100n}.${String(entero % 100n).padStart(2, '0')}`;
}
