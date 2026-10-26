export class ErrorAPI extends Error {
  constructor(mensaje, status = 0, campos = {}, espera = 0) { super(mensaje); Object.assign(this, { status, campos, espera }); }
}
export async function api(ruta, { method = 'GET', body, signal } = {}) {
  const headers = {};
  if (method !== 'GET') headers['X-JM-STORE-Request'] = '1';
  if (body && !(body instanceof FormData)) { headers['Content-Type'] = 'application/json'; body = JSON.stringify(body); }
  let respuesta;
  try { respuesta = await fetch(ruta, { method, body, signal, credentials: 'same-origin', headers, cache: 'no-store' }); }
  catch (error) { if (error.name === 'AbortError') throw error; throw new ErrorAPI('No pudimos conectarnos. Inténtalo de nuevo'); }
  if (respuesta.status === 204) return null;
  let datos;
  try { datos = await respuesta.json(); } catch { throw new ErrorAPI('No pudimos completar la operación. Inténtalo de nuevo', respuesta.status); }
  if (!respuesta.ok) throw new ErrorAPI(datos.mensaje || 'No pudimos completar la operación', respuesta.status, datos.campos || {}, Number(respuesta.headers.get('Retry-After')) || 0);
  return datos;
}
