import { test, expect, ingresar, llenarProducto, habilitarDestino } from '../fixtures/navegador.mjs';

async function observar(page) {
  await page.addInitScript(() => {
    window.efectos = [];
    for (const tipo of ['animationstart', 'animationend', 'animationcancel']) document.addEventListener(tipo, e => {
      if (e.animationName.startsWith('jm-')) window.efectos.push({ tipo, nombre: e.animationName, id: e.target.dataset.aparicionId || 'pantalla', duracion: parseFloat(getComputedStyle(e.target).animationDuration) * 1000 });
    }, true);
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
}
const inicios = (page, id) => page.evaluate(id => window.efectos.filter(e => e.tipo === 'animationstart' && e.id === id).length, id);

test('aparece una vez por visita, sin repetir por scroll ni tema; historial permite nueva entrada', async ({ page }) => {
  await observar(page); await page.goto('/'); await expect(page.getByRole('article')).toHaveCount(20);
  const ultima = page.getByRole('article').last(), id = await ultima.getAttribute('data-aparicion-id');
  await ultima.scrollIntoViewIfNeeded(); await expect.poll(() => inicios(page, id)).toBe(1);
  await expect(page.locator('.apareciendo, .entrada-pantalla')).toHaveCount(0);
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await ultima.scrollIntoViewIfNeeded();
  await page.getByRole('switch').click(); await ultima.scrollIntoViewIfNeeded(); expect(await inicios(page, id)).toBe(1);
  const duraciones = await page.evaluate(() => window.efectos.filter(e => e.tipo === 'animationstart').map(e => e.duracion));
  for (const ms of duraciones) { expect(ms).toBeGreaterThanOrEqual(150); expect(ms).toBeLessThanOrEqual(350); }
  await page.evaluate(() => { window.visitaPrevia = true; }); await page.goto('/encargado/ingresar'); await page.goBack();
  await expect.poll(async () => (await inicios(page, 'pantalla')) >= (await page.evaluate(() => window.visitaPrevia ? 2 : 1))).toBeTruthy();
});

test('validación, tema y actualización de productos no repiten apariciones existentes', async ({ page }) => {
  await observar(page); await ingresar(page); const primera = page.locator('.fila-gestion').first(); await primera.scrollIntoViewIfNeeded();
  const id = await primera.getAttribute('data-aparicion-id'); await expect(page.locator('.apareciendo, .entrada-pantalla')).toHaveCount(0);
  const antes = await inicios(page, id); await page.getByRole('button', { name: 'Guardar producto' }).click(); await expect(page.getByText('Ingresa un nombre', { exact: true })).toBeVisible();
  await page.getByRole('switch').click(); await llenarProducto(page, 'Aparición de producto nuevo'); await page.getByRole('button', { name: 'Guardar producto' }).click();
  await expect(page.locator('.fila-gestion')).toHaveCount(21); await primera.scrollIntoViewIfNeeded(); expect(await inicios(page, id)).toBe(antes);
  await page.evaluate(() => dispatchEvent(new Event('focus'))); await expect(primera).toBeVisible(); expect(await inicios(page, id)).toBe(antes);
});

test('movimiento reducido inicial consume apariciones y no las reproduce al desactivarlo', async ({ page }) => {
  await observar(page); await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/'); await expect(page.getByRole('article')).toHaveCount(20);
  await page.getByRole('article').last().scrollIntoViewIfNeeded(); expect(await page.evaluate(() => window.efectos)).toEqual([]);
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await page.getByRole('article').last().scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => window.efectos)).toEqual([]);
});

test('reducir movimiento en vivo cancela efectos y conserva modal y foco', async ({ page }) => {
  await observar(page); await ingresar(page); await page.locator('.fila-gestion').first().getByRole('button', { name: /^Eliminar/ }).click();
  await page.emulateMedia({ reducedMotion: 'reduce' }); const dialogo = page.getByRole('dialog'); await expect(dialogo).toBeVisible(); await expect(dialogo.getByRole('button', { name: 'Cancelar' })).toBeFocused();
  await expect(page.locator('.apareciendo, .entrada-pantalla')).toHaveCount(0);
  const cantidad = await page.evaluate(() => window.efectos.length); await page.emulateMedia({ reducedMotion: 'no-preference' }); await page.keyboard.press('Escape');
  await page.locator('.fila-gestion').last().scrollIntoViewIfNeeded(); expect(await page.evaluate(() => window.efectos.length)).toBe(cantidad);
});

test('sin IntersectionObserver el catálogo permanece visible y usable', async ({ page }) => {
  await observar(page); await page.addInitScript(() => { window.IntersectionObserver = undefined; }); await page.goto('/');
  await expect(page.getByRole('article')).toHaveCount(20); await page.getByRole('article').last().scrollIntoViewIfNeeded();
  expect(await page.getByRole('article').last().evaluate(e => getComputedStyle(e).opacity)).toBe('1'); expect(await page.evaluate(() => window.efectos)).toEqual([]);
});

test('activar movimiento reducido durante una aparición produce cancelación real sin repetirla', async ({ page }) => {
  await observar(page); await page.goto('/'); await expect(page.getByRole('article')).toHaveCount(20);
  const ultima = page.getByRole('article').last(), id = await ultima.getAttribute('data-aparicion-id');
  await page.exposeFunction('reducirMovimientoDePrueba', async () => { await page.emulateMedia({ reducedMotion: 'reduce' }); });
  await page.evaluate(id => {
    document.addEventListener('animationstart', function reducir(e) {
      if (e.target.dataset.aparicionId === id) { document.removeEventListener('animationstart', reducir); window.reducirMovimientoDePrueba(); }
    });
  }, id);
  await ultima.scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(id => window.efectos.some(e => e.id === id && e.tipo === 'animationcancel'), id)).toBeTruthy();
  await expect(page.locator('.apareciendo, .entrada-pantalla')).toHaveCount(0); await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await ultima.scrollIntoViewIfNeeded(); expect(await inicios(page, id)).toBe(1);
});

for (const movimiento of ['no-preference', 'reduce']) test(`hover y pulsación conservan el rectángulo accionable: ${movimiento}`, async ({ page }) => {
  await observar(page); await page.emulateMedia({ reducedMotion: movimiento }); await habilitarDestino(page); await page.goto('/');
  await page.route('https://wa.me/**', r => r.fulfill({ contentType: 'text/html', body: '<p>Borrador de prueba</p>' }));
  const enlace = page.getByRole('link', { name: 'Pedir por WhatsApp' }).first(); await enlace.scrollIntoViewIfNeeded(); await page.evaluate(() => document.fonts.ready);
  const antes = await enlace.boundingBox(); await enlace.hover(); await page.mouse.down(); const durante = await enlace.boundingBox();
  expect(durante).toEqual(antes); await page.mouse.up(); await expect(page).toHaveURL(/wa.me/);
});
