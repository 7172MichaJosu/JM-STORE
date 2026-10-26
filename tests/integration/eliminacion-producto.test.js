import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { abrirDB } from '../../server/db.js';
import { entorno } from '../fixtures/entorno.mjs';

test('eliminar por ID exacto confirma commit, conserva homónimo e imagen y persiste al reabrir', async t => {
  const e = await entorno(); t.after(() => e.cerrar());
  const [a, b] = await e.sembrar(Array.from({ length: 2 }, () => ({ nombre: 'Mismo nombre', descripcion: 'Se conservan datos', precioCentimos: 4990 })));
  const cookie = await e.login(); const headers = { ...e.cabeceras, Cookie: cookie };
  assert.equal((await e.pedir(`/api/productos/${a.id}`, { method: 'DELETE', headers: e.cabeceras })).status, 401);
  assert.equal((await e.pedir(`/api/productos/${a.id}`, { method: 'DELETE', headers: { Cookie: cookie } })).status, 403);
  assert.equal((await e.pedir('/api/productos/no-uuid', { method: 'DELETE', headers })).status, 400);
  assert.equal((await e.pedir(`/api/productos/${randomUUID()}`, { method: 'DELETE', headers })).status, 404);
  e.fallos.eliminar = true;
  assert.equal((await e.pedir(`/api/productos/${a.id}`, { method: 'DELETE', headers })).status, 503); assert.equal(e.db.listar().length, 2);
  e.fallos.eliminar = false;
  const r = await e.pedir(`/api/productos/${a.id}`, { method: 'DELETE', headers }); assert.equal(r.status, 204); assert.equal(await r.text(), '');
  const otra = abrirDB(e.config.sqlitePath); assert.equal(otra.imagen(a.id), undefined); assert.ok(otra.imagen(b.id).imagen.length); assert.equal(otra.listar()[0].id, b.id); otra.cerrar();
  await e.pedir('/api/sesion', { method: 'DELETE', headers });
  assert.equal((await e.pedir(`/api/productos/${b.id}`, { method: 'DELETE', headers })).status, 401);
});
test('sesión vencida no autoriza eliminación', async t => {
  let ahora = 0; const e = await entorno({ app: { reloj: () => ahora } }); t.after(() => e.cerrar());
  const [p] = await e.sembrar([{ nombre: 'Persistente', descripcion: 'Descripción', precioCentimos: 1 }]); const cookie = await e.login(); ahora = 8 * 3600000;
  assert.equal((await e.pedir(`/api/productos/${p.id}`, { method: 'DELETE', headers: { ...e.cabeceras, Cookie: cookie } })).status, 401); assert.equal(e.db.listar().length, 1);
});
test('fallo real de SQLite conserva fila e imagen', async t => {
  const e = await entorno(); t.after(() => e.cerrar());
  const [p] = await e.sembrar([{ nombre: 'Producto intacto', descripcion: 'Descripción intacta', precioCentimos: 4990 }]);
  e.db.raw.exec("CREATE TRIGGER fallo_baja BEFORE DELETE ON productos BEGIN SELECT RAISE(ABORT, 'fallo ficticio privado'); END");
  const cookie = await e.login(); const r = await e.pedir(`/api/productos/${p.id}`, { method: 'DELETE', headers: { ...e.cabeceras, Cookie: cookie } });
  assert.equal(r.status, 503); assert.doesNotMatch(await r.text(), /fallo ficticio|SQLITE/); assert.equal(e.db.listar().length, 1); assert.ok(e.db.imagen(p.id).imagen.length > 0);
});
