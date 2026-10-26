import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirDB } from '../../server/db.js';
import { normalizarImagen } from '../../server/productos.js';
import { entorno } from '../fixtures/entorno.mjs';
import { imagenValida, imagenCorrupta } from '../fixtures/imagenes.mjs';
import { Readable } from 'node:stream';

export async function formulario(cambios = {}) {
  const f = new FormData();
  for (const [k, v] of Object.entries({ nombre: 'Taza & café + plato', descripcion: 'Cerámica, color azul', precio: '49.90', ...cambios })) f.append(k, v);
  f.append('imagen', new Blob([await imagenValida()], { type: 'image/png' }), 'imagen.png');
  return f;
}
test('alta protegida con commit e imagen persistente en una sola fila', async t => {
  const e = await entorno(); t.after(() => e.cerrar()); const cookie = await e.login();
  const enviar = async (body, headers) => e.pedir('/api/productos', { method: 'POST', headers, body });
  assert.equal((await enviar(await formulario(), e.cabeceras)).status, 401);
  assert.equal((await enviar(await formulario(), { Cookie: cookie })).status, 403);
  const r = await enviar(await formulario(), { ...e.cabeceras, Cookie: cookie }); assert.equal(r.status, 201);
  const p = await r.json(); assert.equal(p.precioCentimos, 4990); assert.match(p.id, /^[a-f0-9-]{36}$/);
  const otra = abrirDB(e.config.sqlitePath); const fila = otra.raw.prepare('SELECT * FROM productos').get(); assert.equal(fila.nombre, p.nombre); assert.ok(fila.imagen.length); otra.cerrar();
  assert.equal((await e.pedir(p.imagenUrl)).status, 200);
  e.fallos.insertar = true; assert.equal((await enviar(await formulario(), { ...e.cabeceras, Cookie: cookie })).status, 503);
  assert.equal(e.db.listar().length, 1);
});
test('multipart estricto, límites, imagen falsa y errores de campo sin altas parciales', async t => {
  const e = await entorno(); t.after(() => e.cerrar()); const cookie = await e.login();
  const enviar = body => e.pedir('/api/productos', { method: 'POST', headers: { ...e.cabeceras, Cookie: cookie }, body });
  assert.equal((await enviar(await formulario({ precio: '0' }))).status, 422);
  const repetido = await formulario(); repetido.append('nombre', 'otro'); assert.equal((await enviar(repetido)).status, 400);
  assert.equal((await enviar(await formulario({ extra: 'x' }))).status, 400);
  assert.equal((await enviar(await formulario({ nombre: 'x'.repeat(4097) }))).status, 413);
  const corrupto = await formulario(); corrupto.set('imagen', new Blob([imagenCorrupta], { type: 'image/png' }), 'falsa.png'); assert.equal((await enviar(corrupto)).status, 422);
  const doble = await formulario(); doble.append('imagen', new Blob([await imagenValida()]), 'otra.png'); assert.equal((await enviar(doble)).status, 400);
  const grande = await formulario(); grande.set('imagen', new Blob([Buffer.alloc(10485761)]), 'grande.png'); assert.equal((await enviar(grande)).status, 413);
  assert.equal(e.db.listar().length, 0);
});
test('fallo real de SQLite revierte inserción sin fila parcial', async t => {
  const e = await entorno(); t.after(() => e.cerrar()); const cookie = await e.login();
  e.db.raw.exec("CREATE TRIGGER fallo_alta BEFORE INSERT ON productos BEGIN SELECT RAISE(ABORT, 'fallo ficticio privado'); END");
  const r = await e.pedir('/api/productos', { method: 'POST', headers: { ...e.cabeceras, Cookie: cookie }, body: await formulario() });
  assert.equal(r.status, 503); assert.doesNotMatch(await r.text(), /fallo ficticio|SQLITE/); assert.equal(e.db.listar().length, 0);
});
test('cuerpo chunked mayor a 11 MiB se corta sin alta ni detalles internos', async t => {
  const e = await entorno(); t.after(() => e.cerrar()); const cookie = await e.login();
  const r = await e.pedir('/api/productos', { method: 'POST', headers: { ...e.cabeceras, Cookie: cookie, 'Content-Type': 'multipart/form-data; boundary=prueba-limite' }, body: Readable.from([Buffer.alloc(6 * 1024 * 1024), Buffer.alloc(6 * 1024 * 1024)]), duplex: 'half' });
  assert.equal(r.status, 413); assert.equal(e.db.listar().length, 0);
});
for (const causa of ['revocación', 'expiración']) {
  test(`sesión comprobada otra vez tras decodificar: ${causa} impide commit`, async t => {
    let ahora = 0; let resolver; let iniciado;
    const esperando = new Promise(r => resolver = r); const empezo = new Promise(r => iniciado = r);
    const e = await entorno({ app: { reloj: () => ahora, procesarImagen: async b => { iniciado(); await esperando; return normalizarImagen(b); } } }); t.after(() => e.cerrar());
    const cookie = await e.login();
    const promesa = e.pedir('/api/productos', { method: 'POST', headers: { ...e.cabeceras, Cookie: cookie }, body: await formulario() });
    await empezo;
    if (causa === 'revocación') await e.pedir('/api/sesion', { method: 'DELETE', headers: { ...e.cabeceras, Cookie: cookie } }); else ahora += 8 * 3600000;
    resolver(); assert.equal((await promesa).status, 401); assert.equal(e.db.listar().length, 0);
  });
}
