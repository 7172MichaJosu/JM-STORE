import test from 'node:test';
import assert from 'node:assert/strict';
import { entorno, usuarioPrueba, contrasenaPrueba } from '../fixtures/entorno.mjs';

test('consulta pública, login, cookie segura sin token JSON y logout revocable/idempotente', async t => {
  const e = await entorno(); t.after(() => e.cerrar());
  assert.deepEqual(await (await e.pedir('/api/sesion')).json(), { autenticado: false });
  const cookie = await e.login();
  const consulta = await e.pedir('/api/sesion', { headers: { Cookie: cookie } });
  assert.deepEqual(await consulta.json(), { autenticado: true }); assert.equal(consulta.headers.get('cache-control'), 'no-store');
  const r = await e.pedir('/api/sesion', { method: 'DELETE', headers: { ...e.cabeceras, Cookie: cookie } });
  assert.equal(r.status, 204); assert.match(r.headers.get('set-cookie'), /Max-Age=0/);
  assert.deepEqual(await (await e.pedir('/api/sesion', { headers: { Cookie: cookie } })).json(), { autenticado: false });
  assert.equal((await e.pedir('/api/sesion', { method: 'DELETE', headers: e.cabeceras })).status, 204);
  const prod = await entorno({ env: { NODE_ENV: 'production', APP_ORIGIN: 'https://tienda.example' } }); t.after(() => prod.cerrar());
  const r2 = await prod.pedir('/api/sesion', { method: 'POST', headers: { ...prod.cabeceras, 'Content-Type': 'application/json' }, body: JSON.stringify({ usuario: usuarioPrueba, contrasena: contrasenaPrueba }) });
  assert.deepEqual(await r2.json(), { autenticado: true });
  const atributos = r2.headers.get('set-cookie'); assert.match(atributos, /^__Host-jm_session=/); assert.match(atributos, /HttpOnly/); assert.match(atributos, /Secure/); assert.match(atributos, /SameSite=Strict/); assert.match(atributos, /Path=\//); assert.doesNotMatch(atributos, /Domain=/);
});
test('login: datos inválidos, límite 4KiB, quinto fallo y sexto bloqueado con plazo', async t => {
  let ahora = 1000;
  const e = await entorno({ app: { reloj: () => ahora } }); t.after(() => e.cerrar());
  const enviar = body => e.pedir('/api/sesion', { method: 'POST', headers: { ...e.cabeceras, 'Content-Type': 'application/json' }, body: typeof body === 'string' ? body : JSON.stringify(body) });
  assert.equal((await enviar('{')).status, 400);
  assert.equal((await enviar({ usuario: '', contrasena: '' })).status, 422);
  assert.equal((await enviar({ usuario: 'x', contrasena: 'x', extra: true })).status, 400);
  assert.equal((await enviar({ usuario: 'x', contrasena: 'x'.repeat(4096) })).status, 413);
  for (let i = 0; i < 5; i++) {
    const r = await enviar({ usuario: 'incorrecto', contrasena: 'incorrecta' }); assert.equal(r.status, 401); assert.equal((await r.json()).codigo, 'ACCESO_INCORRECTO');
  }
  const r = await enviar({ usuario: usuarioPrueba, contrasena: contrasenaPrueba }); assert.equal(r.status, 429); assert.ok(+r.headers.get('retry-after') > 0);
  ahora += 15 * 60 * 1000 + 1; assert.equal((await enviar({ usuario: usuarioPrueba, contrasena: contrasenaPrueba })).status, 200);
});
test('expiración absoluta y CSRF login/logout; gestión sin configuración siempre cerrada', async t => {
  let ahora = 0; const e = await entorno({ app: { reloj: () => ahora } }); t.after(() => e.cerrar());
  const cookie = await e.login(); ahora = 8 * 3600000;
  assert.deepEqual(await (await e.pedir('/api/sesion', { headers: { Cookie: cookie } })).json(), { autenticado: false });
  assert.equal((await e.pedir('/api/sesion', { method: 'DELETE', headers: { Cookie: cookie } })).status, 403);
  const cerrado = await entorno({ env: { ADMIN_USERNAME: '', ADMIN_PASSWORD_HASH: '' } }); t.after(() => cerrado.cerrar());
  const r = await cerrado.pedir('/api/sesion', { method: 'POST', headers: { ...cerrado.cabeceras, 'Content-Type': 'application/json' }, body: JSON.stringify({ usuario: 'x', contrasena: 'x' }) }); assert.equal(r.status, 503);
});
