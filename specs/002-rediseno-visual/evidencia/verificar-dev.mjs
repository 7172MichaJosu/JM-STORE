// Verificación local de activos y entrada con React StrictMode en Vite.
// Solo intercepta la consulta de sesión con datos de ensayo; no abre SQLite.
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const raiz = fileURLToPath(new URL('../../../', import.meta.url));
const origen = 'http://127.0.0.1:5176';
const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5176', '--strictPort'], { cwd: raiz, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
const salida = once(vite, 'exit'); let navegador;
try {
  await new Promise((resolve, reject) => {
    const tiempo = setTimeout(() => reject(new Error('Vite no inició en el puerto aislado 5176')), 10000);
    vite.stdout.on('data', datos => { if (datos.toString().includes('5176')) { clearTimeout(tiempo); resolve(); } });
    vite.once('exit', () => { clearTimeout(tiempo); reject(new Error('No se pudo iniciar Vite; revisar disponibilidad de 5176')); });
  });
  const activos = [];
  for (const recurso of ['/assets/tema-inicial-v1.js', '/assets/manrope-variable-v1.ttf', '/assets/manrope-OFL-v1.txt']) {
    const respuesta = await fetch(origen + recurso); const bytes = (await respuesta.arrayBuffer()).byteLength;
    if (respuesta.status !== 200) throw new Error('Activo local no disponible en Vite'); activos.push({ recurso, estado: respuesta.status, bytes });
  }
  navegador = await chromium.launch(); const pagina = await navegador.newPage({ reducedMotion: 'no-preference', colorScheme: 'dark' });
  await pagina.route('**/api/sesion', r => r.fulfill({ json: { autenticado: false } }));
  await pagina.addInitScript(() => {
    window.entradas = 0; document.addEventListener('animationstart', e => { if (e.animationName === 'jm-entrada') window.entradas++; });
  });
  await pagina.goto(origen + '/encargado/ingresar'); await pagina.getByRole('heading', { name: 'Bienvenido de nuevo.' }).waitFor();
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.waitForFunction(() => window.entradas === 1 && document.querySelector('main') && getComputedStyle(document.querySelector('main')).opacity === '1', null, { timeout: 3000 });
  const entradas = await pagina.evaluate(() => window.entradas);
  const reporte = { origen, modo: 'Vite development / React StrictMode', activos, entradas };
  await writeFile(new URL('./dev-activos.json', import.meta.url), JSON.stringify(reporte, null, 2)); console.log(JSON.stringify(reporte));
  if (entradas !== 1) throw new Error('La pantalla de acceso debe tener una entrada real en desarrollo');
} finally {
  await navegador?.close(); if (vite.exitCode === null) vite.kill(); await salida;
}
