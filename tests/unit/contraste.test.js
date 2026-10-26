import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function luminancia(hex) {
  const [r, g, b] = hex.match(/[a-f0-9]{2}/gi).map(c => parseInt(c, 16) / 255).map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return .2126 * r + .7152 * g + .0722 * b;
}
test('paleta de texto normal con contraste mínimo 4.5:1', () => {
  const tokens = readFileSync(new URL('../../src/styles/tokens.css', import.meta.url), 'utf8');
  const token = nombre => new RegExp('--' + nombre + ':\\s*#([a-f0-9]{6})', 'i').exec(tokens)[1];
  const estilos = readFileSync(new URL('../../src/styles/catalogo.css', import.meta.url), 'utf8');
  const sello = /\.arte-sello\s*\{[^}]*background:\s*#([a-f0-9]+)/i.exec(estilos)[1];
  for (const [texto, fondo] of [[token('tinta'), token('marfil')], [token('suave'), 'ffffff'], [token('suave'), 'eeefe6'], ['ffffff', token('verde')], ['ffffff', token('verde-hover')], [token('rojo'), 'ffffff'], [token('acento'), token('marfil')], ['fff7ed', sello]]) {
    const a = luminancia(texto); const b = luminancia(fondo); const razon = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    assert.ok(razon >= 4.5, `${texto}/${fondo}: ${razon.toFixed(2)}:1`);
  }
});
