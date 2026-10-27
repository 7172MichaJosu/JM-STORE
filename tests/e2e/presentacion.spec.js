import { test, expect, usarCatalogoVisual, habilitarDestino, ingresar, llenarProducto } from '../fixtures/navegador.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { productosVisuales } from '../fixtures/catalogo-visual.mjs';

for (const tema of ['claro', 'oscuro']) for (const ancho of [360, 768, 1366]) test(`panel adaptable ${tema} a ${ancho}: navegación y paneles`, async ({ page }, info) => {
  await usarCatalogoVisual(); await page.emulateMedia({ colorScheme: tema === 'oscuro' ? 'dark' : 'light', reducedMotion: 'reduce' });
  await page.setViewportSize({ width: ancho, height: 900 }); await ingresar(page);
  const forma = await page.evaluate(() => {
    const r = s => document.querySelector(s).getBoundingClientRect(); const formulario = r('.formulario-panel'), lista = r('.gestion-listado'), nav = r('.navegacion-encargado');
    return { lateral: getComputedStyle(document.querySelector('.navegacion-encargado')).position === 'fixed', apilado: formulario.bottom <= lista.top, navArriba: nav.bottom <= formulario.top, desborde: document.documentElement.scrollWidth > innerWidth };
  });
  expect(forma.desborde).toBeFalsy(); expect(forma.lateral).toBe(ancho >= 1200); expect(forma.apilado).toBe(ancho < 1200);
  if (ancho < 1200) expect(forma.navArriba).toBeTruthy();
  await info.attach(`panel-${tema}-${ancho}`, { body: await page.screenshot(), contentType: 'image/png' });
});

for (const tema of ['claro', 'oscuro']) test(`cero, uno, dos y veinte productos sin duplicación: ${tema}`, async ({ page }) => {
  await page.emulateMedia({ colorScheme: tema === 'oscuro' ? 'dark' : 'light' });
  for (const cantidad of [0, 1, 2, 20]) {
    await usarCatalogoVisual(cantidad); await page.goto('/'); await expect(page.getByRole('article')).toHaveCount(cantidad);
    if (!cantidad) await expect(page.getByText('Por el momento no hay productos disponibles')).toBeVisible();
    else expect(new Set(await page.getByRole('article').evaluateAll(es => es.map(e => e.dataset.aparicionId))).size).toBe(cantidad);
  }
});

for (const tema of ['claro', 'oscuro']) test(`panel ${tema}: composición de referencia y cuatro campos reales`, async ({ page }, info) => {
  await usarCatalogoVisual(2); await page.emulateMedia({ colorScheme: tema === 'oscuro' ? 'dark' : 'light', reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1672, height: 941 }); await ingresar(page);
  await llenarProducto(page, 'Audífonos de diadema'); await page.getByLabel('Precio (S/)', { exact: true }).fill('199.90');
  await page.getByLabel('Descripción', { exact: true }).fill('Tus canciones favoritas, un diseño que destaca todos los días.');
  await page.getByLabel('Imagen', { exact: true }).setInputFiles('tests/fixtures/fotos/diadema.jpg');
  await expect.poll(() => page.getByRole('img', { name: 'Vista previa de la imagen seleccionada' }).evaluate(i => i.complete && i.naturalWidth > 0)).toBeTruthy();
  await page.getByRole('button', { name: 'Guardar producto' }).click(); await expect(page.getByText('Producto agregado correctamente', { exact: true })).toBeVisible(); await expect(page.locator('.fila-gestion')).toHaveCount(3);
  await expect(page.locator('.navegacion-encargado')).toBeVisible(); await expect(page.locator('.formulario-panel .campo')).toHaveCount(4);
  await page.evaluate(() => document.fonts.ready);
  const medidas = await page.evaluate(() => {
    const ancho = s => document.querySelector(s).getBoundingClientRect().width;
    return { sidebar: ancho('.navegacion-encargado') / innerWidth, formulario: ancho('.formulario-panel') / (ancho('.formulario-panel') + ancho('.gestion-listado')) };
  });
  expect(medidas.sidebar).toBeGreaterThanOrEqual(.16); expect(medidas.sidebar).toBeLessThanOrEqual(.20);
  expect(medidas.formulario).toBeGreaterThanOrEqual(.35); expect(medidas.formulario).toBeLessThanOrEqual(.40);
  await writeFile(`specs/003-whatsapp-carrusel/evidencia/medidas-panel-${tema}.json`, JSON.stringify(medidas, null, 2));
  await page.getByLabel('Imagen', { exact: true }).setInputFiles('tests/fixtures/fotos/audifonos.jpg'); await expect(page.getByRole('img', { name: 'Vista previa de la imagen seleccionada' })).toBeVisible();
  for (const img of await page.locator('.fila-gestion img, .vista-previa img').all()) expect(await img.evaluate(e => getComputedStyle(e).objectFit)).toBe('contain');
  await expect(page.locator('.fila-gestion img')).toHaveCount(3);
  for (const img of await page.locator('.fila-gestion img, .vista-previa img').all()) await expect.poll(() => img.evaluate(e => e.complete && e.naturalWidth > 0)).toBeTruthy();
  await page.evaluate(() => document.fonts.ready); await mkdir('specs/003-whatsapp-carrusel/evidencia/capturas', { recursive: true });
  await info.attach(`panel-${tema}-1672`, { body: await page.screenshot({ path: `specs/003-whatsapp-carrusel/evidencia/capturas/panel-${tema}-1672.png`, animations: 'disabled' }), contentType: 'image/png' });
  await expect(page).toHaveScreenshot(`panel-${tema}-1672.png`, { animations: 'disabled' });
});

for (const tema of ['claro', 'oscuro']) {
  test(`tienda ${tema}: fotos reales completas y composición de referencia`, async ({ page }, info) => {
    await usarCatalogoVisual(); await habilitarDestino(page);
    await page.emulateMedia({ colorScheme: tema === 'oscuro' ? 'dark' : 'light', reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1672, height: 941 }); await page.goto('/');
    await expect(page.getByRole('article')).toHaveCount(3);
    await expect(page.getByRole('switch', { name: 'Modo oscuro' })).toHaveAttribute('aria-checked', String(tema === 'oscuro'));
    await expect(page.locator('.hero .imagen-portada img')).toBeVisible();
    const fuentes = await page.locator('article img').evaluateAll(imagenes => imagenes.map(i => i.src));
    expect(await page.locator('.hero .imagen-portada img').getAttribute('src')).toBe(new URL(fuentes[0]).pathname);
    for (const img of await page.locator('article img').all()) {
      await expect.poll(() => img.evaluate(i => i.complete && i.naturalWidth > 0)).toBeTruthy();
      expect(await img.evaluate(i => getComputedStyle(i).objectFit)).toBe('contain');
    }
    await page.evaluate(() => document.fonts.ready);
    const medidas = await page.evaluate(() => {
      const buscar = s => document.querySelector(s), rect = s => buscar(s).getBoundingClientRect(), estilo = s => getComputedStyle(buscar(s));
      const tarjeta = buscar('article'), css = getComputedStyle(tarjeta), interior = tarjeta.clientWidth - parseFloat(css.paddingLeft) - parseFloat(css.paddingRight);
      return { cabecera: rect('.cabecera').height, portada: rect('.hero').height, columnas: estilo('.rejilla-productos').gridTemplateColumns.split(' ').length, margen: rect('.hero-interior').left / innerWidth, textoPortada: rect('.hero-texto').width / rect('.hero-interior').width, fotoTarjeta: rect('article .imagen-producto').width / interior, radioTarjeta: parseFloat(css.borderRadius), titulo: parseFloat(estilo('.hero h1').fontSize), seccion: parseFloat(estilo('#titulo-productos').fontSize), lectura: parseFloat(estilo('.producto-descripcion').fontSize), precio: parseFloat(estilo('.producto-precio').fontSize) };
    });
    expect(medidas.cabecera).toBeGreaterThanOrEqual(80); expect(medidas.cabecera).toBeLessThanOrEqual(96);
    expect(medidas.portada).toBeGreaterThanOrEqual(420); expect(medidas.portada).toBeLessThanOrEqual(500); expect(medidas.columnas).toBe(3);
    await page.evaluate(() => document.fonts.ready);
    await mkdir('specs/003-whatsapp-carrusel/evidencia/capturas', { recursive: true });
    await writeFile(`specs/003-whatsapp-carrusel/evidencia/medidas-tienda-${tema}.json`, JSON.stringify(medidas, null, 2));
    await info.attach(`tienda-${tema}-1672`, { body: await page.screenshot({ path: `specs/003-whatsapp-carrusel/evidencia/capturas/tienda-${tema}-1672.png`, animations: 'disabled' }), contentType: 'image/png' });
    await expect(page).toHaveScreenshot(`tienda-${tema}-1672.png`, { animations: 'disabled' });
  });
  for (const ancho of [360, 768, 1366]) test(`tarjetas ${tema} a ${ancho}: orientación y texto completo`, async ({ page }) => {
    await usarCatalogoVisual(); await page.emulateMedia({ colorScheme: tema === 'oscuro' ? 'dark' : 'light', reducedMotion: 'reduce' });
    await page.setViewportSize({ width: ancho, height: 900 }); await page.goto('/');
    await expect(page.getByRole('article')).toHaveCount(3);
    const distribucion = await page.getByRole('article').first().evaluate(e => {
      const foto = e.querySelector('.imagen-producto').getBoundingClientRect(), texto = e.querySelector('.producto-contenido').getBoundingClientRect();
      return { vertical: foto.bottom <= texto.top + 2, horizontal: foto.right <= texto.left + 2, columnas: getComputedStyle(e.parentElement).gridTemplateColumns.split(' ').length, desborde: document.documentElement.scrollWidth > innerWidth };
    });
    expect(distribucion.desborde).toBeFalsy(); expect(distribucion.columnas).toBe(ancho < 640 ? 1 : ancho < 1200 ? 2 : 3);
    expect(ancho < 1200 ? distribucion.vertical : distribucion.horizontal).toBeTruthy();
  });
}

for (const tema of ['claro', 'oscuro']) for (const ancho of [360, 640, 768, 1200, 1366]) test(`tres proporciones completas en las cuatro superficies: ${tema} ${ancho}`, async ({ page }, info) => {
  await page.setViewportSize({ width: ancho, height: 900 }); await page.emulateMedia({ colorScheme: tema === 'oscuro' ? 'dark' : 'light', reducedMotion: 'reduce' });
  const dimensiones = [[720, 480], [600, 600], [480, 720]];
  async function sinAdornosEncima() {
    const tapada = await page.locator('.hero-arte').evaluate(e => {
      const img = e.querySelector('img'), r = img.getBoundingClientRect(), css = getComputedStyle(img);
      const ancho = r.width - parseFloat(css.paddingLeft) - parseFloat(css.paddingRight), alto = r.height - parseFloat(css.paddingTop) - parseFloat(css.paddingBottom);
      const escala = Math.min(ancho / img.naturalWidth, alto / img.naturalHeight), w = img.naturalWidth * escala, h = img.naturalHeight * escala;
      const x = r.left + parseFloat(css.paddingLeft) + (ancho - w) / 2, y = r.top + parseFloat(css.paddingTop) + (alto - h) / 2;
      return [...e.querySelectorAll('.escena-distintivo')].filter(d => { const b = d.getBoundingClientRect(); return Math.min(x + w, b.right) - Math.max(x, b.left) > 1 && Math.min(y + h, b.bottom) - Math.max(y, b.top) > 1; }).map(d => d.textContent);
    });
    expect(tapada).toEqual([]);
  }
  async function completa(img, esperadas) {
    await img.scrollIntoViewIfNeeded(); await expect.poll(() => img.evaluate(e => e.complete && e.naturalWidth > 0)).toBeTruthy();
    const datos = await img.evaluate(e => ({ forma: [e.naturalWidth, e.naturalHeight], ajuste: getComputedStyle(e).objectFit, transformacion: getComputedStyle(e).transform }));
    expect(datos.ajuste).toBe('contain'); expect(datos.transformacion).toBe('none'); if (esperadas) expect(datos.forma).toEqual(esperadas);
  }
  for (let rotacion = 0; rotacion < 3; rotacion++) {
    await usarCatalogoVisual(3, rotacion); await page.goto('/'); await expect(page.getByRole('article')).toHaveCount(3);
    await completa(page.locator('.carrusel-foto img'), dimensiones[rotacion]);
    await sinAdornosEncima();
    {
      await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; }); await sinAdornosEncima();
      await page.evaluate(() => { document.documentElement.style.fontSize = '100%'; });
    }
    await info.attach(`portada-${tema}-${ancho}-${rotacion}`, { body: await page.locator('.hero-arte').screenshot(), contentType: 'image/png' });
    for (const [i, foto] of (await page.getByRole('article').locator('img').all()).entries()) await completa(foto, dimensiones[(i + rotacion) % 3]);
  }
  await ingresar(page); const antes = (await (await page.request.get('/api/catalogo')).json()).productos;
  for (const foto of await page.locator('.miniatura-gestion img').all()) await completa(foto);
  const imagenes = await productosVisuales();
  for (const [i, foto] of imagenes.entries()) {
    await page.getByLabel('Imagen', { exact: true }).setInputFiles({ name: `foto-${i}.webp`, mimeType: 'image/webp', buffer: foto.imagen });
    await completa(page.getByRole('img', { name: 'Vista previa de la imagen seleccionada' }), dimensiones[i]);
    await info.attach(`preview-${tema}-${ancho}-${i}`, { body: await page.locator('.selector-imagen').screenshot(), contentType: 'image/png' });
  }
  expect((await (await page.request.get('/api/catalogo')).json()).productos).toEqual(antes);
});
