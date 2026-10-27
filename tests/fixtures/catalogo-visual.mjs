import { readFile, realpath } from 'node:fs/promises';
import { dirname, basename, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import sharp from 'sharp';

export const idPrueba = indice => `00000000-0000-4000-8000-${String(indice + 1).padStart(12, '0')}`;
const muestras = [
  ['Audífonos Bluetooth', 'Sonido que va contigo. Audífonos inalámbricos con estuche de carga.', 8990, 'audifonos.jpg', 720, 480],
  ['Auriculares Pro', 'Diseño ligero y cómodo para acompañarte a tu ritmo.', 12990, 'auriculares.jpg', 600, 600],
  ['Audífonos de diadema', 'Tus canciones favoritas, un diseño que destaca todos los días.', 19990, 'diadema.jpg', 480, 720],
];

// Solo fotos de ensayo: la oferta real nunca se siembra ni se modifica aquí.
export async function productosVisuales(cantidad = 3) {
  return Promise.all(Array.from({ length: cantidad }, async (_, i) => {
    const [nombre, descripcion, precioCentimos, archivo, width, height] = muestras[i % muestras.length];
    const original = await readFile(new URL(`./fotos/${archivo}`, import.meta.url));
    const imagen = await sharp(original).resize(width, height, { fit: 'contain', background: '#ffffff' }).webp().toBuffer();
    return { id: idPrueba(i), nombre: i < 3 ? nombre : `${nombre} ${i + 1}`, descripcion, precioCentimos, imagen };
  }));
}

export async function verificarTemporal(ruta) {
  const directorio = await realpath(dirname(resolve(ruta)));
  const temporal = await realpath(tmpdir());
  if (dirname(directorio).toLowerCase() !== temporal.toLowerCase() || !/^jm-store-web-[a-z0-9]+$/i.test(basename(directorio))) {
    throw new Error('La fixture solo admite su entorno temporal de pruebas');
  }
}

export async function cargarVisuales(db, cantidad = 3, rotacion = 0) {
  const productos = await productosVisuales(cantidad);
  const inicio = productos.length ? rotacion % productos.length : 0;
  const orden = [...productos.slice(inicio), ...productos.slice(0, inicio)];
  db.raw.transaction(() => {
    db.raw.prepare('DELETE FROM productos').run();
    const insertar = db.raw.prepare('INSERT INTO productos VALUES (?, ?, ?, ?, ?, ?)');
    for (const [i, p] of orden.entries()) insertar.run(idPrueba(i), p.nombre, p.descripcion, p.precioCentimos, p.imagen, 'image/webp');
  })();
}
