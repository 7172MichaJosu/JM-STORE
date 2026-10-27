import { Router } from 'express';
import { validarId, noEncontrado } from '../errores.js';
import { crearImagenSocial } from '../imagen-social.js';

export function rutasCatalogo({ config, db }) {
  const router = Router();
  router.get('/catalogo', (req, res) => res.json({ productos: db.listar(), whatsapp: config.whatsapp }));
  router.get('/productos/:id', (req, res) => {
    validarId(req.params.id);
    const producto = db.obtener(req.params.id);
    if (!producto) throw noEncontrado();
    res.json({ producto, whatsapp: config.whatsapp });
  });
  router.get('/productos/:id/imagen-social', async (req, res) => {
    validarId(req.params.id);
    const copia = db.imagen(req.params.id);
    if (!copia) throw noEncontrado();
    res.type('image/jpeg').send(await crearImagenSocial(copia.imagen));
  });
  router.get('/productos/:id/imagen', (req, res) => {
    validarId(req.params.id);
    const copia = db.imagen(req.params.id);
    if (!copia) throw noEncontrado();
    res.type(copia.imagen_mime).send(copia.imagen);
  });
  return router;
}
