import { test as base, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { abrirDB } from '../../server/db.js';
import { imagenValida } from './imagenes.mjs';
import { veinteProductos } from './productos.mjs';
import { usuarioPrueba, contrasenaPrueba } from './entorno.mjs';
import { cargarVisuales, idPrueba, verificarTemporal } from './catalogo-visual.mjs';

async function restaurar() {
  const { sqlitePath } = JSON.parse(await readFile('.playwright-entorno.json', 'utf8'));
  await verificarTemporal(sqlitePath);
  const db = abrirDB(sqlitePath);
  const imagen = await imagenValida('webp');
  db.raw.transaction(() => {
    db.raw.prepare('DELETE FROM productos').run();
    for (const [i, p] of veinteProductos().entries()) db.raw.prepare('INSERT INTO productos VALUES (?, ?, ?, ?, ?, ?)').run(idPrueba(i), p.nombre, p.descripcion, p.precioCentimos, imagen, 'image/webp');
  })(); db.cerrar();
}
export const test = base.extend({
  datosAislados: [async ({}, use) => { await restaurar(); await use(); await restaurar(); }, { auto: true }],
});
export { expect };
export async function usarCatalogoVisual(cantidad = 3, rotacion = 0) {
  const { sqlitePath } = JSON.parse(await readFile('.playwright-entorno.json', 'utf8'));
  await verificarTemporal(sqlitePath);
  const db = abrirDB(sqlitePath);
  try { await cargarVisuales(db, cantidad, rotacion); } finally { db.cerrar(); }
}
export async function ingresar(page, origen = '') {
  await page.goto(origen + '/encargado');
  await page.getByLabel('Usuario', { exact: true }).fill(usuarioPrueba);
  await page.getByLabel('Contraseña', { exact: true }).fill(contrasenaPrueba);
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Gestión del catálogo' })).toBeVisible();
}
export async function llenarProducto(page, nombre = 'Producto nuevo ficticio') {
  await page.getByLabel('Nombre', { exact: true }).fill(nombre);
  await page.getByLabel('Descripción', { exact: true }).fill('Una descripción & tildes + detalle');
  await page.getByLabel('Precio (S/)', { exact: true }).fill('49,90');
  await page.getByLabel('Imagen', { exact: true }).setInputFiles({ name: 'original.png', mimeType: 'image/png', buffer: await imagenValida() });
  const preview = page.getByRole('img', { name: 'Vista previa de la imagen seleccionada' });
  await expect(preview).toBeVisible(); await expect.poll(() => preview.evaluate(img => img.complete && img.naturalWidth > 0)).toBeTruthy();
}
export async function habilitarDestino(page) {
  await page.route(/\/api\/(?:catalogo|productos\/[^/]+)$/, async route => {
    if (route.request().method() !== 'GET') return route.continue();
    const res = await route.fetch(); const datos = await res.json();
    await route.fulfill({ status: res.status(), json: { ...datos, whatsapp: { disponible: true, destino: '12025550123' } } });
  });
}
