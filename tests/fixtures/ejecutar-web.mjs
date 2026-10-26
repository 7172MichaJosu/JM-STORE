import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { readFile, realpath, rm } from 'node:fs/promises';
import { dirname, basename, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

// Playwright termina primero su servidor. Después se retira su SQLite temporal,
// incluso en Windows, donde terminar el árbol de procesos no ejecuta SIGTERM.
const cli = fileURLToPath(new URL('../../node_modules/@playwright/test/cli.js', import.meta.url));
const proceso = spawn(process.execPath, [cli, 'test', ...process.argv.slice(2)], { stdio: 'inherit', windowsHide: true });
const [codigo] = await once(proceso, 'exit');
try {
  const datos = JSON.parse(await readFile('.playwright-entorno.json', 'utf8'));
  const directorio = await realpath(dirname(resolve(datos.sqlitePath)));
  const temporal = await realpath(tmpdir());
  if (dirname(directorio).toLowerCase() !== temporal.toLowerCase() || !/^jm-store-web-[a-z0-9]+$/i.test(basename(directorio))) throw new Error('Ruta de pruebas inesperada');
  await rm(directorio, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 });
  await rm('.playwright-entorno.json', { force: true });
} catch (error) {
  if (error.code !== 'ENOENT') { console.error('No se pudo limpiar el entorno temporal de navegador'); process.exitCode = 1; }
}
process.exitCode = process.exitCode || codigo || 0;
