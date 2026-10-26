import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { randomFillSync } from 'node:crypto';
import { validarProducto, normalizarImagen } from '../../server/productos.js';
import { imagenValida, imagenCorrupta, svgNoAdmitido } from '../fixtures/imagenes.mjs';

const base = { nombre: '  Taza & café + plato  ', descripcion: '  Cerámica\n azul  ', precio: '49,90' };
test('textos obligatorios, límites UTF-8 y precio entero exacto sin redondeos', () => {
  assert.deepEqual(validarProducto(base), { nombre: 'Taza & café + plato', descripcion: 'Cerámica\n azul', precioCentimos: 4990 });
  for (const [texto, esperado] of [['0.01', 1], ['49', 4900], ['49.9', 4990], ['90071992547409.91', 9007199254740991]]) assert.equal(validarProducto({ ...base, precio: texto }).precioCentimos, esperado);
  for (const precio of ['', '0', '-1', 'NaN', '1e2', '49.999', '90071992547409.92', '1,000.00', '  ']) assert.throws(() => validarProducto({ ...base, precio }), e => e.status === 422 && !!e.campos.precio);
  for (const campo of ['nombre', 'descripcion']) for (const valor of ['', ' \n\t ']) assert.throws(() => validarProducto({ ...base, [campo]: valor }), e => !!e.campos[campo]);
  for (const [campo, limite] of [['nombre', 4096], ['descripcion', 32768]]) {
    const valor = 'á'.repeat(limite / 2); assert.equal(validarProducto({ ...base, [campo]: valor })[campo], valor);
    assert.throws(() => validarProducto({ ...base, [campo]: valor + 'a' }), e => !!e.campos[campo]);
  }
});
test('JPEG/PNG/WebP: copia utilizable, sin metadatos, dimensiones y orientación', async () => {
  for (const formato of ['jpeg', 'png', 'webp']) {
    const buffer = await imagenValida(formato); const copia = await normalizarImagen(buffer);
    const meta = await sharp(copia).metadata(); assert.equal(meta.format, 'webp'); assert.equal(meta.width, 320); assert.equal(meta.height, 240); assert.equal(meta.exif, undefined);
  }
  const original = await sharp(await imagenValida('jpeg')).withMetadata({ orientation: 6 }).jpeg().toBuffer();
  const meta = await sharp(await normalizarImagen(original)).metadata(); assert.equal(meta.width, 240); assert.equal(meta.height, 320); assert.equal(meta.exif, undefined);
});
test('imagen corrupta/SVG/animada/excesiva no se puede publicar', async () => {
  const png = await imagenValida();
  const pixeles = Buffer.alloc(600); pixeles.fill(255, 0, 300);
  const animada = await sharp(pixeles, { raw: { width: 10, height: 20, channels: 3, pageHeight: 10 } }).webp({ loop: 0, delay: [100, 100] }).toBuffer();
  assert.equal((await sharp(animada).metadata()).pages, 2);
  const grande = await sharp({ create: { width: 5001, height: 5000, channels: 3, background: '#eeeeee' } }).png().toBuffer();
  for (const buffer of [imagenCorrupta, svgNoAdmitido, png.subarray(0, 60), animada, Buffer.alloc(10485761), grande]) {
    await assert.rejects(() => normalizarImagen(buffer), e => e.status === 422 && !!e.campos.imagen);
  }
});
test('una entrada válida menor a 10 MiB cuya copia excede 10 MiB se rechaza', async () => {
  const original = await sharp(randomFillSync(Buffer.alloc(5000 * 5000 * 3)), { raw: { width: 5000, height: 5000, channels: 3 } }).jpeg({ quality: 30 }).toBuffer();
  assert.ok(original.length < 10485760);
  assert.equal((await sharp(original).metadata()).width, 5000);
  await assert.rejects(() => normalizarImagen(original), e => e.status === 422 && !!e.campos.imagen);
});
