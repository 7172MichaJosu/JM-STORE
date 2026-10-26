import test from 'node:test';
import assert from 'node:assert/strict';
import { formatearPrecio } from '../../src/lib/precio.js';

test('soles exactos sin redondeo ni agrupadores en todo el rango', () => {
  assert.equal(formatearPrecio(1), 'S/ 0.01');
  assert.equal(formatearPrecio(4990), 'S/ 49.90');
  assert.equal(formatearPrecio(9007199254740991), 'S/ 90071992547409.91');
});
