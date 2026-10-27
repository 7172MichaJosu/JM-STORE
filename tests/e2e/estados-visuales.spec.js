import { test, expect, ingresar, llenarProducto, usarCatalogoVisual } from '../fixtures/navegador.mjs';
import { mkdir, writeFile } from 'node:fs/promises';

function contraste(a, b) {
  const luz = c => c.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((s, v, i) => s + v * [.2126, .7152, .0722][i], 0);
  const x = luz(a), y = luz(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}
async function muestra(elemento) {
  return elemento.evaluate(e => {
    const css = getComputedStyle(e); let fondo = css.backgroundColor, padre = e;
    while ((!fondo || fondo === 'transparent' || fondo === 'rgba(0, 0, 0, 0)') && padre.parentElement) { padre = padre.parentElement; fondo = getComputedStyle(padre).backgroundColor; }
    return { color: css.color, fondo, borde: css.borderTopColor, degradado: css.backgroundImage, grande: parseFloat(css.fontSize) >= 24 || (parseFloat(css.fontSize) >= 19 && Number(css.fontWeight) >= 700) };
  });
}

for (const tema of ['claro', 'oscuro']) test(`diez estados reales, contraste e idioma: ${tema}`, async ({ page }, info) => {
  await usarCatalogoVisual(); await page.setViewportSize({ width: 1672, height: 941 }); await page.emulateMedia({ colorScheme: tema === 'oscuro' ? 'dark' : 'light', reducedMotion: 'reduce' });
  const carpeta = 'specs/002-rediseno-visual/evidencia/capturas/estados'; await mkdir(carpeta, { recursive: true }); const resultados = [];
  async function registrar(estado, elemento) {
    await expect(elemento).toBeVisible(); await elemento.scrollIntoViewIfNeeded(); await page.evaluate(() => document.fonts.ready);
    const colores = await muestra(elemento); const ratio = contraste(colores.color, colores.fondo); expect(ratio).toBeGreaterThanOrEqual(colores.grande ? 3 : 4.5);
    const controles = await page.locator('button, a').allTextContents(); expect(controles.join(' ')).not.toMatch(/Buscar productos|Editar producto|Inventario|Estadísticas|Carrito|Pagar|Categorías|Notificaciones/i);
    await info.attach(`${tema}-${estado}`, { body: await page.screenshot({ path: `${carpeta}/${tema}-${estado}.png`, animations: 'disabled' }), contentType: 'image/png' });
    resultados.push({ estado, texto: await elemento.innerText(), contraste: Number(ratio.toFixed(2)) });
  }
  let liberar; await page.route('**/api/catalogo', async r => { await new Promise(resolver => { liberar = resolver; }); await r.continue(); });
  await page.goto('/'); await registrar('carga', page.getByText('Cargando productos…', { exact: true })); liberar(); await expect(page.getByRole('article')).toHaveCount(3); await page.unroute('**/api/catalogo');
  await page.route('**/api/catalogo', r => r.fulfill({ json: { productos: [], whatsapp: { disponible: false, destino: null } } })); await page.reload(); await registrar('vacio', page.getByText('Por el momento no hay productos disponibles')); await page.unroute('**/api/catalogo');
  await page.route('**/api/catalogo', r => r.fulfill({ status: 503, json: { mensaje: 'No disponible' } })); await page.reload(); await registrar('consulta-fallida', page.getByText('No pudimos cargar los productos')); await page.unroute('**/api/catalogo');
  await page.route('**/imagen', r => r.abort()); await page.reload(); await registrar('imagen-fallida', page.getByText('Imagen no disponible').first()); await page.unroute('**/imagen');
  await page.reload(); await registrar('destino-ausente', page.getByRole('button', { name: 'Pedir por WhatsApp' }).first());
  await page.goto('/encargado/ingresar'); await page.getByLabel('Usuario', { exact: true }).fill('incorrecto'); await page.getByLabel('Contraseña', { exact: true }).fill('incorrecta'); await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await registrar('acceso-incorrecto', page.getByText('No pudimos iniciar sesión. Revisa tus datos e inténtalo de nuevo'));
  await ingresar(page);
  const entrada = await muestra(page.getByLabel('Nombre', { exact: true })); expect(contraste(entrada.borde, entrada.fondo)).toBeGreaterThanOrEqual(3);
  const guardar = await muestra(page.getByRole('button', { name: 'Guardar producto' }));
  for (const color of guardar.degradado.match(/rgba?\([^)]+\)/g)) expect(contraste(guardar.color, color)).toBeGreaterThanOrEqual(4.5);
  await page.getByRole('button', { name: 'Guardar producto' }).click(); await registrar('alta-invalida', page.getByText('Ingresa un nombre', { exact: true }));
  await llenarProducto(page); await page.route('**/api/productos', r => r.fulfill({ status: 503, json: { mensaje: 'No disponible' } })); await page.getByRole('button', { name: 'Guardar producto' }).click();
  await registrar('guardado-fallido', page.getByText('No pudimos guardar el producto. Inténtalo de nuevo')); await page.unroute('**/api/productos');
  await page.locator('.fila-gestion').first().getByRole('button', { name: /^Eliminar/ }).click(); await page.route('**/api/productos/*', r => r.fulfill({ status: 503, json: { mensaje: 'No disponible' } }));
  await page.getByRole('dialog').getByRole('button', { name: 'Eliminar', exact: true }).click(); await registrar('eliminacion-fallida', page.getByText('No pudimos eliminar el producto. Inténtalo de nuevo')); await page.unroute('**/api/productos/*');
  for (const boton of await page.getByRole('dialog').getByRole('button').all()) { const c = await muestra(boton); expect(contraste(c.color, c.fondo)).toBeGreaterThanOrEqual(4.5); }
  await page.getByRole('dialog').getByRole('button', { name: 'Cancelar' }).click(); await page.context().clearCookies(); await page.getByRole('button', { name: 'Guardar producto' }).click();
  await registrar('sesion-vencida', page.getByText('Tu sesión terminó. Inicia sesión para continuar'));
  expect(resultados).toHaveLength(10); await writeFile(`specs/002-rediseno-visual/evidencia/estados-${tema}.json`, JSON.stringify(resultados, null, 2));
});
