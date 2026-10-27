# JM-STORE

Catálogo público con pedidos individuales por WhatsApp. El encargado inicia sesión para agregar productos con una fotografía y eliminarlos con confirmación. React, Vite, Express y SQLite, con CSS propio.

La feature 002 incorpora portada, tarjetas y panel modernos, Manrope local, modo claro/oscuro, preferencia del dispositivo hasta elegir manualmente y movimiento reducido. Se conserva la base funcional 001 y el catálogo existente. El [registro de implementación](specs/002-rediseno-visual/evidencia/aceptacion.md) distingue lo verificado técnicamente de las aceptaciones externas pendientes.

## Ejecutar en Windows

Requiere Node.js **24 LTS** y npm. Desde `C:\JM-STORE`:

```powershell
npm ci
```

Para una tienda ya configurada, conserva **.env, la ruta SQLite y las credenciales actuales**; el rediseño no necesita ejecutar configurar-acceso ni recrear datos. La instalación usa dependencias fijadas y evita scripts de instalación implícitos.

Solo para una instalación nueva sin configuración:

```powershell
if (!(Test-Path -LiteralPath .env)) { Copy-Item -LiteralPath .env.example -Destination .env }
npm run configurar-acceso
```

El configurador pide usuario/contraseña con entrada oculta y guarda usuario/hash en .env, ignorado por Git. No hay credenciales predeterminadas. SQLITE_PATH debe apuntar a la base persistente absoluta fuera del repositorio; para una tienda existente usa su ruta actual. WHATSAPP_NUMBER requiere el destino comercial autorizado con prefijo internacional. Si falta o es inválido, el catálogo permanece disponible y los pedidos se deshabilitan con un motivo.

En dos terminales separadas:

```powershell
npm run dev:api
```

```powershell
npm run dev:web
```

Abre **http://localhost:5173**. El interruptor sol/luna está en la cabecera; el acceso del encargado conserva sus rutas. Una instalación nueva muestra catálogo vacío; las fotografías y productos de prueba nunca se incorporan al catálogo real. Reinicia la API si cambias su configuración externa.

## Compilación y servidor único

```powershell
npm run build
npm start
```

Para servir la compilación local utiliza APP_ORIGIN=http://127.0.0.1:3001, PORT=3001 y NODE_ENV=development en su configuración de ensayo. En internet se requieren origen HTTPS exacto, NODE_ENV=production y disco persistente. No se ha desplegado ni elegido alojamiento. El servidor existente sirve dist y API; SQLite y configuración no se sirven como archivos web.

## Pruebas y evidencia

```powershell
npm test
npx playwright install chromium firefox webkit
npm run test:e2e
```

Los datos son temporales y el lanzador verifica su ruta antes de limpiar. Chromium cubre la batería completa; Firefox y WebKit ejecutan tres recorridos básicos ampliados por motor. Los enlaces externos se interceptan sin enviar mensajes. El informe HTML se genera en playwright-report/index.html para la última ejecución.

Registro del 2026-10-26: 33/33 pruebas Node y 140/140 E2E; posteriormente 4/4 comparaciones de capturas revisadas. Las baselines de escritorio usan Chromium/Windows, fuente y datos fijados. No actualizar masivamente las capturas sin revisar sus diferencias.

Consulta [quickstart 002](specs/002-rediseno-visual/quickstart.md), [tasks](specs/002-rediseno-visual/tasks.md), [archivos modificados](specs/002-rediseno-visual/evidencia/archivos-modificados.md) y [evidencia final](specs/002-rediseno-visual/evidencia/regresion-final.md). La [guía 001](specs/001-catalogo-pedidos-whatsapp/quickstart.md) y sus [pendientes](specs/001-catalogo-pedidos-whatsapp/tasks.md) conservan el historial funcional.

La aceptación total sigue pendiente de WhatsApp real, comparación del catálogo previo, dispositivo/lectura asistida y cinco participantes. La feature permanece abierta; no se realizó commit, push, merge ni publicación.

Después de Implement, el usuario autorizó registrar y subir todos los cambios pendientes a la rama `002-rediseno-visual`. Esta entrega al repositorio conserva las aceptaciones pendientes y la feature abierta.
