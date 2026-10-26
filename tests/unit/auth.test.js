import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { leerCredenciales, crearAuth } from '../../server/auth.js';
import { hashPrueba, usuarioPrueba, contrasenaPrueba } from '../fixtures/entorno.mjs';

test('credenciales externas estrictas, scrypt y comparación sin enumeración', async () => {
  assert.equal(leerCredenciales({}), null);
  const hash = await hashPrueba();
  for (const valor of ['texto', hash.replace('$131072$', '$1024$'), hash + 'x', hash.replace('scrypt', 'sha256')]) {
    assert.throws(() => leerCredenciales({ ADMIN_USERNAME: usuarioPrueba, ADMIN_PASSWORD_HASH: valor }), /configuración/i);
  }
  assert.throws(() => leerCredenciales({ ADMIN_USERNAME: usuarioPrueba }), /configuración/i);
  const auth = crearAuth({ credenciales: leerCredenciales({ ADMIN_USERNAME: usuarioPrueba, ADMIN_PASSWORD_HASH: hash }), modo: 'production' });
  assert.equal(await auth.verificar(usuarioPrueba, contrasenaPrueba), true);
  assert.equal(await auth.verificar('otro', contrasenaPrueba), false);
  assert.equal(await auth.verificar(usuarioPrueba, 'incorrecta'), false);
});
test('token opaco nuevo, solo hash en memoria, revocación y ocho horas absolutas', () => {
  let ahora = 1000;
  const auth = crearAuth({ modo: 'development', credenciales: null }, { reloj: () => ahora });
  const token = auth.emitir(); const otro = auth.emitir(); assert.notEqual(token, otro);
  assert.equal(Buffer.from(token, 'base64url').length, 32);
  assert.equal(auth.sesiones.has(token), false);
  assert.ok(auth.sesiones.has(createHash('sha256').update(token).digest('hex')));
  assert.equal(auth.vigente(token), true);
  ahora += 8 * 60 * 60 * 1000; assert.equal(auth.vigente(token), false);
  const nuevo = auth.emitir(); auth.revocar(nuevo); assert.equal(auth.vigente(nuevo), false);
  assert.equal(crearAuth({ modo: 'development' }).vigente(otro), false);
});
