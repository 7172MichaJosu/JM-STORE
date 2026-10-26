import { Router } from 'express';
import multer from 'multer';
import { Transform } from 'node:stream';
import { ErrorAPI, invalida, validarId, noEncontrado } from '../errores.js';
import { validarProducto, normalizarImagen } from '../productos.js';

const maximoCuerpo = 11 * 1024 * 1024;
const excesivo = campos => new ErrorAPI(413, 'CUERPO_EXCESIVO', 'El contenido supera el límite permitido', campos);
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10485760, fieldSize: 32769, fieldNameSize: 100, files: 1, fields: 3, parts: 4, headerPairs: 50 } }).single('imagen');

function recibirImagen(req, res, next) {
  if (!req.is('multipart/form-data')) return next(invalida());
  if (Number(req.get('Content-Length')) > maximoCuerpo) return next(excesivo({ imagen: 'El archivo debe pesar como máximo 10 MiB' }));
  let bytes = 0; let terminado = false;
  const limitado = new Transform({ transform(chunk, encoding, callback) {
    bytes += chunk.length;
    callback(bytes > maximoCuerpo ? excesivo({ imagen: 'El archivo debe pesar como máximo 10 MiB' }) : null, chunk);
  } });
  limitado.headers = req.headers;
  function terminar(error) {
    if (terminado) return; terminado = true;
    req.unpipe(limitado); req.resume();
    if (error) {
      if (error instanceof ErrorAPI) return next(error);
      if (['LIMIT_FILE_SIZE', 'LIMIT_FIELD_VALUE'].includes(error.code)) {
        const campo = ['nombre', 'descripcion', 'precio', 'imagen'].includes(error.field) ? error.field : 'imagen';
        return next(excesivo({ [campo]: campo === 'imagen' ? 'El archivo debe pesar como máximo 10 MiB' : 'El campo supera el límite permitido' }));
      }
      return next(invalida());
    }
    req.body = limitado.body; req.file = limitado.file; next();
  }
  limitado.on('error', terminar);
  req.once('aborted', () => { limitado.destroy(); terminar(invalida()); });
  upload(limitado, res, terminar);
  req.pipe(limitado);
}
export function rutasProductos({ db, auth, procesarImagen = normalizarImagen }) {
  const router = Router();
  router.delete('/productos/:id', (req, res) => {
    auth.exigir(req); validarId(req.params.id);
    if (!db.eliminar(req.params.id)) throw noEncontrado();
    res.status(204).end();
  });
  router.post('/productos', (req, res, next) => { auth.exigir(req); next(); }, recibirImagen, async (req, res) => {
    const datos = req.body || {};
    if (Object.keys(datos).some(k => !['nombre', 'descripcion', 'precio'].includes(k)) || Object.values(datos).some(v => typeof v !== 'string')) throw invalida();
    if (typeof datos.nombre === 'string' && Buffer.byteLength(datos.nombre) > 4096) throw excesivo({ nombre: 'El nombre supera el límite de 4 KiB' });
    if (typeof datos.descripcion === 'string' && Buffer.byteLength(datos.descripcion) > 32768) throw excesivo({ descripcion: 'La descripción supera el límite de 32 KiB' });
    const producto = validarProducto(datos);
    if (!req.file) throw new ErrorAPI(422, 'DATOS_INVALIDOS', 'Selecciona una imagen válida', { imagen: 'Selecciona una imagen válida' });
    const imagen = await procesarImagen(req.file.buffer);
    auth.exigir(req);
    const creado = db.insertar({ ...producto, imagen });
    res.status(201).json(creado);
  });
  return router;
}
