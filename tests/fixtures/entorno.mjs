import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { imagenValida } from './imagenes.mjs';
import { conFallos } from './fallos.mjs';

export const usuarioPrueba = 'encargado-ficticio';
export const contrasenaPrueba = 'Acceso ficticio solo para pruebas 49!';
const derivar = promisify(scrypt);
let hashPromesa;
export function hashPrueba() {
  return hashPromesa ??= (async () => {
    const salt = randomBytes(16);
    const clave = await derivar(contrasenaPrueba, salt, 64, { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 });
    return `scrypt$131072$8$1$${salt.toString('base64')}$${clave.toString('base64')}`;
  })();
}
export async function entorno(opciones = {}) {
  const { leerConfig } = await import('../../server/config.js');
  const { abrirDB } = await import('../../server/db.js');
  const { crearApp } = await import('../../server/app.js');
  const directorio = await mkdtemp(join(tmpdir(), 'jm-store-test-'));
  const config = leerConfig({ NODE_ENV: 'development', APP_ORIGIN: 'http://localhost:4175', PORT: '4175', SQLITE_PATH: join(directorio, 'prueba.sqlite'), ADMIN_USERNAME: usuarioPrueba, ADMIN_PASSWORD_HASH: await hashPrueba(), ...opciones.env });
  const db = abrirDB(config.sqlitePath);
  const fallos = {};
  const app = crearApp({ config, db: conFallos(db, fallos), ...opciones.app });
  const servidor = app.listen(0, '127.0.0.1');
  await new Promise(resolve => servidor.once('listening', resolve));
  const url = `http://127.0.0.1:${servidor.address().port}`;
  const cabeceras = { Origin: config.origin, 'X-JM-STORE-Request': '1' };
  const pedir = (ruta, init = {}) => fetch(url + ruta, init);
  return { config, db, app, fallos, url, cabeceras, directorio, pedir,
    async login() {
      const res = await pedir('/api/sesion', { method: 'POST', headers: { ...cabeceras, 'Content-Type': 'application/json' }, body: JSON.stringify({ usuario: usuarioPrueba, contrasena: contrasenaPrueba }) });
      if (res.status !== 200) throw new Error(`Login de prueba no disponible: ${res.status}`);
      return res.headers.get('set-cookie').split(';')[0];
    },
    async sembrar(productos) {
      const imagen = await imagenValida('webp');
      return productos.map(p => {
        const id = crypto.randomUUID();
        db.raw.prepare('INSERT INTO productos VALUES (?, ?, ?, ?, ?, ?)').run(id, p.nombre, p.descripcion, p.precioCentimos, imagen, 'image/webp');
        return { id, nombre: p.nombre, descripcion: p.descripcion, precioCentimos: p.precioCentimos, imagenUrl: `/api/productos/${id}/imagen` };
      });
    },
    async cerrar() {
      await new Promise(resolve => servidor.close(resolve));
      db.cerrar();
      await rm(directorio, { recursive: true, force: true });
    },
  };
}
