import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { crearImagenSocial } from '../../server/imagen-social.js';

test('imagen social en el límite de 25 millones de píxeles y entrada corrupta', async () => {
  const fuente = await sharp({ create: { width: 5000, height: 5000, channels: 3, background: '#0057d9' } }).webp().toBuffer();
  const inicio = performance.now();
  const salida = await crearImagenSocial(fuente);
  const duracionMs = Math.round(performance.now() - inicio);
  const meta = await sharp(salida).metadata();
  assert.equal(meta.format, 'jpeg');
  assert.equal(meta.width, 1200);
  assert.equal(meta.height, 630);
  await assert.rejects(crearImagenSocial(Buffer.from('imagen corrupta')));
  const directorio = 'specs/003-whatsapp-carrusel/evidencia';
  await mkdir(directorio, { recursive: true });
  await writeFile(`${directorio}/imagen-social-limite.json`, JSON.stringify({
    escenario: 'Imagen sintética uniforme de 5000 × 5000, no representa todas las compresiones',
    pixelesEntrada: 25000000, bytesEntrada: fuente.length, bytesSalida: salida.length, duracionMs,
    salida: 'JPEG 1200 × 630', limiteOficialWhatsApp: 'No se atribuye un límite no verificado',
  }, null, 2));
});
