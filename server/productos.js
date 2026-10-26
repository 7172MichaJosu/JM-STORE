import sharp from 'sharp';
import { ErrorAPI } from './errores.js';

export function validarProducto(datos) {
  const campos = {};
  const salida = {};
  for (const [campo, limite, ayuda] of [['nombre', 4096, 'Ingresa un nombre'], ['descripcion', 32768, 'Ingresa una descripción']]) {
    const texto = typeof datos[campo] === 'string' ? datos[campo].trim() : '';
    if (!texto) campos[campo] = ayuda;
    else if (Buffer.byteLength(texto, 'utf8') > limite) campos[campo] = `${campo === 'nombre' ? 'El nombre' : 'La descripción'} supera el límite de ${limite === 4096 ? '4' : '32'} KiB`;
    else salida[campo] = texto;
  }
  const textoPrecio = typeof datos.precio === 'string' ? datos.precio.trim() : '';
  const partes = /^([0-9]+)(?:[.,]([0-9]{1,2}))?$/.exec(textoPrecio);
  let centimos = 0n;
  if (partes) centimos = BigInt(partes[1]) * 100n + BigInt((partes[2] || '').padEnd(2, '0'));
  if (!partes || centimos < 1n || centimos > 9007199254740991n) campos.precio = 'Ingresa un precio mayor que cero con hasta dos decimales';
  else salida.precioCentimos = Number(centimos);
  if (Object.keys(campos).length) throw new ErrorAPI(422, 'DATOS_INVALIDOS', 'Revisa los datos del producto', campos);
  return salida;
}
export async function normalizarImagen(buffer) {
  const error = () => new ErrorAPI(422, 'DATOS_INVALIDOS', 'Selecciona una imagen válida', { imagen: 'Selecciona una imagen JPEG, PNG o WebP estática, de máximo 10 MiB y 25 millones de píxeles' });
  if (!Buffer.isBuffer(buffer) || buffer.length === 0 || buffer.length > 10485760) throw error();
  try {
    const procesador = sharp(buffer, { failOn: 'warning', limitInputPixels: 25000000 });
    const meta = await procesador.metadata();
    if (!['jpeg', 'png', 'webp'].includes(meta.format) || (meta.pages || 1) !== 1) throw error();
    const copia = await procesador.rotate().webp().toBuffer();
    if (!copia.length || copia.length > 10485760) throw error();
    return copia;
  } catch { throw error(); }
}
