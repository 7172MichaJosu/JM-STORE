import { scrypt, randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { ErrorAPI, accesoRequerido } from './errores.js';

const derivar = promisify(scrypt);
export const parametrosScrypt = { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };
const duracion = 8 * 60 * 60 * 1000;
const ventana = 15 * 60 * 1000;
const hashToken = token => createHash('sha256').update(token).digest('hex');

export function leerCredenciales(env) {
  if (!env.ADMIN_USERNAME && !env.ADMIN_PASSWORD_HASH) return null;
  const error = () => { throw new Error('Revisa la configuración del acceso del encargado'); };
  if (typeof env.ADMIN_USERNAME !== 'string' || !env.ADMIN_USERNAME.trim()) error();
  const partes = String(env.ADMIN_PASSWORD_HASH || '').split('$');
  if (partes.length !== 6 || partes.slice(0, 4).join('$') !== 'scrypt$131072$8$1') error();
  const salt = Buffer.from(partes[4], 'base64'); const clave = Buffer.from(partes[5], 'base64');
  if (salt.length < 16 || salt.length > 128 || clave.length !== 64 || salt.toString('base64') !== partes[4] || clave.toString('base64') !== partes[5]) error();
  return { usuario: env.ADMIN_USERNAME.trim(), salt, clave };
}
export function crearAuth(config, { reloj = Date.now } = {}) {
  const sesiones = new Map();
  const intentos = new Map();
  const nombreCookie = config.modo === 'production' ? '__Host-jm_session' : 'jm_session';
  function limpiar() {
    const ahora = reloj();
    for (const [k, v] of sesiones) if (v.expiresAt <= ahora) sesiones.delete(k);
    for (const [k, v] of intentos) if (v.hasta <= ahora && v.enCurso === 0) intentos.delete(k);
  }
  function tokenDe(req) {
    const partes = String(req.headers.cookie || '').split(';').map(p => p.trim()).filter(p => p.startsWith(nombreCookie + '='));
    return partes.length === 1 ? partes[0].slice(nombreCookie.length + 1) : null;
  }
  function vigente(token) {
    limpiar();
    return typeof token === 'string' && /^[A-Za-z0-9_-]{43}$/.test(token) && sesiones.has(hashToken(token));
  }
  async function verificar(usuario, contrasena) {
    if (!config.credenciales) return false;
    const clave = await derivar(contrasena, config.credenciales.salt, 64, parametrosScrypt);
    const mismoUsuario = timingSafeEqual(createHash('sha256').update(usuario).digest(), createHash('sha256').update(config.credenciales.usuario).digest());
    return timingSafeEqual(clave, config.credenciales.clave) && mismoUsuario;
  }
  return {
    sesiones, verificar, vigente, tokenDe,
    emitir() { limpiar(); const token = randomBytes(32).toString('base64url'); sesiones.set(hashToken(token), { expiresAt: reloj() + duracion }); return token; },
    revocar(token) { if (typeof token === 'string') sesiones.delete(hashToken(token)); },
    exigir(req) { if (!vigente(tokenDe(req))) throw accesoRequerido(); },
    cookie(token, cerrar = false) {
      return `${nombreCookie}=${cerrar ? '' : token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${cerrar ? 0 : 28800}${config.modo === 'production' ? '; Secure' : ''}`;
    },
    comenzarIntento(red) {
      limpiar();
      let registro = intentos.get(red);
      if (!registro) { registro = { fallos: 0, enCurso: 0, hasta: reloj() + ventana }; intentos.set(red, registro); }
      if (registro.fallos + registro.enCurso >= 5) {
        const error = new ErrorAPI(429, 'INTENTOS_EXCEDIDOS', 'Espera unos minutos antes de volver a intentarlo');
        error.espera = Math.max(1, Math.ceil((registro.hasta - reloj()) / 1000)); throw error;
      }
      registro.enCurso++;
      return correcto => { registro.enCurso--; if (correcto) registro.fallos = 0; else registro.fallos++; };
    },
  };
}
