import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

export function abrirDB(ruta) {
  mkdirSync(dirname(ruta), { recursive: true });
  const raw = new Database(ruta, { timeout: 5000 });
  raw.pragma('journal_mode = DELETE');
  raw.pragma('synchronous = FULL');
  raw.exec(`CREATE TABLE IF NOT EXISTS productos (
    id TEXT PRIMARY KEY NOT NULL,
    nombre TEXT NOT NULL CHECK(length(trim(nombre)) > 0 AND length(CAST(nombre AS BLOB)) <= 4096),
    descripcion TEXT NOT NULL CHECK(length(trim(descripcion)) > 0 AND length(CAST(descripcion AS BLOB)) <= 32768),
    precio_centimos INTEGER NOT NULL CHECK(precio_centimos BETWEEN 1 AND 9007199254740991),
    imagen BLOB NOT NULL CHECK(length(imagen) BETWEEN 1 AND 10485760),
    imagen_mime TEXT NOT NULL CHECK(imagen_mime = 'image/webp')
  ) STRICT`);
  const listado = raw.prepare('SELECT id, nombre, descripcion, precio_centimos FROM productos ORDER BY id');
  const copia = raw.prepare('SELECT imagen, imagen_mime FROM productos WHERE id = ?');
  const alta = raw.prepare('INSERT INTO productos VALUES (@id, @nombre, @descripcion, @precioCentimos, @imagen, @mime)');
  const insertar = raw.transaction(p => {
    const fila = { ...p, id: randomUUID(), mime: 'image/webp' };
    alta.run(fila);
    return productoPublico({ ...fila, precio_centimos: p.precioCentimos });
  });
  const baja = raw.prepare('DELETE FROM productos WHERE id = ?');
  const eliminar = raw.transaction(id => baja.run(id).changes > 0);
  return {
    raw,
    listar() { return listado.all().map(productoPublico); },
    imagen(id) { return copia.get(id); },
    insertar(p) { return insertar(p); },
    eliminar(id) { return eliminar(id); },
    cerrar() { raw.close(); },
  };
}
export function productoPublico(p) {
  return { id: p.id, nombre: p.nombre, descripcion: p.descripcion, precioCentimos: p.precio_centimos, imagenUrl: `/api/productos/${p.id}/imagen` };
}
