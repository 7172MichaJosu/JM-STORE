import { test, expect, ingresar, llenarProducto } from '../fixtures/navegador.mjs';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { imagenValida } from '../fixtures/imagenes.mjs';

for (const tema of ['claro', 'oscuro']) test.describe(`administración ${tema}`, () => {
  test.beforeEach(async ({ page }) => { await page.emulateMedia({ colorScheme: tema === 'oscuro' ? 'dark' : 'light' }); });

test('validación, previsualización, alta una vez y copia en sesión pública sin original', async ({ page, browser }) => {
  await ingresar(page); await page.getByRole('button', { name: 'Guardar producto' }).click();
  await expect(page.getByText('Ingresa un nombre', { exact: true })).toBeVisible(); await expect(page.getByLabel('Nombre', { exact: true })).toBeFocused();
  await llenarProducto(page, 'Alta persistente de prueba');
  const directorio = await mkdtemp(join(tmpdir(), 'jm-original-')); const original = join(directorio, 'original.png');
  await writeFile(original, await imagenValida()); await page.getByLabel('Imagen', { exact: true }).setInputFiles(original);
  let envios = 0;
  await page.route('**/api/productos', async route => { envios++; await new Promise(r => setTimeout(r, 200)); await route.continue(); });
  const inicio = performance.now(); await page.getByRole('button', { name: 'Guardar producto' }).click();
  await expect(page.getByRole('button', { name: 'Guardando…' })).toBeDisabled();
  await page.getByLabel('Nombre', { exact: true }).press('Enter');
  await expect(page.getByText('Producto agregado correctamente', { exact: true })).toBeVisible(); expect(envios).toBe(1);
  console.log('Alta preparada automatizada (ms):', Math.round(performance.now() - inicio));
  await rm(directorio, { recursive: true, force: true });
  const contexto = await browser.newContext(); const publica = await contexto.newPage(); await publica.goto('http://localhost:4175/');
  const tarjeta = publica.getByRole('article').filter({ hasText: 'Alta persistente de prueba' }); await expect(tarjeta).toHaveCount(1);
  await tarjeta.locator('img').scrollIntoViewIfNeeded();
  await expect.poll(() => tarjeta.locator('img').evaluate(img => img.complete && img.naturalWidth > 0)).toBeTruthy(); await contexto.close();
});
test('fallo de alta conserva campos y archivo; éxito con recarga fallida no invita a repetir', async ({ page }) => {
  await ingresar(page); await llenarProducto(page);
  await page.route('**/api/productos', route => route.fulfill({ status: 503, json: { codigo: 'SERVICIO_NO_DISPONIBLE', mensaje: 'Error seguro' } }));
  await page.getByRole('button', { name: 'Guardar producto' }).click();
  await expect(page.getByText('No pudimos guardar el producto. Inténtalo de nuevo')).toBeVisible();
  await expect(page.getByLabel('Nombre', { exact: true })).toHaveValue('Producto nuevo ficticio');
  await expect(page.getByRole('img', { name: 'Vista previa de la imagen seleccionada' })).toBeVisible();
  await page.unroute('**/api/productos');
  await page.route('**/api/catalogo', route => route.abort());
  await page.getByRole('button', { name: 'Guardar producto' }).click();
  await expect(page.getByText('Producto agregado correctamente', { exact: true })).toBeVisible();
  await expect(page.getByText('No pudimos actualizar el listado. Reintenta la consulta para ver los cambios.')).toBeVisible();
  await expect(page.getByLabel('Nombre', { exact: true })).toHaveValue('');
});
test('sesión vencida oculta borrador y reingresar no reenvía automáticamente', async ({ page }) => {
  await ingresar(page); await llenarProducto(page, 'Borrador conservado');
  await page.context().clearCookies();
  let altas = 0; page.on('request', req => { if (req.method() === 'POST' && req.url().endsWith('/api/productos')) altas++; });
  await page.getByRole('button', { name: 'Guardar producto' }).click();
  await expect(page.getByText('Tu sesión terminó. Inicia sesión para continuar')).toBeVisible();
  await expect(page.getByLabel('Nombre', { exact: true })).not.toBeVisible();
  await page.getByLabel('Usuario', { exact: true }).fill('encargado-ficticio');
  await page.getByLabel('Contraseña', { exact: true }).fill('Acceso ficticio solo para pruebas 49!');
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await expect(page.getByLabel('Nombre', { exact: true })).toHaveValue('Borrador conservado'); expect(altas).toBe(1);
});
test('una nueva operación fallida no conserva el mensaje de éxito anterior', async ({ page }) => {
  await ingresar(page); await llenarProducto(page, 'Primera alta correcta'); await page.getByRole('button', { name: 'Guardar producto' }).click();
  await expect(page.getByText('Producto agregado correctamente', { exact: true })).toBeVisible();
  await llenarProducto(page, 'Segunda alta fallida'); await page.route('**/api/productos', route => route.fulfill({ status: 503, json: { mensaje: 'No disponible' } }));
  await page.getByRole('button', { name: 'Guardar producto' }).click(); await expect(page.getByText('No pudimos guardar el producto. Inténtalo de nuevo')).toBeVisible();
  await expect(page.getByText('Producto agregado correctamente', { exact: true })).toHaveCount(0); await expect(page.getByLabel('Nombre', { exact: true })).toHaveValue('Segunda alta fallida');
});

test('cuatro campos y vista previa completa conservados al cambiar tema y revalidar sesión', async ({ page }) => {
  await ingresar(page); await llenarProducto(page, 'Vista conservada');
  await expect(page.locator('.formulario-panel .campo')).toHaveCount(4);
  const foto = page.getByRole('img', { name: 'Vista previa de la imagen seleccionada' });
  expect(await foto.evaluate(e => getComputedStyle(e).objectFit)).toBe('contain');
  const src = await foto.getAttribute('src'); await page.getByRole('switch').click();
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByLabel('Nombre', { exact: true })).toBeVisible(); await expect(page.getByLabel('Nombre', { exact: true })).toHaveValue('Vista conservada');
  expect(await foto.getAttribute('src')).toBe(src); expect(await page.getByLabel('Imagen', { exact: true }).evaluate(e => e.files.length)).toBe(1);
});

});
