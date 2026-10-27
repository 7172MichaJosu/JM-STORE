import { test, expect, ingresar, llenarProducto } from '../fixtures/navegador.mjs';
import { mkdtemp, rm, writeFile, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, basename } from 'node:path';
import { createHash } from 'node:crypto';
import { abrirDB } from '../../server/db.js';
import { veinteProductos } from '../fixtures/productos.mjs';
import { idPrueba } from '../fixtures/catalogo-visual.mjs';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { hashPrueba, usuarioPrueba } from '../fixtures/entorno.mjs';
import { imagenValida } from '../fixtures/imagenes.mjs';

test('reinicio de proceso conserva alta/imagen, eliminación y otro producto; invalida sesión', async ({ page, browser }, info) => {
  const directorio = await mkdtemp(join(tmpdir(), 'jm-reinicio-'));
  expect(dirname(await realpath(directorio)).toLowerCase()).toBe((await realpath(tmpdir())).toLowerCase());
  expect(basename(directorio)).toMatch(/^jm-reinicio-[a-z0-9]+$/i);
  const reserva = createServer(); reserva.listen(0, '127.0.0.1'); await once(reserva, 'listening');
  const puerto = reserva.address().port; await new Promise(r => reserva.close(r));
  const origen = `http://127.0.0.1:${puerto}`;
  const env = { ...process.env, NODE_ENV: 'development', PORT: String(puerto), APP_ORIGIN: origen, SQLITE_PATH: join(directorio, 'persistencia.sqlite'), ADMIN_USERNAME: usuarioPrueba, ADMIN_PASSWORD_HASH: await hashPrueba(), WHATSAPP_NUMBER: '' };
  let proceso;
  function instantanea() {
    const db = abrirDB(env.SQLITE_PATH);
    try {
      return { esquema: db.raw.prepare("SELECT name, sql FROM sqlite_schema WHERE type = 'table' ORDER BY name").all(), productos: db.raw.prepare('SELECT * FROM productos ORDER BY id').all().map(({ imagen, ...p }) => ({ ...p, sha256: createHash('sha256').update(imagen).digest('hex') })) };
    } finally { db.cerrar(); }
  }
  async function arrancar() {
    proceso = spawn(process.execPath, ['server/index.js'], { cwd: process.cwd(), env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    await new Promise((resolve, reject) => {
      const tiempo = setTimeout(() => reject(new Error('El servidor de reinicio no arrancó')), 10000);
      proceso.stdout.on('data', datos => { if (datos.toString().includes('JM-STORE disponible')) { clearTimeout(tiempo); resolve(); } });
      proceso.once('exit', () => { clearTimeout(tiempo); reject(new Error('El servidor se cerró antes de arrancar')); });
    });
  }
  async function detener() { if (proceso && proceso.exitCode === null) { const salida = once(proceso, 'exit'); proceso.kill(); await salida; } }
  try {
    await arrancar();
    const base = abrirDB(env.SQLITE_PATH); const imagenBase = await imagenValida('webp');
    try { base.raw.transaction(() => { for (const [i, p] of veinteProductos().entries()) base.raw.prepare('INSERT INTO productos VALUES (?, ?, ?, ?, ?, ?)').run(idPrueba(i), p.nombre, p.descripcion, p.precioCentimos, imagenBase, 'image/webp'); })(); } finally { base.cerrar(); }
    const antes = instantanea(); await page.goto(origen); await expect(page.getByRole('article')).toHaveCount(20);
    await page.getByRole('switch').click(); await page.reload(); await expect(page.getByRole('article')).toHaveCount(20); expect(instantanea()).toEqual(antes);
    await ingresar(page, origen); expect(instantanea()).toEqual(antes); await llenarProducto(page, 'Conservado tras reinicio');
    const original = join(directorio, 'original.png'); await writeFile(original, await imagenValida()); await page.getByLabel('Imagen', { exact: true }).setInputFiles(original);
    await page.getByRole('button', { name: 'Guardar producto' }).click(); await expect(page.getByText('Producto agregado correctamente', { exact: true })).toBeVisible();
    await rm(original); await llenarProducto(page, 'Eliminado antes del reinicio'); await page.getByRole('button', { name: 'Guardar producto' }).click();
    const filas = page.locator('.fila-gestion'); await expect(filas).toHaveCount(22);
    const eliminar = filas.filter({ hasText: 'Eliminado antes del reinicio' }).getByRole('button', { name: /^Eliminar/ });
    await eliminar.click(); await page.getByRole('dialog').getByRole('button', { name: 'Cancelar' }).click(); await expect(filas).toHaveCount(22);
    await eliminar.click(); await page.getByRole('dialog').getByRole('button', { name: 'Eliminar', exact: true }).click(); await expect(filas).toHaveCount(21);
    await detener(); await arrancar();
    await page.goto(origen + '/encargado'); await expect(page.getByRole('button', { name: 'Iniciar sesión', exact: true })).toBeVisible();
    const contexto = await browser.newContext(); const publica = await contexto.newPage(); await publica.goto(origen);
    await expect(publica.getByRole('article')).toHaveCount(21); await expect(publica.getByRole('heading', { name: 'Conservado tras reinicio', exact: true })).toBeVisible();
    const tarjeta = publica.getByRole('article').filter({ hasText: 'Conservado tras reinicio' }); await expect(tarjeta.getByText('S/ 49.90', { exact: true })).toBeVisible();
    await tarjeta.locator('img').scrollIntoViewIfNeeded(); await expect.poll(() => tarjeta.locator('img').evaluate(img => img.complete && img.naturalWidth > 0)).toBeTruthy();
    const guardados = instantanea(); const ids = new Set(antes.productos.map(p => p.id));
    expect({ ...guardados, productos: guardados.productos.filter(p => ids.has(p.id)) }).toEqual(antes);
    await info.attach('persistencia-despues-de-reinicio', { body: await publica.screenshot(), contentType: 'image/png' });
    await ingresar(page, origen); await filas.filter({ hasText: 'Conservado tras reinicio' }).getByRole('button', { name: /^Eliminar/ }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Eliminar', exact: true }).click(); await expect(filas).toHaveCount(20);
    await detener(); await arrancar(); await publica.reload(); await expect(publica.getByRole('article')).toHaveCount(20); expect(instantanea()).toEqual(antes);
    await info.attach('conservacion-esquema-id-orden-hashes', { body: Buffer.from(JSON.stringify({ antes, despues: instantanea() }, null, 2)), contentType: 'application/json' });
    const resumir = estado => estado.productos.map(p => ({ id: p.id, nombre: p.nombre, precioCentimos: p.precio_centimos, imagenSha256: p.sha256, filaSha256: createHash('sha256').update(JSON.stringify(p)).digest('hex') }));
    await writeFile('specs/003-whatsapp-carrusel/evidencia/conservacion-fixture.json', JSON.stringify({ productos: 20, esquemaIdentico: true, antes: resumir(antes), despues: resumir(instantanea()) }, null, 2));
    await contexto.close();
  } finally { await detener(); await rm(directorio, { recursive: true, force: true }); }
});
