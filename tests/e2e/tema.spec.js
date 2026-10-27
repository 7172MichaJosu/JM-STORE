import { test, expect, ingresar, llenarProducto } from '../fixtures/navegador.mjs';
import { chromium } from '@playwright/test';
import { mkdtemp, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';

test('cerrar y reabrir un perfil Chromium temporal conserva oscuro y claro', async () => {
  const perfil = await mkdtemp(join(tmpdir(), 'jm-tema-perfil-')); let contexto;
  try {
    for (const [i, esperado] of ['claro', 'oscuro', 'claro'].entries()) {
      contexto = await chromium.launchPersistentContext(perfil, { headless: true, baseURL: 'http://localhost:4175', colorScheme: i === 2 ? 'dark' : 'light' });
      const pagina = contexto.pages()[0]; await pagina.goto('/'); await expect(pagina.getByRole('switch')).toHaveAttribute('aria-checked', String(esperado === 'oscuro'));
      if (i < 2) await pagina.getByRole('switch').click(); await contexto.close(); contexto = null;
    }
  } finally {
    await contexto?.close(); expect(dirname(await realpath(perfil)).toLowerCase()).toBe((await realpath(tmpdir())).toLowerCase()); expect(basename(perfil)).toMatch(/^jm-tema-perfil-[a-z0-9]+$/i);
    await rm(perfil, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 });
  }
});

test('escritura denegada con valor previo no revierte la elección en memoria al restaurar', async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('jm-store.tema', 'oscuro'); Storage.prototype.setItem = function () { throw new DOMException('Bloqueado', 'SecurityError'); }; });
  await page.goto('/'); await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'true'); await page.getByRole('switch').click();
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
  await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
});

test('seis cambios manuales y seis automáticos en tienda, acceso y gestión responden en 0.5 s', async ({ page }) => {
  const medidas = [];
  for (const pantalla of ['tienda', 'acceso', 'gestión']) {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'no-preference' });
    if (pantalla === 'gestión') await ingresar(page); else await page.goto(pantalla === 'tienda' ? '/' : '/encargado/ingresar');
    await page.evaluate(() => { localStorage.removeItem('jm-store.tema'); }); await page.reload();
    for (const [colorScheme, marcado] of [['dark', 'true'], ['light', 'false']]) {
      const inicio = performance.now(); await page.emulateMedia({ colorScheme }); await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', marcado);
      const ms = performance.now() - inicio; expect(ms).toBeLessThanOrEqual(500); medidas.push({ pantalla, tipo: 'automático', ms: Math.round(ms) });
    }
    for (const marcado of ['true', 'false']) {
      const inicio = performance.now(); await page.getByRole('switch').click(); await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', marcado);
      const ms = performance.now() - inicio; expect(ms).toBeLessThanOrEqual(500); medidas.push({ pantalla, tipo: 'manual', ms: Math.round(ms) });
    }
    await page.evaluate(() => localStorage.removeItem('jm-store.tema'));
  }
  console.log('SC-002 respuesta (ms):', JSON.stringify(medidas));
});

for (const tema of ['claro', 'oscuro']) test(`cinco puntos de persistencia y primeros fotogramas: ${tema}`, async ({ page, context }) => {
  await page.addInitScript(() => {
    window.arranqueTema = [];
    function registrar() {
      if (document.querySelector('h1') && window.arranqueTema.length < 5) window.arranqueTema.push(document.documentElement.dataset.tema);
      if (window.arranqueTema.length < 5) requestAnimationFrame(registrar);
    }
    requestAnimationFrame(registrar);
  });
  await page.emulateMedia({ colorScheme: tema === 'claro' ? 'dark' : 'light', reducedMotion: 'no-preference' }); await page.goto('/');
  await page.getByRole('switch').click();
  const comprobar = async (p, frio = false) => {
    await expect(p.getByRole('switch')).toHaveAttribute('aria-checked', String(tema === 'oscuro'));
    if (frio) { await p.waitForFunction(() => window.arranqueTema.length === 5); expect(await p.evaluate(() => window.arranqueTema)).toEqual(Array(5).fill(tema)); }
  };
  await comprobar(page); await page.goto('/encargado/ingresar'); await comprobar(page, true);
  await ingresar(page); await comprobar(page, true); await page.reload(); await comprobar(page, true);
  const reapertura = await context.newPage(); await reapertura.goto('/'); await comprobar(reapertura); await reapertura.close();
});

for (const ruta of ['/', '/encargado', '/encargado/ingresar']) test(`tema automático en vivo y prioridad manual: ${ruta}`, async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' }); await page.goto(ruta);
  const control = page.getByRole('switch', { name: 'Modo oscuro' }); await expect(control).toHaveAttribute('aria-checked', 'false');
  await page.emulateMedia({ colorScheme: 'dark' }); await expect(control).toHaveAttribute('aria-checked', 'true');
  await page.emulateMedia({ colorScheme: 'light' }); await expect(control).toHaveAttribute('aria-checked', 'false');
  await control.click(); await expect(control).toHaveAttribute('aria-checked', 'true');
  await page.emulateMedia({ colorScheme: 'dark' }); await page.emulateMedia({ colorScheme: 'light' });
  await expect(control).toHaveAttribute('aria-checked', 'true');
});

test('elección manual persiste al navegar, recargar y reabrir una pestaña del perfil', async ({ page, context }) => {
  await page.emulateMedia({ colorScheme: 'light' }); await page.goto('/');
  await page.getByRole('switch').click();
  expect(await page.evaluate(() => localStorage.getItem('jm-store.tema'))).toBe('oscuro');
  await page.goto('/encargado/ingresar'); await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  await page.reload(); await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  const otra = await context.newPage(); await otra.goto('/'); await expect(otra.getByRole('switch')).toHaveAttribute('aria-checked', 'true'); await otra.close();
  await page.getByRole('switch').click(); await page.reload(); await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
});

for (const modo of ['lectura', 'escritura']) test(`almacenamiento bloqueado (${modo}) mantiene elección manual y trabajo`, async ({ page }) => {
  await page.addInitScript(tipo => {
    if (tipo === 'lectura') Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Bloqueado', 'SecurityError'); } });
    else Storage.prototype.setItem = function () { throw new DOMException('Bloqueado', 'SecurityError'); };
  }, modo);
  await page.emulateMedia({ colorScheme: 'dark' }); await page.goto('/encargado/ingresar');
  await page.getByLabel('Usuario', { exact: true }).fill('Entrada conservada');
  await page.getByRole('switch').click(); await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  await page.emulateMedia({ colorScheme: 'light' }); await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'false'); await expect(page.getByLabel('Usuario', { exact: true })).toHaveValue('Entrada conservada');
});

test('cambiar tema conserva formulario, archivo, foco y no hace consultas de negocio', async ({ page }) => {
  await ingresar(page); await llenarProducto(page, 'Borrador intacto');
  const consultas = []; page.on('request', r => { if (r.url().includes('/api/')) consultas.push(r.url()); });
  const archivo = page.getByLabel('Imagen', { exact: true }); const fotoAntes = await page.getByRole('img', { name: 'Vista previa de la imagen seleccionada' }).getAttribute('src');
  await page.getByRole('switch').focus(); await page.keyboard.press('Space');
  await expect(page.getByRole('switch')).toBeFocused(); await expect(page.getByLabel('Nombre', { exact: true })).toHaveValue('Borrador intacto');
  expect(await archivo.evaluate(i => i.files.length)).toBe(1); expect(await page.getByRole('img', { name: 'Vista previa de la imagen seleccionada' }).getAttribute('src')).toBe(fotoAntes);
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))); expect(consultas).toEqual([]);
});

test('cambio automático mantiene el mismo modal, selección y foco', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' }); await ingresar(page);
  await page.locator('.fila-gestion').first().getByRole('button', { name: /^Eliminar/ }).click();
  const dialogo = page.getByRole('dialog'); const texto = await dialogo.getByRole('heading').textContent();
  await expect(dialogo.getByRole('button', { name: 'Cancelar' })).toBeFocused();
  await page.emulateMedia({ colorScheme: 'dark' }); await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  await expect(dialogo).toBeVisible(); await expect(dialogo.getByRole('heading')).toHaveText(texto); await expect(dialogo.getByRole('button', { name: 'Cancelar' })).toBeFocused();
  expect(await page.evaluate(() => document.querySelector('dialog').open)).toBeTruthy(); await page.keyboard.press('Escape'); await expect(page.locator('.fila-gestion')).toHaveCount(20);
});

test('volver por historial reconcilia elección posterior y los recursos respetan CSP', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' }); const respuesta = await page.goto('/');
  expect(respuesta.headers()['content-security-policy']).toContain("script-src 'self'"); expect(respuesta.headers()['content-security-policy']).not.toContain('unsafe-inline');
  await page.getByRole('switch').click(); await page.goto('/encargado/ingresar'); await page.getByRole('switch').click(); await page.goBack();
  await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  await page.evaluate(() => { localStorage.setItem('jm-store.tema', 'oscuro'); dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })); });
  await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  for (const recurso of ['/assets/tema-inicial-v1.js', '/assets/manrope-variable-v1.ttf', '/assets/manrope-OFL-v1.txt']) {
    const r = await page.request.get(recurso); expect(r.status()).toBe(200); expect(r.headers()['cache-control']).toContain('immutable');
  }
  await expect(page.locator('script:not([src]), [style]')).toHaveCount(0);
  const origen = new URL(page.url()).origin;
  expect(await page.locator('script[src], link[rel=stylesheet], link[as=font]').evaluateAll(es => es.map(e => new URL(e.src || e.href).origin))).toEqual(expect.arrayContaining([origen]));
  expect((await page.locator('script[src], link[rel=stylesheet], link[as=font]').evaluateAll(es => es.map(e => new URL(e.src || e.href).origin))).every(o => o === origen)).toBeTruthy();
});

test('fallo del bootstrap conserva contenido y selector operativo', async ({ page }) => {
  await page.route('**/assets/tema-inicial-v1.js', r => r.abort()); await page.goto('/'); await expect(page.getByRole('article')).toHaveCount(20);
  const estado = await page.getByRole('switch').getAttribute('aria-checked'); await page.getByRole('switch').click(); await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', estado === 'true' ? 'false' : 'true');
});
