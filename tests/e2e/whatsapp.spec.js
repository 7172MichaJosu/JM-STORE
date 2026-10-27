import { test, expect, habilitarDestino, ingresar } from '../fixtures/navegador.mjs';
import { mensajeWhatsApp } from '../../src/lib/whatsapp.js';

for (const colorScheme of ['light', 'dark']) test(`tres enlaces, una activación y regreso sin declarar envío (${colorScheme})`, async ({ page }) => {
  await page.emulateMedia({ colorScheme });
  await habilitarDestino(page);
  let aperturas = 0;
  await page.route('https://wa.me/**', async route => { aperturas++; await route.fulfill({ contentType: 'text/html', body: '<p>Destino externo simulado; no se envió ningún mensaje</p>' }); });
  await page.goto('/');
  const catalogo = await page.request.get('/api/catalogo'); const { productos } = await catalogo.json();
  for (const p of productos.slice(0, 3)) {
    const tarjeta = page.getByRole('article').filter({ has: page.locator(`[id="producto-${p.id}"]`) });
    const enlace = tarjeta.getByRole('link', { name: 'Pedir por WhatsApp' });
    const href = await enlace.getAttribute('href'); const url = new URL(href);
    expect(url.searchParams.get('text')).toBe(mensajeWhatsApp(p, 'http://localhost:4175'));
    expect(url.pathname).toBe('/12025550123');
    await enlace.click(); await expect(page).toHaveURL(href); await page.goBack();
    await expect(page.getByRole('article')).toHaveCount(20);
  }
  expect(aperturas).toBe(3);
  await expect(page.getByText(/pedido enviado|pedido confirmado|pedido pagado/i)).toHaveCount(0);
  expect((await page.request.post('/api/pedidos', { headers: { Origin: 'http://localhost:4175', 'X-JM-STORE-Request': '1' } })).status()).toBe(404);
  await expect(page.getByRole('textbox')).toHaveCount(0);
});
test('destino ausente o inválido deshabilita sin href', async ({ page }) => {
  await page.goto('/'); await expect(page.getByRole('button', { name: 'Pedir por WhatsApp' }).first()).toBeDisabled();
  await expect(page.getByText('Los pedidos por WhatsApp no están disponibles por el momento').first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Pedir por WhatsApp' })).toHaveCount(0);
});
test('cinco aperturas de 20 tarjetas con botones utilizables', async ({ page }, info) => {
  await habilitarDestino(page);
  const tiempos = [];
  for (let i = 0; i < 5; i++) {
    const inicio = performance.now(); await page.goto('/');
    await expect(page.getByRole('article')).toHaveCount(20);
    await expect(page.getByRole('link', { name: 'Pedir por WhatsApp' }).first()).toBeVisible();
    tiempos.push(Math.round(performance.now() - inicio));
  }
  await info.attach('cinco-aperturas-ms', { body: JSON.stringify({ entorno: 'localhost, sin limitación de red, mismo contexto/caché', tiempos }), contentType: 'application/json' });
  console.log('SC-001 local (ms):', tiempos.join(', '));
  expect(tiempos.filter(t => t <= 3000).length).toBeGreaterThanOrEqual(4);
});
test('una tarjeta antigua tras eliminar solo prepara consulta de disponibilidad', async ({ page, context }) => {
  await habilitarDestino(page); await page.route('https://wa.me/**', route => route.fulfill({ contentType: 'text/html', body: '<p>Destino simulado</p>' }));
  await page.goto('/'); await expect(page.getByRole('article')).toHaveCount(20);
  const { productos } = await (await page.request.get('/api/catalogo')).json(); const p = productos[0];
  const gestion = await context.newPage(); await ingresar(gestion);
  expect((await gestion.request.delete(`/api/productos/${p.id}`, { headers: { Origin: 'http://localhost:4175', 'X-JM-STORE-Request': '1' } })).status()).toBe(204);
  const tarjeta = page.getByRole('article').filter({ has: page.locator(`[id="producto-${p.id}"]`) });
  const enlace = tarjeta.getByRole('link', { name: 'Pedir por WhatsApp' }); await expect(enlace).toBeVisible();
  const href = await enlace.getAttribute('href'); expect(new URL(href).searchParams.get('text')).toContain('¿Podrían confirmarme su disponibilidad?');
  await enlace.click(); await expect(page).toHaveURL(href); await page.goBack();
  await expect(page.getByText(/pedido confirmado|pedido enviado/i)).toHaveCount(0);
});
