import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

function iniciar({ valor = null, oscuro = false, bloqueado = false, sinMedia = false } = {}) {
  const dataset = {}; const meta = { setAttribute(nombre, valor) { this[nombre] = valor; } };
  const contexto = {
    document: { documentElement: { dataset }, querySelector: () => meta },
    localStorage: { getItem(clave) { assert.equal(clave, 'jm-store.tema'); if (bloqueado) throw new Error('Bloqueado'); return valor; } },
    matchMedia: sinMedia ? undefined : () => ({ matches: oscuro }),
  };
  runInNewContext(readFileSync(new URL('../../public/assets/tema-inicial-v1.js', import.meta.url), 'utf8'), contexto);
  return dataset;
}

for (const tema of ['claro', 'oscuro']) test(`bootstrap: elección ${tema} prevalece antes de render`, () => {
  assert.deepEqual(iniciar({ valor: tema, oscuro: tema === 'claro' }), { tema, origenTema: 'manual' });
});
test('bootstrap: sin elección sigue al dispositivo y descarta valores extraños', () => {
  assert.deepEqual(iniciar({ oscuro: true }), { tema: 'oscuro', origenTema: 'sistema' });
  assert.deepEqual(iniciar({ valor: 'automatico' }), { tema: 'claro', origenTema: 'sistema' });
});
test('bootstrap: almacenamiento bloqueado y navegador sin matchMedia no impiden mostrar', () => {
  assert.deepEqual(iniciar({ bloqueado: true, oscuro: true }), { tema: 'oscuro', origenTema: 'sistema' });
  assert.deepEqual(iniciar({ bloqueado: true, sinMedia: true }), { tema: 'claro', origenTema: 'sistema' });
});
