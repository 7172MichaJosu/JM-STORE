import test from 'node:test';
import assert from 'node:assert/strict';
import { mensajeWhatsApp, enlaceWhatsApp } from '../../src/lib/whatsapp.js';
import { productosReferencia } from '../fixtures/productos.mjs';

test('borradores individuales exactos y codificados una sola vez', () => {
  for (const p of [...productosReferencia, { ...productosReferencia[0], descripcion: 'Tildes, & +\nsalto', precioCentimos: 9007199254740991 }]) {
    const precio = p.precioCentimos === 9007199254740991 ? '90071992547409.91' : (p.precioCentimos / 100).toFixed(2);
    const esperado = `Hola, JM-STORE. Me interesa este producto: ${p.nombre}. Descripción: ${p.descripcion}. Precio: S/ ${precio}. ¿Podrían confirmarme su disponibilidad?`;
    assert.equal(mensajeWhatsApp(p), esperado);
    const url = new URL(enlaceWhatsApp(p, { disponible: true, destino: '12025550123' }));
    assert.equal(url.origin + url.pathname, 'https://wa.me/12025550123');
    assert.equal(url.searchParams.get('text'), esperado); assert.equal([...url.searchParams].length, 1);
  }
  assert.equal(enlaceWhatsApp(productosReferencia[0], { disponible: false, destino: null }), null);
});
