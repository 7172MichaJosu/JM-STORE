import test from 'node:test';
import assert from 'node:assert/strict';
import { whatsappPublico } from '../../server/config.js';
import { entorno } from '../fixtures/entorno.mjs';

test('destino canónico validado con max, sin publicar cadenas inválidas', () => {
  // Número reservado de ficción NANP; nunca se navega al servicio en estas pruebas.
  assert.deepEqual(whatsappPublico('+12025550123'), { disponible: true, destino: '12025550123' });
  for (const numero of [undefined, '', '+0001234', '12025550123', '+1 2025550123', '+999123456789', '+12025550123123456', '+51123', '+0123456789', 'valor secreto ficticio']) {
    assert.deepEqual(whatsappPublico(numero), { disponible: false, destino: null });
  }
});
test('API publica solo el destino válido o null', async t => {
  for (const numero of ['+12025550123', 'incorrecto']) {
    const e = await entorno({ env: { WHATSAPP_NUMBER: numero } }); t.after(() => e.cerrar());
    const datos = await (await e.pedir('/api/catalogo')).json();
    assert.deepEqual(datos.whatsapp, numero === 'incorrecto' ? { disponible: false, destino: null } : { disponible: true, destino: '12025550123' });
    assert.equal(JSON.stringify(datos).includes('incorrecto'), false);
  }
});
