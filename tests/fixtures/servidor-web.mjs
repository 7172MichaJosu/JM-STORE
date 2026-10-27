import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { leerConfig } from '../../server/config.js';
import { abrirDB } from '../../server/db.js';
import { crearApp } from '../../server/app.js';
import { hashPrueba, usuarioPrueba } from './entorno.mjs';
import { veinteProductos } from './productos.mjs';
import { imagenValida } from './imagenes.mjs';
import { cargarVisuales, idPrueba } from './catalogo-visual.mjs';

const directorio = await mkdtemp(join(tmpdir(), 'jm-store-web-'));
const config = leerConfig({ NODE_ENV: 'development', APP_ORIGIN: 'http://localhost:4175', PORT: '4175', SQLITE_PATH: join(directorio, 'web.sqlite'), ADMIN_USERNAME: usuarioPrueba, ADMIN_PASSWORD_HASH: await hashPrueba() });
const db = abrirDB(config.sqlitePath);
await writeFile('.playwright-entorno.json', JSON.stringify({ sqlitePath: config.sqlitePath }));
const imagen = await imagenValida('webp');
for (const [i, p] of veinteProductos().entries()) db.raw.prepare('INSERT INTO productos VALUES (?, ?, ?, ?, ?, ?)').run(idPrueba(i), p.nombre, p.descripcion, p.precioCentimos, imagen, 'image/webp');
if (process.env.JM_CATALOGO_VISUAL === '1') await cargarVisuales(db);
const servidor = crearApp({ config, db }).listen(4175, 'localhost', () => process.stdout.write('Entorno web de pruebas disponible\n'));
async function cerrar() { servidor.close(); db.cerrar(); await rm('.playwright-entorno.json', { force: true }); await rm(directorio, { recursive: true, force: true }); process.exit(); }
process.on('SIGTERM', cerrar);
process.on('SIGINT', cerrar);
