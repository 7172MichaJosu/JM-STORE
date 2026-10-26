import { test, expect, ingresar, llenarProducto } from '../fixtures/navegador.mjs';

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
