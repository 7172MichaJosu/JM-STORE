import { leerConfig } from './config.js';
import { abrirDB } from './db.js';
import { crearApp } from './app.js';

try {
  const config = leerConfig();
  const db = abrirDB(config.sqlitePath);
  const servidor = crearApp({ config, db }).listen(config.port, config.modo === 'production' ? '0.0.0.0' : '127.0.0.1', () => {
    console.log(`JM-STORE disponible en el puerto ${config.port}`);
    if (!config.credenciales) console.log('Gestión cerrada: prepara el acceso del encargado con npm run configurar-acceso');
  });
  servidor.on('error', () => { console.error('No se pudo iniciar el servidor. Revisa el puerto y la configuración'); db.cerrar(); process.exitCode = 1; });
  const cerrar = () => servidor.close(() => { db.cerrar(); process.exit(); });
  process.on('SIGINT', cerrar);
  process.on('SIGTERM', cerrar);
} catch {
  console.error('No se pudo iniciar JM-STORE. Revisa la configuración y los permisos del directorio de datos');
  process.exitCode = 1;
}
