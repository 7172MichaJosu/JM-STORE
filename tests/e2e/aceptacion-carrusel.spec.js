import { test, expect, usarCatalogoVisual } from '../fixtures/navegador.mjs';
import { mkdir } from 'node:fs/promises';

test('ocho productos completan un ciclo y diez avances automáticos de cinco segundos', async ({ page }) => {
  await usarCatalogoVisual(8);
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const carrusel = page.getByRole('region', { name: 'Productos del catálogo' });
  await expect(carrusel).toBeVisible();
  await page.mouse.move(0, 0);
  const ids = await carrusel.locator('.carrusel-miniatura').evaluateAll(es => es.map(e => e.dataset.producto));
  for (let i = 1; i <= 10; i++) {
    await page.clock.runFor(4999);
    await expect(carrusel).toHaveAttribute('data-activo', ids[(i - 1) % ids.length]);
    await page.clock.runFor(1);
    await expect(carrusel).toHaveAttribute('data-activo', ids[i % ids.length]);
  }
});

// SC-004/006: repetir los métodos manuales sobre un ciclo completo de ocho
// productos, también cuando el sistema solicita movimiento reducido.
for (const colorScheme of ['light', 'dark']) {
  for (const reducedMotion of ['no-preference', 'reduce']) {
    test(`diez selecciones por método: ${colorScheme}, ${reducedMotion}`, async ({ page }, info) => {
      await usarCatalogoVisual(8);
      await page.setViewportSize({ width: 360, height: 950 });
      await page.emulateMedia({ colorScheme, reducedMotion });
      await page.goto('/');
      const carrusel = page.getByRole('region', { name: 'Productos del catálogo' });
      await expect(carrusel).toBeVisible();
      const miniaturas = carrusel.locator('.carrusel-miniatura');
      const ids = await miniaturas.evaluateAll(es => es.map(e => e.dataset.producto));
      expect(new Set(ids).size).toBe(8);

      for (let i = 0; i < 10; i++) {
        const indice = (i + 1) % ids.length;
        await miniaturas.nth(indice).hover();
        await expect(carrusel).toHaveAttribute('data-activo', ids[indice]);
      }
      await page.mouse.move(0, 0);
      for (let i = 0; i < 10; i++) {
        const indice = i % ids.length;
        await miniaturas.nth(indice).focus();
        await page.keyboard.press(i % 2 ? 'Space' : 'Enter');
        await expect(carrusel).toHaveAttribute('data-activo', ids[indice]);
        await expect(miniaturas.nth(indice)).toBeFocused();
        expect(await miniaturas.nth(indice).evaluate(e => getComputedStyle(e).outlineStyle)).toBe('solid');
      }
      const siguiente = carrusel.getByRole('button', { name: 'Producto siguiente' });
      let indice = 9 % ids.length;
      for (let i = 0; i < 10; i++) {
        await siguiente.click();
        indice = (indice + 1) % ids.length;
        await expect(carrusel).toHaveAttribute('data-activo', ids[indice]);
      }
      const superficie = carrusel.locator('.carrusel-superficie');
      const inicio = { pointerType: 'touch', pointerId: 12, isPrimary: true, clientX: 250, clientY: 100 };
      for (let i = 0; i < 10; i++) {
        await superficie.dispatchEvent('pointerdown', inicio);
        await superficie.dispatchEvent('pointerup', { ...inicio, clientX: 100 });
        indice = (indice + 1) % ids.length;
        await expect(carrusel).toHaveAttribute('data-activo', ids[indice]);
      }
      for (const control of await carrusel.locator('button, a').all()) {
        const { width, height } = await control.boundingBox();
        expect(width).toBeGreaterThanOrEqual(44);
        expect(height).toBeGreaterThanOrEqual(44);
      }
      expect(await superficie.evaluate(e => getComputedStyle(e).touchAction)).toBe('pan-y pinch-zoom');
      await expect(page.getByRole('article')).toHaveCount(8);
      await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
      const carpeta = 'specs/003-whatsapp-carrusel/evidencia/capturas/laptop';
      await mkdir(carpeta, { recursive: true });
      for (const width of [360, 768, 1366]) {
        await page.setViewportSize({ width, height: 950 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
        const distintivosCubrenControles = await carrusel.evaluate(e => {
          const controles = e.querySelector('.carrusel-cabecera').getBoundingClientRect();
          return [...e.parentElement.querySelectorAll('.escena-distintivo')].some(d => {
            const r = d.getBoundingClientRect();
            return r.bottom > controles.top && r.top < controles.bottom && r.right > controles.left && r.left < controles.right;
          });
        });
        expect(distintivosCubrenControles).toBeFalsy();
        await info.attach(`carrusel-${width}-texto-200`, {
          body: await carrusel.screenshot({ path: `${carpeta}/carrusel-${colorScheme}-${reducedMotion}-${width}.png`, animations: 'disabled' }),
          contentType: 'image/png',
        });
      }
    });
  }
}

test('cancelar tacto mantiene pausa por foco y reinicia cinco segundos al salir', async ({ page }) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const carrusel = page.getByRole('region', { name: 'Productos del catálogo' });
  await expect(carrusel).toBeVisible();
  const id = await carrusel.getAttribute('data-activo');
  await carrusel.getByRole('button', { name: 'Producto siguiente' }).focus();
  await page.mouse.move(0, 0);
  const superficie = carrusel.locator('.carrusel-superficie');
  const inicio = { pointerType: 'touch', pointerId: 12, isPrimary: true, clientX: 250, clientY: 100 };
  await superficie.dispatchEvent('pointerdown', inicio);
  await page.clock.runFor(10000);
  await expect(carrusel).toHaveAttribute('data-activo', id);
  await superficie.dispatchEvent('pointercancel', inicio);
  await page.clock.runFor(10000);
  await expect(carrusel).toHaveAttribute('data-activo', id);
  await page.evaluate(() => document.activeElement.blur());
  await page.clock.runFor(4999);
  await expect(carrusel).toHaveAttribute('data-activo', id);
  await page.clock.runFor(1);
  expect(await carrusel.getAttribute('data-activo')).not.toBe(id);
});

test('diez fichas completas al entrar en sesiones nuevas', async ({ browser, baseURL, page }) => {
  const { productos } = await (await page.request.get('/api/catalogo')).json();
  for (const producto of productos.slice(0, 10)) {
    const context = await browser.newContext({ baseURL });
    try {
      const ficha = await context.newPage();
      await ficha.goto('/productos/' + producto.id);
      await expect(ficha.getByRole('heading', { level: 1 })).toHaveText(producto.nombre);
      await expect(ficha.locator('.ficha-descripcion')).toHaveText(producto.descripcion);
      const precio = BigInt(producto.precioCentimos);
      await expect(ficha.locator('.ficha-precio')).toHaveText(`S/ ${precio / 100n}.${String(precio % 100n).padStart(2, '0')}`);
      await expect.poll(() => ficha.locator('.imagen-ficha img').evaluate(e => e.complete && e.naturalWidth > 0)).toBeTruthy();
      expect(await ficha.locator('.imagen-ficha img').getAttribute('src')).toBe(producto.imagenUrl);
    } finally {
      await context.close();
    }
  }
});
