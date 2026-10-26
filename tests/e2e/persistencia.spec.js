import { test, expect, ingresar, llenarProducto } from '../fixtures/navegador.mjs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { hashPrueba, usuarioPrueba } from '../fixtures/entorno.mjs';
import { imagenValida } from '../fixtures/imagenes.mjs';

test('reinicio de proceso conserva alta/imagen, eliminación y otro producto; invalida sesión', async ({ page, browser }, info) => {
  const directorio = await mkdtemp(join(tmpdir(), 'jm-reinicio-'));
  const reserva = createServer(); reserva.listen(0, '127.0.0.1'); await once(reserva, 'listening');
  const puerto = reserva.address().port; await new Promise(r => reserva.close(r));
  const origen = `http://127.0.0.1:${puerto}`;
  const env = { ...process.env, NODE_ENV: 'development', PORT: String(puerto), APP_ORIGIN: origen, SQLITE_PATH: join(directorio, 'persistencia.sqlite'), ADMIN_USERNAME: usuarioPrueba, ADMIN_PASSWORD_HASH: await hashPrueba(), WHATSAPP_NUMBER: '' };
  let proceso;
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
    await arrancar(); await ingresar(page, origen); await llenarProducto(page, 'Conservado tras reinicio');
    const original = join(directorio, 'original.png'); await writeFile(original, await imagenValida()); await page.getByLabel('Imagen', { exact: true }).setInputFiles(original);
    await page.getByRole('button', { name: 'Guardar producto' }).click(); await expect(page.getByText('Producto agregado correctamente', { exact: true })).toBeVisible();
    await rm(original); await llenarProducto(page, 'Eliminado antes del reinicio'); await page.getByRole('button', { name: 'Guardar producto' }).click();
    const filas = page.locator('.fila-gestion'); await expect(filas).toHaveCount(2);
    const eliminar = filas.filter({ hasText: 'Eliminado antes del reinicio' }).getByRole('button', { name: /^Eliminar/ });
    await eliminar.click(); await page.getByRole('dialog').getByRole('button', { name: 'Cancelar' }).click(); await expect(filas).toHaveCount(2);
    await eliminar.click(); await page.getByRole('dialog').getByRole('button', { name: 'Eliminar', exact: true }).click(); await expect(filas).toHaveCount(1);
    await detener(); await arrancar();
    await page.goto(origen + '/encargado'); await expect(page.getByRole('button', { name: 'Iniciar sesión', exact: true })).toBeVisible();
    const contexto = await browser.newContext(); const publica = await contexto.newPage(); await publica.goto(origen);
    await expect(publica.getByRole('article')).toHaveCount(1); await expect(publica.getByRole('heading', { name: 'Conservado tras reinicio', exact: true })).toBeVisible();
    const tarjeta = publica.getByRole('article'); await expect(tarjeta.getByText('S/ 49.90', { exact: true })).toBeVisible();
    await tarjeta.locator('img').scrollIntoViewIfNeeded(); await expect.poll(() => tarjeta.locator('img').evaluate(img => img.complete && img.naturalWidth > 0)).toBeTruthy();
    await info.attach('persistencia-despues-de-reinicio', { body: await publica.screenshot(), contentType: 'image/png' }); await contexto.close();
  } finally { await detener(); await rm(directorio, { recursive: true, force: true }); }
});
