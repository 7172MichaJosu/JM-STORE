import { test, expect, habilitarDestino } from '../fixtures/navegador.mjs';
import { imagenValida } from '../fixtures/imagenes.mjs';
import { usuarioPrueba, contrasenaPrueba } from '../fixtures/entorno.mjs';

async function comprobarDisposicion(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  const pequenos = await page.locator('button, input, textarea, a').evaluateAll(elementos => elementos.filter(e => {
    const r = e.getBoundingClientRect(); const css = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && css.visibility !== 'hidden' && !e.classList.contains('saltar') && r.height < 43.9;
  }).map(e => ({ texto: e.textContent, alto: e.getBoundingClientRect().height })));
  expect(pequenos).toEqual([]);
}
for (const ancho of [360, 768, 1366]) for (const aumento of [100, 200]) {
  test(`recorrido con teclado a ${ancho}px y texto ${aumento}%`, async ({ page }, info) => {
    await page.setViewportSize({ width: ancho, height: 900 }); await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(porcentaje => { document.addEventListener('DOMContentLoaded', () => { document.documentElement.style.fontSize = porcentaje + '%'; }); }, aumento);
    await habilitarDestino(page);
    await page.route('https://wa.me/**', route => route.fulfill({ contentType: 'text/html', body: '<p>Borrador externo simulado</p>' }));
    await page.goto('/'); await expect(page.getByRole('article')).toHaveCount(20); await comprobarDisposicion(page);
    const pedir = page.getByRole('link', { name: 'Pedir por WhatsApp' }).first(); await pedir.focus(); await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/https:\/\/wa.me\//); await page.goBack();
    const encargado = page.getByRole('navigation').getByRole('link', { name: 'Acceso del encargado' }); await encargado.focus(); await page.keyboard.press('Enter');
    await page.getByLabel('Usuario', { exact: true }).focus(); await page.keyboard.type(usuarioPrueba); await page.keyboard.press('Tab'); await page.keyboard.type(contrasenaPrueba);
    const entrar = page.getByRole('button', { name: 'Iniciar sesión', exact: true }); await entrar.focus(); await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Gestión del catálogo' })).toBeVisible(); await comprobarDisposicion(page);
    for (const [etiqueta, texto] of [['Nombre', `Teclado ${ancho} ${aumento}`], ['Descripción', 'Diseño peruano, tildes & + texto completo.'], ['Precio (S/)', '49,90']]) {
      await page.getByLabel(etiqueta, { exact: true }).focus(); await page.keyboard.type(texto);
    }
    const archivo = page.getByLabel('Imagen', { exact: true }); await archivo.focus();
    await archivo.setInputFiles({ name: 'producto.png', mimeType: 'image/png', buffer: await imagenValida() });
    await expect(page.getByRole('img', { name: 'Vista previa de la imagen seleccionada' })).toBeVisible();
    await page.getByRole('button', { name: 'Guardar producto' }).focus(); await page.keyboard.press('Enter');
    await expect(page.getByText('Producto agregado correctamente', { exact: true })).toBeVisible(); await comprobarDisposicion(page);
    const fila = page.locator('.fila-gestion').filter({ hasText: `Teclado ${ancho} ${aumento}` }); const eliminar = fila.getByRole('button', { name: /^Eliminar/ });
    await eliminar.focus(); await page.keyboard.press('Enter');
    const dialogo = page.getByRole('dialog'); await expect(dialogo.getByRole('button', { name: 'Cancelar' })).toBeFocused();
    await page.keyboard.press('Shift+Tab'); await expect(dialogo.getByRole('button', { name: 'Eliminar', exact: true })).toBeFocused();
    await page.keyboard.press('Tab'); await expect(dialogo.getByRole('button', { name: 'Cancelar' })).toBeFocused();
    await page.keyboard.press('Escape'); await expect(eliminar).toBeFocused();
    await page.keyboard.press('Enter'); await page.keyboard.press('Tab'); await page.keyboard.press('Enter');
    await expect(page.getByText('Producto eliminado correctamente', { exact: true })).toBeVisible();
    const salir = page.getByRole('button', { name: 'Cerrar sesión' }); await salir.focus();
    expect(await salir.evaluate(e => getComputedStyle(e).outlineStyle)).toBe('solid');
    await page.keyboard.press('Enter'); await expect(page.getByRole('button', { name: 'Iniciar sesión', exact: true })).toBeVisible(); await comprobarDisposicion(page);
    await info.attach(`acceso-${ancho}-${aumento}`, { body: await page.screenshot(), contentType: 'image/png' });
  });
}
