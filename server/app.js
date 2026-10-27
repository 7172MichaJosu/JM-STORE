import express from 'express';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { ErrorAPI } from './errores.js';
import { rutasCatalogo } from './routes/catalogo.js';
import { crearAuth } from './auth.js';
import { rutasSesion } from './routes/sesion.js';
import { rutasProductos } from './routes/productos.js';
import { rutasPaginasProducto } from './routes/paginas-producto.js';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
export function crearApp({ config, db, reloj, procesarImagen, leerIndiceHtml = () => readFileSync(dist + '/index.html', 'utf8') }) {
  const app = express();
  const auth = crearAuth(config, { reloj });
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Referrer-Policy', 'no-referrer');
    res.set('Content-Security-Policy', "default-src 'self'; img-src 'self' blob:; style-src 'self'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
    if (config.modo === 'production') res.set('Strict-Transport-Security', 'max-age=31536000');
    next();
  });
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && (req.get('Origin') !== config.origin || req.get('X-JM-STORE-Request') !== '1')) {
      return next(new ErrorAPI(403, 'ORIGEN_RECHAZADO', 'No se pudo verificar el origen de la solicitud'));
    }
    next();
  });
  app.use('/api', rutasCatalogo({ config, db }));
  app.use('/api', rutasSesion({ config, auth }));
  app.use('/api', rutasProductos({ db, auth, procesarImagen }));
  app.use('/api', (req, res) => res.status(404).json({ codigo: 'NO_ENCONTRADO', mensaje: 'La página solicitada no está disponible' }));
  app.use('/assets', express.static(dist + '/assets', { immutable: true, maxAge: '1y', dotfiles: 'deny' }));
  app.use(rutasPaginasProducto({ config, db, leerIndiceHtml }));
  app.get(['/', '/encargado', '/encargado/ingresar'], (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.type('html').send(leerIndiceHtml());
  });
  app.use((req, res) => res.status(404).json({ codigo: 'NO_ENCONTRADO', mensaje: 'La página solicitada no está disponible' }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    let seguro = error;
    if (!(seguro instanceof ErrorAPI)) {
      seguro = error.type === 'entity.too.large'
        ? new ErrorAPI(413, 'CUERPO_EXCESIVO', 'El contenido supera el límite permitido')
        : error.type === 'entity.parse.failed'
          ? new ErrorAPI(400, 'SOLICITUD_INVALIDA', 'La solicitud no es válida')
          : new ErrorAPI(503, 'SERVICIO_NO_DISPONIBLE', 'No pudimos completar la operación. Inténtalo de nuevo');
    }
    if (seguro.espera) res.set('Retry-After', String(seguro.espera));
    res.status(seguro.status).json({ codigo: seguro.codigo, mensaje: seguro.message, ...(seguro.campos ? { campos: seguro.campos } : {}) });
  });
  return app;
}
