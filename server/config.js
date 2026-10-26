import { isAbsolute, resolve, dirname, basename, sep } from 'node:path';
import { existsSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parsePhoneNumberFromString } from 'libphonenumber-js/max';
import { leerCredenciales } from './auth.js';

const raiz = resolve(fileURLToPath(new URL('..', import.meta.url)));
function rutaReal(ruta) {
  if (existsSync(ruta)) return realpathSync(ruta);
  return resolve(rutaReal(dirname(ruta)), basename(ruta));
}
export function whatsappPublico(numero) {
  if (typeof numero === 'string' && /^\+[1-9][0-9]{1,14}$/.test(numero)) {
    const telefono = parsePhoneNumberFromString(numero);
    if (telefono?.isValid() && telefono.number === numero) return { disponible: true, destino: numero.slice(1) };
  }
  return { disponible: false, destino: null };
}
export function leerConfig(env = process.env) {
  const fallo = () => { throw new Error('Revisa la configuración del servidor: origen, puerto y ruta de datos'); };
  const modo = env.NODE_ENV || 'development';
  if (!['development', 'production'].includes(modo)) fallo();
  let url;
  try { url = new URL(env.APP_ORIGIN); } catch { fallo(); }
  if (url.origin !== env.APP_ORIGIN || url.username || url.password || !['http:', 'https:'].includes(url.protocol)) fallo();
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (url.protocol !== 'https:' && (modo === 'production' || !local)) fallo();
  const puerto = String(env.PORT || '3001');
  if (!/^\d+$/.test(puerto) || +puerto < 1 || +puerto > 65535) fallo();
  if (!env.SQLITE_PATH || !isAbsolute(env.SQLITE_PATH)) fallo();
  const sqlitePath = rutaReal(resolve(env.SQLITE_PATH));
  const repo = rutaReal(raiz).toLowerCase();
  if (sqlitePath.toLowerCase() === repo || sqlitePath.toLowerCase().startsWith(repo + sep)) fallo();
  return { modo, origin: url.origin, port: +puerto, sqlitePath, credenciales: leerCredenciales(env), whatsapp: whatsappPublico(env.WHATSAPP_NUMBER) };
}
