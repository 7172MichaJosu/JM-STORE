# JM-STORE — Memoria técnica

- **Producto:** tienda virtual tipo catálogo que permite agregar y quitar productos.
  Los pedidos se realizan por WhatsApp; no incluye pagos en línea.
- **Stack vigente del laboratorio:** React con Vite y base de datos SQLite.
  Aplicación inicializada con Node.js 24 LTS, React 19, Vite 8.3, Express 5 y SQLite
  mediante better-sqlite3; un paquete ES modules y CSS propio, según el plan aprobado.
- **Ejecución local:** `npm ci`; copiar `.env.example` a `.env` solo si no existe;
  completar la configuración externa y ejecutar `npm run configurar-acceso`.
  En dos terminales: `npm run dev:api` y `npm run dev:web`; abrir
  `http://localhost:5173`. `npm run build` compila; `npm start` sirve compilación/API.
  Para servir la compilación local, usar `APP_ORIGIN=http://127.0.0.1:3001` y
  `NODE_ENV=development`. Internet exige HTTPS y `NODE_ENV=production`.
- **Pruebas:** `npm test` ejecuta node:test (lógica, HTTP y SQLite temporal real).
  `npx playwright install chromium firefox webkit` prepara navegadores;
  `npm run test:e2e` compila y prueba Chromium completo, Firefox/WebKit básicos.
  Los datos de pruebas están aislados del catálogo real. La evidencia y las acciones
  reproducibles viven en `specs/001-catalogo-pedidos-whatsapp/quickstart.md`.
  Los ensayos presenciales aplazados y WhatsApp real no se dan por aprobados.
- **Convenciones:** todo el sistema en español de Perú; moneda en soles (`S/ 49.90`).
  Mantener código sencillo, legible y buenas prácticas de ingeniería de software.
- **Diseño:** moderno, interactivo y visualmente atractivo, con animaciones y transiciones suaves.
- **Alcance:** revisar la Constitution y la spec vigente antes de implementar; construir solo
  funcionalidades especificadas, sin dependencias ni complejidad para necesidades hipotéticas.
- **Datos y secretos:** solicitar solo datos imprescindibles; no exponer datos personales en
  registros ni errores. Nunca incluir claves o secretos en código ni archivos versionados;
  usar configuración externa cuando sean necesarios.

Las reglas de producto viven en .specify/memory/constitution.md y el estado del producto en specs/README.md.
