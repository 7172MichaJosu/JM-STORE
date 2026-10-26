import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { entorno } from '../fixtures/entorno.mjs';
import { veinteProductos } from '../fixtures/productos.mjs';

test('catálogo público completo, orden estable, proyección y nombres repetidos', async t => {
  const e = await entorno(); t.after(() => e.cerrar());
  assert.deepEqual(await (await e.pedir('/api/catalogo')).json(), { productos: [], whatsapp: { disponible: false, destino: null } });
  await e.sembrar(veinteProductos());
  const r = await e.pedir('/api/catalogo'); assert.equal(r.status, 200); assert.equal(r.headers.get('cache-control'), 'no-store');
  const datos = await r.json();
  assert.equal(datos.productos.length, 20);
  assert.deepEqual(datos.productos.map(p => p.id), datos.productos.map(p => p.id).sort());
  assert.equal(datos.productos.filter(p => p.nombre === 'Nombre repetido').length, 2);
  for (const p of datos.productos) {
    assert.deepEqual(Object.keys(p).sort(), ['id', 'nombre', 'descripcion', 'precioCentimos', 'imagenUrl'].sort());
    assert.equal(p.imagenUrl, `/api/productos/${p.id}/imagen`);
  }
});
test('copia WebP pública, ID mal formado, ausente y errores seguros', async t => {
  const e = await entorno(); t.after(() => e.cerrar());
  const [p] = await e.sembrar(veinteProductos().slice(0, 1));
  const r = await e.pedir(p.imagenUrl); assert.equal(r.status, 200);
  assert.equal(r.headers.get('content-type'), 'image/webp'); assert.equal(r.headers.get('cache-control'), 'no-store'); assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
  assert.ok((await r.arrayBuffer()).byteLength > 0);
  assert.equal((await e.pedir('/api/productos/incorrecto/imagen')).status, 400);
  assert.equal((await e.pedir(`/api/productos/${randomUUID()}/imagen`)).status, 404);
  for (const [metodo, ruta] of [['listar', '/api/catalogo'], ['imagen', p.imagenUrl]]) {
    e.fallos[metodo] = true;
    const error = await e.pedir(ruta); assert.equal(error.status, 503);
    const texto = await error.text(); assert.doesNotMatch(texto, /Fallo interno|SELECT|sqlite|scrypt/i);
  }
});
