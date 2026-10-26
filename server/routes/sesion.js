import { Router, json } from 'express';
import { ErrorAPI, invalida } from '../errores.js';

export function rutasSesion({ auth, config }) {
  const router = Router();
  router.get('/sesion', (req, res) => res.json({ autenticado: auth.vigente(auth.tokenDe(req)) }));
  router.post('/sesion', json({ limit: 4096 }), async (req, res) => {
    if (!req.is('application/json') || !req.body || Array.isArray(req.body) || Object.keys(req.body).some(k => !['usuario', 'contrasena'].includes(k))) throw invalida();
    const campos = {};
    if (typeof req.body.usuario !== 'string' || !req.body.usuario.trim()) campos.usuario = 'Ingresa tu usuario';
    if (typeof req.body.contrasena !== 'string' || !req.body.contrasena) campos.contrasena = 'Ingresa tu contraseña';
    if (Object.keys(campos).length) throw new ErrorAPI(422, 'DATOS_INVALIDOS', 'Revisa los datos de acceso', campos);
    if (!config.credenciales) throw new ErrorAPI(503, 'SERVICIO_NO_DISPONIBLE', 'No pudimos iniciar sesión. Inténtalo de nuevo');
    const terminar = auth.comenzarIntento(req.ip);
    let correcto = false;
    try { correcto = await auth.verificar(req.body.usuario.trim(), req.body.contrasena); } finally { terminar(correcto); }
    if (!correcto) throw new ErrorAPI(401, 'ACCESO_INCORRECTO', 'No pudimos iniciar sesión. Revisa tus datos e inténtalo de nuevo');
    auth.revocar(auth.tokenDe(req));
    res.set('Set-Cookie', auth.cookie(auth.emitir())).json({ autenticado: true });
  });
  router.delete('/sesion', (req, res) => {
    auth.revocar(auth.tokenDe(req));
    res.set('Set-Cookie', auth.cookie('', true)).status(204).end();
  });
  return router;
}
