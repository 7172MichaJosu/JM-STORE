import { test, expect } from '../fixtures/navegador.mjs';

for (const tema of ['claro', 'oscuro']) test.describe(`presentación ${tema}`, () => {
  test.beforeEach(async ({ page }) => { await page.emulateMedia({ colorScheme: tema === 'oscuro' ? 'dark' : 'light' }); });

test('20 productos, texto completo y seguro, imágenes y teclado', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('article')).toHaveCount(20);
  await expect(page.getByRole('heading', { name: 'Taza & café + plato', exact: true })).toBeVisible();
  await expect(page.getByText('<script>texto visible</script>', { exact: false })).toBeVisible();
  await expect(page.locator('article').filter({ hasText: 'Taza & café + plato' }).getByText('S/ 49.90', { exact: true })).toBeVisible();
  await page.keyboard.press('Tab'); await expect(page.getByText('Ir al contenido')).toBeFocused();
  await page.keyboard.press('Enter'); await expect(page.locator('#contenido')).toBeFocused();
});
test('vacío, carga y error de lectura con reintento', async ({ page }) => {
  let resolver;
  const espera = new Promise(r => resolver = r);
  await page.route('**/api/catalogo', async route => { await espera; await route.fulfill({ status: 503, json: { mensaje: 'No disponible' } }); });
  await page.goto('/'); await expect(page.getByText('Cargando productos…')).toBeVisible();
  resolver(); await expect(page.getByText('No pudimos cargar los productos')).toBeVisible();
  await expect(page.getByText('Por el momento no hay productos disponibles')).toHaveCount(0);
  await page.unroute('**/api/catalogo');
  await page.getByRole('button', { name: 'Reintentar' }).click(); await expect(page.getByRole('article')).toHaveCount(20);
  await page.route('**/api/catalogo', route => route.fulfill({ json: { productos: [], whatsapp: { disponible: false, destino: null } } }));
  await page.reload(); await expect(page.getByText('Por el momento no hay productos disponibles')).toBeVisible(); await expect(page.getByRole('article')).toHaveCount(0);
});
test('imagen fallida conserva el contenido y no repite la solicitud', async ({ page }) => {
  await page.route('**/imagen', route => route.abort());
  await page.goto('/'); await expect(page.getByText('Imagen no disponible').first()).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(20);
});
for (const ancho of [360, 768, 1366]) {
  test(`catálogo a ${ancho}px, texto 200 % y movimiento reducido`, async ({ page }) => {
    await page.setViewportSize({ width: ancho, height: 900 }); await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/'); await expect(page.getByRole('article')).toHaveCount(20);
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    const tarjeta = page.getByRole('article').first();
    expect(await tarjeta.evaluate(e => getComputedStyle(e).animationName)).toBe('none');
  });
}

});
