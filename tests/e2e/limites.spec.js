import { test, expect, ingresar, llenarProducto, habilitarDestino, usarCatalogoVisual } from '../fixtures/navegador.mjs';
import { writeFile } from 'node:fs/promises';

for (const tema of ['claro', 'oscuro']) test.describe(`presentación ${tema}`, () => {
  test.beforeEach(async ({ page }) => { await page.emulateMedia({ colorScheme: tema === 'oscuro' ? 'dark' : 'light' }); });

test('V-08.1 vacío sin productos ficticios', async ({ page }) => {
  await page.route('**/api/catalogo', route => route.fulfill({ json: { productos: [], whatsapp: { disponible: false, destino: null } } }));
  await page.goto('/'); await expect(page.getByText('Por el momento no hay productos disponibles')).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(0); await expect(page.getByRole('link', { name: 'Pedir por WhatsApp' })).toHaveCount(0);
});
test('V-08.2 imagen perdida conserva pedido y datos', async ({ page }) => {
  await habilitarDestino(page); await page.route('**/imagen', route => route.abort()); await page.goto('/');
  const tarjeta = page.getByRole('article').filter({ has: page.getByRole('heading', { name: 'Taza & café + plato', exact: true }) });
  await tarjeta.locator('.producto-imagen').scrollIntoViewIfNeeded();
  await expect(tarjeta.getByText('Imagen no disponible')).toBeVisible(); await expect(tarjeta.getByText('S/ 49.90', { exact: true })).toBeVisible(); await expect(tarjeta.getByRole('link', { name: 'Pedir por WhatsApp' })).toHaveAttribute('href', /wa.me/);
});
test('V-08.3 precios inválidos y archivo corrupto conservan datos sin guardar', async ({ page }) => {
  await ingresar(page); await llenarProducto(page, 'Datos conservados'); let peticiones = 0;
  page.on('request', r => { if (r.method() === 'POST' && r.url().endsWith('/api/productos')) peticiones++; });
  for (const precio of ['0', '-1', 'NaN', '1e2', '49.999']) {
    await page.getByLabel('Precio (S/)', { exact: true }).fill(precio); await page.getByRole('button', { name: 'Guardar producto' }).click();
    await expect(page.getByText('Ingresa un precio mayor que cero con hasta dos decimales', { exact: true })).toBeVisible();
  }
  await page.getByLabel('Precio (S/)', { exact: true }).fill('49.90');
  await page.getByLabel('Imagen', { exact: true }).setInputFiles({ name: 'falsa.png', mimeType: 'image/png', buffer: Buffer.from('archivo corrupto') });
  await expect(page.getByText('Selecciona una imagen válida', { exact: true })).toBeVisible(); await page.getByRole('button', { name: 'Guardar producto' }).click();
  expect(peticiones).toBe(0); await expect(page.getByLabel('Nombre', { exact: true })).toHaveValue('Datos conservados');
});
test('V-08.4 lectura fallida se recupera con reintento', async ({ page }) => {
  await page.route('**/api/catalogo', route => route.fulfill({ status: 503, json: { mensaje: 'No disponible' } })); await page.goto('/');
  await expect(page.getByText('No pudimos cargar los productos')).toBeVisible(); await page.unroute('**/api/catalogo');
  await page.getByRole('button', { name: 'Reintentar' }).click(); await expect(page.getByRole('article')).toHaveCount(20);
});
test('V-08.5 guardado fallido conserva archivo y reintento agrega una vez', async ({ page }) => {
  await ingresar(page); await llenarProducto(page, 'Reintento seguro');
  await page.route('**/api/productos', route => route.abort()); await page.getByRole('button', { name: 'Guardar producto' }).click();
  await expect(page.getByText('No pudimos guardar el producto. Inténtalo de nuevo')).toBeVisible();
  await expect(page.getByText('Producto agregado correctamente', { exact: true })).toHaveCount(0);
  await page.unroute('**/api/productos'); await page.getByRole('button', { name: 'Guardar producto' }).click();
  await expect(page.getByText('Producto agregado correctamente', { exact: true })).toBeVisible(); await expect(page.locator('.fila-gestion').filter({ hasText: 'Reintento seguro' })).toHaveCount(1);
});
test('V-08.6 eliminación fallida y reintento preservan otros productos', async ({ page }) => {
  await ingresar(page); await page.locator('.fila-gestion').first().getByRole('button', { name: /^Eliminar/ }).click();
  await page.route('**/api/productos/*', route => route.fulfill({ status: 503, json: { mensaje: 'No disponible' } }));
  await page.getByRole('dialog').getByRole('button', { name: 'Eliminar', exact: true }).click();
  await expect(page.getByText('No pudimos eliminar el producto. Inténtalo de nuevo')).toBeVisible(); await expect(page.locator('.fila-gestion')).toHaveCount(20);
  await page.unroute('**/api/productos/*'); await page.getByRole('dialog').getByRole('button', { name: 'Eliminar', exact: true }).click();
  await expect(page.getByText('Producto eliminado correctamente', { exact: true })).toBeVisible(); await expect(page.locator('.fila-gestion')).toHaveCount(19);
});
test('V-08.7 destino no disponible y revisión de español/soles/sin pagos', async ({ page }) => {
  await page.goto('/'); await expect(page.getByRole('button', { name: 'Pedir por WhatsApp' }).first()).toBeDisabled();
  await expect(page.getByText('Los pedidos por WhatsApp no están disponibles por el momento').first()).toBeVisible();
  for (const precio of await page.locator('.producto-precio').allTextContents()) expect(precio).toMatch(/^S\/ [0-9]+\.[0-9]{2}$/);
  await expect(page.getByRole('textbox')).toHaveCount(0);
  expect(await page.locator('body').innerText()).not.toMatch(/scrypt\$|SELECT |SQLITE_PATH|ADMIN_PASSWORD|pedido enviado|carrito|pasarela/i);
  await ingresar(page); const etiquetas = await page.locator('form label').allTextContents(); expect(etiquetas).toEqual(['Nombre', 'Descripción', 'Precio (S/)', 'Imagen']);
});

});

for (const tema of ['claro', 'oscuro']) for (const ancho of [639, 640, 1199, 1200]) test(`límite responsive ${ancho} en ${tema}`, async ({ page }) => {
  await usarCatalogoVisual(); await page.setViewportSize({ width: ancho, height: 900 }); await page.emulateMedia({ colorScheme: tema === 'oscuro' ? 'dark' : 'light' });
  await page.goto('/'); await expect(page.getByRole('article')).toHaveCount(3);
  const datos = await page.getByRole('article').first().evaluate(e => {
    const foto = e.querySelector('.imagen-producto').getBoundingClientRect(), contenido = e.querySelector('.producto-contenido').getBoundingClientRect();
    return { columnas: getComputedStyle(e.parentElement).gridTemplateColumns.split(' ').length, vertical: foto.bottom <= contenido.top + 2, desborde: document.documentElement.scrollWidth > innerWidth };
  });
  expect(datos.columnas).toBe(ancho < 640 ? 1 : ancho < 1200 ? 2 : 3); expect(datos.vertical).toBe(ancho < 1200); expect(datos.desborde).toBeFalsy();
  await ingresar(page);
  expect(await page.locator('.navegacion-encargado').evaluate(e => getComputedStyle(e).position === 'fixed')).toBe(ancho >= 1200);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});

for (const tema of ['claro', 'oscuro']) test(`cinco aperturas frías con veinte fotografías: ${tema}`, async ({ browser }) => {
  await usarCatalogoVisual(20); const mediciones = [];
  for (let apertura = 1; apertura <= 5; apertura++) {
    const contexto = await browser.newContext({ baseURL: 'http://localhost:4175', viewport: { width: 1672, height: 941 }, colorScheme: tema === 'oscuro' ? 'dark' : 'light', reducedMotion: 'no-preference', locale: 'es-PE' });
    try {
      const pagina = await contexto.newPage(); await habilitarDestino(pagina); const inicio = performance.now(); await pagina.goto('/');
      await expect(pagina.getByRole('article')).toHaveCount(20); await pagina.evaluate(() => document.fonts.ready);
      for (let i = 0; i < 3; i++) {
        const tarjeta = pagina.getByRole('article').nth(i);
        await expect(tarjeta.getByRole('heading')).toBeVisible(); await expect(tarjeta.locator('.producto-precio')).toBeVisible(); await expect(tarjeta.getByRole('link', { name: 'Pedir por WhatsApp' })).toBeEnabled();
        await expect.poll(() => tarjeta.locator('img').evaluate(e => e.complete && e.naturalWidth > 0)).toBeTruthy();
      }
      const usableMs = Math.round(performance.now() - inicio); const inicioTema = performance.now(); await pagina.getByRole('switch').click();
      await expect(pagina.getByRole('switch')).toHaveAttribute('aria-checked', String(tema !== 'oscuro')); const temaMs = Math.round(performance.now() - inicioTema); expect(temaMs).toBeLessThanOrEqual(500);
      for (const tarjeta of await pagina.getByRole('article').all()) { await tarjeta.scrollIntoViewIfNeeded(); await expect(tarjeta.getByRole('heading')).toBeVisible(); }
      expect(new Set(await pagina.getByRole('article').evaluateAll(es => es.map(e => e.dataset.aparicionId))).size).toBe(20);
      mediciones.push({ apertura, usableMs, temaMs });
    } finally { await contexto.close(); }
  }
  expect(mediciones.filter(m => m.usableMs <= 3000).length).toBeGreaterThanOrEqual(4);
  const resultado = { tema, navegador: browser.version(), plataforma: process.platform, viewport: '1672x941', productos: 20, cache: 'contextos nuevos; localhost sin throttling; fuente incluida', mediciones };
  console.log('SC-007', JSON.stringify(resultado)); await writeFile(`specs/003-whatsapp-carrusel/evidencia/rendimiento-${tema}.json`, JSON.stringify(resultado, null, 2));
});
