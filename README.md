# JM-STORE

Catálogo público con solicitudes individuales por WhatsApp. El encargado inicia sesión para agregar productos con una imagen de su dispositivo y eliminarlos con confirmación. React, Vite, Express y SQLite; sin pagos en línea.

## Ejecutar en Windows

Requiere Node.js **24 LTS** y npm. Desde `C:\JM-STORE`:

```powershell
npm ci
if (!(Test-Path -LiteralPath .env)) { Copy-Item -LiteralPath .env.example -Destination .env }
npm run configurar-acceso
```

La configuración del proyecto evita scripts de instalación implícitos y utiliza los binarios incluidos en las dependencias fijadas. La instalación limpia y los comandos explícitos se verificaron en Windows con Node 24.

El configurador solicita usuario y contraseña con entrada oculta y guarda solo usuario/hash en `.env`, ignorado por Git. Conserva las demás variables. No hay credenciales predeterminadas.

Revisa `.env`: `SQLITE_PATH` debe ser una ruta absoluta fuera del repositorio; el ejemplo usa `C:/JM-STORE-datos/catalogo.sqlite`. Completa `WHATSAPP_NUMBER` con el número comercial autorizado, con `+`, prefijo internacional y dígitos. Si falta o es inválido, los pedidos quedan deshabilitados y el catálogo sigue disponible.

Abre dos terminales:

```powershell
# Terminal 1
npm run dev:api
```

```powershell
# Terminal 2
npm run dev:web
```

Visita **http://localhost:5173**. Ingresa por «Acceso del encargado» para cargar tus productos. Una instalación nueva muestra el catálogo vacío; los datos ficticios pertenecen exclusivamente a las pruebas. Reinicia la API después de cambiar `.env`.

## Compilación y servidor único

```powershell
npm run build
npm start
```

Para probar esta modalidad local, configura antes `APP_ORIGIN=http://127.0.0.1:3001`, `PORT=3001` y `NODE_ENV=development` y abre ese origen. En internet, usa un origen HTTPS exacto, `NODE_ENV=production` y disco persistente; no se ha configurado alojamiento. El mismo servidor sirve `dist/` y `/api/`. SQLite y la configuración nunca se sirven como archivos web.

## Pruebas

```powershell
npm test
npx playwright install chromium firefox webkit
npm run test:e2e
```

Las pruebas utilizan bases e imágenes temporales. Chromium cubre la batería completa; Firefox y WebKit ejecutan el recorrido básico. `playwright-report/index.html` contiene los resultados y capturas después de ejecutar los recorridos. Los enlaces externos se interceptan: no se envían mensajes.

Consulta la [guía de arranque y evidencias](specs/001-catalogo-pedidos-whatsapp/quickstart.md) para las condiciones, resultados y aceptación pendiente. El [registro de tareas](specs/001-catalogo-pedidos-whatsapp/tasks.md) distingue el trabajo completado de los ensayos pendientes. Los ensayos presenciales se aplazaron por indicación del responsable. La feature permanece abierta; no hay publicación, push ni merge.
