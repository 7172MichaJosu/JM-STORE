import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function luminancia(hex) {
  const [r, g, b] = hex.match(/[a-f0-9]{2}/gi).map(c => parseInt(c, 16) / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
  return .2126 * r + .7152 * g + .0722 * b;
}
const razon = (a, b) => (Math.max(luminancia(a), luminancia(b)) + .05) / (Math.min(luminancia(a), luminancia(b)) + .05);
const css = readFileSync(new URL('../../src/styles/tokens.css', import.meta.url), 'utf8');
for (const tema of ['claro', 'oscuro']) test(`contraste semántico ${tema}: lectura, controles, estados y foco`, () => {
  const bloque = tema === 'claro' ? /:root\s*\{([^}]+)\}/.exec(css)?.[1] : /\[data-tema="oscuro"\]\s*\{([^}]+)\}/.exec(css)?.[1];
  assert.ok(bloque, `Falta la paleta ${tema}`);
  const color = nombre => {
    const valor = new RegExp('--' + nombre + ':\\s*(#[a-f0-9]{6})', 'i').exec(bloque)?.[1];
    assert.ok(valor, `Falta --${nombre}`); return valor;
  };
  const textos = ['texto', 'texto-secundario', 'texto-atenuado'];
  for (const texto of textos) for (const fondo of ['fondo', 'superficie', 'superficie-elevada']) {
    assert.ok(razon(color(texto), color(fondo)) >= 4.5, `${tema}: ${texto}/${fondo}`);
  }
  for (const fondo of ['superficie', 'superficie-elevada']) assert.ok(razon(color('borde-control'), color(fondo)) >= 3, `${tema}: borde/${fondo}`);
  for (const estado of ['error', 'exito', 'deshabilitado']) assert.ok(razon(color(`${estado}-texto`), color(`${estado}-fondo`)) >= 4.5, `${tema}: ${estado}`);
  assert.ok(razon(color('foco'), color('superficie')) >= 3);
  for (const fondo of ['0066ff', '7c3aed']) assert.ok(razon('ffffff', fondo) >= 4.5);
  if (tema === 'oscuro') assert.ok(razon('031915', '00d99b') >= 4.5);
});
