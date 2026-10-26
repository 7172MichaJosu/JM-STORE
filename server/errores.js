export class ErrorAPI extends Error {
  constructor(status, codigo, mensaje, campos) {
    super(mensaje);
    Object.assign(this, { status, codigo, campos });
  }
}
export const invalida = () => new ErrorAPI(400, 'SOLICITUD_INVALIDA', 'La solicitud no es válida');
export const accesoRequerido = () => new ErrorAPI(401, 'ACCESO_REQUERIDO', 'Tu sesión terminó. Inicia sesión para continuar');
export const noEncontrado = () => new ErrorAPI(404, 'NO_ENCONTRADO', 'El producto ya no está disponible');
export function validarId(id) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) throw invalida();
}
