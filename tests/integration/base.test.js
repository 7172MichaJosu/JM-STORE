import test from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { leerConfig } from '../../server/config.js';
import { abrirDB } from '../../server/db.js';
import { entorno } from '../fixtures/entorno.mjs';

const variables = { NODE_ENV: 'development', APP_ORIGIN: 'http://localhost:5173', PORT: '3001', SQLITE_PATH: join(tmpdir(), 'jm-base.sqlite') };
test('configuración cerrada y segura: origen, modo, puerto y ruta persistente', () => {
  const c = leerConfig(variables);
  assert.equal(c.origin, variables.APP_ORIGIN);
  assert.equal(c.credenciales, null);
  for (const cambio of [{ APP_ORIGIN: 'https://tienda.example/ruta' }, { NODE_ENV: 'production' }, { APP_ORIGIN: 'http://tienda.example' }, { PORT: '0' }, { SQLITE_PATH: 'relativa.sqlite' }, { SQLITE_PATH: join(process.cwd(), 'dist', 'secreto.sqlite') }, { NODE_ENV: 'otro' }]) {
    assert.throws(() => leerConfig({ ...variables, ...cambio }), /configuración/i);
  }
});
test('SQLite estricto no reemplaza filas y conserva datos al reabrir', async t => {
  const e = await entorno(); t.after(() => e.cerrar());
  assert.equal(e.db.raw.pragma('journal_mode', { simple: true }), 'delete');
  assert.equal(e.db.raw.pragma('synchronous', { simple: true }), 2);
  const sql = 'INSERT INTO productos VALUES (?, ?, ?, ?, ?, ?)';
  assert.throws(() => e.db.raw.prepare(sql).run(randomUUID(), '', 'descripción', 1, Buffer.from('x'), 'image/webp'));
  assert.throws(() => e.db.raw.prepare(sql).run(randomUUID(), 'nombre', 'descripción', -1, Buffer.from('x'), 'image/webp'));
  e.db.raw.prepare(sql).run(randomUUID(), 'Producto persistente', 'Descripción', 4990, Buffer.from('x'), 'image/webp');
  const otra = abrirDB(e.config.sqlitePath);
  assert.equal(otra.raw.prepare('SELECT count(*) AS n FROM productos').get().n, 1);
  otra.cerrar();
});
test('rutas recargables, API JSON, estáticos acotados y CSRF cerrado', async t => {
  const e = await entorno(); t.after(() => e.cerrar());
  for (const ruta of ['/', '/encargado', '/encargado/ingresar']) {
    const r = await e.pedir(ruta); assert.equal(r.status, 200); assert.match(r.headers.get('content-type'), /html/);
  }
  for (const ruta of ['/.env', '/server/config.js', '/prueba.sqlite', '/api/no-existe']) {
    const r = await e.pedir(ruta); assert.equal(r.status, 404); assert.doesNotMatch(await r.text(), /scrypt\$/);
  }
  for (const headers of [{}, { Origin: 'null' }, { Origin: 'https://ajeno.example', 'X-JM-STORE-Request': '1' }, { Origin: e.config.origin }]) {
    const r = await e.pedir('/api/sesion', { method: 'POST', headers });
    assert.equal(r.status, 403); assert.equal((await r.json()).codigo, 'ORIGEN_RECHAZADO');
    assert.equal(r.headers.get('access-control-allow-origin'), null);
  }
});
