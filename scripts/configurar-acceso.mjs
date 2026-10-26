import { readFile, writeFile } from 'node:fs/promises';
import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { parametrosScrypt } from '../server/auth.js';

function leerOculto(pregunta) {
  if (!process.stdin.isTTY) throw new Error('Abre una terminal interactiva para configurar el acceso');
  process.stdout.write(pregunta);
  return new Promise((resolve, reject) => {
    let valor = '';
    process.stdin.setRawMode(true); process.stdin.setEncoding('utf8'); process.stdin.resume();
    function terminar(error) {
      process.stdin.off('data', recibir); process.stdin.setRawMode(false); process.stdin.pause(); process.stdout.write('\n');
      error ? reject(error) : resolve(valor);
    }
    function recibir(datos) {
      for (const caracter of datos) {
        if (caracter === '\u0003' || caracter === '\u0004') return terminar(new Error('Configuración cancelada'));
        if (caracter === '\r' || caracter === '\n') return terminar();
        if (caracter === '\u007f' || caracter === '\b') valor = [...valor].slice(0, -1).join('');
        else if (caracter >= ' ') valor += caracter;
      }
    }
    process.stdin.on('data', recibir);
  });
}
try {
  if (process.argv.length > 2) throw new Error('Ejecuta sin argumentos; los datos se solicitan de forma oculta');
  const usuario = (await leerOculto('Usuario del encargado (entrada oculta): ')).trim();
  if (!usuario || /['"\r\n]/.test(usuario)) throw new Error('Usa un usuario no vacío y sin comillas');
  const contrasena = await leerOculto('Contraseña (entrada oculta): ');
  const confirmacion = await leerOculto('Repite la contraseña (entrada oculta): ');
  if (!contrasena || contrasena !== confirmacion) throw new Error('Las contraseñas deben coincidir y no estar vacías');
  const salt = randomBytes(16);
  const clave = await promisify(scrypt)(contrasena, salt, 64, parametrosScrypt);
  const hash = `scrypt$131072$8$1$${salt.toString('base64')}$${clave.toString('base64')}`;
  let contenido = '';
  try { contenido = (await readFile('.env', 'utf8')).replace(/^\uFEFF/, ''); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  const lineas = contenido.split(/\r?\n/).filter(l => !/^\s*(export\s+)?ADMIN_(USERNAME|PASSWORD_HASH)\s*=/.test(l));
  const nuevo = lineas.join('\n').trimEnd() + `\nADMIN_USERNAME='${usuario}'\nADMIN_PASSWORD_HASH='${hash}'\n`;
  await writeFile('.env', nuevo, { mode: 0o600 });
  console.log('Acceso configurado en .env. Reinicia la API para aplicar el cambio.');
} catch (error) {
  console.error(error.message.startsWith('Usa ') || error.message.startsWith('Las contraseñas') || error.message.startsWith('Abre ') || error.message.startsWith('Ejecuta ') || error.message === 'Configuración cancelada' ? error.message : 'No se pudo preparar el acceso. Revisa los permisos de .env');
  process.exitCode = 1;
}
