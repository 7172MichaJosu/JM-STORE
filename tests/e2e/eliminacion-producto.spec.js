import { test, expect, ingresar } from '../fixtures/navegador.mjs';

for (const tema of ['claro', 'oscuro']) test.describe(`administración ${tema}`, () => {
  test.beforeEach(async ({ page }) => { await page.emulateMedia({ colorScheme: tema === 'oscuro' ? 'dark' : 'light' }); });

test('diálogo identificado, foco, cancelar/Escape sin petición y eliminar solo elegido', async ({ page }) => {
  await ingresar(page); const filas = page.locator('.fila-gestion'); const cantidad = await filas.count();
  const primera = filas.first(); const nombre = await primera.getByRole('heading').textContent();
  const boton = primera.getByRole('button', { name: /^Eliminar/ }); let peticiones = 0;
  page.on('request', req => { if (req.method() === 'DELETE' && req.url().includes('/api/productos/')) peticiones++; });
  await boton.click(); const dialogo = page.getByRole('dialog');
  await expect(dialogo.getByRole('heading')).toContainText(nombre); await expect(dialogo.getByRole('button', { name: 'Cancelar' })).toBeFocused();
  await page.keyboard.press('Shift+Tab'); await expect(dialogo.getByRole('button', { name: 'Eliminar', exact: true })).toBeFocused();
  await page.keyboard.press('Escape'); await expect(dialogo).toHaveCount(0); await expect(boton).toBeFocused(); expect(peticiones).toBe(0);
  await boton.click(); await dialogo.getByRole('button', { name: 'Cancelar' }).click(); expect(peticiones).toBe(0); await expect(filas).toHaveCount(cantidad);
  await boton.click();
  await page.route('**/api/productos/*', async route => { await new Promise(r => setTimeout(r, 200)); await route.continue(); });
  const inicio = performance.now(); await dialogo.getByRole('button', { name: 'Eliminar', exact: true }).click();
  await expect(dialogo.getByRole('button', { name: 'Eliminando…' })).toBeDisabled();
  await page.keyboard.press('Enter'); await expect(page.getByText('Producto eliminado correctamente', { exact: true })).toBeVisible();
  console.log('Eliminación automatizada (ms):', Math.round(performance.now() - inicio)); expect(peticiones).toBe(1); await expect(filas).toHaveCount(cantidad - 1);
  await page.reload(); await expect(filas).toHaveCount(cantidad - 1);
});
test('fallo conserva producto, 404 diferenciado y 204 con recarga fallida conserva resultado', async ({ page }) => {
  await ingresar(page); const boton = page.locator('.fila-gestion').first().getByRole('button', { name: /^Eliminar/ });
  await page.route('**/api/productos/*', route => route.fulfill({ status: 503, json: { mensaje: 'Error seguro' } }));
  await boton.click(); const dialogo = page.getByRole('dialog'); await dialogo.getByRole('button', { name: 'Eliminar', exact: true }).click();
  await expect(dialogo.getByText('No pudimos eliminar el producto. Inténtalo de nuevo')).toBeVisible(); await expect(page.locator('.fila-gestion')).toHaveCount(20);
  await page.unroute('**/api/productos/*');
  await page.route('**/api/productos/*', route => route.fulfill({ status: 404, json: { mensaje: 'El producto ya no está disponible' } }));
  await dialogo.getByRole('button', { name: 'Eliminar', exact: true }).click(); await expect(page.getByText('El producto ya no está disponible', { exact: true })).toBeVisible();
  await page.unroute('**/api/productos/*'); await page.locator('.fila-gestion').first().getByRole('button', { name: /^Eliminar/ }).click();
  await page.route('**/api/catalogo', route => route.abort());
  await page.getByRole('dialog').getByRole('button', { name: 'Eliminar', exact: true }).click();
  await expect(page.getByText('Producto eliminado correctamente', { exact: true })).toBeVisible(); await expect(page.getByText('No pudimos actualizar el listado. Reintenta la consulta para ver los cambios.')).toBeVisible();
});
test('último producto deja vacío; pestaña antigua no autoriza tras logout', async ({ page, context }) => {
  await ingresar(page); const datos = await (await page.request.get('/api/catalogo')).json();
  for (const p of datos.productos.slice(1)) {
    const r = await page.request.delete(`/api/productos/${p.id}`, { headers: { Origin: 'http://localhost:4175', 'X-JM-STORE-Request': '1' } }); expect(r.status()).toBe(204);
  }
  await page.reload(); await expect(page.locator('.fila-gestion')).toHaveCount(1);
  await page.getByRole('button', { name: /^Eliminar/ }).click(); await page.getByRole('dialog').getByRole('button', { name: 'Eliminar', exact: true }).click();
  await expect(page.getByText('Por el momento no hay productos disponibles')).toBeVisible();
  const antigua = await context.newPage(); await antigua.goto('http://localhost:4175/encargado');
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  const r = await antigua.request.delete(`/api/productos/${datos.productos[0].id}`, { headers: { Origin: 'http://localhost:4175', 'X-JM-STORE-Request': '1' } }); expect(r.status()).toBe(401);
  await antigua.bringToFront(); await antigua.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(antigua.getByRole('button', { name: 'Iniciar sesión', exact: true })).toBeVisible();
});

test('homónimos con ID distinto: cancelar no elimina y confirmar retira solo el elegido', async ({ page }) => {
  await ingresar(page); const datos = (await (await page.request.get('/api/catalogo')).json()).productos;
  const iguales = datos.filter(p => p.nombre === 'Nombre repetido'); expect(iguales).toHaveLength(2);
  const filas = page.locator('.fila-gestion').filter({ has: page.getByRole('heading', { name: 'Nombre repetido', exact: true }) });
  const fotoRetirada = await filas.first().locator('img').getAttribute('src');
  await filas.first().getByRole('button', { name: /^Eliminar/ }).click(); await page.getByRole('dialog').getByRole('button', { name: 'Cancelar' }).click(); await expect(filas).toHaveCount(2);
  await filas.first().getByRole('button', { name: /^Eliminar/ }).click(); await page.getByRole('dialog').getByRole('button', { name: 'Eliminar', exact: true }).click(); await expect(filas).toHaveCount(1);
  const despues = (await (await page.request.get('/api/catalogo')).json()).productos;
  expect(despues).toEqual(datos.filter(p => p.imagenUrl !== fotoRetirada));
});

});
