import { Router } from 'express';
import { validarId } from '../errores.js';
import { renderizarProductoHtml, renderizarErrorHtml } from '../paginas-producto.js';
export function rutasPaginasProducto({ config, db, leerIndiceHtml }) {
  const router = Router();
  router.get('/productos/:id', (req, res) => {
    res.set('Cache-Control', 'no-store');
    const errorHtml = estado => {
      let plantilla = '';
      try { plantilla = leerIndiceHtml(); } catch { }
      return res.status(estado).type('html').send(renderizarErrorHtml(plantilla, estado));
    };
    try { validarId(req.params.id); } catch { return errorHtml(404); }
    try {
      const producto = db.obtener(req.params.id);
      if (!producto) return errorHtml(404);
      return res.type('html').send(renderizarProductoHtml(leerIndiceHtml(), producto, config.origin));
    } catch { return errorHtml(503); }
  });
  return router;
}
