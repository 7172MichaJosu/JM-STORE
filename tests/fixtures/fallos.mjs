// Inyección exclusiva de pruebas: ninguna ruta o variable pública activa estos fallos.
export function conFallos(repositorio, estado = {}) {
  return new Proxy(repositorio, {
    get(obj, key) {
      if (typeof obj[key] !== 'function') return obj[key];
      return (...args) => {
        if (estado[key]) throw new Error('Fallo interno ficticio: nunca debe llegar al cliente');
        return obj[key](...args);
      };
    },
  });
}
