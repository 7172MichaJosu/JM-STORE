import { test, expect, ingresar, llenarProducto, usarCatalogoVisual } from '../fixtures/navegador.mjs';

test('recorrido básico público, acceso, alta, eliminación y cierre', async ({ page }, info) => {
  await page.goto('/'); await expect(page.getByRole('article')).toHaveCount(20);
  await info.attach('catalogo-escritorio', { body: await page.screenshot(), contentType: 'image/png' });
  await ingresar(page); await llenarProducto(page, 'Recorrido entre navegadores'); await page.getByRole('button', { name: 'Guardar producto' }).click();
  await expect(page.getByText('Producto agregado correctamente', { exact: true })).toBeVisible();
  await info.attach('gestion-escritorio', { body: await page.screenshot(), contentType: 'image/png' });
  const fila = page.locator('.fila-gestion').filter({ hasText: 'Recorrido entre navegadores' }); await fila.getByRole('button', { name: /^Eliminar/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Eliminar', exact: true }).click(); await expect(page.getByText('Producto eliminado correctamente', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar sesión' }).click(); await expect(page.getByRole('button', { name: 'Iniciar sesión', exact: true })).toBeVisible();
});

for (const tema of ['claro', 'oscuro']) test(`tema, fotos completas, panel adaptable y modal en ${tema}`, async ({ page }) => {
  await usarCatalogoVisual(); await page.emulateMedia({ colorScheme: tema === 'oscuro' ? 'dark' : 'light', reducedMotion: 'no-preference' });
  await page.goto('/'); await expect(page.getByRole('article')).toHaveCount(3);
  await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', String(tema === 'oscuro'));
  for (const foto of await page.getByRole('article').locator('img').all()) {
    await expect.poll(() => foto.evaluate(e => e.complete && e.naturalWidth > 0)).toBeTruthy(); expect(await foto.evaluate(e => getComputedStyle(e).objectFit)).toBe('contain');
  }
  await page.getByRole('switch').click(); const manual = await page.getByRole('switch').getAttribute('aria-checked');
  await page.emulateMedia({ colorScheme: tema === 'oscuro' ? 'light' : 'dark' }); await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', manual);
  await ingresar(page); await page.setViewportSize({ width: 768, height: 900 });
  expect(await page.locator('.navegacion-encargado').evaluate(e => getComputedStyle(e).position)).toBe('relative');
  expect(await page.evaluate(() => document.querySelector('.formulario-panel').getBoundingClientRect().bottom <= document.querySelector('.gestion-listado').getBoundingClientRect().top)).toBeTruthy();
  await page.setViewportSize({ width: 1366, height: 900 }); expect(await page.locator('.navegacion-encargado').evaluate(e => getComputedStyle(e).position)).toBe('fixed');
  await page.evaluate(() => localStorage.removeItem('jm-store.tema')); await page.reload();
  const borrar = page.locator('.fila-gestion').first().getByRole('button', { name: /^Eliminar/ }); await borrar.click();
  const cancelar = page.getByRole('dialog').getByRole('button', { name: 'Cancelar' }); await expect(cancelar).toBeFocused();
  await page.emulateMedia({ colorScheme: tema === 'oscuro' ? 'dark' : 'light' }); await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', String(tema === 'oscuro')); await expect(cancelar).toBeFocused();
  await page.emulateMedia({ reducedMotion: 'reduce' }); expect(await cancelar.evaluate(e => getComputedStyle(e).transitionDuration)).toBe('0s');
  await page.keyboard.press('Shift+Tab'); await expect(page.getByRole('dialog').getByRole('button', { name: 'Eliminar', exact: true })).toBeFocused();
  await page.keyboard.press('Escape'); await expect(borrar).toBeFocused(); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});
